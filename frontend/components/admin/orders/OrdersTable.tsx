"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Order, OrderStatus, PaymentStatus } from "./types";

export interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCancelOrder: (orderId: string) => void;
  statusFilter?: "All" | OrderStatus;
  onStatusFilterChange?: (status: "All" | OrderStatus) => void;
}

export default function OrdersTable({
  orders,
  onViewOrder,
  onUpdateStatus,
  onCancelOrder,
  statusFilter = "All",
  onStatusFilterChange,
}: OrdersTableProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Filter logic (statusFilter from summary cards + search query)
  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      // 1. Order Status Filter (from summary cards)
      if (statusFilter !== "All" && order.orderStatus !== statusFilter) {
        return false;
      }

      // 2. Search Query (Order ID or Customer Name / Email)
      if (query) {
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesName = order.customer.name.toLowerCase().includes(query);
        const matchesEmail = order.customer.email.toLowerCase().includes(query);

        if (!matchesId && !matchesName && !matchesEmail) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  // Status Badges
  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {status}
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            {status}
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-300">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            {status}
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            {status}
          </span>
        );
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {status}
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#640C0C]/50 bg-[#640C0C]/25 px-2.5 py-0.5 text-xs font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#640C0C]" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/60">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Paid
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Pending
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#640C0C]/50 bg-[#640C0C]/25 px-2.5 py-0.5 text-xs font-medium text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#640C0C]" />
            Failed
          </span>
        );
    }
  };

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm animate-in fade-in duration-300">
      {/* Table Header Section: Title & Integrated Product Search (consistent with Products & Inventory) */}
      <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-5 bg-[#121212]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title & Badge */}
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Recent Orders
              </h2>
              <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-xs font-semibold text-white/90">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
            <p className="mt-1 text-xs text-white/50">
              Manage incoming auto parts orders, track deliveries, and update
              fulfillment status
            </p>
          </div>

          {/* Right: Integrated Search Input (Search by Order ID or Customer Name) */}
          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Order ID, Customer..."
              aria-label="Search orders"
              className="w-full h-10 rounded-full bg-white/5 border border-white/10 pl-9.5 pr-8 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-[#640C0C] focus:bg-[#161616]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table Container without horizontal scrollbar */}
      <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-[#0a0a0a] text-white/40">
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Order ID
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Customer Name
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Date &amp; Time
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider">
                Items
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Total Amount
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Payment Status
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Order Status
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-xs text-white/40"
                >
                  <p className="text-sm font-medium text-white/70 mb-1">
                    No orders found
                  </p>
                  <p className="text-xs text-white/40 mb-3 max-w-sm mx-auto">
                    {searchQuery
                      ? `No orders match "${searchQuery}". Check the Order ID or Customer name.`
                      : "No orders match the selected criteria."}
                  </p>
                  {(searchQuery || statusFilter !== "All") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        onStatusFilterChange?.("All");
                        setCurrentPage(1);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Reset Search
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => onViewOrder(order)}
                  className="transition-colors hover:bg-white/[0.04] cursor-pointer group"
                >
                  {/* Order ID */}
                  <td className="px-5 py-3.5 font-mono font-medium text-white/90 whitespace-nowrap">
                    <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-xs text-white group-hover:border-[#640C0C]/50 transition-colors">
                      #{order.id}
                    </span>
                  </td>

                  {/* Customer Name & Contact */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="font-medium text-white group-hover:text-white">
                      {order.customer.name}
                    </div>
                    <div className="text-[11px] text-white/40 font-mono mt-0.5">
                      {order.customer.phone}
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="px-5 py-3.5 whitespace-nowrap text-white/70">
                    <div className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-[11px] text-white/40 mt-0.5">
                      {new Date(order.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>

                  {/* Items Preview */}
                  <td className="px-5 py-3.5">
                    <div
                      className="font-medium text-white/90 truncate max-w-[190px]"
                      title={order.items.map((i) => i.name).join(", ")}
                    >
                      {order.items[0]?.name || "Automotive Accessory"}
                    </div>
                    <div className="text-[11px] text-white/40 mt-0.5">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      {order.items.reduce((sum, item) => sum + item.quantity, 0) === 1
                        ? "item"
                        : "items"}
                      {order.items.length > 1 && ` (+${order.items.length - 1} more)`}
                    </div>
                  </td>

                  {/* Total Amount */}
                  <td className="px-5 py-3.5 font-bold text-white whitespace-nowrap text-[13px]">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </td>

                  {/* Payment Status */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </td>

                  {/* Order Status */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {getOrderStatusBadge(order.orderStatus)}
                  </td>

                  {/* Actions */}
                  <td
                    className="px-5 py-3.5 whitespace-nowrap text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onViewOrder(order)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-[#640C0C] hover:border-[#640C0C] hover:text-white transition-colors cursor-pointer"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer: Summary & Minimal Pagination Controls (< > without numbers between them) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 bg-[#0a0a0a] px-6 py-3.5 text-xs text-white/40">
        <div>
          Showing{" "}
          <span className="font-semibold text-white/90">
            {filteredOrders.length === 0 ? 0 : startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-white/90">
            {Math.min(startIndex + PAGE_SIZE, filteredOrders.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-white/90">
            {filteredOrders.length}
          </span>{" "}
          orders
          {orders.length !== filteredOrders.length && (
            <span className="text-white/40">
              {" "}
              (filtered from {orders.length} total)
            </span>
          )}
        </div>

        {/* Minimal Pagination Controls: only < and > (numbers between them removed) */}
        <div className="flex items-center gap-1.5 select-none">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${
              currentPage <= 1
                ? "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${
              currentPage >= totalPages
                ? "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
