import { cn } from "@/lib/cn";

/**
 * No-data variant for lists/tables/charts (spec §12). Positive emptiness
 * ("all clear") is celebrated rather than treated as an error.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "neutral",
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "neutral" | "positive";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-s3 rounded-card border border-dashed border-hairline px-s6 py-s12 text-center",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            tone === "positive"
              ? "bg-brand-green-soft text-risk-healthy"
              : "bg-surface-2 text-ink-tertiary"
          )}
        >
          {icon}
        </div>
      )}
      <div>
        <p className="text-h3 text-ink-primary">{title}</p>
        {description && (
          <p className="mt-1 max-w-measure text-label text-ink-secondary">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
