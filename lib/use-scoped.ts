"use client";

import { useMemo } from "react";
import { useWorkspace } from "@/providers/workspace-provider";
import { computeAggregates } from "@/lib/analytics/analyze";
import { filterByScope, focusArticles } from "@/lib/analytics/filter";
import type { Aggregates, Article, Snapshot } from "@/types/domain";

export interface ScopedData {
  store: string;
  date: string;
  snapshot: Snapshot;
  /** All articles within the active category scope. */
  articles: Article[];
  /** Articles in play (old or becoming), sorted by focus score. */
  focus: Article[];
  /** Aggregates recomputed for the scoped slice. */
  aggregates: Aggregates;
}

/** The active snapshot's articles filtered by the global category scope. */
export function useScoped(): ScopedData | null {
  const { activeSnapshot, categoryScope } = useWorkspace();

  return useMemo(() => {
    if (!activeSnapshot) return null;
    const articles = filterByScope(activeSnapshot.articles, categoryScope);
    return {
      store: activeSnapshot.store,
      date: activeSnapshot.date,
      snapshot: activeSnapshot,
      articles,
      focus: focusArticles(articles),
      aggregates: computeAggregates(articles),
    };
  }, [activeSnapshot, categoryScope]);
}
