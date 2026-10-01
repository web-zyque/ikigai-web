"use client";

import React from "react";
import { Plus } from "lucide-react";

export interface InventoryHeaderProps {
  onAddProduct?: () => void;
}

export default function InventoryHeader({ onAddProduct }: InventoryHeaderProps) {
  return (
    <button
      type="button"
      onClick={onAddProduct}
      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-red-600/50 bg-gradient-to-r from-red-950/90 via-red-900/85 to-red-950/90 px-6 py-5 text-xl font-bold tracking-wide text-white shadow-[0_8px_32px_-6px_rgba(185,28,28,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-300 hover:border-red-500/70 hover:bg-gradient-to-r hover:from-red-900 hover:via-red-800/90 hover:to-red-900 hover:shadow-[0_12px_36px_-4px_rgba(220,38,38,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] focus:outline-none focus:ring-2 focus:ring-red-500/50 active:scale-[0.99] md:py-6 md:text-2xl"
    >
      {/* Glass Top Sheen Reflection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent opacity-60 transition-opacity group-hover:opacity-90"
      />

      <Plus className="relative z-10 h-6 w-6 stroke-[2.5] text-red-200 transition-transform duration-200 group-hover:scale-110 group-hover:text-white" />
      <span className="relative z-10 drop-shadow-sm">Add Product</span>
    </button>
  );
}
