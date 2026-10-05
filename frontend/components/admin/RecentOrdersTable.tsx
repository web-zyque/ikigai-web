"use client";

import React from "react";

export type OrderStatus =
  | "Ready to Ship"
  | "Processing"
  | "Pending Verification"
  | "Pending Dispatch"
  | "Delivered";

export interface OrderItem {
  id: string;
  customer: string;
  product: string;
  total: string;
  status: OrderStatus;
}

export interface RecentOrdersTableProps {
  orders?: OrderItem[];
  title?: string;
  subtitle?: string;
  refreshText?: string;
}

const DEFAULT_ORDERS: OrderItem[] = [
  {
    id: "#ORD-8492",
    customer: "Vikram Malhotra",
    product: "Xenon Matrix H11 LED Headlights",
    total: "₹4,850",
    status: "Ready to Ship",
  },
  {
    id: "#ORD-8491",
    customer: "Arjun Patel",
    product: "Dual-Tone Amber Fog Lamp Kit",
    total: "₹2,990",
    status: "Processing",
  },
  {
    id: "#ORD-8490",
    customer: "Priya Sundaram",
    product: "Smoked LED Tail Light Assembly",
    total: "₹6,400",
    status: "Pending Verification",
  },
  {
    id: "#ORD-8489",
    customer: "Karan Varma",
    product: 'Ultra-Beam 32" Curved Roof Light Bar',
    total: "₹8,200",
    status: "Pending Dispatch",
  },
  {
    id: "#ORD-8488",
    customer: "Amitava Roy",
    product: "Aerodynamic Carbon Mirror Caps",
    total: "₹1,750",
    status: "Delivered",
  },
];

export default function RecentOrdersTable({
  orders = DEFAULT_ORDERS,
  title = "Recent Orders",
  subtitle = "Latest vehicle accessory transactions processed today",
  refreshText = "Auto-refreshed 2m ago",
}: RecentOrdersTableProps) {
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Ready to Ship":
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            {status}
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            {status}
          </span>
        );
      case "Pending Verification":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#640C0C]/50 bg-[#640C0C]/25 px-3 py-1 text-xs font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#640C0C] animate-pulse" />
            {status}
          </span>
        );
      case "Pending Dispatch":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm">
      {/* Table Header Section */}
      <div className="border-b border-white/5 px-6 py-5 bg-[#121212]">
        <h2 className="text-base font-bold tracking-tight text-white">{title}</h2>
        <p className="mt-1 text-xs text-white/60">{subtitle}</p>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-[#0a0a0a] text-white/40">
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">Order #</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">Customer</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider">Product</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">Total</th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-xs text-white/40"
                >
                  No recent orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4 font-mono font-medium text-white/70 whitespace-nowrap">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-[13px] font-medium text-white/90 min-w-[220px]">
                    {order.product}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#640C0C] whitespace-nowrap text-sm">
                    {order.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between border-t border-white/5 bg-[#0a0a0a] px-6 py-3.5 text-xs text-white/40">
        <span>
          Showing {orders.length} transaction{orders.length === 1 ? "" : "s"}
        </span>
        <span className="text-white/40">{refreshText}</span>
      </div>
    </div>
  );
}
