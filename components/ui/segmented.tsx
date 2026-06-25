"use client";

import { cn } from "@/lib/cn";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

/** Segmented control used for the category scope filter. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-hairline-subtle bg-surface-1 p-1",
        size === "sm" ? "text-[12px]" : "text-label"
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-[7px] px-s3 py-[6px] font-medium transition-all duration-150 ease-out-soft",
              active
                ? "bg-surface-3 text-ink-primary shadow-e1"
                : "text-ink-tertiary hover:text-ink-secondary"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
