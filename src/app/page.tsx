import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { StatsBar } from "@/components/stats-bar";
import { PlatformCarousel } from "@/components/platform-carousel";
import { FilterBar } from "@/components/filter-bar";
import { DealGrid, DealGridSkeleton } from "@/components/deal-grid";
import { getPromotions, getPlatforms, type SortOption } from "@/lib/actions";
import { DiscountType } from "@prisma/client";

interface HomeProps {
  searchParams: Promise<{
    platforms?: string;
    type?: string;
    sort?: string;
    audience?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const platformSlugs = params.platforms?.split(",").filter(Boolean);
  const discountType = params.type as DiscountType | undefined;
  const sort = (params.sort as SortOption) || "best";
  const audience = params.audience ?? "existing";

  const [promotions, platforms] = await Promise.all([
    getPromotions({ platformSlugs, discountType, sort }),
    getPlatforms(),
  ]);

  const filtered = audience === "new"
    ? promotions.filter((p) => p.targetAudience === "NEW_USERS" || p.isNewUser)
    : promotions.filter((p) => p.targetAudience !== "NEW_USERS" && !p.isNewUser);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense>
        <Navbar />
      </Suspense>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 pb-8 pt-16 text-center sm:pt-20 sm:pb-12">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Every delivery deal.
              <br />
              <span className="text-primary">One place.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
              Compare promo codes from DoorDash, Uber Eats, Grubhub &amp; more. Updated daily.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl space-y-10 px-6 pb-16">
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
            <DealGrid promotions={filtered} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
