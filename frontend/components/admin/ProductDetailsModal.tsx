"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Maximize2,
  Minimize2,
  Edit,
  Printer,
  PlusCircle,
  Archive,
  Trash2,
  Image as ImageIcon,
  Calendar,
  Car,
} from "lucide-react";
import { ProductResponse } from "@/types/products.types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export interface ProductDetailsModalProps {
  product: ProductResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: ProductResponse) => void;
  onAddStock?: (product: ProductResponse, additionalStock: number) => void;
  onArchive?: (product: ProductResponse) => void;
  onDelete?: (product: ProductResponse) => void;
}

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  onEdit,
  onAddStock,
  onArchive,
  onDelete,
}: ProductDetailsModalProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockToAdd, setStockToAdd] = useState("10");

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id, isOpen]);

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

  const selling = parseFloat(product.sellingPrice) || 0;
  const mrp = product.mrpPrice ? parseFloat(product.mrpPrice) : 0;
  const images = product.images || [];
  const currentImage = images[selectedImageIndex] || images[0] || null;

  const getStatusTextClass = (status: ProductResponse["inventoryStatus"]) => {
    switch (status) {
      case "in_stock":
        return "text-emerald-400 font-semibold";
      case "low_stock":
        return "text-amber-400 font-semibold";
      case "out_of_stock":
        return "text-red-500 font-semibold";
      default:
        return "text-white/70 font-semibold";
    }
  };

  const getStatusLabel = (status: ProductResponse["inventoryStatus"]) => {
    switch (status) {
      case "in_stock":
        return "In Stock";
      case "low_stock":
        return "Low Stock";
      case "out_of_stock":
        return "Out of Stock";
      default:
        return "Unknown";
    }
  };

  const getPublicationStatusBadge = (status: ProductResponse["publicationStatus"]) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Active
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60"></span>
            {status}
          </span>
        );
    }
  };

  const handlePrint = () => {
    window.print();
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
    <>
      <div
        aria-modal="true"
        role="dialog"
        onClick={onClose}
        className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative flex flex-col h-full bg-[#121212] text-white border-l border-white/10 shadow-2xl transition-all duration-300 ease-out transform animate-in slide-in-from-right duration-300 ${
            isFullScreen ? "w-full" : "w-full sm:w-[560px] md:w-[640px]"
          }`}
        >
          {/* Top Bar with Title and Controls */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10 bg-[#0e0e0e]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                Product Details
              </span>
              <span className="text-white/20">•</span>
              <span className="font-mono text-xs text-white/70">#{product.sku}</span>
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

          {/* Action Buttons Bar: Edit, Print, Add Stock, Archive, Delete */}
          <div className="px-6 py-3 border-b border-white/10 bg-[#121212] flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => onEdit?.(product)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white text-black hover:bg-white/90 px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-sm"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="h-3.5 w-3.5 text-white/70" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={() => setIsStockModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="h-3.5 w-3.5 text-white/70" />
              <span>Add Stock</span>
            </button>

            <button
              type="button"
              onClick={() => setIsArchiveDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors cursor-pointer whitespace-nowrap ml-auto"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>Archive</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>

          {/* Scrollable Content Body with Clean Line-Divided Sections */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Header: Title and Brand */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug flex-1">
                  {product.name}
                </h2>
                {getPublicationStatusBadge(product.publicationStatus)}
              </div>
              {product.brand && (
                <p className="text-sm text-white/50 mt-1">Brand: {product.brand}</p>
              )}
            </div>

            {/* Line-separated Metrics Section (Orders Top Line Design) */}
            <div className="pt-2 pb-5 border-y border-white/10">
              <div className="grid grid-cols-2 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 gap-y-4 sm:gap-y-0 mt-3">
                <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-4">
                  <span className="text-xs font-medium text-white/70">Selling Price</span>
                  <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      ₹{selling.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {mrp > 0 ? (
                    <span className="mt-1 text-xs text-white/40">MRP: ₹{mrp.toFixed(2)}</span>
                  ) : (
                    <span className="mt-1 text-xs text-white/40">Standard retail pricing</span>
                  )}
                </div>

                <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-4">
                  <span className="text-xs font-medium text-white/70">Stock Quantity</span>
                  <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {product.stockQuantity}
                    </span>
                    <span className="text-xs text-white/40">units</span>
                  </div>
                  <span className="mt-1 text-xs text-white/40">
                    Alert threshold: {product.lowStockThreshold || 5} units
                  </span>
                </div>

                <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-4 col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <span className="text-xs font-medium text-white/70">Stock Status</span>
                  <div className="mt-1 sm:mt-2 flex items-baseline gap-1.5">
                    <span className={`text-xl sm:text-2xl font-bold tracking-tight ${getStatusTextClass(product.inventoryStatus)}`}>
                      {getStatusLabel(product.inventoryStatus)}
                    </span>
                  </div>
                  <span className="mt-1 text-xs text-white/40">
                    Category: {product.category?.name || "Uncategorized"}
                  </span>
                </div>
              </div>
            </div>

            {/* Line-separated Specifications Row */}
            <div className="pt-2 pb-5 border-b border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-3">
                Specifications
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 gap-y-3 sm:gap-y-0">
                <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-3">
                  <span className="text-xs text-white/50">SKU Code</span>
                  <span className="mt-1 font-mono text-sm text-white font-medium truncate">
                    {product.sku}
                  </span>
                </div>

                {product.productType && (
                  <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-3">
                    <span className="text-xs text-white/50">Product Type</span>
                    <span className="mt-1 text-sm text-white/90 font-medium truncate">
                      {product.productType}
                    </span>
                  </div>
                )}

                {product.color && (
                  <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-3">
                    <span className="text-xs text-white/50">Color / Finish</span>
                    <span className="mt-1 text-sm text-white/90 font-medium truncate">
                      {product.color}
                    </span>
                  </div>
                )}

                {product.dimensions && (
                  <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-3">
                    <span className="text-xs text-white/50">Dimensions / Size</span>
                    <span className="mt-1 text-sm text-white/90 font-medium truncate">
                      {product.dimensions}
                    </span>
                  </div>
                )}

                {product.material && (
                  <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-3">
                    <span className="text-xs text-white/50">Material</span>
                    <span className="mt-1 text-sm text-white/90 font-medium truncate">
                      {product.material}
                    </span>
                  </div>
                )}

                {product.warranty && (
                  <div className="flex flex-col justify-between py-1 sm:py-0 px-2 sm:px-3">
                    <span className="text-xs text-white/50">Warranty</span>
                    <span className="mt-1 text-sm text-white/90 font-medium truncate">
                      {product.warranty}
                    </span>
                  </div>
                )}
              </div>

              {/* Vehicle Compatibility below specifications */}
              {product.vehicleCompatibility && product.vehicleCompatibility.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block mb-2.5">
                    Vehicle Compatibility
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.vehicleCompatibility.map((veh, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center text-sm text-white/85 pr-3 border-r border-white/15 last:border-none"
                      >
                        {veh}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Description Section */}
            {product.description && (
              <div className="pt-2 pb-5 border-b border-white/10 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block">
                  Description
                </span>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* SEPARATE SECTION BELOW FOR ALL IMAGES */}
            <div className="pt-2 pb-5 border-b border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Product Images
                </span>
                <span className="text-xs text-white/40">
                  {images.length} {images.length === 1 ? "Image" : "Images"}
                </span>
              </div>

              {images.length > 0 ? (
                <div className="space-y-3">
                  {/* Selected Preview Image */}
                  {currentImage && (
                    <div className="relative w-full h-56 sm:h-64 rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden flex items-center justify-center p-3">
                      <Image
                        src={currentImage.imageUrl}
                        alt={currentImage.altText || product.name}
                        fill
                        unoptimized
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, 540px"
                      />
                    </div>
                  )}

                  {/* Thumbnail gallery */}
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {images.map((img, idx) => {
                      const isSelected = idx === selectedImageIndex;
                      return (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative h-16 w-16 min-w-16 rounded-lg border bg-[#0a0a0a] overflow-hidden transition-all cursor-pointer p-1 ${
                            isSelected
                              ? "border-white ring-1 ring-white"
                              : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                          }`}
                        >
                          <Image
                            src={img.imageUrl}
                            alt={img.altText || `Product image ${idx + 1}`}
                            fill
                            unoptimized
                            className="object-contain p-1"
                            sizes="64px"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 rounded-lg border border-dashed border-white/10 bg-[#0a0a0a] text-white/30 text-center">
                  <ImageIcon className="h-8 w-8 mb-2 text-white/20" />
                  <p className="text-xs">No images available for this product</p>
                </div>
              )}
            </div>

            {/* PRODUCT DATES AT BOTTOM (Line Separated, No calendar icons) */}
            <div className="pt-2 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/10 gap-y-2 sm:gap-y-0 text-sm text-white/60">
                <div className="px-1 sm:px-3">
                  <span className="text-xs text-white/40 block mb-0.5">Added Date</span>
                  <span className="font-mono text-sm text-white/80">
                    {formatDate(product.createdAt)}
                  </span>
                </div>
                <div className="px-1 sm:px-3">
                  <span className="text-xs text-white/40 block mb-0.5">Last Modified</span>
                  <span className="font-mono text-sm text-white/80">
                    {formatDate(product.updatedAt || product.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reusable Confirm Dialog for Archive */}
      <ConfirmDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
        onConfirm={() => {
          setIsArchiveDialogOpen(false);
          onArchive?.(product);
        }}
        title="Archive Product"
        description={`Are you sure you want to archive "${product.name}"? It will be hidden from customer store views and marked as draft.`}
        confirmText="Archive Product"
        variant="warning"
      />

      {/* Reusable Confirm Dialog for Delete */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          setIsDeleteDialogOpen(false);
          onDelete?.(product);
        }}
        title="Delete Product"
        description={`This action cannot be undone. Are you sure you want to permanently delete "${product.name}" (${product.sku})?`}
        confirmText="Delete Permanently"
        variant="danger"
      />

      {/* Add Stock Dialog */}
      {isStockModalOpen && (
        <div
          aria-modal="true"
          role="dialog"
          onClick={() => setIsStockModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#121212] p-5 shadow-2xl text-white space-y-4"
          >
            <div>
              <h3 className="text-sm font-bold text-white">Add Stock Units</h3>
              <p className="text-xs text-white/50 mt-0.5">
                Current stock: <span className="text-white font-medium">{product.stockQuantity}</span>
              </p>
            </div>

            <div>
              <label className="text-[11px] text-white/40 block mb-1">
                Units to add
              </label>
              <input
                type="number"
                min="1"
                value={stockToAdd}
                onChange={(e) => setStockToAdd(e.target.value)}
                className="w-full h-9 rounded-lg bg-[#0a0a0a] border border-white/10 px-3 text-xs text-white outline-none focus:border-white/30"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const qty = parseInt(stockToAdd, 10);
                  if (qty > 0) {
                    onAddStock?.(product, qty);
                  }
                  setIsStockModalOpen(false);
                }}
                className="rounded-lg bg-[#640C0C] hover:bg-[#7a1010] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
