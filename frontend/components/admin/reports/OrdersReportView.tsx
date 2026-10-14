"use client";

import { ReportDataset } from "@/data/mockReports";

export interface OrdersReportViewProps {
  data: ReportDataset;
}

export default function OrdersReportView({ data }: OrdersReportViewProps) {
  const { totalOrders, completedOrders, pendingOrders, cancelledOrders } = data.metrics;

  return (
    <div className="space-y-6">
      <div className="pt-2 pb-3 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Total orders</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {totalOrders}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Total orders in filter window</span>
          </div>

          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Pending orders</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {pendingOrders}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Awaiting packing / dispatch</span>
          </div>

          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Completed</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {completedOrders}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">
              {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}% completion rate
            </span>
          </div>

          <div className="flex flex-col justify-between py-2 md:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Cancelled</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {cancelledOrders}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Customer or system cancelled</span>
          </div>
        </div>
      </div>

      <div className="p-6 shadow-sm">
        <h3 className="text-sm font-bold tracking-tight text-white">
          Fulfillment Status Distribution
        </h3>
        <p className="text-xs text-white/50 mt-0.5">
          Percentage breakdown of all recorded customer orders
        </p>

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

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {data.ordersBreakdown.map((item, idx) => {
            const dotColor =
              item.status === "Delivered"
                ? "shrink-0 bg-emerald-500"
                : item.status === "Processing"
                ? "shrink-0 bg-sky-500"
                : item.status === "Pending"
                ? "shrink-0 bg-amber-500"
                : "shrink-0 bg-[#640C0C]";

            return (
              <div key={idx} className="flex flex-row items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                <span className="text-white/60">
                  {item.status} ({item.percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
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
