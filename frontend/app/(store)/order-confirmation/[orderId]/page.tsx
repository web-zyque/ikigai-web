"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useMyOrder } from "@/hooks/use-orders";

export default function OrderConfirmationPage() {
  const params = useParams<{ orderId: string }>();
  const { data: order, isLoading, error } = useMyOrder(params.orderId);

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
        <CheckCircle2 className="mb-4 h-10 w-10 text-emerald-400" />

        <h1 className="text-2xl font-bold">Order placed</h1>

        <p className="mt-2 text-white/60">
          Your Cash on Delivery order is awaiting confirmation.
        </p>

        <div className="mt-6 flex justify-between border-b border-white/10 pb-4">
          <span className="text-white/50">Order number</span>
          <strong>{order.orderNumber}</strong>
        </div>

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
            <span>Total due on delivery</span>
            <span>₹{Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>

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
    </main>
  );
}