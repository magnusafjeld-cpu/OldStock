"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Cockpit } from "@/components/dashboard/cockpit";
import { useWorkspace } from "@/providers/workspace-provider";
import { formatDateLong } from "@/lib/format";

export default function DashboardPage() {
  const { activeSnapshot } = useWorkspace();
  return (
    <AppShell
      title="Oversikt"
      subtitle={
        activeSnapshot
          ? `${activeSnapshot.store} · ${activeSnapshot.articleCategory} · ${formatDateLong(activeSnapshot.date)}`
          : undefined
      }
    >
      <Cockpit />
    </AppShell>
  );
}
