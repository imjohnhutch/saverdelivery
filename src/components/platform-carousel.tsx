"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PlatformLogo } from "@/components/platform-logo";
import { useRef, useState, useEffect } from "react";

interface Platform {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  color: string;
}

export function PlatformCarousel({ platforms }: { platforms: Platform[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.get("platforms")?.split(",").filter(Boolean) ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const check = () => {
      setCanScrollRight(el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const toggle = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let next: string[];
    if (selected.includes(slug)) {
      next = selected.filter((s) => s !== slug);
    } else {
      next = [...selected, slug];
    }
    if (next.length > 0) {
      params.set("platforms", next.join(","));
    } else {
      params.delete("platforms");
    }
    router.push(`/?${params.toString()}`);
  };

  if (platforms.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:justify-center"
      >
        {platforms.map((p) => {
          const isSelected = selected.includes(p.slug);
          return (
            <button
              key={p.slug}
              onClick={() => toggle(p.slug)}
              className={`flex shrink-0 flex-col items-center gap-2 rounded-2xl px-4 py-3 transition-all duration-200 ${
                isSelected
                  ? "bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] ring-1 ring-primary/30"
                  : "hover:bg-secondary/60"
              }`}
            >
              <PlatformLogo
                name={p.name}
                logoUrl={p.logoUrl}
                color={p.color}
                size={44}
                className="rounded-xl"
              />
              <span className={`text-xs font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                {p.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fade gradient + arrow hint when scrollable on mobile */}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 flex h-full w-12 items-center justify-end bg-gradient-to-l from-background to-transparent sm:hidden">
          <svg
            className="mr-1 size-5 animate-pulse text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
