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
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED',
]);
export const paymentMethodEnum = pgEnum('payment_method', ['COD', 'ONLINE']);
export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING', 'PAID', 'FAILED', 'REFUNDED',
]);
export const cancellationStatusEnum = pgEnum('cancellation_status', [
  'PENDING', 'APPROVED', 'REJECTED',
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

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

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
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('orders_user_created_idx').on(table.userId, table.createdAt),
    index('orders_status_created_idx').on(table.orderStatus, table.createdAt),
    uniqueIndex('orders_user_idempotency_unique').on(table.userId, table.idempotencyKey),
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
