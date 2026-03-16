import { affiliateConfig } from "@/lib/config/affiliates";

export function buildReferralLink(
  platformSlug: string,
  destinationUrl?: string
): string {
  const config = affiliateConfig[platformSlug];
  const base = destinationUrl ?? config?.baseReferralUrl;

  if (!base) {
    return "#";
  }

  try {
    const url = new URL(base);

    if (config?.referralCode) {
      url.searchParams.set(config.queryParam, config.referralCode);
    }

    url.searchParams.set("utm_source", "saverdelivery");
    url.searchParams.set("utm_medium", "referral");
    url.searchParams.set("utm_campaign", "deal_aggregator");

    return url.toString();
  } catch {
    return base;
  }
}
