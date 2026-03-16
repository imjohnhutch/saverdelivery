import * as cheerio from "cheerio";
import { getRandomUserAgent } from "../utils/user-agents";
import { delay } from "../utils/rate-limiter";
import { extractPromoCodes, extractDiscountInfo, extractExpirationDate } from "../utils/promo-extractor";
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
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
        redirect: "follow",
      });

      if (!res.ok) {
        console.warn(`RetailMeNot: ${res.status} for ${domain}`);
        await delay();
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      // Try multiple selector strategies
      const selectors = [
        '[data-testid="coupon-card"]',
        '[data-testid="offer-card"]',
        ".offer-card",
        ".coupon",
        '[class*="OfferCard"]',
        '[class*="CouponCard"]',
        '[class*="offer-item"]',
        '[class*="deal-card"]',
        "article",
      ];

      let matchedSelector = "";
      for (const sel of selectors) {
        if ($(sel).length > 0) {
          matchedSelector = sel;
          break;
        }
      }

      // Fallback: try to find any element with discount-like text
      if (!matchedSelector) {
        $("div, section, li").each((_, el) => {
          const text = $(el).text();
          if (/\d+%\s*off|\$\d+\s*off|free delivery/i.test(text) && text.length < 500) {
            try {
              const title = $(el).find("h2, h3, h4, strong, b, [class*='title']").first().text().trim()
                || text.trim().split("\n")[0]?.trim();
              if (!title || title.length < 5 || title.length > 200) return;

              const combinedText = text;
              const codes = extractPromoCodes(combinedText);
              const { discountType, discountValue, minimumOrder, maxDiscount } = extractDiscountInfo(combinedText);
              const expirationDate = extractExpirationDate(combinedText);
              const isNewUser = /new\s*user|first\s*order|new\s*customer/i.test(combinedText);

              deals.push({
                platformSlug: slug,
                title: title.slice(0, 200),
                description: null,
                promoCode: codes[0] || null,
                discountType,
                discountValue,
                minimumOrder,
                maxDiscount,
                expirationDate,
                sourceUrl: url,
                source: "retailmenot",
                isNewUser,
                targetAudience: isNewUser ? "NEW_USERS" : "ALL",
              });
            } catch {
              // skip
            }
          }
        });
      } else {
        $(matchedSelector).each((_, el) => {
          try {
            const title =
              $(el).find('[class*="title"], h3, h4, h2, [class*="heading"], strong').first().text().trim() ||
              $(el).find("a").first().text().trim();

            if (!title || title.length < 5) return;

            const description = $(el).find('[class*="description"], [class*="detail"], p').first().text().trim();
            const codeEl = $(el).find('[class*="code"], code, [class*="coupon-code"], [class*="Code"]').first().text().trim();

            const combinedText = `${title} ${description}`;
            const codes = codeEl
              ? [codeEl.replace(/\s/g, "").toUpperCase()]
              : extractPromoCodes(combinedText);
            const { discountType, discountValue, minimumOrder, maxDiscount } = extractDiscountInfo(combinedText);
            const expirationDate = extractExpirationDate(combinedText);
            const isNewUser = /new\s*user|first\s*order|new\s*customer|sign\s*up/i.test(combinedText);

            deals.push({
              platformSlug: slug,
              title: title.slice(0, 200),
              description: description || null,
              promoCode: codes[0] || null,
              discountType,
              discountValue,
              minimumOrder,
              maxDiscount,
              expirationDate,
              sourceUrl: url,
              source: "retailmenot",
              isNewUser,
              targetAudience: isNewUser ? "NEW_USERS" : "ALL",
            });
          } catch {
            // Skip individual deal parse errors
          }
        });
      }

      await delay();
    } catch (error) {
      console.error(`RetailMeNot scraper failed for ${slug}:`, error);
    }
  }

  return deals;
}
