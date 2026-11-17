ALTER TABLE "admins" ADD COLUMN "phone" text;
--> statement-breakpoint
CREATE UNIQUE INDEX "admins_phone_unique" ON "admins" ("phone") WHERE "phone" IS NOT NULL;
