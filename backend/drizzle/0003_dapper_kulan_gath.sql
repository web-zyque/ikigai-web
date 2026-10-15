CREATE TYPE "public"."admin_role" AS ENUM('ADMIN', 'STAFF');--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "role" "admin_role" DEFAULT 'ADMIN' NOT NULL;