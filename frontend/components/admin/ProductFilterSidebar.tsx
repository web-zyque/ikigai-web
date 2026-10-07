"use client";

import React from "react";

export interface CategoryItem {
  label: string;
  slug: string;
  count: number;
}

export interface CategoryGroup {
  group: string;
  items: CategoryItem[];
}

export const ADMIN_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    group: "PARTS",
    items: [
      { label: "Brakes", slug: "brakes", count: 12 },
      { label: "Suspension", slug: "suspension", count: 8 },
      { label: "Engine", slug: "engine", count: 4 },
      { label: "Exhaust", slug: "exhaust", count: 6 },
      { label: "Transmission", slug: "transmission", count: 3 },
      { label: "Cooling", slug: "cooling", count: 5 },
      { label: "Electrical", slug: "electrical", count: 9 },
    ],
  },
  {
    group: "TIRES & WHEELS",
    items: [
      { label: "Alloy Wheels", slug: "alloy-wheels", count: 7 },
      { label: "Performance Tires", slug: "performance-tires", count: 15 },
      { label: "Off-Road", slug: "off-road", count: 4 },
    ],
  },
  {
    group: "ACCESSORIES",
    items: [
      { label: "Interior", slug: "interior", count: 11 },
      { label: "Exterior", slug: "exterior", count: 8 },
      { label: "Lighting", slug: "lighting", count: 6 },
      { label: "Audio", slug: "audio", count: 5 },
    ],
  },
];

export const matchCategorySlug = (productCategory: string, slug: string): boolean => {
  if (!slug || slug === "all") return true;
  const p = productCategory.toLowerCase();
  const s = slug.toLowerCase();

  if (s === "all") return true;
  if (s === "lighting") return p.includes("light") || p.includes("lamp");
  if (s === "audio") return p.includes("stereo") || p.includes("audio");
  if (s === "exterior") return p.includes("exterior") || p.includes("mirror") || p.includes("handle");
  if (s === "interior") return p.includes("interior") || p.includes("seat") || p.includes("perfume");
  if (s === "electrical") return p.includes("sensor") || p.includes("electronics") || p.includes("horn") || p.includes("electric");
  if (s === "brakes") return p.includes("brake");
  if (s === "suspension") return p.includes("suspension");
  if (s === "engine") return p.includes("engine");
  if (s === "exhaust") return p.includes("exhaust");
  if (s === "transmission") return p.includes("transmission");
  if (s === "cooling") return p.includes("cooling");
  if (s === "alloy-wheels") return p.includes("wheel");
  if (s === "performance-tires") return p.includes("tire");
  if (s === "off-road") return p.includes("off-road");

  return p.includes(s) || s.includes(p);
};

interface ProductFilterSidebarProps {
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export default function ProductFilterSidebar({
  selectedCategory,
  onSelectCategory,
}: ProductFilterSidebarProps) {
  const isAllCategoryActive = !selectedCategory || selectedCategory === "all";

  return (
    <aside className="w-52 shrink-0 select-none">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-4 font-semibold">
          FILTER
        </p>

        {/* All Products Item: red left border indicator when active, no count */}
        <ul className="mb-6">
          <li>
            <button
              type="button"
              onClick={() => onSelectCategory("all")}
              className={`w-full text-left flex items-center justify-between py-1.5 text-[13px] transition-colors border-l-2 pl-2 cursor-pointer ${
                isAllCategoryActive
                  ? "text-[#640C0C] font-bold border-[#640C0C]"
                  : "text-white/50 hover:text-white border-transparent"
              }`}
            >
              <span>All Products</span>
            </button>
          </li>
        </ul>

        {/* Category Groups matching 3rd image exactly: PARTS, TIRES & WHEELS, ACCESSORIES */}
        <div className="space-y-6">
          {ADMIN_CATEGORY_GROUPS.map((group) => (
            <div key={group.group}>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2 mt-1 font-semibold">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = selectedCategory === item.slug;

                  return (
                    <li key={item.slug}>
                      <button
                        type="button"
                        onClick={() => onSelectCategory(item.slug)}
                        className={`w-full text-left flex items-center justify-between py-1.5 text-[13px] transition-colors border-l-2 pl-2 cursor-pointer ${
                          isActive
                            ? "text-[#640C0C] font-bold border-[#640C0C]"
                            : "text-white/50 hover:text-white border-transparent"
                        }`}
                      >
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.label}
                        </span>
                        <span className={`text-[11px] ${isActive ? "text-white/60" : "text-white/25"}`}>
                          {item.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
