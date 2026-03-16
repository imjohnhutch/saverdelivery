"use client";

import Image from "next/image";
import Link from "next/link";
import { Copy, ThumbsUp, ThumbsDown, ExternalLink, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { CountdownTimer } from "@/components/countdown-timer";
import { vote } from "@/lib/actions";
import { useState } from "react";

interface DealCardProps {
  promotion: {
    id: string;
    title: string;
    description?: string | null;
    promoCode?: string | null;
    discountType: string;
    discountValue?: number | null;
    minimumOrder?: number | null;
    maxDiscount?: number | null;
    expirationDate?: string | Date | null;
    isVerified: boolean;
    isNewUser: boolean;
    targetAudience: string;
    upvotes: number;
    downvotes: number;
    platform: {
      name: string;
      slug: string;
      logoUrl: string;
      color: string;
    };
  };
}

const discountTypeLabels: Record<string, string> = {
  PERCENTAGE: "% Off",
  FLAT_AMOUNT: "$ Off",
  FREE_DELIVERY: "Free Delivery",
  BOGO: "BOGO",
  CASHBACK: "Cashback",
  FREE_ITEM: "Free Item",
  OTHER: "Deal",
};

export function DealCard({ promotion }: DealCardProps) {
  const [upvotes, setUpvotes] = useState(promotion.upvotes);
  const [downvotes, setDownvotes] = useState(promotion.downvotes);
  const [voting, setVoting] = useState(false);

  const handleCopy = async () => {
    if (promotion.promoCode) {
      await navigator.clipboard.writeText(promotion.promoCode);
      toast.success("Code copied!");
    }
  };

  const handleUseDeal = async () => {
    try {
      if (promotion.promoCode) {
        await navigator.clipboard.writeText(promotion.promoCode);
      }

      const res = await fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promotionId: promotion.id,
          platformSlug: promotion.platform.slug,
        }),
      });

      const data = await res.json();

      toast.success(
        `${promotion.promoCode ? "Code copied! " : ""}Opening ${promotion.platform.name}...`
      );

      window.open(data.url, "_blank");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleVote = async (direction: "up" | "down") => {
    if (voting) return;
    setVoting(true);
    try {
      await vote(promotion.id, direction);
      if (direction === "up") {
        setUpvotes((v) => v + 1);
      } else {
        setDownvotes((v) => v + 1);
      }
    } catch {
      toast.error("Failed to vote");
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="group flex flex-col rounded-2xl bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_28px_rgba(0,0,0,0.06)]">
      {/* Platform header */}
      <div className="flex items-center justify-between">
        <Link href={`/platform/${promotion.platform.slug}`} className="flex items-center gap-2.5">
          <div className="relative size-7 overflow-hidden rounded-lg bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
            <Image
              src={promotion.platform.logoUrl}
              alt={promotion.platform.name}
              fill
              className="object-contain p-1"
              unoptimized
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {promotion.platform.name}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {promotion.isVerified && (
            <span className="flex items-center gap-1 text-primary">
              <CheckCircle className="size-3.5" />
              <span className="text-xs font-medium">Verified</span>
            </span>
          )}
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {discountTypeLabels[promotion.discountType] ?? promotion.discountType}
          </span>
        </div>
      </div>

      {/* Title */}
      <Link href={`/deal/${promotion.id}`} className="mt-3.5">
        <h3 className="text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {promotion.title}
        </h3>
      </Link>

      {/* Promo code */}
      {promotion.promoCode && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-between rounded-xl bg-secondary/80 px-3.5 py-2.5 transition-colors hover:bg-secondary"
          >
            <code className="text-sm font-semibold tracking-wide text-foreground">
              {promotion.promoCode}
            </code>
            <Copy className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Meta info */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {promotion.minimumOrder && (
          <span>Min. ${promotion.minimumOrder}</span>
        )}
        {promotion.targetAudience === "NEW_USERS" && (
          <span className="text-primary font-medium">New users only</span>
        )}
        {promotion.expirationDate && (
          <CountdownTimer expirationDate={promotion.expirationDate} />
        )}
      </div>

      {/* Bottom row */}
      <div className="mt-4 flex items-center justify-between pt-3.5 border-t border-border/50">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => handleVote("up")}
            disabled={voting}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ThumbsUp className="size-3" />
            <span className="text-xs">{upvotes}</span>
          </button>
          <button
            onClick={() => handleVote("down")}
            disabled={voting}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ThumbsDown className="size-3" />
            <span className="text-xs">{downvotes}</span>
          </button>
        </div>

        <button
          onClick={handleUseDeal}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          Get Deal
          <ExternalLink className="size-3" />
        </button>
      </div>
    </div>
  );
}
