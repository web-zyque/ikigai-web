"use client";

import React from "react";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export type InventoryCardType = "total" | "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryMetricCard {
  type: InventoryCardType;
  title: string;
  value: string | number;
  description: string;
  footer: string;
  icon: React.ElementType;
}

export interface InventorySummaryCardsProps {
  cards?: InventoryMetricCard[];
  selectedType?: InventoryCardType | null;
  onSelectCard?: (type: InventoryCardType) => void;
}

const DEFAULT_INVENTORY_CARDS: InventoryMetricCard[] = [
  {
    type: "total",
    title: "TOTAL PRODUCT",
    value: 12,
    description: "All active car accessories catalogued",
    footer: "Explore entire catalog",
    icon: Package,
  },
  {
    type: "in_stock",
    title: "IN STOCK",
    value: 6,
    description: "Healthy inventory levels above threshold",
    footer: "Filter by in-stock items",
    icon: CheckCircle2,
  },
  {
    type: "low_stock",
    title: "LOW STOCK",
    value: 5,
    description: "Requires restock soon (≤ 5 units left)",
    footer: "View items requiring restock",
    icon: AlertTriangle,
  },
  {
    type: "out_of_stock",
    title: "OUT OF STOCK",
    value: 1,
    description: "Zero units remaining • Critical attention",
    footer: "View depleted items",
    icon: AlertCircle,
  },
];

export default function InventorySummaryCards({
  cards = DEFAULT_INVENTORY_CARDS,
  selectedType,
  onSelectCard,
}: InventorySummaryCardsProps) {
  const getIconStyles = (type: InventoryCardType) => {
    switch (type) {
      case "in_stock":
        return "bg-emerald-950/40 text-emerald-400 ring-1 ring-emerald-800/50";
      case "low_stock":
        return "bg-amber-950/40 text-amber-400 ring-1 ring-amber-800/50";
      case "out_of_stock":
        return "bg-red-950/40 text-red-400 ring-1 ring-red-800/50";
      case "total":
      default:
        return "bg-neutral-800/80 text-neutral-400 ring-1 ring-neutral-700/60";
    }
  };

  const getAccentDot = (type: InventoryCardType) => {
    switch (type) {
      case "in_stock":
        return <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />;
      case "low_stock":
        return <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />;
      case "out_of_stock":
        return <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />;
      case "total":
      default:
        return <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />;
    }
  };

  return (
    /* 2x2 Grid matching the user's sketch: 2 cards per row on medium/large screens */
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedType === card.type;

        return (
          <div
            key={card.title}
            role="button"
            tabIndex={0}
            onClick={() => onSelectCard?.(card.type)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectCard?.(card.type);
              }
            }}
            className="group relative cursor-pointer outline-none"
          >
            {/* Subtle RED LAYER BEHIND the card appearing on hover or when selected */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 -z-10 rounded-xl bg-red-600/30 transition-all duration-200 ease-out ${
                isSelected
                  ? "translate-y-1.5 opacity-100 blur-[3px]"
                  : "opacity-0 group-hover:translate-y-1.5 group-hover:opacity-100 group-hover:blur-[3px]"
              }`}
            />

            {/* Main Card Surface with slight pop/lift on hover and subtle selected border */}
            <div
              className={`relative flex h-full flex-col justify-between rounded-xl bg-[#111317] p-5 md:p-6 transition-all duration-200 ease-out ${
                isSelected
                  ? "-translate-y-1 border-2 border-red-500/70 shadow-[0_12px_28px_-6px_rgba(220,38,38,0.3)] ring-1 ring-red-500/30"
                  : "border border-neutral-800/80 group-hover:-translate-y-1 group-hover:border-red-600/40 group-hover:shadow-[0_12px_28px_-6px_rgba(220,38,38,0.22)]"
              }`}
            >
              <div>
                {/* Header: Title and Icon */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getAccentDot(card.type)}
                    <span className="text-xs font-semibold tracking-wider text-neutral-400">
                      {card.title}
                    </span>
                    {isSelected && (
                      <span className="ml-1.5 rounded-full bg-red-600/20 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/30">
                        Active
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 ${getIconStyles(
                      card.type
                    )}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                {/* Big Value Number */}
                <div className="mt-4 text-3xl font-bold tracking-tight text-white lg:text-4xl">
                  {card.value}
                </div>

                {/* Description */}
                <p className="mt-1.5 text-xs text-neutral-400">
                  {card.description}
                </p>
              </div>

              {/* Card Footer / Action Hint */}
              <div className="mt-6 border-t border-neutral-800/60 pt-3">
                <div
                  className={`flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? "text-red-400 font-medium"
                      : "text-neutral-400 group-hover:text-neutral-200"
                  }`}
                >
                  <span>{isSelected ? "Currently viewing this category" : card.footer}</span>
                  <ArrowRight
                    className={`h-3.5 w-3.5 transition-transform ${
                      isSelected
                        ? "text-red-400 translate-x-1"
                        : "text-neutral-500 group-hover:translate-x-1 group-hover:text-neutral-300"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
