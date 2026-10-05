"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

export type InventoryStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface InventoryProduct {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: string;
  stock: number;
  status: InventoryStatus;
}

export interface ProductsInventoryTableProps {
  products?: InventoryProduct[];
  title?: string;
  subtitle?: string;
  badgeText?: string;
  footerText?: string;
  onBackToOverview?: () => void;
}

export const ALL_DEMO_PRODUCTS: InventoryProduct[] = [
  // 6 In Stock Products (Healthy stock above 5)
  {
    id: "prod-1",
    name: "Xenon Matrix H11 LED Headlights",
    category: "Lighting",
    sku: "LED-H11-001",
    price: "₹2,499",
    stock: 18,
    status: "In Stock",
  },
  {
    id: "prod-2",
    name: 'Ultra-Beam 32" Curved Roof Light Bar',
    category: "Roof Lights",
    sku: "RLB-032-004",
    price: "₹4,999",
    stock: 12,
    status: "In Stock",
  },
  {
    id: "prod-3",
    name: "Premium Car Horn Set",
    category: "Horns",
    sku: "HRN-PRM-006",
    price: "₹1,499",
    stock: 20,
    status: "In Stock",
  },
  {
    id: "prod-4",
    name: 'Android 10" Car Stereo',
    category: "Android Stereos",
    sku: "STR-AND-007",
    price: "₹12,999",
    stock: 8,
    status: "In Stock",
  },
  {
    id: "prod-5",
    name: "LED Roof Marker Lights",
    category: "Roof Lights",
    sku: "LED-RFM-008",
    price: "₹2,199",
    stock: 15,
    status: "In Stock",
  },
  {
    id: "prod-6",
    name: "Projector Headlight Assembly",
    category: "Headlights",
    sku: "HDL-PRJ-009",
    price: "₹8,499",
    stock: 10,
    status: "In Stock",
  },

  // 5 Low Stock Products (5 units or fewer, but > 0)
  {
    id: "prod-7",
    name: "Dual-Tone Amber Fog Lamp Kit",
    category: "Fog Lamps",
    sku: "FOG-AMB-002",
    price: "₹1,799",
    stock: 4,
    status: "Low Stock",
  },
  {
    id: "prod-8",
    name: "Aerodynamic Carbon Mirror Caps",
    category: "Exterior Accessories",
    sku: "MIR-CBN-005",
    price: "₹1,299",
    stock: 3,
    status: "Low Stock",
  },
  {
    id: "prod-9",
    name: "Premium LED Interior Light Kit",
    category: "Interior Accessories",
    sku: "INT-LED-010",
    price: "₹999",
    stock: 5,
    status: "Low Stock",
  },
  {
    id: "prod-10",
    name: "Universal Parking Sensor Kit",
    category: "Electronics",
    sku: "PRK-SNS-011",
    price: "₹1,899",
    stock: 2,
    status: "Low Stock",
  },
  {
    id: "prod-11",
    name: "Chrome Door Handle Covers",
    category: "Exterior Accessories",
    sku: "DHC-CHM-012",
    price: "₹849",
    stock: 4,
    status: "Low Stock",
  },

  // 1 Out of Stock Product (Stock = 0)
  {
    id: "prod-12",
    name: "Smoked LED Tail Light Assembly",
    category: "Tail Lights",
    sku: "TAIL-SMK-003",
    price: "₹3,299",
    stock: 0,
    status: "Out of Stock",
  },
];

export default function ProductsInventoryTable({
  products = ALL_DEMO_PRODUCTS,
  title = "TOTAL PRODUCTS",
  subtitle = "Complete catalogue of 12 automobile accessories and fitments",
  badgeText,
  footerText = "Stock updated 2m ago",
  onBackToOverview,
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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
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

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm animate-in fade-in duration-300">
      {/* Category Header with Back to Overview */}
      <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-6 bg-[#121212]">
        {onBackToOverview && (
          <div>
            <button
              type="button"
              onClick={onBackToOverview}
              className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#640C0C] transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Overview</span>
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
              {badgeText && (
                <span className="rounded-full bg-white/10 border border-white/15 px-3 py-0.5 text-xs font-semibold text-white/90">
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && <p className="mt-1 text-xs text-white/60">{subtitle}</p>}
          </div>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-xs text-white/40"
                >
                  No inventory products found in this category.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4 font-medium text-white min-w-[220px] text-[13px]">
                    {product.name}
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between border-t border-white/5 bg-[#0a0a0a] px-6 py-3.5 text-xs text-white/40">
        <span>
          Showing {products.length} of 12 catalogued products
        </span>
        <span className="text-white/40">{footerText}</span>
      </div>
    </div>
  );
}
