"use client";

import type { Article } from "@/types/domain";
import { ProductThumb } from "./product-thumb";
import { RiskChip, StatusChip, WorkflowChip, Tag } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/bars";
import { Sparkline } from "@/components/charts/sparkline";
import { formatNumber } from "@/lib/format";
import { CATEGORY_COLOR, CATEGORY_LABEL, TIER_COLOR } from "@/lib/ui-tokens";
import { useWorkspace } from "@/providers/workspace-provider";
import { useToast } from "@/components/ui/toast";

export function ProductDetail({ article, store }: { article: Article; store: string }) {
  const { getWorkflow, setWorkflow } = useWorkspace();
  const toast = useToast();
  const status = getWorkflow(store, article.key);
  const tierColor = TIER_COLOR[article.riskTier];

  const trajectory = [
    { label: "I går", value: article.obsoleteNow },
    { label: "+1 mnd", value: article.forecast1m },
    { label: "+2 mnd", value: article.forecast2m },
    { label: "+3 mnd", value: article.forecast3m },
  ];

  return (
    <div className="flex min-h-full flex-col">
      {/* header */}
      <div className="border-b border-hairline-subtle p-s6 pr-s12">
        <div className="flex items-start gap-s4">
          <ProductThumb category={article.category} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-s2">
              <StatusChip status={article.status} />
              <RiskChip tier={article.riskTier} showWindow />
              <WorkflowChip status={status} />
            </div>
            <h2 className="mt-s2 text-h2 leading-tight text-ink-primary">{article.article}</h2>
            <div className="mt-s2 flex flex-wrap items-center gap-x-s2 gap-y-1 text-label text-ink-tertiary">
              <span className="inline-flex items-center gap-1" style={{ color: CATEGORY_COLOR[article.category] }}>
                ● {CATEGORY_LABEL[article.category]}
              </span>
              <span>·</span>
              <span>{article.brand}</span>
              {article.inCampaign && <Tag tone="info">I kampanje</Tag>}
              {article.flags.demo && <Tag>Demo</Tag>}
              {article.flags.used && <Tag>Brukt</Tag>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-s6 p-s6">
        {/* money metrics */}
        <div className="grid grid-cols-2 gap-s3">
          <DetailMetric label="Old stock nå (avskrevet)" value={`${formatNumber(article.obsoleteNow)} NOK`} loud color={article.obsoleteNow > 0 ? tierColor : "#14253B"} />
          <DetailMetric label="Antall på lager" value={formatNumber(article.qty)} />
          <DetailMetric label="Blir old stock (3 mnd)" value={`${article.totalChange > 0 ? "+" : ""}${formatNumber(article.totalChange)} NOK`} color="#E5800B" />
          <DetailMetric label="Estimert effekt ved tiltak" value={`${formatNumber(article.recommendation.estImpact)} NOK`} color="#15924C" />
        </div>

        {/* focus score */}
        <div className="rounded-card border border-hairline-subtle bg-surface-2/60 p-s5">
          <div className="mb-s3 flex items-center justify-between">
            <h3 className="text-h3 text-ink-primary">Fokusscore</h3>
            <span className="tnum text-h3" style={{ color: tierColor }}>{article.focusScore}</span>
          </div>
          <ProgressBar value={article.focusScore} color={tierColor} />
          <p className="mt-s3 text-label text-ink-secondary">
            <span className="text-brand-green">→ </span>
            {explain(article)}
          </p>
        </div>

        {/* forecast trajectory */}
        <div className="rounded-card border border-hairline-subtle bg-surface-2/60 p-s5">
          <div className="mb-s4 flex items-center justify-between">
            <h3 className="text-h3 text-ink-primary">Avskrivningsbane (3 mnd)</h3>
            <Sparkline
              points={trajectory.map((t) => t.value)}
              color={article.totalChange > 0 ? "#E5484D" : "#15924C"}
              width={104}
              height={32}
            />
          </div>
          <div className="space-y-s2">
            {trajectory.map((t) => (
              <div key={t.label} className="flex items-center justify-between text-label">
                <span className="text-ink-secondary">{t.label}</span>
                <span className="tnum text-ink-primary">{formatNumber(t.value)} NOK</span>
              </div>
            ))}
          </div>
        </div>

        {/* recommendation */}
        <div className="rounded-card border border-brand-green/25 bg-brand-green-soft/70 p-s5">
          <div className="overline mb-s2" style={{ color: "#15924C" }}>
            Anbefalt tiltak
          </div>
          <div className="text-h3 text-ink-primary">{article.recommendation.label}</div>
          <p className="mt-1 text-label text-ink-secondary">{article.recommendation.detail}</p>
          <div className="mt-s4 flex flex-wrap gap-s2">
            <Button size="md" variant="primary" onClick={() => { setWorkflow(store, article.key, "In progress"); toast(`${article.recommendation.label} startet`); }}>
              Start tiltak
            </Button>
            <Button size="md" variant="ghost" onClick={() => { setWorkflow(store, article.key, "Done"); toast("Markert som ferdig", "info"); }}>
              Ferdig
            </Button>
            <Button size="md" variant="subtle" onClick={() => { setWorkflow(store, article.key, "Open"); toast("Tilbakestilt", "info"); }}>
              Tilbakestill
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function explain(a: Article): string {
  if (a.status === "becoming")
    return `Ikke old stock ennå, men ${formatNumber(a.totalChange)} NOK blir avskrevet de neste 3 månedene hvis varen ikke selges.`;
  if (a.status === "both")
    return `Allerede old stock og øker. ${formatNumber(a.obsoleteNow)} NOK avskrevet nå, og +${formatNumber(a.totalChange)} NOK på vei.`;
  if (a.status === "old")
    return `Allerede old stock. ${formatNumber(a.obsoleteNow)} NOK avskrevet og bundet i lager.`;
  return "Ikke old stock og ingen avskrivning ventet.";
}

function DetailMetric({ label, value, loud, color }: { label: string; value: string; loud?: boolean; color?: string }) {
  return (
    <div className="rounded-md border border-hairline-subtle bg-surface-1 p-s4">
      <div className="overline !text-[10px]">{label}</div>
      <div className={`tnum mt-s2 font-bold ${loud ? "text-[24px]" : "text-[18px]"}`} style={{ color: color || "#14253B" }}>
        {value}
      </div>
    </div>
  );
}
