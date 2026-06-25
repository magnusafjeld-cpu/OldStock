"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MovementView } from "@/components/movement/movement-view";

export default function MovementPage() {
  return (
    <AppShell
      title="Bevegelse"
      subtitle="Daglig bevegelse i avskrevet verdi og reduksjon over tid"
      showScope={false}
    >
      <MovementView />
    </AppShell>
  );
}
