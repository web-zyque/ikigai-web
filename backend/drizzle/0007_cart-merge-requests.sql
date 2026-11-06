CREATE TABLE "cart_merge_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"guest_cart_id" uuid NOT NULL,
	"payload_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cart_merge_requests" ADD CONSTRAINT "cart_merge_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_merge_requests_user_guest_unique" ON "cart_merge_requests" USING btree ("user_id","guest_cart_id");