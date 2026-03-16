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
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense>
        <Navbar />
      </Suspense>

      <main className="flex-1">
        <div className="mx-auto max-w-xl px-6 py-16">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            About
          </h1>

          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-muted-foreground">
            <p>
              saver.delivery aggregates the latest promo codes, coupons, and deals
              from popular food delivery platforms including DoorDash, Uber Eats,
              Grubhub, Postmates, Instacart, and more.
            </p>
            <p>
              Our goal is simple: help you save money on every order. We scan the
              web for the best deals so you don&apos;t have to.
            </p>
          </div>

          <div className="mt-14">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Affiliate Disclosure
            </h2>
            <div className="mt-4 rounded-2xl bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
              <p>
                saver.delivery participates in affiliate programs with food
                delivery platforms. When you click a deal link and make a
                purchase, we may earn a small commission at no extra cost to you.
                This revenue helps us keep saver.delivery free. Our rankings are
                based on value and are never influenced by affiliate commissions.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
