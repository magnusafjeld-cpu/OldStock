"use client";

import { useWorkspace } from "@/providers/workspace-provider";
import { Segmented } from "@/components/ui/segmented";
import { SCOPE_OPTIONS } from "@/lib/analytics/filter";

/** Global category-scope filter (the file is already Telecom-only). */
export function ScopeFilter() {
  const { categoryScope, setCategoryScope } = useWorkspace();
  return (
    <Segmented
      options={SCOPE_OPTIONS}
      value={categoryScope}
      onChange={(v) => setCategoryScope(v)}
      size="sm"
    />
  );
}
