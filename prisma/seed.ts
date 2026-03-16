import { PrismaClient } from "../src/generated/prisma/client";
import { DiscountType, TargetAudience } from "../src/generated/prisma/enums";

const prisma = new PrismaClient();

const platforms = [
  { name: "DoorDash", slug: "doordash", color: "#FF3008", websiteUrl: "https://www.doordash.com", logoUrl: "https://logo.clearbit.com/doordash.com" },
  { name: "Uber Eats", slug: "ubereats", color: "#06C167", websiteUrl: "https://www.ubereats.com", logoUrl: "https://logo.clearbit.com/ubereats.com" },
  { name: "Grubhub", slug: "grubhub", color: "#F63440", websiteUrl: "https://www.grubhub.com", logoUrl: "https://logo.clearbit.com/grubhub.com" },
  { name: "Postmates", slug: "postmates", color: "#000000", websiteUrl: "https://postmates.com", logoUrl: "https://logo.clearbit.com/postmates.com" },
  { name: "Instacart", slug: "instacart", color: "#43B02A", websiteUrl: "https://www.instacart.com", logoUrl: "https://logo.clearbit.com/instacart.com" },
  { name: "Seamless", slug: "seamless", color: "#F63440", websiteUrl: "https://www.seamless.com", logoUrl: "https://logo.clearbit.com/seamless.com" },
  { name: "Caviar", slug: "caviar", color: "#FF5A00", websiteUrl: "https://www.trycaviar.com", logoUrl: "https://logo.clearbit.com/trycaviar.com" },
  { name: "Gopuff", slug: "gopuff", color: "#0000FF", websiteUrl: "https://www.gopuff.com", logoUrl: "https://logo.clearbit.com/gopuff.com" },
  { name: "Deliveroo", slug: "deliveroo", color: "#00CCBC", websiteUrl: "https://deliveroo.com", logoUrl: "https://logo.clearbit.com/deliveroo.com" },
  { name: "SkipTheDishes", slug: "skipthedishes", color: "#FF8000", websiteUrl: "https://www.skipthedishes.com", logoUrl: "https://logo.clearbit.com/skipthedishes.com" },
  { name: "Menulog", slug: "menulog", color: "#FF8000", websiteUrl: "https://www.menulog.com.au", logoUrl: "https://logo.clearbit.com/menulog.com.au" },
  { name: "Hungryroot", slug: "hungryroot", color: "#2D6A4F", websiteUrl: "https://www.hungryroot.com", logoUrl: "https://logo.clearbit.com/hungryroot.com" },
  { name: "Chowbus", slug: "chowbus", color: "#D62828", websiteUrl: "https://www.chowbus.com", logoUrl: "https://logo.clearbit.com/chowbus.com" },
  { name: "Slice", slug: "slice", color: "#E07A5F", websiteUrl: "https://slicelife.com", logoUrl: "https://logo.clearbit.com/slicelife.com" },
  { name: "EatStreet", slug: "eatstreet", color: "#27AE60", websiteUrl: "https://www.eatstreet.com", logoUrl: "https://logo.clearbit.com/eatstreet.com" },
];

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("Seeding platforms...");

  const createdPlatforms: Record<string, string> = {};

  for (const p of platforms) {
    const platform = await prisma.platform.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
    createdPlatforms[p.slug] = platform.id;
  }

  console.log(`Seeded ${platforms.length} platforms.`);

  const promotions = [
    // DoorDash (5)
    { platformSlug: "doordash", title: "$15 off your first order", promoCode: "NEWDASH15", discountType: DiscountType.FLAT_AMOUNT, discountValue: 15, minimumOrder: 25, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(14) },
    { platformSlug: "doordash", title: "40% off next 2 orders", promoCode: "DASH40OFF", discountType: DiscountType.PERCENTAGE, discountValue: 40, maxDiscount: 20, expirationDate: daysFromNow(7) },
    { platformSlug: "doordash", title: "Free delivery on orders $20+", promoCode: "FREEDELIVERY", discountType: DiscountType.FREE_DELIVERY, minimumOrder: 20, expirationDate: daysFromNow(21) },
    { platformSlug: "doordash", title: "$5 off convenience store orders", promoCode: "CONV5", discountType: DiscountType.FLAT_AMOUNT, discountValue: 5, minimumOrder: 15, expirationDate: daysFromNow(10) },
    { platformSlug: "doordash", title: "DashPass free trial - 30 days", promoCode: "DASHPASS30", discountType: DiscountType.FREE_DELIVERY, targetAudience: TargetAudience.NEW_USERS, isNewUser: true, expirationDate: daysFromNow(30) },

    // Uber Eats (5)
    { platformSlug: "ubereats", title: "$25 off first Uber Eats order", promoCode: "NEWUSER25", discountType: DiscountType.FLAT_AMOUNT, discountValue: 25, minimumOrder: 30, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(21) },
    { platformSlug: "ubereats", title: "Buy 1 Get 1 Free on select restaurants", promoCode: "UBERBOGO", discountType: DiscountType.BOGO, expirationDate: daysFromNow(5) },
    { platformSlug: "ubereats", title: "30% off your next 3 orders", promoCode: "SAVE30X3", discountType: DiscountType.PERCENTAGE, discountValue: 30, maxDiscount: 15, expirationDate: daysFromNow(14) },
    { platformSlug: "ubereats", title: "$10 off orders over $35", promoCode: "UBER10OFF", discountType: DiscountType.FLAT_AMOUNT, discountValue: 10, minimumOrder: 35, expirationDate: daysFromNow(9) },
    { platformSlug: "ubereats", title: "Free delivery for Uber One members", discountType: DiscountType.FREE_DELIVERY, targetAudience: TargetAudience.SUBSCRIPTION_MEMBERS, expirationDate: daysFromNow(30) },

    // Grubhub (4)
    { platformSlug: "grubhub", title: "$12 off first order", promoCode: "GRUB12NEW", discountType: DiscountType.FLAT_AMOUNT, discountValue: 12, minimumOrder: 20, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(14) },
    { platformSlug: "grubhub", title: "20% off pickup orders", promoCode: "PICKUP20", discountType: DiscountType.PERCENTAGE, discountValue: 20, maxDiscount: 10, expirationDate: daysFromNow(7) },
    { platformSlug: "grubhub", title: "Free delivery on $15+ orders", promoCode: "GRUBFREE", discountType: DiscountType.FREE_DELIVERY, minimumOrder: 15, expirationDate: daysFromNow(18) },
    { platformSlug: "grubhub", title: "$5 cashback on weekend orders", promoCode: "WEEKEND5", discountType: DiscountType.CASHBACK, discountValue: 5, minimumOrder: 25, expirationDate: daysFromNow(3) },

    // Postmates (3)
    { platformSlug: "postmates", title: "$20 off first 2 orders", promoCode: "POST20NEW", discountType: DiscountType.FLAT_AMOUNT, discountValue: 20, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(21) },
    { platformSlug: "postmates", title: "Free delivery all week", promoCode: "POSTFREE", discountType: DiscountType.FREE_DELIVERY, expirationDate: daysFromNow(7) },
    { platformSlug: "postmates", title: "15% off late night orders", promoCode: "LATENIGHT15", discountType: DiscountType.PERCENTAGE, discountValue: 15, maxDiscount: 8, expirationDate: daysFromNow(12) },

    // Instacart (3)
    { platformSlug: "instacart", title: "$30 off first grocery order", promoCode: "INSTA30", discountType: DiscountType.FLAT_AMOUNT, discountValue: 30, minimumOrder: 50, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(30) },
    { platformSlug: "instacart", title: "Free delivery on orders $35+", promoCode: "FREEINSTACART", discountType: DiscountType.FREE_DELIVERY, minimumOrder: 35, expirationDate: daysFromNow(14) },
    { platformSlug: "instacart", title: "20% off fresh produce", promoCode: "FRESH20", discountType: DiscountType.PERCENTAGE, discountValue: 20, maxDiscount: 12, expirationDate: daysFromNow(10) },

    // Seamless (2)
    { platformSlug: "seamless", title: "$10 off your next order", promoCode: "SEAMLESS10", discountType: DiscountType.FLAT_AMOUNT, discountValue: 10, minimumOrder: 20, expirationDate: daysFromNow(8) },
    { platformSlug: "seamless", title: "Free delivery all month", promoCode: "FREESML", discountType: DiscountType.FREE_DELIVERY, expirationDate: daysFromNow(25) },

    // Caviar (2)
    { platformSlug: "caviar", title: "$15 off first fine dining order", promoCode: "CAVIAR15", discountType: DiscountType.FLAT_AMOUNT, discountValue: 15, minimumOrder: 40, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(21) },
    { platformSlug: "caviar", title: "25% off weekend brunch", promoCode: "BRUNCH25", discountType: DiscountType.PERCENTAGE, discountValue: 25, maxDiscount: 15, expirationDate: daysFromNow(4) },

    // Gopuff (3)
    { platformSlug: "gopuff", title: "Free item on first order", promoCode: "GOPUFFREE", discountType: DiscountType.FREE_ITEM, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(14) },
    { platformSlug: "gopuff", title: "$7 off snack packs", promoCode: "SNACK7", discountType: DiscountType.FLAT_AMOUNT, discountValue: 7, minimumOrder: 15, expirationDate: daysFromNow(10) },
    { platformSlug: "gopuff", title: "BOGO energy drinks", promoCode: "BOGOENERGY", discountType: DiscountType.BOGO, expirationDate: daysFromNow(6) },

    // Deliveroo (3)
    { platformSlug: "deliveroo", title: "£10 off first order", promoCode: "ROONEW10", discountType: DiscountType.FLAT_AMOUNT, discountValue: 10, minimumOrder: 20, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, region: "UK", expirationDate: daysFromNow(14) },
    { platformSlug: "deliveroo", title: "Free delivery for Plus members", discountType: DiscountType.FREE_DELIVERY, targetAudience: TargetAudience.SUBSCRIPTION_MEMBERS, region: "UK", expirationDate: daysFromNow(30) },
    { platformSlug: "deliveroo", title: "20% off Asian cuisine", promoCode: "ASIAN20", discountType: DiscountType.PERCENTAGE, discountValue: 20, maxDiscount: 8, region: "UK", expirationDate: daysFromNow(11) },

    // SkipTheDishes (2)
    { platformSlug: "skipthedishes", title: "$10 off first Skip order", promoCode: "SKIPNEW10", discountType: DiscountType.FLAT_AMOUNT, discountValue: 10, minimumOrder: 20, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, region: "CA", expirationDate: daysFromNow(21) },
    { platformSlug: "skipthedishes", title: "Free delivery weekdays", promoCode: "SKIPFREE", discountType: DiscountType.FREE_DELIVERY, region: "CA", expirationDate: daysFromNow(14) },

    // Menulog (2)
    { platformSlug: "menulog", title: "$15 off for new customers", promoCode: "MENU15", discountType: DiscountType.FLAT_AMOUNT, discountValue: 15, minimumOrder: 30, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, region: "AU", expirationDate: daysFromNow(14) },
    { platformSlug: "menulog", title: "25% off pizza orders", promoCode: "PIZZA25", discountType: DiscountType.PERCENTAGE, discountValue: 25, maxDiscount: 10, region: "AU", expirationDate: daysFromNow(7) },

    // Hungryroot (2)
    { platformSlug: "hungryroot", title: "40% off first box + free gift", promoCode: "HUNGRY40", discountType: DiscountType.PERCENTAGE, discountValue: 40, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(30) },
    { platformSlug: "hungryroot", title: "$10 off next grocery box", promoCode: "ROOT10", discountType: DiscountType.FLAT_AMOUNT, discountValue: 10, minimumOrder: 50, targetAudience: TargetAudience.EXISTING_USERS, expirationDate: daysFromNow(14) },

    // Chowbus (1)
    { platformSlug: "chowbus", title: "$8 off authentic Asian food", promoCode: "CHOW8", discountType: DiscountType.FLAT_AMOUNT, discountValue: 8, minimumOrder: 20, expirationDate: daysFromNow(10) },

    // Slice (2)
    { platformSlug: "slice", title: "Free delivery on your first pizza", promoCode: "SLICEFREE", discountType: DiscountType.FREE_DELIVERY, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(21) },
    { platformSlug: "slice", title: "BOGO deal on select pizzerias", promoCode: "SLICEBOGO", discountType: DiscountType.BOGO, expirationDate: daysFromNow(5) },

    // EatStreet (1)
    { platformSlug: "eatstreet", title: "SAVE15 - 15% off any order", promoCode: "SAVE15", discountType: DiscountType.PERCENTAGE, discountValue: 15, maxDiscount: 10, expirationDate: daysFromNow(14) },
  ];

  console.log("Seeding promotions...");

  for (const promo of promotions) {
    const platformId = createdPlatforms[promo.platformSlug];
    await prisma.promotion.upsert({
      where: {
        platformId_promoCode_discountValue_discountType: {
          platformId,
          promoCode: promo.promoCode ?? "",
          discountValue: promo.discountValue ?? 0,
          discountType: promo.discountType,
        },
      },
      update: {},
      create: {
        platformId,
        title: promo.title,
        description: promo.description ?? null,
        promoCode: promo.promoCode ?? null,
        discountType: promo.discountType,
        discountValue: promo.discountValue ?? null,
        minimumOrder: promo.minimumOrder ?? null,
        maxDiscount: promo.maxDiscount ?? null,
        expirationDate: promo.expirationDate ?? null,
        isNewUser: promo.isNewUser ?? false,
        targetAudience: promo.targetAudience ?? TargetAudience.ALL,
        source: "seed_data",
        region: promo.region ?? null,
      },
    });
  }

  console.log(`Seeded ${promotions.length} promotions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
