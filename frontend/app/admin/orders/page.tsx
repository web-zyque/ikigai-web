"use client";

import { useState } from "react";
import { Menu, Loader2 } from "lucide-react";
import { useMobileMenu } from "@/contexts/admin-layout-context";
import {
  useAdminCancellationRequests,
  useAdminOrderAction,
  useAdminOrderStats,
  useAdminOrders,
} from "@/hooks/use-orders";
import type { OrderStatusValue } from "@/services/orders.service";
import { useToastStore } from "@/stores/toast-store";
import { paymentsService } from "@/services/payments.service";

const nextStatus: Partial<Record<OrderStatusValue, OrderStatusValue>> = {
  CONFIRMED: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

const statusLabels: Record<OrderStatusValue, string> = {
  AWAITING_PAYMENT: "Awaiting payment",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
const allStatuses = Object.keys(statusLabels) as OrderStatusValue[];

export default function OrderDashboardPage() {
  const { setMobileOpen } = useMobileMenu();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [expandedPaymentOrder, setExpandedPaymentOrder] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<Record<string, { attempts: Array<{ id: string; providerOrderId: string; providerPaymentId: string | null; amount: string; status: string; createdAt: string }>; transactions: Array<{ providerPaymentId: string; amount: string; status: string; paymentGroup: string | null; paidAt: string | null }>; refunds: Array<{ id: string; refundAmount: string; status: string; providerRefundId: string | null; createdAt: string }> }>>({});
  const [paymentDetailsError, setPaymentDetailsError] = useState("");
  const addToast = useToastStore(state => state.addToast);

  const query = useAdminOrders({
    search: search || undefined,
    page,
    limit: 25,
  });

  const stats = useAdminOrderStats();
  const cancels = useAdminCancellationRequests();
  const action = useAdminOrderAction();

  const run = async (fn: () => Promise<unknown>) => {
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Order action failed. Please retry."
      );
    }
  };

  const orders = query.data?.orders ?? [];
  const handleStatusChange = async (orderId: string, current: OrderStatusValue, selected: string) => {
    const allowed = nextStatus[current];
    if (!allowed || selected !== allowed || updatingOrderId) return;
    setUpdatingOrderId(orderId);
    setError("");
    try {
      await action.mutateAsync({
        type: "status",
        id: orderId,
        status: allowed,
      });
      addToast(`Order status updated to ${statusLabels[allowed]}.`, "success");
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Could not update this order. Please try again.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <main className="flex-1 space-y-5 px-4 py-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Open navigation"
          className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-bold">Orders</h1>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {[
          ["Total", stats.data?.total],
          ["Awaiting payment", stats.data?.awaitingPayment],
          ["Pending", stats.data?.pending],
          ["Confirmed", stats.data?.confirmed],
          ["Processing", stats.data?.processing],
          ["Shipped", stats.data?.shipped],
          ["Delivered", stats.data?.delivered],
          ["Cancelled", stats.data?.cancelled],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-white/10 bg-[#121212] p-4"
          >
            <p className="text-xs text-white/50">{label}</p>
            <p className="mt-2 text-2xl font-semibold">
              {value ?? "—"}
            </p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
          <h2 className="font-semibold">Order queue</h2>
          <input
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search order, customer or phone"
            className="rounded-lg border border-white/10 bg-black px-3 py-2 text-sm"
          />
        </div>

        {query.isLoading ? (
          <div className="p-8">
            <Loader2 className="animate-spin" />
          </div>
        ) : query.error ? (
          <p className="p-5 text-red-300">Could not load orders.</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-white/50">No orders found.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {orders.map(order => (
              <article
                key={order.id}
                className="grid gap-4 p-4 lg:grid-cols-[1fr_1.5fr_auto] lg:items-center"
              >
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-white/60">
                    {order.customer?.name ?? order.shippingAddress.fullName} ·{" "}
                    {order.customer?.phone ?? order.shippingAddress.phone}
                  </p>
                  <p className="text-xs text-white/40">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm">
                    {order.items
                      .map(i => `${i.productName} × ${i.quantity}`)
                      .join(", ")}
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    {order.paymentMethod === "ONLINE" ? "UPI · Cashfree" : "COD"} · ₹{Number(order.totalAmount).toFixed(2)} · {order.paymentStatus}
                  </p>
                  {order.paymentMethod === "ONLINE" && <button type="button" className="mt-2 text-xs text-red-300 underline" onClick={async () => {
                    if (expandedPaymentOrder === order.id) { setExpandedPaymentOrder(null); return; }
                    setExpandedPaymentOrder(order.id);
                    setPaymentDetailsError("");
                    if (!paymentDetails[order.id]) {
                      try {
                        const result = await paymentsService.adminHistory(order.id) as typeof paymentDetails[string];
                        setPaymentDetails((current) => ({ ...current, [order.id]: result }));
                      } catch (loadError) {
                        setPaymentDetailsError(loadError instanceof Error ? loadError.message : "Could not load payment attempts.");
                      }
                    }
                  }}>{expandedPaymentOrder === order.id ? "Hide payment history" : "Payment history"}</button>}
                  {expandedPaymentOrder === order.id && <div className="mt-2 space-y-1 text-xs text-white/60">
                    {paymentDetailsError && <p role="alert" className="text-red-300">{paymentDetailsError}</p>}
                    {paymentDetails[order.id]?.attempts.map((attempt) => <p key={attempt.id}>Cashfree order {attempt.providerOrderId} · {attempt.status} · ₹{Number(attempt.amount).toFixed(2)} · {new Date(attempt.createdAt).toLocaleString()}{attempt.providerPaymentId ? ` · payment ${attempt.providerPaymentId}` : ""}</p>)}
                    {paymentDetails[order.id]?.transactions.map((transaction) => <p key={transaction.providerPaymentId}>Transaction {transaction.providerPaymentId} · {transaction.paymentGroup ?? "Cashfree"} · {transaction.status} · ₹{Number(transaction.amount).toFixed(2)}{transaction.paidAt ? ` · ${new Date(transaction.paidAt).toLocaleString()}` : ""}</p>)}
                    {paymentDetails[order.id]?.refunds.map((refund) => <div key={refund.id} className="flex flex-wrap items-center gap-2"><p>Refund · {refund.status} · ₹{Number(refund.refundAmount).toFixed(2)}{refund.providerRefundId ? ` · ${refund.providerRefundId}` : ""}</p>{refund.status === "FAILED" && <button type="button" className="underline text-red-300" onClick={() => void run(async () => { await paymentsService.retryRefund(refund.id); const latest = await paymentsService.adminHistory(order.id) as typeof paymentDetails[string]; setPaymentDetails((current) => ({ ...current, [order.id]: latest })); })}>Retry refund</button>}</div>)}
                    {paymentDetails[order.id] && paymentDetails[order.id].attempts.length === 0 && <p>No Cashfree payment attempts.</p>}
                  </div>}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    aria-label={`Update status for order ${order.orderNumber}`}
                    value={order.orderStatus}
                    disabled={!nextStatus[order.orderStatus] || Boolean(updatingOrderId)}
                    onChange={(event) => void handleStatusChange(order.id, order.orderStatus, event.target.value)}
                    className="min-w-40 rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-xs text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {allStatuses.map((status) => {
                      const allowed = nextStatus[order.orderStatus];
                      return <option key={status} value={status} disabled={status !== order.orderStatus && status !== allowed}>
                        {statusLabels[status]}
                      </option>;
                    })}
                  </select>
                  {updatingOrderId === order.id && <Loader2 className="h-4 w-4 animate-spin text-white/60" />}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-white/10 p-4 text-sm">
          <span>
            Page {query.data?.page ?? page} of{" "}
            {query.data?.totalPages ?? 1} ·{" "}
            {query.data?.total ?? 0} orders
          </span>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded border border-white/15 px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>

            <button
              disabled={page >= (query.data?.totalPages ?? 1)}
              onClick={() => setPage(p => p + 1)}
              className="rounded border border-white/15 px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#121212] p-4">
        <h2 className="mb-3 font-semibold">Cancellation requests</h2>

        {cancels.isLoading ? (
          <Loader2 className="animate-spin" />
        ) : !cancels.data?.length ? (
          <p className="text-sm text-white/50">
            No pending cancellation requests.
          </p>
        ) : (
          <div className="space-y-3">
            {cancels.data.map((req: any) => (
              <div
                key={req.request.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-3"
              >
                <div>
                  <p className="text-sm">{req.order.orderNumber}</p>
                  <p className="text-xs text-white/50">
                    {req.request.reason}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={action.isPending}
                    onClick={() =>
                      void run(() =>
                        action.mutateAsync({
                          type: "review",
                          id: req.request.id,
                          decision: "APPROVED",
                        })
                      )
                    }
                    className="rounded-full bg-emerald-800 px-3 py-2 text-xs"
                  >
                    Approve
                  </button>

                  <button
                    disabled={action.isPending}
                    onClick={() =>
                      void run(() =>
                        action.mutateAsync({
                          type: "review",
                          id: req.request.id,
                          decision: "REJECTED",
                        })
                      )
                    }
                    className="rounded-full bg-red-900 px-3 py-2 text-xs"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}
