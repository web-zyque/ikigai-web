ALTER TABLE "cart_items" ADD COLUMN "size" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "size" varchar(100);--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "size" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "warranty_type" varchar(50);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "warranty_duration" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "warranty_unit" varchar(20);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "size_type" varchar(50);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sizes" json;