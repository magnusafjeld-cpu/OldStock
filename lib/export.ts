import type { Article } from "@/types/domain";
import { STATUS_LABEL, TIER_LABEL } from "@/lib/ui-tokens";

/** Serialize analyzed articles to CSV and trigger a local download. */
export function exportArticlesToCsv(articles: Article[], fileName: string): void {
  const headers = [
    "Artikkelkode",
    "Artikkel",
    "Kategori",
    "Merke",
    "Status",
    "Risiko",
    "Fokusscore",
    "Antall på lager",
    "Avskrevet verdi nå",
    "Prognose +1 mnd",
    "Prognose +2 mnd",
    "Prognose +3 mnd",
    "Total endring (3 mnd)",
    "I kampanje",
    "Anbefalt tiltak",
    "Estimert effekt (NOK)",
  ];

  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = articles.map((a) =>
    [
      a.articleCode,
      a.article,
      a.category,
      a.brand,
      STATUS_LABEL[a.status],
      TIER_LABEL[a.riskTier],
      a.focusScore,
      a.qty,
      Math.round(a.obsoleteNow),
      Math.round(a.forecast1m),
      Math.round(a.forecast2m),
      Math.round(a.forecast3m),
      Math.round(a.totalChange),
      a.inCampaign ? "Ja" : "Nei",
      a.recommendation.label,
      a.recommendation.estImpact,
    ]
      .map(escape)
      .join(",")
  );

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
