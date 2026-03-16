import { getActiveDealsCount, getActivePlatformCount } from "@/lib/actions";

export async function StatsBar() {
  const [dealCount, platformCount] = await Promise.all([
    getActiveDealsCount(),
    getActivePlatformCount(),
  ]);

  if (dealCount === 0) return null;

  return (
    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-2 rounded-full bg-primary" />
        <span><strong className="text-foreground">{dealCount}</strong> active deals</span>
      </div>
      <div className="h-3.5 w-px bg-border" />
      <div className="flex items-center gap-2">
        <span><strong className="text-foreground">{platformCount}</strong> platforms</span>
      </div>
    </div>
  );
}
