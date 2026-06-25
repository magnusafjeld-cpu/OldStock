"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface Column<T> {
  key: string;
  header: string;
  /** CSS grid track, e.g. "minmax(0,1fr)" or "120px". */
  width: string;
  align?: "left" | "right" | "center";
  sortValue?: (row: T) => number | string;
  render: (row: T) => React.ReactNode;
}

type SortDir = "asc" | "desc";

/**
 * Dense data table built on CSS grid (spec §05). Sticky sortable header,
 * right-aligned numerics, full-row hover, optional per-row risk tint, and
 * row → slide-over via onRowClick.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  rowTint,
  initialSortKey,
  initialSortDir = "desc",
  maxBodyHeight,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  rowTint?: (row: T) => string | undefined;
  initialSortKey?: string;
  initialSortDir?: SortDir;
  maxBodyHeight?: number;
}) {
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortDir, setSortDir] = useState<SortDir>(initialSortDir);

  const template = columns.map((c) => c.width).join(" ") + (onRowClick ? " 28px" : "");

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = col.sortValue!(a);
      const vb = col.sortValue!(b);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }, [rows, sortKey, sortDir, columns]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="overflow-hidden rounded-card border border-hairline-subtle bg-surface-1">
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* header */}
          <div
            className="sticky top-0 z-10 grid items-center border-b border-hairline bg-sunken/95 backdrop-blur"
            style={{ gridTemplateColumns: template, height: 44 }}
          >
            {columns.map((col) => {
              const sortable = !!col.sortValue;
              const active = sortKey === col.key;
              return (
                <button
                  key={col.key}
                  disabled={!sortable}
                  onClick={() => sortable && toggleSort(col.key)}
                  className={cn(
                    "flex h-full items-center gap-1 px-[18px] text-[11px] font-semibold uppercase tracking-[0.08em]",
                    col.align === "right" && "justify-end",
                    col.align === "center" && "justify-center",
                    active ? "text-brand-green" : "text-ink-tertiary",
                    sortable && "transition-colors hover:text-ink-secondary"
                  )}
                  style={{ fontFamily: "var(--font-jetbrains), monospace" }}
                >
                  {col.header}
                  {sortable && active && (
                    sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                  )}
                </button>
              );
            })}
            {onRowClick && <div />}
          </div>

          {/* body */}
          <div
            style={maxBodyHeight ? { maxHeight: maxBodyHeight, overflowY: "auto" } : undefined}
          >
            {sorted.map((row) => {
              const tint = rowTint?.(row);
              return (
                <div
                  key={getRowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "group grid items-center border-b border-hairline-subtle transition-colors duration-150 last:border-0",
                    onRowClick && "cursor-pointer hover:bg-surface-2"
                  )}
                  style={{
                    gridTemplateColumns: template,
                    minHeight: 54,
                    backgroundColor: tint,
                  }}
                >
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className={cn(
                        "px-[18px] py-s2 text-body text-ink-secondary",
                        col.align === "right" && "text-right tnum",
                        col.align === "center" && "text-center"
                      )}
                    >
                      {col.render(row)}
                    </div>
                  ))}
                  {onRowClick && (
                    <div className="flex justify-center pr-s2 text-ink-disabled transition-colors group-hover:text-ink-secondary">
                      <ChevronRight size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
