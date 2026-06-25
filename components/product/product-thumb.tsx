import { Smartphone, Tablet, Watch, Package } from "lucide-react";
import type { ProductCategory } from "@/types/domain";
import { CATEGORY_COLOR } from "@/lib/ui-tokens";
import { cn } from "@/lib/cn";

const ICONS: Record<ProductCategory, typeof Smartphone> = {
  Smartphone,
  Tablet,
  Smartwatch: Watch,
  Other: Package,
};

/** Striped placeholder thumbnail until product imagery is wired (spec §14). */
export function ProductThumb({
  category,
  size = 64,
  className,
}: {
  category: ProductCategory;
  size?: number;
  className?: string;
}) {
  const Icon = ICONS[category];
  const color = CATEGORY_COLOR[category];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-hairline-subtle",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundImage: `repeating-linear-gradient(45deg, ${color}1F, ${color}1F 6px, transparent 6px, transparent 12px)`,
        backgroundColor: "#F4F6F9",
      }}
    >
      <Icon size={size * 0.42} strokeWidth={1.5} style={{ color }} />
    </div>
  );
}
