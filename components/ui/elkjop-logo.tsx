/**
 * Elkjøp brand mark — the green "wing" (chevron) only, without the wordmark.
 * Rendered as a forward-pointing chevron in Elkjøp green.
 */
export function ElkjopWing({
  className,
  color = "#00C257",
  title = "Elkjøp",
}: {
  className?: string;
  color?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 7 H25 L40 24 L25 41 H11 L26 24 Z"
        fill={color}
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
