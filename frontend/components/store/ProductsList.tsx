"use client";

import { useState, useMemo } from "react";
import { Inter } from "next/font/google";
import { SlidersHorizontal, X } from "lucide-react";
import FilterSidebar, { categoryGroups } from "@/components/store/FilterSidebar";
import ProductCard, { Product } from "@/components/store/ProductCard";

const inter = Inter({ subsets: ["latin"] });

const allProducts: Product[] = Array.from({ length: 25 }).map((_, i) => ({
  id: i,
  name:
    i % 5 === 0
      ? `Premium Brake Kit ${i + 1}`
      : i % 5 === 1
      ? `Performance Suspension ${i + 1} — Pro Series`
      : i % 5 === 2
      ? `Engine Tuning Module ${i + 1}`
      : i % 5 === 3
      ? `Alloy Wheel Set ${i + 1} — Forged`
      : `LED Lighting Kit ${i + 1}`,
  price: `₹${(1299 + i * 150).toLocaleString()}`,
  image:
    i % 5 === 0
      ? `/images/category_brakes.jpg`
      : i % 5 === 1
      ? `/images/category_suspension.jpg`
      : i % 5 === 2
      ? `/images/category_engine.jpg`
      : i % 5 === 3
      ? `/images/category_wheels.jpg`
      : `/images/category_lighting.jpg`,
    
  category:
    i % 5 === 0
      ? "brakes"
      : i % 5 === 1
      ? "suspension"
      : i % 5 === 2
      ? "engine"
      : i % 5 === 3
      ? "alloy-wheels"
      : "lighting",
}));

interface ProductsListProps {
  initialCategory: string;
}

export default function ProductsList({ initialCategory }: ProductsListProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!initialCategory || initialCategory === "all") return allProducts;
    return allProducts.filter((p) => p.category === initialCategory);
  }, [initialCategory]);

  const activeLabel = useMemo(() => {
    for (const group of categoryGroups) {
      const found = group.items.find((i) => i.slug === initialCategory);
      if (found) return found.label;
    }
    return "All Products";
  }, [initialCategory]);

  return (
    <div className={`${inter.className} bg-black text-white`}>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 flex gap-10 lg:gap-14 items-start">
        <div
          className="filter-scroll hidden lg:block sticky top-0 h-screen overflow-y-auto overflow-x-hidden shrink-0 w-52 pt-10 pb-12 pr-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.18) transparent",
          }}
        >
          <FilterSidebar activeCategory={initialCategory} />
        </div>

        <main className="flex-1 min-w-0 pt-10 pb-16">
          <div className="mb-8">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  {activeLabel}
                </h1>
                <p className="mt-1.5 text-xs text-white/40">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 hover:border-white/40 hover:text-white transition-colors lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-white/5 border border-white/10">
                <SlidersHorizontal className="h-7 w-7 text-white/30" />
              </div>
              <h2 className="text-lg font-semibold text-white/80 mb-2">No products found</h2>
              <p className="text-sm text-white/40">Try selecting a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile filter drawer ── */}
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
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterSidebar activeCategory={initialCategory} />
          </div>
        </div>
      )}
    </div>
  );
}
