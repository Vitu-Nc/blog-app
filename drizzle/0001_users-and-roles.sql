CREATE TYPE "public"."user_role" AS ENUM('admin', 'author');
--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'disabled');
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_verified_at" timestamp with time zone NOT NULL,
	"display_name" text NOT NULL,
	"slug" text NOT NULL,
	"role" "user_role" DEFAULT 'author' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"legacy_posts_assigned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_slug_unique" UNIQUE("slug"),
	CONSTRAINT "users_email_lowercase" CHECK ("email" = lower("email")),
	CONSTRAINT "users_slug_not_reserved" CHECK (lower("slug") not in ('admin', 'api', 'blog', 'authors', 'feed', 'sitemap', 'robots')),
	CONSTRAINT "users_slug_lowercase" CHECK ("slug" = lower("slug"))
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "author_id" uuid;
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
