"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Order, OrderStatus, PaymentStatus } from "@/types/orders.types";;

export interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCancelOrder: (orderId: string) => void;
  statusFilter?: "All" | OrderStatus;
  onStatusFilterChange?: (status: "All" | OrderStatus) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export default function OrdersTable({
  orders,
  onViewOrder,
  onUpdateStatus,
  onCancelOrder,
  statusFilter = "All",
  onStatusFilterChange,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
}: OrdersTableProps) {
  // Search state
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchQueryChange || setInternalSearchQuery;

  // Filter state for payment status tabs
  const [paymentFilter, setPaymentFilter] = useState<"All" | "Success" | "Pending" | "Failed">("All");

  // Local/controlled order fulfillment status filter
  const [localOrderStatusFilter, setLocalOrderStatusFilter] = useState<"All" | OrderStatus>(statusFilter);

  const activeOrderStatus = onStatusFilterChange ? statusFilter : localOrderStatusFilter;
  const handleOrderStatusChange = (val: "All" | OrderStatus) => {
    setLocalOrderStatusFilter(val);
    onStatusFilterChange?.(val);
    setCurrentPage(1);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Filter logic
  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      // 1. Order Fulfillment Status Filter
      if (activeOrderStatus !== "All" && order.orderStatus !== activeOrderStatus) {
        return false;
      }

      // 2. Payment Status Filter (Success maps to Paid)
      if (paymentFilter !== "All") {
        if (paymentFilter === "Success" && order.paymentStatus !== "Paid") return false;
        if (paymentFilter === "Pending" && order.paymentStatus !== "Pending") return false;
        if (paymentFilter === "Failed" && order.paymentStatus !== "Failed") return false;
      }

      // 3. Search Query
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
  }, [orders, activeOrderStatus, paymentFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {status}
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-400">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            {status}
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            {status}
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            {status}
          </span>
        );
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {status}
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-medium text-white/60">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Success
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Pending
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Failed
          </span>
        );
    }
  };

  const paymentTabs: Array<"All" | "Success" | "Pending" | "Failed"> = [
    "All",
    "Success",
    "Pending",
    "Failed",
  ];

  const orderStatusOptions: Array<{ label: string; value: "All" | OrderStatus }> = [
    { label: "All Status", value: "All" },
    { label: "Pending", value: "Pending" },
    { label: "Confirmed", value: "Confirmed" },
    { label: "Processing", value: "Processing" },
    { label: "Shipped", value: "Shipped" },
    { label: "Delivered", value: "Delivered" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm animate-in fade-in duration-300">
      {/* Table Filter Bar: Payment Status Tabs + Order Status Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 px-6 py-4 bg-[#121212]">
        {/* Left: Tab Switcher Filter for Success / Pending / Failed */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/5 w-fit">
          {paymentTabs.map((tab) => {
            const isActive = paymentFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setPaymentFilter(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${isActive
                    ? "bg-white text-black shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Right: Dropdown Filter for Shipped, Delivered, etc. */}
        <div className="flex items-center gap-2">
          <label htmlFor="order-status-filter" className="text-xs text-white/50 whitespace-nowrap">
            Fulfillment:
          </label>
          <select
            id="order-status-filter"
            value={activeOrderStatus}
            onChange={(e) => handleOrderStatusChange(e.target.value as "All" | OrderStatus)}
            aria-label="Filter by order fulfillment status"
            className="h-8.5 rounded-lg bg-[#0a0a0a] border border-white/10 px-3 text-xs text-white outline-none focus:border-white/30 cursor-pointer transition-colors"
          >
            {orderStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#121212] text-white">
                {opt.label}
              </option>
            ))}
          </select>
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
                Amount
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Payment Status
              </th>
              <th className="px-5 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Order Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
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
                  {(searchQuery || activeOrderStatus !== "All" || paymentFilter !== "All") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        handleOrderStatusChange("All");
                        setPaymentFilter("All");
                        setCurrentPage(1);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#640C0C] hover:bg-[#7a1010] text-white px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Reset Filters
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

                  {/* Items Preview with reduced item name width */}
                  <td className="px-5 py-3.5">
                    <div
                      className="font-medium text-white/90 truncate max-w-[130px]"
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

                  {/* Amount (instead of Total Amount) */}
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer: Summary & Minimal Pagination Controls */}
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

        <div className="flex items-center gap-1.5 select-none">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${currentPage <= 1
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
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${currentPage >= totalPages
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