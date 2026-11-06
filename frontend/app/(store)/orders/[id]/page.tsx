"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  useMyOrder,
  useRequestOrderCancellation,
} from "@/hooks/use-orders";

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error } = useMyOrder(id);
  const cancellation = useRequestOrderCancellation();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  if (isLoading)
    return (
      <main className="min-h-screen bg-black text-white grid place-items-center">
        <Loader2 className="animate-spin" />
      </main>
    );

  if (error || !order)
    return (
      <main className="min-h-screen bg-black text-white p-10">
        Order not found.{" "}
        <Link href="/orders" className="underline">
          Back to orders
        </Link>
      </main>
    );

  const request = order.cancellationRequests?.[0];
  const canRequest =
    ["PENDING", "CONFIRMED", "PROCESSING"].includes(order.orderStatus) &&
    request?.status !== "PENDING";

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <article className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#121212] p-6">
        <Link href="/orders" className="text-sm text-white/50">
          ← My Orders
        </Link>

        <div className="mt-5 flex justify-between">
          <div>
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-white/50">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <span className="h-fit rounded-full bg-white/10 px-3 py-1 text-xs">
            {order.orderStatus}
          </span>
        </div>

        <h2 className="mt-8 font-semibold">Items</h2>

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
                  SKU {item.sku} · Qty {item.quantity}
                </p>
              </div>

              <span>₹{Number(item.totalPrice).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-6 font-semibold">Shipping address</h2>

        <p className="mt-2 text-sm leading-6 text-white/60">
          {order.shippingAddress.fullName}
          <br />
          {order.shippingAddress.addressLine1}
          {order.shippingAddress.addressLine2
            ? `, ${order.shippingAddress.addressLine2}`
            : ""}
          <br />
          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
          {order.shippingAddress.postalCode}
          <br />
          {order.shippingAddress.country} · {order.shippingAddress.phone}
        </p>

        <div className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{Number(order.subtotal).toFixed(2)}</span>
          </p>

          <p className="flex justify-between">
            <span>Delivery</span>
            <span>₹{Number(order.deliveryFee).toFixed(2)}</span>
          </p>

          <p className="flex justify-between">
            <span>Discount</span>
            <span>−₹{Number(order.discountAmount).toFixed(2)}</span>
          </p>

          <p className="flex justify-between pt-2 text-base font-bold">
            <span>Total · COD</span>
            <span>₹{Number(order.totalAmount).toFixed(2)}</span>
          </p>
        </div>

        {request?.status === "PENDING" && (
          <p className="mt-5 text-amber-300">
            Cancellation request pending review.
          </p>
        )}

        {message && (
          <p role="status" className="mt-4 text-sm text-emerald-300">
            {message}
          </p>
        )}

        {canRequest && (
          <form
            className="mt-6 space-y-3 border-t border-white/10 pt-5"
            onSubmit={async e => {
              e.preventDefault();
              setMessage("");

              try {
                await cancellation.mutateAsync({ id, reason });
                setReason("");
                setMessage("Cancellation request sent.");
              } catch (err) {
                setMessage(
                  err instanceof Error
                    ? err.message
                    : "Could not send the request."
                );
              }
            }}
          >
            <label className="block text-sm" htmlFor="cancel-reason">
              Request cancellation
            </label>

            <textarea
              id="cancel-reason"
              required
              minLength={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black p-3 text-sm"
              placeholder="Tell us why you need to cancel"
            />

            <button
              disabled={cancellation.isPending}
              className="rounded-full bg-[#640C0C] px-5 py-2 text-sm disabled:opacity-50"
            >
              {cancellation.isPending
                ? "Sending…"
                : "Request cancellation"}
            </button>
          </form>
        )}
      </article>
    </main>
  );
}