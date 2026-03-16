import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildReferralLink } from "@/lib/utils/build-referral-link";
import crypto from "crypto";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const { promotionId, platformSlug } = await request.json();

    if (!platformSlug) {
      return NextResponse.json(
        { error: "platformSlug is required" },
        { status: 400 }
      );
    }

    const referralUrl = buildReferralLink(platformSlug);

    const userAgent = request.headers.get("user-agent") ?? undefined;
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
    const ipHash = hashIp(ip);

    await prisma.clickLog.create({
      data: {
        promotionId: promotionId ?? null,
        platformSlug,
        referralUrl,
        userAgent,
        ipHash,
      },
    });

    return NextResponse.json({ url: referralUrl });
  } catch (error) {
    console.error("Track click error:", error);
    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 }
    );
  }
}
