"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { computeMovement } from "@/lib/analytics/movement";
import type { Snapshot } from "@/types/domain";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { LineChart } from "@/components/charts/line-chart";
import { SectionHeader, Takeaway } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  formatCompactValue,
  formatCompactShort,
  formatNumber,
  formatPct,
  formatSignedCompact,
  formatDateShort,
} from "@/lib/format";

export function MovementView() {
  const { activeHistory, activeSnapshot, previousSnapshot, weeklySnapshot, removeSnapshot } =
    useWorkspace();

  const vsPrev = useMemo(
    () => (previousSnapshot && activeSnapshot ? computeMovement(previousSnapshot, activeSnapshot) : null),
    [previousSnapshot, activeSnapshot]
  );
  const vsWeek = useMemo(
    () => (weeklySnapshot && activeSnapshot ? computeMovement(weeklySnapshot, activeSnapshot) : null),
    [weeklySnapshot, activeSnapshot]
  );

  const trend = useMemo(
    () => activeHistory.map((s) => ({ label: formatDateShort(s.date), value: s.aggregates.obsoleteNow })),
    [activeHistory]
  );

  // Per-snapshot table with day-over-day movement.
  const rows = useMemo(() => {
    return activeHistory
      .map((s, i) => {
        const prev = i > 0 ? activeHistory[i - 1] : null;
        const m = prev ? computeMovement(prev, s) : null;
        return { snapshot: s, delta: m?.delta ?? null, cleared: m?.cleared ?? null, newObs: m?.newObsolescence ?? null };
      })
      .reverse();
  }, [activeHistory]);

  if (!activeSnapshot) return null;
  const agg = activeSnapshot.aggregates;
  const obsoleteNow = formatCompactValue(agg.obsoleteNow);

  const weeklyReduction = vsWeek ? -vsWeek.delta : null; // positive = reduction

  const columns: Column<(typeof rows)[number]>[] = [
    { key: "date", header: "Dato", width: "minmax(110px,1fr)", sortValue: (r) => r.snapshot.date, render: (r) => <span className="font-medium text-ink-primary">{formatDateShort(r.snapshot.date)}</span> },
    { key: "obs", header: "Old stock", width: "120px", align: "right", sortValue: (r) => r.snapshot.aggregates.obsoleteNow, render: (r) => formatCompactShort(r.snapshot.aggregates.obsoleteNow) },
    { key: "delta", header: "Endring", width: "110px", align: "right", sortValue: (r) => r.delta ?? 0, render: (r) => r.delta === null ? "·" : <span style={{ color: r.delta > 0 ? "#E5484D" : r.delta < 0 ? "#15924C" : "#8A98AC" }}>{formatSignedCompact(r.delta)}</span> },
    { key: "cleared", header: "Jobbet ned", width: "110px", align: "right", sortValue: (r) => r.cleared ?? 0, render: (r) => r.cleared === null ? "·" : <span className="text-risk-healthy">{formatCompactShort(r.cleared)}</span> },
    { key: "new", header: "Ny avskrivning", width: "130px", align: "right", sortValue: (r) => r.newObs ?? 0, render: (r) => r.newObs === null ? "·" : <span className="text-risk-critical">{formatCompactShort(r.newObs)}</span> },
  ];

  return (
    <div className="space-y-s8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-s5 md:grid-cols-4">
        <KpiCard label="Old stock nå" value={agg.obsoleteNow} formatValue={(n) => formatCompactValue(n).value} unit={obsoleteNow.unit} deltaLabel={formatDateShort(activeSnapshot.date)} deltaTone="neutral" />
        <KpiCard
          label="Siden forrige opplasting"
          value={vsPrev ? Math.abs(vsPrev.delta) : 0}
          formatValue={(n) => (vsPrev ? `${vsPrev.delta > 0 ? "+" : vsPrev.delta < 0 ? "−" : ""}${formatCompactValue(n).value}` : "·")}
          unit={vsPrev ? formatCompactValue(Math.abs(vsPrev.delta)).unit : ""}
          deltaLabel={vsPrev ? `${formatPct(vsPrev.deltaPct)}` : "Trenger 2+ opplastinger"}
          deltaTone={!vsPrev ? "neutral" : vsPrev.delta > 0 ? "bad" : "good"}
        />
        <KpiCard
          label="Reduksjon denne uken"
          value={weeklyReduction !== null ? Math.max(0, weeklyReduction) : 0}
          formatValue={(n) => (weeklyReduction === null ? "·" : formatCompactValue(n).value)}
          unit={weeklyReduction !== null ? formatCompactValue(Math.max(0, weeklyReduction)).unit : ""}
          deltaLabel={vsWeek ? `siden ${formatDateShort(vsWeek.fromDate)}` : "Bygger historikk"}
          deltaTone="good"
          variant="opportunity"
        />
        <KpiCard
          label="Jobbet ned (sist)"
          value={vsPrev ? vsPrev.cleared : 0}
          formatValue={(n) => (vsPrev ? formatCompactValue(n).value : "·")}
          unit={vsPrev ? formatCompactValue(vsPrev.cleared).unit : ""}
          deltaLabel={vsPrev ? `ny avskrivning ${formatCompactShort(vsPrev.newObsolescence)}` : "·"}
          deltaTone="good"
        />
      </div>

      {/* trend */}
      <Card className="p-s6">
        <SectionHeader overline="Daglig bevegelse" title="Avskrevet verdi over tid" />
        {trend.length >= 2 ? (
          <>
            <LineChart data={trend} formatValue={(n) => `${formatNumber(n)} NOK`} color={vsPrev && vsPrev.delta <= 0 ? "#15924C" : "#E5484D"} height={240} />
            <Takeaway>
              {weeklyReduction !== null && weeklyReduction > 0
                ? `Old stock er redusert med ${formatCompactShort(weeklyReduction)} NOK denne perioden. Tiltakene virker.`
                : "Følg kurven daglig for å se om tiltakene gir reduksjon."}
            </Takeaway>
          </>
        ) : (
          <EmptyState
            title="Bygger historikk"
            description="Last opp en eksport hver dag. Etter andre opplasting vises daglig bevegelse og ukentlig reduksjon her."
          />
        )}
      </Card>

      {/* reduction breakdown */}
      {vsPrev && (
        <div className="grid grid-cols-1 gap-s5 lg:grid-cols-2">
          <Card className="p-s6">
            <SectionHeader overline="Siste periode" title="Hva drev bevegelsen" />
            <div className="space-y-s4">
              <BreakdownRow label="Jobbet ned (solgt / redusert)" value={vsPrev.cleared} color="#15924C" max={Math.max(vsPrev.cleared, vsPrev.newObsolescence, 1)} sign="−" />
              <BreakdownRow label="Ny avskrivning (aldret inn)" value={vsPrev.newObsolescence} color="#E5484D" max={Math.max(vsPrev.cleared, vsPrev.newObsolescence, 1)} sign="+" />
            </div>
            <Takeaway>
              Netto {formatSignedCompact(vsPrev.delta)} NOK fra {formatDateShort(vsPrev.fromDate)} til {formatDateShort(vsPrev.toDate)}.
            </Takeaway>
          </Card>

          <Card className="p-s6">
            <SectionHeader overline="Historikk" title="Opplastinger" />
            <DataTable columns={columns} rows={rows} getRowKey={(r) => r.snapshot.id} initialSortKey="date" maxBodyHeight={300} />
          </Card>
        </div>
      )}

      {/* manage snapshots */}
      <section>
        <SectionHeader overline="Arbeidsområde" title="Lagrede opplastinger" />
        <ul className="space-y-s2">
          {[...activeHistory].reverse().map((s: Snapshot) => (
            <li key={s.id} className="flex items-center justify-between gap-s3 rounded-md border border-hairline-subtle bg-surface-1 px-s4 py-s3">
              <div className="min-w-0">
                <div className="truncate text-label font-medium text-ink-primary">{formatDateShort(s.date)} · {s.store}</div>
                <div className="tnum text-[11px] text-ink-tertiary">{s.fileName} · {formatNumber(s.rowCount)} rader · {formatCompactShort(s.aggregates.obsoleteNow)} NOK old stock</div>
              </div>
              <Button size="sm" variant="danger" onClick={() => removeSnapshot(s.id)}>
                <Trash2 size={14} /> Slett
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function BreakdownRow({ label, value, color, max, sign }: { label: string; value: number; color: string; max: number; sign: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-label">
        <span className="text-ink-secondary">{label}</span>
        <span className="tnum font-medium" style={{ color }}>{sign}{formatCompactShort(value)} NOK</span>
      </div>
      <div className="h-[8px] w-full overflow-hidden rounded-pill bg-surface-3">
        <div className="h-full rounded-pill transition-all duration-500" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
