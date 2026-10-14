"use client";

import React from "react";

export interface StaffCounts {
  total: number;
  active: number;
  inactive: number;
  managers: number;
}

export interface StaffSummaryCardsProps {
  counts: StaffCounts;
}

export default function StaffSummaryCards({ counts }: StaffSummaryCardsProps) {
  return (
    <div className="w-full space-y-4">
      <div className="pt-2 pb-3 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Total staff</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.total}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Registered team members</span>
          </div>

          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Active members</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.active}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Active working accounts</span>
          </div>

          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Inactive</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.inactive}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Deactivated or on leave</span>
          </div>

          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Management</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.managers}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Managers &amp; Supervisors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
