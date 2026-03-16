import * as cheerio from "cheerio";
import { getRandomUserAgent } from "../utils/user-agents";
import { delay } from "../utils/rate-limiter";
import { extractPromoCodes, extractDiscountInfo } from "../utils/promo-extractor";
import type { ScrapedDeal } from "../index";

const PLATFORMS = [
  { slug: "doordash", path: "doordash" },
  { slug: "ubereats", path: "uber-eats" },
  { slug: "grubhub", path: "grubhub" },
  { slug: "postmates", path: "postmates" },
  { slug: "instacart", path: "instacart" },
  { slug: "caviar", path: "caviar" },
];

export async function scrapeSimplyCodes(): Promise<ScrapedDeal[]> {
  const deals: ScrapedDeal[] = [];

  for (const platform of PLATFORMS) {
    try {
      const url = `https://www.simplycodes.com/store/${platform.path}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": getRandomUserAgent(),
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (!res.ok) {
        console.warn(`SimplyCodes: ${res.status} for ${platform.slug}`);
        await delay();
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      $(
        '[class*="coupon"], [class*="offer"], [class*="deal"], [data-testid*="coupon"], [data-testid*="offer"]'
      ).each((_, el) => {
        try {
          const title = $(el)
            .find('[class*="title"], h3, h4, [class*="heading"]')
            .first()
            .text()
            .trim();

          if (!title) return;

          const description = $(el)
            .find('[class*="description"], [class*="detail"], p')
            .first()
            .text()
            .trim();

          const codeEl = $(el)
            .find('[class*="code"], code, [class*="coupon-code"]')
            .first()
            .text()
            .trim();

          const combinedText = `${title} ${description}`;
          const codes = codeEl
            ? [codeEl.toUpperCase()]
            : extractPromoCodes(combinedText);
          const { discountType, discountValue, minimumOrder } =
            extractDiscountInfo(combinedText);

          const isNewUser = /new\s*user|first\s*order|new\s*customer|sign\s*up/i.test(
            combinedText
          );

          deals.push({
            platformSlug: platform.slug,
            title,
            description: description || null,
            promoCode: codes[0] || null,
            discountType,
            discountValue,
            minimumOrder,
            expirationDate: null,
            sourceUrl: url,
            source: "simplycodes",
            isNewUser,
            targetAudience: isNewUser ? "NEW_USERS" : "ALL",
          });
        } catch {
          // Skip individual deal parse errors
        }
      });

      await delay();
    } catch (error) {
      console.error(`SimplyCodes scraper failed for ${platform.slug}:`, error);
    }
  }

  return deals;
}
