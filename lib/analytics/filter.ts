import type { Article, CategoryScope } from "@/types/domain";

/** Filter articles by the active category scope. */
export function filterByScope(articles: Article[], scope: CategoryScope): Article[] {
  if (scope === "all") return articles;
  return articles.filter((a) => a.category === scope);
}

export const SCOPE_OPTIONS: { value: CategoryScope; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "Smartphone", label: "Mobil" },
  { value: "Tablet", label: "Nettbrett" },
  { value: "Smartwatch", label: "Klokker" },
  { value: "Other", label: "Tilbehør" },
];

/** Articles in play (old or becoming old), sorted by focus score. */
export function focusArticles(articles: Article[]): Article[] {
  return articles
    .filter((a) => a.isOld || a.isBecoming)
    .sort(
      (a, b) =>
        b.focusScore - a.focusScore ||
        b.weightedExposure - a.weightedExposure
    );
}
