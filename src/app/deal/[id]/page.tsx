import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DealGrid } from "@/components/deal-grid";
import { CountdownTimer } from "@/components/countdown-timer";
import { DealActions } from "./deal-actions";
import { getPromotion, getPromotions } from "@/lib/actions";
import { Suspense } from "react";

interface DealPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DealPageProps): Promise<Metadata> {
  const { id } = await params;
  const deal = await getPromotion(id);
  if (!deal) return {};

  return {
    title: `${deal.title} | saver.delivery`,
    description: deal.description ?? `${deal.title} - Get this deal on ${deal.platform.name} with saver.delivery.`,
  };
}

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;
  const deal = await getPromotion(id);

  if (!deal) notFound();

  const similarDeals = await getPromotions({
    discountType: deal.discountType,
  });

  const filteredSimilar = similarDeals
    .filter((d) => d.id !== deal.id)
    .slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense>
        <Navbar />
      </Suspense>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-10">
          {/* Back link */}
          <Link
            href={`/platform/${deal.platform.slug}`}
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <div className="relative size-5 overflow-hidden rounded-md bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
              <Image
                src={deal.platform.logoUrl}
                alt={deal.platform.name}
                fill
                className="object-contain p-0.5"
                unoptimized
              />
            </div>
            {deal.platform.name}
          </Link>

          {/* Deal card */}
          <div className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_28px_rgba(0,0,0,0.06)]">
            <div className="space-y-6 p-7">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {deal.title}
                </h1>
                {deal.description && (
                  <p className="mt-2 text-muted-foreground">{deal.description}</p>
                )}
              </div>

              {/* Promo code area */}
              {deal.promoCode && (
                <div className="rounded-xl bg-secondary/80 p-6 text-center">
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Promo Code
                  </p>
                  <code className="text-2xl font-bold tracking-wider text-foreground">
                    {deal.promoCode}
                  </code>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {deal.discountValue && (
                  <div className="rounded-xl bg-secondary/50 px-4 py-3">
                    <span className="text-xs text-muted-foreground">Discount</span>
                    <p className="mt-0.5 font-semibold text-foreground">
                      {deal.discountType === "PERCENTAGE"
                        ? `${deal.discountValue}% off`
                        : deal.discountType === "FLAT_AMOUNT"
                          ? `$${deal.discountValue} off`
                          : `${deal.discountValue}`}
                    </p>
                  </div>
                )}
                {deal.minimumOrder && (
                  <div className="rounded-xl bg-secondary/50 px-4 py-3">
                    <span className="text-xs text-muted-foreground">Minimum Order</span>
                    <p className="mt-0.5 font-semibold text-foreground">${deal.minimumOrder}</p>
                  </div>
                )}
                {deal.maxDiscount && (
                  <div className="rounded-xl bg-secondary/50 px-4 py-3">
                    <span className="text-xs text-muted-foreground">Max Discount</span>
                    <p className="mt-0.5 font-semibold text-foreground">${deal.maxDiscount}</p>
                  </div>
                )}
                {deal.expirationDate && (
                  <div className="rounded-xl bg-secondary/50 px-4 py-3">
                    <span className="text-xs text-muted-foreground">Expires</span>
                    <div className="mt-0.5">
                      <CountdownTimer expirationDate={deal.expirationDate} />
                    </div>
                  </div>
                )}
              </div>

              <DealActions
                promotionId={deal.id}
                platformSlug={deal.platform.slug}
                platformName={deal.platform.name}
                promoCode={deal.promoCode}
              />
            </div>
          </div>

          {/* Similar deals */}
          {filteredSimilar.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 text-xl font-semibold tracking-tight text-foreground">
                Similar Deals
              </h2>
              <DealGrid promotions={filteredSimilar} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
