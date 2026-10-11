"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, ShoppingCart, DollarSign, Calendar } from "lucide-react";
import { ReportDataset } from "@/data/mockReports";
import { SalesTrendPoint } from "@/types/reports.types";

export interface SalesReportViewProps {
  data: ReportDataset;
}

export default function SalesReportView({ data }: SalesReportViewProps) {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("daily");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const points: SalesTrendPoint[] = useMemo(() => {
    if (timeframe === "monthly" && data.salesTrends.monthly.length > 0) {
      return data.salesTrends.monthly;
    }
    if (timeframe === "weekly" && data.salesTrends.weekly.length > 0) {
      return data.salesTrends.weekly;
    }
    return data.salesTrends.daily;
  }, [data, timeframe]);

  // Chart coordinate calculations
  const maxSales = useMemo(() => {
    const rawMax = Math.max(...points.map((p) => p.sales), 1000);
    return Math.ceil(rawMax * 1.15);
  }, [points]);

  const chartWidth = 700;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 20;

  const coords = useMemo(() => {
    if (points.length <= 1) {
      return points.map((p, i) => ({
        ...p,
        x: chartWidth / 2,
        y: chartHeight / 2,
      }));
    }

    const usableWidth = chartWidth - paddingX * 2;
    const usableHeight = chartHeight - paddingY * 2;

    return points.map((p, idx) => {
      const x = paddingX + (idx / (points.length - 1)) * usableWidth;
      const y = chartHeight - paddingY - (p.sales / maxSales) * usableHeight;
      return { ...p, x, y };
    });
  }, [points, maxSales]);

  const linePath = useMemo(() => {
    if (coords.length === 0) return "";
    return coords.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  }, [coords]);

  const areaPath = useMemo(() => {
    if (coords.length === 0) return "";
    const first = coords[0];
    const last = coords[coords.length - 1];
    const baseY = chartHeight - paddingY;
    return `${linePath} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
  }, [linePath, coords]);

  const activeCoord = hoveredIndex !== null ? coords[hoveredIndex] : null;

  return (
    <div className="space-y-6">
      {/* 1. Core Sales Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Sales */}
        <div className="rounded-[20px] bg-[#121212] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Total Gross Sales</span>
            <div className="h-8 w-8 rounded-lg bg-[#640C0C]/20 border border-[#640C0C]/30 flex items-center justify-center text-[#640C0C]">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-white font-mono">
              ₹{data.metrics.totalSales.toLocaleString("en-IN")}
            </h3>
            <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>Revenue generated in selected period</span>
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-[20px] bg-[#121212] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Orders Placed</span>
            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-white">
              {data.metrics.totalOrders}
            </h3>
            <p className="mt-1 text-xs text-white/40">
              Total customer checkouts completed
            </p>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="rounded-[20px] bg-[#121212] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Average Order Value (AOV)</span>
            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-white font-mono">
              ₹{data.metrics.avgOrderValue.toLocaleString("en-IN")}
            </h3>
            <p className="mt-1 text-xs text-white/40">
              Average basket size per order
            </p>
          </div>
        </div>
      </div>

      {/* 2. Sales Trend Chart Visualization */}
      <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 px-6 py-4 bg-[#121212]">
          <div>
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
              Sales Trends &amp; Revenue Velocity
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Visual trajectory of sales volume and order numbers
            </p>
          </div>

          {/* Daily / Weekly / Monthly Switcher */}
          <div className="inline-flex rounded-lg border border-white/10 bg-[#0a0a0a] p-1 text-xs self-start sm:self-auto">
            {(["daily", "weekly", "monthly"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setTimeframe(mode);
                  setHoveredIndex(null);
                }}
                className={`px-3 py-1 rounded-md capitalize transition-colors cursor-pointer font-medium ${
                  timeframe === mode
                    ? "bg-[#640C0C] text-white shadow-sm"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart */}
        <div className="p-6 relative">
          {/* Tooltip */}
          {activeCoord && (
            <div
              className="absolute pointer-events-none rounded-xl border border-white/15 bg-black/95 px-3 py-2 text-xs shadow-xl z-20 transition-all -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(activeCoord.x / chartWidth) * 100}%`,
                top: `${activeCoord.y - 12}px`,
              }}
            >
              <p className="font-semibold text-white">{activeCoord.fullDate}</p>
              <div className="flex items-center gap-3 mt-1 font-mono text-[11px]">
                <span className="text-emerald-400 font-semibold">
                  ₹{activeCoord.sales.toLocaleString("en-IN")}
                </span>
                <span className="text-white/60">{activeCoord.orders} orders</span>
              </div>
            </div>
          )}

          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 sm:h-52 overflow-visible"
            >
              {/* Grid Horizontal Lines */}
              {[0, 0.33, 0.66, 1].map((pct, idx) => {
                const y = chartHeight - paddingY - pct * (chartHeight - paddingY * 2);
                return (
                  <line
                    key={idx}
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Area Under Line */}
              {areaPath && (
                <path d={areaPath} fill="rgba(100, 12, 12, 0.18)" />
              )}

              {/* Trend Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#640C0C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Data Dots */}
              {coords.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === idx ? 6 : 4}
                    fill={hoveredIndex === idx ? "#ffffff" : "#640C0C"}
                    stroke="#000000"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {/* X Axis Label */}
                  <text
                    x={pt.x}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.4)"
                    fontSize="10"
                    className="pointer-events-none select-none font-sans"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Sales Breakdown Table */}
      <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm">
        <div className="border-b border-white/5 px-6 py-4 bg-[#121212]">
          <h3 className="text-sm font-bold tracking-tight text-white">
            Sales Breakdown by Timeline
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Detailed granular data points for export and auditing
          </p>
        </div>

        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-[#0a0a0a] text-white/40">
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider">Interval</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider">Date / Time</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right">Orders</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right">Sales Volume</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right">Avg Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {points.map((pt, i) => {
                const avg = pt.orders > 0 ? Math.round(pt.sales / pt.orders) : 0;
                return (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5 text-white/80 font-sans font-medium">{pt.label}</td>
                    <td className="px-6 py-3.5 text-white/60 font-sans">{pt.fullDate}</td>
                    <td className="px-6 py-3.5 text-right text-white/90">{pt.orders}</td>
                    <td className="px-6 py-3.5 text-right text-emerald-400 font-semibold">
                      ₹{pt.sales.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-3.5 text-right text-white/70">
                      ₹{avg.toLocaleString("en-IN")}
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
