/**
 * Domain model for the Old Stock Cockpit.
 *
 * The uploaded Excel is a daily Telecom obsolescence export at Article level for
 * one store. For each article it carries:
 *   - Qty on Stock Yesterday          (units on hand)
 *   - Value Obsolete Yesterday        (avskrevet verdi NÅ — what IS old stock)
 *   - Obsolete Forecast +1/+2/+3 Mnd  (projected written-down value ahead)
 *   - Change columns + Total Change   (how the obsolete value moves over 3 mnd)
 *
 * "Old stock" = value already written down. "Blir old stock" = the forecast
 * increase (Total Change) — value about to be written down unless it's sold now.
 * Each upload is stored as a dated daily snapshot so day-over-day movement and
 * weekly reduction can be tracked.
 */

export type ProductCategory = "Smartphone" | "Tablet" | "Smartwatch" | "Other";

/** Risk tiers — Norwegian labels in UI, English keys internally. */
export type RiskTier = "Critical" | "High" | "Watch" | "Healthy";

export type WorkflowStatus = "Open" | "In progress" | "Done";

export type ActionType = "selg" | "prisned" | "kampanje" | "overvaak" | "ingen";

/** Where the article sits relative to obsolescence. */
export type StockStatus = "old" | "becoming" | "both" | "healthy";

/** A single row exactly as parsed from the spreadsheet (cleaned). */
export interface RawArticleRow {
  article: string;
  articleCode: string;
  qty: number;
  obsoleteNow: number; // Value Obsolete Yesterday
  change1m: number; // yesterday → +1 mnd
  forecast1m: number;
  change2m: number; // +1 → +2 mnd
  forecast2m: number;
  change3m: number; // +2 → +3 mnd
  forecast3m: number;
  totalChange: number; // yesterday → +3 mnd
  inCampaign: boolean;
}

export interface Recommendation {
  type: ActionType;
  label: string;
  detail: string;
  /** NOK the action protects: prevents future write-down and/or frees capital. */
  estImpact: number;
}

/** A fully analyzed product (one article within one snapshot). */
export interface Article extends RawArticleRow {
  id: string; // unique within a snapshot (for React keys)
  key: string; // stable across snapshots (normalized name) — for movement matching
  category: ProductCategory;
  brand: string;
  flags: { outlet: boolean; demo: boolean; used: boolean };

  status: StockStatus;
  isOld: boolean; // obsoleteNow > 0
  isBecoming: boolean; // totalChange > 0

  /** Time-weighted value at stake (NOK) — drives the focus ranking. */
  weightedExposure: number;

  // Scores (0–100)
  focusScore: number;
  riskTier: RiskTier;

  recommendation: Recommendation;
  workflow: WorkflowStatus;
}

export interface CategorySlice {
  category: ProductCategory;
  obsoleteNow: number;
  becoming: number;
  qty: number;
  skuCount: number;
  criticalCount: number;
}

/** Aggregated figures for a slice of articles. */
export interface Aggregates {
  obsoleteNow: number; // total avskrevet verdi NÅ
  qtyOnStock: number;
  forecast1m: number;
  forecast2m: number;
  forecast3m: number;
  becoming: number; // sum of positive Total Change (blir old stock, 3 mnd)
  imminent: number; // sum of change1m (blir old stock innen 1 mnd)
  preventable: number; // Total Change held by Critical + High focus items
  oldSkuCount: number; // obsoleteNow > 0
  becomingSkuCount: number; // totalChange > 0 (and not yet old)
  bothSkuCount: number; // old AND worsening
  criticalCount: number;
  highCount: number;
  watchCount: number;
  healthyCount: number;
  byCategory: Record<ProductCategory, CategorySlice>;
}

/** One uploaded file = one dated daily snapshot of a store. */
export interface Snapshot {
  id: string; // `${store}__${date}`
  store: string;
  chain: string;
  currency: string;
  articleCategory: string; // e.g. "Telecom" (from footer)
  fileName: string;
  date: string; // YYYY-MM-DD (snapshot day)
  uploadedAt: number;
  rowCount: number;
  articles: Article[];
  aggregates: Aggregates;
}

/** Day-over-day / period movement between two snapshots. */
export interface Movement {
  fromDate: string;
  toDate: string;
  fromObsolete: number;
  toObsolete: number;
  delta: number; // toObsolete − fromObsolete (negative = reduksjon = bra)
  deltaPct: number | null;
  cleared: number; // Σ max(0, prev − curr) per article — verdi jobbet ned
  newObsolescence: number; // Σ max(0, curr − prev) per article — ny avskrivning
  days: number;
}

/** Lightweight record for the "recent files" strip. */
export interface RecentFileMeta {
  id: string;
  store: string;
  date: string;
  fileName: string;
  uploadedAt: number;
  obsoleteNow: number;
}

export type CategoryScope = "all" | ProductCategory;
