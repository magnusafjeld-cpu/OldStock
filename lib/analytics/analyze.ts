import type {
  Aggregates,
  Article,
  CategorySlice,
  ProductCategory,
  RawArticleRow,
} from "@/types/domain";
import { classifyCategory, detectBrand, detectFlags } from "./classify";
import {
  computeFocusScore,
  deriveStatus,
  deriveTier,
  weightedExposure,
} from "./score";
import { recommendAction } from "./recommend";

const CATEGORIES: ProductCategory[] = ["Smartphone", "Tablet", "Smartwatch", "Other"];

function stableKey(row: RawArticleRow): string {
  // Article code is stable across days; fall back to the name when absent.
  if (row.articleCode) return `code:${row.articleCode}`;
  return `name:${row.article.toLowerCase().replace(/\s+/g, " ").trim()}`;
}

function slugify(name: string, index: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
  return `${base || "article"}-${index}`;
}

function analyzeRow(row: RawArticleRow, index: number, datasetMax: number): Article {
  const category = classifyCategory(row.article);
  const brand = detectBrand(row.article);
  const flags = detectFlags(row.article);

  const exposure = weightedExposure({
    obsoleteNow: row.obsoleteNow,
    change1m: row.change1m,
    change2m: row.change2m,
    change3m: row.change3m,
  });
  const focusScore = computeFocusScore(exposure, datasetMax);
  const riskTier = deriveTier(focusScore);
  const status = deriveStatus(row.obsoleteNow, row.totalChange);
  const isOld = row.obsoleteNow > 0;
  const isBecoming = row.totalChange > 0;

  const recommendation = recommendAction({
    status,
    tier: riskTier,
    obsoleteNow: row.obsoleteNow,
    totalChange: row.totalChange,
    change1m: row.change1m,
    qty: row.qty,
    inCampaign: row.inCampaign,
    flags,
  });

  return {
    ...row,
    id: slugify(row.article, index),
    key: stableKey(row),
    category,
    brand,
    flags,
    status,
    isOld,
    isBecoming,
    weightedExposure: exposure,
    focusScore,
    riskTier,
    recommendation,
    workflow: "Open",
  };
}

export function analyzeRows(rows: RawArticleRow[]): Article[] {
  const datasetMax = rows.reduce(
    (max, r) =>
      Math.max(
        max,
        weightedExposure({
          obsoleteNow: r.obsoleteNow,
          change1m: r.change1m,
          change2m: r.change2m,
          change3m: r.change3m,
        })
      ),
    0
  );
  return rows.map((row, i) => analyzeRow(row, i, datasetMax));
}

/** Aggregate a slice of articles. Pure — used for both full and filtered views. */
export function computeAggregates(articles: Article[]): Aggregates {
  const byCategory = Object.fromEntries(
    CATEGORIES.map((c) => [
      c,
      { category: c, obsoleteNow: 0, becoming: 0, qty: 0, skuCount: 0, criticalCount: 0 } as CategorySlice,
    ])
  ) as Record<ProductCategory, CategorySlice>;

  let obsoleteNow = 0;
  let qtyOnStock = 0;
  let forecast1m = 0;
  let forecast2m = 0;
  let forecast3m = 0;
  let becoming = 0;
  let imminent = 0;
  let preventable = 0;
  let oldSkuCount = 0;
  let becomingSkuCount = 0;
  let bothSkuCount = 0;
  let criticalCount = 0;
  let highCount = 0;
  let watchCount = 0;
  let healthyCount = 0;

  for (const a of articles) {
    obsoleteNow += a.obsoleteNow;
    qtyOnStock += a.qty;
    forecast1m += a.forecast1m;
    forecast2m += a.forecast2m;
    forecast3m += a.forecast3m;
    if (a.totalChange > 0) becoming += a.totalChange;
    if (a.change1m > 0) imminent += a.change1m;

    const slice = byCategory[a.category];
    slice.obsoleteNow += a.obsoleteNow;
    if (a.totalChange > 0) slice.becoming += a.totalChange;
    slice.qty += a.qty;
    if (a.isOld || a.isBecoming) slice.skuCount += 1;

    if (a.status === "both") bothSkuCount += 1;
    if (a.isOld) oldSkuCount += 1;
    if (a.isBecoming && !a.isOld) becomingSkuCount += 1;

    switch (a.riskTier) {
      case "Critical":
        criticalCount += 1;
        slice.criticalCount += 1;
        preventable += Math.max(0, a.totalChange);
        break;
      case "High":
        highCount += 1;
        preventable += Math.max(0, a.totalChange);
        break;
      case "Watch":
        watchCount += 1;
        break;
      default:
        healthyCount += 1;
    }
  }

  return {
    obsoleteNow,
    qtyOnStock,
    forecast1m,
    forecast2m,
    forecast3m,
    becoming,
    imminent,
    preventable,
    oldSkuCount,
    becomingSkuCount,
    bothSkuCount,
    criticalCount,
    highCount,
    watchCount,
    healthyCount,
    byCategory,
  };
}
