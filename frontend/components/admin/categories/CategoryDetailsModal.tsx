"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  Edit,
  Image as ImageIcon,
  Archive,
  ArchiveRestore,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { CategoryRowItem } from "./CategoriesTable";
import { ProductResponse } from "@/types/products.types";
import {
  useArchiveCategory,
  useRestoreCategory,
  useDeleteCategory,
} from "@/hooks/use-products";
import { useToastStore } from "@/stores/toast-store";

export interface CategoryDetailsModalProps {
  category: CategoryRowItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (category: CategoryRowItem) => void;
  onRefresh?: () => void;
  assignedProducts?: ProductResponse[];
}

export default function CategoryDetailsModal({
  category,
  isOpen,
  onClose,
  onEdit,
  onRefresh,
  assignedProducts = [],
}: CategoryDetailsModalProps) {
  const addToast = useToastStore((state) => state.addToast);
  const archiveMutation = useArchiveCategory();
  const restoreMutation = useRestoreCategory();
  const deleteMutation = useDeleteCategory();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlockedDeleteModal, setShowBlockedDeleteModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (showDeleteConfirm) {
            setShowDeleteConfirm(false);
          } else if (showBlockedDeleteModal) {
            setShowBlockedDeleteModal(false);
          } else {
            onClose();
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose, showDeleteConfirm, showBlockedDeleteModal]);

  if (!isOpen || !category) return null;

  const totalAssignedCount = Math.max(
    category.productsCount || 0,
    assignedProducts.length
  );

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

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync(category.id);
      addToast(`Category "${category.name}" archived successfully`, "success");
      onRefresh?.();
    } catch (err: any) {
      addToast(
        err?.response?.data?.message || "Failed to archive category",
        "error"
      );
    }
  };

  const handleRestore = async () => {
    try {
      await restoreMutation.mutateAsync(category.id);
      addToast(`Category "${category.name}" restored successfully`, "success");
      onRefresh?.();
    } catch (err: any) {
      addToast(
        err?.response?.data?.message || "Failed to restore category",
        "error"
      );
    }
  };

  const handleDeleteClick = () => {
    if (totalAssignedCount > 0) {
      setShowBlockedDeleteModal(true);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(category.id);
      addToast(`Category "${category.name}" deleted successfully`, "success");
      setShowDeleteConfirm(false);
      onClose();
      onRefresh?.();
    } catch (err: any) {
      addToast(
        err?.response?.data?.message || "Failed to delete category",
        "error"
      );
    }
  };

  const isArchiving = archiveMutation.isPending;
  const isRestoring = restoreMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  const specItems = [
    { label: "Slug Code", value: `/${category.slug}` },
    {
      label: "Total Items",
      value: `${totalAssignedCount} ${
        totalAssignedCount === 1 ? "product" : "products"
      }`,
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
                Category Details
              </span>
              <span className="text-white/20">•</span>
              <span className="font-mono text-xs text-white/80 truncate">
                #{category.slug}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium ${
                  category.isArchived ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {category.isArchived ? "Archived" : "Active"}
              </span>
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
              onClick={() => onEdit?.(category)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white text-black hover:bg-white/90 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-sm"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>

            {category.isArchived ? (
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleRestore}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {isRestoring ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                ) : (
                  <ArchiveRestore className="h-3.5 w-3.5 text-amber-400" />
                )}
                <span>{isRestoring ? "Restoring..." : "Restore"}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isArchiving}
                onClick={handleArchive}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-400 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {isArchiving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Archive className="h-3.5 w-3.5" />
                )}
                <span>{isArchiving ? "Archiving..." : "Archive"}</span>
              </button>
            )}

            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteClick}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ml-auto disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                {category.name}
              </h2>
              {(category as any).description && (
                <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">
                  {(category as any).description}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              {category.imageUrl ? (
                <div className="relative w-full h-52 sm:h-60 rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden flex items-center justify-center p-3">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    unoptimized
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, 540px"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-white/10 bg-[#0a0a0a] text-white/30 text-center">
                  <ImageIcon className="h-7 w-7 mb-1.5 text-white/20" />
                  <p className="text-xs">No image uploaded for this category</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-white/10 bg-[#161616] p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/50">
                    Total Products
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-white">
                    {totalAssignedCount}
                  </span>
                  <span className="text-xs text-white/40">
                    {totalAssignedCount === 1 ? "product" : "products"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#161616] p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white/50">
                    Category Status
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span
                    className={`text-xl font-bold tracking-tight ${
                      category.isArchived ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {category.isArchived ? "Archived" : "Active"}
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
                    className="rounded-xl border border-white/5 bg-[#161616] px-3.5 py-2.5 flex items-center justify-between gap-2"
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Products in this Category
                </span>
                <span className="text-xs text-white/40">
                  {assignedProducts.length}{" "}
                  {assignedProducts.length === 1 ? "Product" : "Products"}
                </span>
              </div>

              {assignedProducts.length === 0 ? (
                <div className="p-4 rounded-xl border border-white/5 bg-[#161616] text-center">
                  <p className="text-xs text-white/40">
                    No products are currently assigned to this category.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/5 bg-[#161616] divide-y divide-white/5 overflow-hidden">
                  {assignedProducts.slice(0, 10).map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-3">
                        <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-white/10 bg-[#0a0a0a] shrink-0">
                          <Image
                            src={
                              prod.images?.[0]?.imageUrl ||
                              "/images/category_lighting.jpg"
                            }
                            alt={prod.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-white truncate">
                            {prod.name}
                          </span>
                          <span className="font-mono text-[11px] text-white/40 truncate">
                            SKU: {prod.sku}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-white">
                          ₹
                          {parseFloat(prod.sellingPrice).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
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
                    <div className="py-2 text-center text-xs text-white/40 bg-white/[0.01]">
                      + {assignedProducts.length - 10} more products
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs text-white/50">
              <div className="flex items-center justify-between px-1">
                <span>Created</span>
                <span className="font-mono text-white/70">
                  {formatDate(category.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between px-1">
                <span>Last Modified</span>
                <span className="font-mono text-white/70">
                  {formatDate(category.updatedAt || category.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-[#161616] border border-white/10 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Delete Category
                </h3>
                <p className="mt-1 text-xs text-white/60 leading-relaxed">
                  Are you sure you want to permanently delete category{" "}
                  <strong className="text-white">&quot;{category.name}&quot;</strong>?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBlockedDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowBlockedDeleteModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-[#161616] border border-amber-500/20 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Cannot Delete Category
                </h3>
                <p className="mt-1 text-xs text-white/60 leading-relaxed">
                  This category cannot be deleted because it currently has{" "}
                  <strong className="text-amber-400">
                    {totalAssignedCount} assigned product
                    {totalAssignedCount > 1 ? "s" : ""}
                  </strong>
                  .
                </p>
                <p className="mt-2 text-xs text-white/50 leading-relaxed">
                  To prevent breaking product listings and orders, categories with
                  assigned products cannot be deleted. Please reassign or delete
                  all associated products before deleting this category, or archive
                  it instead to hide it from the customer storefront.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowBlockedDeleteModal(false)}
                className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
