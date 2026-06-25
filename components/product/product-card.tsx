"use client";

import { ArrowRight } from "lucide-react";
import type { Article } from "@/types/domain";
import { ProductThumb } from "./product-thumb";
import { RiskBadgeSolid, StatusChip, WorkflowChip, Tag } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { formatCompactShort, formatNumber } from "@/lib/format";
import { CATEGORY_LABEL } from "@/lib/ui-tokens";
import { useWorkspace } from "@/providers/workspace-provider";
import { useToast } from "@/components/ui/toast";

/**
 * A single SKU at a glance: status (er/blir old stock), money at stake, the
 * forecast, and the recommended action. Used in the focus queue and Fokus view.
 */
export function ProductCard({
  article,
  store,
  onOpen,
}: {
  article: Article;
  store: string;
  onOpen: (a: Article) => void;
}) {
  const { getWorkflow, setWorkflow } = useWorkspace();
  const toast = useToast();
  const status = getWorkflow(store, article.key);

  const apply = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflow(store, article.key, "In progress");
    toast(`${article.recommendation.label} startet · ${article.article.slice(0, 38)}`);
  };

  return (
    <div
      onClick={() => onOpen(article)}
      className="group cursor-pointer rounded-card border border-hairline-subtle bg-surface-1 p-s4 transition-all duration-150 ease-out-soft hover:-translate-y-px hover:border-hairline-strong hover:shadow-e2"
    >
      <div className="flex items-start gap-s4">
        <ProductThumb category={article.category} size={64} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-s3">
            <div className="min-w-0">
              <div className="truncate text-h3 text-ink-primary">{article.article}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-s2 gap-y-1 text-label text-ink-tertiary">
                <span>{CATEGORY_LABEL[article.category]}</span>
                <span>·</span>
                <span>{article.brand}</span>
                {article.inCampaign && <Tag tone="info">Kampanje</Tag>}
                {article.flags.demo && <Tag>Demo</Tag>}
                {article.flags.used && <Tag>Brukt</Tag>}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-s2">
              <RiskBadgeSolid tier={article.riskTier} score={article.focusScore} />
              <WorkflowChip status={status} />
            </div>
          </div>

          <div className="mt-s2">
            <StatusChip status={article.status} />
          </div>

          {/* metrics */}
          <div className="mt-s3 grid grid-cols-4 gap-s3 border-t border-hairline-subtle pt-s3">
            <Metric label="Old stock nå" value={formatCompactShort(article.obsoleteNow)} loud tone={article.obsoleteNow > 0 ? "bad" : "neutral"} />
            <Metric label="Blir old stock" value={article.totalChange > 0 ? `+${formatCompactShort(article.totalChange)}` : "—"} tone={article.totalChange > 0 ? "warn" : "neutral"} />
            <Metric label="Antall" value={article.qty > 0 ? formatNumber(article.qty) : "—"} />
            <Metric label="Prognose 3 mnd" value={formatCompactShort(article.forecast3m)} />
          </div>

          {/* recommendation */}
          {article.recommendation.type !== "ingen" && (
            <div className="mt-s3 rounded-md border border-brand-green/20 bg-brand-green-soft/70 px-s3 py-s2 text-label text-risk-healthy">
              {article.recommendation.detail}
            </div>
          )}

          {/* actions */}
          <div className="mt-s3 flex items-center gap-s2">
            {article.recommendation.type !== "ingen" ? (
              <Button size="sm" variant="primary" onClick={apply}>
                {article.recommendation.label}
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={apply}>
                Følg med
              </Button>
            )}
            <Button
              size="sm"
              variant="subtle"
              onClick={(e) => {
                e.stopPropagation();
                setWorkflow(store, article.key, "Done");
                toast("Markert som ferdig", "info");
              }}
            >
              Ferdig
            </Button>
            <span className="ml-auto flex items-center gap-1 text-label text-ink-tertiary transition-colors group-hover:text-ink-secondary">
              Detaljer <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  loud,
  tone = "neutral",
}: {
  label: string;
  value: string;
  loud?: boolean;
  tone?: "bad" | "warn" | "neutral";
}) {
  const toneColor =
    tone === "bad" ? "text-risk-critical" : tone === "warn" ? "text-risk-high" : "text-ink-primary";
  return (
    <div>
      <div className="overline !text-[10px]">{label}</div>
      <div className={`tnum mt-1 ${loud ? "text-[18px] font-bold" : "text-body font-medium"} ${toneColor}`}>
        {value}
      </div>
    </div>
  );
}
