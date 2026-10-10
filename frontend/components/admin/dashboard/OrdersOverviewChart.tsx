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
  subtitle = "Track order volume over time",
}: OrdersOverviewChartProps) {
  const [timeframe, setTimeframe] = useState<TimeframeType>("daily");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = DATASETS[timeframe];

  // SVG coordinate dimensions
  const viewWidth = 1000;
  const viewHeight = 240;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = viewWidth - paddingLeft - paddingRight;
  const chartHeight = viewHeight - paddingTop - paddingBottom;
  const baselineY = paddingTop + chartHeight;

  const rawMax = Math.max(...data.map((d) => d.orders), 1);
  const yMax = getNiceMax(rawMax);

  // Compute calculated point positions
  const points = useMemo(() => {
    return data.map((item, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (item.orders / yMax) * chartHeight;
      return { x, y, ...item };
    });
  }, [data, chartWidth, chartHeight, paddingLeft, paddingTop, yMax]);

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

  // Generate flat fill area path beneath the line (no gradient used)
  const areaPath = useMemo(() => {
    if (points.length < 2) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [linePath, points, baselineY]);

  // 4 reference horizontal gridlines
  const gridLines = useMemo(() => {
    return [0, 1, 2, 3].map((step) => {
      const value = Math.round((yMax / 3) * step);
      const y = baselineY - (step / 3) * chartHeight;
      return { value, y };
    });
  }, [yMax, baselineY, chartHeight]);

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm">
      {/* Card Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 px-6 py-5 bg-[#121212]">
        <div>
          <h2 className="text-base font-bold tracking-tight text-white">{title}</h2>
          <p className="mt-1 text-xs text-white/60">{subtitle}</p>
        </div>

        {/* Timeframe Controls: [ Daily ] [ Weekly ] [ Monthly ] [ Yearly ] */}
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-[#0a0a0a] p-1 self-start sm:self-auto overflow-x-auto max-w-full">
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
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
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
      <div className="relative p-6">
        <div className="relative h-56 sm:h-64 w-full">
          {/* Tooltip Overlay */}
          {activePoint && (
            <div
              style={{
                left: `${(activePoint.x / viewWidth) * 100}%`,
                top: `${(activePoint.y / viewHeight) * 100}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-12 pointer-events-none z-20 whitespace-nowrap rounded-lg bg-[#0a0a0a] border border-white/10 px-3 py-1.5 text-xs shadow-xl"
            >
              <div className="font-semibold text-white">
                {activePoint.orders.toLocaleString()} orders
              </div>
              <div className="text-[10px] text-white/50">
                {activePoint.fullLabel}
              </div>
            </div>
          )}

          {/* Responsive SVG Line Chart */}
          <svg
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Horizontal Gridlines and Y-axis Labels */}
            {gridLines.map((grid) => (
              <g key={grid.value}>
                <line
                  x1={paddingLeft}
                  y1={grid.y}
                  x2={viewWidth - paddingRight}
                  y2={grid.y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={grid.y + 3.5}
                  textAnchor="end"
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize="11"
                  fontFamily="inherit"
                >
                  {grid.value >= 1000 ? `${(grid.value / 1000).toFixed(0)}k` : grid.value}
                </text>
              </g>
            ))}

            {/* Flat Solid Fill under the curve (no gradient) */}
            {areaPath && (
              <path
                d={areaPath}
                fill="rgba(100, 12, 12, 0.08)"
              />
            )}

            {/* Main Line Stroke */}
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

            {/* Hover guideline */}
            {activePoint && (
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={baselineY}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            )}

            {/* Data Point Dots & X-axis Labels */}
            {points.map((pt, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <g key={pt.label}>
                  {/* Point Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 3.5}
                    fill={isHovered ? "#640C0C" : "#121212"}
                    stroke={isHovered ? "#ffffff" : "#640C0C"}
                    strokeWidth={isHovered ? 2 : 2}
                    className="transition-all duration-150"
                  />

                  {/* X-axis Label */}
                  <text
                    x={pt.x}
                    y={viewHeight - 12}
                    textAnchor="middle"
                    fill={isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.45)"}
                    fontSize="11"
                    fontWeight={isHovered ? "600" : "500"}
                    fontFamily="inherit"
                    className="transition-colors duration-150"
                  >
                    {pt.label}
                  </text>

                  {/* Interactive invisible hit area for easy hover on desktop & touch on mobile */}
                  <rect
                    x={pt.x - chartWidth / (data.length * 2)}
                    y={0}
                    width={chartWidth / data.length}
                    height={viewHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setHoveredIndex(i)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}