ALTER TABLE "categories" DROP CONSTRAINT "categories_name_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "categories_name_lower_idx" ON "categories" USING btree (lower(trim("name")));