import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getAuthOptions } from "@/auth";
import { getDb } from "@/db";
import { posts, users } from "@/db/schema";

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

export async function canEditPost(postId: string) {
  const user = await requireUser();

  if (user.role === "admin") {
    return true;
  }

  const [post] = await getDb()
    .select({ authorId: posts.authorId })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  return post?.authorId === user.id;
}
