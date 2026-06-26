import type { Article } from "@/types/domain";

/** Keep only articles whose department is not hidden (empty hidden = show all). */
export function filterByDepartments(articles: Article[], hidden: string[]): Article[] {
  if (hidden.length === 0) return articles;
  const hiddenSet = new Set(hidden);
  return articles.filter((a) => !hiddenSet.has(a.department));
}

/** Articles in play (old or becoming old), sorted by focus score. */
export function focusArticles(articles: Article[]): Article[] {
  return articles
    .filter((a) => a.isOld || a.isBecoming)
    .sort(
      (a, b) =>
        b.focusScore - a.focusScore || b.weightedExposure - a.weightedExposure
    );
}
