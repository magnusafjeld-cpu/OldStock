import { cn } from "@/lib/cn";
import type { RiskTier, StockStatus, WorkflowStatus } from "@/types/domain";
import {
  TIER_COLOR,
  TIER_ACTION_WINDOW,
  TIER_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
} from "@/lib/ui-tokens";

const WORKFLOW_LABEL: Record<WorkflowStatus, string> = {
  Open: "Åpen",
  "In progress": "Pågår",
  Done: "Ferdig",
};

/** Soft, in-line risk chip: dot + label + colour (spec §08). */
export function RiskChip({
  tier,
  showWindow = false,
  className,
}: {
  tier: RiskTier;
  showWindow?: boolean;
  className?: string;
}) {
  const color = TIER_COLOR[tier];
  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center gap-[6px] rounded-pill border px-[10px] text-label font-medium",
        className
      )}
      style={{
        color,
        backgroundColor: `${color}1A`,
        borderColor: `${color}33`,
      }}
    >
      <span className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: color }} />
      {TIER_LABEL[tier]}
      {showWindow && (
        <span className="text-ink-tertiary"> · {TIER_ACTION_WINDOW[tier]}</span>
      )}
    </span>
  );
}

/** Solid emphasis badge, e.g. on product shots. */
export function RiskBadgeSolid({
  tier,
  score,
  className,
}: {
  tier: RiskTier;
  score?: number;
  className?: string;
}) {
  const color = TIER_COLOR[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[6px] rounded-badge px-[9px] py-[4px] text-overline text-white",
        className
      )}
      style={{ backgroundColor: color }}
    >
      <span>{TIER_LABEL[tier].toUpperCase()}</span>
      {score !== undefined && (
        <span className="tnum font-mono text-[11px] opacity-80">· {score}</span>
      )}
    </span>
  );
}

/** 0–100 score badge with tier colour. */
export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const tier: RiskTier =
    score >= 72 ? "Critical" : score >= 52 ? "High" : score >= 30 ? "Watch" : "Healthy";
  const color = TIER_COLOR[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[6px] rounded-badge px-[8px] py-[3px] font-mono text-[11px] font-semibold tnum",
        className
      )}
      style={{ color, backgroundColor: `${color}1A`, borderColor: `${color}33` }}
    >
      <span className="overline !text-[10px]" style={{ color }}>
        FOKUS
      </span>
      {score}
    </span>
  );
}

/** Workflow status chip — "In progress" dot blinks to read as live (spec §08). */
export function WorkflowChip({
  status,
  className,
}: {
  status: WorkflowStatus;
  className?: string;
}) {
  const config: Record<WorkflowStatus, { color: string; dot: string }> = {
    Open: { color: "#51627A", dot: "#8A98AC" },
    "In progress": { color: "#2E6FF2", dot: "#2E6FF2" },
    Done: { color: "#15924C", dot: "#15924C" },
  };
  const { color, dot } = config[status];
  return (
    <span
      className={cn(
        "inline-flex h-[24px] items-center gap-[6px] rounded-pill px-[9px] text-label",
        className
      )}
      style={{ color, backgroundColor: `${color}14` }}
    >
      <span
        className={cn(
          "h-[7px] w-[7px] rounded-full",
          status === "In progress" && "animate-blink-live"
        )}
        style={{ backgroundColor: dot }}
      />
      {WORKFLOW_LABEL[status]}
    </span>
  );
}

/** Stock-status chip — "Old stock" / "Blir old stock" (spec §08 soft style). */
export function StatusChip({
  status,
  className,
}: {
  status: StockStatus;
  className?: string;
}) {
  if (status === "healthy") return null;
  const color = STATUS_COLOR[status];
  return (
    <span
      className={cn(
        "inline-flex h-[24px] items-center gap-[6px] rounded-pill px-[9px] text-label font-medium",
        className
      )}
      style={{ color, backgroundColor: `${color}1A`, borderColor: `${color}33` }}
    >
      <span className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: color }} />
      {STATUS_LABEL[status]}
    </span>
  );
}

/** Small attribute tag (Outlet / Demo / Used / brand). */
export function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "info" | "warn";
}) {
  const tones = {
    neutral: "text-ink-tertiary bg-surface-2 border-hairline-subtle",
    info: "text-brand-blue bg-brand-blue-soft border-brand-blue/30",
    warn: "text-risk-high bg-risk-high/10 border-risk-high/30",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-[7px] py-[2px] text-[11px] font-medium",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
