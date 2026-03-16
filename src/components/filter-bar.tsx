"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const discountTypes = [
  { label: "All", value: "" },
  { label: "Free Delivery", value: "FREE_DELIVERY" },
  { label: "% Off", value: "PERCENTAGE" },
  { label: "$ Off", value: "FLAT_AMOUNT" },
  { label: "BOGO", value: "BOGO" },
];

const audiences = [
  { label: "All", value: "" },
  { label: "New Users", value: "NEW_USERS" },
  { label: "Everyone", value: "ALL" },
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
  const currentAudience = searchParams.get("audience") ?? "";
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
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1.5">
        {discountTypes.map((dt) => (
          <Button
            key={dt.value}
            variant={currentType === dt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setParam("type", dt.value)}
          >
            {dt.label}
          </Button>
        ))}
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex flex-wrap gap-1.5">
        {audiences.map((a) => (
          <Button
            key={a.value}
            variant={currentAudience === a.value ? "default" : "outline"}
            size="sm"
            onClick={() => setParam("audience", a.value)}
          >
            {a.label}
          </Button>
        ))}
      </div>

      <div className="h-6 w-px bg-border" />

      <select
        value={currentSort}
        onChange={(e) => setParam("sort", e.target.value)}
        className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
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
