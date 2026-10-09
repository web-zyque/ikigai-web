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
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const otps = pgTable('otps', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: text('phone').notNull(),
  codeHash: text('code_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  consumed: boolean('consumed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const publicationStatusEnum = pgEnum('publication_status', ['active', 'draft']);
export const inventoryStatusEnum = pgEnum('inventory_status', ['in_stock', 'low_stock', 'out_of_stock']);

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  sku: text('sku').notNull().unique(),
  categoryId: uuid('category_id').references(() => categories.id).notNull(),
  brand: text('brand'),
  description: text('description'),
  
  sellingPrice: decimal('selling_price', { precision: 12, scale: 2 }).notNull(),
  mrpPrice: decimal('mrp_price', { precision: 12, scale: 2 }),
  gstPercentage: decimal('gst_percentage', { precision: 5, scale: 2 }).default('18.00'),
  
  stockQuantity: integer('stock_quantity').default(0).notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(5).notNull(),
  
  publicationStatus: publicationStatusEnum('publication_status').default('active').notNull(),
  
  vehicleCompatibility: json('vehicle_compatibility').$type<string[]>(),
  
  productType: text('product_type'),
  color: text('color'),
  dimensions: text('dimensions'),
  material: text('material'),
  warranty: text('warranty'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productImages = pgTable('product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  isMainImage: boolean('is_main_image').default(false).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  altText: text('alt_text'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
