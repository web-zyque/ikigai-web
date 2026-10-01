"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  Car,
  X,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: React.ElementType;
  active?: boolean;
  href?: string;
}

export interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  items?: NavItem[];
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Products & Inventory", icon: Package, href: "/admin/inventory" },
  { label: "Orders", icon: ShoppingCart },
  { label: "Customers", icon: Users },
  { label: "Staff", icon: UserCheck },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

export default function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
  items = DEFAULT_NAV_ITEMS,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      <aside
        aria-label="Admin Sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-800/80 bg-[#0d0f12] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-neutral-800/80 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/15 text-red-500 ring-1 ring-red-500/30">
              <Car className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-wider text-white">
                REDLINE AUTO
              </span>
              <span className="text-xs font-medium text-neutral-400">
                Accessories & Gear
              </span>
            </div>
          </div>

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800/60 hover:text-white lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1.5 px-3 py-5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.active !== undefined
                ? item.active
                : item.href
                ? item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)
                : false;

            if (isActive) {
              const activeClass =
                "group flex items-center gap-3 rounded-lg border-l-2 border-red-500 bg-red-950/20 px-3.5 py-2.5 text-sm font-medium text-white transition-colors";

              return item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current="page"
                  onClick={onCloseMobile}
                  className={activeClass}
                >
                  <Icon className="h-4 w-4 text-red-500" />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <div key={item.label} aria-current="page" className={activeClass}>
                  <Icon className="h-4 w-4 text-red-500" />
                  <span>{item.label}</span>
                </div>
              );
            }

            const inactiveClass =
              "group flex cursor-pointer items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-neutral-200";

            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={onCloseMobile}
                className={inactiveClass}
              >
                <Icon className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-300" />
                <span>{item.label}</span>
              </Link>
            ) : (
              <div
                key={item.label}
                className="group flex cursor-default items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-neutral-200"
              >
                <Icon className="h-4 w-4 text-neutral-500 transition-colors group-hover:text-neutral-300" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* System Status Indicator (Clean & Minimal) */}
        <div className="border-t border-neutral-800/80 p-4">
          <div className="flex items-center gap-2 rounded-lg bg-neutral-900/60 px-3 py-2 text-xs text-neutral-400 border border-neutral-800/60">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="font-medium text-neutral-300">Admin Portal Active</span>
          </div>
        </div>
      </aside>
    </>
  );
}
