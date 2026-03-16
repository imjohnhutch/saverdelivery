import { DealCard } from "@/components/deal-card";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">No deals found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {promotions.map((promo) => (
        <DealCard key={promo.id} promotion={promo} />
      ))}
    </div>
  );
}

export function DealGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
