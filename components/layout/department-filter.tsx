"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Layers } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { departmentColor, departmentLabel } from "@/lib/ui-tokens";
import { cn } from "@/lib/cn";

/** Multi-select department (avdeling) filter. Several can be active at once. */
export function DepartmentFilter() {
  const { departments, hiddenDepartments, toggleDepartment, showAllDepartments } = useWorkspace();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (departments.length <= 1) return null;

  const hidden = new Set(hiddenDepartments);
  const visibleCount = departments.filter((d) => !hidden.has(d)).length;
  const allVisible = visibleCount === departments.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-[38px] items-center gap-s2 rounded-md border border-hairline-subtle bg-surface-1 px-s3 text-label text-ink-primary transition-colors hover:border-hairline-strong"
      >
        <Layers size={15} className="text-ink-tertiary" />
        <span className="font-medium">Avdelinger</span>
        <span
          className={cn(
            "rounded-full px-[7px] py-px text-[11px]",
            allVisible ? "bg-surface-3 text-ink-tertiary" : "bg-brand-green/15 text-brand-green"
          )}
        >
          {allVisible ? "Alle" : `${visibleCount}/${departments.length}`}
        </span>
        <ChevronDown size={15} className="text-ink-tertiary" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-[260px] overflow-hidden rounded-md border border-hairline bg-surface-1 shadow-e3">
          <div className="flex items-center justify-between px-s3 pb-1 pt-s3">
            <span className="overline">Vis avdelinger</span>
            {!allVisible && (
              <button onClick={showAllDepartments} className="text-[11px] text-brand-green hover:brightness-110">
                Velg alle
              </button>
            )}
          </div>
          <ul className="max-h-[340px] overflow-y-auto pb-s2">
            {departments.map((dept) => {
              const visible = !hidden.has(dept);
              const color = departmentColor(dept);
              return (
                <li key={dept}>
                  <button
                    onClick={() => toggleDepartment(dept)}
                    className="flex w-full items-center justify-between gap-s2 px-s3 py-s2 text-left transition-colors hover:bg-surface-2"
                  >
                    <span className="flex items-center gap-s2">
                      <span className="h-[10px] w-[10px] rounded-[3px]" style={{ backgroundColor: color }} />
                      <span className="text-label text-ink-primary">{departmentLabel(dept)}</span>
                    </span>
                    <span
                      className={cn(
                        "flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border",
                        visible ? "border-brand-green bg-brand-green text-white" : "border-hairline bg-surface-2"
                      )}
                    >
                      {visible && <Check size={13} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
