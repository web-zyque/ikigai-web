ALTER TABLE "products" ADD COLUMN "accept_cod" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "accept_cod" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "accept_upi" boolean DEFAULT true NOT NULL;
