import * as cheerio from "cheerio";
import { getRandomUserAgent } from "../utils/user-agents";
import { delay } from "../utils/rate-limiter";
import { extractPromoCodes, extractDiscountInfo } from "../utils/promo-extractor";
import type { ScrapedDeal } from "../index";

const PLATFORM_DOMAINS: Record<string, string> = {
  doordash: "doordash.com",
  ubereats: "ubereats.com",
  grubhub: "grubhub.com",
  postmates: "postmates.com",
  instacart: "instacart.com",
  caviar: "trycaviar.com",
};

export async function scrapeRetailMeNot(): Promise<ScrapedDeal[]> {
  const deals: ScrapedDeal[] = [];

  for (const [slug, domain] of Object.entries(PLATFORM_DOMAINS)) {
    try {
      const url = `https://www.retailmenot.com/view/${domain}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": getRandomUserAgent(),
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (!res.ok) {
        console.warn(`RetailMeNot: ${res.status} for ${domain}`);
        await delay();
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      $('[data-testid="coupon-card"], .offer-card, .coupon, [class*="offer"]').each(
        (_, el) => {
          try {
            const title =
              $(el).find('[class*="title"], h3, h4, [class*="heading"]').first().text().trim() ||
              $(el).find("a").first().text().trim();

            if (!title) return;

            const description = $(el).find('[class*="description"], [class*="detail"], p').first().text().trim();
            const codeEl = $(el).find('[class*="code"], code, [class*="coupon-code"]').first().text().trim();

            const combinedText = `${title} ${description}`;
            const codes = codeEl
              ? [codeEl.toUpperCase()]
              : extractPromoCodes(combinedText);
            const { discountType, discountValue, minimumOrder } = extractDiscountInfo(combinedText);

            const isNewUser = /new\s*user|first\s*order|new\s*customer|sign\s*up/i.test(combinedText);

            deals.push({
              platformSlug: slug,
              title,
              description: description || null,
              promoCode: codes[0] || null,
              discountType,
              discountValue,
              minimumOrder,
              expirationDate: null,
              sourceUrl: url,
              source: "retailmenot",
              isNewUser,
              targetAudience: isNewUser ? "NEW_USERS" : "ALL",
            });
          } catch {
            // Skip individual deal parse errors
          }
        }
      );

      await delay();
    } catch (error) {
      console.error(`RetailMeNot scraper failed for ${slug}:`, error);
    }
  }

  return deals;
}
