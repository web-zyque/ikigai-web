"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  Edit,
  Copy,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { CategoryRowItem } from "./CategoriesTable";
import { ProductResponse } from "@/types/products.types";

export interface CategoryDetailsModalProps {
  category: CategoryRowItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (category: CategoryRowItem) => void;
  assignedProducts?: ProductResponse[];
}

export default function CategoryDetailsModal({
  category,
  isOpen,
  onClose,
  onEdit,
  assignedProducts = [],
}: CategoryDetailsModalProps) {
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !category) return null;

  const handleCopyId = () => {
    if (category.id) {
      navigator.clipboard.writeText(category.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={onClose}
      className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col h-full bg-[#121212] text-white border-l border-white/10 shadow-2xl transition-all duration-300 ease-out transform animate-in slide-in-from-right duration-300 w-full sm:w-[560px] md:w-[620px]"
      >
        {/* Top Bar with Title and Controls */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10 bg-[#0e0e0e]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
              Category Details
            </span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-xs text-white/70">#{category.slug}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-[#640C0C] hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons Bar: Edit Button */}
        <div className="px-6 py-3 border-b border-white/10 bg-[#121212] flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(category)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white text-black hover:bg-white/90 px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Edit className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Scrollable Content Body with Clean Line-Divided Sections */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Title Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              {category.name}
            </h2>
            <p className="text-xs font-mono text-white/50 mt-1">
              Route: /products?category={category.slug}
            </p>
          </div>

          {/* Category Image View Card with Full Visibility */}
          {category.imageUrl ? (
            <div className="relative w-full h-64 sm:h-72 rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden flex items-center justify-center p-3">
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                unoptimized
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-white/10 bg-[#0a0a0a] text-white/30 text-center">
              <ImageIcon className="h-8 w-8 mb-2 text-white/20" />
              <p className="text-xs">No image available for this category</p>
            </div>
          )}

          {/* Line-separated Metrics Section (Matching Product Details Top-Line Design) */}
          <div className="pt-2 pb-5 border-y border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 gap-y-4 sm:gap-y-0 mt-1">
              <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-4">
                <span className="text-xs font-medium text-white/70">Assigned Products</span>
                <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {category.productsCount}
                  </span>
                  <span className="text-xs text-white/40">products</span>
                </div>
                <span className="mt-1 text-xs text-white/40">Active catalogue items</span>
              </div>

              <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-4">
                <span className="text-xs font-medium text-white/70">URL Slug</span>
                <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
                  <span className="font-mono text-base sm:text-lg font-bold tracking-tight text-white truncate">
                    {category.slug}
                  </span>
                </div>
                <span className="mt-1 text-xs text-white/40 truncate">
                  Store collection route
                </span>
              </div>

              <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-4 col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-3 sm:pt-0">
                <span className="text-xs font-medium text-white/70">Category Status</span>
                <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-lg font-bold tracking-tight text-emerald-400">
                    Active
                  </span>
                </div>
                <span className="mt-1 text-xs text-white/40">
                  Published category
                </span>
              </div>
            </div>
          </div>

          {/* Description Section (Line-divided, no card) */}
          <div className="pt-2 pb-5 border-b border-white/10 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block">
              Description
            </span>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
              {category.description || "No description provided for this category."}
            </p>
          </div>

          {/* Category Identification & Metadata (Line-divided, no card) */}
          <div className="pt-2 pb-5 border-b border-white/10 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block">
              Identification &amp; Timestamps
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 gap-y-3 sm:gap-y-0">
              <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-3">
                <span className="text-xs text-white/50">Category ID</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="font-mono text-xs text-white/90 select-all truncate">
                    {category.id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    aria-label="Copy Category ID"
                    className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    {copiedId ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-3">
                <span className="text-xs text-white/50">Created Date</span>
                <span className="mt-1 text-sm text-white/90 font-medium truncate">
                  {formatDate(category.createdAt)}
                </span>
              </div>

              <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-3">
                <span className="text-xs text-white/50">Last Updated</span>
                <span className="mt-1 text-sm text-white/90 font-medium truncate">
                  {formatDate(category.updatedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Associated Products Section (Line-divided, no card) */}
          <div className="pt-2 pb-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Products in this Category
              </span>
              <span className="text-xs text-white/40">
                {assignedProducts.length} {assignedProducts.length === 1 ? "Product" : "Products"}
              </span>
            </div>

            {assignedProducts.length === 0 ? (
              <p className="text-xs text-white/40 py-4">
                No products are currently assigned to this category.
              </p>
            ) : (
              <div className="divide-y divide-white/10 border-y border-white/10">
                {assignedProducts.slice(0, 10).map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between py-3 px-1 text-xs hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex flex-col min-w-0 pr-3">
                      <span className="font-medium text-white truncate">{prod.name}</span>
                      <span className="font-mono text-[11px] text-white/40 mt-0.5">
                        SKU: {prod.sku}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-white">
                        ₹{parseFloat(prod.sellingPrice).toFixed(2)}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          prod.inventoryStatus === "in_stock"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : prod.inventoryStatus === "low_stock"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {prod.stockQuantity} in stock
                      </span>
                    </div>
                  </div>
                ))}
                {assignedProducts.length > 10 && (
                  <div className="py-2.5 text-center text-[11px] text-white/40">
                    + {assignedProducts.length - 10} more products
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
