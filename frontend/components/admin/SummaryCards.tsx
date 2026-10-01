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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="group relative cursor-default rounded-xl border border-neutral-800/80 bg-[#111317] p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-red-600/40 hover:shadow-[0_8px_24px_-6px_rgba(220,38,38,0.18)]"
          >
            {/* Subtle red ambient glow layer behind the card */}
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-red-600/[0.04] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-neutral-400">
                  {card.title}
                </span>
                <span className="mt-2 text-2xl font-bold tracking-tight text-white lg:text-3xl">
                  {card.value}
                </span>
              </div>

              {/* Icon Container */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 ${
                  card.isAttention
                    ? "bg-red-950/40 text-red-400 ring-1 ring-red-800/50 group-hover:bg-red-900/50 group-hover:text-red-300"
                    : "bg-neutral-800/80 text-neutral-400 ring-1 ring-neutral-700/60 group-hover:text-red-400 group-hover:ring-red-900/40"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            {/* Bottom subtitle / subtle badge */}
            {card.badge && (
              <div className="mt-3 flex items-center gap-1.5 pt-1 text-xs">
                {card.isAttention ? (
                  <span className="inline-flex items-center gap-1 font-medium text-red-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    {card.badge}
                  </span>
                ) : (
                  <span className="text-neutral-500">{card.badge}</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
