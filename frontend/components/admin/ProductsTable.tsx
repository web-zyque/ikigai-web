"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Package, Search, X } from "lucide-react";
import { InventoryProduct, InventoryStatus } from "@/components/admin/ProductsInventoryTable";
import { DEMO_PRODUCTS_BY_ID } from "@/data/demoProducts";

export interface ProductsTableProps {
  products: InventoryProduct[];
  onViewProduct?: (productId: string) => void;
  statusFilter?: "All" | "In Stock" | "Low Stock" | "Out of Stock";
  onStatusFilterChange?: (status: "All" | "In Stock" | "Low Stock" | "Out of Stock") => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (cat: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

function ProductThumbnail({ src, alt }: { src?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative h-10 w-10 min-w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] flex items-center justify-center">
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="40px"
          unoptimized
          className="object-contain p-1"
          style={{ objectFit: "contain" }}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-white/5 text-white/30">
          <Package className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

export default function ProductsTable({
  products,
  onViewProduct,
  statusFilter = "All",
  onStatusFilterChange,
  categoryFilter = "All",
  onCategoryFilterChange,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
}: ProductsTableProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchQueryChange || setInternalSearchQuery;

  const [localStatusFilter, setLocalStatusFilter] = useState<"All" | "In Stock" | "Low Stock" | "Out of Stock">(statusFilter);
  const activeStatusFilter = onStatusFilterChange ? statusFilter : localStatusFilter;

  const [localCategoryFilter, setLocalCategoryFilter] = useState<string>(categoryFilter);
  const activeCategoryFilter = onCategoryFilterChange ? categoryFilter : localCategoryFilter;

  const handleStatusChange = (val: "All" | "In Stock" | "Low Stock" | "Out of Stock") => {
    setLocalStatusFilter(val);
    onStatusFilterChange?.(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setLocalCategoryFilter(val);
    onCategoryFilterChange?.(val);
    setCurrentPage(1);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [products, searchQuery, activeStatusFilter, activeCategoryFilter]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      if (activeStatusFilter !== "All" && product.status !== activeStatusFilter) {
        return false;
      }

      if (activeCategoryFilter !== "All" && product.category !== activeCategoryFilter) {
        return false;
      }

      if (query) {
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesSku = product.sku.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);

        if (!matchesName && !matchesSku && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [products, activeStatusFilter, activeCategoryFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case "In Stock":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            In Stock
          </span>
        );
      case "Low Stock":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Low Stock
          </span>
        );
      case "Out of Stock":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Out of Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-medium text-white/60">
            {status}
          </span>
        );
    }
  };

  const statusTabs: Array<"All" | "In Stock" | "Low Stock" | "Out of Stock"> = [
    "All",
    "In Stock",
    "Low Stock",
    "Out of Stock",
  ];

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 px-6 py-4 bg-[#121212]">
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/5 w-fit overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {statusTabs.map((tab) => {
            const isActive = activeStatusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleStatusChange(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-black shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right: Search Box + Category Dropdown (no label text) */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full h-8.5 rounded-lg bg-[#0a0a0a] border border-white/10 pl-8.5 pr-7 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 focus:bg-[#121212]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <select
            id="category-filter"
            value={activeCategoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            aria-label="Filter by category"
            className="h-8.5 rounded-lg bg-[#0a0a0a] border border-white/10 px-3 text-xs text-white outline-none focus:border-white/30 cursor-pointer transition-colors"
          >
            <option value="All" className="bg-[#121212] text-white">
              All Categories
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#121212] text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-[#0a0a0a] text-white/40">
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                SKU
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider">
                Product Title
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Category
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Price
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Stock
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Stock Status
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Last Modified
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-xs text-white/40"
                >
                  <p className="text-sm font-medium text-white/70 mb-1">
                    No products found
                  </p>
                  <p className="text-xs text-white/40 mb-3 max-w-sm mx-auto">
                    {searchQuery
                      ? `No products match "${searchQuery}". Check the product name or SKU.`
                      : "No products match the selected criteria."}
                  </p>
                  {(searchQuery || activeStatusFilter !== "All" || activeCategoryFilter !== "All") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        handleStatusChange("All");
                        handleCategoryChange("All");
                        setCurrentPage(1);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => {
                const formattedDate = product.updatedAt
                  ? new Date(product.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently";

                return (
                  <tr
                    key={product.id}
                    onClick={() => onViewProduct?.(product.id)}
                    className="transition-colors hover:bg-white/[0.04] cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-mono font-medium text-white/90 whitespace-nowrap">
                      <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-xs text-white group-hover:border-[#640C0C]/50 transition-colors">
                        {product.sku}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 min-w-[240px]">
                      <span className="font-medium text-white group-hover:text-white line-clamp-1">
                        {product.name}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-white/70">
                      {product.category}
                    </td>

                    <td className="px-5 py-3.5 font-bold text-white whitespace-nowrap text-[13px]">
                      {product.price}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-white/90">
                      {product.stock}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getStatusBadge(product.status)}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap text-white/50 text-[11px] font-mono">
                      {formattedDate}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 bg-[#0a0a0a] px-6 py-3.5 text-xs text-white/40">
        <div>
          Showing{" "}
          <span className="font-semibold text-white/90">
            {paginatedProducts.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-white/90">
            {filteredProducts.length}
          </span>{" "}
          products
        </div>

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
