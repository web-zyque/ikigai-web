"use client";

import React from "react";
import { Menu } from "lucide-react";

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

      {/* Empty div to maintain spacing or just remove entirely. We can just keep an empty div or nothing if we want. Wait, the header is flex justify-between. If we remove the right side, the left side stays on the left. So we don't need anything here. */ }
    </header>
  );
}
