import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export type CashfreeOrder = {
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
  payment_session_id?: string;
  order_expiry_time?: string;
};

@Injectable()
export class CashfreeService {
  private configuration() {
    const clientId = process.env.CASHFREE_CLIENT_ID;
    const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException('Online payments are not configured');
    }
    const environment = (process.env.CASHFREE_ENV ?? 'SANDBOX').toUpperCase();
    if (!['SANDBOX', 'PRODUCTION'].includes(environment)) {
      throw new ServiceUnavailableException('CASHFREE_ENV must be SANDBOX or PRODUCTION');
    }
    const sandbox = environment === 'SANDBOX';
    return {
      clientId,
      clientSecret,
      apiVersion: process.env.CASHFREE_API_VERSION ?? '2026-01-01',
      baseUrl: sandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg',
    };
  }

  async request<T>(path: string, options: { method?: string; body?: unknown; idempotencyKey?: string } = {}): Promise<T> {
    const config = this.configuration();
    const response = await fetch(`${config.baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'x-client-id': config.clientId,
        'x-client-secret': config.clientSecret,
        'x-api-version': config.apiVersion,
        accept: 'application/json',
        'content-type': 'application/json',
        ...(options.idempotencyKey ? { 'x-idempotency-key': options.idempotencyKey } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      signal: AbortSignal.timeout(15000),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof payload?.message === 'string' ? payload.message : 'Cashfree request failed';
      throw new ServiceUnavailableException(message);
    }
    return payload as T;
  }

  get isSandbox() {
    return (process.env.CASHFREE_ENV ?? 'SANDBOX').toUpperCase() === 'SANDBOX';
  }

  returnUrl(orderId: string) {
    const origin = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    return `${origin.replace(/\/$/, '')}/checkout/payment-return?cashfree_order_id={order_id}&ikigai_order_id=${encodeURIComponent(orderId)}`;
  }

  get webhookUrl() {
    const apiOrigin = process.env.BACKEND_URL;
    return apiOrigin ? `${apiOrigin.replace(/\/$/, '')}/payments/cashfree/webhook` : undefined;
  }
}
