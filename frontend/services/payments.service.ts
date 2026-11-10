import api from "@/api/axios";

export interface CashfreeSession {
  orderId: string;
  providerOrderId: string;
  paymentSessionId: string;
  expiresAt: string | null;
  environment: "sandbox" | "production";
}

export interface VerifiedPayment {
  order: {
    id: string;
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    orderStatus: string;
  };
  attempts: Array<{
    id: string;
    status: string;
    providerPaymentId: string | null;
  }>;
}

export interface PaymentHistory {
  attempts: Array<{
    id: string;
    provider: string;
    method: string;
    providerOrderId: string;
    providerPaymentId: string | null;
    amount: string;
    currency: string;
    status: string;
    sessionExpiresAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  transactions: Array<{
    providerPaymentId: string;
    amount: string;
    currency: string;
    status: string;
    paymentGroup: string | null;
    paidAt: string | null;
  }>;
  refunds: Array<{
    id: string;
    providerRefundId: string | null;
    refundAmount: string;
    currency: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export const paymentsService = {
  create: (orderId: string, idempotencyKey: string) =>
    api
      .post<CashfreeSession>("/payments/cashfree/create", {
        orderId,
        idempotencyKey,
      })
      .then((r) => r.data),

  retry: (orderId: string, idempotencyKey: string) =>
    api
      .post<CashfreeSession>(`/payments/cashfree/retry/${orderId}`, {
        idempotencyKey,
      })
      .then((r) => r.data),

  verify: (orderId: string) =>
    api
      .get<VerifiedPayment>(`/payments/cashfree/verify/${orderId}`)
      .then((r) => r.data),

  history: (orderId: string) =>
    api
      .get<PaymentHistory>(`/payments/cashfree/orders/${orderId}`)
      .then((r) => r.data),

  adminHistory: (orderId: string) =>
    api
      .get(`/admin/payments/cashfree/orders/${orderId}`)
      .then((r) => r.data),

  retryRefund: (refundId: string) =>
    api
      .post(`/admin/payments/cashfree/refunds/${refundId}/retry`)
      .then((r) => r.data),
};

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget: "_self";
      }) => Promise<unknown>;
    };
  }
}

export async function getCashfreeCheckout() {
  const deadline = Date.now() + 10_000;

  while (!window.Cashfree && Date.now() < deadline) {
    await new Promise((resolve) => window.setTimeout(resolve, 100));
  }

  if (!window.Cashfree) {
    throw new Error("Cashfree checkout could not be loaded. Please try again.");
  }

  return window.Cashfree;
}