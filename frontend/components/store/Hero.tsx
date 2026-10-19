"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaLinkedin, FaInstagram, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  detectSearchIntent,
  STORE_CATEGORIES,
  STORE_BRANDS,
  STORE_PRODUCTS,
} from "@/data/storeCatalog";

const socials = [
  { name: "Instagram", icon: FaInstagram, href: "https://www.instagram.com/ikigai_car_accessories" },
  { name: "Twitter", icon: FaXTwitter, href: "https://www.x.com/" },
  { name: "Facebook", icon: FaFacebook, href: "https://www.facebook.com/profile.php?id=61576794269513" },
];

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/products");
      return;
    }

    setIsFocused(false);
    const intent = detectSearchIntent(trimmed);

    if (intent.type === "category" && intent.categorySlug) {
      router.push(`/products?category=${intent.categorySlug}&search=${encodeURIComponent(trimmed)}`);
    } else if (intent.type === "brand" && intent.brandName) {
      router.push(`/products?brand=${encodeURIComponent(intent.brandName)}&search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    }
  };

  // Compute live suggestions if user typed at least 2 characters
  const trimmedLower = query.trim().toLowerCase();
  const showSuggestions = isFocused && trimmedLower.length >= 2;

  const matchedCategories = showSuggestions
    ? STORE_CATEGORIES.filter(
        (c) =>
          c.slug.includes(trimmedLower) ||
          c.label.toLowerCase().includes(trimmedLower) ||
          c.keywords.some((k) => k.includes(trimmedLower))
      ).slice(0, 3)
    : [];

  const matchedBrands = showSuggestions
    ? STORE_BRANDS.filter(
        (b) =>
          b.name.toLowerCase().includes(trimmedLower) ||
          b.aliases.some((a) => a.includes(trimmedLower))
      ).slice(0, 3)
    : [];

  const matchedProducts = showSuggestions
    ? STORE_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmedLower) ||
          (p.partType && p.partType.toLowerCase().includes(trimmedLower)) ||
          p.brand.toLowerCase().includes(trimmedLower)
      ).slice(0, 3)
    : [];

  const hasSuggestions =
    matchedCategories.length > 0 || matchedBrands.length > 0 || matchedProducts.length > 0;

  return (
    <section className="relative isolate min-h-[calc(100vh-80px)] overflow-hidden bg-black text-white">
      <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:px-12 py-10 lg:py-0">

        <div className="relative z-10 max-w-xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-7 bg-[#640C0C]" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Ikigai Customs Car Accessories
            </p>
          </div>
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            Ready to Build{" "}<br />
            <span className="bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
              Something
            </span>
            <br />
            Extraordinary?
          </h1>

          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/70">
            Discover premium car accessories, performance upgrades,
            and styling essentials to personalize your ride. Find the
            perfect upgrades to match your style.
          </p>

          <div ref={containerRef} className="relative mt-10 w-full max-w-[370px]">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full items-center overflow-hidden rounded-full bg-white/10 pl-4 pr-1 py-1 backdrop-blur-md border border-white/20 transition-colors focus-within:border-white/40 focus-within:bg-white/15 shadow-lg shadow-black/40"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsFocused(true);
                }}
                onFocus={() => setIsFocused(true)}
                placeholder="Search products, brands, or part names..."
                className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder-white/50 outline-none"
              />
              <button
                type="submit"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#640C0C] text-white transition-all hover:opacity-90 active:scale-95"
                aria-label="Search"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Smart Search Suggestions Dropdown */}
            {showSuggestions && hasSuggestions && (
              <div className="absolute left-0 top-full mt-2 w-full rounded-2xl bg-[#121212]/95 backdrop-blur-xl border border-white/15 p-3 shadow-2xl shadow-black/80 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {matchedCategories.length > 0 && (
                  <div className="mb-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-2 mb-1.5">
                      Categories
                    </p>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {matchedCategories.map((c) => (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => {
                            setIsFocused(false);
                            router.push(`/products?category=${c.slug}&search=${encodeURIComponent(c.label)}`);
                          }}
                          className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-[#640C0C] transition-colors"
                        >
                          <span className="text-[#640C0C] group-hover:text-white">🏷️</span>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {matchedBrands.length > 0 && (
                  <div className="mb-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-2 mb-1.5">
                      Brands
                    </p>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {matchedBrands.map((b) => (
                        <button
                          key={b.name}
                          type="button"
                          onClick={() => {
                            setIsFocused(false);
                            router.push(`/products?brand=${encodeURIComponent(b.name)}&search=${encodeURIComponent(b.name)}`);
                          }}
                          className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-[#640C0C] transition-colors"
                        >
                          <span className="text-white/60">🏢</span>
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {matchedProducts.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-2 mb-1.5">
                      Matching Products
                    </p>
                    <div className="space-y-1">
                      {matchedProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setIsFocused(false);
                            router.push(`/products?search=${encodeURIComponent(p.name)}`);
                          }}
                          className="w-full flex items-center justify-between text-left rounded-lg px-2.5 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <span className="truncate pr-2 font-medium">{p.name}</span>
                          <span className="shrink-0 text-[11px] font-semibold text-[#640C0C]">
                            {p.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between px-2 text-[11px] text-white/40">
                  <span>Press <kbd className="rounded bg-white/10 px-1 py-0.5 text-[10px] text-white/70">Enter</kbd> to search</span>
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="text-xs font-semibold text-[#640C0C] hover:underline"
                  >
                    View all results →
                  </button>
                </div>
              </div>
            )}
          </div>

          <ul className="mt-20 hidden gap-4 lg:flex">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.name}>
                  <a
                    href={s.href || "#"}
                    aria-label={s.name}
                    className="grid h-8 w-8 place-items-center rounded-full border border-white/30 text-white/70 transition-colors hover:border-white hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative h-[400px] sm:h-[500px] lg:h-[650px]">
          <div className="absolute inset-0 -z-10 rounded-full bg-white/5 blur-3xl" />
          <Image
            src="/images/car3.png"
            alt="Black classic sports car"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain object-center scale-110 lg:scale-150 lg:object-right"
          />
        </div>
      </div>
    </section>
  );
}
