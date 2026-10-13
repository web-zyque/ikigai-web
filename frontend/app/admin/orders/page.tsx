"use client";

import React, { useState, useMemo } from "react";
import { Order, OrderStatus } from "@/types/orders.types";
import { Menu } from "lucide-react";
import { INITIAL_MOCK_ORDERS } from "@/data/mockOrders";
import { useMobileMenu } from "@/app/admin/layout";
import OrderSummaryCards, { OrderCounts } from "@/components/admin/orders/OrderSummaryCards";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import OrderDetailsModal from "@/components/admin/orders/OrderDetailsModal";


export default function OrderDashboardPage() {
  const { setMobileOpen } = useMobileMenu();

  // Orders State (initialized with realistic automotive parts orders)
  const [ordersList, setOrdersList] = useState<Order[]>(INITIAL_MOCK_ORDERS);

  // Selected order for the Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Status Filter (linked with Summary Cards and Orders Table)
  const [statusFilter, setStatusFilter] = useState<"All" | OrderStatus>("All");

  // Summary counts computed in real-time
  const counts: OrderCounts = useMemo(() => {
    return {
      total: ordersList.length,
      pending: ordersList.filter((o) => o.orderStatus === "Pending").length,
      processing: ordersList.filter((o) => o.orderStatus === "Processing").length,
      completed: ordersList.filter((o) => o.orderStatus === "Delivered").length,
      cancelled: ordersList.filter((o) => o.orderStatus === "Cancelled").length,
    };
  }, [ordersList]);

  // Open Order Details
  const handleViewOrder = (order: Order) => {
    console.log("handleViewOrder called with order:", order.id);
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  // Close Order Details
  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrder(null);
  };

  // Update Order Status
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrdersList((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, orderStatus: newStatus } : order
      )
    );

    // Keep selected order in modal synchronized
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, orderStatus: newStatus } : null
      );
    }
  };

  // Cancel Order
  const handleCancelOrder = (orderId: string) => {
    setOrdersList((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
            ...order,
            orderStatus: "Cancelled",
            paymentStatus:
              order.paymentStatus === "Pending"
                ? "Failed"
                : order.paymentStatus,
          }
          : order
      )
    );

    // Keep selected order in modal synchronized
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
            ...prev,
            orderStatus: "Cancelled",
            paymentStatus:
              prev.paymentStatus === "Pending"
                ? "Failed"
                : prev.paymentStatus,
          }
          : null
      );
    }
  };

  // Search Query State (synchronized with header search box)
  const [searchQuery, setSearchQuery] = useState("");

  // Date Range Filtering State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Filter orders by date range if specified
  const dateFilteredOrders = useMemo(() => {
    if (!startDate && !endDate) return ordersList;

    return ordersList.filter((order) => {
      const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
      if (startDate && endDate) {
        return orderDate >= startDate && orderDate <= endDate;
      }
      if (startDate) {
        return orderDate >= startDate;
      }
      if (endDate) {
        return orderDate <= endDate;
      }
      return true;
    });
  }, [ordersList, startDate, endDate]);

  return (
    <>
      <main className="flex-1 px-4 lg:px-8 py-6 space-y-4 max-w-7xl w-full flex flex-col justify-start">
        {/* Mobile menu toggle button if sidebar is collapsed on mobile */}
        <div className="lg:hidden flex items-center justify-between pb-2">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Open navigation menu"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <OrderSummaryCards
          counts={counts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />

        <OrdersTable
          orders={dateFilteredOrders}
          onViewOrder={handleViewOrder}
          onUpdateStatus={handleUpdateStatus}
          onCancelOrder={handleCancelOrder}
          statusFilter={statusFilter}
          onStatusFilterChange={(st) => setStatusFilter(st)}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </main>

      {/* 3. Order Details Modal (Priority 3 & 4) */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModal}
        onUpdateStatus={handleUpdateStatus}
        onCancelOrder={handleCancelOrder}
      />
    </>
  );
}