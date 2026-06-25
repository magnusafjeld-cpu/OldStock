import type { ProductCategory, RiskTier, StockStatus } from "@/types/domain";

/** Categorical data-viz hues, tuned for a light canvas. */
export const CATEGORY_COLOR: Record<ProductCategory, string> = {
  Smartphone: "#3B7DF5",
  Tablet: "#0EA09A",
  Smartwatch: "#7C5CFF",
  Other: "#DD8A12",
};

/** Norwegian category labels. */
export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  Smartphone: "Mobil",
  Tablet: "Nettbrett",
  Smartwatch: "Klokker",
  Other: "Tilbehør",
};

/** Risk-tier hues (legible on white). */
export const TIER_COLOR: Record<RiskTier, string> = {
  Critical: "#E5484D",
  High: "#E5800B",
  Watch: "#BE8A00",
  Healthy: "#15924C",
};

export const TIER_LABEL: Record<RiskTier, string> = {
  Critical: "Kritisk",
  High: "Høy",
  Watch: "Følg med",
  Healthy: "OK",
};

export const TIER_ORDER: RiskTier[] = ["Critical", "High", "Watch", "Healthy"];

export const TIER_ACTION_WINDOW: Record<RiskTier, string> = {
  Critical: "Tiltak denne uken",
  High: "Tiltak denne måneden",
  Watch: "Overvåk",
  Healthy: "Ingen tiltak",
};

/** Stock-status metadata (er / blir old stock). */
export const STATUS_LABEL: Record<StockStatus, string> = {
  old: "Old stock",
  becoming: "Blir old stock",
  both: "Old & øker",
  healthy: "OK",
};

export const STATUS_COLOR: Record<StockStatus, string> = {
  old: "#E5484D",
  becoming: "#E5800B",
  both: "#C2362F",
  healthy: "#15924C",
};

/** The two headline buckets used in the status split. */
export const SPLIT_OLD_COLOR = "#E5484D"; // er old stock (avskrevet verdi nå)
export const SPLIT_BECOMING_COLOR = "#E5800B"; // blir old stock (kommende avskrivning)
