"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Inter } from "next/font/google";
import { SlidersHorizontal, X, Search, Sparkles, RotateCcw } from "lucide-react";
import FilterSidebar, { categoryGroups } from "@/components/store/FilterSidebar";
import ProductCard from "@/components/store/ProductCard";
import { searchStoreCatalog, detectSearchIntent } from "@/data/storeCatalog";

const inter = Inter({ subsets: ["latin"] });

interface ProductsListProps {
  initialCategory?: string;
  initialSearch?: string;
  initialBrand?: string;
}

export default function ProductsList({
  initialCategory = "",
  initialSearch = "",
  initialBrand = "",
}: ProductsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read latest params or fallback to props
  const currentCategory = searchParams.get("category") ?? initialCategory;
  const currentSearch = searchParams.get("search") ?? searchParams.get("q") ?? initialSearch;
  const currentBrand = searchParams.get("brand") ?? initialBrand;

  const [prevSearch, setPrevSearch] = useState(currentSearch);
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync input value when URL query changes without triggering cascading renders
  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    setSearchInput(currentSearch);
  }

  // Execute catalog search and scoring
  const { results, intent, isRelatedFallback, totalMatches } = useMemo(() => {
    return searchStoreCatalog(currentSearch, {
      category: currentCategory,
      brand: currentBrand,
    });
  }, [currentSearch, currentCategory, currentBrand]);

  const updateUrl = (updates: {
    category?: string | null;
    search?: string | null;
    brand?: string | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.category !== undefined) {
      if (!updates.category || updates.category === "all") params.delete("category");
      else params.set("category", updates.category);
    }
    if (updates.search !== undefined) {
      if (!updates.search) {
        params.delete("search");
        params.delete("q");
      } else {
        params.set("search", updates.search);
      }
    }
    if (updates.brand !== undefined) {
      if (!updates.brand) params.delete("brand");
      else params.set("brand", updates.brand);
    }
    const queryStr = params.toString();
    router.push(queryStr ? `/products?${queryStr}` : "/products");
  };

  const handleInlineSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (!trimmed) {
      updateUrl({ search: null });
      return;
    }
    const detected = detectSearchIntent(trimmed);
    if (detected.type === "category" && detected.categorySlug) {
      updateUrl({ category: detected.categorySlug, search: trimmed });
    } else if (detected.type === "brand" && detected.brandName) {
      updateUrl({ brand: detected.brandName, search: trimmed });
    } else {
      updateUrl({ search: trimmed });
    }
  };

  const activeCategoryLabel = useMemo(() => {
    for (const group of categoryGroups) {
      const found = group.items.find((i) => i.slug === currentCategory);
      if (found) return found.label;
    }
    return "All Products";
  }, [currentCategory]);

  const pageTitle = useMemo(() => {
    if (currentSearch) {
      return `Results for "${currentSearch}"`;
    }
    if (currentBrand) {
      return `Products by ${currentBrand}`;
    }
    return activeCategoryLabel;
  }, [currentSearch, currentBrand, activeCategoryLabel]);

  const popularSuggestions = [
    "Brakes",
    "LED Lighting",
    "Suspension",
    "Alloy Wheels",
    "Brembo",
    "Bosch",
    "Akrapovic",
    "Exhaust",
  ];

  return (
    <div className={`${inter.className} bg-black text-white`}>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 flex gap-10 lg:gap-14 items-start">
        {/* Sticky Desktop Filter Sidebar */}
        <div
          className="filter-scroll hidden lg:block sticky top-0 h-screen overflow-y-auto overflow-x-hidden shrink-0 w-52 pt-10 pb-12 pr-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.18) transparent",
          }}
        >
          <FilterSidebar activeCategory={currentCategory} />
        </div>

        {/* Main Products Content */}
        <main className="flex-1 min-w-0 pt-10 pb-16">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {pageTitle}
                </h1>
                <p className="mt-1.5 text-xs text-white/40">
                  {results.length} product{results.length !== 1 ? "s" : ""}{" "}
                  {currentSearch ? "found for your search" : "available"}
                </p>
              </div>

              {/* Top search & filter bar */}
              <div className="flex items-center gap-2.5">
                <form
                  onSubmit={handleInlineSearchSubmit}
                  className="flex items-center w-full sm:w-64 rounded-full bg-white/10 px-3.5 py-2 border border-white/20 focus-within:border-white/40 focus-within:bg-white/15 transition-colors"
                >
                  <Search className="h-4 w-4 text-white/40 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search parts, brands..."
                    className="w-full bg-transparent text-xs text-white placeholder-white/40 outline-none"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        updateUrl({ search: null });
                      }}
                      className="text-white/40 hover:text-white ml-1 shrink-0"
                      aria-label="Clear input"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </form>

                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-white/40 hover:text-white transition-colors lg:hidden shrink-0"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                </button>
              </div>
            </div>

            {/* Active search filter pills */}
            {(currentSearch || currentBrand || (currentCategory && currentCategory !== "all")) && (
              <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
                <span className="text-xs text-white/40">Active filters:</span>

                {currentSearch && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white border border-white/20">
                    Search: <strong>&ldquo;{currentSearch}&rdquo;</strong>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        updateUrl({ search: null });
                      }}
                      className="ml-1 text-white/40 hover:text-white"
                      aria-label="Remove search filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {intent.type === "category" && currentSearch && (
                  <span className="rounded-full bg-[#640C0C]/30 border border-[#640C0C]/50 px-2.5 py-0.5 text-[11px] text-red-200">
                    🏷️ Category: {intent.categoryLabel || intent.matchedEntityName}
                  </span>
                )}

                {intent.type === "brand" && currentSearch && (
                  <span className="rounded-full bg-[#640C0C]/30 border border-[#640C0C]/50 px-2.5 py-0.5 text-[11px] text-red-200">
                    🏢 Brand: {intent.brandName || intent.matchedEntityName}
                  </span>
                )}

                {currentBrand && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white border border-white/20">
                    Brand: <strong>{currentBrand}</strong>
                    <button
                      type="button"
                      onClick={() => updateUrl({ brand: null })}
                      className="ml-1 text-white/40 hover:text-white"
                      aria-label="Remove brand filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {currentCategory && currentCategory !== "all" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white border border-white/20">
                    Category: <strong>{activeCategoryLabel}</strong>
                    <button
                      type="button"
                      onClick={() => updateUrl({ category: null })}
                      className="ml-1 text-white/40 hover:text-white"
                      aria-label="Remove category filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    updateUrl({ category: null, search: null, brand: null });
                  }}
                  className="flex items-center gap-1 text-xs text-[#e05252] hover:underline ml-2"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear all
                </button>
              </div>
            )}

            {/* Related products alert banner */}
            {isRelatedFallback && currentSearch && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3.5 text-xs text-white/70">
                <Sparkles className="h-4 w-4 text-[#e05252] shrink-0" />
                <p>
                  No exact match for <strong>&ldquo;{currentSearch}&rdquo;</strong>. Showing mostly related products and popular parts below:
                </p>
              </div>
            )}
          </div>

          {/* Product Grid */}
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-white/5 border border-white/10">
                <Search className="h-7 w-7 text-white/30" />
              </div>
              <h2 className="text-lg font-semibold text-white/80 mb-2">
                No products found {currentSearch ? `for "${currentSearch}"` : ""}
              </h2>
              <p className="text-sm text-white/40 max-w-sm mb-6">
                We couldn&apos;t find matching parts. Try checking your spelling or explore these popular searches:
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {popularSuggestions.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchInput(term);
                      const detected = detectSearchIntent(term);
                      if (detected.type === "category" && detected.categorySlug) {
                        updateUrl({ category: detected.categorySlug, search: term });
                      } else if (detected.type === "brand" && detected.brandName) {
                        updateUrl({ brand: detected.brandName, search: term });
                      } else {
                        updateUrl({ search: term });
                      }
                    }}
                    className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs text-white/80 hover:bg-[#640C0C] hover:text-white transition-colors border border-white/15"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-[#0a0a0a] border-r border-white/10 p-6 overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Filter</p>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Close filter"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterSidebar activeCategory={currentCategory} />
          </div>
        </div>
      )}
    </div>
  );
}
