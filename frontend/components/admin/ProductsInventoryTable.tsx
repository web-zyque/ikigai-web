"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Search, Package, ChevronLeft, ChevronRight, X } from "lucide-react";

export type InventoryStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface InventoryProduct {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: string;
  stock: number;
  status: InventoryStatus;
  image?: string;
  imageUrl?: string;
  updatedAt?: string;
}

export interface ProductsInventoryTableProps {
  products?: InventoryProduct[];
  totalCount?: number;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  footerText?: string;
  onBackToOverview?: () => void;
  activeTab?: string | null;
  onTabChange?: (tab: string | null) => void;
  onViewProduct?: (productId: string) => void;
}

function ProductThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative h-[44px] w-[44px] min-w-[44px] shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] flex items-center justify-center">
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="44px"
          unoptimized
          className="object-contain p-1"
          style={{ objectFit: "contain" }}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-white/5 text-white/30">
          <Package className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

export default function ProductsInventoryTable({
  products = [],
  totalCount,
  title = "TOTAL PRODUCTS",
  subtitle,
  badgeText,
  footerText = "Stock updated 2m ago",
  onBackToOverview,
  activeTab,
  onTabChange,
  onViewProduct,
}: ProductsInventoryTableProps) {
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("search") || "";
    }
    return "";
  });

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Reset pagination to first page when search or category filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [products, searchQuery]);

  const effectiveTotalCount = totalCount !== undefined ? totalCount : products.length;

  // Filtered results by search query
  const filteredList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Pagination calculation on filtered results
  const totalPages = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedProducts = filteredList.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case "In Stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            {status}
          </span>
        );
      case "Low Stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            {status}
          </span>
        );
      case "Out of Stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#640C0C]/50 bg-[#640C0C]/25 px-3 py-1 text-xs font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#640C0C] animate-pulse" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm animate-in fade-in duration-300">
      {/* Category Header with Back to Overview */}
      <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-6 bg-[#121212]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold tracking-tight text-white whitespace-nowrap">{title}</h2>
              <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-xs font-semibold text-white/90">
                {filteredList.length} {filteredList.length === 1 ? "Product" : "Products"}
              </span>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-9 pr-8 text-sm text-white placeholder-white/40 focus:border-[#640C0C]/50 focus:outline-none focus:ring-1 focus:ring-[#640C0C]/50 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          {onTabChange && (
            <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1 overflow-x-auto no-scrollbar">
              {["All", "In Stock", "Low Stock", "Out of Stock"].map((tab) => {
                const tabValue = tab === "All" ? null : tab === "In Stock" ? "in_stock" : tab === "Low Stock" ? "low_stock" : "out_of_stock";
                const isActive = activeTab === tabValue;
                return (
                  <button
                    key={tab}
                    onClick={() => onTabChange(tabValue)}
                    className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-white text-black shadow-sm"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-[#0a0a0a] text-white/40">
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider">Product</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">Category</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">SKU</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">Price</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">Stock</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-xs text-white/40"
                >
                  <p className="text-sm font-medium text-white/70 mb-1">
                    No products found
                  </p>
                  <p className="text-xs text-white/40 mb-3 max-w-sm mx-auto">
                    {searchQuery
                      ? `No products match "${searchQuery}". Check the product name or SKU.`
                      : "No products match the selected category."}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Reset Search
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => {
                const imageSrc = product.image || product.imageUrl || undefined;

                return (
                  <tr
                    key={product.id}
                    onClick={() => onViewProduct?.(product.id)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onViewProduct?.(product.id);
                      }
                    }}
                    className="transition-colors hover:bg-[#640C0C]/10 cursor-pointer group focus:outline-none focus:bg-[#640C0C]/15"
                  >
                    <td className="px-6 py-4 font-medium text-white min-w-[260px] text-[13px]">
                      <div className="flex items-center gap-3">
                        <ProductThumbnail src={imageSrc} alt={product.name} />
                        <span className="font-medium text-white">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70 whitespace-nowrap">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 font-mono text-white/40 whitespace-nowrap">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#640C0C] whitespace-nowrap text-sm">
                      {product.price}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white/90 whitespace-nowrap">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(product.status)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 bg-[#0a0a0a] px-6 py-3.5 text-xs text-white/40">
        <div>
          Showing{" "}
          <span className="font-semibold text-white/90">
            {filteredList.length === 0 ? 0 : startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-white/90">
            {Math.min(startIndex + PAGE_SIZE, filteredList.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-white/90">
            {filteredList.length}
          </span>{" "}
          matching products
          <span className="text-white/40">
            {" "}
            &bull; {effectiveTotalCount} total available
          </span>
        </div>

        {/* Minimal Pagination Controls: only < and > */}
        <div className="flex items-center gap-1.5 select-none">
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${
              safeCurrentPage <= 1
                ? "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${
              safeCurrentPage >= totalPages
                ? "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
