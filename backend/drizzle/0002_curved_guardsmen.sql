CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_admin_id_unique" UNIQUE("admin_id"),
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
