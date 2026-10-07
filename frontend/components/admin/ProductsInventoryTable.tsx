"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Pencil,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import InventorySummaryCards, {
  StockFilterType,
} from "@/components/admin/InventorySummaryCards";

export type InventoryStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface InventoryProduct {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: string;
  stock: number;
  status: InventoryStatus;
  image?: string;
}

export interface ProductsInventoryTableProps {
  products?: InventoryProduct[];
  title?: string;
  subtitle?: string;
  badgeText?: string;
  footerText?: string;
  onBackToOverview?: () => void;
  onEditProduct?: (product: InventoryProduct) => void;
  onClearFilters?: () => void;
  // Stock Filter Cards Props
  activeFilter?: StockFilterType;
  onFilterChange?: (filter: StockFilterType) => void;
  counts?: {
    all: number;
    lowStock: number;
    stockOut: number;
  };
  // Search Props
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onResetFilters?: () => void;
  // Pagination Props
  currentPage?: number;
  pageSize?: number;
  totalFilteredCount?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
}

export const ALL_DEMO_PRODUCTS: InventoryProduct[] = [
  // In Stock Products
  {
    id: "prod-1",
    name: "Xenon Matrix H11 LED Headlights",
    category: "Lighting",
    sku: "LED-H11-001",
    price: "₹2,499",
    stock: 18,
    status: "In Stock",
    image: "/images/category_lighting.jpg",
  },
  {
    id: "prod-2",
    name: 'Ultra-Beam 32" Curved Roof Light Bar',
    category: "Roof Lights",
    sku: "RLB-032-004",
    price: "₹4,999",
    stock: 12,
    status: "In Stock",
    image: "/images/category_lighting.jpg",
  },
  {
    id: "prod-3",
    name: "Premium Car Horn Set",
    category: "Horns",
    sku: "HRN-PRM-006",
    price: "₹1,499",
    stock: 20,
    status: "In Stock",
    image: "/images/category_car-electronics.jpg",
  },
  {
    id: "prod-4",
    name: 'Android 10" Car Stereo',
    category: "Android Stereos",
    sku: "STR-AND-007",
    price: "₹12,999",
    stock: 8,
    status: "In Stock",
    image: "/images/category_car-electronics.jpg",
  },
  {
    id: "prod-5",
    name: "LED Roof Marker Lights",
    category: "Roof Lights",
    sku: "LED-RFM-008",
    price: "₹2,199",
    stock: 15,
    status: "In Stock",
    image: "/images/category_lighting.jpg",
  },
  {
    id: "prod-6",
    name: "Projector Headlight Assembly",
    category: "Headlights",
    sku: "HDL-PRJ-009",
    price: "₹8,499",
    stock: 10,
    status: "In Stock",
    image: "/images/category_lighting.jpg",
  },

  // Low Stock Products
  {
    id: "prod-7",
    name: "Dual-Tone Amber Fog Lamp Kit",
    category: "Fog Lamps",
    sku: "FOG-AMB-002",
    price: "₹1,799",
    stock: 3,
    status: "Low Stock",
    image: "/images/category_lighting.jpg",
  },
  {
    id: "prod-8",
    name: "Aerodynamic Carbon Mirror Caps",
    category: "Exterior Styling",
    sku: "MRC-CRB-005",
    price: "₹1,299",
    stock: 5,
    status: "Low Stock",
    image: "/images/category_exterior.jpg",
  },
  {
    id: "prod-9",
    name: "RGB Underglow Neon Kit",
    category: "Underglow",
    sku: "UND-RGB-010",
    price: "₹3,499",
    stock: 2,
    status: "Low Stock",
    image: "/images/category_lighting.jpg",
  },
  {
    id: "prod-10",
    name: "BassPro 12-inch Subwoofer",
    category: "Car Audio",
    sku: "SUB-BAS-011",
    price: "₹7,999",
    stock: 4,
    status: "Low Stock",
    image: "/images/category_car-electronics.jpg",
  },
  {
    id: "prod-11",
    name: "Chrome Door Handle Covers",
    category: "Exterior Accessories",
    sku: "DHC-CHM-012",
    price: "₹849",
    stock: 2,
    status: "Low Stock",
    image: "/images/category_exterior.jpg",
  },

  // Out of Stock Product
  {
    id: "prod-12",
    name: "Smoked LED Tail Light Assembly",
    category: "Tail Lights",
    sku: "TAIL-SMK-003",
    price: "₹3,299",
    stock: 0,
    status: "Out of Stock",
    image: "/images/category_lighting.jpg",
  },

  // Additional Realistic Catalog Products for Comprehensive Pagination
  {
    id: "prod-13",
    name: "Forged Monoblock 19-inch Alloy Wheels",
    category: "Wheels & Tires",
    sku: "WHL-FMB-013",
    price: "₹34,999",
    stock: 6,
    status: "In Stock",
    image: "/images/category_wheels.jpg",
  },
  {
    id: "prod-14",
    name: "Carbon Fiber Rear Trunk Spoiler",
    category: "Exterior Styling",
    sku: "SPL-CRB-014",
    price: "₹6,499",
    stock: 9,
    status: "In Stock",
    image: "/images/category_exterior.jpg",
  },
  {
    id: "prod-15",
    name: "High-Flow Cold Air Intake System",
    category: "Air Intake",
    sku: "INT-HFL-015",
    price: "₹8,999",
    stock: 11,
    status: "In Stock",
    image: "/images/category_air-intake.jpg",
  },
  {
    id: "prod-16",
    name: "Cat-Back Stainless Exhaust System",
    category: "Exhaust",
    sku: "EXH-SSB-016",
    price: "₹18,499",
    stock: 4,
    status: "Low Stock",
    image: "/images/category_exhaust.jpg",
  },
  {
    id: "prod-17",
    name: "Ceramic Brake Pad & Rotor Kit",
    category: "Brakes",
    sku: "BRK-CRM-017",
    price: "₹5,299",
    stock: 3,
    status: "Low Stock",
    image: "/images/category_brakes.jpg",
  },
  {
    id: "prod-18",
    name: "Adjustable Coilover Suspension Kit",
    category: "Suspension",
    sku: "SUS-COI-018",
    price: "₹22,999",
    stock: 0,
    status: "Out of Stock",
    image: "/images/category_suspension.jpg",
  },
  {
    id: "prod-19",
    name: "Wireless Apple CarPlay Adapter",
    category: "Car Electronics",
    sku: "CPL-WRL-019",
    price: "₹3,999",
    stock: 14,
    status: "In Stock",
    image: "/images/category_car-electronics.jpg",
  },
  {
    id: "prod-20",
    name: "7D Diamond Custom Floor Mats",
    category: "Interior Accessories",
    sku: "MAT-7DD-020",
    price: "₹3,199",
    stock: 16,
    status: "In Stock",
    image: "/images/category_interior.jpg",
  },
  {
    id: "prod-21",
    name: "Titanium Shift Knob & Boot",
    category: "Interior Styling",
    sku: "SKB-TTN-021",
    price: "₹1,899",
    stock: 2,
    status: "Low Stock",
    image: "/images/category_interior.jpg",
  },
  {
    id: "prod-22",
    name: "Ultra-Hydrophobic Ceramic Coating Kit",
    category: "Car Care",
    sku: "CAR-CRM-022",
    price: "₹2,699",
    stock: 0,
    status: "Out of Stock",
    image: "/images/category_car-care.jpg",
  },
  {
    id: "prod-23",
    name: "Sequential LED Side Mirror Indicators",
    category: "Lighting",
    sku: "LED-SMI-023",
    price: "₹1,999",
    stock: 7,
    status: "In Stock",
    image: "/images/category_lighting.jpg",
  },
  {
    id: "prod-24",
    name: "Heavy-Duty All-Terrain 18-inch Tires",
    category: "Tires",
    sku: "TIR-ATR-024",
    price: "₹11,499",
    stock: 8,
    status: "In Stock",
    image: "/images/category_tires.jpg",
  },
];

export default function ProductsInventoryTable({
  products = ALL_DEMO_PRODUCTS,
  title = "TOTAL PRODUCTS",
  subtitle = "Complete catalogue of automobile accessories and fitments",
  badgeText,
  footerText = "Stock updated 2m ago",
  onBackToOverview,
  onEditProduct,
  onClearFilters,
  searchQuery = "",
  onSearchChange,
  onResetFilters,
  currentPage = 1,
  pageSize = 15,
  totalFilteredCount,
  totalCount,
  onPageChange,
  activeFilter = "all",
  onFilterChange,
  counts,
}: ProductsInventoryTableProps) {
  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case "In Stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            {status}
          </span>
        );
      case "Low Stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {status}
          </span>
        );
      case "Out of Stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#640C0C]/50 bg-[#640C0C]/25 px-3 py-1 text-xs font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#640C0C] animate-pulse" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            {status}
          </span>
        );
    }
  };

  // Compute pagination counts
  const effectiveTotal = totalFilteredCount !== undefined ? totalFilteredCount : products.length;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, effectiveTotal);

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm animate-in fade-in duration-300">
      {/* Category Header with Cards and Search Bar */}
      <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-4.5 bg-[#121212]">
        {onBackToOverview && (
          <div>
            <button
              type="button"
              onClick={onBackToOverview}
              className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#640C0C] transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Overview</span>
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: 3 Compact Filter Cards */}
          {counts && (
            <InventorySummaryCards
              activeFilter={activeFilter}
              onFilterChange={onFilterChange}
              counts={counts}
            />
          )}

          {/* Right: Integrated Product Search Field */}
          {onSearchChange && (
            <div className="relative w-full sm:w-72 md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name, category, SKU..."
                aria-label="Search products"
                className="w-full h-10 rounded-full bg-white/5 border border-white/10 pl-9.5 pr-8 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-[#640C0C] focus:bg-[#161616]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-[#0a0a0a] text-white/40">
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider">Product</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">Category</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">SKU</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">Price</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">Stock</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-xs text-white/40"
                >
                  <p className="text-sm font-medium text-white/70 mb-1">
                    No products found
                  </p>
                  <p className="text-xs text-white/40 mb-3 max-w-sm mx-auto">
                    {searchQuery
                      ? `No products matching "${searchQuery}". Try a different name, category, or SKU.`
                      : "No products match the selected criteria."}
                  </p>
                  {(onResetFilters || onClearFilters) && (
                    <button
                      type="button"
                      onClick={onResetFilters || onClearFilters}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4 font-medium text-white min-w-[220px] text-[13px]">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#0a0a0a] border border-white/10">
                        <Image
                          src={product.image || "/images/category_lighting.jpg"}
                          alt={product.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/70 whitespace-nowrap">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 font-mono text-white/40 whitespace-nowrap">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#640C0C] whitespace-nowrap text-sm">
                    {product.price}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white/90 whitespace-nowrap">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => onEditProduct?.(product)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-[#640C0C] hover:border-[#640C0C] hover:text-white transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary and Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 bg-[#0a0a0a] px-6 py-3.5 text-xs text-white/40">
        <div>
          Showing{" "}
          <span className="font-semibold text-white/90">
            {effectiveTotal === 0 ? 0 : startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-white/90">{endIndex}</span> of{" "}
          <span className="font-semibold text-white/90">{effectiveTotal}</span> products
          {totalCount !== undefined && effectiveTotal !== totalCount && (
            <span className="text-white/40"> (filtered from {totalCount} total)</span>
          )}
        </div>

        {/* Simple Pagination Controls: <  1  2  3  > */}
        {onPageChange && (
          <div className="flex items-center gap-1.5 select-none">
            {/* Previous Page Button */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Previous page"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${
                currentPage <= 1
                  ? "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Next Page Button */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Next page"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${
                currentPage >= totalPages
                  ? "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
