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
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive
                  ? "bg-[#640C0C] text-white shadow-md font-semibold"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-white/60"}`} />
              <span>{tab.label}</span>
            </button>

          );
        })}
        <button
          type="button"
          onClick={handleExport}
          className="ml-auto w-auto inline-flex items-center gap-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-medium text-white transition-all shadow-sm cursor-pointer hover:border-white/20 active:scale-98"
        >
          <FileDown className="h-3.5 w-3.5 text-white/80" />
          <span>Export PDF</span>
        </button>
      </div>
    </div>
  );
}
