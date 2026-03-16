import { getRandomUserAgent } from "../utils/user-agents";
import { delay } from "../utils/rate-limiter";
import { extractPromoCodes, extractDiscountInfo, extractExpirationDate } from "../utils/promo-extractor";
import type { ScrapedDeal } from "../index";

// Platform-specific + general deal subreddits
const SUBREDDITS = [
  "doordash",
  "doordash_drivers",
  "UberEATS",
  "ubereats",
  "grubhub",
  "grubhubdrivers",
  "postmates",
  "instacart",
  "deals",
  "frugal",
  "coupons",
  "FoodDelivery",
  "fooddeliverypromos",
];

// Multiple search queries for broader coverage
const SEARCH_QUERIES = [
  "promo code OR coupon OR discount",
  "promo OR deal OR offer OR % off",
  "free delivery OR $0 delivery fee",
];

const PLATFORM_KEYWORDS: Record<string, string[]> = {
  doordash: ["doordash", "door dash", "dashpass"],
  ubereats: ["uber eats", "ubereats", "uber eat", "uber one"],
  grubhub: ["grubhub", "grub hub", "grubhub+"],
  postmates: ["postmates", "post mates"],
  instacart: ["instacart", "insta cart"],
  caviar: ["caviar", "trycaviar"],
};

// Some subreddits are platform-specific, so default the platform
const SUBREDDIT_PLATFORM: Record<string, string> = {
  doordash: "doordash",
  doordash_drivers: "doordash",
  UberEATS: "ubereats",
  ubereats: "ubereats",
  grubhub: "grubhub",
  grubhubdrivers: "grubhub",
  postmates: "postmates",
  instacart: "instacart",
};

function detectPlatform(text: string, subreddit: string): string | null {
  const lower = text.toLowerCase();
  for (const [slug, keywords] of Object.entries(PLATFORM_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return slug;
    }
  }
  // Fall back to subreddit default if text doesn't mention a specific platform
  return SUBREDDIT_PLATFORM[subreddit] ?? null;
}

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    permalink: string;
    url: string;
    created_utc: number;
    num_comments: number;
    score: number;
  };
}

async function fetchRedditPosts(
  subreddit: string,
  query: string,
  sort: string,
  timeRange: string,
): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=${sort}&t=${timeRange}&restrict_sr=1&limit=50`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": `saverdelivery-bot/2.0 (deal aggregator; +https://saver.delivery)`,
      Accept: "application/json",
    },
  });

  if (!res.ok) return [];
  const json = await res.json();
  return json?.data?.children ?? [];
}

// Also fetch hot/new posts from platform subreddits (not just search)
async function fetchSubredditFeed(
  subreddit: string,
  listing: "hot" | "new",
): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/${listing}.json?limit=50`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": `saverdelivery-bot/2.0 (deal aggregator; +https://saver.delivery)`,
      Accept: "application/json",
    },
  });

  if (!res.ok) return [];
  const json = await res.json();
  return json?.data?.children ?? [];
}

function isPromoRelated(text: string): boolean {
  return /promo|coupon|discount|code|deal|offer|\boff\b|free delivery|\$\d+|%\s*off/i.test(text);
}

export async function scrapeReddit(): Promise<ScrapedDeal[]> {
  const deals: ScrapedDeal[] = [];
  const seen = new Set<string>();

  // 1. Search each subreddit with multiple queries and time ranges
  for (const subreddit of SUBREDDITS) {
    for (const query of SEARCH_QUERIES) {
      try {
        // Search last month with relevance sorting
        const posts = await fetchRedditPosts(subreddit, query, "relevance", "month");

        for (const post of posts) {
          processPost(post, subreddit, deals, seen);
        }

        await delay();
      } catch {
        // Continue on individual fetch failures
      }
    }
  }

  // 2. Also grab hot/new posts from platform-specific subs (catches promos in titles)
  const platformSubs = ["doordash", "UberEATS", "grubhub", "postmates", "instacart", "FoodDelivery"];
  for (const subreddit of platformSubs) {
    try {
      const hotPosts = await fetchSubredditFeed(subreddit, "hot");
      for (const post of hotPosts) {
        processPost(post, subreddit, deals, seen);
      }
      await delay();
    } catch {
      // Continue
    }
    try {
      const newPosts = await fetchSubredditFeed(subreddit, "new");
      for (const post of newPosts) {
        processPost(post, subreddit, deals, seen);
      }
      await delay();
    } catch {
      // Continue
    }
  }

  console.log(`[reddit] Processed posts, found ${deals.length} deals`);
  return deals;
}

function processPost(
  post: RedditPost,
  subreddit: string,
  deals: ScrapedDeal[],
  seen: Set<string>,
) {
  try {
    const { title, selftext, permalink } = post.data;
    const combinedText = `${title} ${selftext}`;

    // Skip if we've already seen this post
    if (seen.has(permalink)) return;
    seen.add(permalink);

    // Must be promo-related
    if (!isPromoRelated(combinedText)) return;

    const platform = detectPlatform(combinedText, subreddit);
    if (!platform) return;

    const codes = extractPromoCodes(combinedText);
    const { discountType, discountValue, minimumOrder, maxDiscount } =
      extractDiscountInfo(combinedText);
    const expirationDate = extractExpirationDate(combinedText);

    // Accept deals with codes, or deals with a specific discount type (not just OTHER)
    if (!codes.length && discountType === "OTHER") return;

    const isNewUser = /new\s*user|first\s*order|new\s*customer|sign\s*up|new\s*account/i.test(
      combinedText,
    );

    // Build a clean title from the Reddit post title
    let dealTitle = title.slice(0, 200);
    // If title is too Reddit-y, build a description from extracted info
    if (dealTitle.length > 100 && discountValue) {
      if (discountType === "PERCENTAGE") {
        dealTitle = `${discountValue}% off ${platform} order`;
      } else if (discountType === "FLAT_AMOUNT") {
        dealTitle = `$${discountValue} off ${platform} order`;
      }
      if (minimumOrder) dealTitle += ` on $${minimumOrder}+`;
    }

    deals.push({
      platformSlug: platform,
      title: dealTitle,
      description: selftext ? selftext.slice(0, 500) : null,
      promoCode: codes[0] || null,
      discountType,
      discountValue,
      minimumOrder,
      maxDiscount,
      expirationDate,
      sourceUrl: `https://www.reddit.com${permalink}`,
      source: "reddit",
      isNewUser,
      targetAudience: isNewUser ? "NEW_USERS" : "ALL",
    });
  } catch {
    // Skip individual post parse errors
  }
}
