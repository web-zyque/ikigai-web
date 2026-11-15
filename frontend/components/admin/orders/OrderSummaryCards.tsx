"use client";

import React from "react";

export interface OrderCounts {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

export interface OrderSummaryCardsProps {
  counts: OrderCounts;
  selectedStatus?: string;
  onStatusClick?: (status: string) => void;
}

export default function OrderSummaryCards({
  counts,
  selectedStatus = "All",
  onStatusClick,
}: OrderSummaryCardsProps) {
  return (
    <div className="w-full space-y-4">
      <div className="pt-2 pb-3 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div
            onClick={() => onStatusClick?.("All")}
            className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4 cursor-pointer group"
          >
            <span className={`text-xs sm:text-sm font-medium transition-colors ${selectedStatus === "All" ? "text-white font-semibold" : "text-white/70 group-hover:text-white"}`}>
              Total orders
            </span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.total}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Total customer orders</span>
          </div>

          <div
            onClick={() => onStatusClick?.("CONFIRMED")}
            className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4 cursor-pointer group"
          >
            <span className={`text-xs sm:text-sm font-medium transition-colors ${selectedStatus === "CONFIRMED" ? "text-white font-semibold" : "text-white/70 group-hover:text-white"}`}>
              Confirmed
            </span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.confirmed}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Confirmed orders</span>
          </div>

          <div
            onClick={() => onStatusClick?.("PENDING")}
            className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4 cursor-pointer group"
          >
            <span className={`text-xs sm:text-sm font-medium transition-colors ${selectedStatus === "PENDING" ? "text-white font-semibold" : "text-white/70 group-hover:text-white"}`}>
              Pending
            </span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.pending}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Awaiting confirmation</span>
          </div>

          <div
            onClick={() => onStatusClick?.("CANCELLED")}
            className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4 cursor-pointer group"
          >
            <span className={`text-xs sm:text-sm font-medium transition-colors ${selectedStatus === "CANCELLED" ? "text-white font-semibold" : "text-white/70 group-hover:text-white"}`}>
              Cancelled
            </span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.cancelled}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Cancelled orders</span>
          </div>
        </div>
      </div>
    </div>
  );
}
