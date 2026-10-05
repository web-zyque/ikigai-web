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
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-white/5 bg-black/90 px-6 lg:px-12 backdrop-blur-md">
      {/* Left: Mobile hamburger + Dashboard Title & Date */}
      <div className="flex items-center gap-4">
        {onToggleMobile && (
          <button
            type="button"
            onClick={onToggleMobile}
            aria-label="Open navigation menu"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
          <p className="text-xs text-white/40">{date}</p>
        </div>
      </div>

      {/* Middle & Right: Search and Admin Profile */}
      <div className="flex items-center gap-6">
        {/* Search Input (Visual Only for now, backend-ready) */}
        <div className="relative hidden w-64 md:block lg:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            readOnly
            aria-label="Search dashboard"
            placeholder="Search orders, parts, customers..."
            className="w-full rounded-full border border-white/10 bg-[#121212] py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/40 focus:border-[#640C0C] focus:outline-none transition-colors"
          />
        </div>

        {/* Admin Profile Area */}
        <div className="flex items-center gap-3 border-l border-white/5 pl-4 lg:pl-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#640C0C] border border-white/20 text-xs font-bold text-white shadow-md">
            {profile.initials}
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-medium text-white">
              {profile.name}
            </span>
            <span className="text-xs text-white/40">
              {profile.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
