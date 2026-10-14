"use client";

import React from "react";
import { CreditCard, QrCode, Building, Banknote } from "lucide-react";
import { ReportDataset } from "@/data/mockReports";

export interface RevenueReportViewProps {
  data: ReportDataset;
}

export default function RevenueReportView({ data }: RevenueReportViewProps) {
  const { totalRevenue, totalOrders, avgOrderValue } = data.metrics;

  const getMethodIcon = (method: string) => {
    if (method.includes("UPI")) return <QrCode className="h-4 w-4 text-emerald-400" />;
    if (method.includes("Card")) return <CreditCard className="h-4 w-4 text-sky-400" />;
    if (method.includes("Banking")) return <Building className="h-4 w-4 text-purple-400" />;
    return <Banknote className="h-4 w-4 text-amber-400" />;
  };

  return (
    <div className="space-y-6">
      {/* 1. Core Revenue Summary Cards */}
      <div className="pt-2 pb-3 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <div className="flex flex-col justify-between py-2 sm:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Total gross revenue</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Net settlement value across all channels</span>
          </div>

          <div className="flex flex-col justify-between py-2 sm:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Paid transactions</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {totalOrders}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Successful customer payments</span>
          </div>

          <div className="flex flex-col justify-between py-2 sm:py-0 px-2 sm:px-4">
            <span className="text-xs sm:text-sm font-medium text-white/70">Average transaction size</span>
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                ₹{avgOrderValue.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="mt-1 text-[11px] sm:text-xs text-white/40">Mean receipt per completed payment</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Payment Channel Split */}
      <div className="rounded-[20px] border border-white/5 bg-[#121212] p-6 shadow-sm">
        <h3 className="text-sm font-bold tracking-tight text-white">
          Payment Method Share
        </h3>
        <p className="text-xs text-white/50 mt-0.5">
          Proportional volume split across payment instruments
        </p>

        {/* Multi-segment progress bar */}
        <div className="mt-4 h-3 w-full rounded-full bg-white/5 overflow-hidden flex">
          {data.paymentBreakdown.map((item, idx) => {
            const barBg =
              idx === 0
                ? "bg-emerald-500"
                : idx === 1
                ? "bg-sky-500"
                : idx === 2
                ? "bg-purple-500"
                : "bg-amber-500";

            return (
              <div
                key={idx}
                style={{ width: `${item.percentage}%` }}
                className={`${barBg} h-full transition-all`}
                title={`${item.method}: ${item.percentage}%`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-6 text-xs">
          {data.paymentBreakdown.map((item, idx) => {
            const dotBg =
              idx === 0
                ? "bg-emerald-500"
                : idx === 1
                ? "bg-sky-500"
                : idx === 2
                ? "bg-purple-500"
                : "bg-amber-500";

            return (
              <div key={idx} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dotBg}`} />
                <span className="text-white/60">
                  {item.method} ({item.percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Payment Method Summary Table */}
      <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm">
        <div className="border-b border-white/5 px-6 py-4 bg-[#121212]">
          <h3 className="text-sm font-bold tracking-tight text-white">
            Payment Method Breakdown Table
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Audit of transactions, collected amounts, and percentage contribution
          </p>
        </div>

        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-[#0a0a0a] text-white/40">
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right">Transactions</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right">Collected Revenue</th>
                <th className="px-6 py-3.5 font-medium uppercase tracking-wider text-right">Volume Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {data.paymentBreakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3.5 font-sans font-medium text-white flex items-center gap-2.5">
                    {getMethodIcon(row.method)}
                    <span>{row.method}</span>
                  </td>
                  <td className="px-6 py-3.5 text-right text-white font-semibold">
                    {row.transactions}
                  </td>
                  <td className="px-6 py-3.5 text-right text-emerald-400 font-semibold">
                    ₹{row.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-3.5 text-right text-white/70">
                    {row.percentage}%
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
