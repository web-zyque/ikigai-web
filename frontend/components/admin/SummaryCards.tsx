"use client";

import React from "react";
import {
  ShoppingCart,
  IndianRupee,
  AlertTriangle,
  Clock,
} from "lucide-react";

export interface MetricCard {
  title: string;
  value: string;
  icon: React.ElementType;
  badge?: string;
  isAttention?: boolean;
}

export interface SummaryCardsProps {
  cards?: MetricCard[];
}

const DEFAULT_CARDS: MetricCard[] = [
  {
    title: "Today's Orders",
    value: "23",
    icon: ShoppingCart,
    badge: "+12% from yesterday",
  },
  {
    title: "Today's Revenue",
    value: "₹5,440",
    icon: IndianRupee,
    badge: "Completed payments",
  },
  {
    title: "Low Stock",
    value: "4",
    icon: AlertTriangle,
    badge: "Requires reorder",
    isAttention: true,
  },
  {
    title: "Pending Orders",
    value: "5",
    icon: Clock,
    badge: "Awaiting dispatch",
  },
];

export default function SummaryCards({ cards = DEFAULT_CARDS }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="group relative cursor-default rounded-[20px] bg-[#121212] border border-white/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#640C0C]/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-white/40 font-medium">
                  {card.title}
                </span>
                <span className="mt-3 text-3xl font-bold tracking-tight text-white lg:text-4xl">
                  {card.value}
                </span>
              </div>

              {/* Icon Container */}
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl transition-colors duration-200 ${
                  card.isAttention
                    ? "bg-[#640C0C]/20 border border-[#640C0C]/40 text-white"
                    : "bg-white/5 border border-white/10 text-white/70 group-hover:text-white group-hover:border-white/20"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            {/* Bottom subtitle / subtle badge */}
            {card.badge && (
              <div className="mt-4 flex items-center gap-1.5 pt-2 border-t border-white/5 text-xs">
                {card.isAttention ? (
                  <span className="inline-flex items-center gap-1.5 font-medium text-white/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#640C0C] animate-pulse" />
                    {card.badge}
                  </span>
                ) : (
                  <span className="text-white/60">{card.badge}</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
