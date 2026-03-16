import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://saver.delivery";

  const platforms = await prisma.platform.findMany({
    select: { slug: true, updatedAt: true },
  });

  const deals = await prisma.promotion.findMany({
    where: { isExpired: false },
    select: { id: true, updatedAt: true },
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...platforms.map((p) => ({
      url: `${baseUrl}/platform/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...deals.map((d) => ({
      url: `${baseUrl}/deal/${d.id}`,
      lastModified: d.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
