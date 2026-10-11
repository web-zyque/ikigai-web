"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Tag,
  Car,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react";
import { ProductResponse } from "@/types/products.types";

export interface ProductDetailsModalProps {
  product: ProductResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
}: ProductDetailsModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Reset selected image when product changes or modal opens
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id, isOpen]);

  // Lock body scroll and listen for Escape key
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

  if (!isOpen || !product) return null;

  // Stock status badge
  const getStockBadge = (status: ProductResponse["inventoryStatus"]) => {
    switch (status) {
      case "in_stock":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            In Stock
          </span>
        );
      case "low_stock":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            Low Stock
          </span>
        );
      case "out_of_stock":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#640C0C]/50 bg-[#640C0C]/25 px-2 py-0.5 text-[10px] font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#640C0C] animate-pulse" />
            Out of Stock
          </span>
        );
      default:
        return null;
    }
  };

  // Pricing calculations
  const selling = parseFloat(product.sellingPrice) || 0;
  const mrp = product.mrpPrice ? parseFloat(product.mrpPrice) : 0;
  const hasDiscount = mrp > selling && selling > 0;
  const discountPercent = hasDiscount
    ? (((mrp - selling) / mrp) * 100).toFixed(1)
    : null;

  // Photos setup
  const images = product.images || [];
  const currentImage = images[selectedImageIndex] || images[0] || null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl flex flex-col rounded-[20px] border border-white/10 bg-[#121212] text-white shadow-2xl overflow-hidden my-auto"
      >
        {/* Compact Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3 sm:px-6 sm:py-3.5 bg-[#0a0a0a]">
          <div className="min-w-0 pr-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate max-w-xs sm:max-w-md">
                {product.name}
              </h2>
              {getStockBadge(product.inventoryStatus)}
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                  product.publicationStatus === "active"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    product.publicationStatus === "active" ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                {product.publicationStatus === "active" ? "Active" : "Draft"}
              </span>
            </div>

            <p className="text-[11px] text-white/50 flex flex-wrap items-center gap-2 mt-0.5">
              <span className="font-mono text-white/70">SKU: {product.sku}</span>
              <span className="text-white/20">•</span>
              <span className="inline-flex items-center gap-1">
                <Tag className="h-3 w-3 text-[#640C0C]" />
                {product.category?.name || "Uncategorized"}
              </span>
              {product.brand && (
                <>
                  <span className="text-white/20">•</span>
                  <span>Brand: {product.brand}</span>
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-7 w-7 place-items-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-[#640C0C] hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content Body: Zero-Scroll Compact Two-Column Layout */}
        <div className="p-4 sm:p-5 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
            {/* LEFT COLUMN: Product Photos (5 cols) */}
            <div className="md:col-span-5 rounded-xl border border-white/5 bg-[#0e0e0e] p-3 flex flex-col">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-white/50 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="h-3 w-3 text-white/40" />
                  <span>Product Photos</span>
                </div>
                {images.length > 0 && (
                  <span className="text-white/40 font-normal">
                    {images.length} {images.length === 1 ? "Photo" : "Photos"}
                  </span>
                )}
              </div>

              {currentImage ? (
                <div className="flex-1 flex flex-col gap-2.5 min-h-0">
                  {/* Main Photo Container - directly below header, uses available height */}
                  <div className="relative flex-1 min-h-[230px] sm:min-h-[240px] w-full rounded-lg bg-[#0a0a0a] border border-white/10 overflow-hidden flex items-center justify-center">
                    <Image
                      src={currentImage.imageUrl}
                      alt={currentImage.altText || product.name}
                      fill
                      priority
                      className="object-contain p-2.5"
                      sizes="(max-width: 768px) 100vw, 360px"
                    />
                    {currentImage.isMainImage && (
                      <span className="absolute top-2 left-2 rounded bg-black/80 backdrop-blur-md border border-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-white/80">
                        Main
                      </span>
                    )}
                  </div>

                  {/* Compact Thumbnails Strip (if multiple photos) */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto shrink-0 pb-0.5">
                      {images.map((img, idx) => {
                        const isSelected = idx === selectedImageIndex;
                        return (
                          <button
                            key={img.id || idx}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-md border bg-[#0a0a0a] transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#640C0C] ring-1 ring-[#640C0C]"
                                : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                            }`}
                            title={img.altText || `View photo ${idx + 1}`}
                          >
                            <Image
                              src={img.imageUrl}
                              alt={img.altText || `Thumbnail ${idx + 1}`}
                              fill
                              className="object-cover"
                              sizes="44px"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-[#0a0a0a] py-14 text-center">
                  <ImageIcon className="h-6 w-6 text-white/20 mb-1" />
                  <p className="text-[11px] text-white/40">No photos uploaded</p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Product Details (7 cols) */}
            <div className="md:col-span-7 flex flex-col justify-between gap-2.5">
              {/* 1. Pricing & Inventory */}
              <div className="rounded-xl border border-white/5 bg-[#0e0e0e] p-2.5">
                <div className="border-b border-white/5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
                  Pricing &amp; Inventory
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Selling Price */}
                  <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-2">
                    <span className="text-[9px] uppercase text-white/40 block">Selling Price</span>
                    <span className="text-sm sm:text-base font-bold text-[#640C0C] block mt-0.5">
                      ₹{selling.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {hasDiscount && (
                      <span className="text-[9px] text-white/50 block">
                        <span className="line-through mr-1">₹{mrp.toFixed(0)}</span>
                        <span className="text-white font-semibold">{discountPercent}% off</span>
                      </span>
                    )}
                  </div>

                  {/* MRP */}
                  <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-2">
                    <span className="text-[9px] uppercase text-white/40 block">Original / MRP</span>
                    <span className="text-xs sm:text-sm font-semibold text-white block mt-0.5">
                      {product.mrpPrice ? (
                        `₹${mrp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      ) : (
                        <span className="text-white/30 italic text-[10px] font-normal">Not provided</span>
                      )}
                    </span>
                    <span className="text-[9px] text-white/40 block">
                      GST: {product.gstPercentage ? `${parseFloat(product.gstPercentage)}%` : "18%"}
                    </span>
                  </div>

                  {/* Stock Quantity */}
                  <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-2">
                    <span className="text-[9px] uppercase text-white/40 block">Current Stock</span>
                    <span className="text-sm sm:text-base font-bold text-white block mt-0.5">
                      {product.stockQuantity}
                      <span className="text-[10px] font-normal text-white/40 ml-1">Units</span>
                    </span>
                    <span className="text-[9px] text-white/40 block">In inventory</span>
                  </div>

                  {/* Low Stock Threshold */}
                  <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-2">
                    <span className="text-[9px] uppercase text-white/40 block">Low Stock Alert</span>
                    <span className="text-xs sm:text-sm font-semibold text-white block mt-0.5">
                      {product.lowStockThreshold || 5}
                      <span className="text-[10px] font-normal text-white/40 ml-1">Units</span>
                    </span>
                    <span className="text-[9px] text-white/40 block">Threshold</span>
                  </div>
                </div>
              </div>

              {/* 2. Product Description */}
              <div className="rounded-xl border border-white/5 bg-[#0e0e0e] p-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
                  Product Description
                </span>
                <p className="text-[11px] text-white/80 leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {product.description?.trim() ? (
                    product.description
                  ) : (
                    <span className="text-white/30 italic">Not provided</span>
                  )}
                </p>
              </div>

              {/* 3. Vehicle Compatibility */}
              <div className="rounded-xl border border-white/5 bg-[#0e0e0e] p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">
                  <Car className="h-3 w-3 text-[#640C0C]" />
                  <span>Vehicle Compatibility</span>
                </div>

                {product.vehicleCompatibility && product.vehicleCompatibility.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {product.vehicleCompatibility.map((veh, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded border border-white/10 bg-[#0a0a0a] px-2 py-0.5 text-[10px] text-white/80"
                      >
                        <Car className="h-2.5 w-2.5 text-[#640C0C]" />
                        <span>{veh}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-white/30 italic">Not provided</p>
                )}
              </div>

              {/* 4. Specifications */}
              <div className="rounded-xl border border-white/5 bg-[#0e0e0e] p-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block mb-1.5">
                  Specifications
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                  {/* Product Type */}
                  <div className="rounded border border-white/5 bg-[#0a0a0a] p-1.5">
                    <span className="text-[9px] text-white/40 block uppercase">Product Type</span>
                    <span className="text-[11px] font-medium text-white mt-0.5 block truncate">
                      {product.productType || <span className="text-white/30 italic">Not provided</span>}
                    </span>
                  </div>

                  {/* Color / Finish */}
                  <div className="rounded border border-white/5 bg-[#0a0a0a] p-1.5">
                    <span className="text-[9px] text-white/40 block uppercase">Color / Finish</span>
                    <span className="text-[11px] font-medium text-white mt-0.5 block truncate">
                      {product.color || <span className="text-white/30 italic">Not provided</span>}
                    </span>
                  </div>

                  {/* Dimensions */}
                  <div className="rounded border border-white/5 bg-[#0a0a0a] p-1.5">
                    <span className="text-[9px] text-white/40 block uppercase">Dimensions</span>
                    <span className="text-[11px] font-medium text-white mt-0.5 block truncate">
                      {product.dimensions || <span className="text-white/30 italic">Not provided</span>}
                    </span>
                  </div>

                  {/* Material */}
                  <div className="rounded border border-white/5 bg-[#0a0a0a] p-1.5">
                    <span className="text-[9px] text-white/40 block uppercase">Material</span>
                    <span className="text-[11px] font-medium text-white mt-0.5 block truncate">
                      {product.material || <span className="text-white/30 italic">Not provided</span>}
                    </span>
                  </div>

                  {/* Warranty */}
                  <div className="rounded border border-white/5 bg-[#0a0a0a] p-1.5 sm:col-span-2">
                    <span className="text-[9px] text-white/40 block uppercase">Warranty</span>
                    <span className="text-[11px] font-medium text-white mt-0.5 block truncate flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>
                        {product.warranty || <span className="text-white/30 italic">Not provided</span>}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
