import { scrapeRetailMeNot } from "./sources/retailmenot";
import { scrapeSlickdeals } from "./sources/slickdeals";
import { scrapeReddit } from "./sources/reddit";
import { scrapeSimplyCodes } from "./sources/simplycodes";
import { scrapeCouponSites } from "./sources/couponscom";

export interface ScrapedDeal {
  platformSlug: string;
  title: string;
  description: string | null;
  promoCode: string | null;
  discountType: string;
  discountValue: number | null;
  minimumOrder: number | null;
  maxDiscount?: number | null;
  expirationDate: Date | null;
  sourceUrl: string;
  source: string;
  isNewUser: boolean;
  targetAudience: string;
}

export interface ScraperResult {
  deals: ScrapedDeal[];
  summary: {
    total: number;
    deduplicated: number;
    sources: Record<string, { success: boolean; count: number; error?: string }>;
  };
}

function deduplicateDeals(deals: ScrapedDeal[]): ScrapedDeal[] {
  const seen = new Map<string, ScrapedDeal>();

  for (const deal of deals) {
    // Dedupe by platform + promo code + discount type + discount value
    const key = `${deal.platformSlug}|${deal.promoCode ?? ""}|${deal.discountType}|${deal.discountValue ?? ""}`;

    if (!seen.has(key)) {
      seen.set(key, deal);
    }
  }

  return Array.from(seen.values());
}

export async function runAllScrapers(): Promise<ScraperResult> {
  const sources: Record<string, { success: boolean; count: number; error?: string }> = {};

  // Focus on sources that actually return results via server-rendered HTML or JSON APIs
  const scrapers = [
    { name: "reddit", fn: scrapeReddit },
    { name: "retailmenot", fn: scrapeRetailMeNot },
    { name: "slickdeals", fn: scrapeSlickdeals },
    { name: "simplycodes", fn: scrapeSimplyCodes },
    { name: "coupon_sites", fn: scrapeCouponSites },
  ];

  const allDeals: ScrapedDeal[] = [];

  // Run all scrapers in parallel
  const results = await Promise.allSettled(scrapers.map((s) => s.fn()));

  for (let i = 0; i < scrapers.length; i++) {
    const result = results[i];
    const name = scrapers[i].name;

    if (result.status === "fulfilled") {
      allDeals.push(...result.value);
      sources[name] = { success: true, count: result.value.length };
      console.log(`[scraper] ${name}: ${result.value.length} deals`);
    } else {
      const errorMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);
      sources[name] = { success: false, count: 0, error: errorMsg };
      console.error(`[scraper] ${name} failed:`, errorMsg);
    }
  }

  const deduplicated = deduplicateDeals(allDeals);

  return {
    deals: deduplicated,
    summary: {
      total: allDeals.length,
      deduplicated: deduplicated.length,
      sources,
    },
  };
}
