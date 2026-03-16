"use client";

import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface DealActionsProps {
  promotionId: string;
  platformSlug: string;
  platformName: string;
  promoCode?: string | null;
}

export function DealActions({
  promotionId,
  platformSlug,
  platformName,
  promoCode,
}: DealActionsProps) {
  const handleCopy = async () => {
    if (promoCode) {
      await navigator.clipboard.writeText(promoCode);
      toast.success("Code copied!");
    }
  };

  const handleUseDeal = async () => {
    try {
      if (promoCode) {
        await navigator.clipboard.writeText(promoCode);
      }

      const res = await fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promotionId, platformSlug }),
      });

      const data = await res.json();

      toast.success(
        `${promoCode ? "Code copied! " : ""}Opening ${platformName}...`
      );

      window.open(data.url, "_blank");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {promoCode && (
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary active:scale-[0.98]"
        >
          <Copy className="size-4" />
          Copy Code
        </button>
      )}
      <button
        onClick={handleUseDeal}
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <ExternalLink className="size-4" />
        Use Deal on {platformName}
      </button>
    </div>
  );
}
