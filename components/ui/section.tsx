import { cn } from "@/lib/cn";

/** Section heading with optional overline and right-side action slot. */
export function SectionHeader({
  overline,
  title,
  action,
  className,
}: {
  overline?: string;
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-s5 flex items-end justify-between gap-s4", className)}>
      <div>
        {overline && <div className="overline mb-1">{overline}</div>}
        <h2 className="text-h2 text-ink-primary">{title}</h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** One-line plain-language takeaway that pairs with every chart (spec §07). */
export function Takeaway({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-s4 border-t border-hairline-subtle pt-s3 text-label text-ink-secondary">
      <span className="text-brand-green">→ </span>
      {children}
    </p>
  );
}
