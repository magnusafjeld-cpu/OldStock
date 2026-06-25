"use client";

import { useState } from "react";

export interface MatrixPoint {
  id: string;
  label: string;
  /** Urgency 0–100 (x). */
  urgency: number;
  /** Value in NOK (y, log-scaled). */
  value: number;
  color: string;
}

/**
 * Value × urgency risk matrix (spec §07). The top-right "kill zone" is shaded;
 * dots are clickable → product detail.
 */
export function RiskMatrix({
  points,
  formatValue,
  onSelect,
  height = 260,
}: {
  points: MatrixPoint[];
  formatValue: (n: number) => string;
  onSelect?: (id: string) => void;
  height?: number;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const padding = { left: 16, right: 16, top: 16, bottom: 28 };
  const width = 520;
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const maxValue = Math.max(1, ...points.map((p) => p.value));
  const logMax = Math.log1p(maxValue);

  const xOf = (urgency: number) => padding.left + (urgency / 100) * plotW;
  const yOf = (value: number) =>
    padding.top + plotH - (Math.log1p(value) / logMax) * plotH;

  const hovered = points.find((p) => p.id === hover);

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* kill zone — top-right */}
        <rect
          x={padding.left + plotW * 0.55}
          y={padding.top}
          width={plotW * 0.45}
          height={plotH * 0.55}
          fill="#FF5C5C"
          opacity={0.08}
        />
        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={`h${t}`}
            x1={padding.left}
            x2={padding.left + plotW}
            y1={padding.top + t * plotH}
            y2={padding.top + t * plotH}
            stroke="#14253B"
            strokeOpacity={0.07}
          />
        ))}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={`v${t}`}
            y1={padding.top}
            y2={padding.top + plotH}
            x1={padding.left + t * plotW}
            x2={padding.left + t * plotW}
            stroke="#14253B"
            strokeOpacity={0.07}
          />
        ))}
        {/* points */}
        {points.map((p) => {
          const isHover = hover === p.id;
          return (
            <circle
              key={p.id}
              cx={xOf(p.urgency)}
              cy={yOf(p.value)}
              r={isHover ? 7 : 5}
              fill={p.color}
              fillOpacity={isHover ? 1 : 0.82}
              stroke={isHover ? "#14253B" : "transparent"}
              strokeWidth={1.5}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHover(p.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(p.id)}
            />
          );
        })}
      </svg>

      {/* axis labels */}
      <div className="pointer-events-none absolute bottom-1 right-2 text-[11px] text-ink-tertiary">
        Urgency →
      </div>
      <div className="pointer-events-none absolute left-1 top-1 text-[11px] text-ink-tertiary">
        ↑ Value
      </div>

      {hovered && (
        <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-md border border-hairline bg-surface-2 px-s3 py-s2 text-center shadow-e2">
          <div className="max-w-[260px] truncate text-label font-medium text-ink-primary">
            {hovered.label}
          </div>
          <div className="tnum text-[11px] text-ink-secondary">
            {formatValue(hovered.value)} · urgency {Math.round(hovered.urgency)}
          </div>
        </div>
      )}
    </div>
  );
}
