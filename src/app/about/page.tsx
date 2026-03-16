import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "About | saver.delivery",
  description:
    "Learn about saver.delivery and our affiliate disclosure.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense>
        <Navbar />
      </Suspense>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <h1 className="text-3xl font-bold text-foreground">About saver.delivery</h1>

          <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
            <p>
              saver.delivery is a free tool that aggregates the latest promo codes,
              coupons, and deals from the most popular food delivery platforms
              including DoorDash, Uber Eats, Grubhub, Postmates, Instacart, and
              Caviar.
            </p>
            <p>
              Our goal is simple: help you save money on every food delivery
              order. We scour the web for the best deals so you don&apos;t have to.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground">
              Affiliate Disclosure
            </h2>
            <div className="mt-4 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground leading-relaxed">
              <p>
                saver.delivery participates in affiliate programs with food
                delivery platforms. When you click a deal link on our site and
                make a purchase, we may earn a small commission at no extra cost
                to you. This revenue helps us keep saver.delivery free. Our deal
                rankings are based on value and are never influenced by affiliate
                commissions.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
