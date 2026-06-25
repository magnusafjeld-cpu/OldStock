"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/providers/workspace-provider";

export default function Home() {
  const router = useRouter();
  const { hydrated, activeSnapshot } = useWorkspace();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(activeSnapshot ? "/dashboard" : "/upload");
  }, [hydrated, activeSnapshot, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-base">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
    </div>
  );
}
