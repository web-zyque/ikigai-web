"use client";

import React, { useState, useMemo } from "react";
import { Menu } from "lucide-react";
import { useMobileMenu } from "@/contexts/admin-layout-context";
import {
  useAdminOrderAction,
  useAdminOrderStats,
  useAdminOrders,
} from "@/hooks/use-orders";
import type { OrderStatusValue, OrderRecord } from "@/services/orders.service";
import { useToastStore } from "@/stores/toast-store";
import OrderSummaryCards, { OrderCounts } from "@/components/admin/orders/OrderSummaryCards";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import OrderDetailsModal from "@/components/admin/orders/OrderDetailsModal";

export default function OrderDashboardPage() {
  const { setMobileOpen } = useMobileMenu();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const addToast = useToastStore((state) => state.addToast);

  const { data: ordersData, isLoading, refetch } = useAdminOrders({
    limit: 100,
  });

  const stats = useAdminOrderStats();
  const action = useAdminOrderAction();

  const orders: OrderRecord[] = useMemo(() => ordersData?.orders ?? [], [ordersData]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find((o) => o.id === selectedOrderId) || null;
  }, [selectedOrderId, orders]);

  const counts: OrderCounts = useMemo(() => {
    return {
      total: stats.data?.total ?? orders.length,
      confirmed:
        stats.data?.confirmed ??
        orders.filter((o) => o.orderStatus === "CONFIRMED").length,
      pending:
        stats.data?.pending ??
        orders.filter((o) => o.orderStatus === "PENDING").length,
      cancelled:
        stats.data?.cancelled ??
        orders.filter((o) => o.orderStatus === "CANCELLED").length,
    };
  }, [stats.data, orders]);

  const handleStatusCardClick = (status: string) => {
    setStatusFilter(status);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatusValue) => {
    try {
      await action.mutateAsync({
        type: "status",
        id: orderId,
        status: newStatus,
      });
      addToast(`Order status updated to ${newStatus}.`, "success");
      refetch();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to update order status.",
        "error"
      );
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 px-4 lg:px-8 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60 text-xs">Loading orders...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="flex-1 px-4 lg:px-8 py-6 space-y-4 w-full flex flex-col justify-start">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Open navigation menu"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-[#640C0C] transition-colors lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white lg:hidden">
              Orders
            </h1>
          </div>
        </div>

        <OrderSummaryCards
          counts={counts}
          selectedStatus={statusFilter}
          onStatusClick={handleStatusCardClick}
        />

        <OrdersTable
          orders={orders}
          onViewOrder={(order) => setSelectedOrderId(order.id)}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={setPaymentFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </main>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrderId && selectedOrder)}
        onClose={() => setSelectedOrderId(null)}
        onUpdateStatus={handleUpdateStatus}
        isUpdatingStatus={action.isPending}
      />
    </>
  );
}
