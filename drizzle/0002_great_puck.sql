ALTER TABLE "posts" ADD COLUMN "first_published_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "posts"
SET "first_published_at" = "published_at"
WHERE "published_at" IS NOT NULL AND "published_at" <= now();