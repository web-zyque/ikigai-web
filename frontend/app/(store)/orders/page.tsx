"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useMyOrders } from "@/hooks/use-orders";

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useMyOrders();

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-7 text-2xl font-bold">My Orders</h1>

        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : error ? (
          <p className="text-red-400">
            Could not load your orders. Please try again.
          </p>
        ) : !orders?.length ? (
          <div className="rounded-2xl border border-white/10 bg-[#121212] p-8 text-center">
            <p className="text-white/60">
              You have not placed any orders yet.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-block rounded-full bg-[#640C0C] px-5 py-3"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <article
                key={order.id}
                className="rounded-2xl border border-white/10 bg-[#121212] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{order.orderNumber}</h2>
                    <p className="mt-1 text-sm text-white/50">
                      {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                      {order.itemCount ??
                        order.items.reduce((n, i) => n + i.quantity, 0)}{" "}
                      items
                    </p>
                  </div>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
                    {order.orderStatus}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-sm text-white/60">
                    Cash on Delivery · {order.paymentStatus}
                  </span>
                  <strong>
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </strong>
                </div>

                <Link
                  className="mt-4 inline-block text-sm text-red-300 underline"
                  href={`/orders/${order.id}`}
                >
                  View order
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}