import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { getRandomUserAgent } from "../utils/user-agents";
import { delay } from "../utils/rate-limiter";
import { extractPromoCodes, extractDiscountInfo, extractExpirationDate } from "../utils/promo-extractor";
import type { ScrapedDeal } from "../index";

// Coupon blog / aggregator sites that tend to have stable, server-rendered HTML
const SOURCES: { slug: string; urls: string[] }[] = [
  {
    slug: "doordash",
    urls: [
      "https://www.offers.com/doordash/",
      "https://couponfollow.com/site/doordash.com",
    ],
  },
  {
    slug: "ubereats",
    urls: [
      "https://www.offers.com/uber-eats/",
      "https://couponfollow.com/site/ubereats.com",
    ],
  },
  {
    slug: "grubhub",
    urls: [
      "https://www.offers.com/grubhub/",
      "https://couponfollow.com/site/grubhub.com",
    ],
  },
  {
    slug: "postmates",
    urls: [
      "https://www.offers.com/postmates/",
      "https://couponfollow.com/site/postmates.com",
    ],
  },
  {
    slug: "instacart",
    urls: [
      "https://www.offers.com/instacart/",
      "https://couponfollow.com/site/instacart.com",
    ],
  },
  {
    slug: "caviar",
    urls: [
      "https://www.offers.com/caviar/",
    ],
  },
];

export async function scrapeCouponSites(): Promise<ScrapedDeal[]> {
  const deals: ScrapedDeal[] = [];

  for (const platform of SOURCES) {
    for (const url of platform.urls) {
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": getRandomUserAgent(),
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
          redirect: "follow",
        });

        if (!res.ok) {
          console.warn(`CouponSites: ${res.status} for ${url}`);
          await delay();
          continue;
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        // Generic coupon element selectors covering many sites
        const couponSelectors = [
          '[class*="coupon"]',
          '[class*="offer"]',
          '[class*="deal"]',
          '[class*="Coupon"]',
          '[class*="Offer"]',
          '[class*="Deal"]',
          '[data-testid*="coupon"]',
          '[data-testid*="offer"]',
          "article",
          ".card",
        ];

        let matchedSelector = "";
        for (const sel of couponSelectors) {
          if ($(sel).length >= 2) {
            matchedSelector = sel;
            break;
          }
        }

        if (!matchedSelector) {
          // Broad fallback: find list items or divs with discount text
          $("li, div").each((_, el) => {
            const text = $(el).text().trim();
            if (
              text.length > 10 &&
              text.length < 300 &&
              /\d+%\s*off|\$\d+\s*off|free delivery|promo code/i.test(text)
            ) {
              parseElement($, el, platform.slug, url, deals);
            }
          });
        } else {
          $(matchedSelector).each((_, el) => {
            parseElement($, el, platform.slug, url, deals);
          });
        }

        await delay();
      } catch (error) {
        console.error(`CouponSites scraper failed for ${url}:`, error);
      }
    }
  }

  console.log(`[coupon-sites] Found ${deals.length} deals`);
  return deals;
}

function parseElement(
  $: cheerio.CheerioAPI,
  el: AnyNode,
  slug: string,
  sourceUrl: string,
  deals: ScrapedDeal[],
) {
  try {
    const title =
      $(el).find("h2, h3, h4, strong, b, [class*='title'], [class*='Title']").first().text().trim() ||
      $(el).find("a").first().text().trim();

    if (!title || title.length < 5 || title.length > 200) return;

    const description = $(el).find("p, [class*='description'], [class*='detail']").first().text().trim();
    const codeEl = $(el)
      .find('[class*="code"], code, [class*="Code"], [class*="coupon-code"], input[readonly]')
      .first();
    const codeText = codeEl.val()?.toString() || codeEl.text().trim();

    const combinedText = `${title} ${description}`;
    const codes = codeText && codeText.length >= 4 && codeText.length <= 20
      ? [codeText.replace(/\s/g, "").toUpperCase()]
      : extractPromoCodes(combinedText);
    const { discountType, discountValue, minimumOrder, maxDiscount } = extractDiscountInfo(combinedText);
    const expirationDate = extractExpirationDate(combinedText);

    // Only keep if we found something meaningful
    if (!codes.length && discountType === "OTHER") return;

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
      sourceUrl,
      source: "coupon_sites",
      isNewUser,
      targetAudience: isNewUser ? "NEW_USERS" : "ALL",
    });
  } catch {
    // Skip parse errors
  }
}
