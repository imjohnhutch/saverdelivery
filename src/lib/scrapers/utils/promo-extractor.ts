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
]);

const CODE_PATTERNS = [
  /(?:code|promo|coupon|use|enter|apply|try)[:\s]+["']?([A-Z0-9]{4,20})["']?/gi,
  /(?:code|promo|coupon)[:\s]*["']([A-Za-z0-9]{4,20})["']/gi,
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

  const standalonePattern = /\b([A-Z][A-Z0-9]{3,19})\b/g;
  let match;
  while ((match = standalonePattern.exec(text)) !== null) {
    const code = match[1];
    if (
      !FALSE_POSITIVES.has(code) &&
      /\d/.test(code) &&
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
} {
  const lower = text.toLowerCase();

  let discountType = "OTHER";
  let discountValue: number | null = null;
  let minimumOrder: number | null = null;

  const flatMatch = lower.match(/\$(\d+(?:\.\d{1,2})?)\s*off/);
  if (flatMatch) {
    discountType = "FLAT_AMOUNT";
    discountValue = parseFloat(flatMatch[1]);
  }

  const pctMatch = lower.match(/(\d+)%\s*off/);
  if (pctMatch) {
    discountType = "PERCENTAGE";
    discountValue = parseFloat(pctMatch[1]);
  }

  if (/free\s*delivery|free\s*shipping|\$0\s*delivery/i.test(lower)) {
    discountType = "FREE_DELIVERY";
  }

  if (/buy\s*one\s*get\s*one|bogo|buy\s*1\s*get\s*1|b1g1/i.test(lower)) {
    discountType = "BOGO";
  }

  if (/cash\s*back|cashback/i.test(lower)) {
    discountType = "CASHBACK";
  }

  if (/free\s+item|free\s+gift/i.test(lower)) {
    discountType = "FREE_ITEM";
  }

  const minMatch = lower.match(/(?:orders?\s*(?:over|of)\s*\$|minimum\s*\$|min\.?\s*\$)(\d+(?:\.\d{1,2})?)/);
  if (minMatch) {
    minimumOrder = parseFloat(minMatch[1]);
  }

  return { discountType, discountValue, minimumOrder };
}
