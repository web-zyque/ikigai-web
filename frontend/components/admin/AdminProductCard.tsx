"use client";

import React from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { InventoryProduct, InventoryStatus } from "./ProductsInventoryTable";

interface AdminProductCardProps {
  product: InventoryProduct;
  onEdit?: (product: InventoryProduct) => void;
}

export default function AdminProductCard({ product, onEdit }: AdminProductCardProps) {
  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case "In Stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-black/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-emerald-400 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            In Stock
          </span>
        );
      case "Low Stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-black/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-amber-300 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Low Stock
          </span>
        );
      case "Out of Stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#640C0C]/60 bg-[#640C0C]/40 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#640C0C] animate-pulse" />
            Out of Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-black/80 px-2.5 py-1 text-[11px] text-white/60">
            {status}
          </span>
        );
    }
  };

  const imageSrc = product.image || "/images/category_lighting.jpg";

  return (
    <div className="group relative flex flex-col rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:-translate-y-1">
      {/* Product Image Section */}
      <div className="relative w-full aspect-[4/3] bg-[#0a0a0a] overflow-hidden">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="rounded-full bg-black/75 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-white/90 truncate max-w-[50%]">
            {product.category}
          </span>
          <div>{getStatusBadge(product.status)}</div>
        </div>
      </div>

      {/* Card Info Section */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 block mb-1">
            {product.sku}
          </span>
          <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-2 leading-snug group-hover:text-white transition-colors" title={product.name}>
            {product.name}
          </h3>
        </div>

        {/* Stock & Price */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Stock Quantity</span>
            <span className={`font-semibold ${product.stock <= 5 && product.stock > 0 ? "text-amber-400" : product.stock === 0 ? "text-[#640C0C]" : "text-white"}`}>
              {product.stock} {product.stock === 1 ? "unit" : "units"}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-base sm:text-lg font-bold text-[#640C0C]">
              {product.price}
            </span>
            <button
              type="button"
              onClick={() => onEdit?.(product)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-[#640C0C] hover:border-[#640C0C] hover:text-white transition-colors cursor-pointer"
            >
              <Pencil className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
