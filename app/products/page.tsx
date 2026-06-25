"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ProductsView } from "@/components/products/products-view";

export default function ProductsPage() {
  return (
    <AppShell title="Produkter" subtitle="Alle Telecom-varer med antall, avskrevet verdi og prognose">
      <Suspense fallback={<div className="h-[400px] skeleton rounded-card" />}>
        <ProductsView />
      </Suspense>
    </AppShell>
  );
}
