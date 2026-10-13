"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Calendar as CalendarIcon, X } from "lucide-react";

export interface OrderCounts {
  total: number;
  pending: number;
  processing: number;
  completed: number; // Delivered
  cancelled: number;
}

export interface OrderSummaryCardsProps {
  counts: OrderCounts;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  startDate?: string;
  endDate?: string;
  onDateChange?: (start: string, end: string) => void;
}

export default function OrderSummaryCards({
  counts,
  searchQuery = "",
  onSearchChange,
  startDate = "",
  endDate = "",
  onDateChange,
}: OrderSummaryCardsProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateLabel = () => {
    if (startDate && endDate) {
      return `${startDate} - ${endDate}`;
    }
    if (startDate) {
      return `From ${startDate}`;
    }
    if (endDate) {
      return `Until ${endDate}`;
    }
    return "Select date or range";
  };

  return (
    <div className="w-full space-y-4">
      {/* Top search & interactive date range picker */}
      <div className="flex items-center justify-end gap-2.5">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search"
            aria-label="Search orders"
            className="w-full h-9 rounded-lg bg-[#121212] border border-white/10 pl-9 pr-3 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-white/20 focus:bg-[#161616]"
          />
        </div>

        <div className="relative" ref={calendarRef}>
          <button
            type="button"
            onClick={() => setIsCalendarOpen((prev) => !prev)}
            className={`flex items-center gap-2 h-9 px-3.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${startDate || endDate
                ? "bg-white/10 border-white/25 text-white"
                : "bg-[#121212] border-white/10 text-white/80 hover:border-white/20"
              }`}
          >
            <CalendarIcon className="h-3.5 w-3.5 text-white/40" />
            <span>{formatDateLabel()}</span>
            {(startDate || endDate) && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onDateChange?.("", "");
                }}
                className="hover:text-red-400 p-0.5 rounded-full"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>

          {isCalendarOpen && (
            <div className="absolute right-0 mt-2 p-3 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-40 w-72 space-y-3">
              <div className="text-xs font-semibold text-white/80">Select Date / Range</div>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-white/50 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onDateChange?.(e.target.value, endDate)}
                    className="w-full h-8 rounded-md bg-[#0a0a0a] border border-white/10 px-2.5 text-xs text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/50 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onDateChange?.(startDate, e.target.value)}
                    className="w-full h-8 rounded-md bg-[#0a0a0a] border border-white/10 px-2.5 text-xs text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    onDateChange?.("", "");
                    setIsCalendarOpen(false);
                  }}
                  className="text-[11px] text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  className="px-3 py-1 rounded bg-[#640C0C] hover:bg-[#7a1010] text-[11px] font-semibold text-white transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics line-only section: Total orders, Pending orders, Completed, Cancelled */}
      <div className="pt-2 pb-3 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Total orders</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.total}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Total order last 365 days</span>
          </div>

          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Pending orders</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.pending}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Pending order last 365 days</span>
          </div>

          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Completed</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.completed}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Completed order last 365 days</span>
          </div>

          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Cancelled</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.cancelled}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Canceled order last 365 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}