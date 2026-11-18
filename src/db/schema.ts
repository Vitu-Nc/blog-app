import { sql } from "drizzle-orm";
import {
  check,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "author"]);
export const userStatus = pgEnum("user_status", ["active", "disabled"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    emailVerifiedAt: timestamp("email_verified_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    displayName: text("display_name").notNull(),
    slug: text("slug").notNull().unique(),
    role: userRole("role").notNull().default("author"),
    status: userStatus("status").notNull().default("active"),
    legacyPostsAssignedAt: timestamp("legacy_posts_assigned_at", {
      withTimezone: true,
      mode: "date",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    check("users_email_lowercase", sql`${table.email} = lower(${table.email})`),
    check(
      "users_slug_not_reserved",
      sql`lower(${table.slug}) not in ('admin', 'api', 'blog', 'authors', 'feed', 'sitemap', 'robots')`,
    ),
    check("users_slug_lowercase", sql`${table.slug} = lower(${table.slug})`),
  ],
);

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  authorId: uuid("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  firstPublishedAt: timestamp("first_published_at", {
    withTimezone: true,
    mode: "date",
  }),
  publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .default(sql`now()`),
});
