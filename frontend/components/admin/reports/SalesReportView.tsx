"use client";

import React, { useState, useMemo } from "react";
import { ReportDataset } from "@/data/mockReports";
import { SalesTrendPoint } from "@/types/reports.types";

export type SalesTimeframeType = "daily" | "weekly" | "monthly" | "yearly";

export interface SalesReportViewProps {
  data: ReportDataset;
}

const TIMEFRAME_OPTIONS: { id: SalesTimeframeType; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

const DEFAULT_SALES_DATASETS: Record<SalesTimeframeType, SalesTrendPoint[]> = {
  daily: [
    { label: "Mon", fullDate: "Past Monday", sales: 42100, orders: 17 },
    { label: "Tue", fullDate: "Past Tuesday", sales: 48900, orders: 19 },
    { label: "Wed", fullDate: "Past Wednesday", sales: 39500, orders: 15 },
    { label: "Thu", fullDate: "Past Thursday", sales: 52300, orders: 21 },
    { label: "Fri", fullDate: "Past Friday", sales: 58400, orders: 23 },
    { label: "Sat", fullDate: "Past Saturday", sales: 56100, orders: 22 },
    { label: "Sun", fullDate: "Past Sunday", sales: 45300, orders: 17 },
  ],
  weekly: [
    { label: "W1", fullDate: "Week 1", sales: 85000, orders: 34 },
    { label: "W2", fullDate: "Week 2", sales: 102000, orders: 41 },
    { label: "W3", fullDate: "Week 3", sales: 120000, orders: 48 },
    { label: "W4", fullDate: "Week 4", sales: 115000, orders: 45 },
    { label: "W5", fullDate: "Week 5", sales: 142000, orders: 56 },
    { label: "W6", fullDate: "Week 6", sales: 156000, orders: 62 },
  ],
  monthly: [
    { label: "Jan", fullDate: "January", sales: 320000, orders: 128 },
    { label: "Feb", fullDate: "February", sales: 380000, orders: 152 },
    { label: "Mar", fullDate: "March", sales: 450000, orders: 180 },
    { label: "Apr", fullDate: "April", sales: 410000, orders: 164 },
    { label: "May", fullDate: "May", sales: 520000, orders: 208 },
    { label: "Jun", fullDate: "June", sales: 490000, orders: 196 },
    { label: "Jul", fullDate: "July", sales: 560000, orders: 224 },
    { label: "Aug", fullDate: "August", sales: 610000, orders: 244 },
    { label: "Sep", fullDate: "September", sales: 580000, orders: 232 },
    { label: "Oct", fullDate: "October", sales: 640000, orders: 256 },
    { label: "Nov", fullDate: "November", sales: 710000, orders: 284 },
    { label: "Dec", fullDate: "December", sales: 820000, orders: 328 },
  ],
  yearly: [
    { label: "2021", fullDate: "Year 2021", sales: 2400000, orders: 960 },
    { label: "2022", fullDate: "Year 2022", sales: 3850000, orders: 1540 },
    { label: "2023", fullDate: "Year 2023", sales: 5120000, orders: 2050 },
    { label: "2024", fullDate: "Year 2024", sales: 6940000, orders: 2780 },
    { label: "2025", fullDate: "Year 2025", sales: 8450000, orders: 3380 },
    { label: "2026", fullDate: "Year 2026", sales: 9820000, orders: 3920 },
  ],
};

function getNiceSalesMax(maxVal: number): number {
  if (maxVal <= 30000) return Math.ceil(maxVal / 6000) * 6000;
  if (maxVal <= 60000) return Math.ceil(maxVal / 15000) * 15000;
  if (maxVal <= 150000) return Math.ceil(maxVal / 30000) * 30000;
  if (maxVal <= 300000) return Math.ceil(maxVal / 60000) * 60000;
  if (maxVal <= 900000) return Math.ceil(maxVal / 150000) * 150000;
  if (maxVal <= 3000000) return Math.ceil(maxVal / 300000) * 300000;
  if (maxVal <= 6000000) return Math.ceil(maxVal / 600000) * 600000;
  return Math.ceil(maxVal / 1500000) * 1500000;
}

export default function SalesReportView({ data }: SalesReportViewProps) {
  const [timeframe, setTimeframe] = useState<SalesTimeframeType>("daily");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const points: SalesTrendPoint[] = useMemo(() => {
    const list = data?.salesTrends?.[timeframe as keyof typeof data.salesTrends];
    if (list && list.length >= 3) {
      return list;
    }
    return DEFAULT_SALES_DATASETS[timeframe] || DEFAULT_SALES_DATASETS.daily;
  }, [data, timeframe]);

  // SVG coordinate dimensions for the bezier curve (identical to OrdersOverviewChart)
  const viewWidth = 1000;
  const viewHeight = 300;
  const paddingTop = 15;
  const paddingBottom = 15;
  const chartHeight = viewHeight - paddingTop - paddingBottom;

  const rawMax = Math.max(...points.map((p) => p.sales), 1000);
  const yMax = getNiceSalesMax(rawMax);

  // Compute calculated point positions for SVG curve
  const chartPoints = useMemo(() => {
    if (points.length === 0) return [];
    return points.map((item, index) => {
      const x = points.length > 1 ? (index / (points.length - 1)) * viewWidth : viewWidth / 2;
      const y = paddingTop + chartHeight - (item.sales / yMax) * chartHeight;
      return { x, y, ...item };
    });
  }, [points, yMax, chartHeight, paddingTop, viewWidth]);

  // Generate smooth cubic bezier line path
  const linePath = useMemo(() => {
    if (chartPoints.length === 0) return "";
    if (chartPoints.length === 1) return `M ${chartPoints[0].x} ${chartPoints[0].y}`;

    let path = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const current = chartPoints[i];
      const next = chartPoints[i + 1];
      const controlX = (current.x + next.x) / 2;
      path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  }, [chartPoints]);

  // Generate flat fill area path beneath the line (no gradient)
  const areaPath = useMemo(() => {
    if (chartPoints.length < 2) return "";
    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    return `${linePath} L ${last.x} ${viewHeight} L ${first.x} ${viewHeight} Z`;
  }, [linePath, chartPoints, viewHeight]);

  // 4 reference horizontal steps (0%, 33.3%, 66.7%, 100%)
  const ySteps = useMemo(() => [0, 1, 2, 3], []);

  const activePoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  return (
    <div className="space-y-6">
      {/* Metrics Summary Strip */}
      <div className="pt-2 pb-3 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <div className="flex flex-col justify-between py-2 sm:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Total gross sales</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                ₹{data.metrics.totalSales.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Revenue generated in selected period</span>
          </div>

          <div className="flex flex-col justify-between py-2 sm:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Orders placed</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {data.metrics.totalOrders}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Total customer checkouts completed</span>
          </div>

          <div className="flex flex-col justify-between py-2 sm:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Average order value (AOV)</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                ₹{data.metrics.avgOrderValue.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Average basket size per order</span>
          </div>
        </div>
      </div>

      {/* Sales & Revenue Chart Container */}
      <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm">
        {/* Card Header Section: Aligned on a single line on mobile and desktop */}
        <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3.5 sm:px-6 py-3 sm:py-4 bg-[#121212]">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            Sales &amp; Revenue
          </h2>

          {/* Timeframe Controls: [ Daily ] [ Weekly ] [ Monthly ] [ Yearly ] */}
          <div className="flex items-center gap-0.5 sm:gap-1 rounded-full border border-white/10 bg-[#0a0a0a] p-0.5 sm:p-1 shrink-0">
            {TIMEFRAME_OPTIONS.map((option) => {
              const isActive = timeframe === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setTimeframe(option.id);
                    setHoveredIndex(null);
                  }}
                  className={`rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-center text-[10px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-[#640C0C] text-white shadow-sm shadow-[#640C0C]/30 font-semibold"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="relative p-4 sm:p-6">
          <div className="flex w-full">
            {/* Y-Axis Column: HTML text labels, shrink-0, perfectly crisp and never distorted */}
            <div className="relative h-48 sm:h-60 w-8 sm:w-12 shrink-0 select-none mr-2 sm:mr-3">
              {ySteps.map((step) => {
                const value = Math.round((yMax / 3) * step);
                const bottomPercent = (step / 3) * 100;
                return (
                  <div
                    key={step}
                    style={{ bottom: `${bottomPercent}%` }}
                    className="absolute right-0 translate-y-1/2 shrink-0 text-right leading-none"
                  >
                    <span className="text-[10px] sm:text-xs text-white/40 font-medium shrink-0 whitespace-nowrap block">
                      {value >= 10000000
                        ? `₹${(value / 10000000).toFixed(1)}Cr`
                        : value >= 100000
                        ? `₹${(value / 100000).toFixed(0)}L`
                        : value >= 1000
                        ? `₹${(value / 1000).toFixed(0)}k`
                        : value === 0
                        ? "0"
                        : `₹${value}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Plot Surface and X-Axis Area */}
            <div className="relative flex-1 min-w-0 flex flex-col">
              {/* Chart Canvas Area */}
              <div className="relative h-48 sm:h-60 w-full">
                {/* Horizontal reference gridlines */}
                {ySteps.map((step) => (
                  <div
                    key={step}
                    style={{ bottom: `${(step / 3) * 100}%` }}
                    className={`absolute left-0 right-0 border-b border-white/5 pointer-events-none ${
                      step === 0 ? "border-solid border-white/10" : "border-dashed"
                    }`}
                  />
                ))}

                {/* Responsive SVG Bezier Curve */}
                <svg
                  viewBox={`0 0 ${viewWidth} ${viewHeight}`}
                  className="absolute inset-0 w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  {areaPath && (
                    <path
                      d={areaPath}
                      fill="rgba(100, 12, 12, 0.08)"
                    />
                  )}
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
                </svg>

                {/* Vertical hover line indicator */}
                {hoveredIndex !== null && (
                  <div
                    style={{
                      left: `${(hoveredIndex / (points.length - 1)) * 100}%`,
                    }}
                    className="absolute top-0 bottom-0 w-px border-l border-dashed border-white/20 pointer-events-none z-10"
                  />
                )}

                {/* Interactive Data Point Dots: HTML circles (always perfectly round, never oval) */}
                {points.map((item, i) => {
                  const isHovered = hoveredIndex === i;
                  const leftPercent = (i / (points.length - 1)) * 100;
                  const valueRatio = item.sales / yMax;
                  const topPercent =
                    ((paddingTop + chartHeight - valueRatio * chartHeight) / viewHeight) * 100;

                  return (
                    <div
                      key={item.label}
                      style={{
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 shrink-0"
                    >
                      <div
                        className={`rounded-full transition-all duration-150 shrink-0 ${
                          isHovered
                            ? "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#640C0C] border-2 border-white shadow-lg shadow-black scale-110"
                            : "w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#121212] border-[1.5px] sm:border-2 border-[#640C0C]"
                        }`}
                      />
                    </div>
                  );
                })}

                {/* Full-height touch and hover interactive slices */}
                <div className="absolute inset-0 flex z-20">
                  {points.map((item, i) => (
                    <div
                      key={item.label}
                      className="flex-1 h-full cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => setHoveredIndex(i)}
                    />
                  ))}
                </div>

                {/* Floating Tooltip */}
                {hoveredIndex !== null && activePoint && (
                  <div
                    style={{
                      left: `${(hoveredIndex / (points.length - 1)) * 100}%`,
                      top: `${
                        ((paddingTop + chartHeight - (activePoint.sales / yMax) * chartHeight) /
                          viewHeight) *
                        100
                      }%`,
                    }}
                    className={`absolute -translate-y-12 pointer-events-none z-30 whitespace-nowrap rounded-lg bg-[#0a0a0a] border border-white/10 px-3 py-1.5 text-xs shadow-xl shrink-0 ${
                      hoveredIndex === 0
                        ? "translate-x-1"
                        : hoveredIndex === points.length - 1
                        ? "-translate-x-full"
                        : "-translate-x-1/2"
                    }`}
                  >
                    <div className="font-semibold text-white">
                      ₹{activePoint.sales.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-white/50 flex items-center gap-1.5 mt-0.5">
                      <span>{activePoint.fullDate}</span>
                      <span>•</span>
                      <span className="text-white/70">{activePoint.orders} orders</span>
                    </div>
                  </div>
                )}
              </div>

              {/* X-Axis Row: HTML text labels, shrink-0, centered directly below each data point */}
              <div className="relative w-full h-6 mt-3 select-none shrink-0">
                {points.map((item, i) => {
                  const isHovered = hoveredIndex === i;
                  const leftPercent = (i / (points.length - 1)) * 100;

                  return (
                    <div
                      key={item.label}
                      style={{ left: `${leftPercent}%` }}
                      className="absolute -translate-x-1/2 top-0 shrink-0 text-center"
                    >
                      <span
                        className={`text-[10px] sm:text-xs transition-colors duration-150 shrink-0 font-medium block whitespace-nowrap leading-none ${
                          isHovered ? "text-white font-semibold" : "text-white/45"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Breakdown by Timeline Table */}
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

