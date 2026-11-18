import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PostForm } from "@/app/admin/post-form";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { canEditPost, requireUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit post",
  robots: {
    index: false,
    follow: false,
  },
};

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const [post] = await getDb()
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!canEditPost(user, post ?? null)) {
    notFound();
  }

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-16"
    >
      <h1 className="text-fg font-serif text-4xl">Edit post</h1>
      <p className="text-muted mt-3 break-words">
        Last updated{" "}
        {post.updatedAt.toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "UTC",
        })}{" "}
        UTC
      </p>
      <PostForm post={post} />
    </main>
  );
}
