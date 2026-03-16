"use server";

import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { DiscountType, TargetAudience } from "@prisma/client";

const VALID_DISCOUNT_TYPES = Object.values(DiscountType);
const VALID_SORT_OPTIONS = ["best", "newest", "expiring", "upvoted"];

export type SortOption = "best" | "newest" | "expiring" | "upvoted";

interface GetPromotionsFilters {
  platformSlugs?: string[];
  discountType?: DiscountType;
  targetAudience?: TargetAudience;
  search?: string;
  sort?: SortOption;
}

export async function getPromotions(filters: GetPromotionsFilters = {}) {
  const where: Record<string, unknown> = {
    isExpired: false,
  };

  if (filters.platformSlugs && filters.platformSlugs.length > 0) {
    where.platform = { slug: { in: filters.platformSlugs } };
  }

  if (filters.discountType) {
    where.discountType = filters.discountType;
  }

  if (filters.targetAudience && filters.targetAudience !== TargetAudience.ALL) {
    where.targetAudience = filters.targetAudience;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { promoCode: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };

  switch (filters.sort) {
    case "best":
      orderBy = { upvotes: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "expiring":
      orderBy = { expirationDate: "asc" };
      break;
    case "upvoted":
      orderBy = { upvotes: "desc" };
      break;
  }

  return prisma.promotion.findMany({
    where,
    orderBy,
    include: { platform: true },
  });
}

export async function getPromotion(id: string) {
  return prisma.promotion.findUnique({
    where: { id },
    include: { platform: true },
  });
}

export async function getPlatforms() {
  return prisma.platform.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getPlatform(slug: string) {
  return prisma.platform.findUnique({
    where: { slug },
  });
}

export async function vote(promotionId: string, direction: "up" | "down") {
  if (!promotionId || typeof promotionId !== "string") {
    throw new Error("Invalid promotion ID");
  }
  if (direction !== "up" && direction !== "down") {
    throw new Error("Invalid vote direction");
  }

  const hdrs = await headers();
  const forwarded = hdrs.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? "unknown";
  const { ok } = rateLimit(`vote:${ip}:${promotionId}`, { max: 1, windowMs: 3600_000 });
  if (!ok) {
    throw new Error("Already voted on this deal");
  }

  return prisma.promotion.update({
    where: { id: promotionId },
    data: direction === "up" ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
  });
}

export async function getActiveDealsCount() {
  return prisma.promotion.count({
    where: { isExpired: false },
  });
}

export async function getActivePlatformCount() {
  const platforms = await prisma.platform.findMany({
    where: {
      promotions: {
        some: { isExpired: false },
      },
    },
  });
  return platforms.length;
}
