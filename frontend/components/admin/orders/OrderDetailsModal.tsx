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
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import type { OrderRecord, OrderStatusValue } from "@/services/orders.service";
import { paymentsService, type PaymentHistory } from "@/services/payments.service";
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
  const [paymentHistoryData, setPaymentHistoryData] = useState<PaymentHistory | null>(null);
  const [isLoadingPaymentHistory, setIsLoadingPaymentHistory] = useState(false);
  const [paymentHistoryError, setPaymentHistoryError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
    setCopiedField(null);

    if (isOpen && order?.id && order.paymentMethod === "ONLINE") {
      setIsLoadingPaymentHistory(true);
      paymentsService
        .adminHistory(order.id)
        .then((data) => {
          setPaymentHistoryData(data as PaymentHistory);
        })
        .catch((err) => {
          setPaymentHistoryError(
            err instanceof Error ? err.message : "Failed to load payment history"
          );
        })
        .finally(() => {
          setIsLoadingPaymentHistory(false);
        });
    }
  }, [order?.id, isOpen, order?.paymentMethod]);

  if (!isOpen || !order) return null;

  const isChanged = selectedStatus !== order.orderStatus;

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  const handleCopyText = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField((cur) => (cur === fieldId ? null : cur)), 2000);
    } catch {}
  };

  const handlePrint = () => {
    window.print();
  };

  const togglePaymentHistory = async () => {
    if (showPaymentHistory) {
      setShowPaymentHistory(false);
      return;
    }
    setShowPaymentHistory(true);
    if (!paymentHistoryData && !isLoadingPaymentHistory && order) {
      setIsLoadingPaymentHistory(true);
      setPaymentHistoryError("");
      try {
        const data = await paymentsService.adminHistory(order.id);
        setPaymentHistoryData(data as PaymentHistory);
      } catch (err) {
        setPaymentHistoryError(
          err instanceof Error ? err.message : "Failed to load payment history"
        );
      } finally {
        setIsLoadingPaymentHistory(false);
      }
    }
  };

  const handleRetryRefund = async (refundId: string) => {
    if (!order) return;
    try {
      await paymentsService.retryRefund(refundId);
      const data = await paymentsService.adminHistory(order.id);
      setPaymentHistoryData(data as PaymentHistory);
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

  const formatGatewayName = (provider?: string | null) => {
    if (!provider) return "Online Gateway";
    const p = provider.trim().toUpperCase();
    if (p === "CASHFREE") return "Cashfree";
    if (p === "RAZORPAY") return "Razorpay";
    if (p === "STRIPE") return "Stripe";
    if (p === "PAYTM") return "Paytm";
    if (p === "PHONEPE") return "PhonePe";
    return provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
  };

  const formatPaymentMethod = (method?: string | null) => {
    if (!method) return "Online";
    const m = method.toLowerCase();
    if (m === "upi") return "UPI";
    if (m.includes("credit")) return "Credit Card";
    if (m.includes("debit")) return "Debit Card";
    if (m.includes("card")) return "Card";
    if (m.includes("net") || m.includes("nb")) return "Net Banking";
    if (m.includes("wallet")) return "Wallet";
    if (m === "cod") return "Cash on Delivery";
    return method.toUpperCase();
  };

  const getAttemptStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case "SUCCESS":
      case "PAID":
        return {
          label: "SUCCESS",
          classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };
      case "FAILED":
      case "USER_DROPPED":
      case "CANCELLED":
        return {
          label: s === "USER_DROPPED" ? "DROPPED" : "FAILED",
          classes: "bg-red-500/10 text-red-400 border-red-500/20",
        };
      case "PENDING":
      case "CREATED":
        return {
          label: "PENDING",
          classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        };
      case "EXPIRED":
        return {
          label: "EXPIRED",
          classes: "bg-white/10 text-white/50 border-white/10",
        };
      default:
        return {
          label: s,
          classes: "bg-white/10 text-white/60 border-white/10",
        };
    }
  };

  const getRefundStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case "SUCCESS":
        return {
          label: "REFUNDED",
          classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };
      case "PROCESSING":
      case "PENDING":
        return {
          label: "PROCESSING",
          classes: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        };
      case "FAILED":
        return {
          label: "FAILED",
          classes: "bg-red-500/10 text-red-400 border-red-500/20",
        };
      default:
        return {
          label: s,
          classes: "bg-white/10 text-white/60 border-white/10",
        };
    }
  };

  const getPaymentModeDisplay = () => {
    if (order.paymentMethod === "COD") {
      return "Cash on Delivery (COD)";
    }
    const group =
      paymentHistoryData?.transactions?.[0]?.paymentGroup ||
      paymentHistoryData?.attempts?.[0]?.method;
    return formatPaymentMethod(group || "UPI");
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
                {(order.customer?.email || (order.shippingAddress as any)?.email) && (
                  <a
                    href={`mailto:${order.customer?.email || (order.shippingAddress as any)?.email}`}
                    className="text-white/60 hover:text-white transition-colors block text-xs truncate"
                  >
                    {order.customer?.email || (order.shippingAddress as any)?.email}
                  </a>
                )}
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
                const rawColor =
                  item.color ||
                  item.selectedVariant?.colorName ||
                  item.variantColorName ||
                  null;
                const selectedColor =
                  rawColor && !rawColor.includes(',') ? rawColor.trim() : null;

                const colorInfo = selectedColor ? getColorInfo(selectedColor) : null;
                const colorHex = item.colorHex || colorInfo?.hex || "#ffffff";

                const rawSize =
                  item.size ||
                  item.selectedVariant?.size ||
                  null;
                const selectedSize =
                  rawSize && !rawSize.includes(',') && !rawSize.includes('[') ? rawSize.trim() : null;

                const sku =
                  item.sku ||
                  item.selectedVariant?.sku ||
                  item.variantSku ||
                  null;
                const brand =
                  item.brand ||
                  item.selectedVariant?.brand ||
                  null;
                const warranty =
                  item.warranty ||
                  item.selectedVariant?.warranty ||
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-white text-sm leading-snug">
                            {item.productName}
                          </h4>
                          {brand && (
                            <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">
                              {brand}
                            </span>
                          )}
                        </div>
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
                                style={{ backgroundColor: colorHex }}
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

                        {warranty && (
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-mono tracking-wider">
                              Warranty
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium mt-0.5">
                              <ShieldCheck className="h-3 w-3 shrink-0" />
                              <span>{warranty}</span>
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

                        {item.totalPrice && (
                          <div>
                            <span className="text-white/40 block text-[10px] uppercase font-mono tracking-wider">
                              Total
                            </span>
                            <span className="text-xs text-white font-semibold mt-0.5 block">
                              ₹{parseFloat(item.totalPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0e0e0e] p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                Payment
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[11px] tracking-wide border ${
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : order.paymentStatus === "REFUNDED"
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    : order.paymentStatus === "FAILED"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {getPaymentStatusText(order.paymentStatus)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Payment Method</span>
                <span className="font-medium text-white">
                  {order.paymentMethod === "COD"
                    ? "Cash on Delivery (COD)"
                    : getPaymentModeDisplay()}
                </span>
              </div>

              {order.paymentMethod === "ONLINE" && (
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Payment Gateway</span>
                  <span className="font-medium text-white/90">
                    {formatGatewayName(
                      paymentHistoryData?.gateway ||
                      paymentHistoryData?.attempts?.[0]?.provider
                    )}
                  </span>
                </div>
              )}

              {order.couponCode && (
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Coupon</span>
                  <span className="font-mono text-emerald-400 font-medium">
                    {order.couponCode}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-white/50">Total Amount</span>
                <span className="font-bold text-white font-mono text-sm">
                  ₹{parseFloat(order.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Collapsible Gateway History Toggle for ONLINE orders */}
            {order.paymentMethod === "ONLINE" && (
              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={togglePaymentHistory}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-white/60" />
                    <span>Payment Gateway History</span>
                    {paymentHistoryData?.attempts?.length ? (
                      <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono text-white/60">
                        {paymentHistoryData.attempts.length}{" "}
                        {paymentHistoryData.attempts.length === 1 ? "attempt" : "attempts"}
                      </span>
                    ) : null}
                  </div>
                  {showPaymentHistory ? (
                    <ChevronUp className="h-3.5 w-3.5 text-white/60" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-white/60" />
                  )}
                </button>

                {showPaymentHistory && (
                  <div className="mt-2.5 space-y-3 pt-1">
                    {isLoadingPaymentHistory && !paymentHistoryData ? (
                      <div className="flex items-center gap-2 py-3 px-3 rounded-lg bg-[#0a0a0a] border border-white/10 text-xs text-white/60">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-white/60" />
                        <span>Loading payment gateway history...</span>
                      </div>
                    ) : paymentHistoryError ? (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 space-y-1.5">
                        <p>{paymentHistoryError}</p>
                        <button
                          type="button"
                          onClick={togglePaymentHistory}
                          className="text-[11px] underline text-red-300 hover:text-red-200 cursor-pointer"
                        >
                          Retry Loading
                        </button>
                      </div>
                    ) : paymentHistoryData ? (
                      <>
                        {/* Chronological Payment Attempts */}
                        {paymentHistoryData.attempts.length === 0 ? (
                          <div className="p-3 rounded-lg bg-[#0a0a0a] border border-white/10 text-white/40 text-xs text-center">
                            No payment gateway attempts recorded for this order.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {paymentHistoryData.attempts.map((attempt, index) => {
                              const badge = getAttemptStatusBadge(attempt.status);
                              const linkedTxn = paymentHistoryData.transactions?.find(
                                (t) =>
                                  t.paymentAttemptId === attempt.id ||
                                  (attempt.providerPaymentId &&
                                    t.providerPaymentId === attempt.providerPaymentId)
                              );
                              const transactionId =
                                attempt.providerPaymentId || linkedTxn?.providerPaymentId || null;
                              const transactionDate = linkedTxn?.paidAt || attempt.createdAt;

                              return (
                                <div
                                  key={attempt.id}
                                  className="rounded-lg border border-white/10 bg-[#0a0a0a] p-3 space-y-2.5"
                                >
                                  {/* Attempt Header */}
                                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                    <span className="font-semibold text-white text-xs">
                                      Attempt #{index + 1}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider border ${badge.classes}`}
                                    >
                                      {badge.label}
                                    </span>
                                  </div>

                                  {/* Attempt Field Grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-start sm:gap-2">
                                      <span className="text-white/40">Transaction Amount:</span>
                                      <span className="font-mono font-medium text-white">
                                        ₹{parseFloat(attempt.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}{" "}
                                        {attempt.currency}
                                      </span>
                                    </div>

                                    {/* Gateway Order ID */}
                                    <div className="sm:col-span-2 flex items-center justify-between gap-2 bg-white/[0.02] px-2.5 py-1.5 rounded border border-white/5">
                                      <span className="text-white/40 shrink-0">Gateway Order ID:</span>
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="font-mono text-white/90 truncate text-[10px]">
                                          {attempt.providerOrderId}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleCopyText(attempt.providerOrderId, `order-id-${attempt.id}`)
                                          }
                                          title="Copy Gateway Order ID"
                                          className="text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
                                        >
                                          {copiedField === `order-id-${attempt.id}` ? (
                                            <Check className="h-3 w-3 text-emerald-400" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Transaction ID */}
                                    <div className="sm:col-span-2 flex items-center justify-between gap-2 bg-white/[0.02] px-2.5 py-1.5 rounded border border-white/5">
                                      <span className="text-white/40 shrink-0">Transaction ID:</span>
                                      {transactionId ? (
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <span className="font-mono text-white/90 truncate text-[10px]">
                                            {transactionId}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleCopyText(transactionId, `txn-id-${attempt.id}`)
                                            }
                                            title="Copy Transaction ID"
                                            className="text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
                                          >
                                            {copiedField === `txn-id-${attempt.id}` ? (
                                              <Check className="h-3 w-3 text-emerald-400" />
                                            ) : (
                                              <Copy className="h-3 w-3" />
                                            )}
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="text-white/30 italic text-[10px]">
                                          None (Not generated or session incomplete)
                                        </span>
                                      )}
                                    </div>

                                    {/* Gateway Reference Number (where available) */}
                                    {(() => {
                                      const refNo =
                                        (attempt as any).gatewayReference ||
                                        (linkedTxn as any)?.gatewayReference ||
                                        (attempt as any).bankReference ||
                                        (linkedTxn as any)?.bankReference ||
                                        null;
                                      if (!refNo) return null;

                                      return (
                                        <div className="sm:col-span-2 flex items-center justify-between gap-2 bg-white/[0.02] px-2.5 py-1.5 rounded border border-white/5">
                                          <span className="text-white/40 shrink-0">Gateway Reference Number:</span>
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="font-mono text-white/90 truncate text-[10px]">
                                              {refNo}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleCopyText(refNo, `ref-no-${attempt.id}`)
                                              }
                                              title="Copy Gateway Reference Number"
                                              className="text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
                                            >
                                              {copiedField === `ref-no-${attempt.id}` ? (
                                                <Check className="h-3 w-3 text-emerald-400" />
                                              ) : (
                                                <Copy className="h-3 w-3" />
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })()}

                                    {/* Transaction Date & Time */}
                                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-start sm:gap-2 text-[10px]">
                                      <span className="text-white/40">Transaction Date & Time:</span>
                                      <span className="font-mono text-white/70">
                                        {new Date(transactionDate).toLocaleString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          second: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Failure Reason */}
                                  {attempt.failureReason && (
                                    <div className="rounded bg-red-500/10 border border-red-500/20 p-2 text-[11px] text-red-300 flex items-start gap-1.5">
                                      <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                                      <div>
                                        <span className="font-semibold text-red-400">Failure Reason: </span>
                                        <span>{attempt.failureReason}</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Session Expiry */}
                                  {attempt.status === "PENDING" && attempt.sessionExpiresAt && (
                                    <div className="text-[10px] text-amber-400/80 font-mono">
                                      Session expires: {new Date(attempt.sessionExpiresAt).toLocaleTimeString()}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Refunds History Block */}
                        {paymentHistoryData.refunds && paymentHistoryData.refunds.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
                              <span>Refund History</span>
                              <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] font-mono text-white/50">
                                {paymentHistoryData.refunds.length}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {paymentHistoryData.refunds.map((ref, refIndex) => {
                                const refBadge = getRefundStatusBadge(ref.status);
                                return (
                                  <div
                                    key={ref.id}
                                    className="rounded-lg border border-white/10 bg-[#0a0a0a] p-3 space-y-2"
                                  >
                                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-white text-xs">
                                          Refund #{refIndex + 1}
                                        </span>
                                        <span className="font-mono text-xs font-bold text-white">
                                          ₹{parseFloat(ref.refundAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}{" "}
                                          {ref.currency}
                                        </span>
                                      </div>
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider border ${refBadge.classes}`}
                                      >
                                        {refBadge.label}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                                      {/* Merchant Refund ID */}
                                      <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                                        <span className="text-white/40">Merchant Refund ID:</span>
                                        <span className="font-mono text-white/80 text-[10px]">
                                          {ref.merchantRefundId || ref.id}
                                        </span>
                                      </div>

                                      {/* Gateway Reference Number (Provider Refund ID) */}
                                      <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                                        <span className="text-white/40">Gateway Ref No:</span>
                                        <span className="font-mono text-white/90 text-[10px]">
                                          {ref.providerRefundId || "Pending Gateway Assignment"}
                                        </span>
                                      </div>

                                      {/* Transaction ID */}
                                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-start sm:gap-2">
                                        <span className="text-white/40">Original Transaction ID:</span>
                                        <span className="font-mono text-white/80 text-[10px]">
                                          {ref.providerPaymentId}
                                        </span>
                                      </div>

                                      {/* Date */}
                                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-start sm:gap-2 text-[10px]">
                                        <span className="text-white/40">Initiated At:</span>
                                        <span className="font-mono text-white/60">
                                          {new Date(ref.createdAt).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>

                                    {ref.reason && (
                                      <p className="text-[11px] text-white/60">
                                        <span className="text-white/40">Reason:</span> {ref.reason}
                                      </p>
                                    )}

                                    {ref.failureReason && (
                                      <div className="rounded bg-red-500/10 border border-red-500/20 p-2 text-[11px] text-red-300">
                                        <span className="font-semibold text-red-400">Failure: </span>
                                        <span>{ref.failureReason}</span>
                                      </div>
                                    )}

                                    {ref.status === "FAILED" && (
                                      <div className="pt-1 flex justify-end">
                                        <button
                                          type="button"
                                          onClick={() => handleRetryRefund(ref.id)}
                                          className="inline-flex items-center gap-1 rounded bg-red-600/80 hover:bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors cursor-pointer"
                                        >
                                          Retry Refund
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            )}
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
