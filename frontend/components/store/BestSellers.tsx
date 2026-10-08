"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Inter } from "next/font/google";
import { useCart } from "@/context/CartContext";

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
  const { cartItems, addToCart } = useCart();
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
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Best Selling Products</h2>
          <Link
            href="/products"
            className="shrink-0 text-sm font-semibold text-[#640C0C] transition-opacity hover:opacity-80"
          >
            View All
          </Link>
        </div>

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
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pt-4 pb-4 items-stretch"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => {
              const isAdded = cartItems.some(item => item.id === product.id);

              const handleAddToCart = () => {
                if (isAdded) return;
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                });
              };

              return (
                <div
                  key={product.id}
                  className={`group/card ${inter.className} snap-start shrink-0 w-[47vw] sm:w-[calc((100%-32px)/3.2)] lg:w-[calc((100%-64px)/5.2)] h-auto sm:h-[480px] flex flex-col rounded-[20px] bg-[#121212] border border-white/5 overflow-hidden hover:-translate-y-1 transition-transform duration-300`}
                >
                  <div className="relative w-full aspect-[3/4] bg-[#0a0a0a] shrink-0 p-4">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain mix-blend-screen p-4 group-hover/card:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex flex-col p-4 grow-0 sm:grow">
                    <h3 className="text-[13px] font-medium text-white line-clamp-2 h-[40px] mb-1">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-[#640C0C] mb-2">{product.price}</p>

                    <div className="mt-0 sm:mt-auto flex w-full gap-2 font-sans transition-all duration-300">
                      <button className={`flex-1 rounded-full bg-[#640C0C] py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90`}>
                        Buy Now
                      </button>
                      {!isAdded && (
                        <button
                          onClick={handleAddToCart}
                          aria-label="Add to cart"
                          className="grid h-10 w-14 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                        >
                          <img src="/shopping-bag.svg" alt="cart" className="h-5 w-5 brightness-0 invert opacity-80" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className={`${inter.className} snap-start shrink-0 pl-4 pr-12 self-stretch flex items-center justify-center`}>
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
