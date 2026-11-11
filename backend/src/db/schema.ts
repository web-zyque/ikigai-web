import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  pgEnum,
  json,
  uniqueIndex,
  index,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const publicationStatusEnum = pgEnum('publication_status', [
  'active',
  'draft',
]);
export const inventoryStatusEnum = pgEnum('inventory_status', [
  'in_stock',
  'low_stock',
  'out_of_stock',
]);
export const adminRoleEnum = pgEnum('admin_role', ['ADMIN', 'STAFF']);
export const orderStatusEnum = pgEnum('order_status', [
  'AWAITING_PAYMENT', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED',
]);
export const paymentMethodEnum = pgEnum('payment_method', ['COD', 'ONLINE']);
export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING', 'PAID', 'FAILED', 'REFUNDED',
]);
export const cancellationStatusEnum = pgEnum('cancellation_status', [
  'PENDING', 'APPROVED', 'REJECTED',
]);
export const paymentAttemptStatusEnum = pgEnum('payment_attempt_status', [
  'CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED',
]);
export const paymentWebhookStatusEnum = pgEnum('payment_webhook_status', [
  'RECEIVED', 'PROCESSED', 'FAILED',
]);
export const refundStatusEnum = pgEnum('refund_status', [
  'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED',
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userAddresses = pgTable(
  'user_addresses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    fullName: varchar('full_name', { length: 120 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    addressLine1: varchar('address_line_1', { length: 255 }).notNull(),
    addressLine2: varchar('address_line_2', { length: 255 }),
    landmark: varchar('landmark', { length: 255 }),
    city: varchar('city', { length: 100 }).notNull(),
    state: varchar('state', { length: 100 }).notNull(),
    postalCode: varchar('postal_code', { length: 20 }).notNull(),
    country: varchar('country', { length: 100 }).default('India').notNull(),
    addressType: varchar('address_type', { length: 20 }).default('Home').notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('user_addresses_user_id_idx').on(table.userId),
    uniqueIndex('user_addresses_one_default_per_user_idx')
      .on(table.userId)
      .where(sql`${table.isDefault} = true`),
  ],
);

export const otps = pgTable('otps', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: text('phone').notNull(),
  codeHash: text('code_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  consumed: boolean('consumed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const admins = pgTable('admins', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminId: text('admin_id').notNull().unique(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: adminRoleEnum('role').default('ADMIN').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('categories_name_lower_idx').on(sql`lower(trim(${table.name}))`),
  ],
);

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  sku: text('sku').notNull().unique(),
  categoryId: uuid('category_id')
    .references(() => categories.id)
    .notNull(),
  brand: text('brand'),
  description: text('description'),

  sellingPrice: decimal('selling_price', { precision: 12, scale: 2 }).notNull(),
  mrpPrice: decimal('mrp_price', { precision: 12, scale: 2 }),
  acceptCod: boolean('accept_cod').default(false).notNull(),
  acceptUpi: boolean('accept_upi').default(true).notNull(),
  gstPercentage: decimal('gst_percentage', { precision: 5, scale: 2 }).default(
    '18.00',
  ),

  stockQuantity: integer('stock_quantity').default(0).notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(5).notNull(),

  publicationStatus: publicationStatusEnum('publication_status')
    .default('active')
    .notNull(),

  vehicleCompatibility: json('vehicle_compatibility').$type<string[]>(),

  productType: text('product_type'),
  color: text('color'),
  dimensions: text('dimensions'),
  material: text('material'),
  warranty: text('warranty'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  colorName: text('color_name').notNull(),
  sku: text('sku'),
  stockQuantity: integer('stock_quantity').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productImages = pgTable('product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, {
    onDelete: 'cascade',
  }),
  imageUrl: text('image_url').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id'),
  isMainImage: boolean('is_main_image').default(false).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  altText: text('alt_text'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const carts = pgTable(
  'carts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
);

export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    cartId: uuid('cart_id')
      .references(() => carts.id, { onDelete: 'cascade' })
      .notNull(),
    productId: uuid('product_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),
    variantId: uuid('variant_id').references(() => productVariants.id, {
      onDelete: 'cascade',
    }),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
);

export const cartMergeRequests = pgTable(
  'cart_merge_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    guestCartId: uuid('guest_cart_id').notNull(),
    payloadHash: text('payload_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('cart_merge_requests_user_guest_unique').on(
      table.userId,
      table.guestCartId,
    ),
  ],
);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderNumber: varchar('order_number', { length: 32 }).notNull().unique(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    idempotencyKey: varchar('idempotency_key', { length: 100 }).notNull(),
    subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
    discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).notNull().default('0'),
    deliveryFee: decimal('delivery_fee', { precision: 12, scale: 2 }).notNull().default('0'),
    totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
    couponCode: varchar('coupon_code', { length: 40 }),
    shippingAddress: json('shipping_address').$type<{
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2: string | null;
      landmark: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      addressType: string;
    }>().notNull(),
    paymentMethod: paymentMethodEnum('payment_method').default('COD').notNull(),
    paymentStatus: paymentStatusEnum('payment_status').default('PENDING').notNull(),
    orderStatus: orderStatusEnum('order_status').default('PENDING').notNull(),
    stockDeducted: boolean('stock_deducted').default(false).notNull(),
    isBuyNow: boolean('is_buy_now').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('orders_user_created_idx').on(table.userId, table.createdAt),
    index('orders_status_created_idx').on(table.orderStatus, table.createdAt),
    uniqueIndex('orders_user_idempotency_unique').on(table.userId, table.idempotencyKey),
  ],
);

export const paymentAttempts = pgTable(
  'payment_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
    provider: varchar('provider', { length: 20 }).default('CASHFREE').notNull(),
    paymentMethod: varchar('payment_method', { length: 20 }).default('UPI').notNull(),
    providerOrderId: varchar('provider_order_id', { length: 45 }).notNull().unique(),
    providerPaymentId: varchar('provider_payment_id', { length: 80 }).unique(),
    paymentSessionId: text('payment_session_id'),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('INR').notNull(),
    status: paymentAttemptStatusEnum('status').default('CREATED').notNull(),
    idempotencyKey: varchar('idempotency_key', { length: 100 }).notNull().unique(),
    sessionExpiresAt: timestamp('session_expires_at'),
    failureReason: text('failure_reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('payment_attempts_order_created_idx').on(table.orderId, table.createdAt),
    index('payment_attempts_provider_order_idx').on(table.providerOrderId),
    uniqueIndex('payment_attempts_active_order_unique').on(table.orderId)
      .where(sql`${table.status} in ('CREATED', 'PENDING')`),
  ],
);

export const paymentTransactions = pgTable(
  'payment_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    paymentAttemptId: uuid('payment_attempt_id').references(() => paymentAttempts.id, { onDelete: 'restrict' }).notNull(),
    providerPaymentId: varchar('provider_payment_id', { length: 80 }).notNull().unique(),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('INR').notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    paymentGroup: varchar('payment_group', { length: 30 }),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('payment_transactions_attempt_created_idx').on(table.paymentAttemptId, table.createdAt)],
);

export const paymentWebhookEvents = pgTable(
  'payment_webhook_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    provider: varchar('provider', { length: 20 }).default('CASHFREE').notNull(),
    eventKey: varchar('event_key', { length: 128 }).notNull().unique(),
    eventId: varchar('event_id', { length: 128 }),
    providerOrderId: varchar('provider_order_id', { length: 45 }),
    providerPaymentId: varchar('provider_payment_id', { length: 80 }),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    processingStatus: paymentWebhookStatusEnum('processing_status').default('RECEIVED').notNull(),
    payloadHash: varchar('payload_hash', { length: 64 }).notNull(),
    errorMessage: text('error_message'),
    receivedAt: timestamp('received_at').defaultNow().notNull(),
    processedAt: timestamp('processed_at'),
  },
  (table) => [
    index('payment_webhook_events_provider_order_idx').on(table.providerOrderId),
    index('payment_webhook_events_status_received_idx').on(table.processingStatus, table.receivedAt),
  ],
);

export const paymentRefunds = pgTable(
  'payment_refunds',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
    paymentAttemptId: uuid('payment_attempt_id').references(() => paymentAttempts.id, { onDelete: 'restrict' }).notNull(),
    merchantRefundId: varchar('merchant_refund_id', { length: 80 }).notNull().unique(),
    providerRefundId: varchar('provider_refund_id', { length: 80 }).unique(),
    providerPaymentId: varchar('provider_payment_id', { length: 80 }).notNull(),
    refundAmount: decimal('refund_amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('INR').notNull(),
    status: refundStatusEnum('status').default('PENDING').notNull(),
    idempotencyKey: varchar('idempotency_key', { length: 100 }).notNull().unique(),
    reason: text('reason'),
    failureReason: text('failure_reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('payment_refunds_order_created_idx').on(table.orderId, table.createdAt),
    index('payment_refunds_status_idx').on(table.status),
  ],
);

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull(),
    productId: uuid('product_id')
      .references(() => products.id, { onDelete: 'restrict' })
      .notNull(),
    cartItemId: uuid('cart_item_id'),
    variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'restrict' }),
    productName: varchar('product_name', { length: 255 }).notNull(),
    sku: varchar('sku', { length: 100 }).notNull(),
    imageUrl: text('image_url'),
    selectedVariant: json('selected_variant').$type<{
      id: string;
      colorName: string;
      sku: string | null;
    } | null>(),
    quantity: integer('quantity').notNull(),
    unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
    totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('order_items_order_id_idx').on(table.orderId),
    index('order_items_product_id_idx').on(table.productId),
  ],
);

export const orderCancellationRequests = pgTable(
  'order_cancellation_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'restrict' })
      .notNull(),
    reason: text('reason').notNull(),
    status: cancellationStatusEnum('status').default('PENDING').notNull(),
    adminNote: text('admin_note'),
    reviewedBy: uuid('reviewed_by').references(() => admins.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('order_cancellation_requests_user_idx').on(table.userId, table.createdAt),
    uniqueIndex('order_cancellation_requests_active_order_unique')
      .on(table.orderId)
      .where(sql`${table.status} = 'PENDING'`),
  ],
);

export const orderStatusHistory = pgTable(
  'order_status_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .references(() => orders.id, { onDelete: 'cascade' })
      .notNull(),
    previousStatus: orderStatusEnum('previous_status'),
    newStatus: orderStatusEnum('new_status').notNull(),
    changedBy: uuid('changed_by').notNull(),
    changedByRole: varchar('changed_by_role', { length: 20 }).notNull(),
    note: text('note'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('order_status_history_order_created_idx').on(table.orderId, table.createdAt)],
);
