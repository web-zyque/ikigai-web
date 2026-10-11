"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Tag,
  Car,
  ShieldCheck,
  Menu,
  Image as ImageIcon,
} from "lucide-react";
import { ProductResponse } from "@/types/products.types";
import { useMobileMenu } from "@/app/admin/layout";

export interface ProductDetailsViewProps {
  product?: ProductResponse | null;
  isLoading?: boolean;
  searchParam?: string | null;
}

export default function ProductDetailsView({
  product,
  isLoading = false,
  searchParam,
}: ProductDetailsViewProps) {
  const router = useRouter();
  const { setMobileOpen } = useMobileMenu();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleBack = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  const backUrl = searchParam
    ? `/admin/products?search=${encodeURIComponent(searchParam)}`
    : "/admin/products";

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen bg-black text-white flex flex-col">
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-black/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          <div className="h-8 w-36 rounded-full bg-white/5 animate-pulse" />
        </header>
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 h-80 rounded-2xl bg-white/5 animate-pulse" />
            <div className="lg:col-span-7 h-80 rounded-2xl bg-white/5 animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 min-h-screen bg-black text-white flex flex-col">
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-black/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Open navigation menu"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors lg:hidden shrink-0"
            >
              <Menu className="h-4 w-4" />
            </button>
            <Link
              href={backUrl}
              onClick={handleBack}
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#640C0C] transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Products</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-8 text-center max-w-md w-full">
            <h2 className="text-base font-bold text-white mb-2">Product Not Found</h2>
            <p className="text-xs text-white/50 mb-5">
              The requested product does not exist in the catalogue.
            </p>
            <Link
              href={backUrl}
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-5 py-2 text-xs font-medium text-white transition-all shadow-md"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Products</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Stock status pill
  const getStockBadge = () => {
    switch (product.inventoryStatus) {
      case "in_stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            In Stock
          </span>
        );
      case "low_stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            Low Stock
          </span>
        );
      case "out_of_stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#640C0C]/50 bg-[#640C0C]/25 px-2.5 py-0.5 text-[11px] font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#640C0C] animate-pulse" />
            Out of Stock
          </span>
        );
      default:
        return null;
    }
  };

  // Pricing values
  const selling = parseFloat(product.sellingPrice) || 0;
  const mrp = product.mrpPrice ? parseFloat(product.mrpPrice) : 0;
  const hasDiscount = mrp > selling && selling > 0;
  const discountPercent = hasDiscount
    ? (((mrp - selling) / mrp) * 100).toFixed(1)
    : null;

  // Images setup
  const images = product.images || [];
  const currentImage = images[selectedImageIndex] || images[0] || null;

  return (
    <div className="flex-1 min-h-screen bg-black text-white flex flex-col">
      {/* 1. COMPACT TOP HEADER */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-black/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Open navigation menu"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors lg:hidden shrink-0"
          >
            <Menu className="h-4 w-4" />
          </button>

          <Link
            href={backUrl}
            onClick={handleBack}
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#640C0C] transition-transform duration-200 group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back to Products</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <span className="hidden sm:inline-block h-4 w-[1px] bg-white/10" />

          <h1 className="text-sm sm:text-base font-bold tracking-tight text-white truncate max-w-[200px] sm:max-w-md lg:max-w-xl">
            {product.name}
          </h1>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${
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
          {getStockBadge()}
        </div>
      </header>

      {/* 2. TWO-COLUMN COMPACT VIEWPORT-OPTIMIZED LAYOUT */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ================= LEFT COLUMN: PRODUCT PHOTOS (5 cols) ================= */}
          <div className="lg:col-span-5 rounded-2xl border border-white/5 bg-[#121212] p-4 space-y-3">
            {currentImage ? (
              <div className="space-y-3">
                {/* Main Image Showcase */}
                <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] flex items-center justify-center">
                  <Image
                    src={currentImage.imageUrl}
                    alt={currentImage.altText || product.name}
                    fill
                    priority
                    className="object-contain p-3"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  {currentImage.isMainImage && (
                    <span className="absolute top-2.5 left-2.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/80">
                      Main Photo
                    </span>
                  )}
                </div>

                {/* Additional Images Thumbnails Strip */}
                {images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                    {images.map((img, idx) => {
                      const isSelected = idx === selectedImageIndex;
                      return (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-[#0a0a0a] transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#640C0C] ring-2 ring-[#640C0C]/50"
                              : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                          }`}
                          title={img.altText || `View photo ${idx + 1}`}
                        >
                          <Image
                            src={img.imageUrl}
                            alt={img.altText || `Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0a0a0a] py-14 text-center">
                <ImageIcon className="h-8 w-8 text-white/20 mb-2" />
                <p className="text-xs font-medium text-white/50">No Photos Uploaded</p>
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: PRODUCT DETAILS (7 cols) ================= */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Header Box: Name, SKU, Category, Brand */}
            <div className="rounded-2xl border border-white/5 bg-[#121212] p-4 sm:p-5 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                {product.name}
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#0a0a0a] px-2.5 py-1 text-xs">
                  <span className="text-white/40">SKU:</span>
                  <span className="font-mono font-semibold text-white">{product.sku}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#0a0a0a] px-2.5 py-1 text-xs text-white/80">
                  <Tag className="h-3 w-3 text-[#640C0C]" />
                  <span>{product.category?.name || "Uncategorized"}</span>
                </span>

                <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#0a0a0a] px-2.5 py-1 text-xs text-white/80">
                  <span className="text-white/40">Brand:</span>
                  <span className="text-white font-medium">
                    {product.brand || <span className="text-white/30 italic">Not provided</span>}
                  </span>
                </span>
              </div>
            </div>

            {/* 2. Compact Pricing & Inventory Grid (4 stats in a row) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Selling Price */}
              <div className="rounded-xl border border-white/5 bg-[#121212] p-3 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40 block">
                  Selling Price
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg sm:text-xl font-bold text-[#640C0C] tracking-tight">
                    ₹{selling.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {hasDiscount && (
                  <span className="text-[10px] text-white/50 block">
                    <span className="line-through mr-1">₹{mrp.toFixed(0)}</span>
                    <span className="text-white font-semibold">{discountPercent}% off</span>
                  </span>
                )}
              </div>

              {/* MRP / Original Price */}
              <div className="rounded-xl border border-white/5 bg-[#121212] p-3 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40 block">
                  Original / MRP
                </span>
                <span className="text-sm sm:text-base font-semibold text-white block">
                  {product.mrpPrice ? (
                    `₹${mrp.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  ) : (
                    <span className="text-white/30 italic text-xs font-normal">Not provided</span>
                  )}
                </span>
                <span className="text-[10px] text-white/40 block">
                  GST: {product.gstPercentage ? `${parseFloat(product.gstPercentage)}%` : "18%"}
                </span>
              </div>

              {/* Stock Quantity */}
              <div className="rounded-xl border border-white/5 bg-[#121212] p-3 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40 block">
                  Current Stock
                </span>
                <span className="text-lg sm:text-xl font-bold text-white block">
                  {product.stockQuantity}
                  <span className="text-xs font-normal text-white/40 ml-1">Units</span>
                </span>
                <span className="text-[10px] text-white/40 block">Available inventory</span>
              </div>

              {/* Low Stock Threshold */}
              <div className="rounded-xl border border-white/5 bg-[#121212] p-3 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40 block">
                  Low Stock Alert
                </span>
                <span className="text-sm sm:text-base font-semibold text-white block">
                  {product.lowStockThreshold || 5}
                  <span className="text-xs font-normal text-white/40 ml-1">Units</span>
                </span>
                <span className="text-[10px] text-white/40 block">Minimum threshold</span>
              </div>
            </div>

            {/* 3. Product Description */}
            <div className="rounded-xl border border-white/5 bg-[#121212] p-3.5 space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40 block">
                Product Description
              </span>
              <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line">
                {product.description?.trim() ? (
                  product.description
                ) : (
                  <span className="text-white/30 italic">Not provided</span>
                )}
              </p>
            </div>

            {/* 4. Vehicle Compatibility (from Add Product form) */}
            <div className="rounded-xl border border-white/5 bg-[#121212] p-3.5 space-y-2">
              <div className="flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5 text-[#640C0C]" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40">
                  Vehicle Compatibility
                </span>
              </div>

              {product.vehicleCompatibility && product.vehicleCompatibility.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {product.vehicleCompatibility.map((veh, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#0a0a0a] px-2.5 py-1 text-[11px] text-white/80"
                    >
                      <Car className="h-3 w-3 text-[#640C0C]" />
                      <span>{veh}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/30 italic">Not provided</p>
              )}
            </div>

            {/* 5. Specifications Grid (Product Type, Color, Dimensions, Material, Warranty) */}
            <div className="rounded-xl border border-white/5 bg-[#121212] p-3.5 space-y-2.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40 block">
                Specifications
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {/* Product Type */}
                <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-2.5">
                  <span className="text-[10px] text-white/40 block uppercase">Product Type</span>
                  <span className="text-white font-medium mt-0.5 block truncate">
                    {product.productType || <span className="text-white/30 italic">Not provided</span>}
                  </span>
                </div>

                {/* Color / Finish */}
                <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-2.5">
                  <span className="text-[10px] text-white/40 block uppercase">Color / Finish</span>
                  <span className="text-white font-medium mt-0.5 block truncate">
                    {product.color || <span className="text-white/30 italic">Not provided</span>}
                  </span>
                </div>

                {/* Dimensions */}
                <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-2.5">
                  <span className="text-[10px] text-white/40 block uppercase">Dimensions</span>
                  <span className="text-white font-medium mt-0.5 block truncate">
                    {product.dimensions || <span className="text-white/30 italic">Not provided</span>}
                  </span>
                </div>

                {/* Material */}
                <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-2.5">
                  <span className="text-[10px] text-white/40 block uppercase">Material</span>
                  <span className="text-white font-medium mt-0.5 block truncate">
                    {product.material || <span className="text-white/30 italic">Not provided</span>}
                  </span>
                </div>

                {/* Warranty */}
                <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-2.5 sm:col-span-2">
                  <span className="text-[10px] text-white/40 block uppercase">Warranty</span>
                  <span className="text-white font-medium mt-0.5 block truncate flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>
                      {product.warranty || <span className="text-white/30 italic">Not provided</span>}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
