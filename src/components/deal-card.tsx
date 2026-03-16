"use client";

import Image from "next/image";
import Link from "next/link";
import { Copy, ThumbsUp, ThumbsDown, ExternalLink, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

const audienceLabels: Record<string, string> = {
  NEW_USERS: "New Users",
  EXISTING_USERS: "Existing Users",
  SUBSCRIPTION_MEMBERS: "Members",
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
    <Card className="relative overflow-hidden transition-shadow hover:shadow-lg">
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: promotion.platform.color }}
      />

      <CardContent className="flex flex-col gap-3 pt-4">
        {/* Platform header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative size-6 overflow-hidden rounded bg-white">
              <Image
                src={promotion.platform.logoUrl}
                alt={promotion.platform.name}
                fill
                className="object-contain p-0.5"
                unoptimized
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {promotion.platform.name}
            </span>
          </div>
          {promotion.isVerified && (
            <div className="flex items-center gap-1 text-brand">
              <CheckCircle className="size-3.5" />
              <span className="text-xs font-medium">Verified</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={`/deal/${promotion.id}`} className="group">
          <h3 className="text-base font-bold leading-snug text-foreground group-hover:text-brand transition-colors">
            {promotion.title}
          </h3>
        </Link>

        {/* Promo code */}
        {promotion.promoCode && (
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center rounded-lg border-2 border-dashed border-border bg-muted/50 px-3 py-1.5">
              <code className="flex-1 text-sm font-semibold tracking-wide text-foreground">
                {promotion.promoCode}
              </code>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="size-3.5" />
              Copy
            </Button>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">
            {discountTypeLabels[promotion.discountType] ?? promotion.discountType}
          </Badge>
          {promotion.targetAudience !== "ALL" && (
            <Badge variant="outline">
              {audienceLabels[promotion.targetAudience] ?? promotion.targetAudience}
            </Badge>
          )}
          {promotion.expirationDate && (
            <CountdownTimer expirationDate={promotion.expirationDate} />
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => handleVote("up")}
              disabled={voting}
            >
              <ThumbsUp className="size-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">{upvotes}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => handleVote("down")}
              disabled={voting}
            >
              <ThumbsDown className="size-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">{downvotes}</span>
          </div>

          <Button size="sm" onClick={handleUseDeal}>
            <ExternalLink className="size-3.5" />
            Use Deal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
