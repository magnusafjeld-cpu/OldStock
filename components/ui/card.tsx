import { cn } from "@/lib/cn";

/**
 * Base container for every panel (spec §04): surface/1, 1px hairline, radius 14,
 * e1 shadow. When interactive, lifts to e2 with a stronger border on hover.
 */
export function Card({
  children,
  className,
  interactive = false,
  as: Tag = "div",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-hairline-subtle bg-surface-1 shadow-e1",
        interactive &&
          "cursor-pointer transition-all duration-150 ease-out-soft hover:-translate-y-[2px] hover:border-hairline-strong hover:shadow-e2",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  description,
  dot,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  dot?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-s4", className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-s2">
          {dot && (
            <span
              className="h-[7px] w-[7px] shrink-0 rounded-full"
              style={{ backgroundColor: dot }}
            />
          )}
          <h3 className="text-h3 text-ink-primary">{title}</h3>
        </div>
        {description && (
          <p className="mt-1 max-w-measure text-label text-ink-secondary">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
