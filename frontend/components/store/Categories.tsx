"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ChartBarStacked } from "lucide-react";
import { useCategories, useProducts } from "@/hooks/use-products";

export default function Categories() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch real categories and products directly from database via TanStack Query
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories();
  const { data: productsData, isLoading: isProductsLoading } = useProducts({ limit: 100 });

  // Map real product counts per category
  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (productsData?.products) {
      for (const prod of productsData.products) {
        if (prod.category?.id) {
          counts[prod.category.id] = (counts[prod.category.id] || 0) + 1;
        }
      }
    }
    return counts;
  }, [productsData]);

  // Sort categories: Priority to categories with an image in front, others without image to the back
  const sortedCategories = useMemo(() => {
    if (!categoriesData) return [];
    return [...categoriesData].sort((a, b) => {
      const aHasImg = Boolean(a.imageUrl && a.imageUrl.trim().length > 0);
      const bHasImg = Boolean(b.imageUrl && b.imageUrl.trim().length > 0);

      // Prioritize categories with images
      if (aHasImg && !bHasImg) return -1;
      if (!aHasImg && bHasImg) return 1;

      // Secondary alphabetical sort
      return a.name.localeCompare(b.name);
    });
  }, [categoriesData]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [sortedCategories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.8
          : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const isLoading = isCategoriesLoading || isProductsLoading;

  // If loading finished and no categories exist in database, do not render empty section
  if (!isLoading && sortedCategories.length === 0) {
    return null;
  }

  return (
    <section className="bg-black text-white py-12 relative">
      <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-12 relative">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Categories</h2>

        <div className="relative group mt-6">
          <div
            className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-12 sm:w-20 bg-gradient-to-r from-black via-black/80 to-transparent transition-opacity duration-300 ${
              canScrollLeft ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-12 sm:w-20 bg-gradient-to-l from-black via-black/80 to-transparent transition-opacity duration-300 ${
              canScrollRight ? "opacity-100" : "opacity-0"
            }`}
          />

          <button
            onClick={() => scroll("left")}
            className={`absolute -left-2 sm:-left-4 top-1/2 z-20 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-[#640C0C] ${
              canScrollLeft ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
            aria-label="Scroll left"
          >
            <FaChevronLeft className="h-4 w-4 pr-0.5" />
          </button>

          <button
            onClick={() => scroll("right")}
            className={`absolute -right-2 sm:-right-4 top-1/2 z-20 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-[#640C0C] ${
              canScrollRight ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
            aria-label="Scroll right"
          >
            <FaChevronRight className="h-4 w-4 pl-0.5" />
          </button>

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 items-stretch"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {isLoading ? (
              // Loading Skeleton Placeholders
              Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="snap-start shrink-0 w-[45vw] sm:w-[calc((100%-32px)/4.2)] lg:w-[calc((100%-64px)/6.2)] flex flex-col items-center justify-center text-center animate-pulse"
                >
                  <div className="mb-4 h-28 w-28 sm:h-32 sm:w-32 lg:h-36 lg:w-36 rounded-xl bg-white/5" />
                  <div className="h-4 w-20 rounded bg-white/10 mb-1.5" />
                  <div className="h-3 w-12 rounded bg-white/5" />
                </div>
              ))
            ) : (
              sortedCategories.map((category) => {
                const count = productCounts[category.id] || 0;
                const hasImage = Boolean(category.imageUrl && category.imageUrl.trim().length > 0);

                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="group/category snap-start shrink-0 w-[45vw] sm:w-[calc((100%-32px)/4.2)] lg:w-[calc((100%-64px)/6.2)] flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-2 duration-400"
                  >
                    <div className="relative mb-4 h-28 w-28 sm:h-32 sm:w-32 lg:h-36 lg:w-36 flex items-center justify-center">
                      {hasImage ? (
                        <Image
                          src={category.imageUrl!}
                          alt={category.name}
                          fill
                          sizes="(max-width: 640px) 112px, (max-width: 1024px) 128px, 144px"
                          className="object-contain mix-blend-screen transition-transform duration-500 group-hover/category:scale-110"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-white/30">
                          <ChartBarStacked className="h-12 w-12 sm:h-14 sm:w-14" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-[13px] sm:text-sm font-medium text-white truncate max-w-full px-1">
                      {category.name}
                    </h3>
                    <span className="mt-1 text-[11px] text-white/40">
                      {count} {count === 1 ? "item" : "items"}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
