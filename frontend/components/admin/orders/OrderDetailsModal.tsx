"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Ban,
} from "lucide-react";
import { Order, OrderStatus, PaymentStatus } from "@/types/orders.types";

export interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onCancelOrder?: (orderId: string) => void;
}

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onCancelOrder,
}: OrderDetailsModalProps) {
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
            <Clock className="h-3 w-3" />
            {status}
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-300">
            <CheckCircle2 className="h-3 w-3" />
            {status}
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-300">
            <RefreshCw className="h-3 w-3" />
            {status}
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
            <Package className="h-3 w-3" />
            {status}
          </span>
        );
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            {status}
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#640C0C]/50 bg-[#640C0C]/25 px-2.5 py-0.5 text-xs font-medium text-white">
            <Ban className="h-3 w-3" />
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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Paid
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Pending
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#640C0C]/50 bg-[#640C0C]/25 px-2 py-0.5 text-xs font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#640C0C]" />
            Failed
          </span>
        );
    }
  };

  const statusOptions: OrderStatus[] = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const timelineSteps: { key: OrderStatus; label: string }[] = [
    { key: "Pending", label: "Placed" },
    { key: "Confirmed", label: "Confirmed" },
    { key: "Processing", label: "Processing" },
    { key: "Shipped", label: "Shipped" },
    { key: "Delivered", label: "Delivered" },
  ];

  const statusProgression: OrderStatus[] = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  const currentStepIndex = statusProgression.indexOf(order.orderStatus);

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl flex flex-col rounded-2xl border border-white/10 bg-[#121212] text-white shadow-2xl overflow-hidden my-auto max-h-[92vh]"
      >
        {/* 1. Header: Order ID, current status, and order date/time */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5 bg-[#0a0a0a] shrink-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-base font-bold tracking-tight text-white">
              #{order.id}
            </span>
            {getOrderStatusBadge(order.orderStatus)}
            <span className="text-white/20 text-xs hidden sm:inline">•</span>
            <p className="text-xs text-white/50 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-white/40" />
              <span>
                Placed on {order.formattedDate} at {order.formattedTime}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="grid h-7 w-7 place-items-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-[#640C0C] hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {/* 4. Order Timeline: Compact horizontal timeline */}
          {order.orderStatus === "Cancelled" ? (
            <div className="rounded-xl border border-[#640C0C]/50 bg-[#640C0C]/15 px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-white font-medium">
                <Ban className="h-4 w-4 text-red-400 shrink-0" />
                <span>Order Cancelled</span>
              </div>
              <span className="text-[11px] text-white/50">
                Placed on {order.formattedDate} at {order.formattedTime}
              </span>
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-[#0e0e0e] px-4 py-3">
              <div className="flex items-start justify-between">
                {timelineSteps.map((step, idx) => {
                  const isCompleted = currentStepIndex > idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center min-w-[50px] sm:min-w-[64px]">
                        <div
                          className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shrink-0 ${
                            isCurrent
                              ? "bg-[#640C0C] text-white border border-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.45)] ring-2 ring-[#E50914]/25"
                              : isCompleted
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-white/5 text-white/30 border border-white/10"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        <span
                          className={`text-[10px] sm:text-[11px] mt-1 font-medium tracking-tight text-center ${
                            isCurrent
                              ? "text-white font-semibold"
                              : isCompleted
                              ? "text-white/80"
                              : "text-white/35"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>

                      {idx < timelineSteps.length - 1 && (
                        <div
                          className={`h-[2px] flex-1 mx-1 sm:mx-2 mt-2.5 transition-colors ${
                            currentStepIndex > idx ? "bg-emerald-500/40" : "bg-white/10"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2 & 3. Customer Details & Delivery Address: Side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer Details */}
            <div className="rounded-xl border border-white/5 bg-[#0e0e0e] p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 border-b border-white/5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                <User className="h-3 w-3 text-white/40" />
                <span>Customer Details</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <p className="font-semibold text-white">{order.customer.name}</p>
                <div className="flex items-center gap-2 text-white/70">
                  <Mail className="h-3.5 w-3.5 text-white/40 shrink-0" />
                  <span className="truncate">{order.customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Phone className="h-3.5 w-3.5 text-white/40 shrink-0" />
                  <span>{order.customer.phone}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-xl border border-white/5 bg-[#0e0e0e] p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 border-b border-white/5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                <MapPin className="h-3 w-3 text-white/40" />
                <span>Delivery Address</span>
              </div>
              <div className="space-y-1 text-xs text-white/80">
                <p className="leading-snug text-white/90">
                  {order.customer.address}, {order.customer.city},{" "}
                  {order.customer.state} -{" "}
                  <span className="font-mono text-white">{order.customer.pincode}</span>
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-white/50">
                  <span>Shipping Method:</span>
                  <span className="text-white/80 font-medium">Standard Surface Courier</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Ordered Products: Compact list */}
          <div className="rounded-xl border border-white/5 bg-[#0e0e0e] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-3.5 py-2 bg-[#0a0a0a]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                <Package className="h-3 w-3 text-white/40" />
                <span>Ordered Products ({order.itemCount})</span>
              </div>
            </div>

            <div className="divide-y divide-white/5 max-h-[160px] overflow-y-auto">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-[#0a0a0a] border border-white/10">
                      <Image
                        src={item.image || "/images/category_lighting.jpg"}
                        alt={item.name}
                        width={36}
                        height={36}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white text-xs truncate max-w-[200px] sm:max-w-[320px]">
                        {item.name}
                      </p>
                      <p className="font-mono text-[10px] text-white/40">
                        SKU: {item.sku}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-7 shrink-0 text-right">
                    <div>
                      <span className="text-[10px] text-white/40 block">Unit Price</span>
                      <span className="text-white/80 font-medium text-xs">
                        ₹{item.unitPrice.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-white/40 block">Qty</span>
                      <span className="text-white font-semibold text-xs">{item.quantity}</span>
                    </div>

                    <div className="min-w-[64px]">
                      <span className="text-[10px] text-white/40 block">Total</span>
                      <span className="text-white font-bold text-xs">
                        ₹{item.totalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Payment Summary: Payment method, payment status, transaction ID, and Grand Total */}
          <div className="rounded-xl border border-white/5 bg-[#0e0e0e] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-white/40" />
                <span className="text-white/40">Method:</span>
                <span className="font-medium text-white">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white/40">Status:</span>
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white/40">Txn ID:</span>
                <span className="font-mono text-white/80">
                  TXN-{order.id.replace("ORD-", "")}-78A
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 sm:ml-auto">
              <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">
                Grand Total:
              </span>
              <span className="text-base font-bold text-white tracking-tight">
                ₹{order.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* 7. Order Note: Display only when a real order note exists */}
          {order.notes && order.notes.trim() !== "" && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-2 text-xs text-white/80 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-semibold text-amber-300 mr-1.5">Order Note:</span>
                <span className="text-white/70">{order.notes}</span>
              </div>
            </div>
          )}
        </div>

        {/* 8. Footer: Update Status, Cancel Order, and Close in one row */}
        <div className="flex flex-row items-center justify-between gap-3 border-t border-white/5 bg-[#0a0a0a] px-5 py-3 shrink-0">
          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 font-medium">Update Status:</span>
            <select
              value={order.orderStatus}
              onChange={(e) =>
                onUpdateStatus?.(order.id, e.target.value as OrderStatus)
              }
              aria-label="Update order status"
              className="rounded-full bg-white/5 border border-white/15 px-3 py-1.5 text-xs font-medium text-white outline-none cursor-pointer focus:border-[#640C0C] focus:bg-[#161616] transition-colors"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st} className="bg-[#121212] text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {order.orderStatus !== "Cancelled" && order.orderStatus !== "Delivered" && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to cancel order #${order.id}?`)) {
                    onCancelOrder?.(order.id);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-1.5 text-xs font-semibold text-red-300 transition-colors cursor-pointer"
              >
                <Ban className="h-3 w-3" />
                <span>Cancel Order</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}