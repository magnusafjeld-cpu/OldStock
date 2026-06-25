"use client";

import { cn } from "@/lib/cn";
import { useCountUp } from "@/lib/use-count-up";

export type DeltaTone = "good" | "bad" | "neutral";

export interface KpiCardProps {
  label: string;
  value: number;
  /** Formats the (animated) numeric value into a display string. */
  formatValue: (n: number) => string;
  unit?: string;
  deltaLabel?: string;
  deltaTone?: DeltaTone;
  /** Opportunity treatment: green gradient + glow (spec §06). */
  variant?: "default" | "opportunity";
  onClick?: () => void;
  active?: boolean;
}

const TONE_COLOR: Record<DeltaTone, string> = {
  good: "#15924C",
  bad: "#E5484D",
  neutral: "#8A98AC",
};

export function KpiCard({
  label,
  value,
  formatValue,
  unit,
  deltaLabel,
  deltaTone = "neutral",
  variant = "default",
  onClick,
  active = false,
}: KpiCardProps) {
  const animated = useCountUp(value);
  const opportunity = variant === "opportunity";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-card border p-s5 text-left transition-all duration-150 ease-out-soft",
        opportunity
          ? "border-brand-green/30 bg-gradient-to-br from-brand-green-soft to-surface-1 shadow-glow-green"
          : "border-hairline-subtle bg-surface-1 shadow-e1",
        onClick && "cursor-pointer hover:-translate-y-[2px] hover:border-hairline-strong hover:shadow-e2",
        active && "border-brand-green/60 ring-1 ring-brand-green/40"
      )}
    >
      <div className="overline" style={opportunity ? { color: "#15924C" } : undefined}>
        {label}
      </div>

      <div className="mt-s3">
        <div className="flex items-baseline gap-[6px]">
          <span className="tnum font-sans text-[34px] font-bold leading-none text-ink-primary">
            {formatValue(animated)}
          </span>
          {unit && <span className="text-body text-ink-secondary">{unit}</span>}
        </div>
      </div>

      {deltaLabel ? (
        <div className="mt-s3 text-label" style={{ color: TONE_COLOR[deltaTone] }}>
          {deltaLabel}
        </div>
      ) : (
        <div className="mt-s3 h-[18px]" />
      )}
    </button>
  );
}
