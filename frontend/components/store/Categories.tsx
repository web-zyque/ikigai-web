"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const categories = [
  { name: "Brakes", slug: "brakes", image: "/images/category_brakes.jpg", count: 12 },
  { name: "Suspension", slug: "suspension", image: "/images/category_suspension.jpg", count: 8 },
  { name: "Engine", slug: "engine", image: "/images/category_engine.jpg", count: 4 },
  { name: "Tires", slug: "performance-tires", image: "/images/category_tires.jpg", count: 15 },
  { name: "Exhaust", slug: "exhaust", image: "/images/category_suspension.jpg", count: 6 },
  { name: "Cooling", slug: "cooling", image: "/images/category_engine.jpg", count: 5 },
  { name: "Electrical", slug: "electrical", image: "/images/category_brakes.jpg", count: 9 },
  { name: "Alloy Wheels", slug: "alloy-wheels", image: "/images/category_tires.jpg", count: 7 },
];

export default function Categories() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
  }, []);

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

  return (
    <section className="bg-black text-white py-12 relative">
      <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-12 relative">
        <h2 className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl">Categories</h2>

        <div className="relative group">
          <div className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-12 sm:w-20 bg-gradient-to-r from-black via-black/80 to-transparent transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-12 sm:w-20 bg-gradient-to-l from-black via-black/80 to-transparent transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />

          <button
            onClick={() => scroll("left")}
            className={`absolute -left-2 sm:-left-4 top-1/2 z-20 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-[#640C0C] ${canScrollLeft ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            aria-label="Scroll left"
          >
            <FaChevronLeft className="h-4 w-4 pr-0.5" />
          </button>

          <button
            onClick={() => scroll("right")}
            className={`absolute -right-2 sm:-right-4 top-1/2 z-20 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white transition-all hover:bg-[#640C0C] ${canScrollRight ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            aria-label="Scroll right"
          >
            <FaChevronRight className="h-4 w-4 pl-0.5" />
          </button>

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 items-stretch"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${category.slug}`}
                className="group/category snap-start shrink-0 w-[45vw] sm:w-[calc((100%-32px)/4.2)] lg:w-[calc((100%-64px)/6.2)] flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-2"
              >
                <div className="relative mb-4 h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-contain mix-blend-screen transition-transform duration-500 group-hover/category:scale-110"
                  />
                </div>
                <h3 className="text-[13px] font-medium">{category.name}</h3>
                <span className="mt-1 text-[11px] text-white/40">{category.count} items</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
