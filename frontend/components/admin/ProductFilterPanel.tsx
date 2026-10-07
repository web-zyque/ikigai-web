"use client";

import React from "react";
import { Check, X, RotateCcw } from "lucide-react";

export const CATEGORY_OPTIONS = [
  "All Categories",
  "Lighting",
  "Fog Lamps",
  "Headlights",
  "Tail Lights",
  "Horns",
  "Seat Covers",
  "Car Perfumes",
  "Android Stereos",
  "Roof Light Bars",
  "Mirror Covers",
  "Exterior Accessories",
  "Other Accessories",
] as const;

export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

export interface FilterState {
  category: CategoryOption | string;
  stockStatus: "all" | "in_stock" | "low_stock" | "out_of_stock";
  minPrice: string;
  maxPrice: string;
}

interface ProductFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  totalProductsCount: number;
  filteredProductsCount: number;
}

export default function ProductFilterPanel({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  totalProductsCount,
  filteredProductsCount,
}: ProductFilterPanelProps) {
  if (!isOpen) return null;

  const hasActiveFilters =
    filters.category !== "All Categories" ||
    filters.stockStatus !== "all" ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice);

  const setCategory = (category: string) => {
    onFilterChange({ ...filters, category });
  };

  const setStockStatus = (stockStatus: FilterState["stockStatus"]) => {
    onFilterChange({ ...filters, stockStatus });
  };

  const setPriceRange = (min: string, max: string) => {
    onFilterChange({ ...filters, minPrice: min, maxPrice: max });
  };

  return (
    <div className="relative rounded-[20px] border border-white/10 bg-[#121212] p-5 sm:p-6 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#640C0C]" />
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">
            Filter Products
          </h3>
          <span className="text-xs text-white/40 ml-1">
            ({filteredProductsCount} of {totalProductsCount} matching)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 hover:bg-[#640C0C] hover:border-[#640C0C] hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear Filters</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filter panel"
            className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/60 hover:bg-[#640C0C] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Sections: Category List, Stock Status, Price Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Category Dropdown / List */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2.5">
            Category
          </label>
          <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-1.5 max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = filters.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-[#640C0C] text-white font-semibold shadow-sm"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Stock Status */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2.5">
            Stock Status
          </label>
          <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-1.5 space-y-1">
            {[
              { id: "all", label: "All Statuses" },
              { id: "in_stock", label: "In Stock" },
              { id: "low_stock", label: "Low Stock" },
              { id: "out_of_stock", label: "Out of Stock" },
            ].map((status) => {
              const isSelected = filters.stockStatus === status.id;
              return (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => setStockStatus(status.id as FilterState["stockStatus"])}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-[#640C0C] text-white font-semibold shadow-sm"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{status.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Price Range */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2.5">
            Price Range (₹)
          </label>
          <div className="rounded-xl border border-white/5 bg-[#0a0a0a] p-3.5 space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-white/40 block mb-1">Min Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) =>
                    onFilterChange({ ...filters, minPrice: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-[#640C0C] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/40 block mb-1">Max Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="15000"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    onFilterChange({ ...filters, maxPrice: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-[#640C0C] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Quick Price Presets */}
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">
                Quick Presets:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "Under ₹1,500", min: "", max: "1500" },
                  { label: "₹1,500 – ₹3,500", min: "1500", max: "3500" },
                  { label: "₹3,500 – ₹8,000", min: "3500", max: "8000" },
                  { label: "Above ₹8,000", min: "8000", max: "" },
                ].map((preset) => {
                  const isActive =
                    filters.minPrice === preset.min && filters.maxPrice === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setPriceRange(preset.min, preset.max)}
                      className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors text-center cursor-pointer ${
                        isActive
                          ? "border-[#640C0C] bg-[#640C0C]/30 text-white"
                          : "border-white/5 bg-[#121212] text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 mt-5 border-t border-white/5">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-6 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
        >
          Apply &amp; Close
        </button>
      </div>
    </div>
  );
}
