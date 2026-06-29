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
 * Suggests a *possible* measure (Norwegian) and quantifies the upside. The tool
 * never prescribes a concrete discount (e.g. a fixed percentage) — it surfaces
 * options such as price reduction or clearance and leaves the call to the team.
 */
export function recommendAction(input: RecommendInput): Recommendation {
  const { status, tier, obsoleteNow, totalChange, change1m, qty, inCampaign, flags } = input;
  const units = qty > 0 ? `${qty} stk` : "beholdningen";

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

  // BECOMING old stock — act before the write-down lands.
  if (status === "becoming") {
    const horizon = change1m > totalChange * 0.45 ? "innen 1 mnd" : "innen 3 mnd";
    return {
      type: "prisned",
      label: "Prisreduksjon",
      detail: `Selges før det blir old stock. Mulig tiltak: reduksjon i pris eller utsalg av ${units} for å unngå ~${formatCompactShort(
        totalChange
      )} NOK i avskrivning ${horizon}.`,
      estImpact: totalChange,
    };
  }

  // Demo / used that is already old → clearance channel.
  if (flags.demo || flags.used) {
    return {
      type: "selg",
      label: "Utsalg",
      detail: `Mulig tiltak: selg ut ${units} via outlet før verdien faller videre.`,
      estImpact: obsoleteNow + Math.max(0, totalChange),
    };
  }

  // OLD (and possibly worsening).
  const worsening = status === "both";
  return {
    type: "prisned",
    label: "Prisreduksjon",
    detail: worsening
      ? `Allerede old stock og øker. Mulig tiltak: reduksjon i pris eller utsalg av ${units} for å frigjøre ~${formatCompactShort(
          obsoleteNow + totalChange
        )} NOK.`
      : `Allerede old stock. Mulig tiltak: reduksjon i pris eller utsalg av ${units} for å frigjøre ~${formatCompactShort(
          obsoleteNow
        )} NOK bunden kapital.`,
    estImpact: obsoleteNow + Math.max(0, totalChange),
  };
}
