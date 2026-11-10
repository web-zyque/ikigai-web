ALTER TABLE "payment_refunds" ADD COLUMN "merchant_refund_id" varchar(80);--> statement-breakpoint
UPDATE "payment_refunds" SET "merchant_refund_id" = 'legacy_' || "id"::text WHERE "merchant_refund_id" IS NULL;--> statement-breakpoint
ALTER TABLE "payment_refunds" ALTER COLUMN "merchant_refund_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "payment_attempts_active_order_unique" ON "payment_attempts" USING btree ("order_id") WHERE "payment_attempts"."status" in ('CREATED', 'PENDING');--> statement-breakpoint
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_merchant_refund_id_unique" UNIQUE("merchant_refund_id");
