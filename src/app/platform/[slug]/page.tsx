import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { DealGrid } from "@/components/deal-grid";
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
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense>
        <Navbar />
      </Suspense>

      <main className="flex-1">
        {/* Platform header */}
        <section className="px-6 pb-8 pt-12">
          <div className="mx-auto flex max-w-5xl items-center gap-5">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.04)]">
              <Image
                src={platform.logoUrl}
                alt={platform.name}
                fill
                className="object-contain p-2.5"
                unoptimized
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {platform.name}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {promotions.length} active deal{promotions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <a
              href={referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Visit Site
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6 pb-16">
          <DealGrid promotions={promotions} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
