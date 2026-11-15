"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import type { OrderRecord, OrderStatusValue } from "@/services/orders.service";

export interface OrdersTableProps {
  orders: OrderRecord[];
  onViewOrder: (order: OrderRecord) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  paymentFilter?: string;
  onPaymentFilterChange?: (payment: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

const statusTabOptions = [
  { label: "All", value: "All" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const statusLabels: Record<OrderStatusValue, string> = {
  AWAITING_PAYMENT: "Awaiting payment",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function OrdersTable({
  orders,
  onViewOrder,
  statusFilter = "All",
  onStatusFilterChange,
  paymentFilter = "All",
  onPaymentFilterChange,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
}: OrdersTableProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = onSearchQueryChange || setInternalSearchQuery;

  const [localStatusFilter, setLocalStatusFilter] = useState<string>(statusFilter);
  const activeStatusFilter = onStatusFilterChange ? statusFilter : localStatusFilter;

  const [localPaymentFilter, setLocalPaymentFilter] = useState<string>(paymentFilter);
  const activePaymentFilter = onPaymentFilterChange ? paymentFilter : localPaymentFilter;

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [orders, searchQuery, activeStatusFilter, activePaymentFilter]);

  const handleStatusChange = (val: string) => {
    setLocalStatusFilter(val);
    onStatusFilterChange?.(val);
    setCurrentPage(1);
  };

  const handlePaymentChange = (val: string) => {
    setLocalPaymentFilter(val);
    onPaymentFilterChange?.(val);
    setCurrentPage(1);
  };

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return orders.filter((order) => {
      if (activeStatusFilter !== "All" && order.orderStatus !== activeStatusFilter) {
        return false;
      }

      if (activePaymentFilter !== "All" && order.paymentStatus !== activePaymentFilter) {
        return false;
      }

      if (query) {
        const matchesNumber = order.orderNumber.toLowerCase().includes(query);
        const customerName = order.customer?.name || order.shippingAddress?.fullName || "";
        const customerPhone = order.customer?.phone || order.shippingAddress?.phone || "";
        const matchesName = customerName.toLowerCase().includes(query);
        const matchesPhone = customerPhone.toLowerCase().includes(query);
        const matchesItems = order.items.some(
          (i) =>
            i.productName.toLowerCase().includes(query) ||
            i.sku.toLowerCase().includes(query)
        );

        if (!matchesNumber && !matchesName && !matchesPhone && !matchesItems) {
          return false;
        }
      }

      return true;
    });
  }, [orders, activeStatusFilter, activePaymentFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);

  const getOrderStatusColor = (status: OrderStatusValue) => {
    switch (status) {
      case "CONFIRMED":
        return "text-emerald-400";
      case "PENDING":
        return "text-yellow-400";
      case "PROCESSING":
        return "text-orange-400";
      case "SHIPPED":
        return "text-sky-400";
      case "DELIVERED":
        return "text-emerald-400";
      case "CANCELLED":
        return "text-red-500";
      case "AWAITING_PAYMENT":
        return "text-purple-400";
      default:
        return "text-white/60";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "text-emerald-400";
      case "PENDING":
        return "text-amber-400";
      case "FAILED":
        return "text-red-500";
      case "REFUNDED":
        return "text-sky-400";
      default:
        return "text-white/60";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Paid";
      case "PENDING":
        return "Pending";
      case "FAILED":
        return "Failed";
      case "REFUNDED":
        return "Refunded";
      default:
        return status;
    }
  };

  return (
    <div className="rounded-[20px] border border-white/5 bg-[#121212] overflow-hidden shadow-sm animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/5 px-6 py-4 bg-[#121212]">
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/5 w-fit overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {statusTabOptions.map((tab) => {
            const isActive = activeStatusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleStatusChange(tab.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-black shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              aria-label="Search orders"
              className="w-full h-8.5 rounded-lg bg-[#0a0a0a] border border-white/10 pl-8.5 pr-7 text-xs text-white placeholder-white/40 outline-none transition-colors focus:border-white/30 focus:bg-[#121212]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <select
            id="payment-filter"
            value={activePaymentFilter}
            onChange={(e) => handlePaymentChange(e.target.value)}
            aria-label="Filter by payment status"
            className="h-8.5 rounded-lg bg-[#0a0a0a] border border-white/10 px-3 text-xs text-white outline-none focus:border-white/30 cursor-pointer transition-colors"
          >
            <option value="All" className="bg-[#121212] text-white">
              All Payments
            </option>
            <option value="PAID" className="bg-[#121212] text-white">
              Paid
            </option>
            <option value="PENDING" className="bg-[#121212] text-white">
              Pending
            </option>
            <option value="FAILED" className="bg-[#121212] text-white">
              Failed
            </option>
            <option value="REFUNDED" className="bg-[#121212] text-white">
              Refunded
            </option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 bg-[#0a0a0a] text-white/40">
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Order #
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Customer
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Date
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Items
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap">
                Amount
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap min-w-[130px]">
                Payment
              </th>
              <th className="px-6 py-3.5 font-medium uppercase tracking-wider whitespace-nowrap min-w-[150px] w-40">
                Status
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
                      ? `No orders match "${searchQuery}". Check the order number or customer name.`
                      : "No orders match the selected criteria."}
                  </p>
                  {(searchQuery || activeStatusFilter !== "All" || activePaymentFilter !== "All") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        handleStatusChange("All");
                        handlePaymentChange("All");
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
              paginatedOrders.map((order) => {
                const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                const customerName = order.customer?.name || order.shippingAddress?.fullName || "Guest Customer";
                const totalItemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                return (
                  <tr
                    key={order.id}
                    onClick={() => onViewOrder(order)}
                    className="transition-colors hover:bg-white/[0.04] cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-white/90 whitespace-nowrap">
                      #{order.orderNumber}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                      {customerName}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-white/70">
                      {formattedDate}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white/80">
                      {totalItemCount} {totalItemCount === 1 ? "item" : "items"}
                    </td>

                    <td className="px-6 py-4 font-bold text-white whitespace-nowrap text-[13px]">
                      ₹{parseFloat(order.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap min-w-[130px]">
                      <div className="flex items-center text-xs">
                        <span className="text-white/70 font-medium">
                          {order.paymentMethod === "ONLINE" ? "Online" : "COD"}
                        </span>
                        <span className="text-white/30 mx-1.5">·</span>
                        <span className={`font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {getPaymentStatusText(order.paymentStatus)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap min-w-[150px] w-40">
                      <span className={`font-medium ${getOrderStatusColor(order.orderStatus)}`}>
                        {statusLabels[order.orderStatus] || order.orderStatus}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 bg-[#0a0a0a] px-6 py-3.5 text-xs text-white/40">
        <div>
          Showing{" "}
          <span className="font-semibold text-white/90">
            {paginatedOrders.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-white/90">
            {filteredOrders.length}
          </span>{" "}
          orders
        </div>

        <div className="flex items-center gap-1.5 select-none">
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${
              safeCurrentPage <= 1
                ? "border-white/5 bg-white/[0.02] text-white/20 cursor-not-allowed"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${
              safeCurrentPage >= totalPages
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
