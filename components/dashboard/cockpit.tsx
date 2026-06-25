"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useScoped } from "@/lib/use-scoped";
import { useWorkspace } from "@/providers/workspace-provider";
import { computeAggregates } from "@/lib/analytics/analyze";
import { filterByScope } from "@/lib/analytics/filter";
import type { Article, ProductCategory } from "@/types/domain";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card } from "@/components/ui/card";
import { SectionHeader, Takeaway } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { DonutChart } from "@/components/charts/donut-chart";
import { LineChart } from "@/components/charts/line-chart";
import { ProductCard } from "@/components/product/product-card";
import { ProductDetailSlideOver } from "@/components/product/product-detail-slideover";
import { ProgressBar } from "@/components/ui/bars";
import { formatCompactValue, formatCompactShort, formatNumber, formatPct } from "@/lib/format";
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  SPLIT_BECOMING_COLOR,
  SPLIT_OLD_COLOR,
} from "@/lib/ui-tokens";

const CATS: ProductCategory[] = ["Smartphone", "Tablet", "Smartwatch", "Other"];

export function Cockpit() {
  const scoped = useScoped();
  const { activeHistory, previousSnapshot, categoryScope } = useWorkspace();
  const [selected, setSelected] = useState<Article | null>(null);

  // Day-over-day movement of obsolete value (scoped, vs previous snapshot).
  const prevObsolete = useMemo(() => {
    if (!previousSnapshot) return null;
    return computeAggregates(filterByScope(previousSnapshot.articles, categoryScope)).obsoleteNow;
  }, [previousSnapshot, categoryScope]);

  // History line of obsolete value over snapshot dates (scoped).
  const trend = useMemo(
    () =>
      activeHistory.map((s) => ({
        label: s.date.slice(5),
        value: computeAggregates(filterByScope(s.articles, categoryScope)).obsoleteNow,
      })),
    [activeHistory, categoryScope]
  );

  const queue = useMemo(() => (scoped ? scoped.focus.slice(0, 6) : []), [scoped]);

  const categoryRows = useMemo(() => {
    if (!scoped) return [];
    return CATS.map((c) => scoped.aggregates.byCategory[c]).filter(
      (r) => r.obsoleteNow > 0 || r.becoming > 0
    );
  }, [scoped]);

  if (!scoped) return null;
  const agg = scoped.aggregates;

  const obsoleteNow = formatCompactValue(agg.obsoleteNow);
  const becoming = formatCompactValue(agg.becoming);
  const imminent = formatCompactValue(agg.imminent);
  const preventable = formatCompactValue(agg.preventable);

  const dod = prevObsolete !== null ? agg.obsoleteNow - prevObsolete : null;
  const dodPct = prevObsolete && prevObsolete > 0 ? (dod! / prevObsolete) * 100 : null;

  const trajectory = [
    { label: "I går", value: agg.obsoleteNow },
    { label: "+1 mnd", value: agg.forecast1m },
    { label: "+2 mnd", value: agg.forecast2m },
    { label: "+3 mnd", value: agg.forecast3m },
  ];

  const splitTotal = agg.obsoleteNow + agg.becoming;

  return (
    <div className="space-y-s10">
      {/* KPI cockpit */}
      <section>
        <div className="grid grid-cols-2 gap-s5 md:grid-cols-3 xl:grid-cols-5">
          <KpiCard
            label="Old stock nå"
            value={agg.obsoleteNow}
            formatValue={(n) => formatCompactValue(n).value}
            unit={obsoleteNow.unit}
            deltaLabel={
              dod === null
                ? "Last opp i morgen for å spore"
                : `${formatPct(dodPct)} vs forrige opplasting`
            }
            deltaTone={dod === null ? "neutral" : dod > 0 ? "bad" : dod < 0 ? "good" : "neutral"}
          />
          <KpiCard
            label="Blir old stock (3 mnd)"
            value={agg.becoming}
            formatValue={(n) => formatCompactValue(n).value}
            unit={becoming.unit}
            deltaLabel="kommende avskrivning"
            deltaTone="bad"
          />
          <KpiCard
            label="Haster (innen 1 mnd)"
            value={agg.imminent}
            formatValue={(n) => formatCompactValue(n).value}
            unit={imminent.unit}
            deltaLabel="selg før avskrivning"
            deltaTone="bad"
          />
          <KpiCard
            label="Antall på lager"
            value={agg.qtyOnStock}
            formatValue={(n) => formatNumber(Math.round(n))}
            unit="enheter"
            deltaLabel={`${agg.oldSkuCount + agg.becomingSkuCount} varer i spill`}
            deltaTone="neutral"
          />
          <KpiCard
            label="Forhindrbar avskrivning"
            value={agg.preventable}
            formatValue={(n) => formatCompactValue(n).value}
            unit={preventable.unit}
            deltaLabel="hvis fokusvarer selges"
            deltaTone="good"
            variant="opportunity"
          />
        </div>
      </section>

      {/* trajectory + daily movement */}
      <section className="grid grid-cols-1 gap-s5 lg:grid-cols-2">
        <Card className="p-s6">
          <SectionHeader overline="Prognose" title="Avskrivningsbane (3 måneder)" />
          <LineChart data={trajectory} formatValue={(n) => `${formatNumber(n)} NOK`} color="#E5484D" />
          <Takeaway>
            {formatCompactShort(agg.becoming)} NOK blir avskrevet de neste 3 månedene uten tiltak,{" "}
            hvorav {formatCompactShort(agg.imminent)} NOK allerede innen 1 måned.
          </Takeaway>
        </Card>

        <Card className="p-s6">
          <SectionHeader overline="Daglig bevegelse" title="Old stock-verdi over tid" />
          {trend.length >= 2 ? (
            <>
              <LineChart data={trend} formatValue={(n) => `${formatNumber(n)} NOK`} color={dod !== null && dod <= 0 ? "#15924C" : "#E5484D"} />
              <Takeaway>
                {dod === null || dod === 0
                  ? "Uendret siden forrige opplasting."
                  : dod < 0
                    ? `Old stock er redusert med ${formatCompactShort(Math.abs(dod))} NOK siden forrige opplasting. Riktig retning.`
                    : `Old stock har økt med ${formatCompactShort(dod)} NOK siden forrige opplasting. Vurder tiltak.`}
              </Takeaway>
            </>
          ) : (
            <EmptyState
              title="Bygger historikk"
              description="Last opp en eksport hver dag, så vises daglig bevegelse i avskrevet verdi her."
            />
          )}
        </Card>
      </section>

      {/* status split + category breakdown */}
      <section className="grid grid-cols-1 gap-s5 lg:grid-cols-2">
        <Card className="p-s6">
          <SectionHeader overline="Status" title="Er vs. blir old stock" />
          {splitTotal > 0 ? (
            <>
              <DonutChart
                centerLabel="Totalt"
                data={[
                  { label: "Er old stock", value: agg.obsoleteNow, color: SPLIT_OLD_COLOR },
                  { label: "Blir old stock", value: agg.becoming, color: SPLIT_BECOMING_COLOR },
                ]}
                formatValue={(n) => `${formatCompactShort(n)}`}
              />
              <Takeaway>
                {agg.oldSkuCount} varer er allerede old stock, {agg.becomingSkuCount} er på vei dit.
              </Takeaway>
            </>
          ) : (
            <EmptyState tone="positive" title="Ingen old stock i dette utvalget" />
          )}
        </Card>

        <Card className="p-s6">
          <SectionHeader overline="Kategori" title="Hvor ligger risikoen" />
          <div className="space-y-s4">
            {categoryRows.map((r) => {
              const total = r.obsoleteNow + r.becoming;
              const pct = splitTotal > 0 ? (total / (agg.obsoleteNow + agg.becoming)) * 100 : 0;
              return (
                <div key={r.category}>
                  <div className="mb-1 flex items-center justify-between text-label">
                    <span className="flex items-center gap-s2 text-ink-secondary">
                      <span className="h-[10px] w-[10px] rounded-[3px]" style={{ backgroundColor: CATEGORY_COLOR[r.category] }} />
                      {CATEGORY_LABEL[r.category]}
                    </span>
                    <span className="tnum text-ink-primary">{formatCompactShort(total)} NOK</span>
                  </div>
                  <ProgressBar value={pct} color={CATEGORY_COLOR[r.category]} />
                  <div className="tnum mt-1 text-[11px] text-ink-tertiary">
                    {formatCompactShort(r.obsoleteNow)} nå · +{formatCompactShort(r.becoming)} på vei · {r.skuCount} varer
                  </div>
                </div>
              );
            })}
            {categoryRows.length === 0 && <EmptyState tone="positive" title="Ingen old stock" />}
          </div>
        </Card>
      </section>

      {/* focus queue */}
      <section>
        <SectionHeader
          overline="Fokuskø"
          title="Jobb med disse i dag"
          action={
            <Link href="/focus" className="flex items-center gap-1 text-label text-brand-green hover:brightness-110">
              Åpne Fokus <ArrowRight size={14} />
            </Link>
          }
        />
        {queue.length > 0 ? (
          <div className="grid grid-cols-1 gap-s4 xl:grid-cols-2">
            {queue.map((a) => (
              <ProductCard key={a.id} article={a} store={scoped.store} onOpen={setSelected} />
            ))}
          </div>
        ) : (
          <EmptyState
            tone="positive"
            title="Ingen fokusvarer akkurat nå. Bra jobba!"
            description="Ingenting krysser tiltaksgrensen i dette utvalget. Last opp etter neste lageruttrekk for å ligge i forkant."
          />
        )}
      </section>

      <ProductDetailSlideOver article={selected} store={scoped.store} onClose={() => setSelected(null)} />
    </div>
  );
}
