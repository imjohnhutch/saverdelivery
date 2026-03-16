-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FLAT_AMOUNT', 'FREE_DELIVERY', 'BOGO', 'CASHBACK', 'FREE_ITEM', 'OTHER');

-- CreateEnum
CREATE TYPE "TargetAudience" AS ENUM ('ALL', 'NEW_USERS', 'EXISTING_USERS', 'SUBSCRIPTION_MEMBERS');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('WORKING', 'NOT_WORKING', 'EXPIRED');

-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "promoCode" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DOUBLE PRECISION,
    "minimumOrder" DOUBLE PRECISION,
    "maxDiscount" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "expirationDate" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "isNewUser" BOOLEAN NOT NULL DEFAULT false,
    "targetAudience" "TargetAudience" NOT NULL DEFAULT 'ALL',
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickLog" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT,
    "platformSlug" TEXT NOT NULL,
    "referralUrl" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Platform_slug_key" ON "Platform"("slug");

-- CreateIndex
CREATE INDEX "Promotion_isExpired_expirationDate_idx" ON "Promotion"("isExpired", "expirationDate");

-- CreateIndex
CREATE INDEX "Promotion_platformId_idx" ON "Promotion"("platformId");

-- CreateIndex
CREATE INDEX "Promotion_discountType_idx" ON "Promotion"("discountType");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_platformId_promoCode_discountValue_discountType_key" ON "Promotion"("platformId", "promoCode", "discountValue", "discountType");

-- CreateIndex
CREATE INDEX "ClickLog_platformSlug_idx" ON "ClickLog"("platformSlug");

-- CreateIndex
CREATE INDEX "ClickLog_createdAt_idx" ON "ClickLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClickLog" ADD CONSTRAINT "ClickLog_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
