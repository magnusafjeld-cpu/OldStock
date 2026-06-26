import * as XLSX from "xlsx";
import type { RawArticleRow } from "@/types/domain";

export interface ParseResult {
  rows: RawArticleRow[];
  store: string;
  chain: string;
  currency: string;
  articleCategory: string;
  rowCount: number;
}

export class ParseError extends Error {}

interface ColumnTargets {
  articleCode: number;
  article: number;
  department: number;
  qty: number;
  obsoleteNow: number;
  forecast1m: number;
  forecast2m: number;
  forecast3m: number;
  campaign: number;
}

function norm(s: unknown): string {
  return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Coerce a spreadsheet cell to a finite number (handles "1 234,5" strings). */
function toNumber(v: unknown): number {
  if (typeof v === "number") return isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const cleaned = v.replace(/\s/g, "").replace(",", ".");
    const n = parseFloat(cleaned);
    return isFinite(n) ? n : 0;
  }
  return 0;
}

/** Coerce, returning null when the cell is genuinely empty (for forecast carry-forward). */
function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  return toNumber(v);
}

const HEADER_MATCHERS: Record<keyof ColumnTargets, (h: string) => boolean> = {
  articleCode: (h) => h.includes("article") && (h.includes("code") || h.includes("kode")),
  article: (h) => h === "article" || (h.includes("article") && !h.includes("code") && !h.includes("kode")),
  department: (h) => h === "category" || h === "department" || h === "avdeling",
  qty: (h) => h.includes("qty") || (h.includes("stock") && h.includes("yesterday")),
  obsoleteNow: (h) =>
    h.includes("value obsolete") || (h.includes("obsolete") && h.includes("yesterday")),
  forecast1m: (h) => h.includes("forecast") && /\b1\b/.test(h),
  forecast2m: (h) => h.includes("forecast") && /\b2\b/.test(h),
  forecast3m: (h) => h.includes("forecast") && /\b3\b/.test(h),
  campaign: (h) => h.includes("campaign"),
};

function detectColumns(headerRow: unknown[]): ColumnTargets {
  const normalized = headerRow.map(norm);
  const map = {} as ColumnTargets;
  (Object.keys(HEADER_MATCHERS) as (keyof ColumnTargets)[]).forEach((key) => {
    map[key] = normalized.findIndex((h) => HEADER_MATCHERS[key](h));
  });
  return map;
}

/**
 * Footer metadata ("Brukte filtre" block) — a single CRLF/LF-delimited cell.
 * Targeted by the unique "store name" wording so product names can't pollute it.
 */
function parseFooter(matrix: unknown[][]): {
  store: string;
  chain: string;
  currency: string;
  articleCategory: string;
} {
  const cell = matrix
    .flat()
    .map((c) => String(c ?? ""))
    .find((c) => /store\s*name/i.test(c) && /(filtre|filter|chain|category)/i.test(c));

  const text = cell ?? "";
  const term = "(?:\\r?\\n|$)";
  const grab = (key: string) =>
    new RegExp(`${key}\\s+(?:er|is|=|:)?\\s*(.+?)\\s*${term}`, "i").exec(text)?.[1]?.trim();

  const store = grab("store\\s*name");
  const chain = grab("chain");
  const articleCategory = grab("article category name") || grab("category");
  const currency = /currency\s+(?:er|is|=|:)?\s*([a-z]{2,4})/i.exec(text)?.[1]?.trim();

  return {
    store: store || "",
    chain: chain || "Elkjøp",
    currency: (currency || "LOC").toUpperCase(),
    articleCategory: articleCategory || "Telecom",
  };
}

const FALSY_CAMPAIGN = /^(nei|no|none|false|0|-)$/i;

export async function parseWorkbook(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buffer, { type: "array" });
  } catch {
    throw new ParseError("Kunne ikke lese filen. Last opp en gyldig .xlsx-eksport.");
  }

  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new ParseError("Arbeidsboken har ingen ark.");
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], {
    header: 1,
    blankrows: false,
    defval: null,
  });
  if (matrix.length < 2) throw new ParseError("Arket ser tomt ut.");

  let headerIdx = matrix.findIndex((r) => norm(r?.[0]).includes("article"));
  if (headerIdx === -1) headerIdx = 0;

  const col = detectColumns(matrix[headerIdx]);
  if (col.article === -1 || col.obsoleteNow === -1) {
    throw new ParseError(
      "Fant ikke forventede kolonner (Article, Value Obsolete Yesterday …). Er dette en obsolescence-eksport?"
    );
  }

  const meta = parseFooter(matrix);
  const rows: RawArticleRow[] = [];

  for (let i = headerIdx + 1; i < matrix.length; i++) {
    const r = matrix[i];
    const name = String(r?.[col.article] ?? "").trim();
    if (!name) continue;
    if (/^total$/i.test(name) || /^brukte filtre|^used filter|^sum$/i.test(name)) continue;

    const at = (idx: number) => (idx >= 0 ? toNumber(r?.[idx]) : 0);
    const obsoleteNow = at(col.obsoleteNow);
    const articleCode =
      col.articleCode >= 0 ? String(r?.[col.articleCode] ?? "").trim() : "";
    const department =
      (col.department >= 0 ? String(r?.[col.department] ?? "").trim() : "") ||
      meta.articleCategory ||
      "Ukjent";

    // Forecasts carry forward when a cell is blank (no further obsolescence).
    const f1raw = col.forecast1m >= 0 ? toNumberOrNull(r?.[col.forecast1m]) : null;
    const f2raw = col.forecast2m >= 0 ? toNumberOrNull(r?.[col.forecast2m]) : null;
    const f3raw = col.forecast3m >= 0 ? toNumberOrNull(r?.[col.forecast3m]) : null;
    const forecast1m = f1raw ?? obsoleteNow;
    const forecast2m = f2raw ?? forecast1m;
    const forecast3m = f3raw ?? forecast2m;

    // "In Future Campaign" carries either a flag or a campaign code — any
    // non-empty, non-negative value means the article is in a campaign.
    const campaignStr =
      col.campaign >= 0 ? String(r?.[col.campaign] ?? "").trim() : "";
    const inCampaign = campaignStr !== "" && !FALSY_CAMPAIGN.test(campaignStr);

    rows.push({
      article: name,
      articleCode,
      department,
      qty: at(col.qty),
      obsoleteNow,
      forecast1m,
      forecast2m,
      forecast3m,
      change1m: forecast1m - obsoleteNow,
      change2m: forecast2m - forecast1m,
      change3m: forecast3m - forecast2m,
      totalChange: forecast3m - obsoleteNow,
      inCampaign,
    });
  }

  if (rows.length === 0) throw new ParseError("Fant ingen produktrader i eksporten.");

  return {
    rows,
    // The footer carries a Store Name only for single-store exports; chain-wide
    // exports (all departments) have none, so fall back to the chain label.
    store: meta.store || "Elkjøp",
    chain: meta.chain,
    currency: meta.currency,
    articleCategory: meta.articleCategory,
    rowCount: rows.length,
  };
}
