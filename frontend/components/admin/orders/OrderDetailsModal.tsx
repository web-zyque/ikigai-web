"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  X,
  Package,
  ChevronDown,
  ChevronUp,
  Loader2,
  Printer,
  Copy,
  Check,
} from "lucide-react";
import type { OrderRecord, OrderStatusValue } from "@/services/orders.service";
import { paymentsService } from "@/services/payments.service";
import { getColorInfo } from "@/lib/color-utils";

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
  const [isCopied, setIsCopied] = useState(false);
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
    setIsCopied(false);
  }, [order?.id, isOpen]);

  if (!isOpen || !order) return null;

  const isChanged = selectedStatus !== order.orderStatus;

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  const handlePrint = () => {
    window.print();
  };

  const loadPaymentHistory = async () => {
    if (showPaymentHistory) {
      setShowPaymentHistory(false);
      return;
    }
    setShowPaymentHistory(true);
    if (paymentHistoryData) return;

    setIsLoadingPaymentHistory(true);
    setPaymentHistoryError("");
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
        return "text-amber-400";
      case "PROCESSING":
        return "text-orange-400";
      case "SHIPPED":
        return "text-sky-400";
      case "DELIVERED":
        return "text-emerald-400";
      case "CANCELLED":
        return "text-red-400";
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
        return "text-red-400";
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

  const getPaymentModeDisplay = () => {
    if (order.paymentMethod === "COD") {
      return "Cash on Delivery (COD)";
    }
    const group = paymentHistoryData?.transactions?.[0]?.paymentGroup;
    if (group) {
      if (group.toLowerCase() === "upi") return "UPI";
      if (group.toLowerCase().includes("card")) return "Card";
      if (group.toLowerCase().includes("net")) return "Net Banking";
      return group.toUpperCase();
    }
    return "UPI";
  };

  const dateObj = new Date(order.createdAt);
  const formattedDate = isNaN(dateObj.getTime())
    ? order.createdAt
    : dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
  const formattedTime = isNaN(dateObj.getTime())
    ? ""
    : dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <div
      aria-modal="true"
      role="dialog"
      onClick={onClose}
      className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col h-full bg-[#121212] text-white border-l border-white/10 shadow-2xl transition-all duration-300 ease-out transform animate-in slide-in-from-right duration-300 w-full sm:w-[560px] md:w-[620px]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0e0e0e] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-mono uppercase tracking-wider text-white/50">
              Order Details
            </span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-xs text-white/90 truncate font-semibold">
              #{order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${getStatusTextColor(order.orderStatus)}`}>
              {statusLabels[order.orderStatus] || order.orderStatus}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-[#640C0C] hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-2.5 border-b border-white/10 bg-[#121212] flex items-center justify-between gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="h-3.5 w-3.5 text-white/70" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleCopyOrderId}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {isCopied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-white/70" />
              )}
              <span>{isCopied ? "Copied" : "Copy ID"}</span>
            </button>
          </div>

          <div className="text-xs text-white/50 font-mono">
            Placed on {formattedDate} {formattedTime ? `at ${formattedTime}` : ""}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="rounded-xl border border-white/10 bg-[#0e0e0e] p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                  Customer Details
                </span>
                {order.userId && (
                  <span className="font-mono text-[10px] text-white/30 truncate max-w-[100px]">
                    #{order.userId.slice(0, 8)}
                  </span>
                )}
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-white text-sm">
                  {order.customer?.name || order.shippingAddress.fullName}
                </p>
                <a
                  href={`tel:${order.customer?.phone || order.shippingAddress.phone}`}
                  className="font-mono text-white/70 hover:text-white transition-colors block"
                >
                  {order.customer?.phone || order.shippingAddress.phone}
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0e0e0e] p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                  Shipping Address
                </span>
                <span className="text-[10px] font-medium text-white/40 uppercase">
                  {order.shippingAddress.addressType || "Standard"}
                </span>
              </div>
              <div className="space-y-0.5 text-xs text-white/70 leading-relaxed">
                <p className="font-medium text-white">{order.shippingAddress.fullName}</p>
                <p>
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
                </p>
                {order.shippingAddress.landmark && (
                  <p className="text-white/50 text-[11px]">
                    Landmark: {order.shippingAddress.landmark}
                  </p>
                )}
                <p className="text-white/80">
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                  <span className="font-mono font-medium text-white">{order.shippingAddress.postalCode}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 px-1">
              Products
            </h3>

            <div className="rounded-xl border border-white/10 bg-[#0e0e0e] overflow-hidden divide-y divide-white/5">
              {order.items.map((item) => {
                const selectedColor =
                  item.selectedVariant?.colorName ||
                  item.variantColorName ||
                  null;
                const colorInfo = selectedColor ? getColorInfo(selectedColor) : null;
                const selectedSize =
                  item.size ||
                  item.selectedVariant?.size ||
                  null;
                const sku =
                  item.selectedVariant?.sku ||
                  item.variantSku ||
                  item.sku ||
                  null;

                return (
                  <div key={item.id} className="p-4 sm:p-4.5 flex items-start gap-4">
                    <div className="relative h-20 w-20 rounded-lg bg-[#0a0a0a] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          sizes="80px"
                          unoptimized
                          className="object-contain p-1.5"
                        />
                      ) : (
                        <Package className="h-7 w-7 text-white/30" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h4 className="font-semibold text-white text-sm leading-snug">
                          {item.productName}
                        </h4>
                        {sku && (
                          <p className="font-mono text-[11px] text-white/40 mt-0.5">
                            SKU: {sku}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 border-t border-white/5 text-xs">
                        <div>
                          <span className="text-white/40 block text-[10px] uppercase font-mono tracking-wider">
                            Quantity
                          </span>
                          <span className="font-semibold text-white text-xs mt-0.5 block">
                            {item.quantity} {item.quantity === 1 ? "unit" : "units"}
                          </span>
                        </div>

                        {selectedColor && (
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-mono tracking-wider">
                              Color
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-white/90 font-medium mt-0.5">
                              <span
                                className="h-2.5 w-2.5 rounded-full border border-white/30 shrink-0"
                                style={{ backgroundColor: colorInfo?.hex || "#fff" }}
                              />
                              <span>{selectedColor}</span>
                            </span>
                          </div>
                        )}

                        {selectedSize && (
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-mono tracking-wider">
                              Size
                            </span>
                            <span className="text-xs text-white/90 font-medium mt-0.5 block">
                              {selectedSize}
                            </span>
                          </div>
                        )}

                        <div>
                          <span className="text-white/40 block text-[10px] uppercase font-mono tracking-wider">
                            Unit Price
                          </span>
                          <span className="text-xs text-white/90 font-medium mt-0.5 block">
                            ₹{parseFloat(item.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0e0e0e] p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                Payment
              </span>
              <span className={`font-semibold ${getPaymentStatusTextColor(order.paymentStatus)}`}>
                {getPaymentStatusText(order.paymentStatus)}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Method</span>
                <span className="font-medium text-white">
                  {getPaymentModeDisplay()}
                </span>
              </div>

              {order.couponCode && (
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Coupon</span>
                  <span className="font-mono text-emerald-400 font-medium">
                    {order.couponCode}
                  </span>
                </div>
              )}

              {order.paymentMethod === "ONLINE" && (
                <div className="pt-1.5">
                  <button
                    type="button"
                    onClick={loadPaymentHistory}
                    className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{showPaymentHistory ? "Hide Gateway History" : "View Gateway History"}</span>
                    {showPaymentHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {showPaymentHistory && (
                    <div className="mt-2 space-y-2 text-xs text-white/60 bg-[#0a0a0a] p-3 rounded-lg border border-white/10">
                      {isLoadingPaymentHistory ? (
                        <div className="flex items-center gap-2 py-1">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-white/60" />
                          <span>Loading gateway history...</span>
                        </div>
                      ) : paymentHistoryError ? (
                        <p className="text-red-400 text-xs">{paymentHistoryError}</p>
                      ) : paymentHistoryData ? (
                        <>
                          {paymentHistoryData.attempts.map((attempt) => (
                            <div key={attempt.id} className="border-b border-white/5 pb-1.5 last:border-b-0">
                              <p className="font-medium text-white/80">
                                Order {attempt.providerOrderId} · {attempt.status} · ₹{parseFloat(attempt.amount).toFixed(2)}
                              </p>
                              <p className="text-[10px] text-white/40 mt-0.5">
                                {new Date(attempt.createdAt).toLocaleString()}
                                {attempt.providerPaymentId && ` · Ref: ${attempt.providerPaymentId}`}
                              </p>
                            </div>
                          ))}
                          {paymentHistoryData.transactions.map((txn) => (
                            <div key={txn.providerPaymentId} className="border-b border-white/5 pb-1.5 last:border-b-0">
                              <p className="font-medium text-white/80">
                                Txn {txn.providerPaymentId} · {txn.status} · ₹{parseFloat(txn.amount).toFixed(2)}
                              </p>
                              <p className="text-[10px] text-white/40 mt-0.5">
                                {txn.paidAt ? new Date(txn.paidAt).toLocaleString() : "Pending"}
                              </p>
                            </div>
                          ))}
                          {paymentHistoryData.refunds.map((ref) => (
                            <div key={ref.id} className="flex items-center justify-between border-b border-white/5 pb-1.5 last:border-b-0">
                              <div>
                                <p className="font-medium text-white/80">
                                  Refund · {ref.status} · ₹{parseFloat(ref.refundAmount).toFixed(2)}
                                </p>
                                <p className="text-[10px] text-white/40 mt-0.5">
                                  {ref.providerRefundId || ref.id}
                                </p>
                              </div>
                              {ref.status === "FAILED" && (
                                <button
                                  type="button"
                                  onClick={() => handleRetryRefund(ref.id)}
                                  className="text-[11px] text-red-400 underline cursor-pointer hover:text-red-300"
                                >
                                  Retry
                                </button>
                              )}
                            </div>
                          ))}
                          {paymentHistoryData.attempts.length === 0 && (
                            <p className="text-white/40 text-xs py-1">No payment attempts recorded.</p>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0e0e0e] p-4 space-y-2.5 text-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 block border-b border-white/5 pb-2">
              Order Summary
            </span>

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

            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="font-bold text-sm text-white">Grand Total</span>
              <span className="font-bold text-lg text-white">
                ₹{parseFloat(order.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-white/10 bg-[#0e0e0e] shrink-0 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-[240px]" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="h-8.5 w-full rounded-lg bg-[#141414] border border-white/15 px-3 text-xs font-medium text-white flex items-center justify-between outline-none hover:border-white/30 transition-colors cursor-pointer"
            >
              <span className="truncate">
                {statusLabels[selectedStatus]}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-white/50 transition-transform shrink-0 ml-2 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute bottom-full mb-1.5 left-0 w-full sm:w-56 rounded-xl border border-white/10 bg-[#161616] py-1 shadow-2xl z-50 max-h-60 overflow-y-auto [scrollbar-width:thin]">
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
                      className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
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

          <button
            type="button"
            disabled={!isChanged || isUpdatingStatus}
            onClick={() => onUpdateStatus?.(order.id, selectedStatus)}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
              isChanged && !isUpdatingStatus
                ? "bg-[#640C0C] hover:bg-[#7a1010] text-white shadow-lg shadow-red-950/40"
                : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            {isUpdatingStatus ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Update Status</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
