"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Gauge,
  Target,
  TrendingDown,
  Smartphone,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ElkjopWing } from "@/components/ui/elkjop-logo";

const NAV = [
  { href: "/dashboard", label: "Oversikt", icon: Gauge },
  { href: "/focus", label: "Fokus", icon: Target },
  { href: "/movement", label: "Bevegelse", icon: TrendingDown },
  { href: "/products", label: "Produkter", icon: Smartphone },
];

// Bright accent green that reads well on the dark navy chrome.
const NAV_ACCENT = "#2BD46E";

export function NavRail() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("elkjop-nav-collapsed") === "1");
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      window.localStorage.setItem("elkjop-nav-collapsed", next ? "1" : "0");
      return next;
    });
  };

  return (
    <nav
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col bg-brand-navy text-white transition-[width] duration-200 ease-out-soft",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* brand */}
      <div className={cn("flex items-center gap-s3 px-s4 py-s5", collapsed && "justify-center px-0")}>
        <ElkjopWing className="h-8 w-8 shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-h3 leading-tight text-white">Old Stock</div>
            <div className="overline !text-[10px] !tracking-[0.1em] !text-white/45">Cockpit</div>
          </div>
        )}
      </div>

      <div className="mx-s4 h-px bg-white/10" />

      {/* nav items */}
      <ul className="flex flex-1 flex-col gap-1 px-s3 py-s4">
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-s3 rounded-md px-s3 py-[10px] text-label font-medium transition-colors duration-150",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={1.7}
                  style={active ? { color: NAV_ACCENT } : undefined}
                  className={active ? "" : "text-current"}
                />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && active && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: NAV_ACCENT }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mx-s4 h-px bg-white/10" />

      <button
        onClick={toggle}
        className={cn(
          "m-s3 flex items-center gap-s3 rounded-md px-s3 py-[10px] text-label text-white/55 transition-colors hover:bg-white/5 hover:text-white",
          collapsed && "justify-center px-0"
        )}
      >
        {collapsed ? <PanelLeftOpen size={20} strokeWidth={1.7} /> : <PanelLeftClose size={20} strokeWidth={1.7} />}
        {!collapsed && <span>Skjul</span>}
      </button>
    </nav>
  );
}
