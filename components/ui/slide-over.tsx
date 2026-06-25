"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/** Right-anchored slide-over used for product and store detail (spec §05/§14/§15). */
export function SlideOver({
  open,
  onClose,
  children,
  width = "max-w-[680px]",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 animate-fade-in bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        className={cn(
          "relative h-full w-full animate-slide-in-right overflow-y-auto border-l border-hairline bg-surface-1 shadow-e3",
          width
        )}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-s4 top-s4 z-10 flex h-9 w-9 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-surface-3 hover:text-ink-primary"
        >
          <X size={18} />
        </button>
        {children}
      </aside>
    </div>
  );
}
