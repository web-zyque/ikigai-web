"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ShoppingCart } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const products = Array.from({ length: 10 }).map((_, i) => ({
  id: i,
  name: i % 3 === 0
    ? `Premium Part ${i + 1}`
    : `Premium Performance Part ${i + 1} with Extra Long Title to Test the Two Line Clamping Behavior`,
  price: `₹${(299 + i * 50).toLocaleString()}`,
  image: i % 2 === 0 ? "/images/category_brakes.jpg" : "/images/category_suspension.jpg",
}));

export default function BestSellers() {
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
        <h2 className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl">Best Selling Products</h2>

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
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 items-stretch"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className={`${inter.className} snap-start shrink-0 w-[75vw] sm:w-[calc((100%-32px)/3.2)] lg:w-[calc((100%-64px)/5.2)] h-[460px] flex flex-col rounded-[20px] bg-[#121212] border border-white/5 overflow-hidden`}
              >
                <div className="relative w-full aspect-[3/4] bg-[#0a0a0a] shrink-0 p-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain mix-blend-screen p-4"
                  />
                </div>

                <div className="flex flex-col p-4 grow">

                  <h3 className="text-[13px] font-medium text-white line-clamp-2 h-[40px] mb-1">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-[#640C0C] mb-2">{product.price}</p>

                  <div className="mt-auto flex w-full gap-2 font-sans">
                    <button className="w-[80%] rounded-full bg-[#640C0C] py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90">
                      Buy Now
                    </button>
                    <button
                      aria-label="Buy Now"
                      className="grid w-[20%] place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                    >
                      <ShoppingCart className="h-4 w-4 text-white/80" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className={`${inter.className} snap-start shrink-0 pl-4 pr-12 h-[460px] flex items-center justify-center`}>
              <Link
                href="/products"
                className="group flex items-center gap-2 rounded-full bg-[#640C0C] px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 whitespace-nowrap"
              >
                Show All
                <FaChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
