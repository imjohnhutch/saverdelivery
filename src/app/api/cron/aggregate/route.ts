import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runAllScrapers } from "@/lib/scrapers";
import type { DiscountType, TargetAudience } from "@prisma/client";
import crypto from "crypto";

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || !authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expected = `Bearer ${secret}`;
  const a = Buffer.from(authHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const errors: string[] = [];
  let newCount = 0;
  let updatedCount = 0;
  let expiredCount = 0;

  try {
    const { deals, summary } = await runAllScrapers();

    const sourceTracker = new Map<string, Set<string>>();

    for (const deal of deals) {
      try {
        const platform = await prisma.platform.findUnique({
          where: { slug: deal.platformSlug },
        });

        if (!platform) {
          errors.push(`Platform not found: ${deal.platformSlug}`);
          continue;
        }

        const dedupeKey = `${platform.id}|${deal.promoCode ?? ""}|${deal.discountValue ?? 0}|${deal.discountType}`;

        if (!sourceTracker.has(dedupeKey)) {
          sourceTracker.set(dedupeKey, new Set());
        }
        sourceTracker.get(dedupeKey)!.add(deal.source);

        const existing = await prisma.promotion.findFirst({
          where: {
            platformId: platform.id,
            promoCode: deal.promoCode ?? null,
            discountValue: deal.discountValue ?? null,
            discountType: deal.discountType as DiscountType,
          },
        });

        if (existing) {
          await prisma.promotion.update({
            where: { id: existing.id },
            data: { updatedAt: new Date() },
          });
          updatedCount++;
        } else {
          await prisma.promotion.create({
            data: {
              platformId: platform.id,
              title: deal.title,
              description: deal.description,
              promoCode: deal.promoCode,
              discountType: deal.discountType as DiscountType,
              discountValue: deal.discountValue,
              minimumOrder: deal.minimumOrder,
              maxDiscount: deal.maxDiscount ?? null,
              expirationDate: deal.expirationDate,
              isVerified: false,
              isExpired: false,
              isNewUser: deal.isNewUser,
              targetAudience: (deal.targetAudience || "ALL") as TargetAudience,
              source: deal.source,
              sourceUrl: deal.sourceUrl,
            },
          });
          newCount++;
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to process deal "${deal.title}": ${msg}`);
      }
    }

    const expiredResult = await prisma.promotion.updateMany({
      where: {
        isExpired: false,
        expirationDate: { lt: new Date() },
      },
      data: { isExpired: true },
    });
    expiredCount = expiredResult.count;

    for (const [dedupeKey, sources] of sourceTracker) {
      if (sources.size >= 2) {
        const [platformId, promoCode, discountValueStr, discountType] = dedupeKey.split("|");
        const discountValue = discountValueStr ? parseFloat(discountValueStr) : null;

        try {
          await prisma.promotion.updateMany({
            where: {
              platformId,
              promoCode: promoCode || null,
              discountValue: discountValue ?? undefined,
              discountType: discountType as DiscountType,
              isVerified: false,
            },
            data: { isVerified: true },
          });
        } catch {
          // Non-critical
        }
      }
    }

    return NextResponse.json({
      new: newCount,
      updated: updatedCount,
      expired: expiredCount,
      errors,
      scraperSummary: summary,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Cron aggregate failed:", msg);
    return NextResponse.json(
      { error: "Aggregation failed" },
      { status: 500 }
    );
  }
}
