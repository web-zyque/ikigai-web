"use client";

import React from "react";
import {
  ShoppingCart,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { OrderStatus } from "@/types/orders.types";;

export interface OrderCounts {
  total: number;
  pending: number;
  processing: number;
  completed: number; // Delivered
  cancelled: number;
}

export interface OrderSummaryCardsProps {
  counts: OrderCounts;
  activeStatus?: string;
  onSelectStatus?: (status: "All" | OrderStatus) => void;
}

export default function OrderSummaryCards({
  counts,
  activeStatus = "All",
  onSelectStatus,
}: OrderSummaryCardsProps) {
  const cards: Array<{
    id: "All" | OrderStatus;
    title: string;
    value: number;
    icon: React.ElementType;
    iconColor: string;
    activeBorderColor: string;
  }> = [
    {
      id: "All",
      title: "Total Orders",
      value: counts.total,
      icon: ShoppingCart,
      iconColor: "text-white/70",
      activeBorderColor: "border-[#640C0C]",
    },
    {
      id: "Pending",
      title: "Pending Orders",
      value: counts.pending,
      icon: Clock,
      iconColor: "text-amber-400",
      activeBorderColor: "border-amber-500/60",
    },
    {
      id: "Processing",
      title: "Processing Orders",
      value: counts.processing,
      icon: RefreshCw,
      iconColor: "text-sky-400",
      activeBorderColor: "border-sky-500/60",
    },
    {
      id: "Delivered",
      title: "Completed Orders",
      value: counts.completed,
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      activeBorderColor: "border-emerald-500/60",
    },
    {
      id: "Cancelled",
      title: "Cancelled Orders",
      value: counts.cancelled,
      icon: XCircle,
      iconColor: "text-red-400",
      activeBorderColor: "border-red-500/60",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive =
          (card.id === "All" && activeStatus === "All") ||
          (card.id !== "All" && activeStatus === card.id);

        return (
          <button
            key={card.title}
            type="button"
            onClick={() => onSelectStatus?.(card.id)}
            className={`group text-left rounded-[18px] p-4 sm:p-5 transition-all duration-200 cursor-pointer outline-none relative ${
              isActive
                ? "bg-[#640C0C]/15 border border-[#640C0C] ring-1 ring-[#640C0C]/50 shadow-sm shadow-[#640C0C]/30"
                : "bg-[#121212] border border-white/5 hover:border-white/15 hover:bg-[#161616]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider transition-colors truncate pr-1 ${
                  isActive ? "text-white" : "text-white/50 group-hover:text-white/70"
                }`}
              >
                {card.title}
              </span>
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? "bg-[#640C0C]/40 text-white"
                    : "bg-white/5 text-white/50 group-hover:text-white/80 group-hover:bg-white/10"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {card.value}
              </span>
              {isActive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b82525]" />
                  Active
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}