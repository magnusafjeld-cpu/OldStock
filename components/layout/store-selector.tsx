"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Store as StoreIcon } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/cn";

export function StoreSelector() {
  const { stores, snapshots, activeStore, setActiveStore } = useWorkspace();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const latestByStore = useMemo(() => {
    const map = new Map<string, { date: string; count: number }>();
    for (const s of snapshots) {
      const cur = map.get(s.store);
      map.set(s.store, {
        date: cur && cur.date > s.date ? cur.date : s.date,
        count: (cur?.count ?? 0) + 1,
      });
    }
    return map;
  }, [snapshots]);

  if (!activeStore) return null;
  const active = latestByStore.get(activeStore);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-[38px] items-center gap-s2 rounded-md border border-hairline-subtle bg-surface-1 px-s3 text-label text-ink-primary transition-colors hover:border-hairline-strong"
      >
        <StoreIcon size={16} className="text-brand-green" />
        <span className="max-w-[160px] truncate font-medium">{activeStore}</span>
        {active && (
          <span className="tnum text-[11px] text-ink-tertiary">{formatDateShort(active.date)}</span>
        )}
        {stores.length > 1 && <ChevronDown size={15} className="text-ink-tertiary" />}
      </button>

      {open && stores.length > 1 && (
        <div className="absolute right-0 z-30 mt-1 w-[280px] overflow-hidden rounded-md border border-hairline bg-surface-1 shadow-e3">
          <div className="overline px-s3 pb-1 pt-s3">Butikker</div>
          <ul className="max-h-[320px] overflow-y-auto pb-s2">
            {stores.map((store) => {
              const meta = latestByStore.get(store);
              const isActive = store === activeStore;
              return (
                <li key={store}>
                  <button
                    onClick={() => {
                      setActiveStore(store);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-s2 px-s3 py-s2 text-left transition-colors hover:bg-surface-2",
                      isActive && "bg-surface-2"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-label font-medium text-ink-primary">{store}</div>
                      <div className="tnum text-[11px] text-ink-tertiary">
                        {meta?.count} opplastinger · sist {meta && formatDateShort(meta.date)}
                      </div>
                    </div>
                    {isActive && <Check size={15} className="shrink-0 text-brand-green" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
