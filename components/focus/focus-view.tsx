"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useScoped } from "@/lib/use-scoped";
import { useWorkspace } from "@/providers/workspace-provider";
import type { Article, WorkflowStatus } from "@/types/domain";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section";
import { ProductCard } from "@/components/product/product-card";
import { ProductDetailSlideOver } from "@/components/product/product-detail-slideover";
import { formatCompactValue, formatNumber } from "@/lib/format";
import { exportArticlesToCsv } from "@/lib/export";

type StatusFilter = "all" | "old" | "becoming";
type FlowFilter = "all" | WorkflowStatus;

export function FocusView() {
  const scoped = useScoped();
  const { getWorkflow } = useWorkspace();
  const [selected, setSelected] = useState<Article | null>(null);
  const [statusF, setStatusF] = useState<StatusFilter>("all");
  const [flow, setFlow] = useState<FlowFilter>("all");

  const flowCounts = useMemo(() => {
    const counts = { Open: 0, "In progress": 0, Done: 0 } as Record<WorkflowStatus, number>;
    if (scoped) for (const a of scoped.focus) counts[getWorkflow(scoped.store, a.key)] += 1;
    return counts;
  }, [scoped, getWorkflow]);

  const filtered = useMemo(() => {
    if (!scoped) return [];
    return scoped.focus.filter((a) => {
      if (statusF === "old" && !a.isOld) return false;
      if (statusF === "becoming" && !a.isBecoming) return false;
      if (flow !== "all" && getWorkflow(scoped.store, a.key) !== flow) return false;
      return true;
    });
  }, [scoped, statusF, flow, getWorkflow]);

  if (!scoped) return null;
  const agg = scoped.aggregates;
  const obsoleteNow = formatCompactValue(agg.obsoleteNow);
  const becoming = formatCompactValue(agg.becoming);
  const preventable = formatCompactValue(agg.preventable);

  return (
    <div className="space-y-s8">
      {/* summary */}
      <div className="grid grid-cols-2 gap-s5 md:grid-cols-4">
        <KpiCard label="Er old stock" value={agg.obsoleteNow} formatValue={(n) => formatCompactValue(n).value} unit={obsoleteNow.unit} deltaLabel={`${agg.oldSkuCount} varer`} deltaTone="bad" />
        <KpiCard label="Blir old stock (3 mnd)" value={agg.becoming} formatValue={(n) => formatCompactValue(n).value} unit={becoming.unit} deltaLabel={`${agg.becomingSkuCount} varer på vei`} deltaTone="bad" />
        <KpiCard label="Forhindrbar" value={agg.preventable} formatValue={(n) => formatCompactValue(n).value} unit={preventable.unit} deltaLabel="hvis fokusvarer selges" deltaTone="good" variant="opportunity" />
        <KpiCard label="Pågår / ferdig" value={flowCounts["In progress"] + flowCounts.Done} formatValue={(n) => formatNumber(Math.round(n))} unit="varer" deltaLabel={`${flowCounts.Done} ferdig · ${flowCounts.Open} åpne`} deltaTone="neutral" />
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-s4">
        <div className="flex flex-wrap items-center gap-s4">
          <div>
            <div className="overline mb-s2">Status</div>
            <Segmented
              size="sm"
              value={statusF}
              onChange={setStatusF}
              options={[
                { value: "all", label: "Alle" },
                { value: "old", label: "Er old stock" },
                { value: "becoming", label: "Blir old stock" },
              ]}
            />
          </div>
          <div>
            <div className="overline mb-s2">Arbeidsflyt</div>
            <Segmented
              size="sm"
              value={flow}
              onChange={setFlow}
              options={[
                { value: "all", label: "Alle" },
                { value: "Open", label: "Åpen" },
                { value: "In progress", label: "Pågår" },
                { value: "Done", label: "Ferdig" },
              ]}
            />
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => exportArticlesToCsv(filtered, `fokus-${scoped.store}.csv`)}>
          <Download size={15} /> Eksporter
        </Button>
      </div>

      <SectionHeader overline="Fokuskø" title={`${filtered.length} ${filtered.length === 1 ? "vare" : "varer"}`} />

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-s4 2xl:grid-cols-2">
          {filtered.map((a) => (
            <ProductCard key={a.id} article={a} store={scoped.store} onOpen={setSelected} />
          ))}
        </div>
      ) : (
        <EmptyState tone="positive" title="Ingen varer matcher filtrene. Bra jobba!" description="Juster filtrene over, eller last opp etter neste lageruttrekk." />
      )}

      <ProductDetailSlideOver article={selected} store={scoped.store} onClose={() => setSelected(null)} />
    </div>
  );
}
