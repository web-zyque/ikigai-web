"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  X,
  Package,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import type { OrderRecord, OrderStatusValue } from "@/services/orders.service";
import { paymentsService } from "@/services/payments.service";

export interface OrderDetailsModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, newStatus: OrderStatusValue) => void;
  isUpdatingStatus?: boolean;
}

const statusLabels: Record<OrderStatusValue, string> = {
  AWAITING_PAYMENT: "Awaiting payment",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const allStatuses: OrderStatusValue[] = [
  "AWAITING_PAYMENT",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  isUpdatingStatus = false,
}: OrderDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusValue>(
    order?.orderStatus || "PENDING"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistoryData, setPaymentHistoryData] = useState<{
    attempts: Array<{ id: string; providerOrderId: string; providerPaymentId: string | null; amount: string; status: string; createdAt: string }>;
    transactions: Array<{ providerPaymentId: string; amount: string; status: string; paymentGroup: string | null; paidAt: string | null }>;
    refunds: Array<{ id: string; refundAmount: string; status: string; providerRefundId: string | null; createdAt: string }>;
  } | null>(null);
  const [isLoadingPaymentHistory, setIsLoadingPaymentHistory] = useState(false);
  const [paymentHistoryError, setPaymentHistoryError] = useState("");

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.orderStatus);
    }
  }, [order?.id, order?.orderStatus]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

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

  useEffect(() => {
    setShowPaymentHistory(false);
    setPaymentHistoryData(null);
    setPaymentHistoryError("");
    setIsDropdownOpen(false);
  }, [order?.id]);

  if (!isOpen || !order) return null;

  const isChanged = selectedStatus !== order.orderStatus;

  const loadPaymentHistory = async () => {
    if (paymentHistoryData) {
      setShowPaymentHistory((prev) => !prev);
      return;
    }
    setIsLoadingPaymentHistory(true);
    setPaymentHistoryError("");
    setShowPaymentHistory(true);
    try {
      const data = await paymentsService.adminHistory(order.id);
      setPaymentHistoryData(data as typeof paymentHistoryData);
    } catch (err) {
      setPaymentHistoryError(
        err instanceof Error ? err.message : "Failed to load payment history"
      );
    } finally {
      setIsLoadingPaymentHistory(false);
    }
  };

  const handleRetryRefund = async (refundId: string) => {
    try {
      await paymentsService.retryRefund(refundId);
      const data = await paymentsService.adminHistory(order.id);
      setPaymentHistoryData(data as typeof paymentHistoryData);
    } catch (err) {
      setPaymentHistoryError(
        err instanceof Error ? err.message : "Refund retry failed"
      );
    }
  };

  const getStatusTextColor = (status: OrderStatusValue) => {
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

  const getPaymentStatusTextColor = (status: string) => {
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

  const dateObj = new Date(order.createdAt);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl flex flex-col rounded-[20px] border border-white/10 bg-[#121212] text-white shadow-2xl overflow-hidden my-auto max-h-[92vh]"
      >
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 bg-[#0a0a0a]">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-bold tracking-tight text-white">
                #{order.orderNumber}
              </span>
              <span className="text-white/30">·</span>
              <span className={`text-xs font-semibold ${getStatusTextColor(order.orderStatus)}`}>
                {statusLabels[order.orderStatus] || order.orderStatus}
              </span>
            </div>
            <p className="mt-1 text-xs text-white/50">
              Placed on {formattedDate} at {formattedTime}
            </p>
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

        <div className="flex-1 overflow-y-auto p-6 space-y-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:#525252_transparent]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/5 bg-[#0e0e0e] p-5 space-y-3">
              <div className="border-b border-white/5 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                Customer Details
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-white/40 block text-[11px] mb-0.5">Name</span>
                  <span className="font-semibold text-white text-sm">
                    {order.customer?.name || order.shippingAddress.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[11px] mb-0.5">Phone</span>
                  <span className="text-white/80 font-mono">
                    {order.customer?.phone || order.shippingAddress.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#0e0e0e] p-5 space-y-2">
              <div className="border-b border-white/5 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                Shipping Address
              </div>
              <div className="space-y-1 text-xs text-white/80">
                <p className="font-semibold text-white">{order.shippingAddress.fullName}</p>
                <p className="text-white/70">
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
                </p>
                {order.shippingAddress.landmark && (
                  <p className="text-white/50 text-[11px]">Landmark: {order.shippingAddress.landmark}</p>
                )}
                <p className="text-white/70">
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                  <span className="font-mono text-white">{order.shippingAddress.postalCode}</span>
                </p>
                <p className="text-[11px] text-white/40 pt-1">
                  {order.shippingAddress.addressType || "Standard Delivery"} · {order.shippingAddress.country}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#0e0e0e] overflow-hidden">
            <div className="border-b border-white/5 px-5 py-3.5 bg-[#0a0a0a] text-xs font-semibold uppercase tracking-wider text-white/40">
              Ordered Products ({totalItemsCount})
            </div>

            <div className="divide-y divide-white/5 overflow-x-auto">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-4 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#0a0a0a] border border-white/10 flex items-center justify-center">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          sizes="44px"
                          unoptimized
                          className="object-contain p-1"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-white/30" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white text-[13px]">{item.productName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] text-white/40">
                          SKU: {item.sku}
                        </span>
                        {item.selectedVariant && (
                          <span className="rounded bg-white/5 px-1.5 py-0.2 text-[10px] text-white/60">
                            {item.selectedVariant.colorName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-10 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] text-white/40 block">Unit Price</span>
                      <span className="text-white font-medium">
                        ₹{parseFloat(item.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-white/40 block">Qty</span>
                      <span className="text-white font-semibold">{item.quantity}</span>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="text-[11px] text-white/40 block">Total</span>
                      <span className="text-white font-bold text-sm">
                        ₹{parseFloat(item.totalPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full rounded-xl border border-white/5 bg-[#0e0e0e] p-5 space-y-3">
            <div className="border-b border-white/5 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
              Payment Information
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Payment Method</span>
                <span className="font-medium text-white">
                  {order.paymentMethod === "ONLINE" ? "UPI · Cashfree" : "Cash on Delivery (COD)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Payment Status</span>
                <span className={`font-semibold ${getPaymentStatusTextColor(order.paymentStatus)}`}>
                  {getPaymentStatusText(order.paymentStatus)}
                </span>
              </div>
              {order.couponCode && (
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Coupon Applied</span>
                  <span className="font-mono text-emerald-400 font-semibold">{order.couponCode}</span>
                </div>
              )}
              {order.paymentMethod === "ONLINE" && (
                <div className="pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={loadPaymentHistory}
                    className="inline-flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200 transition-colors cursor-pointer"
                  >
                    <span>{showPaymentHistory ? "Hide Payment History" : "View Payment History"}</span>
                    {showPaymentHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {showPaymentHistory && (
                    <div className="mt-3 space-y-2 text-xs text-white/60 bg-black/40 p-3 rounded-lg border border-white/5">
                      {isLoadingPaymentHistory ? (
                        <div className="flex items-center gap-2 py-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-white/60" />
                          <span>Loading gateway history...</span>
                        </div>
                      ) : paymentHistoryError ? (
                        <p className="text-red-300 text-xs">{paymentHistoryError}</p>
                      ) : paymentHistoryData ? (
                        <>
                          {paymentHistoryData.attempts.map((attempt) => (
                            <div key={attempt.id} className="border-b border-white/5 pb-1 last:border-b-0">
                              <p className="font-medium text-white/80">
                                Order {attempt.providerOrderId} · {attempt.status} · ₹{parseFloat(attempt.amount).toFixed(2)}
                              </p>
                              <p className="text-[10px] text-white/40">
                                {new Date(attempt.createdAt).toLocaleString()}
                                {attempt.providerPaymentId && ` · Ref: ${attempt.providerPaymentId}`}
                              </p>
                            </div>
                          ))}
                          {paymentHistoryData.transactions.map((txn) => (
                            <div key={txn.providerPaymentId} className="border-b border-white/5 pb-1 last:border-b-0">
                              <p className="font-medium text-white/80">
                                Txn {txn.providerPaymentId} · {txn.status} · ₹{parseFloat(txn.amount).toFixed(2)}
                              </p>
                              <p className="text-[10px] text-white/40">
                                {txn.paidAt ? new Date(txn.paidAt).toLocaleString() : "Pending"}
                              </p>
                            </div>
                          ))}
                          {paymentHistoryData.refunds.map((ref) => (
                            <div key={ref.id} className="flex items-center justify-between border-b border-white/5 pb-1 last:border-b-0">
                              <div>
                                <p className="font-medium text-white/80">
                                  Refund · {ref.status} · ₹{parseFloat(ref.refundAmount).toFixed(2)}
                                </p>
                                <p className="text-[10px] text-white/40">
                                  {ref.providerRefundId || ref.id}
                                </p>
                              </div>
                              {ref.status === "FAILED" && (
                                <button
                                  type="button"
                                  onClick={() => handleRetryRefund(ref.id)}
                                  className="text-[11px] text-red-300 underline cursor-pointer"
                                >
                                  Retry
                                </button>
                              )}
                            </div>
                          ))}
                          {paymentHistoryData.attempts.length === 0 && (
                            <p className="text-white/40 text-xs">No gateway attempts recorded.</p>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full rounded-xl border border-white/5 bg-[#0e0e0e] p-5 space-y-3 text-xs">
            <div className="border-b border-white/5 pb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
              Order Summary
            </div>
            <div className="flex items-center justify-between text-white/60">
              <span>Items Subtotal</span>
              <span className="font-medium text-white">
                ₹{parseFloat(order.subtotal || order.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between text-white/60">
              <span>Delivery Fee</span>
              <span className="text-emerald-400 font-medium">
                {parseFloat(order.deliveryFee || "0") === 0
                  ? "Free"
                  : `₹${parseFloat(order.deliveryFee).toFixed(2)}`}
              </span>
            </div>
            {parseFloat(order.discountAmount || "0") > 0 && (
              <div className="flex items-center justify-between text-emerald-400">
                <span>Discount</span>
                <span>-₹{parseFloat(order.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <span className="font-bold text-sm text-white">Grand Total</span>
              <span className="font-bold text-lg text-white">
                ₹{parseFloat(order.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-white/5 bg-[#0a0a0a] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white/70 tracking-wide">
              Status:
            </span>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="h-9 w-64 rounded-lg bg-[#0e0e0e] border border-white/15 pl-3.5 pr-3.5 text-xs font-medium text-white flex items-center justify-between outline-none hover:border-white/30 transition-colors cursor-pointer"
              >
                <span className="truncate">
                  {statusLabels[selectedStatus]}
                  {selectedStatus === order.orderStatus ? " (Current)" : ""}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-white/50 transition-transform shrink-0 ml-2 ${isDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute bottom-full mb-1.5 left-0 w-64 rounded-xl border border-white/10 bg-[#161616] py-1 shadow-2xl z-50 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:#525252_transparent]">
                  {allStatuses.map((st) => {
                    const isCurrent = st === order.orderStatus;
                    const isSelected = st === selectedStatus;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setSelectedStatus(st);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${isSelected
                            ? "bg-white/10 text-white font-medium"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        <span>
                          {statusLabels[st]}
                          {isCurrent ? " (Current)" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              disabled={!isChanged || isUpdatingStatus}
              onClick={() => onUpdateStatus?.(order.id, selectedStatus)}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-xs font-semibold transition-all ${isChanged && !isUpdatingStatus
                  ? "bg-[#640C0C] hover:bg-[#7a1010] text-white cursor-pointer shadow-lg hover:shadow-red-950/40"
                  : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
                }`}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
