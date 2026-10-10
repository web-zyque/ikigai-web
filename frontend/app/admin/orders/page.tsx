"use client";

import React, { useState, useMemo } from "react";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";
import OrderSummaryCards, {
  OrderCounts,
} from "@/components/admin/orders/OrderSummaryCards";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import OrderDetailsModal from "@/components/admin/orders/OrderDetailsModal";
import { INITIAL_MOCK_ORDERS } from "@/components/admin/orders/mockOrders";
import { Order, OrderStatus } from "@/components/admin/orders/types";

export default function OrderDashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

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

  return (
    <div className="flex min-h-screen bg-black text-white antialiased selection:bg-[#640C0C]/40 selection:text-white">
      {/* Reused Fixed Desktop / Mobile Sidebar */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        {/* Reused Top Header */}
        <AdminHeader
          title="Orders"
          onToggleMobile={() => setMobileOpen((prev) => !prev)}
        />

        <main className="flex-1 px-6 lg:px-12 py-8 space-y-6 max-w-7xl w-full">
          {/* 1. Order Summary Cards (Priority 1) */}
          <OrderSummaryCards
            counts={counts}
            activeStatus={statusFilter}
            onSelectStatus={(st) => setStatusFilter(st)}
          />

          {/* 2. Recent Orders Section (Priority 2) */}
          <OrdersTable
            orders={ordersList}
            onViewOrder={handleViewOrder}
            onUpdateStatus={handleUpdateStatus}
            onCancelOrder={handleCancelOrder}
            statusFilter={statusFilter}
            onStatusFilterChange={(st) => setStatusFilter(st)}
          />
        </main>
      </div>

      {/* 3. Order Details Modal (Priority 3 & 4) */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModal}
        onUpdateStatus={handleUpdateStatus}
        onCancelOrder={handleCancelOrder}
      />
    </div>
  );
}
