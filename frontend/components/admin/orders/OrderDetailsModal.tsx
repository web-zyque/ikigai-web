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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
            <Clock className="h-3 w-3" />
            {status}
          </span>
        );
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
            <CheckCircle2 className="h-3 w-3" />
            {status}
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
            <RefreshCw className="h-3 w-3" />
            {status}
          </span>
        );
      case "Shipped":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <Package className="h-3 w-3" />
            {status}
          </span>
        );
      case "Delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            {status}
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#640C0C]/50 bg-[#640C0C]/25 px-3 py-1 text-xs font-medium text-white">
            <Ban className="h-3 w-3" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Paid
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Pending
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#640C0C]/50 bg-[#640C0C]/25 px-2.5 py-0.5 text-xs font-semibold text-white">
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

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl flex flex-col rounded-[20px] border border-white/10 bg-[#121212] text-white shadow-2xl overflow-hidden my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-[#0a0a0a]">
          <div className="flex items-center gap-3.5">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-lg font-bold tracking-tight text-white">
                  #{order.id}
                </span>
                {getOrderStatusBadge(order.orderStatus)}
              </div>
              <p className="mt-1 text-xs text-white/50 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-white/40" />
                <span>
                  Placed on {order.formattedDate} at {order.formattedTime}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="grid h-8 w-8 place-items-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-[#640C0C] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top 2 Columns: Customer & Shipping Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="rounded-xl border border-white/5 bg-[#0e0e0e] p-4.5 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 text-xs font-semibold uppercase tracking-wider text-white/50">
                <User className="h-3.5 w-3.5 text-white/40" />
                <span>Customer Details</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-white/40 block text-[11px]">Customer Name</span>
                  <span className="font-semibold text-white text-sm">
                    {order.customer.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Mail className="h-3.5 w-3.5 text-white/40 shrink-0" />
                  <span className="truncate">{order.customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Phone className="h-3.5 w-3.5 text-white/40 shrink-0" />
                  <span>{order.customer.phone}</span>
                </div>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="rounded-xl border border-white/5 bg-[#0e0e0e] p-4.5 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 text-xs font-semibold uppercase tracking-wider text-white/50">
                <MapPin className="h-3.5 w-3.5 text-white/40" />
                <span>Shipping Address</span>
              </div>
              <div className="space-y-1.5 text-xs text-white/80">
                <p className="font-medium text-white">{order.customer.name}</p>
                <p className="text-white/70">{order.customer.address}</p>
                <p className="text-white/70">
                  {order.customer.city}, {order.customer.state} -{" "}
                  <span className="font-mono text-white">{order.customer.pincode}</span>
                </p>
                <p className="text-[11px] text-white/40 pt-1">Standard Surface Courier</p>
              </div>
            </div>
          </div>

          {/* Ordered Products Section */}
          <div className="rounded-xl border border-white/5 bg-[#0e0e0e] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-4.5 py-3 bg-[#0a0a0a]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                <Package className="h-3.5 w-3.5 text-white/40" />
                <span>Ordered Products ({order.itemCount})</span>
              </div>
            </div>

            <div className="divide-y divide-white/5 overflow-x-auto">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-4 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#0a0a0a] border border-white/10">
                      <Image
                        src={item.image || "/images/category_lighting.jpg"}
                        alt={item.name}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white text-[13px]">{item.name}</p>
                      <p className="font-mono text-[11px] text-white/40 mt-0.5">
                        SKU: {item.sku}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-10 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-white/40 block">Unit Price</span>
                      <span className="text-white font-medium">
                        ₹{item.unitPrice.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-white/40 block">Qty</span>
                      <span className="text-white font-semibold">{item.quantity}</span>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="text-[11px] text-white/40 block">Total</span>
                      <span className="text-white font-bold text-sm">
                        ₹{item.totalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Information */}
            <div className="rounded-xl border border-white/5 bg-[#0e0e0e] p-4.5 space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 text-xs font-semibold uppercase tracking-wider text-white/50">
                <CreditCard className="h-3.5 w-3.5 text-white/40" />
                <span>Payment Information</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Payment Method</span>
                  <span className="font-medium text-white">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Payment Status</span>
                  <div>{getPaymentStatusBadge(order.paymentStatus)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Transaction ID</span>
                  <span className="font-mono text-white/70">
                    TXN-{order.id.replace("ORD-", "")}-78A
                  </span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-xl border border-white/5 bg-[#0e0e0e] p-4.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-white/60">
                <span>Items Subtotal</span>
                <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <span>Shipping Fee</span>
                <span className="text-emerald-400 font-medium">Free</span>
              </div>
              <div className="flex items-center justify-between text-white/60">
                <span>Estimated GST</span>
                <span>Included (18%)</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                <span className="font-bold text-sm text-white">Grand Total</span>
                <span className="font-bold text-lg text-white">
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Order Notes (if any) */}
          {order.notes && (
            <div className="rounded-xl border border-white/5 bg-[#0e0e0e] p-4 text-xs text-white/70 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white/90 block mb-0.5">
                  Order Note:
                </span>
                <span>{order.notes}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-white/5 bg-[#0a0a0a] px-6 py-4">
          {/* Status Update Control */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-white/50 font-medium">Update Status:</span>
            <select
              value={order.orderStatus}
              onChange={(e) =>
                onUpdateStatus?.(order.id, e.target.value as OrderStatus)
              }
              aria-label="Update order status"
              className="rounded-full bg-white/5 border border-white/15 px-3.5 py-1.5 text-xs font-medium text-white outline-none cursor-pointer focus:border-[#640C0C] focus:bg-[#161616] transition-colors"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st} className="bg-[#121212] text-white">
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 justify-end">
            {order.orderStatus !== "Cancelled" && order.orderStatus !== "Delivered" && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to cancel order #${order.id}?`)) {
                    onCancelOrder?.(order.id);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-300 transition-colors cursor-pointer"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Cancel Order</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}