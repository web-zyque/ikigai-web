"use client";

import React, { useMemo } from "react";
import { Check, Plus, ChevronDown } from "lucide-react";
import { ProfileRefund } from "./profile.types";
import { getStatusColor } from "./profile.utils";

interface ProfileReturnsTabProps {
  refunds: ProfileRefund[];
  returnsFilter: string;
  setReturnsFilter: (filter: string) => void;
  returnTabs: string[];
  refundSuccessMessage: string;
  onRequestRefundClick: () => void;
}

export function ProfileReturnsTab({
  refunds,
  returnsFilter,
  setReturnsFilter,
  returnTabs,
  refundSuccessMessage,
  onRequestRefundClick,
}: ProfileReturnsTabProps) {
  const filteredReturns = useMemo(() => {
    return refunds.filter((ret) => {
      const s = ret.status.toLowerCase();
      if (returnsFilter === "All") return true;
      if (returnsFilter === "Completed") return s.includes("completed");
      if (returnsFilter === "Under Inspection") return s.includes("inspection");
      return true;
    });
  }, [refunds, returnsFilter]);

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm">
      {refundSuccessMessage && (
        <div className="m-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs text-emerald-400">
          <Check className="h-4 w-4" />
          <span>{refundSuccessMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 px-4 sm:px-6 py-4 bg-[#121212]">
        <div className="flex sm:hidden items-center justify-between gap-2.5 w-full">
          <button
            type="button"
            onClick={onRequestRefundClick}
            className="inline-flex items-center gap-1.5 h-9 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-3.5 text-xs font-semibold text-white shrink-0 cursor-pointer shadow-md"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Request Refund</span>
          </button>

          <div className="relative shrink-0 w-36">
            <select
              value={returnsFilter}
              onChange={(e) => setReturnsFilter(e.target.value)}
              className="w-full h-9 rounded-full bg-[#0a0a0a] border border-white/10 pl-3 pr-7 text-xs text-white appearance-none outline-none focus:border-white/30 cursor-pointer"
            >
              {returnTabs.map((tab) => (
                <option key={tab} value={tab} className="bg-[#121212] text-white">
                  {tab}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50 pointer-events-none" />
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/5 w-fit overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {returnTabs.map((tab) => {
            const isActive = returnsFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setReturnsFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-black shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:block">
          <button
            type="button"
            onClick={onRequestRefundClick}
            className="inline-flex items-center gap-1.5 h-9 rounded-full bg-[#640C0C] hover:bg-[#7a1010] px-4.5 text-xs font-semibold text-white transition-opacity hover:opacity-95 shadow-md cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Request a Refund</span>
          </button>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-white/10 text-xs font-semibold text-white/50 uppercase tracking-wider bg-white/[0.02]">
        <div className="col-span-2">Return ID</div>
        <div className="col-span-4">Item Name</div>
        <div className="col-span-2">Requested Date</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2 text-right">Total Amount</div>
      </div>

      <div className="divide-y divide-white/5">
        {filteredReturns.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white/40 text-xs sm:text-sm">No return requests found.</p>
          </div>
        ) : (
          filteredReturns.map((ret) => (
            <div key={ret.id} className="hover:bg-white/[0.02] transition-colors">
              <div className="md:hidden p-4 space-y-2.5">
                <div className="flex items-start gap-3.5">
                  <div className="w-16 h-16 bg-[#0a0a0a] rounded-xl border border-white/10 p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={ret.image}
                      alt={ret.productName}
                      className="object-contain w-full h-full mix-blend-screen"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                      {ret.productName}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-white/50 font-mono">
                      <span>{ret.id}</span>
                      <span>•</span>
                      <span>{ret.requestedOn}</span>
                    </div>

                    <div className="text-[11px] text-white/40">
                      Order #{ret.orderId}
                    </div>

                    {ret.reason && (
                      <p className="text-[11px] text-white/50 italic line-clamp-1">
                        {ret.reason}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="font-semibold text-white">
                        ₹{ret.amount.toLocaleString("en-IN")}
                      </span>
                      <span className={`font-medium ${getStatusColor(ret.status)}`}>
                        {ret.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden md:grid grid-cols-12 gap-3 items-center px-6 py-4 hover:bg-white/[0.04] transition-colors">
                <div className="col-span-2 font-mono text-xs font-semibold text-white/80">
                  {ret.id}
                </div>

                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0a0a0a] rounded-lg border border-white/5 p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={ret.image}
                      alt={ret.productName}
                      className="object-contain w-full h-full mix-blend-screen"
                    />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-white line-clamp-1">
                      {ret.productName}
                    </p>
                    <p className="text-[11px] text-white/40">
                      Order #{ret.orderId}
                    </p>
                  </div>
                </div>

                <div className="col-span-2 text-xs text-white/60">
                  {ret.requestedOn}
                </div>

                <div className="col-span-2">
                  <span className={`text-xs font-medium ${getStatusColor(ret.status)}`}>
                    {ret.status}
                  </span>
                </div>

                <div className="col-span-2 text-right text-xs sm:text-sm font-semibold text-white">
                  ₹{ret.amount.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
