"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useMyOrder } from "@/hooks/use-orders";
import { useState } from "react";
import Script from "next/script";
import { getCashfreeCheckout, paymentsService } from "@/services/payments.service";

export default function OrderConfirmationPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const { data: order, isLoading, error } = useMyOrder(params.orderId);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  const retryPayment = async () => {
    setRetrying(true);
    setRetryError("");
    try {
      const session = await paymentsService.retry(params.orderId, crypto.randomUUID());
      const Cashfree = await getCashfreeCheckout();
      await Cashfree({ mode: session.environment }).checkout({ paymentSessionId: session.paymentSessionId, redirectTarget: "_self" });
      router.replace(`/checkout/payment-return?ikigai_order_id=${encodeURIComponent(params.orderId)}`);
    } catch (error) {
      setRetryError(error instanceof Error ? error.message : "Payment could not be restarted.");
      setRetrying(false);
    }
  };

  if (isLoading)
    return (
      <main className="min-h-screen bg-black text-white grid place-items-center">
        <Loader2 className="animate-spin" />
      </main>
    );

  if (error || !order)
    return (
      <main className="min-h-screen bg-black text-white grid place-items-center px-6">
        <p>
          We could not find this order.{" "}
          <Link className="underline" href="/orders">
            View your orders
          </Link>
        </p>
      </main>
    );

  const address = order.shippingAddress;

  return (
    <main className="min-h-screen bg-black text-white px-4 py-12">
      <section className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#121212] p-6 sm:p-9">
        {order.paymentMethod === "ONLINE" && order.paymentStatus !== "PAID"
          ? <Loader2 className="mb-4 h-10 w-10 text-amber-300" />
          : <CheckCircle2 className="mb-4 h-10 w-10 text-emerald-400" />}

        <h1 className="text-2xl font-bold">Order placed</h1>

        <p className="mt-2 text-white/60">
          {order.paymentMethod === "COD"
            ? "Your Cash on Delivery order is awaiting confirmation."
            : order.paymentStatus === "PAID"
              ? "Your UPI payment is verified and the order is awaiting confirmation."
              : "Your UPI payment is not yet confirmed. You can retry securely below."}
        </p>

        <div className="mt-6 flex justify-between border-b border-white/10 pb-4">
          <span className="text-white/50">Order number</span>
          <strong>{order.orderNumber}</strong>
        </div>
        {order.paymentMethod === "ONLINE" && <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
          <span className="text-white/50">Payment method</span><strong>UPI · Cashfree</strong>
          <span className="text-white/50">Payment status</span><strong className={order.paymentStatus === "PAID" ? "text-emerald-300" : "text-amber-200"}>{order.paymentStatus}</strong>
          <span className="text-white/50">Order status</span><strong>{order.orderStatus}</strong>
        </div>}

        <div className="divide-y divide-white/10">
          {order.items.map(item => (
            <div
              key={item.id}
              className="flex justify-between gap-4 py-4"
            >
              <div>
                <p>
                  {item.productName}
                  {item.selectedVariant
                    ? ` · ${item.selectedVariant.colorName}`
                    : ""}
                </p>

                <p className="text-sm text-white/50">
                  Qty {item.quantity} · ₹
                  {Number(item.unitPrice).toFixed(2)} each
                </p>
              </div>

              <strong>₹{Number(item.totalPrice).toFixed(2)}</strong>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{Number(order.subtotal).toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery</span>
            <span>₹{Number(order.deliveryFee).toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Discount</span>
            <span>−₹{Number(order.discountAmount).toFixed(2)}</span>
          </div>

          <div className="flex justify-between pt-2 text-base font-bold">
            <span>{order.paymentMethod === "COD" ? "Total due on delivery" : "Order total"}</span>
            <span>₹{Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        {order.paymentMethod === "ONLINE" && order.paymentStatus !== "PAID" && order.orderStatus === "AWAITING_PAYMENT" && <div className="mt-5">
          {retryError && <p role="alert" className="mb-3 text-sm text-red-300">{retryError}</p>}
          <button type="button" disabled={retrying} onClick={() => void retryPayment()} className="w-full rounded-full bg-[#640C0C] px-5 py-3 text-sm font-semibold disabled:opacity-60">{retrying ? "Preparing payment…" : "Retry UPI Payment"}</button>
        </div>}

        <p className="mt-5 text-sm text-white/60">
          Delivering to {address.fullName}, {address.addressLine1},{" "}
          {address.city}, {address.state} {address.postalCode} ·{" "}
          {address.phone}
        </p>

        <div className="mt-7 flex gap-3">
          <Link
            className="rounded-full bg-[#640C0C] px-5 py-3 text-sm"
            href="/orders"
          >
            My orders
          </Link>

          <Link
            className="rounded-full border border-white/20 px-5 py-3 text-sm"
            href="/products"
          >
            Continue shopping
          </Link>
        </div>
      </section>
      {order.paymentMethod === "ONLINE" && <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="afterInteractive" />}
    </main>
  );
}
