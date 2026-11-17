import { eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { posts, users } from "@/db/schema";
import { createUniqueUserSlug } from "@/lib/user-slug";

type VerifiedUserInput = {
  email: string;
  displayName: string;
  isAdmin: boolean;
};

async function assignLegacyPosts(
  tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0],
  user: typeof users.$inferSelect,
) {
  if (
    user.role !== "admin" ||
    user.status !== "active" ||
    user.legacyPostsAssignedAt
  ) {
    return user;
  }

  const assignedAt = new Date();

  await tx
    .update(posts)
    .set({ authorId: user.id })
    .where(isNull(posts.authorId));

  const [updatedUser] = await tx
    .update(users)
    .set({ legacyPostsAssignedAt: assignedAt, updatedAt: assignedAt })
    .where(eq(users.id, user.id))
    .returning();

  return updatedUser;
}

export async function provisionVerifiedUser({
  email: suppliedEmail,
  displayName: suppliedDisplayName,
  isAdmin,
}: VerifiedUserInput) {
  const email = suppliedEmail.trim().toLowerCase();
  const displayName =
    suppliedDisplayName.trim() || email.split("@", 1)[0] || "Author";
  const db = getDb();

  if (!email) {
    throw new Error("A verified email is required to provision a user.");
  }

  return db.transaction(async (tx) => {
    let [user] = await tx
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      await tx.execute(sql`select pg_advisory_xact_lock(1280262980, 0)`);
      [user] = await tx
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    }

    const now = new Date();

    if (user) {
      [user] = await tx
        .update(users)
        .set({
          emailVerifiedAt: now,
          displayName,
          ...(isAdmin ? { role: "admin" as const } : {}),
          updatedAt: now,
        })
        .where(eq(users.id, user.id))
        .returning();

      return assignLegacyPosts(tx, user);
    }

    const slug = await createUniqueUserSlug(displayName, async (candidate) => {
      const [match] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.slug, candidate))
        .limit(1);

      return Boolean(match);
    });

    [user] = await tx
      .insert(users)
      .values({
        email,
        emailVerifiedAt: now,
        displayName,
        slug,
        role: isAdmin ? "admin" : "author",
      })
      .returning();

    return assignLegacyPosts(tx, user);
  });
}
