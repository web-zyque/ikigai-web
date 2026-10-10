"use client";

import React from "react";
import { Plus } from "lucide-react";

export interface InventoryHeaderProps {
  onAddProduct?: () => void;
}

export default function InventoryHeader({ onAddProduct }: InventoryHeaderProps) {
  return (
    <div className="rounded-[20px] bg-[#121212] border border-white/5 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 sm:gap-4">
      <div>
        <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-snug sm:leading-tight text-balance">
          Products &amp; Inventory Management
        </h2>
        <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-relaxed max-w-xl">
          Catalog auto parts, configure fitment, track real-time stock levels and pricing
        </p>
      </div>

      <button
        type="button"
        onClick={onAddProduct}
        className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-white transition-opacity hover:opacity-95 shadow-md shrink-0 cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5]" />
        <span>Add Product</span>
      </button>
    </div>
  );
}
