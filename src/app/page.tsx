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
    q?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const platformSlugs = params.platforms?.split(",").filter(Boolean);
  const discountType = params.type as DiscountType | undefined;
  const sort = (params.sort as SortOption) || "best";
  const search = params.q;

  const [promotions, platforms] = await Promise.all([
    getPromotions({ platformSlugs, discountType, sort, search }),
    getPlatforms(),
  ]);

  const everyoneDeals = promotions.filter(
    (p) => p.targetAudience !== "NEW_USERS" && !p.isNewUser
  );
  const newUserDeals = promotions.filter(
    (p) => p.targetAudience === "NEW_USERS" || p.isNewUser
  );

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

          {/* Existing user deals — primary section */}
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Deals for Everyone
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Active promos for existing customers
              </p>
            </div>
            <Suspense fallback={<DealGridSkeleton />}>
              <DealGrid promotions={everyoneDeals} />
            </Suspense>
          </section>

          {/* New user deals — secondary section */}
          {newUserDeals.length > 0 && (
            <section>
              <div className="mb-5">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  New User Deals
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  First-time signup offers
                </p>
              </div>
              <DealGrid promotions={newUserDeals} />
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
