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
      case "out_of_stock":
        return "bg-[#640C0C]/20 border border-[#640C0C]/40 text-white";
      case "low_stock":
        return "bg-white/10 border border-white/20 text-white/90";
      case "in_stock":
        return "bg-white/5 border border-white/10 text-white/80";
      case "total":
      default:
        return "bg-white/5 border border-white/10 text-white/70";
    }
  };

  const getAccentDot = (type: InventoryCardType) => {
    switch (type) {
      case "out_of_stock":
        return <span className="h-1.5 w-1.5 rounded-full bg-[#640C0C] animate-pulse" />;
      case "low_stock":
        return <span className="h-1.5 w-1.5 rounded-full bg-white/70" />;
      case "in_stock":
        return <span className="h-1.5 w-1.5 rounded-full bg-white/60" />;
      case "total":
      default:
        return <span className="h-1.5 w-1.5 rounded-full bg-white/40" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            {/* Card Surface */}
            <div
              className={`relative flex h-full flex-col justify-between rounded-[20px] bg-[#121212] p-6 transition-all duration-300 ${
                isSelected
                  ? "-translate-y-1 border border-[#640C0C] ring-1 ring-[#640C0C]/60 shadow-[0_12px_32px_-8px_rgba(100,12,12,0.4)]"
                  : "border border-white/5 hover:-translate-y-1 hover:border-[#640C0C]/40 hover:shadow-[0_12px_28px_-8px_rgba(100,12,12,0.25)]"
              }`}
            >
              <div>
                {/* Header: Title and Icon */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getAccentDot(card.type)}
                    <span className="text-xs uppercase tracking-wider text-white/40 font-medium">
                      {card.title}
                    </span>
                    {isSelected && (
                      <span className="ml-1.5 rounded-full bg-[#640C0C]/25 border border-[#640C0C]/50 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Active
                      </span>
                    )}
                  </div>

                  <div
                    className={`grid h-10 w-10 place-items-center rounded-xl transition-colors duration-200 ${getIconStyles(
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
                <p className="mt-2 text-xs text-white/60">
                  {card.description}
                </p>
              </div>

              {/* Card Footer / Action Hint */}
              <div className="mt-6 border-t border-white/5 pt-4">
                <div
                  className={`flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? "text-[#640C0C] font-semibold"
                      : "text-white/40 group-hover:text-white/80"
                  }`}
                >
                  <span>{isSelected ? "Currently viewing this category" : card.footer}</span>
                  <ArrowRight
                    className={`h-3.5 w-3.5 transition-transform ${
                      isSelected
                        ? "text-[#640C0C] translate-x-1"
                        : "text-white/40 group-hover:translate-x-1 group-hover:text-white"
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
