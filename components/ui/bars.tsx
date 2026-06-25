import { cn } from "@/lib/cn";

/** Generic value bar on the surface/3 track. */
export function ProgressBar({
  value,
  color = "#0E8C43",
  className,
  height = 6,
}: {
  value: number; // 0–100
  color?: string;
  className?: string;
  height?: number;
}) {
  return (
    <div
      className={cn("w-full overflow-hidden rounded-pill bg-surface-3", className)}
      style={{ height }}
    >
      <div
        className="h-full rounded-pill transition-all duration-500 ease-out-soft"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
      />
    </div>
  );
}

