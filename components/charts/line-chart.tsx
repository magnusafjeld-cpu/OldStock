"use client";

import { useState } from "react";

export interface LinePoint {
  label: string;
  value: number;
}

/**
 * Flat line chart with area fill (spec §07): subtle gridlines, hover tooltip.
 * Used for the daily obsolete-value trend and the 3-month forecast path.
 */
export function LineChart({
  data,
  formatValue,
  color = "#E5484D",
  height = 200,
  baselineZero = true,
}: {
  data: LinePoint[];
  formatValue: (n: number) => string;
  color?: string;
  height?: number;
  baselineZero?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 560;
  const pad = { left: 8, right: 8, top: 16, bottom: 26 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values);
  const min = baselineZero ? 0 : Math.min(...values);
  const range = max - min || 1;
  const n = data.length;

  const x = (i: number) => pad.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => pad.top + plotH - ((v - min) / range) * plotH;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.value)}`).join(" ");
  const areaPath =
    n > 1
      ? `${linePath} L${x(n - 1)},${pad.top + plotH} L${x(0)},${pad.top + plotH} Z`
      : "";
  const gradId = `area-${color.replace("#", "")}`;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={pad.left}
            x2={pad.left + plotW}
            y1={pad.top + t * plotH}
            y2={pad.top + t * plotH}
            stroke="#14253B"
            strokeOpacity={0.07}
          />
        ))}
        {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
        {n > 1 && <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(d.value)}
            r={hover === i ? 5 : 3.5}
            fill={color}
            stroke="#FFFFFF"
            strokeWidth={1.5}
            className="cursor-pointer"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        {data.map((d, i) => (
          <text
            key={`l${i}`}
            x={x(i)}
            y={height - 8}
            textAnchor={n > 1 && i === 0 ? "start" : n > 1 && i === n - 1 ? "end" : "middle"}
            className="fill-ink-tertiary"
            fontSize={11}
          >
            {d.label}
          </text>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border border-hairline bg-surface-1 px-s3 py-s2 text-center shadow-e2"
          style={{ left: `${(x(hover) / width) * 100}%`, top: `${(y(data[hover].value) / height) * 100}%` }}
        >
          <div className="overline">{data[hover].label}</div>
          <div className="tnum text-label font-semibold text-ink-primary">{formatValue(data[hover].value)}</div>
        </div>
      )}
    </div>
  );
}
