"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

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
    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
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
            <div className="relative size-11 overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <Image
                src={p.logoUrl}
                alt={p.name}
                fill
                className="object-contain p-1.5"
                unoptimized
              />
            </div>
            <span className={`text-xs font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
              {p.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
