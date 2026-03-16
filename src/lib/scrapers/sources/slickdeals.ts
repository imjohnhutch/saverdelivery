import * as cheerio from "cheerio";
import { getRandomUserAgent } from "../utils/user-agents";
import { delay } from "../utils/rate-limiter";
import { extractPromoCodes, extractDiscountInfo } from "../utils/promo-extractor";
import type { ScrapedDeal } from "../index";

const PLATFORMS = [
  { slug: "doordash", query: "doordash promo code" },
  { slug: "ubereats", query: "uber eats promo code" },
  { slug: "grubhub", query: "grubhub promo code" },
  { slug: "postmates", query: "postmates promo code" },
  { slug: "instacart", query: "instacart promo code" },
  { slug: "caviar", query: "caviar promo code" },
];

export async function scrapeSlickdeals(): Promise<ScrapedDeal[]> {
  const deals: ScrapedDeal[] = [];

  for (const platform of PLATFORMS) {
    try {
      const searchUrl = `https://slickdeals.net/newsearch.php?q=${encodeURIComponent(platform.query)}&searcharea=deals`;
      const res = await fetch(searchUrl, {
        headers: {
          "User-Agent": getRandomUserAgent(),
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (!res.ok) {
        console.warn(`Slickdeals: ${res.status} for ${platform.slug}`);
        await delay();
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      $(
        '.resultRow, .dealCard, [class*="search-result"], [class*="dealRow"], .bp-p-dealCard'
      ).each((_, el) => {
        try {
          const title =
            $(el).find('[class*="title"] a, .dealTitle a, h2 a, h3 a').first().text().trim() ||
            $(el).find("a").first().text().trim();

          if (!title) return;

          const href = $(el).find("a").first().attr("href") || "";
          const sourceUrl = href.startsWith("http")
            ? href
            : `https://slickdeals.net${href}`;

          const description = $(el)
            .find('[class*="description"], [class*="detail"], .bp-c-card_content')
            .first()
            .text()
            .trim();

          const combinedText = `${title} ${description}`;
          const codes = extractPromoCodes(combinedText);
          const { discountType, discountValue, minimumOrder } =
            extractDiscountInfo(combinedText);

          const isNewUser = /new\s*user|first\s*order|new\s*customer/i.test(
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
            sourceUrl,
            source: "slickdeals",
            isNewUser,
            targetAudience: isNewUser ? "NEW_USERS" : "ALL",
          });
        } catch {
          // Skip individual parse errors
        }
      });

      await delay();
    } catch (error) {
      console.error(`Slickdeals scraper failed for ${platform.slug}:`, error);
    }
  }

  return deals;
}
