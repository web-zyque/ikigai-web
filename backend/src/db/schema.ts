import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
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
