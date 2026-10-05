"use client";

import React from "react";
import { Plus } from "lucide-react";

export interface InventoryHeaderProps {
  onAddProduct?: () => void;
}

export default function InventoryHeader({ onAddProduct }: InventoryHeaderProps) {
  return (
    <div className="rounded-[20px] bg-[#121212] border border-white/5 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <span>Products &amp; Inventory Management</span>
        </h2>
        <p className="text-xs sm:text-sm text-white/60 mt-1">
          Catalog auto parts, configure fitment, track real-time stock levels and pricing
        </p>
      </div>

      <button
        type="button"
        onClick={onAddProduct}
        className="self-start sm:self-auto inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-95 shadow-lg shrink-0 cursor-pointer"
      >
        <Plus className="h-4 w-4 stroke-[2.5]" />
        <span>Add Product</span>
      </button>
    </div>
  );
}
