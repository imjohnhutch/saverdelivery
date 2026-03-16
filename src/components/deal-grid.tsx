import { DealCard } from "@/components/deal-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "lucide-react";

interface Promotion {
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
}

export function DealGrid({ promotions }: { promotions: Promotion[] }) {
  if (promotions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
          <Tag className="size-5 text-muted-foreground" />
        </div>
        <p className="text-base font-medium text-foreground">No deals found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {promotions.map((promo) => (
        <DealCard key={promo.id} promotion={promo} />
      ))}
    </div>
  );
}

export function DealGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-7 rounded-lg" />
              <Skeleton className="h-3.5 w-20" />
            </div>
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="flex gap-3">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <div className="flex items-center justify-between border-t border-border/50 pt-3.5">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
