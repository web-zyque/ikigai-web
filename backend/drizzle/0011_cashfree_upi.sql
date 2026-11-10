CREATE TYPE "public"."payment_attempt_status" AS ENUM('CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."payment_webhook_status" AS ENUM('RECEIVED', 'PROCESSED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'AWAITING_PAYMENT' BEFORE 'PENDING';--> statement-breakpoint
CREATE TABLE "payment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"provider" varchar(20) DEFAULT 'CASHFREE' NOT NULL,
	"payment_method" varchar(20) DEFAULT 'UPI' NOT NULL,
	"provider_order_id" varchar(45) NOT NULL,
	"provider_payment_id" varchar(80),
	"payment_session_id" text,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"status" "payment_attempt_status" DEFAULT 'CREATED' NOT NULL,
	"idempotency_key" varchar(100) NOT NULL,
	"session_expires_at" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_attempts_provider_order_id_unique" UNIQUE("provider_order_id"),
	CONSTRAINT "payment_attempts_provider_payment_id_unique" UNIQUE("provider_payment_id"),
	CONSTRAINT "payment_attempts_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "payment_refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_attempt_id" uuid NOT NULL,
	"provider_refund_id" varchar(80),
	"provider_payment_id" varchar(80) NOT NULL,
	"refund_amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"status" "refund_status" DEFAULT 'PENDING' NOT NULL,
	"idempotency_key" varchar(100) NOT NULL,
	"reason" text,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_refunds_provider_refund_id_unique" UNIQUE("provider_refund_id"),
	CONSTRAINT "payment_refunds_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "payment_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" varchar(20) DEFAULT 'CASHFREE' NOT NULL,
	"event_key" varchar(128) NOT NULL,
	"event_id" varchar(128),
	"provider_order_id" varchar(45),
	"provider_payment_id" varchar(80),
	"event_type" varchar(100) NOT NULL,
	"processing_status" "payment_webhook_status" DEFAULT 'RECEIVED' NOT NULL,
	"payload_hash" varchar(64) NOT NULL,
	"error_message" text,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	CONSTRAINT "payment_webhook_events_event_key_unique" UNIQUE("event_key")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "cart_item_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_buy_now" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_attempts" ADD CONSTRAINT "payment_attempts_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_payment_attempt_id_payment_attempts_id_fk" FOREIGN KEY ("payment_attempt_id") REFERENCES "public"."payment_attempts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payment_attempts_order_created_idx" ON "payment_attempts" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "payment_attempts_provider_order_idx" ON "payment_attempts" USING btree ("provider_order_id");--> statement-breakpoint
CREATE INDEX "payment_refunds_order_created_idx" ON "payment_refunds" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "payment_refunds_status_idx" ON "payment_refunds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_provider_order_idx" ON "payment_webhook_events" USING btree ("provider_order_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_status_received_idx" ON "payment_webhook_events" USING btree ("processing_status","received_at");