import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, desc, eq, gte, ilike, lte, or, sql, type SQL } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DB } from '../db/db.module';
import * as schema from '../db/schema';
import {
  admins,
  cartItems,
  carts,
  orderCancellationRequests,
  orderItems,
  orders,
  orderStatusHistory,
  productImages,
  products,
  productVariants,
  userAddresses,
  users,
} from '../db/schema';
import type {
  AdminOrderListDto,
  AdminOrderRejectDto,
  AdminOrderStatusDto,
  CreateCancellationRequestDto,
  CreateOrderDto,
  ReviewCancellationDto,
} from './dto/order.dto';

type Tx = Parameters<Parameters<NeonDatabase<typeof schema>['transaction']>[0]>[0];
type AddressSnapshot = typeof orders.$inferSelect.shippingAddress;

function cents(value: string): bigint {
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 100n + BigInt((fraction + '00').slice(0, 2));
}

function money(value: bigint): string {
  return `${value / 100n}.${String(value % 100n).padStart(2, '0')}`;
}

function getAddressSnapshot(address: typeof userAddresses.$inferSelect): AddressSnapshot {
  return {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    landmark: address.landmark,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    addressType: address.addressType,
  };
}

@Injectable()
export class OrdersService {
  constructor(@Inject(DB) private readonly db: NeonDatabase<typeof schema>) {}

  async create(userId: string, dto: CreateOrderDto) {
    const isOnline = dto.paymentMethod === 'ONLINE';
    return this.db.transaction(async (tx) => {
      const [prior] = await tx
        .select({ id: orders.id })
        .from(orders)
        .where(and(eq(orders.userId, userId), eq(orders.idempotencyKey, dto.idempotencyKey)))
        .limit(1);
      if (prior) return this.loadOrder(tx, prior.id);

      let cart: typeof carts.$inferSelect | undefined;
      let lines: Array<{ id?: string; productId: string; variantId: string | null; quantity: number }>;
      if (dto.buyNowItem) {
        cart = undefined;
        lines = [{
          productId: dto.buyNowItem.productId,
          variantId: dto.buyNowItem.variantId ?? null,
          quantity: dto.buyNowItem.quantity,
        }];
      } else {
        const [lockedCart] = await tx
          .select()
          .from(carts)
          .where(eq(carts.userId, userId))
          .for('update');
        cart = lockedCart;
        if (!cart) throw new BadRequestException('Your cart is empty');
        lines = await tx.select().from(cartItems).where(eq(cartItems.cartId, cart.id));
      }
      if (lines.length === 0) throw new BadRequestException('Your cart is empty');

      const [address] = await tx
        .select()
        .from(userAddresses)
        .where(and(eq(userAddresses.id, dto.addressId), eq(userAddresses.userId, userId)))
        .limit(1);
      if (!address) throw new BadRequestException('Select a valid saved delivery address');

      const couponCode = dto.couponCode?.trim().toUpperCase() || null;
      const validCoupons = new Set(['IKIGAI10', 'WELCOME10', 'SAVE10']);
      if (couponCode && !validCoupons.has(couponCode)) {
        throw new BadRequestException('The coupon code is invalid');
      }

      let subtotalCents = 0n;
      const itemSnapshots: Array<{
        productId: string;
        cartItemId: string | null;
        variantId: string | null;
        productName: string;
        sku: string;
        imageUrl: string | null;
        selectedVariant: { id: string; colorName: string; sku: string | null } | null;
        quantity: number;
        unitPrice: string;
        totalPrice: string;
      }> = [];

      for (const line of lines) {
        if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 1000) {
          throw new BadRequestException('One or more cart quantities are invalid');
        }
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, line.productId))
          .limit(1);
        if (!product || product.publicationStatus !== 'active') {
          throw new BadRequestException('A product in your cart is no longer available');
        }
        if (isOnline ? !product.acceptUpi : !product.acceptCod) {
          throw new BadRequestException(`${isOnline ? 'UPI' : 'Cash on Delivery'} is not available for ${product.name}`);
        }

        let selectedVariant: { id: string; colorName: string; sku: string | null } | null = null;
        if (line.variantId) {
          const [variant] = await tx
            .select()
            .from(productVariants)
            .where(and(eq(productVariants.id, line.variantId), eq(productVariants.productId, product.id)))
            .limit(1);
          if (!variant) throw new BadRequestException(`A selected option for ${product.name} is no longer available`);
          if (variant.stockQuantity < line.quantity) {
            throw new ConflictException(`Insufficient stock for ${product.name} (${variant.colorName})`);
          }
          selectedVariant = { id: variant.id, colorName: variant.colorName, sku: variant.sku };
        } else if (product.stockQuantity < line.quantity) {
          throw new ConflictException(`Insufficient stock for ${product.name}`);
        }

        const [image] = await tx
          .select({ imageUrl: productImages.imageUrl })
          .from(productImages)
          .where(and(eq(productImages.productId, product.id), line.variantId
            ? eq(productImages.variantId, line.variantId)
            : sql`${productImages.variantId} IS NULL`))
          .orderBy(desc(productImages.isMainImage), asc(productImages.displayOrder))
          .limit(1);
        const unitCents = cents(product.sellingPrice);
        const lineCents = unitCents * BigInt(line.quantity);
        subtotalCents += lineCents;
        itemSnapshots.push({
          productId: product.id,
          cartItemId: line.id ?? null,
          variantId: line.variantId,
          productName: product.name,
          sku: selectedVariant?.sku ?? product.sku,
          imageUrl: image?.imageUrl ?? null,
          selectedVariant,
          quantity: line.quantity,
          unitPrice: money(unitCents),
          totalPrice: money(lineCents),
        });
      }

      const discountCents = couponCode ? (subtotalCents + 5n) / 10n : 0n;
      const deliveryCents = subtotalCents > 200000n ? 0n : 1500n;
      const totalCents = subtotalCents - discountCents + deliveryCents;
      const sequenceResult = await tx.execute(sql`SELECT nextval('order_number_seq') AS value`);
      const sequenceValue = Number((sequenceResult as any).rows?.[0]?.value ?? (sequenceResult as any)[0]?.value);
      if (!Number.isSafeInteger(sequenceValue) || sequenceValue < 1) {
        throw new Error('Could not generate an order number');
      }
      const orderNumber = `IKG-${new Date().getFullYear()}-${String(sequenceValue).padStart(6, '0')}`;

      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,
          userId,
          idempotencyKey: dto.idempotencyKey,
          subtotal: money(subtotalCents),
          discountAmount: money(discountCents),
          deliveryFee: money(deliveryCents),
          totalAmount: money(totalCents),
          couponCode,
          shippingAddress: getAddressSnapshot(address),
          paymentMethod: isOnline ? 'ONLINE' : 'COD',
          paymentStatus: 'PENDING',
          orderStatus: isOnline ? 'AWAITING_PAYMENT' : 'PENDING',
          isBuyNow: Boolean(dto.buyNowItem),
        })
        .returning();

      await tx.insert(orderItems).values(itemSnapshots.map((item) => ({ orderId: order.id, ...item })));
      await tx.insert(orderStatusHistory).values({
        orderId: order.id,
        previousStatus: null,
        newStatus: isOnline ? 'AWAITING_PAYMENT' : 'PENDING',
        changedBy: userId,
        changedByRole: 'CUSTOMER',
        note: isOnline ? 'UPI order awaiting payment' : 'COD order placed',
      });
      if (cart && !isOnline) {
        await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
        await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cart.id));
      }

      return this.loadOrder(tx, order.id);
    });
  }

  async listCustomerOrders(userId: string) {
    const rows = await this.db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    return Promise.all(rows.map((row) => this.loadOrder(this.db, row.id)));
  }

  async getCustomerOrder(userId: string, orderId: string) {
    const [order] = await this.db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);
    if (!order) throw new NotFoundException('Order not found');
    return this.loadOrder(this.db, order.id);
  }

  async requestCancellation(userId: string, orderId: string, dto: CreateCancellationRequestDto) {
    return this.db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
        .for('update');
      if (!order) throw new NotFoundException('Order not found');
      if (!['AWAITING_PAYMENT', 'PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus)) {
        throw new BadRequestException('Cancellation is not available for this order status');
      }
      const [active] = await tx
        .select({ id: orderCancellationRequests.id })
        .from(orderCancellationRequests)
        .where(and(
          eq(orderCancellationRequests.orderId, orderId),
          eq(orderCancellationRequests.status, 'PENDING'),
        ))
        .limit(1);
      if (active) throw new ConflictException('A cancellation request is already pending for this order');
      const [request] = await tx
        .insert(orderCancellationRequests)
        .values({ orderId, userId, reason: dto.reason, status: 'PENDING' })
        .returning();
      return request;
    });
  }

  async listAdminOrders(query: AdminOrderListDto) {
    const filters: SQL<unknown>[] = [];
    if (query.status) filters.push(eq(orders.orderStatus, query.status));
    if (query.paymentStatus) filters.push(eq(orders.paymentStatus, query.paymentStatus));
    if (query.from) filters.push(gte(orders.createdAt, query.from));
    if (query.to) filters.push(lte(orders.createdAt, query.to));
    if (query.search) {
      const match = `%${query.search}%`;
      filters.push(or(ilike(orders.orderNumber, match), ilike(users.fullName, match), ilike(users.phone, match))!);
    }
    const where = filters.length ? and(...filters) : undefined;
    const [rows, [{ count }]] = await Promise.all([
      this.db.select({ id: orders.id })
        .from(orders)
        .innerJoin(users, eq(users.id, orders.userId))
        .where(where)
        .orderBy(desc(orders.createdAt))
        .limit(query.limit)
        .offset((query.page - 1) * query.limit),
      this.db.select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .innerJoin(users, eq(users.id, orders.userId))
        .where(where),
    ]);
    return {
      orders: await Promise.all(rows.map((row) => this.loadOrder(this.db, row.id))),
      total: count,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(count / query.limit),
    };
  }

  async getAdminOrder(orderId: string) {
    const [order] = await this.db.select({ id: orders.id }).from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) throw new NotFoundException('Order not found');
    return this.loadOrder(this.db, order.id);
  }

  async getAdminStats() {
    const [orderCounts] = await this.db
      .select({
        total: sql<number>`count(*)::int`,
        pending: sql<number>`count(*) filter (where ${orders.orderStatus} = 'PENDING')::int`,
        confirmed: sql<number>`count(*) filter (where ${orders.orderStatus} = 'CONFIRMED')::int`,
        processing: sql<number>`count(*) filter (where ${orders.orderStatus} = 'PROCESSING')::int`,
        shipped: sql<number>`count(*) filter (where ${orders.orderStatus} = 'SHIPPED')::int`,
        delivered: sql<number>`count(*) filter (where ${orders.orderStatus} = 'DELIVERED')::int`,
        cancelled: sql<number>`count(*) filter (where ${orders.orderStatus} = 'CANCELLED')::int`,
      })
      .from(orders);
    const [pendingCancellation] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(orderCancellationRequests)
      .where(eq(orderCancellationRequests.status, 'PENDING'));
    return { ...orderCounts, pendingCancellationRequests: pendingCancellation.count };
  }

  async confirm(orderId: string, adminId: string) {
    return this.db.transaction(async (tx) => {
      const order = await this.lockOrder(tx, orderId);
      if (order.orderStatus !== 'PENDING') throw new ConflictException('Only pending orders can be confirmed');
      if (order.paymentMethod === 'ONLINE' && order.paymentStatus !== 'PAID') {
        throw new ConflictException('Online orders must be paid before confirmation');
      }
      if (order.stockDeducted) throw new ConflictException('Inventory has already been deducted for this order');
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      for (const item of items) {
        const update = item.variantId
          ? await tx.update(productVariants)
              .set({ stockQuantity: sql`${productVariants.stockQuantity} - ${item.quantity}`, updatedAt: new Date() })
              .where(and(eq(productVariants.id, item.variantId), gte(productVariants.stockQuantity, item.quantity)))
              .returning({ id: productVariants.id })
          : await tx.update(products)
              .set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`, updatedAt: new Date() })
              .where(and(eq(products.id, item.productId), eq(products.publicationStatus, 'active'), gte(products.stockQuantity, item.quantity)))
              .returning({ id: products.id });
        if (!update.length) throw new ConflictException(`Insufficient inventory for ${item.productName}`);
      }
      const [updated] = await tx.update(orders)
        .set({ orderStatus: 'CONFIRMED', stockDeducted: true, updatedAt: new Date() })
        .where(eq(orders.id, orderId))
        .returning();
      await this.recordStatus(tx, orderId, order.orderStatus, 'CONFIRMED', adminId, 'ADMIN', 'Order confirmed; inventory deducted');
      return this.loadOrder(tx, updated.id);
    });
  }

  async reject(orderId: string, adminId: string, dto: AdminOrderRejectDto) {
    return this.db.transaction(async (tx) => {
      const order = await this.lockOrder(tx, orderId);
      if (order.orderStatus !== 'PENDING') throw new ConflictException('Only pending orders can be rejected');
      const [updated] = await tx.update(orders)
        .set({ orderStatus: 'CANCELLED', updatedAt: new Date() })
        .where(eq(orders.id, orderId))
        .returning();
      await this.recordStatus(tx, orderId, order.orderStatus, 'CANCELLED', adminId, 'ADMIN', dto.reason);
      return this.loadOrder(tx, updated.id);
    });
  }

  async updateStatus(orderId: string, adminId: string, dto: AdminOrderStatusDto) {
    return this.db.transaction(async (tx) => {
      const order = await this.lockOrder(tx, orderId);
      const nextAllowed: Record<string, string> = {
        CONFIRMED: 'PROCESSING',
        PROCESSING: 'SHIPPED',
        SHIPPED: 'DELIVERED',
      };
      if (nextAllowed[order.orderStatus] !== dto.status) {
        throw new BadRequestException(`Invalid order status transition: ${order.orderStatus} to ${dto.status}`);
      }
      const [updated] = await tx.update(orders)
        .set({
          orderStatus: dto.status,
          ...(dto.status === 'DELIVERED' && order.paymentMethod === 'COD' ? { paymentStatus: 'PAID' as const } : {}),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();
      await this.recordStatus(tx, orderId, order.orderStatus, dto.status, adminId, 'ADMIN', dto.note ?? null);
      return this.loadOrder(tx, updated.id);
    });
  }

  async listPendingCancellationRequests() {
    const rows = await this.db
      .select({ requestId: orderCancellationRequests.id, orderId: orders.id })
      .from(orderCancellationRequests)
      .innerJoin(orders, eq(orders.id, orderCancellationRequests.orderId))
      .where(eq(orderCancellationRequests.status, 'PENDING'))
      .orderBy(asc(orderCancellationRequests.createdAt));
    return Promise.all(rows.map(async ({ requestId, orderId }) => ({
      request: await this.db.select().from(orderCancellationRequests).where(eq(orderCancellationRequests.id, requestId)).then((items) => items[0]),
      order: await this.loadOrder(this.db, orderId),
    })));
  }

  async reviewCancellation(requestId: string, adminId: string, dto: ReviewCancellationDto) {
    return this.db.transaction(async (tx) => {
      const [request] = await tx.select().from(orderCancellationRequests)
        .where(eq(orderCancellationRequests.id, requestId)).for('update');
      if (!request) throw new NotFoundException('Cancellation request not found');
      if (request.status !== 'PENDING') throw new ConflictException('Cancellation request has already been reviewed');
      const order = await this.lockOrder(tx, request.orderId);
      if (dto.decision === 'APPROVED') {
        if (!['AWAITING_PAYMENT', 'PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.orderStatus)) {
          throw new ConflictException('This order can no longer be cancelled');
        }
        if (order.stockDeducted) {
          const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
          for (const item of items) {
            if (item.variantId) {
              const restored = await tx.update(productVariants)
                .set({ stockQuantity: sql`${productVariants.stockQuantity} + ${item.quantity}`, updatedAt: new Date() })
                .where(eq(productVariants.id, item.variantId))
                .returning({ id: productVariants.id });
              if (!restored.length) throw new ConflictException(`Could not restore inventory for ${item.productName}`);
            } else {
              await tx.update(products)
                .set({ stockQuantity: sql`${products.stockQuantity} + ${item.quantity}`, updatedAt: new Date() })
                .where(eq(products.id, item.productId));
            }
          }
        }
        await tx.update(orders)
          .set({ orderStatus: 'CANCELLED', stockDeducted: false, updatedAt: new Date() })
          .where(eq(orders.id, order.id));
        await this.recordStatus(tx, order.id, order.orderStatus, 'CANCELLED', adminId, 'ADMIN', dto.adminNote ?? 'Cancellation approved');
      }
      const [updatedRequest] = await tx.update(orderCancellationRequests)
        .set({
          status: dto.decision,
          adminNote: dto.adminNote ?? null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orderCancellationRequests.id, requestId))
        .returning();
      return { request: updatedRequest, order: await this.loadOrder(tx, order.id) };
    });
  }

  private async lockOrder(tx: Tx, orderId: string) {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for('update');
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  private async recordStatus(
    tx: Tx,
    orderId: string,
    previousStatus: typeof orders.$inferSelect.orderStatus | null,
    newStatus: typeof orders.$inferSelect.orderStatus,
    changedBy: string,
    changedByRole: string,
    note: string | null,
  ) {
    await tx.insert(orderStatusHistory).values({
      orderId, previousStatus, newStatus, changedBy, changedByRole, note,
    });
  }

  private async loadOrder(executor: any, orderId: string) {
    const [order] = await executor.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) throw new NotFoundException('Order not found');
    const [[customer], items, statusHistory, cancellationRequests] = await Promise.all([
      executor.select({ id: users.id, name: users.fullName, phone: users.phone }).from(users).where(eq(users.id, order.userId)).limit(1),
      executor.select().from(orderItems).where(eq(orderItems.orderId, orderId)).orderBy(asc(orderItems.createdAt)),
      executor.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, orderId)).orderBy(asc(orderStatusHistory.createdAt)),
      executor.select().from(orderCancellationRequests).where(eq(orderCancellationRequests.orderId, orderId)).orderBy(desc(orderCancellationRequests.createdAt)),
    ]);
    return {
      ...order,
      customer: customer ? { id: customer.id, name: customer.name, phone: customer.phone } : null,
      items,
      statusHistory,
      cancellationRequests,
      itemCount: items.reduce((total: number, item: { quantity: number }) => total + item.quantity, 0),
    };
  }
}
