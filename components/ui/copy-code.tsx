"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Article code rendered as selectable mono text with a one-click copy button.
 * Shows brief "Kopiert" feedback. Stops click propagation so it can sit inside
 * clickable cards/rows without triggering them.
 */
export function CopyCode({
  code,
  className,
  size = "sm",
}: {
  code: string;
  className?: string;
  size?: "xs" | "sm";
}) {
  const [copied, setCopied] = useState(false);
  if (!code) return null;

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Fallback for environments without the async clipboard API.
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const text = size === "xs" ? "text-[11px]" : "text-[12px]";

  return (
    <button
      type="button"
      onClick={copy}
      title="Kopier artikkelkode"
      aria-label={`Kopier artikkelkode ${code}`}
      className={cn(
        "group/copy inline-flex items-center gap-[5px] rounded-[6px] border border-hairline-subtle bg-surface-2 px-[7px] py-[2px] font-mono tnum text-ink-secondary transition-colors hover:border-hairline-strong hover:text-ink-primary",
        text,
        className
      )}
    >
      <span>{code}</span>
      {copied ? (
        <Check size={size === "xs" ? 11 : 12} className="text-risk-healthy" />
      ) : (
        <Copy size={size === "xs" ? 11 : 12} className="text-ink-tertiary group-hover/copy:text-ink-secondary" />
      )}
    </button>
  );
}
