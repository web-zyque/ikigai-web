"use client";

import React, { useState, useMemo } from "react";
import { Search, X, ChevronLeft, ChevronRight, FolderTree, Plus } from "lucide-react";
import { CategoryResponse } from "@/types/products.types";

export interface CategoryRowItem extends CategoryResponse {
  productsCount: number;
}

export interface CategoriesTableProps {
  categories: CategoryRowItem[];
  isLoading?: boolean;
  onAddCategory?: () => void;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

const DEFAULT_PAGE_SIZE = 10;

export default function CategoriesTable({
  categories,
  isLoading = false,
  onAddCategory,
  totalCount: externalTotalCount,
  page: externalPage,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange: externalOnPageChange,
  searchQuery: externalSearchQuery,
  onSearchQueryChange: externalOnSearchQueryChange,
}: CategoriesTableProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);

  const searchQuery =
    externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const currentPage =
    externalPage !== undefined ? externalPage : internalCurrentPage;

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();

    return categories.filter((cat) => {
      const matchName = cat.name.toLowerCase().includes(q);
      const matchSlug = cat.slug.toLowerCase().includes(q);
      const matchId = cat.id.toLowerCase().includes(q);
      const matchDesc = cat.description ? cat.description.toLowerCase().includes(q) : false;
      return matchName || matchSlug || matchId || matchDesc;
    });
  }, [categories, searchQuery]);

  const effectiveTotal =
    externalTotalCount !== undefined ? externalTotalCount : filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedCategories = useMemo(() => {
    if (externalTotalCount !== undefined) {
      return categories;
    }
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredCategories.slice(startIndex, startIndex + pageSize);
  }, [categories, filteredCategories, safeCurrentPage, pageSize, externalTotalCount]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (externalOnSearchQueryChange) {
      externalOnSearchQueryChange(val);
    } else {
      setInternalSearchQuery(val);
    }

    if (externalOnPageChange) {
      externalOnPageChange(1);
    } else {
      setInternalCurrentPage(1);
    }
  };

  const handleClearSearch = () => {
    if (externalOnSearchQueryChange) {
      externalOnSearchQueryChange("");
    } else {
      setInternalSearchQuery("");
    }

    if (externalOnPageChange) {
      externalOnPageChange(1);
    } else {
      setInternalCurrentPage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    const clamped = Math.min(Math.max(1, newPage), totalPages);
    if (externalOnPageChange) {
      externalOnPageChange(clamped);
    } else {
      setInternalCurrentPage(clamped);
    }
  };

  const from = effectiveTotal === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const to = effectiveTotal === 0 ? 0 : Math.min(safeCurrentPage * pageSize, effectiveTotal);

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm animate-in fade-in duration-300">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 px-6 py-4 bg-[#121212]">
        <div className="relative flex-1 sm:max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search categories..."
            aria-label="Search categories"
            className="w-full h-8.5 rounded-lg bg-[#0a0a0a] border border-white/10 pl-8.5 pr-7 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 focus:bg-[#121212]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-[#0a0a0a] text-white/40">
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Category ID
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider">
                Category Name
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Slug
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap text-right">
                Products
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span className="text-xs text-white/40">Loading categories...</span>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto px-4 text-center">
                    <FolderTree className="h-10 w-10 text-white/20 mb-3" />
                    <p className="text-sm font-semibold text-white">No categories available yet.</p>
                    <p className="text-xs text-white/40 mt-1 mb-4">
                      Get started by creating the first category for your store catalog.
                    </p>
                    {onAddCategory && (
                      <button
                        type="button"
                        onClick={onAddCategory}
                        className="inline-flex items-center gap-2 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-95 shadow-lg cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Category</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : paginatedCategories.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-xs text-white/40">
                  No categories matching &quot;<span className="text-white">{searchQuery}</span>&quot; found.
                </td>
              </tr>
            ) : (
              paginatedCategories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-[11px] text-white/50">
                    {cat.id}
                  </td>

                  <td className="px-6 py-4 min-w-[200px]">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white text-sm">
                        {cat.name}
                      </span>
                      {cat.description && (
                        <span className="text-[11px] text-white/40 line-clamp-1 mt-0.5">
                          {cat.description}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs text-white/70 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/5 inline-block">
                      {cat.slug}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="font-semibold text-white/90 text-sm">
                      {cat.productsCount}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 bg-[#0a0a0a] px-6 py-3.5 text-xs text-white/40">
        <div>
          Showing{" "}
          <span className="font-semibold text-white/90">{from}</span>{" "}
          to{" "}
          <span className="font-semibold text-white/90">{to}</span>{" "}
          of{" "}
          <span className="font-semibold text-white/90">{effectiveTotal}</span>{" "}
          categories
        </div>

        <div className="flex items-center gap-1.5 select-none">
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => handlePageChange(safeCurrentPage - 1)}
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
            onClick={() => handlePageChange(safeCurrentPage + 1)}
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
