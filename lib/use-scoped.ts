"use client";

import { useMemo } from "react";
import { useWorkspace } from "@/providers/workspace-provider";
import { computeAggregates } from "@/lib/analytics/analyze";
import { filterByDepartments, focusArticles } from "@/lib/analytics/filter";
import type { Aggregates, Article, Snapshot } from "@/types/domain";

export interface ScopedData {
  store: string;
  date: string;
  snapshot: Snapshot;
  /** Articles within the selected departments. */
  articles: Article[];
  /** Articles in play (old or becoming), sorted by focus score. */
  focus: Article[];
  /** Aggregates recomputed for the scoped slice. */
  aggregates: Aggregates;
}

/** The active snapshot's articles filtered by the selected departments. */
export function useScoped(): ScopedData | null {
  const { activeSnapshot, hiddenDepartments } = useWorkspace();

  return useMemo(() => {
    if (!activeSnapshot) return null;
    const articles = filterByDepartments(activeSnapshot.articles, hiddenDepartments);
    return {
      store: activeSnapshot.store,
      date: activeSnapshot.date,
      snapshot: activeSnapshot,
      articles,
      focus: focusArticles(articles),
      aggregates: computeAggregates(articles),
    };
  }, [activeSnapshot, hiddenDepartments]);
}
