"use client";

import React, { useMemo } from "react";
import { Search, ChevronDown, X, MoreVertical, Download, RefreshCw, Undo2 } from "lucide-react";
import { ProfileOrder } from "./profile.types";
import { getStatusColor } from "./profile.utils";

interface ProfileOrdersTabProps {
  orders: ProfileOrder[];
  ordersSearch: string;
  setOrdersSearch: (val: string) => void;
  ordersFilter: string;
  setOrdersFilter: (val: string) => void;
  orderTabs: string[];
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onNavigateToOrder: (id: string) => void;
  onNavigateToProducts: () => void;
  onRequestReturn: () => void;
}

export function ProfileOrdersTab({
  orders,
  ordersSearch,
  setOrdersSearch,
  ordersFilter,
  setOrdersFilter,
  orderTabs,
  openDropdownId,
  setOpenDropdownId,
  dropdownRef,
  onNavigateToOrder,
  onNavigateToProducts,
  onRequestReturn,
}: ProfileOrdersTabProps) {
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const s = order.status.toLowerCase();
      let matchesTab = false;
      if (ordersFilter === "All") matchesTab = true;
      else if (ordersFilter === "Delivered") matchesTab = s === "delivered";
      else if (ordersFilter === "Processing") matchesTab = s === "processing";
      else if (ordersFilter === "Shipped") matchesTab = s === "shipped";
      else if (ordersFilter === "Cancelled") matchesTab = s === "cancelled";

      const matchesSearch =
        order.productName.toLowerCase().includes(ordersSearch.toLowerCase()) ||
        order.id.toLowerCase().includes(ordersSearch.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [orders, ordersFilter, ordersSearch]);

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 px-4 sm:px-6 py-4 bg-[#121212]">
        <div className="flex sm:hidden items-center gap-2 w-full">
          <div className="relative shrink-0 w-32">
            <select
              value={ordersFilter}
              onChange={(e) => setOrdersFilter(e.target.value)}
              className="w-full h-9 rounded-full bg-[#0a0a0a] border border-white/10 pl-3 pr-7 text-xs text-white appearance-none outline-none focus:border-white/30 cursor-pointer"
            >
              {orderTabs.map((tab) => (
                <option key={tab} value={tab} className="bg-[#121212] text-white">
                  {tab}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50 pointer-events-none" />
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={ordersSearch}
              onChange={(e) => setOrdersSearch(e.target.value)}
              placeholder="Search orders..."
              className="w-full h-9 rounded-full bg-[#0a0a0a] border border-white/10 pl-8 pr-7 text-xs text-white placeholder-white/40 outline-none focus:border-white/30"
            />
            {ordersSearch && (
              <button
                type="button"
                onClick={() => setOrdersSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center text-white/40 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/5 w-fit overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {orderTabs.map((tab) => {
            const isActive = ordersFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setOrdersFilter(tab)}
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

        <div className="hidden sm:flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={ordersSearch}
              onChange={(e) => setOrdersSearch(e.target.value)}
              placeholder="Search orders..."
              className="w-full h-9 rounded-full bg-[#0a0a0a] border border-white/10 pl-9 pr-7 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 focus:bg-[#121212]"
            />
            {ordersSearch && (
              <button
                type="button"
                onClick={() => setOrdersSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-white/10 text-xs font-semibold text-white/50 uppercase tracking-wider bg-white/[0.02]">
        <div className="col-span-3">Order ID</div>
        <div className="col-span-5">Product Name</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-1 text-center">Status</div>
        <div className="col-span-1 text-center">Action</div>
      </div>

      <div className="divide-y divide-white/5" ref={dropdownRef}>
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white/40 text-xs sm:text-sm">No matching orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="hover:bg-white/[0.02] transition-colors">
              <div
                className="md:hidden p-4 space-y-2.5 cursor-pointer relative"
                onClick={() => onNavigateToOrder(order.id)}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-16 h-16 bg-[#0a0a0a] rounded-xl border border-white/10 p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={order.image}
                      alt={order.productName}
                      className="object-contain w-full h-full mix-blend-screen"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                        {order.productName}
                      </p>

                      <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenDropdownId(openDropdownId === order.id ? null : order.id)
                          }
                          className="p-1 -mr-1 -mt-1 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                          aria-label="Order actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdownId === order.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden text-xs">
                            <button
                              type="button"
                              onClick={() => alert("Invoice download initiated.")}
                              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Invoice</span>
                            </button>
                            <button
                              type="button"
                              onClick={onNavigateToProducts}
                              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Buy Again</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onRequestReturn();
                                setOpenDropdownId(null);
                              }}
                              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/10 border-t border-white/5 cursor-pointer"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              <span>Request Return</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-white/50 font-mono">
                      <span>{order.id}</span>
                      <span>•</span>
                      <span>{order.date}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="font-semibold text-white">
                        ₹{order.amount.toLocaleString("en-IN")}
                      </span>
                      <span className={`font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() => onNavigateToOrder(order.id)}
                className="hidden md:grid grid-cols-12 gap-3 items-center px-6 py-4 hover:bg-white/[0.04] transition-colors relative cursor-pointer"
              >
                <div className="col-span-3 text-xs font-mono font-medium text-white/70">
                  {order.id}
                </div>

                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#0a0a0a] rounded-lg border border-white/5 p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={order.image}
                      alt={order.productName}
                      className="object-contain w-full h-full mix-blend-screen"
                    />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-white line-clamp-1">
                      {order.productName}
                    </p>
                    <p className="text-[11px] text-white/40">
                      ₹{order.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="col-span-2 text-xs text-white/60">
                  {order.date}
                </div>

                <div className="col-span-1 flex justify-center items-center">
                  <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div
                  className="col-span-1 flex justify-center relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdownId(openDropdownId === order.id ? null : order.id)
                    }
                    className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                    aria-label="Order actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openDropdownId === order.id && (
                    <div className="absolute right-0 top-9 w-44 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden text-xs">
                      <button
                        type="button"
                        onClick={() => alert("Invoice download initiated.")}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Invoice</span>
                      </button>
                      <button
                        type="button"
                        onClick={onNavigateToProducts}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Buy Again</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onRequestReturn();
                          setOpenDropdownId(null);
                        }}
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-white/80 hover:text-white hover:bg-white/10 border-t border-white/5 cursor-pointer"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>Request Return</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
