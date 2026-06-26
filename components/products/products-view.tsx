"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Search } from "lucide-react";
import { useScoped } from "@/lib/use-scoped";
import type { Article } from "@/types/domain";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusChip, ScoreBadge, DepartmentTag } from "@/components/ui/badges";
import { CopyCode } from "@/components/ui/copy-code";
import { ProductThumb } from "@/components/product/product-thumb";
import { ProductDetailSlideOver } from "@/components/product/product-detail-slideover";
import { formatCompactShort, formatNumber } from "@/lib/format";

const MAX_ROWS = 400;

type StatusFilter = "play" | "old" | "becoming" | "all";

export function ProductsView() {
  const scoped = useScoped();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [statusF, setStatusF] = useState<StatusFilter>("play");
  const [selected, setSelected] = useState<Article | null>(null);

  const filtered = useMemo(() => {
    if (!scoped) return [];
    const q = query.trim().toLowerCase();
    return scoped.articles.filter((a) => {
      if (statusF === "play" && !a.isOld && !a.isBecoming) return false;
      if (statusF === "old" && !a.isOld) return false;
      if (statusF === "becoming" && !a.isBecoming) return false;
      if (
        q &&
        !a.article.toLowerCase().includes(q) &&
        !a.brand.toLowerCase().includes(q) &&
        !a.articleCode.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [scoped, query, statusF]);

  // Cap rendered rows for the large multi-department dataset (top by exposure).
  const total = filtered.length;
  const rows = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => b.obsoleteNow - a.obsoleteNow || b.totalChange - a.totalChange)
        .slice(0, MAX_ROWS),
    [filtered]
  );

  const columns: Column<Article>[] = useMemo(
    () => [
      {
        key: "article",
        header: "Produkt",
        width: "minmax(220px,2.4fr)",
        sortValue: (a) => a.article,
        render: (a) => (
          <div className="flex items-center gap-s3">
            <ProductThumb category={a.category} size={36} />
            <div className="min-w-0">
              <div className="truncate font-medium text-ink-primary">{a.article}</div>
              <div className="mt-[3px] flex flex-wrap items-center gap-s2">
                {a.articleCode && <CopyCode code={a.articleCode} size="xs" />}
                <DepartmentTag department={a.department} />
                {a.brand !== "Other" && <span className="text-[11px] text-ink-tertiary">{a.brand}</span>}
              </div>
            </div>
          </div>
        ),
      },
      { key: "status", header: "Status", width: "150px", sortValue: (a) => a.status, render: (a) => <StatusChip status={a.status} /> },
      { key: "qty", header: "Antall", width: "80px", align: "right", sortValue: (a) => a.qty, render: (a) => formatNumber(a.qty) },
      { key: "obs", header: "Old stock nå", width: "110px", align: "right", sortValue: (a) => a.obsoleteNow, render: (a) => <span className={a.obsoleteNow > 0 ? "font-semibold text-risk-critical" : "text-ink-tertiary"}>{a.obsoleteNow > 0 ? formatCompactShort(a.obsoleteNow) : "0"}</span> },
      { key: "becoming", header: "Blir old stock", width: "120px", align: "right", sortValue: (a) => a.totalChange, render: (a) => <span className={a.totalChange > 0 ? "text-risk-high" : "text-ink-tertiary"}>{a.totalChange > 0 ? `+${formatCompactShort(a.totalChange)}` : "0"}</span> },
      { key: "f3", header: "Prognose +3m", width: "110px", align: "right", sortValue: (a) => a.forecast3m, render: (a) => formatCompactShort(a.forecast3m) },
      { key: "score", header: "Fokus", width: "110px", align: "right", sortValue: (a) => a.focusScore, render: (a) => <ScoreBadge score={a.focusScore} /> },
    ],
    []
  );

  if (!scoped) return null;

  return (
    <div className="space-y-s5">
      <div className="flex flex-wrap items-center justify-between gap-s4">
        <div className="flex flex-wrap items-center gap-s4">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-s3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Søk produkt eller merke…"
              className="h-[38px] w-[260px] rounded-md border border-hairline-subtle bg-surface-1 pl-9 pr-s3 text-label text-ink-primary placeholder:text-ink-tertiary focus:border-hairline-strong"
            />
          </div>
          <Segmented
            size="sm"
            value={statusF}
            onChange={setStatusF}
            options={[
              { value: "play", label: "I spill" },
              { value: "old", label: "Er old stock" },
              { value: "becoming", label: "Blir old stock" },
              { value: "all", label: "Alle" },
            ]}
          />
        </div>
        <div className="flex items-center gap-s3">
          <span className="tnum text-label text-ink-tertiary">
            {total > MAX_ROWS ? `Viser ${MAX_ROWS} av ${formatNumber(total)}` : `${formatNumber(total)} produkter`}
          </span>
          <Button variant="ghost" size="sm" onClick={() => import("@/lib/export").then((m) => m.exportArticlesToCsv(filtered, `produkter-${scoped.store}.csv`))}>
            <Download size={15} /> Eksporter ({formatNumber(total)})
          </Button>
        </div>
      </div>

      {rows.length > 0 ? (
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(a) => a.id}
          initialSortKey="obs"
          onRowClick={setSelected}
          rowTint={(a) => (a.status === "both" ? "#FDECEC" : undefined)}
          maxBodyHeight={680}
        />
      ) : (
        <EmptyState tone={query ? "neutral" : "positive"} title={query ? "Ingen produkter matcher søket" : "Ingen produkter i utvalget"} description={query ? "Prøv et annet søk eller juster filtrene." : undefined} />
      )}

      <ProductDetailSlideOver article={selected} store={scoped.store} onClose={() => setSelected(null)} />
    </div>
  );
}
