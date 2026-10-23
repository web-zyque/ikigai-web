"use client";

import React, { useState, useMemo } from "react";

export type TimeframeType = "daily" | "weekly" | "monthly" | "yearly";

export interface ChartDataPoint {
  label: string;
  fullLabel: string;
  orders: number;
}

export interface OrdersOverviewChartProps {
  title?: string;
  subtitle?: string;
}

const TIMEFRAME_OPTIONS: { id: TimeframeType; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

const DATASETS: Record<TimeframeType, ChartDataPoint[]> = {
  daily: [
    { label: "Mon", fullLabel: "Monday", orders: 14 },
    { label: "Tue", fullLabel: "Tuesday", orders: 19 },
    { label: "Wed", fullLabel: "Wednesday", orders: 17 },
    { label: "Thu", fullLabel: "Thursday", orders: 23 },
    { label: "Fri", fullLabel: "Friday", orders: 21 },
    { label: "Sat", fullLabel: "Saturday", orders: 28 },
    { label: "Sun", fullLabel: "Sunday", orders: 25 },
  ],
  weekly: [
    { label: "W1", fullLabel: "Week 1", orders: 85 },
    { label: "W2", fullLabel: "Week 2", orders: 102 },
    { label: "W3", fullLabel: "Week 3", orders: 120 },
    { label: "W4", fullLabel: "Week 4", orders: 115 },
    { label: "W5", fullLabel: "Week 5", orders: 142 },
    { label: "W6", fullLabel: "Week 6", orders: 156 },
  ],
  monthly: [
    { label: "Jan", fullLabel: "January", orders: 320 },
    { label: "Feb", fullLabel: "February", orders: 380 },
    { label: "Mar", fullLabel: "March", orders: 450 },
    { label: "Apr", fullLabel: "April", orders: 410 },
    { label: "May", fullLabel: "May", orders: 520 },
    { label: "Jun", fullLabel: "June", orders: 490 },
    { label: "Jul", fullLabel: "July", orders: 560 },
    { label: "Aug", fullLabel: "August", orders: 610 },
    { label: "Sep", fullLabel: "September", orders: 580 },
    { label: "Oct", fullLabel: "October", orders: 640 },
    { label: "Nov", fullLabel: "November", orders: 710 },
    { label: "Dec", fullLabel: "December", orders: 820 },
  ],
  yearly: [
    { label: "2021", fullLabel: "Year 2021", orders: 2400 },
    { label: "2022", fullLabel: "Year 2022", orders: 3850 },
    { label: "2023", fullLabel: "Year 2023", orders: 5120 },
    { label: "2024", fullLabel: "Year 2024", orders: 6940 },
    { label: "2025", fullLabel: "Year 2025", orders: 8450 },
    { label: "2026", fullLabel: "Year 2026", orders: 9820 },
  ],
};

function getNiceMax(maxVal: number): number {
  if (maxVal <= 30) return Math.ceil(maxVal / 5) * 5;
  if (maxVal <= 100) return Math.ceil(maxVal / 10) * 10;
  if (maxVal <= 200) return Math.ceil(maxVal / 20) * 20;
  if (maxVal <= 1000) return Math.ceil(maxVal / 100) * 100;
  return Math.ceil(maxVal / 1000) * 1000;
}

export default function OrdersOverviewChart({
  title = "Orders Overview",
}: OrdersOverviewChartProps) {
  const [timeframe, setTimeframe] = useState<TimeframeType>("daily");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = DATASETS[timeframe];

  // SVG coordinate dimensions for the bezier curve
  const viewWidth = 1000;
  const viewHeight = 300;
  const paddingTop = 15;
  const paddingBottom = 15;
  const chartHeight = viewHeight - paddingTop - paddingBottom;

  const rawMax = Math.max(...data.map((d) => d.orders), 1);
  const yMax = getNiceMax(rawMax);

  // Compute calculated point positions for SVG curve
  const points = useMemo(() => {
    if (data.length === 0) return [];
    return data.map((item, index) => {
      const x = data.length > 1 ? (index / (data.length - 1)) * viewWidth : viewWidth / 2;
      const y = paddingTop + chartHeight - (item.orders / yMax) * chartHeight;
      return { x, y, ...item };
    });
  }, [data, yMax, chartHeight, paddingTop, viewWidth]);

  // Generate smooth cubic bezier line path
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX = (current.x + next.x) / 2;
      path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  }, [points]);

  // Generate flat fill area path beneath the line (no gradient)
  const areaPath = useMemo(() => {
    if (points.length < 2) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} ${viewHeight} L ${first.x} ${viewHeight} Z`;
  }, [linePath, points, viewHeight]);

  // 4 reference horizontal steps (0%, 33.3%, 66.7%, 100%)
  const ySteps = useMemo(() => [0, 1, 2, 3], []);

  const activePoint = hoveredIndex !== null && data[hoveredIndex] ? data[hoveredIndex] : null;

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm">
      {/* Card Header Section: Aligned on a single line on mobile and desktop */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3.5 sm:px-6 py-3 sm:py-4 bg-[#121212]">
        <h2 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
          {title}
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
          <div className="relative h-48 sm:h-60 w-7 sm:w-9 shrink-0 select-none mr-2 sm:mr-3">
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
                    {value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
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

              {/* Responsive SVG Bezier Curve (only line & fill, no text or circles to prevent squishing) */}
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
                    left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
                  }}
                  className="absolute top-0 bottom-0 w-px border-l border-dashed border-white/20 pointer-events-none z-10"
                />
              )}

              {/* Interactive Data Point Dots: HTML circles (always perfectly round, never oval) */}
              {data.map((item, i) => {
                const isHovered = hoveredIndex === i;
                const leftPercent = (i / (data.length - 1)) * 100;
                const valueRatio = item.orders / yMax;
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
                {data.map((item, i) => (
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
                    left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
                    top: `${
                      ((paddingTop + chartHeight - (activePoint.orders / yMax) * chartHeight) /
                        viewHeight) *
                      100
                    }%`,
                  }}
                  className={`absolute -translate-y-12 pointer-events-none z-30 whitespace-nowrap rounded-lg bg-[#0a0a0a] border border-white/10 px-3 py-1.5 text-xs shadow-xl shrink-0 ${
                    hoveredIndex === 0
                      ? "translate-x-1"
                      : hoveredIndex === data.length - 1
                      ? "-translate-x-full"
                      : "-translate-x-1/2"
                  }`}
                >
                  <div className="font-semibold text-white">
                    {activePoint.orders.toLocaleString()} orders
                  </div>
                  <div className="text-[10px] text-white/50">
                    {activePoint.fullLabel}
                  </div>
                </div>
              )}
            </div>

            {/* X-Axis Row: HTML text labels, shrink-0, centered directly below each data point */}
            <div className="relative w-full h-6 mt-3 select-none shrink-0">
              {data.map((item, i) => {
                const isHovered = hoveredIndex === i;
                const leftPercent = (i / (data.length - 1)) * 100;

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
  );
}