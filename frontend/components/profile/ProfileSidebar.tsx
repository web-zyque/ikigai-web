"use client";

import React from "react";
import Link from "next/link";
import {
  User as UserIcon,
  ShoppingBag,
  RotateCcw,
  MapPin,
  ShoppingCart,
  KeyRound,
  LogOut,
} from "lucide-react";
import { TabKey } from "./profile.types";
import { User } from "@/types/auth.types";

interface ProfileSidebarProps {
  user: User | null | undefined;
  initials: string;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onLogoutClick: () => void;
  ordersCount: number;
  cartCount: number;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

const navMenuItems: NavItem[] = [
  { key: "profile", label: "My Profile", icon: UserIcon },
  { key: "orders", label: "My Orders", icon: ShoppingBag },
  { key: "returns", label: "Returns & Refund", icon: RotateCcw },
  { key: "addresses", label: "Address Book", icon: MapPin },
  { key: "cart", label: "My Cart", icon: ShoppingCart, href: "/cart" },
  { key: "security", label: "Change Password", icon: KeyRound },
];

export function ProfileSidebar({
  user,
  initials,
  activeTab,
  onTabChange,
  onLogoutClick,
  ordersCount,
  cartCount,
}: ProfileSidebarProps) {
  return (
    <aside className="lg:col-span-4 space-y-4">
      <div className="flex items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-[20px] bg-[#121212] border border-white/5">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#640C0C] border border-white/20 text-sm font-bold text-white shadow-md">
            <span>{initials}</span>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#121212]" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-white truncate">
              {user?.fullName || "Member"}
            </h2>
            <p className="text-[11px] font-mono text-white/50 truncate">
              {user?.phone || user?.email}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogoutClick}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium border border-red-500/20 shrink-0 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Logout</span>
        </button>
      </div>

      <nav className="lg:hidden flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-b border-white/10">
        {navMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          if (item.href) {
            return (
              <Link
                key={item.key}
                href={item.href}
                className="relative flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer border-transparent text-white/50 hover:border-transparent hover:bg-white/[0.03] hover:text-white/80"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-white/60" />
                <span>{item.label}</span>
                {item.key === "cart" && cartCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key as TabKey)}
              className={`relative flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border-[#640C0C] bg-[#640C0C]/10 text-white"
                  : "border-transparent text-white/50 hover:border-transparent hover:bg-white/[0.03] hover:text-white/80"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${
                  isActive ? "text-white" : "text-white/60"
                }`}
              />
              <span>{item.label}</span>
              {item.key === "orders" && ordersCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white font-bold"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {ordersCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <nav className="hidden lg:block rounded-[20px] bg-[#121212] border border-white/5 p-2.5 space-y-1">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2 pt-1">
          Account Navigation
        </p>

        {navMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          if (item.href) {
            return (
              <Link
                key={item.key}
                href={item.href}
                className="w-full group flex items-center justify-between h-11 px-3 rounded-xl transition-all cursor-pointer text-white/60 hover:text-white hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg transition-colors text-white/40 group-hover:text-white/80">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs sm:text-sm">{item.label}</span>
                </div>

                {item.key === "cart" && cartCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key as TabKey)}
              className={`w-full group flex items-center justify-between h-11 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "bg-white/[0.08] text-white font-semibold"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-white/40 group-hover:text-white/80"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs sm:text-sm">{item.label}</span>
              </div>

              {item.key === "orders" && ordersCount > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white font-bold"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {ordersCount}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onLogoutClick}
            className="w-full group flex items-center gap-3 h-11 px-3 rounded-xl text-xs sm:text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-red-400 group-hover:text-red-300">
              <LogOut className="h-4 w-4" />
            </div>
            <span>Log Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
