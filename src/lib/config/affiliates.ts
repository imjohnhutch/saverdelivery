export interface AffiliateInfo {
  baseReferralUrl: string;
  referralCode: string;
  queryParam: string;
  affiliateNetwork: string;
}

export const affiliateConfig: Record<string, AffiliateInfo> = {
  doordash: {
    baseReferralUrl: "https://www.doordash.com",
    referralCode: process.env.DOORDASH_AFFILIATE_ID ?? "",
    queryParam: "affiliate_id",
    affiliateNetwork: "impact",
  },
  ubereats: {
    baseReferralUrl: "https://www.ubereats.com",
    referralCode: process.env.UBEREATS_AFFILIATE_ID ?? "",
    queryParam: "affiliate_id",
    affiliateNetwork: "cj",
  },
  grubhub: {
    baseReferralUrl: "https://www.grubhub.com",
    referralCode: process.env.GRUBHUB_AFFILIATE_ID ?? "",
    queryParam: "affiliate_id",
    affiliateNetwork: "cj",
  },
  postmates: {
    baseReferralUrl: "https://postmates.com",
    referralCode: process.env.POSTMATES_AFFILIATE_ID ?? "",
    queryParam: "affiliate_id",
    affiliateNetwork: "cj",
  },
  instacart: {
    baseReferralUrl: "https://www.instacart.com",
    referralCode: process.env.INSTACART_AFFILIATE_ID ?? "",
    queryParam: "ref",
    affiliateNetwork: "impact",
  },
  caviar: {
    baseReferralUrl: "https://www.trycaviar.com",
    referralCode: process.env.CAVIAR_AFFILIATE_ID ?? "",
    queryParam: "affiliate_id",
    affiliateNetwork: "impact",
  },
};
