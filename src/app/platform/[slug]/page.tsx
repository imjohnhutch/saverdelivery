import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DealGrid } from "@/components/deal-grid";
import { Button } from "@/components/ui/button";
import { getPlatform, getPlatforms, getPromotions } from "@/lib/actions";
import { buildReferralLink } from "@/lib/utils/build-referral-link";
import { Suspense } from "react";

interface PlatformPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const platforms = await getPlatforms();
    return platforms.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PlatformPageProps): Promise<Metadata> {
  const { slug } = await params;
  const platform = await getPlatform(slug);
  if (!platform) return {};

  const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  return {
    title: `Best ${platform.name} Promo Codes - ${month} | saver.delivery`,
    description: `Find the latest ${platform.name} promo codes, coupons, and deals. Save on your next ${platform.name} order with saver.delivery.`,
  };
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { slug } = await params;
  const [platform, promotions] = await Promise.all([
    getPlatform(slug),
    getPromotions({ platformSlugs: [slug] }),
  ]);

  if (!platform) notFound();

  const referralUrl = buildReferralLink(slug);

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense>
        <Navbar />
      </Suspense>

      <main className="flex-1">
        {/* Platform header */}
        <section
          className="border-b px-4 py-10"
          style={{ borderBottomColor: platform.color + "40" }}
        >
          <div className="mx-auto flex max-w-6xl items-center gap-6">
            <div
              className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-white p-2 shadow-md"
              style={{ boxShadow: `0 4px 20px ${platform.color}20` }}
            >
              <Image
                src={platform.logoUrl}
                alt={platform.name}
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {platform.name} Deals
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {promotions.length} active promo code{promotions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <a
              href={referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              <ExternalLink className="size-4" />
              Visit {platform.name}
            </a>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <DealGrid promotions={promotions} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
