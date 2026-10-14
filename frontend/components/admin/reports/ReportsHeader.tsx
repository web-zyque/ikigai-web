"use client";

import React from "react";
import { FileDown, TrendingUp, Package, ShoppingCart, DollarSign } from "lucide-react";
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
  onExportPDF,
  onExportCSV,
}: ReportsHeaderProps) {
  const tabs: { id: ReportTab; label: string; icon: React.ElementType }[] = [
    { id: "sales", label: "Sales Report", icon: TrendingUp },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "orders", label: "Orders Report", icon: ShoppingCart },
    { id: "revenue", label: "Revenue Summary", icon: DollarSign },
  ];

  const handleExport = onExportPDF || onExportCSV;

  return (
    <div className="grid grid-cols-1 gap-2 border-b border-white/5 pb-3 sm:flex sm:items-center sm:gap-2">
      <button
        type="button"
        onClick={handleExport}
        aria-label="Download report as PDF"
        className="inline-flex w-fit items-center justify-center gap-2 justify-self-end rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:border-white/20 hover:bg-white/10 sm:order-last sm:ml-auto"
      >
        <FileDown className="h-3.5 w-3.5 text-white/80" />
        <span>Export PDF</span>
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-pressed={isActive}
              className={`relative flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${isActive
                  ? "border-[#640C0C] bg-[#640C0C]/10 text-white"
                  : "border-transparent text-white/50 hover:border-transparent hover:bg-white/[0.03] hover:text-white/80"
                }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white" : "text-white/60"
                  }`}
              />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
