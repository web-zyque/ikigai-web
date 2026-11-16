"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  X,
  Edit,
  Printer,
  PlusCircle,
  Archive,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { ProductResponse } from "@/types/products.types";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { parseColorString, getColorInfo } from "@/lib/color-utils";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");

  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockToAdd, setStockToAdd] = useState("");
  const [stockError, setStockError] = useState<string | null>(null);

  const productColors = useMemo(() => {
    if (!product) return [];

    if (product.variants && product.variants.length > 0) {
      return product.variants.map((variant) => ({
        ...getColorInfo(variant.colorName),
        variantId: variant.id,
        colorName: variant.colorName,
        imageCount: variant.images?.length || 0,
      }));
    } else if (product.color) {
      const colorNames = parseColorString(product.color);
      return colorNames.map((name) => {
        const count = (product.images || []).filter((img: any) => {
          return (
            img.variantColor &&
            img.variantColor.toLowerCase() === name.toLowerCase()
          );
        }).length;
        return {
          ...getColorInfo(name),
          variantId: "",
          colorName: name,
          imageCount: count,
        };
      });
    }

    return [];
  }, [product]);

  useEffect(() => {
    if (productColors.length > 0) {
      const first = productColors[0];
      setSelectedColor(first.colorName);
      setSelectedVariantId(first.variantId || "");
      setSelectedImageIndex(0);
    } else {
      setSelectedColor("");
      setSelectedVariantId("");
      setSelectedImageIndex(0);
    }
  }, [productColors]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setStockToAdd("");
    setStockError(null);
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

  const variantImages = useMemo(() => {
    if (!product) return [];

    if (selectedVariantId && product.variants && product.variants.length > 0) {
      const variant = product.variants.find((v) => v.id === selectedVariantId);
      if (variant && variant.images && variant.images.length > 0) {
        return variant.images;
      }
    }

    if (selectedColor && product.variants && product.variants.length > 0) {
      const variant = product.variants.find(
        (v) => v.colorName.toLowerCase() === selectedColor.toLowerCase()
      );
      if (variant && variant.images && variant.images.length > 0) {
        return variant.images;
      }
    }

    if (selectedColor && product.images && product.images.length > 0) {
      const colorImages = product.images.filter((img: any) => {
        const matchColor =
          img.variantColor &&
          img.variantColor.toLowerCase() === selectedColor.toLowerCase();
        const matchVariantId =
          selectedVariantId && img.variantId === selectedVariantId;
        return matchColor || matchVariantId;
      });
      if (colorImages.length > 0) {
        return colorImages;
      }
    }

    return product.images || [];
  }, [product, selectedColor, selectedVariantId]);

  const productSizes = useMemo(() => {
    if (product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes;
    }
    if (product?.dimensions) {
      if (
        product.sizeType ||
        product.dimensions.toLowerCase().includes("inch") ||
        product.dimensions.includes(",")
      ) {
        return product.dimensions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    return [];
  }, [product?.sizes, product?.sizeType, product?.dimensions]);

  if (!isOpen || !product) return null;

  const selling = parseFloat(product.sellingPrice) || 0;
  const mrp = product.mrpPrice ? parseFloat(product.mrpPrice) : 0;
  const images = variantImages;
  const currentImage = images[selectedImageIndex] || images[0] || null;

  const handleSelectColor = (colorName: string, variantId?: string) => {
    setSelectedColor(colorName);
    setSelectedVariantId(variantId || "");
    setSelectedImageIndex(0);
  };

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
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            Active
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-xs font-medium text-white/60">
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

  const specItems = [
    { label: "SKU Code", value: product.sku },
    { label: "Category", value: product.category?.name || "Uncategorized" },
    { label: "Brand", value: product.brand || "—" },
    { label: "Material", value: product.material || "—" },
    { label: "Warranty", value: product.warranty || "No Warranty" },
    ...(product.dimensions && productSizes.length === 0
      ? [{ label: "Dimensions", value: product.dimensions }]
      : []),
    {
      label: "Payment Modes",
      value:
        [
          product.acceptUpi ? "UPI" : null,
          product.acceptCod ? "COD" : null,
        ]
          .filter(Boolean)
          .join(", ") || "Standard",
    },
  ];

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
          className="relative flex flex-col h-full bg-[#121212] text-white border-l border-white/10 shadow-2xl transition-all duration-300 ease-out transform animate-in slide-in-from-right duration-300 w-full sm:w-[560px] md:w-[620px]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0e0e0e]">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs font-mono uppercase tracking-wider text-white/50">
                Product Details
              </span>
              <span className="text-white/20">•</span>
              <span className="font-mono text-xs text-white/80 truncate">
                #{product.sku}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {getPublicationStatusBadge(product.publicationStatus)}
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

          <div className="px-6 py-2.5 border-b border-white/10 bg-[#121212] flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => onEdit?.(product)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white text-black hover:bg-white/90 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-sm"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
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
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="h-3.5 w-3.5 text-white/70" />
              <span>Print</span>
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

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                {product.name}
              </h2>
              {product.description && (
                <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              {productColors.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {productColors.map((col) => {
                    const isSelected =
                      selectedColor.toLowerCase() ===
                      col.colorName.toLowerCase();
                    return (
                      <button
                        key={col.colorName}
                        type="button"
                        onClick={() =>
                          handleSelectColor(col.colorName, col.variantId)
                        }
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white text-black border-white shadow-sm"
                            : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.colorName}</span>
                        {col.imageCount > 0 && (
                          <span
                            className={`text-[10px] ${
                              isSelected ? "text-black/60" : "text-white/40"
                            }`}
                          >
                            ({col.imageCount})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {images.length > 0 ? (
                <div className="space-y-2.5">
                  {currentImage && (
                    <div className="relative w-full h-52 sm:h-60 rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden flex items-center justify-center p-3">
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

                  {images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {images.map((img, idx) => {
                        const isSelected = idx === selectedImageIndex;
                        return (
                          <button
                            key={img.id || idx}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative h-14 w-14 min-w-14 rounded-lg border bg-[#0a0a0a] overflow-hidden transition-all cursor-pointer p-1 ${
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
                              sizes="56px"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-white/10 bg-[#0a0a0a] text-white/30 text-center">
                  <ImageIcon className="h-7 w-7 mb-1.5 text-white/20" />
                  <p className="text-xs">
                    No images available for {selectedColor || "this product"}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-white/5 bg-[#161616] p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/50">
                    Selling Price
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xl font-bold tracking-tight text-white">
                    ₹
                    {selling.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                  <span>MRP</span>
                  <span className="text-white/80 font-medium">
                    {mrp > 0
                      ? `₹${mrp.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : "Standard"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#161616] p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/50">
                    Stock Quantity
                  </span>
                  <span
                    className={`text-xs ${getStatusTextClass(
                      product.inventoryStatus
                    )}`}
                  >
                    {getStatusLabel(product.inventoryStatus)}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-white">
                    {product.stockQuantity}
                  </span>
                  <span className="text-xs text-white/40">units</span>
                </div>
                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                  <span>Low Stock Alert</span>
                  <span className="text-white/80 font-medium">
                    {product.lowStockThreshold || 5} units
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block">
                Specifications
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {specItems.map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-xl  px-3.5 py-2.5 flex items-center justify-between gap-2"
                  >
                    <span className="text-xs text-white/50 shrink-0">
                      {spec.label}
                    </span>
                    <span className="text-xs text-white font-medium truncate text-right">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {product.vehicleCompatibility &&
              product.vehicleCompatibility.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block">
                    Vehicle Compatibility
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.vehicleCompatibility.map((veh, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 font-medium"
                      >
                        {veh}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {productSizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block">
                  Available Sizes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {productSizes.map((size, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 font-medium"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Timestamps Footer */}
          <div className="px-6 py-2.5 border-t border-white/10 bg-[#0e0e0e] shrink-0 flex items-center justify-between text-[11px] text-white/40">
            <div>
              <span>Created: </span>
              <span className="font-mono text-white/60">
                {formatDate(product.createdAt)}
              </span>
            </div>
            <div>
              <span>Last Updated: </span>
              <span className="font-mono text-white/60">
                {formatDate(product.updatedAt || product.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

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

      {isStockModalOpen && (
        <div
          aria-modal="true"
          role="dialog"
          onClick={(e) => {
            e.stopPropagation();
            setIsStockModalOpen(false);
            setStockToAdd("");
            setStockError(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#121212] p-5 shadow-2xl text-white space-y-4"
          >
            <div>
              <h3 className="text-xs font-bold text-white">Add Stock Units</h3>
              <p className="text-xs text-white/50 mt-0.5">
                Current stock:{" "}
                <span className="text-white font-medium">
                  {product.stockQuantity}
                </span>{" "}
                units
              </p>
            </div>

            <div>
              <label className="text-xs text-white/50 block mb-1">
                Units to add
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={stockToAdd}
                onChange={(e) => {
                  const value = e.target.value;
                  setStockToAdd(value);

                  if (value === "") {
                    setStockError(null);
                  } else {
                    const num = parseInt(value, 10);
                    if (
                      isNaN(num) ||
                      num <= 0 ||
                      !Number.isInteger(parseFloat(value))
                    ) {
                      setStockError("Please enter a positive whole number");
                    } else {
                      setStockError(null);
                    }
                  }
                }}
                placeholder="Enter quantity"
                className="w-full h-9 rounded-lg bg-[#0a0a0a] border border-white/10 px-3 text-xs text-white outline-none focus:border-white/30"
              />
              {stockError && (
                <p className="text-xs text-red-400 mt-1">{stockError}</p>
              )}
            </div>

            {stockToAdd && !stockError && parseInt(stockToAdd, 10) > 0 && (
              <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">
                  New Stock Total
                </p>
                <p className="text-base font-bold text-emerald-400">
                  {product.stockQuantity + parseInt(stockToAdd, 10)} units
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsStockModalOpen(false);
                  setStockToAdd("");
                  setStockError(null);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  !stockToAdd ||
                  stockError !== null ||
                  parseInt(stockToAdd, 10) <= 0
                }
                onClick={() => {
                  const qty = parseInt(stockToAdd, 10);
                  if (qty > 0 && !isNaN(qty)) {
                    onAddStock?.(product, qty);
                    setIsStockModalOpen(false);
                    setStockToAdd("");
                    setStockError(null);
                  }
                }}
                className="rounded-lg bg-[#640C0C] hover:bg-[#7a1010] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
