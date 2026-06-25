import type { Article, Movement, Snapshot } from "@/types/domain";

/**
 * Movement between two daily snapshots. The obsolete value is matched per
 * article (by stable key), so we can separate value we actively cleared from
 * new obsolescence that aged in — and report the net reduction.
 *
 *   delta            = total obsolete now − before  (negative = reduksjon = bra)
 *   cleared          = Σ max(0, before − now)       (jobbet ned / solgt)
 *   newObsolescence  = Σ max(0, now − before)       (ny avskrivning)
 */
export function computeMovement(prev: Snapshot, curr: Snapshot): Movement {
  const prevByKey = new Map<string, number>();
  for (const a of prev.articles) {
    prevByKey.set(a.key, (prevByKey.get(a.key) ?? 0) + a.obsoleteNow);
  }
  const currByKey = new Map<string, number>();
  for (const a of curr.articles) {
    currByKey.set(a.key, (currByKey.get(a.key) ?? 0) + a.obsoleteNow);
  }

  let cleared = 0;
  let newObsolescence = 0;
  const keys = new Set<string>([...prevByKey.keys(), ...currByKey.keys()]);
  for (const k of keys) {
    const before = prevByKey.get(k) ?? 0;
    const now = currByKey.get(k) ?? 0;
    if (before > now) cleared += before - now;
    else newObsolescence += now - before;
  }

  const fromObsolete = prev.aggregates.obsoleteNow;
  const toObsolete = curr.aggregates.obsoleteNow;
  const delta = toObsolete - fromObsolete;
  const days = Math.max(1, Math.round((curr.uploadedAt - prev.uploadedAt) / 86_400_000));

  return {
    fromDate: prev.date,
    toDate: curr.date,
    fromObsolete,
    toObsolete,
    delta,
    deltaPct: fromObsolete > 0 ? (delta / fromObsolete) * 100 : null,
    cleared,
    newObsolescence,
    days,
  };
}

/** Articles whose obsolete value dropped since the previous snapshot (we cleared them). */
export function clearedArticles(prev: Snapshot, curr: Snapshot): Article[] {
  const prevByKey = new Map<string, number>();
  for (const a of prev.articles) prevByKey.set(a.key, a.obsoleteNow);
  return curr.articles
    .filter((a) => (prevByKey.get(a.key) ?? 0) > a.obsoleteNow)
    .sort((a, b) => (prevByKey.get(b.key)! - b.obsoleteNow) - (prevByKey.get(a.key)! - a.obsoleteNow));
}
