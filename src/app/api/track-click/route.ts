import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildReferralLink } from "@/lib/utils/build-referral-link";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

const VALID_SLUGS = ["doordash", "ubereats", "grubhub", "postmates", "instacart", "caviar"];

function hashIp(ip: string): string {
  const salt = process.env.CRON_SECRET ?? "saverdelivery";
  return crypto.createHash("sha256").update(ip + salt).digest("hex").slice(0, 16);
}

function getIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const ip = getIp(request);
    const { ok } = rateLimit(`click:${ip}`, { max: 30, windowMs: 60_000 });
    if (!ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { promotionId, platformSlug } = await request.json();

    if (!platformSlug || typeof platformSlug !== "string") {
      return NextResponse.json({ error: "platformSlug is required" }, { status: 400 });
    }

    if (!VALID_SLUGS.includes(platformSlug)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    const referralUrl = buildReferralLink(platformSlug);
    const ipHash = hashIp(ip);

    await prisma.clickLog.create({
      data: {
        promotionId: promotionId ?? null,
        platformSlug,
        referralUrl,
        userAgent: request.headers.get("user-agent") ?? undefined,
        ipHash,
      },
    });

    return NextResponse.json({ url: referralUrl });
  } catch {
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
  }
}
