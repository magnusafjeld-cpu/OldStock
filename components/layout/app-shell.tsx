"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NavRail } from "./nav-rail";
import { Topbar } from "./topbar";
import { useWorkspace } from "@/providers/workspace-provider";

/**
 * Standard application chrome for the analytics sections. Redirects to the
 * upload gate when the workspace has no data yet.
 */
export function AppShell({
  title,
  subtitle,
  showScope = true,
  children,
}: {
  title: string;
  subtitle?: string;
  showScope?: boolean;
  children: React.ReactNode;
}) {
  const { hydrated, activeSnapshot } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !activeSnapshot) router.replace("/upload");
  }, [hydrated, activeSnapshot, router]);

  return (
    <div className="flex min-h-screen bg-base">
      <NavRail />
      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} showScope={showScope} />
        <div className="mx-auto w-full max-w-content flex-1 px-s8 py-s8">
          {!hydrated || !activeSnapshot ? <ShellLoading /> : children}
        </div>
      </main>
    </div>
  );
}

function ShellLoading() {
  return (
    <div className="grid grid-cols-2 gap-s5 sm:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-[140px] skeleton rounded-card" />
      ))}
    </div>
  );
}
