import { cn } from "@/lib/cn";

/** Skeleton block — mirrors final layout, shimmer sweeps L→R (spec §11). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function KpiSkeleton() {
  return (
    <div className="rounded-card border border-hairline-subtle bg-surface-1 p-s5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-s4 h-9 w-28" />
      <Skeleton className="mt-s3 h-3 w-24" />
    </div>
  );
}

export function RowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-s6 px-s5 py-s4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", i === 0 ? "w-48" : "w-16")} />
      ))}
    </div>
  );
}
