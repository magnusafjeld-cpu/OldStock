"use client";

import { AppShell } from "@/components/layout/app-shell";
import { FocusView } from "@/components/focus/focus-view";

export default function FocusPage() {
  return (
    <AppShell title="Fokus" subtitle="Hva som må selges i dag — er og blir old stock">
      <FocusView />
    </AppShell>
  );
}
