"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ChartBarStacked,
  ShoppingCart,
  UserCheck,
  BarChart3,
  Settings,
  X,
  PanelLeftClose,
  PanelLeftOpen,
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
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  items?: NavItem[];
  profile?: AdminProfile;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { label: "Products", icon: Package, href: "/admin/products" },
  { label: "Categories", icon: ChartBarStacked, href: "/admin/categories" },
  { label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { label: "Staff", icon: UserCheck, href: "/admin/staff" },
  { label: "Reports", icon: BarChart3, href: "/admin/reports" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

const DEFAULT_PROFILE: AdminProfile = {
  name: "Admin User",
  role: "Parts & Fitment Mgr",
  initials: "AU",
};

export default function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  items = DEFAULT_NAV_ITEMS,
  profile = DEFAULT_PROFILE,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 lg:hidden"
        />
      )}

      <aside
        aria-label="Admin Sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-white/5 bg-black transition-[width,transform] duration-300 ease-in-out will-change-[width] overflow-hidden lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
          } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="w-64 flex flex-col h-full select-none">
          {/* Header */}
          <div className="flex h-20 items-center border-b border-white/5 px-4 justify-between">
            {isCollapsed ? (
              <div className="w-11 flex items-center justify-center">
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label="Expand sidebar"
                  title="Expand sidebar"
                  className="hidden lg:grid h-9 w-9 place-items-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 transition-opacity hover:opacity-90 overflow-hidden"
                >
                  <Image
                    src="/images/logo.png"
                    alt="IKIGAI"
                    width={32}
                    height={32}
                    className="h-8 w-8 shrink-0 object-contain"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
                      IKIGAI
                    </span>
                    <span className="text-[10px] font-medium tracking-widest text-white/40 uppercase whitespace-nowrap">
                      Admin Panel
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className="hidden lg:grid h-9 w-9 place-items-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer shrink-0 ml-auto"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation sidebar"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-[#640C0C] hover:text-white transition-colors lg:hidden shrink-0 ml-auto"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-3.5 py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <p
              className={`px-3 text-xs font-semibold uppercase tracking-widest text-white/40 mb-3 transition-opacity duration-200 ${isCollapsed ? "opacity-0" : "opacity-100"
                }`}
            >
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

                const content = (
                  <>
                    <div
                      className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl transition-all duration-200 ${isCollapsed
                          ? isActive
                            ? "bg-white/[0.08] text-white"
                            : "text-white/60 group-hover:bg-white/[0.04] group-hover:text-white"
                          : ""
                        }`}
                    >
                      <Icon
                        className={`h-4 w-4 transition-colors ${isActive
                            ? "text-[#640C0C]"
                            : "text-white/40 group-hover:text-white/80"
                          }`}
                      />
                    </div>
                    <span
                      className={`text-sm whitespace-nowrap pl-2.5 transition-opacity duration-200 ${isCollapsed ? "opacity-0" : "opacity-100"
                        }`}
                    >
                      {item.label}
                    </span>
                  </>
                );

                const expandedClasses = isActive
                  ? "bg-white/[0.08] text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]";

                const navItemClass = `group flex items-center h-11 rounded-xl transition-colors cursor-pointer ${isCollapsed ? "" : expandedClasses
                  }`;

                return item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : undefined}
                    className={navItemClass}
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={item.label}
                    title={isCollapsed ? item.label : undefined}
                    className={navItemClass}
                  >
                    {content}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Admin Profile */}
          <div className="border-t border-white/5 p-3.5 flex items-center">
            <div className="w-11 h-11 shrink-0 flex items-center justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#640C0C] border border-white/20 text-xs font-bold text-white shadow-md">
                {profile.initials}
              </div>
            </div>
            <div
              className={`flex flex-col min-w-0 pl-2.5 transition-opacity duration-200 ${isCollapsed ? "opacity-0" : "opacity-100"
                }`}
            >
              <span className="text-sm font-medium text-white truncate whitespace-nowrap">
                {profile.name}
              </span>
              <span className="text-xs text-white/40 truncate whitespace-nowrap">
                {profile.role}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
