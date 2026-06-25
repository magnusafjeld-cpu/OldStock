"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

/**
 * Category split donut (spec §07). Flat fills, no 3D/gradients, hover tooltip,
 * center shows the focused slice or the total.
 */
export function DonutChart({
  data,
  formatValue,
  centerLabel = "Total",
}: {
  data: DonutSlice[];
  formatValue: (n: number) => string;
  centerLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const size = 180;
  const stroke = 26;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((d) => {
    const fraction = total > 0 ? d.value / total : 0;
    const seg = { ...d, fraction, dash: fraction * circumference, offset };
    offset += fraction * circumference;
    return seg;
  });

  const focused = hover !== null ? segments[hover] : null;

  return (
    <div className="flex flex-wrap items-center gap-s8">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EEF2F8"
            strokeWidth={stroke}
          />
          {segments.map((seg, i) => (
            <circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={-seg.offset}
              className="cursor-pointer transition-opacity duration-150"
              style={{ opacity: hover === null || hover === i ? 1 : 0.35 }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="overline">{focused ? focused.label : centerLabel}</span>
          <span className="tnum mt-1 text-h3 text-ink-primary">
            {formatValue(focused ? focused.value : total)}
          </span>
          {focused && (
            <span className="tnum text-label text-ink-secondary">
              {Math.round(focused.fraction * 100)}%
            </span>
          )}
        </div>
      </div>

      <ul className="flex flex-col gap-s2">
        {segments.map((seg, i) => (
          <li
            key={seg.label}
            className={cn(
              "flex cursor-pointer items-center gap-s2 rounded-md px-s2 py-1 transition-colors",
              hover === i && "bg-surface-2"
            )}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="h-[10px] w-[10px] rounded-[3px]" style={{ backgroundColor: seg.color }} />
            <span className="min-w-[64px] text-label text-ink-secondary">{seg.label}</span>
            <span className="tnum text-label font-medium text-ink-primary">
              {Math.round(seg.fraction * 100)}%
            </span>
            <span className="tnum text-label text-ink-tertiary">{formatValue(seg.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
