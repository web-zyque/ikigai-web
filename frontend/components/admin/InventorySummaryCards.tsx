"use client";

import React from "react";

export type StockFilterType = "all" | "low_stock" | "stock_out";

export interface StockFilterCardItem {
  id: StockFilterType;
  title: string;
  count: number;
}

export interface InventorySummaryCardsProps {
  activeFilter?: StockFilterType;
  onFilterChange?: (filter: StockFilterType) => void;
  counts?: {
    all: number;
    lowStock: number;
    stockOut: number;
  };
}

export default function InventorySummaryCards({
  activeFilter = "all",
  onFilterChange,
  counts = { all: 0, lowStock: 0, stockOut: 0 },
}: InventorySummaryCardsProps) {
  const cards: StockFilterCardItem[] = [
    {
      id: "all",
      title: "ALL",
      count: counts.all,
    },
    {
      id: "low_stock",
      title: "LOW STOCK",
      count: counts.lowStock,
    },
    {
      id: "stock_out",
      title: "STOCK OUT",
      count: counts.stockOut,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 sm:gap-3 w-full sm:w-auto flex-nowrap">
      {cards.map((card) => {
        const isActive = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onFilterChange?.(card.id)}
            className={`group inline-flex items-center justify-center flex-1 sm:flex-initial gap-1.5 sm:gap-2.5 h-10 px-2 sm:px-4 rounded-xl border transition-all duration-150 cursor-pointer outline-none select-none min-w-0 ${
              isActive
                ? "bg-[#640C0C]/25 border-[#640C0C] ring-1 ring-[#640C0C]/50 shadow-sm shadow-[#640C0C]/30 text-white"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <span
              className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider transition-colors whitespace-nowrap truncate sm:overflow-visible ${
                isActive
                  ? "text-white"
                  : "text-white/60 group-hover:text-white/80"
              }`}
            >
              {card.title}
            </span>
            <span
              className={`text-xs sm:text-sm font-bold tracking-tight transition-colors shrink-0 ${
                isActive ? "text-white" : "text-white/90"
              }`}
            >
              {card.count}
            </span>
            {isActive && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#b82525] shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}
