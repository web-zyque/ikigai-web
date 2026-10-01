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
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-800/40 bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {status}
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700/60 bg-neutral-800/80 px-2.5 py-1 text-xs font-medium text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
            {status}
          </span>
        );
      case "Pending Verification":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-red-800/50 bg-red-950/40 px-2.5 py-1 text-xs font-medium text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            {status}
          </span>
        );
      case "Pending Dispatch":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-800/40 bg-amber-950/40 px-2.5 py-1 text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {status}
          </span>
        );
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-800/40 bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs font-medium text-neutral-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-neutral-800/80 bg-[#111317] overflow-hidden shadow-sm">
      {/* Table Header Section */}
      <div className="border-b border-neutral-800/80 px-6 py-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-neutral-400">{subtitle}</p>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800/60 bg-neutral-900/40 text-neutral-400">
              <th className="px-6 py-3 font-medium whitespace-nowrap">Order #</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">Customer</th>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">Total</th>
              <th className="px-6 py-3 font-medium whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-xs text-neutral-400"
                >
                  No recent orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-neutral-800/40"
                >
                  <td className="px-6 py-3.5 font-medium text-neutral-200 whitespace-nowrap">
                    {order.id}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-white whitespace-nowrap">
                    {order.customer}
                  </td>
                  <td className="px-6 py-3.5 text-neutral-300 min-w-[200px]">
                    {order.product}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-neutral-100 whitespace-nowrap">
                    {order.total}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between border-t border-neutral-800/70 bg-neutral-900/30 px-6 py-3 text-xs">
        <span className="text-neutral-400">
          Showing {orders.length} transaction{orders.length === 1 ? "" : "s"}
        </span>
        <span className="text-neutral-500">{refreshText}</span>
      </div>
    </div>
  );
}
