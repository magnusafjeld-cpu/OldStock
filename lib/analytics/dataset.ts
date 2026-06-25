import type { Snapshot } from "@/types/domain";
import { parseWorkbook } from "@/lib/parse/xlsx";
import { analyzeRows, computeAggregates } from "./analyze";

/** Local date as YYYY-MM-DD (the snapshot day). */
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Parse an uploaded Excel file into a fully analyzed dated daily snapshot. */
export async function buildSnapshotFromFile(file: File, date = today()): Promise<Snapshot> {
  const parsed = await parseWorkbook(file);
  const articles = analyzeRows(parsed.rows);
  const aggregates = computeAggregates(articles);

  return {
    id: `${parsed.store}__${date}`,
    store: parsed.store,
    chain: parsed.chain,
    currency: parsed.currency,
    articleCategory: parsed.articleCategory,
    fileName: file.name,
    date,
    uploadedAt: Date.now(),
    rowCount: parsed.rowCount,
    articles,
    aggregates,
  };
}
