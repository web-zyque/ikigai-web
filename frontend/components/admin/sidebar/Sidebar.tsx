"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
export interface AdminProfile {
  name: string;
  role: string;
  initials: string;
}

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
  profile?: AdminProfile;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Products", icon: Package, href: "/admin/products" },
  { label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { label: "Customers", icon: Users },
  { label: "Staff", icon: UserCheck },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const DEFAULT_PROFILE: AdminProfile = {
  name: "Admin User",
  role: "Parts & Fitment Mgr",
  initials: "AU",
};

export default function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
  items = DEFAULT_NAV_ITEMS,
  profile = DEFAULT_PROFILE,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity lg:hidden"
        />
      )}

      <aside
        aria-label="Admin Sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-black transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/5 px-6">
          <Link
            href="/admin"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <Image
              src="/images/logo.png"
              alt="IKIGAI"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white">
                IKIGAI
              </span>
              <span className="text-[10px] font-medium tracking-widest text-white/40 uppercase">
                Admin Panel
              </span>
            </div>
          </Link>

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation sidebar"
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-[#640C0C] hover:text-white transition-colors lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-white/40">
            Navigation
          </p>
          <nav className="space-y-1.5">
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
                  "group flex items-center gap-3 rounded-r-xl border-l-2 border-[#640C0C] bg-white/[0.04] px-3.5 py-2.5 text-sm font-semibold text-white transition-colors";

                return item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current="page"
                    onClick={onCloseMobile}
                    className={activeClass}
                  >
                    <Icon className="h-4 w-4 text-[#640C0C]" />
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <div key={item.label} aria-current="page" className={activeClass}>
                    <Icon className="h-4 w-4 text-[#640C0C]" />
                    <span>{item.label}</span>
                  </div>
                );
              }

              const inactiveClass =
                "group flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-normal text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white";

              return item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={inactiveClass}
                >
                  <Icon className="h-4 w-4 text-white/40 transition-colors group-hover:text-white/80" />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <div key={item.label} className={inactiveClass}>
                  <Icon className="h-4 w-4 text-white/40 transition-colors group-hover:text-white/80" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Admin Profile & System Status Indicator */}
        <div className="border-t border-white/5 p-4 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#640C0C] border border-white/20 text-xs font-bold text-white shadow-md">
              {profile.initials}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">
                {profile.name}
              </span>
              <span className="text-xs text-white/40 truncate">
                {profile.role}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
