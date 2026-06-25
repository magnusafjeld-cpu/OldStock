import type { Recommendation, RiskTier, StockStatus } from "@/types/domain";
import { formatCompactShort } from "@/lib/format";

interface RecommendInput {
  status: StockStatus;
  tier: RiskTier;
  obsoleteNow: number;
  totalChange: number;
  change1m: number;
  qty: number;
  inCampaign: boolean;
  flags: { outlet: boolean; demo: boolean; used: boolean };
}

/**
 * Recommends the next action (Norwegian) and quantifies the impact:
 *  - "becoming" → sell now to PREVENT a write-down (impact = future write-down).
 *  - "old/both" → clear to free tied-up capital (impact = obsolete + future).
 */
export function recommendAction(input: RecommendInput): Recommendation {
  const { status, tier, obsoleteNow, totalChange, change1m, qty, inCampaign, flags } = input;
  const units = qty > 0 ? `${qty} stk` : "varene";

  if (status === "healthy") {
    return { type: "ingen", label: "Ingen tiltak", detail: "Ikke old stock og ingen avskrivning ventet.", estImpact: 0 };
  }

  if (inCampaign) {
    return {
      type: "kampanje",
      label: "I kampanje",
      detail: "Inngår i kommende kampanje. Følg med, rydder seg trolig selv.",
      estImpact: totalChange,
    };
  }

  if (tier === "Watch") {
    return {
      type: "overvaak",
      label: "Overvåk",
      detail:
        status === "becoming"
          ? "Begynner å bli old stock. Hold under oppsyn ved neste opplasting."
          : "Lav eksponering. Hold på vaktlista.",
      estImpact: status === "becoming" ? totalChange : obsoleteNow,
    };
  }

  // BECOMING old stock — the highest-leverage case: sell before the write-down lands.
  if (status === "becoming") {
    const horizon = change1m > totalChange * 0.45 ? "innen 1 mnd" : "innen 3 mnd";
    return {
      type: "selg",
      label: "Selg nå",
      detail: `Selg ${units} nå og unngå avskrivning på ~${formatCompactShort(totalChange)} NOK ${horizon}.`,
      estImpact: totalChange,
    };
  }

  // Demo / used / outlet that is already old → liquidate.
  if (flags.demo || flags.used) {
    return {
      type: "selg",
      label: "Selg ut demo/brukt",
      detail: `Selg ut ${units} via outlet før verdien faller videre.`,
      estImpact: obsoleteNow + Math.max(0, totalChange),
    };
  }

  // OLD (and possibly worsening).
  const worsening = status === "both";
  return {
    type: "prisned",
    label: "Sett ned pris",
    detail: worsening
      ? `Allerede old stock og øker. Prioriter utsalg av ${units} for å frigjøre ~${formatCompactShort(
          obsoleteNow + totalChange
        )} NOK.`
      : `Sett ned pris / selg ut ${units} for å frigjøre ~${formatCompactShort(obsoleteNow)} NOK bunden kapital.`,
    estImpact: obsoleteNow + Math.max(0, totalChange),
  };
}
