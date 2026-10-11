"use client";

import React from "react";
import { FileDown, Calendar, TrendingUp, Package, ShoppingCart, DollarSign } from "lucide-react";
import { DateFilterType, ReportTab } from "@/types/reports.types";

export interface ReportsHeaderProps {
  activeTab: ReportTab;
  onTabChange: (tab: ReportTab) => void;
  dateFilter: DateFilterType;
  onDateFilterChange: (filter: DateFilterType) => void;
  customStartDate: string;
  onCustomStartDateChange: (date: string) => void;
  customEndDate: string;
  onCustomEndDateChange: (date: string) => void;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
}

export default function ReportsHeader({
  activeTab,
  onTabChange,
  dateFilter,
  onDateFilterChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange,
  onExportPDF,
  onExportCSV,
}: ReportsHeaderProps) {
  const tabs: { id: ReportTab; label: string; icon: React.ElementType }[] = [
    { id: "sales", label: "Sales Report", icon: TrendingUp },
    { id: "inventory", label: "Products & Inventory", icon: Package },
    { id: "orders", label: "Orders Report", icon: ShoppingCart },
    { id: "revenue", label: "Revenue Summary", icon: DollarSign },
  ];

  const dateOptions: { id: DateFilterType; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "last7days", label: "Last 7 Days" },
    { id: "thisMonth", label: "This Month" },
    { id: "custom", label: "Custom Range" },
  ];

  const handleExport = onExportPDF || onExportCSV;

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="rounded-[20px] bg-[#121212] border border-white/5 p-6 sm:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Business Reports &amp; Analytics</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Performance metrics, sales trends, stock health, and revenue breakdown
          </p>
        </div>

        {/* Right: Date Filter & Export Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="inline-flex rounded-full border border-white/10 bg-[#0a0a0a] p-1 text-xs">
            {dateOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onDateFilterChange(opt.id)}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium whitespace-nowrap ${
                  dateFilter === opt.id
                    ? "bg-[#640C0C] text-white shadow-sm font-semibold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-medium text-white transition-all shadow-sm cursor-pointer hover:border-white/20 active:scale-98"
          >
            <FileDown className="h-3.5 w-3.5 text-white/80" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Custom Date Inputs if Custom Range is selected */}
      {dateFilter === "custom" && (
        <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-4 flex flex-wrap items-center gap-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Calendar className="h-4 w-4 text-[#640C0C]" />
            <span className="font-medium text-white/80">Select Custom Date Range:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <label htmlFor="start-date" className="text-white/40">From:</label>
              <input
                id="start-date"
                type="date"
                value={customStartDate}
                onChange={(e) => onCustomStartDateChange(e.target.value)}
                className="h-8 rounded-lg bg-white/5 border border-white/10 px-2.5 text-xs text-white focus:border-[#640C0C] focus:outline-none transition-colors [color-scheme:dark]"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <label htmlFor="end-date" className="text-white/40">To:</label>
              <input
                id="end-date"
                type="date"
                value={customEndDate}
                onChange={(e) => onCustomEndDateChange(e.target.value)}
                className="h-8 rounded-lg bg-white/5 border border-white/10 px-2.5 text-xs text-white focus:border-[#640C0C] focus:outline-none transition-colors [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tab Pills */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-[#640C0C] text-white shadow-md font-semibold"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-white/60"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
