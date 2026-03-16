import { getActiveDealsCount, getActivePlatformCount } from "@/lib/actions";
import { Tag } from "lucide-react";

export async function StatsBar() {
  const [dealCount, platformCount] = await Promise.all([
    getActiveDealsCount(),
    getActivePlatformCount(),
  ]);

  return (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-brand/10 px-4 py-2 text-sm font-medium text-brand dark:bg-brand/20">
      <Tag className="size-4" />
      <span>
        {dealCount} active deals across {platformCount} platforms
      </span>
    </div>
  );
}
