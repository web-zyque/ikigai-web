"use client";

import React from "react";
import { Package, AlertTriangle, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { ReportDataset } from "@/data/mockReports";

export interface InventoryReportViewProps {
  data: ReportDataset;
}

export default function InventoryReportView({ data }: InventoryReportViewProps) {
  const { totalProducts, lowStockProducts, outOfStockProducts } = data.metrics;
  const inStockProducts = Math.max(0, totalProducts - lowStockProducts - outOfStockProducts);

  const inStockPct = Math.round((inStockProducts / totalProducts) * 100);
  const lowStockPct = Math.round((lowStockProducts / totalProducts) * 100);
  const outOfStockPct = Math.round((outOfStockProducts / totalProducts) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Inventory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="rounded-[20px] bg-[#121212] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Total Catalog Items</span>
            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-white font-mono">
              {totalProducts}
            </h3>
            <p className="mt-1 text-xs text-white/40">Active items in catalog</p>
          </div>
        </div>

        {/* In Stock */}
        <div className="rounded-[20px] bg-[#121212] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Healthy Stock</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-emerald-400 font-mono">
              {inStockProducts}
            </h3>
            <p className="mt-1 text-xs text-white/40">{inStockPct}% of inventory optimal</p>
          </div>
        </div>

        {/* Low Stock */}
        <div className="rounded-[20px] bg-[#121212] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Low Stock Alert</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-amber-400 font-mono">
              {lowStockProducts}
            </h3>
            <p className="mt-1 text-xs text-white/40">Requires restocking soon</p>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="rounded-[20px] bg-[#121212] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Out of Stock</span>
            <div className="h-8 w-8 rounded-lg bg-[#640C0C]/20 border border-[#640C0C]/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-rose-400 font-mono">
              {outOfStockProducts}
            </h3>
            <p className="mt-1 text-xs text-white/40">Zero quantity available</p>
          </div>
        </div>
      </div>

      {/* 2. Visual Inventory Health Breakdown */}
      <div className="rounded-[20px] border border-white/5 bg-[#121212] p-6 shadow-sm">
        <h3 className="text-sm font-bold tracking-tight text-white">
          Inventory Stock Distribution
        </h3>
        <p className="text-xs text-white/50 mt-0.5">
          Proportional split between in-stock, low-stock, and exhausted products
        </p>

        {/* Progress bar */}
        <div className="mt-4 h-3 w-full rounded-full bg-white/5 overflow-hidden flex">
          <div
            style={{ width: `${inStockPct}%` }}
            className="bg-emerald-500 h-full transition-all"
            title={`Healthy Stock: ${inStockPct}%`}
          />
          <div
            style={{ width: `${lowStockPct}%` }}
            className="bg-amber-500 h-full transition-all"
            title={`Low Stock: ${lowStockPct}%`}
          />
          <div
            style={{ width: `${outOfStockPct}%` }}
            className="bg-[#640C0C] h-full transition-all"
            title={`Out of Stock: ${outOfStockPct}%`}
          />
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-white/60">Healthy Stock ({inStockProducts} items • {inStockPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-white/60">Low Stock Alert ({lowStockProducts} items • {lowStockPct}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#640C0C]" />
            <span className="text-white/60">Out of Stock ({outOfStockProducts} items • {outOfStockPct}%)</span>
          </div>
        </div>
      </div>

      {/* 3. Best-Selling Products Table */}
      <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm">
        <div className="border-b border-white/5 px-6 py-4 bg-[#121212] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#640C0C]" />
              <span>Top Best-Selling Products</span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Ranked by total quantity sold and revenue contribution
            </p>
          </div>
        </div>

        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-[#0a0a0a] text-white/40">
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider">Category</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right">Units Sold</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right">Revenue</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right">Stock</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {data.bestSellers.map((item, idx) => {
                const badgeColor =
                  item.status === "In Stock"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : item.status === "Low Stock"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                    : "border-[#640C0C]/40 bg-[#640C0C]/20 text-rose-300";

                return (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5 text-white/60">
                      <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[11px]">
                        {item.sku}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-white font-sans font-medium">
                      {item.name}
                    </td>
                    <td className="px-6 py-3.5 text-white/60 font-sans">{item.category}</td>
                    <td className="px-6 py-3.5 text-right text-white font-semibold">
                      {item.unitsSold}
                    </td>
                    <td className="px-6 py-3.5 text-right text-emerald-400 font-semibold">
                      ₹{item.revenue.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-3.5 text-right text-white/70">{item.stock}</td>
                    <td className="px-6 py-3.5 text-center font-sans">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeColor}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
