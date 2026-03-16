"use client";

import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
        <Button variant="outline" size="lg" className="flex-1" onClick={handleCopy}>
          <Copy className="size-4" />
          Copy Code
        </Button>
      )}
      <Button size="lg" className="flex-1" onClick={handleUseDeal}>
        <ExternalLink className="size-4" />
        Use Deal on {platformName}
      </Button>
    </div>
  );
}
