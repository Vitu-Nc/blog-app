import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getAuthOptions } from "@/auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";

type EditPostActor = Pick<
  typeof users.$inferSelect,
  "id" | "role" | "status"
> & { emailVerifiedAt: Date | null };

export async function requireUser() {
  const session = await getServerSession(getAuthOptions());
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    redirect("/admin/login");
  }

  const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || user.status !== "active" || !user.emailVerifiedAt) {
    redirect("/admin/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  return user.role === "admin" ? user : null;
}

export function canEditPost(
  user: EditPostActor,
  post: { authorId: string | null } | null,
) {
  if (!post || user.status !== "active" || !user.emailVerifiedAt) {
    return false;
  }

  return user.role === "admin" || post.authorId === user.id;
}
