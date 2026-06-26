"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, UploadCloud } from "lucide-react";
import { StoreSelector } from "./store-selector";
import { DepartmentFilter } from "./department-filter";

/**
 * Page chrome: title + subtitle on the left, then store selector, the global
 * category scope filter, search and a re-upload entry on the right.
 */
export function Topbar({
  title,
  subtitle,
  showScope = true,
}: {
  title: string;
  subtitle?: string;
  showScope?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-20 border-b border-hairline-subtle bg-base/80 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-s4 px-s8 py-s5">
        <div className="min-w-0">
          <h1 className="text-h1 text-ink-primary">{title}</h1>
          {subtitle && <p className="mt-1 text-label text-ink-secondary">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-s3">
          {showScope && <DepartmentFilter />}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
            }}
            className="relative hidden md:block"
          >
            <Search
              size={15}
              className="pointer-events-none absolute left-s3 top-1/2 -translate-y-1/2 text-ink-tertiary"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Søk produkter…"
              className="h-[38px] w-[200px] rounded-md border border-hairline-subtle bg-surface-1 pl-9 pr-s3 text-label text-ink-primary placeholder:text-ink-tertiary focus:border-hairline-strong"
            />
          </form>

          <StoreSelector />

          <Link
            href="/upload"
            className="inline-flex h-[38px] items-center gap-s2 rounded-md bg-brand-green px-s4 text-label font-semibold text-white transition-all duration-150 hover:brightness-110 hover:shadow-glow-green"
          >
            <UploadCloud size={16} />
            Last opp
          </Link>
        </div>
      </div>
    </header>
  );
}
