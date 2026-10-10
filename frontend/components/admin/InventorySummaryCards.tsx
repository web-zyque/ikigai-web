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
    title: "Total Products",
    value: 12,
    description: "",
    footer: "",
    icon: Package,
  },
  {
    type: "in_stock",
    title: "In Stock",
    value: 6,
    description: "",
    footer: "",
    icon: CheckCircle2,
  },
  {
    type: "low_stock",
    title: "Low Stock",
    value: 5,
    description: "",
    footer: "",
    icon: AlertTriangle,
  },
  {
    type: "out_of_stock",
    title: "Out of Stock",
    value: 1,
    description: "",
    footer: "",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              className={`relative flex items-center gap-4 rounded-[16px] bg-[#121212] p-5 transition-all duration-300 ${
                isSelected
                  ? "-translate-y-1 border border-[#640C0C] ring-1 ring-[#640C0C]/60 shadow-[0_8px_24px_-8px_rgba(100,12,12,0.4)]"
                  : "border border-white/5 hover:-translate-y-1 hover:border-[#640C0C]/40 hover:shadow-[0_8px_24px_-8px_rgba(100,12,12,0.25)]"
              }`}
            >
              {/* Icon Container */}
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-colors duration-200 ${getIconStyles(
                  card.type
                )}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Content Container */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold tracking-tight text-white leading-none">
                    {card.value}
                  </span>
                  {isSelected && (
                    <span className="rounded-full bg-[#640C0C]/25 border border-[#640C0C]/50 px-1.5 py-0.5 text-[9px] uppercase font-semibold text-white">
                      Active
                    </span>
                  )}
                </div>
                <span className="mt-1 text-sm text-white/60 font-medium">
                  {card.title}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
