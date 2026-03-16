"use client";

import { useRouter, useSearchParams } from "next/navigation";

const discountTypes = [
  { label: "All", value: "" },
  { label: "Free Delivery", value: "FREE_DELIVERY" },
  { label: "% Off", value: "PERCENTAGE" },
  { label: "$ Off", value: "FLAT_AMOUNT" },
  { label: "BOGO", value: "BOGO" },
];

const sortOptions = [
  { label: "Best Deals", value: "best" },
  { label: "Newest", value: "newest" },
  { label: "Expiring Soon", value: "expiring" },
  { label: "Most Upvoted", value: "upvoted" },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") ?? "";
  const currentSort = searchParams.get("sort") ?? "best";

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-1.5">
        {discountTypes.map((dt) => (
          <button
            key={dt.value}
            onClick={() => setParam("type", dt.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
              currentType === dt.value
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {dt.label}
          </button>
        ))}
      </div>

      <select
        value={currentSort}
        onChange={(e) => setParam("sort", e.target.value)}
        className="rounded-full border-0 bg-secondary px-3.5 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-secondary/80"
      >
        {sortOptions.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
