import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { StatsBar } from "@/components/stats-bar";
import { PlatformCarousel } from "@/components/platform-carousel";
import { FilterBar } from "@/components/filter-bar";
import { DealGrid, DealGridSkeleton } from "@/components/deal-grid";
import { getPromotions, getPlatforms, type SortOption } from "@/lib/actions";
import { DiscountType, TargetAudience } from "@prisma/client";

interface HomeProps {
  searchParams: Promise<{
    platforms?: string;
    type?: string;
    audience?: string;
    sort?: string;
    q?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const platformSlugs = params.platforms?.split(",").filter(Boolean);
  const discountType = params.type as DiscountType | undefined;
  const targetAudience = params.audience as TargetAudience | undefined;
  const sort = (params.sort as SortOption) || "best";
  const search = params.q;

  const [promotions, platforms] = await Promise.all([
    getPromotions({ platformSlugs, discountType, targetAudience, sort, search }),
    getPlatforms(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense>
        <Navbar />
      </Suspense>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-brand/5 to-transparent px-4 py-12 text-center">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Every food delivery deal. One place.
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Compare promo codes from DoorDash, Uber Eats, Grubhub, Postmates,
              Instacart and Caviar.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
          <Suspense>
            <StatsBar />
          </Suspense>

          <Suspense>
            <PlatformCarousel platforms={platforms} />
          </Suspense>

          <Suspense>
            <FilterBar />
          </Suspense>

          <Suspense fallback={<DealGridSkeleton />}>
            <DealGrid promotions={promotions} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
