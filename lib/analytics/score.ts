import type { RawArticleRow, RiskTier, StockStatus } from "@/types/domain";

/**
 * Focus scoring for the daily obsolescence workflow.
 *
 * The export tells us, per article, the value already written down (obsoleteNow)
 * and how much MORE will be written down at +1/+2/+3 months. The job is to rank
 * what the team should act on TODAY, weighting:
 *   - value already old (act to free capital), and
 *   - value about to go old, with imminent write-downs weighted highest
 *     (selling now prevents the loss).
 */

export interface ScoreInputs {
  obsoleteNow: number;
  change1m: number;
  change2m: number;
  change3m: number;
}

/** Time-weighted NOK at stake — already-old plus soon-to-be-old (front-loaded). */
export function weightedExposure({
  obsoleteNow,
  change1m,
  change2m,
  change3m,
}: ScoreInputs): number {
  return (
    obsoleteNow * 0.8 +
    Math.max(0, change1m) * 1.0 +
    Math.max(0, change2m) * 0.5 +
    Math.max(0, change3m) * 0.25
  );
}

/** Focus score (0–100): exposure log-scaled to the largest position in the day. */
export function computeFocusScore(exposure: number, datasetMax: number): number {
  if (exposure <= 0 || datasetMax <= 0) return 0;
  return clamp(Math.round((Math.log1p(exposure) / Math.log1p(datasetMax)) * 100));
}

export function deriveTier(focusScore: number): RiskTier {
  if (focusScore >= 70) return "Critical";
  if (focusScore >= 45) return "High";
  if (focusScore >= 22) return "Watch";
  return "Healthy";
}

export function deriveStatus(obsoleteNow: number, totalChange: number): StockStatus {
  const old = obsoleteNow > 0;
  const becoming = totalChange > 0;
  if (old && becoming) return "both";
  if (old) return "old";
  if (becoming) return "becoming";
  return "healthy";
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

export type { RawArticleRow };
