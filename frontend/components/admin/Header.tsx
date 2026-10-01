"use client";

import React from "react";
import { Search, Menu } from "lucide-react";

export interface AdminProfile {
  name: string;
  role: string;
  initials: string;
}

export interface HeaderProps {
  onToggleMobile?: () => void;
  title?: string;
  date?: string;
  profile?: AdminProfile;
}

const DEFAULT_PROFILE: AdminProfile = {
  name: "Admin User",
  role: "Parts & Fitment Mgr",
  initials: "AU",
};

export default function AdminHeader({
  onToggleMobile,
  title = "Dashboard",
  date = "Thursday, October 1, 2026",
  profile = DEFAULT_PROFILE,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-neutral-800/80 bg-[#0d0f12]/95 px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger + Dashboard Title & Date */}
      <div className="flex items-center gap-4">
        {onToggleMobile && (
          <button
            type="button"
            onClick={onToggleMobile}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
          <p className="text-xs font-medium text-neutral-400">{date}</p>
        </div>
      </div>

      {/* Middle & Right: Search and Admin Profile */}
      <div className="flex items-center gap-6">
        {/* Search Input (Visual Only for now, backend-ready) */}
        <div className="relative hidden w-64 md:block lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="search"
            readOnly
            aria-label="Search dashboard"
            placeholder="Search orders, parts, customers..."
            className="w-full rounded-lg border border-neutral-800 bg-[#121418] py-1.5 pl-9 pr-3 text-xs text-neutral-200 placeholder:text-neutral-500 focus:border-red-500/50 focus:outline-none"
          />
        </div>

        {/* Admin Profile Area */}
        <div className="flex items-center gap-3 border-l border-neutral-800 pl-4 lg:pl-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800 text-xs font-bold text-white shadow-[0_0_12px_rgba(220,38,38,0.35)] ring-1 ring-white/10">
            {profile.initials}
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-semibold text-neutral-100">
              {profile.name}
            </span>
            <span className="text-xs font-medium text-neutral-400">
              {profile.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
