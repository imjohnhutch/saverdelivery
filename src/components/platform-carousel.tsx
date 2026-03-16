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

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
      {platforms.map((p) => {
        const isSelected = selected.includes(p.slug);
        return (
          <button
            key={p.slug}
            onClick={() => toggle(p.slug)}
            className="flex shrink-0 flex-col items-center gap-2 rounded-xl border-2 bg-card p-3 transition-all hover:shadow-md"
            style={{
              borderColor: isSelected ? p.color : "transparent",
              boxShadow: isSelected ? `0 0 0 1px ${p.color}20` : undefined,
            }}
          >
            <div className="relative size-12 overflow-hidden rounded-lg bg-white p-1">
              <Image
                src={p.logoUrl}
                alt={p.name}
                fill
                className="object-contain p-1"
                unoptimized
              />
            </div>
            <span className="text-xs font-medium text-foreground">{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}
