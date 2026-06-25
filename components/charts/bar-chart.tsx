"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface Bar {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
}

/**
 * Flat vertical bar chart (spec §07): 4px radius, subtle gridlines, hover
 * tooltip, animate-in. No 3D, no gradients.
 */
export function BarChart({
  data,
  formatValue,
  height = 180,
}: {
  data: Bar[];
  formatValue: (n: number) => string;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const gridLines = 4;

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ height }}>
        {/* gridlines */}
        {Array.from({ length: gridLines + 1 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-hairline-subtle"
            style={{ top: `${(i / gridLines) * 100}%` }}
          />
        ))}
        <div className="absolute inset-0 flex items-end justify-around gap-s4 px-s2">
          {data.map((bar, i) => {
            const h = (bar.value / max) * 100;
            return (
              <div
                key={bar.label}
                className="group relative flex h-full flex-1 flex-col items-center justify-end"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {hover === i && (
                  <div className="absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-md border border-hairline bg-surface-2 px-s3 py-s2 text-center shadow-e2">
                    <div className="overline">{bar.label}</div>
                    <div className="tnum text-label font-semibold text-ink-primary">
                      {formatValue(bar.value)}
                    </div>
                  </div>
                )}
                <div
                  className="w-full max-w-[64px] origin-bottom rounded-t-[4px] transition-all duration-150"
                  style={{
                    height: `${Math.max(h, 1.5)}%`,
                    backgroundColor: bar.color,
                    opacity: hover === null || hover === i ? 1 : 0.45,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-s3 flex justify-around gap-s4 px-s2">
        {data.map((bar) => (
          <div key={bar.label} className="flex-1 text-center">
            <div className="text-label text-ink-secondary">{bar.label}</div>
            {bar.sublabel && (
              <div className="tnum text-[11px] text-ink-tertiary">{bar.sublabel}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
