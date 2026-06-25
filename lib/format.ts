/**
 * Nordic-locale formatting (nb-NO): space thousands separators, comma decimals.
 * Currency is NOK (the export uses LOC = local currency for Elkjøp Norge).
 */

const NBSP = " ";

/** Full integer NOK with grouped thousands, e.g. 1 245 000. */
export function formatNumber(n: number, maxFractionDigits = 0): string {
  if (!isFinite(n)) return "–";
  return new Intl.NumberFormat("nb-NO", {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
  }).format(n);
}

/**
 * Compact NOK for KPI heroes: returns the number and its unit separately so the
 * unit can be rendered at a smaller weight (per the KPI card spec).
 */
export function formatCompactValue(n: number): { value: string; unit: string } {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    return { value: formatDecimal(n / 1_000_000, abs >= 10_000_000 ? 1 : 3), unit: `M${NBSP}NOK` };
  }
  if (abs >= 1_000) {
    return { value: formatNumber(Math.round(n / 1000)), unit: `K${NBSP}NOK` };
  }
  return { value: formatNumber(Math.round(n)), unit: "NOK" };
}

/** Short compact value for inline table/badge use, e.g. "96K", "1,2M". */
export function formatCompactShort(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${formatDecimal(abs / 1_000_000, abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${sign}${Math.round(abs / 1000)}K`;
  return `${sign}${Math.round(abs)}`;
}

function formatDecimal(n: number, digits: number): string {
  return new Intl.NumberFormat("nb-NO", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(n);
}

/** Signed percent, e.g. +8 %, -4 %. Returns "–" when pct is null. */
export function formatPct(pct: number | null, signed = true, digits = 0): string {
  if (pct === null || !isFinite(pct)) return "–";
  const formatted = formatDecimal(Math.abs(pct), digits);
  const sign = pct > 0 ? "+" : pct < 0 ? "−" : "";
  return `${signed ? sign : ""}${formatted}${NBSP}%`;
}

/** Signed compact NOK delta, e.g. "+96K", "−1,2M". */
export function formatSignedCompact(n: number): string {
  if (n === 0) return "0";
  const sign = n > 0 ? "+" : "−";
  return `${sign}${formatCompactShort(Math.abs(n))}`;
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} ${hrs === 1 ? "hour" : "hours"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Intl.DateTimeFormat("nb-NO", { dateStyle: "medium" }).format(ts);
}

export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(ts);
}

/** Format a YYYY-MM-DD snapshot date as "25. jun." */
export function formatDateShort(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" }).format(d);
}

/** Format a YYYY-MM-DD snapshot date as "25. juni 2026". */
export function formatDateLong(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat("nb-NO", { dateStyle: "long" }).format(d);
}
