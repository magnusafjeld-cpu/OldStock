import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md";

/**
 * Buttons (spec §10): primary lifts +brightness/glow on hover, all 150ms ease.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  ...rest
}: {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<Variant, string> = {
    primary:
      "bg-brand-green text-white font-semibold hover:brightness-110 hover:shadow-glow-green hover:-translate-y-px",
    ghost:
      "bg-transparent text-ink-secondary border border-hairline hover:border-hairline-strong hover:text-ink-primary",
    subtle:
      "bg-surface-2 text-ink-secondary hover:bg-surface-3 hover:text-ink-primary border border-hairline-subtle",
    danger:
      "bg-risk-critical/15 text-risk-critical border border-risk-critical/30 hover:bg-risk-critical/25",
  };
  const sizes: Record<Size, string> = {
    sm: "h-[30px] px-s3 text-label rounded-md gap-[6px]",
    md: "h-[38px] px-s4 text-label rounded-md gap-s2",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-all duration-150 ease-out-soft disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
