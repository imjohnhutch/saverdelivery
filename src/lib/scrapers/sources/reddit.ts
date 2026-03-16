import { getRandomUserAgent } from "../utils/user-agents";
import { delay } from "../utils/rate-limiter";
import { extractPromoCodes, extractDiscountInfo } from "../utils/promo-extractor";
import type { ScrapedDeal } from "../index";

const SUBREDDITS = [
  "doordash",
  "UberEATS",
  "grubhub",
  "postmates",
  "deals",
  "frugal",
  "coupons",
];

const PLATFORM_KEYWORDS: Record<string, string[]> = {
  doordash: ["doordash", "door dash"],
  ubereats: ["uber eats", "ubereats", "uber eat"],
  grubhub: ["grubhub", "grub hub"],
  postmates: ["postmates", "post mates"],
  instacart: ["instacart", "insta cart"],
  caviar: ["caviar", "trycaviar"],
};

function detectPlatform(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [slug, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return slug;
    }
  }
  return null;
}

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    permalink: string;
    url: string;
    created_utc: number;
  };
}

export async function scrapeReddit(): Promise<ScrapedDeal[]> {
  const deals: ScrapedDeal[] = [];

  for (const subreddit of SUBREDDITS) {
    try {
      const url = `https://www.reddit.com/r/${subreddit}/search.json?q=promo+code+OR+coupon+OR+discount&sort=new&t=week&restrict_sr=1&limit=25`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": `saverdelivery-scraper/1.0 (${getRandomUserAgent()})`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        console.warn(`Reddit: ${res.status} for r/${subreddit}`);
        await delay();
        continue;
      }

      const json = await res.json();
      const posts: RedditPost[] = json?.data?.children ?? [];

      for (const post of posts) {
        try {
          const { title, selftext, permalink } = post.data;
          const combinedText = `${title} ${selftext}`;

          const platform = detectPlatform(combinedText);
          if (!platform) continue;

          const codes = extractPromoCodes(combinedText);
          const { discountType, discountValue, minimumOrder } =
            extractDiscountInfo(combinedText);

          if (!codes.length && discountType === "OTHER") continue;

          const isNewUser = /new\s*user|first\s*order|new\s*customer|sign\s*up/i.test(
            combinedText
          );

          deals.push({
            platformSlug: platform,
            title: title.slice(0, 200),
            description: selftext ? selftext.slice(0, 500) : null,
            promoCode: codes[0] || null,
            discountType,
            discountValue,
            minimumOrder,
            expirationDate: null,
            sourceUrl: `https://www.reddit.com${permalink}`,
            source: "reddit",
            isNewUser,
            targetAudience: isNewUser ? "NEW_USERS" : "ALL",
          });
        } catch {
          // Skip individual post parse errors
        }
      }

      await delay();
    } catch (error) {
      console.error(`Reddit scraper failed for r/${subreddit}:`, error);
    }
  }

  return deals;
}
