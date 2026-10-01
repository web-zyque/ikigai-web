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
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-800/40 bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {status}
          </span>
        );
      case "Low Stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-800/40 bg-amber-950/40 px-2.5 py-1 text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {status}
          </span>
        );
      case "Out of Stock":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-red-800/50 bg-red-950/40 px-2.5 py-1 text-xs font-medium text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs font-medium text-neutral-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-neutral-800/80 bg-[#111317] overflow-hidden shadow-sm animate-in fade-in duration-200">
      {/* Category Header with Back to Overview */}
      <div className="flex flex-col gap-3.5 border-b border-neutral-800/80 px-6 py-5 bg-[#111317]">
        {onBackToOverview && (
          <div>
            <button
              type="button"
              onClick={onBackToOverview}
              className="group inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-red-500 transition-transform duration-150 group-hover:-translate-x-1" />
              <span>Back to Inventory Overview</span>
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">{title}</h2>
              {badgeText && (
                <span className="rounded-md bg-neutral-800/80 px-2.5 py-0.5 text-xs font-semibold text-neutral-200 border border-neutral-700/60">
                  {badgeText}
                </span>
              )}
            </div>
            {subtitle && <p className="mt-1 text-xs text-neutral-400">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800/60 bg-neutral-900/40 text-neutral-400">
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">Category</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">SKU</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">Price</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">Stock</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-xs text-neutral-400"
                >
                  No inventory products found in this category.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-neutral-800/40"
                >
                  <td className="px-6 py-3.5 font-medium text-white min-w-[220px]">
                    {product.name}
                  </td>
                  <td className="px-6 py-3.5 text-neutral-300 whitespace-nowrap">
                    {product.category}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-neutral-400 whitespace-nowrap">
                    {product.sku}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-neutral-100 whitespace-nowrap">
                    {product.price}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-neutral-200 whitespace-nowrap">
                    {product.stock}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    {getStatusBadge(product.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between border-t border-neutral-800/70 bg-neutral-900/30 px-6 py-3 text-xs">
        <span className="text-neutral-400">
          Showing {products.length} of 12 catalogued products
        </span>
        <span className="text-neutral-500">{footerText}</span>
      </div>
    </div>
  );
}
