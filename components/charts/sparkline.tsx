/**
 * Compact trend sparkline. The export gives three real points (Last Year →
 * Last Period → Current); we render those rather than inventing weekly data.
 */
export function Sparkline({
  points,
  color = "#8A98AC",
  width = 84,
  height = 28,
  variant = "line",
}: {
  points: number[];
  color?: string;
  width?: number;
  height?: number;
  variant?: "line" | "bars";
}) {
  const max = Math.max(1, ...points);
  const min = Math.min(0, ...points);
  const range = max - min || 1;
  const n = points.length;

  if (variant === "bars") {
    const gap = 4;
    const barW = (width - gap * (n - 1)) / n;
    return (
      <svg width={width} height={height} className="overflow-visible">
        {points.map((p, i) => {
          const h = ((p - min) / range) * height;
          return (
            <rect
              key={i}
              x={i * (barW + gap)}
              y={height - h}
              width={barW}
              height={Math.max(h, 1)}
              rx={2}
              fill={color}
              opacity={0.4 + (i / (n - 1)) * 0.6}
            />
          );
        })}
      </svg>
    );
  }

  const coords = points.map((p, i) => {
    const x = (i / (n - 1)) * width;
    const y = height - ((p - min) / range) * height;
    return [x, y] as const;
  });
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const [lx, ly] = coords[coords.length - 1];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={2.5} fill={color} />
    </svg>
  );
}
