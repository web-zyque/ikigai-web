"use client";

import React from "react";
import { ShoppingCart, CheckCircle2, Clock, XCircle } from "lucide-react";
import { ReportDataset } from "@/data/mockReports";

export interface OrdersReportViewProps {
  data: ReportDataset;
}

export default function OrdersReportView({ data }: OrdersReportViewProps) {
  const { totalOrders, completedOrders, pendingOrders, cancelledOrders } = data.metrics;

  return (
    <div className="space-y-6">
      {/* 1. Core Orders Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="rounded-[20px] bg-[#121212] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Total Orders</span>
            <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-white font-mono">
              {totalOrders}
            </h3>
            <p className="mt-1 text-xs text-white/40">Total orders in filter window</p>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="rounded-[20px] bg-[#121212] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Completed / Delivered</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-emerald-400 font-mono">
              {completedOrders}
            </h3>
            <p className="mt-1 text-xs text-white/40">
              {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}% completion rate
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="rounded-[20px] bg-[#121212] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Pending &amp; In-Flight</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-amber-400 font-mono">
              {pendingOrders}
            </h3>
            <p className="mt-1 text-xs text-white/40">Awaiting packing / dispatch</p>
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="rounded-[20px] bg-[#121212] border border-white/5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">Cancelled Orders</span>
            <div className="h-8 w-8 rounded-lg bg-[#640C0C]/20 border border-[#640C0C]/30 flex items-center justify-center text-rose-400">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-rose-400 font-mono">
              {cancelledOrders}
            </h3>
            <p className="mt-1 text-xs text-white/40">Customer or system cancelled</p>
          </div>
        </div>
      </div>

      {/* 2. Visual Order Status Distribution Bar */}
      <div className="rounded-[20px] border border-white/5 bg-[#121212] p-6 shadow-sm">
        <h3 className="text-sm font-bold tracking-tight text-white">
          Fulfillment Status Distribution
        </h3>
        <p className="text-xs text-white/50 mt-0.5">
          Percentage breakdown of all recorded customer orders
        </p>

        {/* Multi-segment distribution bar */}
        <div className="mt-4 h-3 w-full rounded-full bg-white/5 overflow-hidden flex">
          {data.ordersBreakdown.map((item, idx) => {
            const colorClass =
              item.status === "Delivered"
                ? "bg-emerald-500"
                : item.status === "Processing"
                ? "bg-sky-500"
                : item.status === "Pending"
                ? "bg-amber-500"
                : "bg-[#640C0C]";

            return (
              <div
                key={idx}
                style={{ width: `${item.percentage}%` }}
                className={`${colorClass} h-full transition-all`}
                title={`${item.status}: ${item.percentage}%`}
              />
            );
          })}
        </div>

        {/* Status Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-6 text-xs">
          {data.ordersBreakdown.map((item, idx) => {
            const dotColor =
              item.status === "Delivered"
                ? "bg-emerald-500"
                : item.status === "Processing"
                ? "bg-sky-500"
                : item.status === "Pending"
                ? "bg-amber-500"
                : "bg-[#640C0C]";

            return (
              <div key={idx} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                <span className="text-white/60">
                  {item.status} ({item.count} • {item.percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Status Breakdown Table */}
      <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm">
        <div className="border-b border-white/5 px-6 py-4 bg-[#121212]">
          <h3 className="text-sm font-bold tracking-tight text-white">
            Order Fulfillment Summary Table
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Aggregated order volume and financial value by status category
          </p>
        </div>

        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-[#0a0a0a] text-white/40">
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider">Status Category</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right">Orders Count</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right">Share of Total</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right">Gross Order Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {data.ordersBreakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3.5 font-sans font-medium text-white flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        row.status === "Delivered"
                          ? "bg-emerald-400"
                          : row.status === "Processing"
                          ? "bg-sky-400"
                          : row.status === "Pending"
                          ? "bg-amber-400"
                          : "bg-[#640C0C]"
                      }`}
                    />
                    <span>{row.status}</span>
                  </td>
                  <td className="px-6 py-3.5 text-right text-white font-semibold">
                    {row.count}
                  </td>
                  <td className="px-6 py-3.5 text-right text-white/70">
                    {row.percentage}%
                  </td>
                  <td className="px-6 py-3.5 text-right text-emerald-400 font-semibold">
                    ₹{row.totalValue.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
