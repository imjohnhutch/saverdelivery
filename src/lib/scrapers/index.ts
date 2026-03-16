import { scrapeRetailMeNot } from "./sources/retailmenot";
import { scrapeSlickdeals } from "./sources/slickdeals";
import { scrapeReddit } from "./sources/reddit";
import { scrapeSimplyCodes } from "./sources/simplycodes";
import { scrapeDoorDash } from "./platforms/doordash";
import { scrapeUberEats } from "./platforms/ubereats";
import { scrapeGrubhub } from "./platforms/grubhub";
import { scrapePostmates } from "./platforms/postmates";
import { scrapeInstacart } from "./platforms/instacart";
import { scrapeCaviar } from "./platforms/caviar";

export interface ScrapedDeal {
  platformSlug: string;
  title: string;
  description: string | null;
  promoCode: string | null;
  discountType: string;
  discountValue: number | null;
  minimumOrder: number | null;
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
    const key = `${deal.platformSlug}|${deal.promoCode ?? ""}|${deal.discountType}`;

    if (!seen.has(key)) {
      seen.set(key, deal);
    }
  }

  return Array.from(seen.values());
}

export async function runAllScrapers(): Promise<ScraperResult> {
  const sources: Record<string, { success: boolean; count: number; error?: string }> = {};

  const sourceScrapers = [
    { name: "retailmenot", fn: scrapeRetailMeNot },
    { name: "slickdeals", fn: scrapeSlickdeals },
    { name: "reddit", fn: scrapeReddit },
    { name: "simplycodes", fn: scrapeSimplyCodes },
  ];

  const platformScrapers = [
    { name: "doordash_direct", fn: scrapeDoorDash },
    { name: "ubereats_direct", fn: scrapeUberEats },
    { name: "grubhub_direct", fn: scrapeGrubhub },
    { name: "postmates_direct", fn: scrapePostmates },
    { name: "instacart_direct", fn: scrapeInstacart },
    { name: "caviar_direct", fn: scrapeCaviar },
  ];

  const allDeals: ScrapedDeal[] = [];

  const sourceResults = await Promise.allSettled(
    sourceScrapers.map((s) => s.fn())
  );

  for (let i = 0; i < sourceScrapers.length; i++) {
    const result = sourceResults[i];
    const name = sourceScrapers[i].name;

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

  const platformResults = await Promise.allSettled(
    platformScrapers.map((s) => s.fn())
  );

  for (let i = 0; i < platformScrapers.length; i++) {
    const result = platformResults[i];
    const name = platformScrapers[i].name;

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
