"use client";

import React, { useMemo } from "react";

export interface MetricCard {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  isAttention?: boolean;
}

export interface DashboardCounts {
  ordersToday?: number | string;
  revenueToday?: number | string;
  lowStock?: number | string;
  pendingOrders?: number | string;
}

export interface SummaryCardsProps {
  cards?: MetricCard[];
  counts?: DashboardCounts;
}

const DEFAULT_CARDS: MetricCard[] = [
  {
    title: "Today's orders",
    value: "23",
    subtitle: "+12% from yesterday",
  },
  {
    title: "Today's revenue",
    value: "₹5,440",
    subtitle: "Completed payments today",
  },
  {
    title: "Low stock",
    value: "4",
    subtitle: "Units requiring restock soon",
    isAttention: true,
  },
  {
    title: "Pending orders",
    value: "5",
    subtitle: "Orders awaiting dispatch",
  },
];

export default function SummaryCards({ cards, counts }: SummaryCardsProps) {
  const displayCards: MetricCard[] = useMemo(() => {
    if (cards && cards.length > 0) return cards;
    if (counts) {
      return [
        {
          title: "Today's orders",
          value: counts.ordersToday ?? "23",
          subtitle: "+12% from yesterday",
        },
        {
          title: "Today's revenue",
          value: counts.revenueToday ?? "₹5,440",
          subtitle: "Completed payments today",
        },
        {
          title: "Low stock",
          value: counts.lowStock ?? "4",
          subtitle: "Units requiring restock soon",
          isAttention: true,
        },
        {
          title: "Pending orders",
          value: counts.pendingOrders ?? "5",
          subtitle: "Orders awaiting dispatch",
        },
      ];
    }
    return DEFAULT_CARDS;
  }, [cards, counts]);

  return (
    <div className="w-full space-y-4">
      <div className="pt-2 pb-3 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {displayCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4"
            >
              <span className="text-xs sm:text-sm font-medium text-white/70">
                {card.title}
              </span>
              <div className="mt-1 sm:mt-2 flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {card.value}
                </span>
              </div>
              <span className="mt-1 text-[11px] sm:text-xs text-white/40">
                {card.subtitle || card.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

