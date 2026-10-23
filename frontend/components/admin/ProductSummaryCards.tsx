"use client";

import React from "react";
import { Search } from "lucide-react";

export interface ProductCounts {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface ProductSummaryCardsProps {
  counts: ProductCounts;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  selectedStatus?: "All" | "in_stock" | "low_stock" | "out_of_stock";
  onStatusClick?: (status: "All" | "in_stock" | "low_stock" | "out_of_stock") => void;
}

export default function ProductSummaryCards({
  counts,
  selectedStatus = "All",
  onStatusClick,
}: ProductSummaryCardsProps) {
  return (
    <div className="w-full space-y-4">
      <div className="pt-2 pb-3 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Total products</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.total}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Total catalogue items</span>
          </div>

          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">In Stock</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.inStock}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Available above stock threshold</span>
          </div>

          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Low Stock</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.lowStock}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Units requiring restock soon</span>
          </div>

          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Out of Stock</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {counts.outOfStock}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Products with zero stock</span>
          </div>
        </div>
      </div>
    </div>
  );
}
