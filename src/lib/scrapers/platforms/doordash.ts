import * as cheerio from "cheerio";
import { getRandomUserAgent } from "../utils/user-agents";
import { extractPromoCodes, extractDiscountInfo } from "../utils/promo-extractor";
import type { ScrapedDeal } from "../index";

const URL = "https://www.doordash.com/promos/";

export async function scrapeDoorDash(): Promise<ScrapedDeal[]> {
  const deals: ScrapedDeal[] = [];

  try {
    const res = await fetch(URL, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      console.warn(`doordash direct: ${res.status}`);
      return tryPlaywright(deals);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const hasContent = parseHtml($, deals);
    if (!hasContent) {
      return tryPlaywright(deals);
    }
  } catch (error) {
    console.error("doordash fetch scraper failed:", error);
    return tryPlaywright(deals);
  }

  return deals;
}

function parseHtml($: cheerio.CheerioAPI, deals: ScrapedDeal[]): boolean {
  let found = false;

  $('[class*="promo"], [class*="offer"], [class*="deal"], [class*="coupon"], [data-testid*="promo"]').each(
    (_, el) => {
      try {
        const title = $(el).find("h2, h3, h4, [class*='title']").first().text().trim();
        if (!title) return;

        found = true;
        const description = $(el).find("p, [class*='description']").first().text().trim();
        const combinedText = `${title} ${description}`;
        const codes = extractPromoCodes(combinedText);
        const { discountType, discountValue, minimumOrder } = extractDiscountInfo(combinedText);
        const isNewUser = /new\s*user|first\s*order|new\s*customer/i.test(combinedText);

        deals.push({
          platformSlug: "doordash",
          title,
          description: description || null,
          promoCode: codes[0] || null,
          discountType,
          discountValue,
          minimumOrder,
          expirationDate: null,
          sourceUrl: URL,
          source: "doordash_direct",
          isNewUser,
          targetAudience: isNewUser ? "NEW_USERS" : "ALL",
        });
      } catch {
        // Skip parse errors
      }
    }
  );

  return found;
}

async function tryPlaywright(deals: ScrapedDeal[]): Promise<ScrapedDeal[]> {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    parseHtml($, deals);
  } catch (error) {
    console.warn("doordash Playwright fallback unavailable:", error instanceof Error ? error.message : error);
  }

  return deals;
}
