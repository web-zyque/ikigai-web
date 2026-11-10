import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DB } from '../db/db.module';
import * as schema from '../db/schema';
import {
  carts,
  orderItems,
  orders,
  paymentAttempts,
  paymentRefunds,
  paymentTransactions,
  paymentWebhookEvents,
  users,
  cartItems,
} from '../db/schema';
import { CashfreeService, type CashfreeOrder } from './cashfree.service';

type PaymentRow = {
  cf_payment_id: string | number;
  order_id: string;
  payment_status: string;
  payment_amount: number;
  payment_currency: string;
  order_amount: number;
  order_currency: string;
  payment_group?: string;
  payment_time?: string;
};

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(DB) private readonly db: NeonDatabase<typeof schema>,
    private readonly cashfree: CashfreeService,
  ) {}

  async createAttempt(userId: string, orderId: string, idempotencyKey: string) {
    const [order] = await this.db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Order does not belong to this account');
    if (order.paymentMethod !== 'ONLINE' || order.orderStatus !== 'AWAITING_PAYMENT') {
      throw new ConflictException('This order is not awaiting an online payment');
    }
    if (order.paymentStatus === 'PAID') throw new ConflictException('This order is already paid');

    const [customer] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
    const customerPhone = customer?.phone?.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!customer?.fullName.trim() || !customerPhone || !/^\d{10}$/.test(customerPhone)) {
      throw new ConflictException('A valid customer name and 10-digit phone number are required for UPI payment');
    }

    const prior = await this.db.select().from(paymentAttempts)
      .where(eq(paymentAttempts.idempotencyKey, idempotencyKey)).limit(1);
    if (prior[0]) {
      if (prior[0].orderId !== order.id) throw new ConflictException('Payment idempotency key has already been used');
      if (prior[0].paymentSessionId) return this.attemptResponse(prior[0]);
    }

    await this.db.update(paymentAttempts).set({ status: 'EXPIRED', updatedAt: new Date() }).where(and(
      eq(paymentAttempts.orderId, order.id), eq(paymentAttempts.status, 'PENDING'), sql`${paymentAttempts.sessionExpiresAt} <= now()`,
    ));
    await this.db.update(paymentAttempts).set({ status: 'EXPIRED', updatedAt: new Date() }).where(and(
      eq(paymentAttempts.orderId, order.id), eq(paymentAttempts.status, 'CREATED'), sql`${paymentAttempts.createdAt} < now() - interval '30 seconds'`,
    ));
    const [activeAttempt] = await this.db.select().from(paymentAttempts)
      .where(and(eq(paymentAttempts.orderId, order.id), inArray(paymentAttempts.status, ['CREATED', 'PENDING'])))
      .orderBy(desc(paymentAttempts.createdAt)).limit(1);
    if (activeAttempt) {
      if (activeAttempt.paymentSessionId) return this.attemptResponse(activeAttempt);
      throw new ConflictException('A payment session is already being prepared. Please retry shortly.');
    }

    const orderLines = await this.db.select({
      productId: orderItems.productId,
      variantId: orderItems.variantId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice
    }).from(orderItems).where(eq(orderItems.orderId, order.id));
    const productIds = [...new Set(orderLines.map((line) => line.productId))];
    if (!productIds.length) throw new ConflictException('This order has no payable items');
    const eligible = await this.db.select({
      id: schema.products.id,
      acceptUpi: schema.products.acceptUpi,
      publicationStatus: schema.products.publicationStatus,
      sellingPrice: schema.products.sellingPrice,
      stockQuantity: schema.products.stockQuantity
    }).from(schema.products).where(inArray(schema.products.id, productIds));
    if (eligible.length !== productIds.length || eligible.some((product) => !product.acceptUpi || product.publicationStatus !== 'active')) {
      throw new ConflictException('UPI is not available for every product in this order');
    }
    const productsById = new Map(eligible.map((product) => [product.id, product]));
    for (const line of orderLines) {
      const product = productsById.get(line.productId)!;
      if (Number(product.sellingPrice) !== Number(line.unitPrice)) throw new ConflictException('A product price changed. Please create a new order at the current price.');
      let available = product.stockQuantity;
      if (line.variantId) {
        const [variant] = await this.db.select({ stockQuantity: schema.productVariants.stockQuantity }).from(schema.productVariants).where(and(eq(schema.productVariants.id, line.variantId), eq(schema.productVariants.productId, product.id))).limit(1);
        if (!variant) throw new ConflictException('A product option in this order is no longer available');
        available = variant.stockQuantity;
      }
      if (available < line.quantity) throw new ConflictException('A product in this order no longer has enough stock');
    }

    const providerOrderId = `IKG_${randomUUID().replaceAll('-', '')}`;
    const attempt = prior[0] ?? (await this.db.insert(paymentAttempts).values({
      orderId: order.id,
      providerOrderId,
      amount: order.totalAmount,
      currency: 'INR',
      status: 'CREATED',
      idempotencyKey,
    }).returning())[0];

    try {
      const customerDetails: Record<string, string> = {
        customer_id: customer.id,
        customer_name: customer.fullName,
        customer_phone: customerPhone,
      };
      const configuredTtl = Number(process.env.CASHFREE_SESSION_TTL_MINUTES ?? 30);
      const ttlMinutes = Number.isInteger(configuredTtl) && configuredTtl >= 5 && configuredTtl <= 60 ? configuredTtl : 30;
      const expiry = new Date(Date.now() + ttlMinutes * 60 * 1000);
      const payload = await this.cashfree.request<CashfreeOrder>('/orders', {
        method: 'POST',
        idempotencyKey,
        body: {
          order_id: attempt.providerOrderId,
          order_amount: Number(order.totalAmount),
          order_currency: 'INR',
          customer_details: customerDetails,
          order_expiry_time: expiry.toISOString(),
          order_meta: {
            payment_methods: 'upi',
            return_url: this.cashfree.returnUrl(order.id),
            ...(this.cashfree.webhookUrl ? { notify_url: this.cashfree.webhookUrl } : {}),
          },
          order_note: `Ikigai ${order.orderNumber}`,
        },
      });
      if (!payload.payment_session_id || payload.order_id !== attempt.providerOrderId || payload.order_currency !== 'INR' || Number(payload.order_amount) !== Number(order.totalAmount)) {
        throw new ConflictException('Cashfree returned an unexpected order session');
      }
      const [updated] = await this.db.update(paymentAttempts).set({
        paymentSessionId: payload.payment_session_id,
        sessionExpiresAt: payload.order_expiry_time ? new Date(payload.order_expiry_time) : expiry,
        status: 'PENDING',
        updatedAt: new Date(),
      }).where(eq(paymentAttempts.id, attempt.id)).returning();
      return this.attemptResponse(updated);
    } catch (error) {
      await this.db.update(paymentAttempts).set({
        status: 'FAILED',
        failureReason: error instanceof Error ? error.message : 'Cashfree session creation failed',
        updatedAt: new Date()
      }).where(eq(paymentAttempts.id, attempt.id));
      throw error;
    }
  }

  async retry(userId: string, orderId: string, idempotencyKey: string) {
    await this.verify(userId, orderId);
    const [order] = await this.db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Order does not belong to this account');
    if (order.orderStatus !== 'AWAITING_PAYMENT' || order.paymentMethod !== 'ONLINE' || order.paymentStatus === 'PAID') {
      throw new ConflictException('This order cannot be retried');
    }
    return this.createAttempt(userId, orderId, idempotencyKey);
  }

  async verify(userId: string, orderId: string) {
    const [order] = await this.db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Order does not belong to this account');
    const attempts = await this.db.select().from(paymentAttempts).where(eq(paymentAttempts.orderId, orderId)).orderBy(desc(paymentAttempts.createdAt));
    for (const attempt of attempts) {
      if (!attempt.paymentSessionId) continue;
      const payments = await this.cashfree.request<PaymentRow[]>(`/orders/${encodeURIComponent(attempt.providerOrderId)}/payments`);
      const successfulPayments = payments.filter((payment) => payment.payment_status === 'SUCCESS');
      if (successfulPayments.length) {
        for (const success of successfulPayments) await this.applyVerifiedPayment(attempt.providerOrderId, success);
      } else if (payments.some((payment) => payment.payment_status === 'PENDING')) {
        await this.db.update(paymentAttempts).set({ status: 'PENDING', updatedAt: new Date() }).where(eq(paymentAttempts.id, attempt.id));
      } else if (payments.some((payment) => ['FAILED', 'USER_DROPPED'].includes(payment.payment_status))) {
        await this.db.update(paymentAttempts).set({ status: 'FAILED', updatedAt: new Date() }).where(eq(paymentAttempts.id, attempt.id));
      }
    }
    const [updated] = await this.db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const updatedAttempts = await this.db.select().from(paymentAttempts).where(eq(paymentAttempts.orderId, orderId)).orderBy(desc(paymentAttempts.createdAt));
    return { order: updated, attempts: updatedAttempts.map((attempt) => this.publicAttempt(attempt)) };
  }

  async handleWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>) {
    const signature = String(headers['x-webhook-signature'] ?? '');
    const timestamp = String(headers['x-webhook-timestamp'] ?? '');
    const secret = process.env.CASHFREE_CLIENT_SECRET;
    if (!signature || !timestamp || !secret) throw new ConflictException('Cashfree webhook signature is invalid');
    const expected = createHmac('sha256', secret).update(timestamp + rawBody.toString('utf8')).digest('base64');
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);
    if (expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) {
      throw new ConflictException('Cashfree webhook signature is invalid');
    }
    const payload = JSON.parse(rawBody.toString('utf8')) as any;
    const eventType = String(payload.type ?? payload.event_type ?? 'UNKNOWN');
    const data = payload.data ?? {};
    const providerOrderId = data.order?.order_id ?? data.payment?.order_id ?? data.refund?.order_id ?? null;
    const providerPaymentId = data.payment?.cf_payment_id ? String(data.payment.cf_payment_id) : data.refund?.cf_payment_id ? String(data.refund.cf_payment_id) : null;
    const providerEventId = payload.event_id ?? payload.id ?? null;
    const suppliedKey = headers['x-idempotency-header'];
    const eventKey = Array.isArray(suppliedKey) ? suppliedKey[0] : suppliedKey;
    const dedupeKey = String(eventKey || providerEventId || createHash('sha256').update(timestamp).update(rawBody).digest('hex'));
    const payloadHash = createHash('sha256').update(rawBody).digest('hex');
    const existing = await this.db.select().from(paymentWebhookEvents).where(eq(paymentWebhookEvents.eventKey, dedupeKey)).limit(1);
    if (existing[0]?.processingStatus === 'PROCESSED') return { received: true, duplicate: true };
    if (!existing[0]) {
      await this.db.insert(paymentWebhookEvents).values({
        eventKey: dedupeKey,
        eventId: providerEventId ? String(providerEventId) : null,
        providerOrderId,
        providerPaymentId,
        eventType,
        payloadHash,
      }).onConflictDoNothing();
    }
    try {
      if (data.refund) {
        const refund = (await this.db.select().from(paymentRefunds).where(eq(paymentRefunds.merchantRefundId, String(data.refund.refund_id ?? ''))).limit(1))[0];
        if (refund) {
          const [attempt] = await this.db.select().from(paymentAttempts).where(eq(paymentAttempts.id, refund.paymentAttemptId)).limit(1);
          if (!attempt || data.refund.order_id !== attempt.providerOrderId || String(data.refund.cf_payment_id) !== refund.providerPaymentId || Number(data.refund.refund_amount) !== Number(refund.refundAmount)) {
            throw new ConflictException('Cashfree refund details do not match the stored payment');
          }
          const refundStatus = String(data.refund.refund_status ?? '').toUpperCase();
          const status = refundStatus === 'SUCCESS' ? 'SUCCESS' : ['PENDING', 'PROCESSING'].includes(refundStatus) ? 'PROCESSING' : 'FAILED';
          await this.db.update(paymentRefunds).set({
            providerRefundId: data.refund.cf_refund_id ? String(data.refund.cf_refund_id) : refund.providerRefundId,
            status,
            failureReason: status === 'FAILED' ? String(data.refund.refund_note ?? 'Cashfree refund failed').slice(0, 1000) : null,
            updatedAt: new Date(),
          }).where(eq(paymentRefunds.id, refund.id));
          if (status === 'SUCCESS') await this.markOrderRefunded(refund.orderId);
        }
      } else if (providerOrderId && data.payment) {
        const payments = await this.cashfree.request<PaymentRow[]>(`/orders/${encodeURIComponent(providerOrderId)}/payments`);
        const verified = payments.find((item) => String(item.cf_payment_id) === providerPaymentId);
        if (verified?.payment_status === 'SUCCESS') await this.applyVerifiedPayment(providerOrderId, verified);
        else if (verified && ['FAILED', 'USER_DROPPED'].includes(verified.payment_status)) {
          await this.db.update(paymentAttempts).set({
            status: 'FAILED',
            providerPaymentId: String(verified.cf_payment_id),
            updatedAt: new Date()
          }).where(eq(paymentAttempts.providerOrderId, providerOrderId));
        }
      }
      await this.db.update(paymentWebhookEvents).set({ processingStatus: 'PROCESSED', processedAt: new Date() }).where(eq(paymentWebhookEvents.eventKey, dedupeKey));
      return { received: true };
    } catch (error) {
      await this.db.update(paymentWebhookEvents).set({
        processingStatus: 'FAILED',
        errorMessage: error instanceof Error ? error.message.slice(0, 1000) : 'Webhook processing failed'
      }).where(eq(paymentWebhookEvents.eventKey, dedupeKey));
      throw error;
    }
  }

  async processApprovedCancellation(requestId: string) {
    const [request] = await this.db.select().from(schema.orderCancellationRequests).where(eq(schema.orderCancellationRequests.id, requestId)).limit(1);
    if (!request || request.status !== 'APPROVED') return null;
    const [order] = await this.db.select().from(orders).where(eq(orders.id, request.orderId)).limit(1);
    if (!order || order.paymentMethod !== 'ONLINE' || order.paymentStatus !== 'PAID') return null;
    const [attempt] = await this.db.select().from(paymentAttempts).where(and(eq(paymentAttempts.orderId, order.id), eq(paymentAttempts.status, 'SUCCESS'))).orderBy(asc(paymentAttempts.createdAt)).limit(1);
    if (!attempt?.providerPaymentId) throw new ConflictException('The successful Cashfree transaction could not be found');
    const [existing] = await this.db.select().from(paymentRefunds).where(and(eq(paymentRefunds.orderId, order.id), eq(paymentRefunds.paymentAttemptId, attempt.id))).limit(1);
    if (existing && ['PENDING', 'PROCESSING', 'SUCCESS'].includes(existing.status)) return existing;
    const refundId = `REF${randomUUID().replaceAll('-', '').slice(0, 28)}`;
    const [refund] = await this.db.insert(paymentRefunds).values({
      orderId: order.id,
      paymentAttemptId: attempt.id,
      merchantRefundId: refundId,
      providerPaymentId: attempt.providerPaymentId,
      refundAmount: order.totalAmount,
      currency: 'INR',
      status: 'PENDING',
      idempotencyKey: randomUUID(),
      reason: request.reason,
    }).returning();
    try {
      const response = await this.cashfree.request<any>(`/orders/${encodeURIComponent(attempt.providerOrderId)}/refunds`, {
        method: 'POST',
        idempotencyKey: refund.idempotencyKey,
        body: {
          refund_amount: Number(order.totalAmount),
          refund_id: refundId,
          refund_note: `Ikigai cancellation ${order.orderNumber}`,
          refund_speed: 'STANDARD'
        },
      });
      const success = response.refund_status === 'SUCCESS';
      await this.db.update(paymentRefunds).set({
        providerRefundId: response.cf_refund_id ? String(response.cf_refund_id) : refundId,
        status: success ? 'SUCCESS' : response.refund_status === 'PENDING' ? 'PROCESSING' : 'FAILED',
        updatedAt: new Date(),
      }).where(eq(paymentRefunds.id, refund.id));
      if (success) await this.markOrderRefunded(order.id);
      return { ...refund, status: success ? 'SUCCESS' : 'PROCESSING' };
    } catch (error) {
      await this.db.update(paymentRefunds).set({
        status: 'FAILED',
        failureReason: error instanceof Error ? error.message.slice(0, 1000) : 'Cashfree refund failed',
        updatedAt: new Date()
      }).where(eq(paymentRefunds.id, refund.id));
      return { ...refund, status: 'FAILED' };
    }
  }

  async processAdminRejectedOrder(orderId: string, reason: string) {
    const [order] = await this.db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order || order.orderStatus !== 'CANCELLED' || order.paymentMethod !== 'ONLINE' || order.paymentStatus !== 'PAID') return null;
    const [attempt] = await this.db.select().from(paymentAttempts)
      .where(and(eq(paymentAttempts.orderId, orderId), eq(paymentAttempts.status, 'SUCCESS')))
      .orderBy(asc(paymentAttempts.createdAt)).limit(1);
    if (!attempt?.providerPaymentId) throw new ConflictException('The successful Cashfree transaction could not be found');
    const [existing] = await this.db.select().from(paymentRefunds)
      .where(and(eq(paymentRefunds.orderId, orderId), eq(paymentRefunds.paymentAttemptId, attempt.id))).limit(1);
    if (existing && ['PENDING', 'PROCESSING', 'SUCCESS'].includes(existing.status)) return existing;
    const merchantRefundId = `REF${randomUUID().replaceAll('-', '').slice(0, 28)}`;
    const idempotencyKey = randomUUID();
    const [refund] = await this.db.insert(paymentRefunds).values({
      orderId,
      paymentAttemptId: attempt.id,
      merchantRefundId,
      providerPaymentId: attempt.providerPaymentId,
      refundAmount: order.totalAmount,
      currency: 'INR',
      status: 'PENDING',
      idempotencyKey,
      reason,
    }).returning();
    try {
      const response = await this.cashfree.request<any>(`/orders/${encodeURIComponent(attempt.providerOrderId)}/refunds`, {
        method: 'POST', idempotencyKey,
        body: {
          refund_amount: Number(order.totalAmount),
          refund_id: merchantRefundId,
          refund_note: `Ikigai rejected ${order.orderNumber}`,
          refund_speed: 'STANDARD'
        },
      });
      const status = response.refund_status === 'SUCCESS' ? 'SUCCESS' : response.refund_status === 'PENDING' ? 'PROCESSING' : 'FAILED';
      await this.db.update(paymentRefunds).set({
        providerRefundId: response.cf_refund_id ? String(response.cf_refund_id) : merchantRefundId,
        status,
        failureReason: status === 'FAILED' ? 'Cashfree did not accept the refund request' : null,
        updatedAt: new Date(),
      }).where(eq(paymentRefunds.id, refund.id));
      if (status === 'SUCCESS') await this.markOrderRefunded(order.id);
      return { ...refund, status };
    } catch (error) {
      await this.db.update(paymentRefunds).set({
        status: 'FAILED',
        failureReason: error instanceof Error ? error.message.slice(0, 1000) : 'Cashfree refund failed',
        updatedAt: new Date()
      }).where(eq(paymentRefunds.id, refund.id));
      return { ...refund, status: 'FAILED' };
    }
  }

  async retryRefund(refundId: string) {
    const [refund] = await this.db.select().from(paymentRefunds).where(eq(paymentRefunds.id, refundId)).limit(1);
    if (!refund) throw new NotFoundException('Refund not found');
    if (refund.status !== 'FAILED') throw new ConflictException('Only failed refunds can be retried');
    const [attempt] = await this.db.select().from(paymentAttempts).where(eq(paymentAttempts.id, refund.paymentAttemptId)).limit(1);
    if (!attempt) throw new NotFoundException('Payment attempt not found');
    await this.db.update(paymentRefunds).set({ status: 'PROCESSING', failureReason: null, updatedAt: new Date() }).where(eq(paymentRefunds.id, refundId));
    try {
      const response = await this.cashfree.request<any>(`/orders/${encodeURIComponent(attempt.providerOrderId)}/refunds`, {
        method: 'POST', idempotencyKey: refund.idempotencyKey,
        body: {
          refund_amount: Number(refund.refundAmount),
          refund_id: refund.merchantRefundId,
          refund_note: 'Ikigai cancellation refund retry',
          refund_speed: 'STANDARD'
        },
      });
      const status = response.refund_status === 'SUCCESS' ? 'SUCCESS' : response.refund_status === 'PENDING' ? 'PROCESSING' : 'FAILED';
      await this.db.update(paymentRefunds).set({
        providerRefundId: response.cf_refund_id ? String(response.cf_refund_id) : refund.providerRefundId,
        status,
        updatedAt: new Date()
      }).where(eq(paymentRefunds.id, refundId));
      if (status === 'SUCCESS') await this.markOrderRefunded(refund.orderId);
      return { ...refund, status };
    } catch (error) {
      await this.db.update(paymentRefunds).set({
        status: 'FAILED',
        failureReason: error instanceof Error ? error.message.slice(0, 1000) : 'Cashfree refund retry failed',
        updatedAt: new Date()
      }).where(eq(paymentRefunds.id, refundId));
      throw error;
    }
  }

  async listOrderPayments(userId: string, orderId: string) {
    const [order] = await this.db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Order does not belong to this account');
    const attempts = await this.db.select().from(paymentAttempts).where(eq(paymentAttempts.orderId, orderId)).orderBy(desc(paymentAttempts.createdAt));
    const transactions = await this.db.select({
      providerPaymentId: paymentTransactions.providerPaymentId,
      amount: paymentTransactions.amount,
      currency: paymentTransactions.currency,
      status: paymentTransactions.status,
      paymentGroup: paymentTransactions.paymentGroup,
      paidAt: paymentTransactions.paidAt
    }).from(paymentTransactions)
      .innerJoin(paymentAttempts, eq(paymentAttempts.id, paymentTransactions.paymentAttemptId)).where(eq(paymentAttempts.orderId, orderId)).orderBy(desc(paymentTransactions.createdAt));
    const refunds = await this.db.select().from(paymentRefunds).where(eq(paymentRefunds.orderId, orderId)).orderBy(desc(paymentRefunds.createdAt));
    return { attempts: attempts.map((attempt) => this.publicAttempt(attempt)), transactions, refunds };
  }

  async listAdminOrderPayments(orderId: string) {
    const [order] = await this.db.select({ id: orders.id }).from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) throw new NotFoundException('Order not found');
    const attempts = await this.db.select().from(paymentAttempts).where(eq(paymentAttempts.orderId, orderId)).orderBy(desc(paymentAttempts.createdAt));
    const transactions = await this.db.select({
      providerPaymentId: paymentTransactions.providerPaymentId,
      amount: paymentTransactions.amount,
      currency: paymentTransactions.currency,
      status: paymentTransactions.status,
      paymentGroup: paymentTransactions.paymentGroup,
      paidAt: paymentTransactions.paidAt
    }).from(paymentTransactions)
      .innerJoin(paymentAttempts, eq(paymentAttempts.id, paymentTransactions.paymentAttemptId)).where(eq(paymentAttempts.orderId, orderId)).orderBy(desc(paymentTransactions.createdAt));
    const refunds = await this.db.select().from(paymentRefunds).where(eq(paymentRefunds.orderId, orderId)).orderBy(desc(paymentRefunds.createdAt));
    return { attempts: attempts.map((attempt) => this.publicAttempt(attempt)), transactions, refunds };
  }

  private async applyVerifiedPayment(providerOrderId: string, payment: PaymentRow) {
    const [attempt] = await this.db.select().from(paymentAttempts).where(eq(paymentAttempts.providerOrderId, providerOrderId)).limit(1);
    if (!attempt) throw new NotFoundException('Payment attempt not found');
    if (payment.order_id !== providerOrderId) throw new ConflictException('Cashfree payment is associated with a different provider order');
    if (payment.payment_group && payment.payment_group.toLowerCase() !== 'upi') throw new ConflictException('Cashfree returned a non-UPI payment for this UPI order');
    if (payment.order_currency !== 'INR' || payment.payment_currency !== 'INR' || Number(payment.order_amount) !== Number(attempt.amount) || Number(payment.payment_amount) !== Number(attempt.amount)) {
      throw new ConflictException('Cashfree payment amount or currency does not match the Ikigai order');
    }

    let lateOrDuplicate = false;
    await this.db.transaction(async (tx) => {
      const [lockedOrder] = await tx.select().from(orders).where(eq(orders.id, attempt.orderId)).for('update');
      if (!lockedOrder) throw new NotFoundException('Order not found');
      const [lockedAttempt] = await tx.select().from(paymentAttempts).where(eq(paymentAttempts.id, attempt.id)).for('update');
      const [knownTransaction] = await tx.select({ id: paymentTransactions.id }).from(paymentTransactions).where(eq(paymentTransactions.providerPaymentId, String(payment.cf_payment_id))).limit(1);
      if (knownTransaction) return;
      await tx.insert(paymentTransactions).values({
        paymentAttemptId: attempt.id,
        providerPaymentId: String(payment.cf_payment_id),
        amount: String(payment.payment_amount),
        currency: payment.payment_currency,
        status: 'SUCCESS',
        paymentGroup: payment.payment_group ?? null,
        paidAt: payment.payment_time ? new Date(payment.payment_time) : null,
      }).onConflictDoNothing();
      await tx.update(paymentAttempts).set({
        status: 'SUCCESS',
        providerPaymentId: lockedAttempt.providerPaymentId ?? String(payment.cf_payment_id),
        failureReason: null,
        updatedAt: new Date()
      }).where(eq(paymentAttempts.id, attempt.id));
      if (lockedOrder.paymentStatus === 'PAID' || lockedOrder.orderStatus === 'CANCELLED') {
        if (lockedOrder.orderStatus === 'CANCELLED' && lockedOrder.paymentStatus !== 'PAID') {
          await tx.update(orders).set({ paymentStatus: 'PAID', updatedAt: new Date() }).where(eq(orders.id, lockedOrder.id));
        }
        lateOrDuplicate = true;
        return;
      }
      if (lockedOrder.orderStatus !== 'AWAITING_PAYMENT') throw new ConflictException('Order is not awaiting payment');
      await tx.update(orders).set({ paymentStatus: 'PAID', orderStatus: 'PENDING', updatedAt: new Date() }).where(eq(orders.id, lockedOrder.id));
      await tx.insert(schema.orderStatusHistory).values({
        orderId: lockedOrder.id,
        previousStatus: 'AWAITING_PAYMENT',
        newStatus: 'PENDING',
        changedBy: lockedOrder.userId,
        changedByRole: 'SYSTEM',
        note: 'Cashfree UPI payment verified',
      });
      if (!lockedOrder.isBuyNow) await this.clearOrderedCartLines(tx, lockedOrder.userId, lockedOrder.id);
    });
    if (lateOrDuplicate) await this.refundLateOrDuplicatePayment(attempt, payment);
  }

  private async clearOrderedCartLines(tx: any, userId: string, orderId: string) {
    const [cart] = await tx.select().from(carts).where(eq(carts.userId, userId)).for('update');
    if (!cart) return;
    const lines = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const line of lines) {
      if (!line.cartItemId) continue;
      const [cartLine] = await tx.select().from(cartItems).where(and(
        eq(cartItems.id, line.cartItemId),
        eq(cartItems.cartId, cart.id),
      )).limit(1);
      if (!cartLine) continue;
      if (cartLine.quantity <= line.quantity) await tx.delete(cartItems).where(eq(cartItems.id, cartLine.id));
      else await tx.update(cartItems).set({ quantity: sql`${cartItems.quantity} - ${line.quantity}`, updatedAt: new Date() }).where(eq(cartItems.id, cartLine.id));
    }
    await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cart.id));
  }

  private async refundLateOrDuplicatePayment(attempt: typeof paymentAttempts.$inferSelect, payment: PaymentRow) {
    const [order] = await this.db.select().from(orders).where(eq(orders.id, attempt.orderId)).limit(1);
    if (!order) return;
    const existing = await this.db.select().from(paymentRefunds).where(eq(paymentRefunds.providerPaymentId, String(payment.cf_payment_id))).limit(1);
    if (existing[0]) return;
    const providerRefundId = `REF${randomUUID().replaceAll('-', '').slice(0, 28)}`;
    const [refund] = await this.db.insert(paymentRefunds).values({
      orderId: order.id,
      paymentAttemptId: attempt.id,
      merchantRefundId: providerRefundId,
      providerPaymentId: String(payment.cf_payment_id),
      refundAmount: order.totalAmount,
      status: 'PENDING',
      idempotencyKey: randomUUID(),
      reason: 'Late or duplicate successful payment; automatic reconciliation refund',
    }).returning();
    try {
      const response = await this.cashfree.request<any>(`/orders/${encodeURIComponent(attempt.providerOrderId)}/refunds`, {
        method: 'POST', idempotencyKey: refund.idempotencyKey,
        body: {
          refund_amount: Number(order.totalAmount),
          refund_id: providerRefundId,
          refund_note: 'Ikigai duplicate or late payment',
          refund_speed: 'STANDARD'
        },
      });
      const success = response.refund_status === 'SUCCESS';
      await this.db.update(paymentRefunds).set({
        providerRefundId: response.cf_refund_id ? String(response.cf_refund_id) : providerRefundId,
        status: success ? 'SUCCESS' : 'PROCESSING',
        updatedAt: new Date()
      }).where(eq(paymentRefunds.id, refund.id));
      if (success && order.paymentStatus === 'PAID') await this.markOrderRefunded(order.id);
    } catch (error) {
      await this.db.update(paymentRefunds).set({
        status: 'FAILED',
        failureReason: error instanceof Error ? error.message.slice(0, 1000) : 'Cashfree refund failed',
        updatedAt: new Date()
      }).where(eq(paymentRefunds.id, refund.id));
    }
  }

  private async markOrderRefunded(orderId: string) {
    await this.db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for('update');
      if (!order || order.paymentStatus !== 'PAID') return;
      const successful = await tx.select({ amount: paymentTransactions.amount }).from(paymentTransactions)
        .innerJoin(paymentAttempts, eq(paymentAttempts.id, paymentTransactions.paymentAttemptId))
        .where(and(eq(paymentAttempts.orderId, orderId), eq(paymentTransactions.status, 'SUCCESS')));
      const refunded = await tx.select({ amount: paymentRefunds.refundAmount }).from(paymentRefunds)
        .where(and(eq(paymentRefunds.orderId, orderId), eq(paymentRefunds.status, 'SUCCESS')));
      const paidCents = successful.reduce((sum, row) => sum + Math.round(Number(row.amount) * 100), 0);
      const refundedCents = refunded.reduce((sum, row) => sum + Math.round(Number(row.amount) * 100), 0);
      if (paidCents > 0 && refundedCents >= paidCents) {
        await tx.update(orders).set({ paymentStatus: 'REFUNDED', updatedAt: new Date() }).where(eq(orders.id, orderId));
      }
    });
  }

  private attemptResponse(attempt: typeof paymentAttempts.$inferSelect) {
    return {
      orderId: attempt.orderId,
      paymentSessionId: attempt.paymentSessionId,
      providerOrderId: attempt.providerOrderId,
      expiresAt: attempt.sessionExpiresAt,
      environment: this.cashfree.isSandbox ? 'sandbox' : 'production'
    };
  }

  private publicAttempt(attempt: typeof paymentAttempts.$inferSelect) {
    return {
      id: attempt.id,
      provider: attempt.provider,
      method: attempt.paymentMethod,
      providerOrderId: attempt.providerOrderId,
      providerPaymentId: attempt.providerPaymentId,
      amount: attempt.amount,
      currency: attempt.currency,
      status: attempt.status,
      sessionExpiresAt: attempt.sessionExpiresAt,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt
    };
  }
}