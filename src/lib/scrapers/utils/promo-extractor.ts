const FALSE_POSITIVES = new Set([
  "EDIT", "UPDATE", "DELETED", "HTTPS", "HTML", "NULL", "TRUE", "FALSE",
  "POST", "COMMENT", "REPLY", "SHARE", "SAVE", "LINK", "HERE", "THIS",
  "THAT", "WITH", "FROM", "THEY", "HAVE", "BEEN", "WILL", "YOUR", "WHAT",
  "WHEN", "WHERE", "WHICH", "THEIR", "THERE", "ABOUT", "JUST", "LIKE",
  "SOME", "THAN", "THEM", "THEN", "THESE", "THOSE", "VERY", "ALSO",
  "INTO", "ONLY", "OTHER", "SUCH", "MORE", "MOST", "MUCH", "MANY",
  "EACH", "EVERY", "BOTH", "SAME", "DIFF", "NEXT", "LAST", "LONG",
  "GREAT", "LITTLE", "RIGHT", "STILL", "THINK", "AFTER", "BEFORE",
  "SHOULD", "COULD", "WOULD", "OVER", "UNDER", "AGAIN", "NEVER",
  "ALWAYS", "SOMETIMES", "OFTEN", "USUALLY", "REALLY", "ACTUALLY",
  "JSON", "HTTP", "YYYY", "NONE", "TODO", "NOTE", "INFO", "WARN",
  "ERROR", "DEBUG", "FEAT", "DOCS", "TEST", "PUSH", "PULL", "FORK",
  "CLONE", "MERGE", "HEAD", "BODY", "TITLE", "DESC", "TEXT", "DATA",
  "TYPE", "NAME", "CODE", "FREE", "DEAL", "SALE", "BEST", "GOOD",
  "WORKS", "WORKED", "WORKING", "MARCH", "APRIL", "TODAY",
  // Common words that get false-matched from Reddit posts
  "SUPPORT", "WONT", "DONT", "CANT", "ISNT", "DOESNT", "DIDNT",
  "CODES", "SHOW", "TION", "MENT", "DOES", "MAKE", "KNOW", "WANT",
  "NEED", "HELP", "SAID", "SCAM", "WEEK", "USED", "GETS", "GIVE",
  "GAVE", "WERE", "COME", "MADE", "TAKE", "TOOK", "KEEP", "KEPT",
  "SENT", "TOLD", "FIND", "BACK", "DOWN", "YEAH", "SURE", "OKAY",
  "WISH", "HOPE", "WAIT", "STOP", "CALL", "SAYS", "WENT", "SEEN",
  "LOOK", "SEEM", "OWED", "MINE", "PAID", "ABLE", "WASN", "DIDN",
  "AREN", "HAVEN", "HASN", "HADN", "BEING", "DOING", "GOING", "THING",
  "CAUSE", "SINCE", "UNTIL", "WHILE", "FIRST", "ORDER", "ORDERS",
  "PROMO", "PROMOS", "OFFER", "OFFERS", "USING", "TRIED", "ALLOW",
  "CHECK", "GETTING", "EXISTING", "ANYONE", "ACCOUNT", "SAVINGS",
  "DOORDASH", "UBEREATS", "GRUBHUB", "POSTMATES", "INSTACART",
  "USERS", "CUSTOMER", "APPLY", "APPLIED", "ENTERED", "SHOWING",
  "DELIVERY", "DASHER", "DRIVER", "DISCOUNT", "PERCENT", "DOLLAR",
  "DROPPED", "EARNED", "TIMES", "BONUS", "TECH", "STORE", "ITEMS",
  "ISSUE", "TOTAL", "NEVER", "ASKED", "TRIED", "PLACE", "POINT",
  "WORTH", "PRICE", "SPEND", "CHARGE", "AMOUNT", "REWARD", "OFFERS",
  "EXTRA", "ADDED", "BASED", "GIVEN", "LISTED", "REASON", "PEOPLE",
  "PICKED", "START", "STILL", "TRIED", "CHANGE", "PROBLEM",
  "TEXAS", "DALLAS", "CHICAGO", "MARKET", "TOWN", "AREA",
  "PLATINUM", "DASHER", "DRIVER", "WALMART", "TARGET",
  "ANYWHERE", "WORK", "WORKS", "WRONG", "STUFF", "WHOLE", "ABOVE",
  "CLOSE", "FRONT", "HOUSE", "LEVEL", "MONTH", "NIGHT", "SMALL",
  "THREE", "UNTIL", "WORLD", "YOUNG", "ALONG", "BELOW", "BRING",
  "CARRY", "CLEAN", "COVER", "EARLY", "LIGHT", "LEAVE", "HEARD",
  "LARGE", "LATER", "LUNCH", "MIGHT", "REFUND", "SHELF", "RANT",
]);

const CODE_PATTERNS = [
  /(?:code|promo|coupon|use|enter|apply|try)[:\s]+["']?([A-Z0-9]{4,20})["']?/gi,
  /(?:code|promo|coupon)[:\s]*["']([A-Za-z0-9]{4,20})["']/gi,
  /(?:code|promo)[:\s]*\**([A-Z0-9]{4,20})\**/gi,
];

export function extractPromoCodes(text: string): string[] {
  const codes = new Set<string>();

  for (const pattern of CODE_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const code = match[1].toUpperCase();
      if (!FALSE_POSITIVES.has(code) && code.length >= 4 && code.length <= 20) {
        codes.add(code);
      }
    }
  }

  // Standalone ALL_CAPS codes with mix of letters and numbers
  const standalonePattern = /\b([A-Z][A-Z0-9]{3,19})\b/g;
  let match;
  while ((match = standalonePattern.exec(text)) !== null) {
    const code = match[1];
    if (
      !FALSE_POSITIVES.has(code) &&
      (code.match(/\d/g) || []).length >= 2 &&
      /[A-Z]/.test(code) &&
      code.length >= 4 &&
      code.length <= 20
    ) {
      codes.add(code);
    }
  }

  return Array.from(codes);
}

export function extractDiscountInfo(text: string): {
  discountType: string;
  discountValue: number | null;
  minimumOrder: number | null;
  maxDiscount: number | null;
} {
  const lower = text.toLowerCase();

  let discountType = "OTHER";
  let discountValue: number | null = null;
  let minimumOrder: number | null = null;
  let maxDiscount: number | null = null;

  // $X off
  const flatMatch = lower.match(/\$(\d+(?:\.\d{1,2})?)\s*off/);
  if (flatMatch) {
    discountType = "FLAT_AMOUNT";
    discountValue = parseFloat(flatMatch[1]);
  }

  // X% off
  const pctMatch = lower.match(/(\d+)%\s*off/);
  if (pctMatch) {
    discountType = "PERCENTAGE";
    discountValue = parseFloat(pctMatch[1]);
  }

  // Free delivery
  if (/free\s*delivery|free\s*shipping|\$0\s*delivery\s*fee/i.test(lower)) {
    discountType = "FREE_DELIVERY";
  }

  // BOGO
  if (/buy\s*one\s*get\s*one|bogo|buy\s*1\s*get\s*1|b1g1/i.test(lower)) {
    discountType = "BOGO";
  }

  // Cashback
  if (/cash\s*back|cashback/i.test(lower)) {
    discountType = "CASHBACK";
  }

  // Free item
  if (/free\s+item|free\s+gift/i.test(lower)) {
    discountType = "FREE_ITEM";
  }

  // Minimum order - multiple patterns
  const minPatterns = [
    /(?:orders?\s*(?:over|of)\s*\$|minimum\s*\$|min\.?\s*\$)(\d+(?:\.\d{1,2})?)/,
    /on\s*\$(\d+(?:\.\d{1,2})?)\+/,              // "on $30+"
    /(?:spend|orders?)\s*\$(\d+(?:\.\d{1,2})?)\+/, // "spend $25+"
    /\$(\d+(?:\.\d{1,2})?)\s*(?:or\s*more|minimum)/, // "$25 or more"
    /(?:of|over)\s*\$(\d+)/,                        // "of $30"
  ];
  for (const pattern of minPatterns) {
    const minMatch = lower.match(pattern);
    if (minMatch) {
      minimumOrder = parseFloat(minMatch[1]);
      break;
    }
  }

  // Max discount - "up to $X"
  const maxMatch = lower.match(/up\s*to\s*\$(\d+(?:\.\d{1,2})?)/);
  if (maxMatch) {
    maxDiscount = parseFloat(maxMatch[1]);
  }

  return { discountType, discountValue, minimumOrder, maxDiscount };
}

export function extractExpirationDate(text: string): Date | null {
  const lower = text.toLowerCase();

  // "use by Mar 20" / "expires Mar 20" / "valid until Apr 30"
  const datePattern = /(?:use\s*by|expires?|valid\s*(?:until|through|thru)|ends?)\s*(\w+\s+\d{1,2}(?:[,\s]+\d{4})?)/i;
  const dateMatch = lower.match(datePattern);
  if (dateMatch) {
    const parsed = new Date(dateMatch[1]);
    if (!isNaN(parsed.getTime())) {
      // If no year specified and date is in the past, assume next year
      if (parsed < new Date() && !dateMatch[1].match(/\d{4}/)) {
        parsed.setFullYear(parsed.getFullYear() + 1);
      }
      return parsed;
    }
  }

  // "X days left" / "expires in X days"
  const daysMatch = lower.match(/(\d+)\s*days?\s*(?:left|remaining)/);
  if (daysMatch) {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(daysMatch[1]));
    return d;
  }

  // "MM/DD" or "MM/DD/YYYY"
  const slashDate = text.match(/(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/);
  if (slashDate) {
    const parsed = new Date(slashDate[1]);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
}
