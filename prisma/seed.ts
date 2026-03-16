import { PrismaClient, DiscountType, TargetAudience } from "@prisma/client";

const prisma = new PrismaClient();

const platforms = [
  { name: "DoorDash", slug: "doordash", color: "#FF3008", websiteUrl: "https://www.doordash.com", logoUrl: "https://www.google.com/s2/favicons?domain=doordash.com&sz=128" },
  { name: "Uber Eats", slug: "ubereats", color: "#06C167", websiteUrl: "https://www.ubereats.com", logoUrl: "https://www.google.com/s2/favicons?domain=ubereats.com&sz=128" },
  { name: "Grubhub", slug: "grubhub", color: "#F63440", websiteUrl: "https://www.grubhub.com", logoUrl: "https://www.google.com/s2/favicons?domain=grubhub.com&sz=128" },
  { name: "Postmates", slug: "postmates", color: "#000000", websiteUrl: "https://postmates.com", logoUrl: "https://www.google.com/s2/favicons?domain=postmates.com&sz=128" },
  { name: "Instacart", slug: "instacart", color: "#43B02A", websiteUrl: "https://www.instacart.com", logoUrl: "https://www.google.com/s2/favicons?domain=instacart.com&sz=128" },
  { name: "Caviar", slug: "caviar", color: "#FF5A00", websiteUrl: "https://www.trycaviar.com", logoUrl: "https://www.google.com/s2/favicons?domain=trycaviar.com&sz=128" },
];

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  // Clean up non-core platforms from previous seeds
  const coreSlugs = platforms.map(p => p.slug);
  const nonCorePlatforms = await prisma.platform.findMany({
    where: { slug: { notIn: coreSlugs } },
    select: { id: true },
  });
  if (nonCorePlatforms.length > 0) {
    const ids = nonCorePlatforms.map(p => p.id);
    await prisma.promotion.deleteMany({ where: { platformId: { in: ids } } });
    await prisma.platform.deleteMany({ where: { id: { in: ids } } });
    console.log(`Removed ${nonCorePlatforms.length} non-core platforms.`);
  }

  console.log("Seeding platforms...");

  const createdPlatforms: Record<string, string> = {};

  for (const p of platforms) {
    const platform = await prisma.platform.upsert({
      where: { slug: p.slug },
      update: { logoUrl: p.logoUrl },
      create: p,
    });
    createdPlatforms[p.slug] = platform.id;
  }

  console.log(`Seeded ${platforms.length} platforms.`);

  const promotions = [
    // DoorDash - existing user deals
    { platformSlug: "doordash", title: "40% off next 2 orders", promoCode: "DASH40OFF", discountType: DiscountType.PERCENTAGE, discountValue: 40, maxDiscount: 20, expirationDate: daysFromNow(7) },
    { platformSlug: "doordash", title: "Free delivery on orders $20+", promoCode: "FREEDELIVERY", discountType: DiscountType.FREE_DELIVERY, minimumOrder: 20, expirationDate: daysFromNow(21) },
    { platformSlug: "doordash", title: "$5 off convenience store orders", promoCode: "CONV5", discountType: DiscountType.FLAT_AMOUNT, discountValue: 5, minimumOrder: 15, expirationDate: daysFromNow(10) },
    // DoorDash - new user deals
    { platformSlug: "doordash", title: "$15 off your first order", promoCode: "NEWDASH15", discountType: DiscountType.FLAT_AMOUNT, discountValue: 15, minimumOrder: 25, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(14) },
    { platformSlug: "doordash", title: "DashPass free trial - 30 days", promoCode: "DASHPASS30", discountType: DiscountType.FREE_DELIVERY, targetAudience: TargetAudience.NEW_USERS, isNewUser: true, expirationDate: daysFromNow(30) },

    // Uber Eats - existing user deals
    { platformSlug: "ubereats", title: "Buy 1 Get 1 Free on select restaurants", promoCode: "UBERBOGO", discountType: DiscountType.BOGO, expirationDate: daysFromNow(5) },
    { platformSlug: "ubereats", title: "30% off your next 3 orders", promoCode: "SAVE30X3", discountType: DiscountType.PERCENTAGE, discountValue: 30, maxDiscount: 15, expirationDate: daysFromNow(14) },
    { platformSlug: "ubereats", title: "$10 off orders over $35", promoCode: "UBER10OFF", discountType: DiscountType.FLAT_AMOUNT, discountValue: 10, minimumOrder: 35, expirationDate: daysFromNow(9) },
    { platformSlug: "ubereats", title: "Free delivery for Uber One members", discountType: DiscountType.FREE_DELIVERY, targetAudience: TargetAudience.SUBSCRIPTION_MEMBERS, expirationDate: daysFromNow(30) },
    // Uber Eats - new user deals
    { platformSlug: "ubereats", title: "$25 off first Uber Eats order", promoCode: "NEWUSER25", discountType: DiscountType.FLAT_AMOUNT, discountValue: 25, minimumOrder: 30, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(21) },

    // Grubhub - existing user deals
    { platformSlug: "grubhub", title: "20% off pickup orders", promoCode: "PICKUP20", discountType: DiscountType.PERCENTAGE, discountValue: 20, maxDiscount: 10, expirationDate: daysFromNow(7) },
    { platformSlug: "grubhub", title: "Free delivery on $15+ orders", promoCode: "GRUBFREE", discountType: DiscountType.FREE_DELIVERY, minimumOrder: 15, expirationDate: daysFromNow(18) },
    { platformSlug: "grubhub", title: "$5 cashback on weekend orders", promoCode: "WEEKEND5", discountType: DiscountType.CASHBACK, discountValue: 5, minimumOrder: 25, expirationDate: daysFromNow(3) },
    // Grubhub - new user deals
    { platformSlug: "grubhub", title: "$12 off first order", promoCode: "GRUB12NEW", discountType: DiscountType.FLAT_AMOUNT, discountValue: 12, minimumOrder: 20, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(14) },

    // Postmates - existing user deals
    { platformSlug: "postmates", title: "Free delivery all week", promoCode: "POSTFREE", discountType: DiscountType.FREE_DELIVERY, expirationDate: daysFromNow(7) },
    { platformSlug: "postmates", title: "15% off late night orders", promoCode: "LATENIGHT15", discountType: DiscountType.PERCENTAGE, discountValue: 15, maxDiscount: 8, expirationDate: daysFromNow(12) },
    // Postmates - new user deals
    { platformSlug: "postmates", title: "$20 off first 2 orders", promoCode: "POST20NEW", discountType: DiscountType.FLAT_AMOUNT, discountValue: 20, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(21) },

    // Instacart - existing user deals
    { platformSlug: "instacart", title: "Free delivery on orders $35+", promoCode: "FREEINSTACART", discountType: DiscountType.FREE_DELIVERY, minimumOrder: 35, expirationDate: daysFromNow(14) },
    { platformSlug: "instacart", title: "20% off fresh produce", promoCode: "FRESH20", discountType: DiscountType.PERCENTAGE, discountValue: 20, maxDiscount: 12, expirationDate: daysFromNow(10) },
    // Instacart - new user deals
    { platformSlug: "instacart", title: "$30 off first grocery order", promoCode: "INSTA30", discountType: DiscountType.FLAT_AMOUNT, discountValue: 30, minimumOrder: 50, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(30) },

    // Caviar - existing user deals
    { platformSlug: "caviar", title: "25% off weekend brunch", promoCode: "BRUNCH25", discountType: DiscountType.PERCENTAGE, discountValue: 25, maxDiscount: 15, expirationDate: daysFromNow(4) },
    // Caviar - new user deals
    { platformSlug: "caviar", title: "$15 off first fine dining order", promoCode: "CAVIAR15", discountType: DiscountType.FLAT_AMOUNT, discountValue: 15, minimumOrder: 40, isNewUser: true, targetAudience: TargetAudience.NEW_USERS, expirationDate: daysFromNow(21) },
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
        promoCode: promo.promoCode ?? null,
        discountType: promo.discountType,
        discountValue: promo.discountValue ?? null,
        minimumOrder: promo.minimumOrder ?? null,
        maxDiscount: promo.maxDiscount ?? null,
        expirationDate: promo.expirationDate ?? null,
        isNewUser: promo.isNewUser ?? false,
        targetAudience: promo.targetAudience ?? TargetAudience.ALL,
        source: "seed_data",
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
