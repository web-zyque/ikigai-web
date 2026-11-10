"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { paymentsService } from "@/services/payments.service";
import { clearBuyNowSelection } from "@/lib/buy-now-checkout";
import { useMe } from "@/hooks/auth";
import { useQueryClient } from "@tanstack/react-query";
import { cartKeys } from "@/hooks/auth/cart.keys";

function PaymentReturnContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: user } = useMe();
  const queryClient = useQueryClient();
  const orderId = params.get("ikigai_order_id");
  const [message, setMessage] = useState("Verifying your payment securely…");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!orderId || !user?.id) return;
    let active = true;

    paymentsService.verify(orderId).then((result) => {
      if (!active) return;

      if (result.order.paymentStatus === "PAID") {
        clearBuyNowSelection();
        void queryClient.invalidateQueries({ queryKey: cartKeys.user(user.id) });
        router.replace(`/order-confirmation/${orderId}`);
      } else {
        setMessage(
          result.order.orderStatus === "CANCELLED"
            ? "The order was cancelled. If the payment completed, it is being reconciled securely."
            : "Payment has not been confirmed yet. You can refresh or retry from your order details."
        );
        setFailed(true);
      }
    }).catch((error: unknown) => {
      if (!active) return;
      setMessage(error instanceof Error ? error.message : "We could not verify the payment right now.");
      setFailed(true);
    });

    return () => {
      active = false;
    };
  }, [orderId, user?.id, queryClient, router]);

  return (
    <main className="min-h-[70vh] bg-black px-4 py-16 text-white grid place-items-center">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121212] p-7 text-center">
        {!failed && (
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-white/70" />
        )}

        <h1 className="text-xl font-semibold">
          {failed ? "Payment status" : "Checking payment"}
        </h1>

        <p
          role={failed ? "alert" : "status"}
          className="mt-3 text-sm text-white/65"
        >
          {message}
        </p>

        {failed && (
          <div className="mt-6 flex justify-center gap-3">
            {orderId && (
              <Link
                href={`/order-confirmation/${orderId}`}
                className="rounded-full bg-[#640C0C] px-5 py-2.5 text-sm"
              >
                View order
              </Link>
            )}

            <Link
              href="/orders"
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm"
            >
              My orders
            </Link>
          </div>
        )}

        {!orderId && (
          <p className="mt-4 text-sm text-red-300">
            The payment return did not include an order reference.
          </p>
        )}

        {!user && (
          <Link
            href={`/login?redirect=${encodeURIComponent(`/checkout/payment-return?${params.toString()}`)}`}
            className="mt-5 inline-block underline"
          >
            Sign in to verify your payment
          </Link>
        )}
      </section>
    </main>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[70vh] bg-black text-white grid place-items-center">
          <Loader2 className="animate-spin" />
        </main>
      }
    >
      <PaymentReturnContent />
    </Suspense>
  );
}