"use client";

import { useRouter, useSearchParams } from "next/navigation";

export interface FilterCategory {
  label: string;
  slug: string;
  count?: number;
}

export const categoryGroups: { group: string; slug: string; items: FilterCategory[] }[] = [
  {
    group: "Parts",
    slug: "parts",
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
    group: "Tires & Wheels",
    slug: "tires-wheels",
    items: [
      { label: "Alloy Wheels", slug: "alloy-wheels", count: 7 },
      { label: "Performance Tires", slug: "performance-tires", count: 15 },
      { label: "Off-Road", slug: "off-road", count: 4 },
    ],
  },
  {
    group: "Accessories",
    slug: "accessories",
    items: [
      { label: "Interior", slug: "interior", count: 11 },
      { label: "Exterior", slug: "exterior", count: 8 },
      { label: "Lighting", slug: "lighting", count: 6 },
      { label: "Audio", slug: "audio", count: 5 },
    ],
  },
];

interface FilterSidebarProps {
  activeCategory: string;
}

export default function FilterSidebar({ activeCategory }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.push(`/products?${params.toString()}`);
  };

  const isAllActive = !activeCategory || activeCategory === "all";

  return (
    <aside className="w-52 shrink-0">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-4">Filter</p>

        <ul className="mb-6">
          <li>
            <button
              onClick={() => handleSelect("all")}
              className={`w-full text-left flex items-center justify-between py-1.5 text-[13px] transition-colors border-l-2 pl-2 ${
                isAllActive
                  ? "text-[#640C0C] font-bold border-[#640C0C]"
                  : "text-white/50 hover:text-white border-transparent"
              }`}
            >
              All Products
            </button>
          </li>
        </ul>

        <div className="space-y-6">
          {categoryGroups.map((group) => (
            <div key={group.group}>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2 mt-1">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeCategory === item.slug;
                  return (
                    <li key={item.slug}>
                      <button
                        onClick={() => handleSelect(item.slug)}
                        className={`w-full text-left flex items-center justify-between py-1.5 text-[13px] transition-colors border-l-2 pl-2 ${
                          isActive
                            ? "text-[#640C0C] font-bold border-[#640C0C]"
                            : "text-white/50 hover:text-white border-transparent"
                        }`}
                      >
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                        {item.count !== undefined && (
                          <span className={`text-[11px] ${isActive ? "text-white/60" : "text-white/25"}`}>
                            {item.count}
                          </span>
                        )}
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
