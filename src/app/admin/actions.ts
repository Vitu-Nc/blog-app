"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { canEditPost, requireUser } from "@/lib/admin-auth";
import { isPostSlugLocked } from "@/lib/post-slug-lock";
import {
  getPostFieldErrors,
  validatePostForm,
  type PostActionState,
  type PostFormInput,
} from "@/lib/post-validation";

function fieldErrors(
  parsedIssues: Parameters<typeof getPostFieldErrors>[0],
): PostActionState {
  return {
    fieldErrors: getPostFieldErrors(parsedIssues),
    message: "Please correct the highlighted fields.",
  };
}

function isSlugUniqueViolation(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  const constraint =
    "constraint_name" in error
      ? error.constraint_name
      : "constraint" in error
        ? error.constraint
        : undefined;

  return error.code === "23505" && constraint === "posts_slug_unique";
}

function publicationDate(input: PostFormInput, now: Date): Date | null {
  if (input.intent === "draft") {
    return null;
  }

  return input.intent === "publish" ? now : new Date(input.publishedAt);
}

function revalidatePostPaths(...slugs: string[]) {
  revalidatePath("/", "page");
  for (const slug of new Set(slugs)) {
    revalidatePath(`/blog/${encodeURIComponent(slug)}`);
  }
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  revalidatePath("/admin");
}

export async function createPost(
  _previousState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const user = await requireUser();
  const parsed = validatePostForm(formData);

  if (!parsed.success) {
    return fieldErrors(parsed.error.issues);
  }

  const now = new Date();
  const publishedAt = publicationDate(parsed.data, now);
  let post: typeof posts.$inferSelect;

  try {
    [post] = await getDb()
      .insert(posts)
      .values({
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        authorId: user.id,
        firstPublishedAt: publishedAt,
        publishedAt,
        updatedAt: now,
      })
      .returning();
  } catch (error) {
    if (isSlugUniqueViolation(error)) {
      return {
        fieldErrors: { slug: ["A post with this slug already exists."] },
        message: "Please choose a different slug.",
      };
    }

    throw error;
  }

  revalidatePostPaths(post.slug);
  redirect(`/admin/${post.id}`);
}

export async function updatePost(
  postId: string,
  _previousState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const user = await requireUser();
  if (!z.uuid().safeParse(postId).success) {
    return {
      fieldErrors: {},
      message: "Post not found or you are not allowed to edit it.",
    };
  }

  const [post] = await getDb()
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post || !canEditPost(user, post)) {
    return {
      fieldErrors: {},
      message: "Post not found or you are not allowed to edit it.",
    };
  }

  if (isPostSlugLocked(post.firstPublishedAt, post.publishedAt)) {
    formData.set("slug", post.slug);
  }

  const parsed = validatePostForm(formData);
  if (!parsed.success) {
    return fieldErrors(parsed.error.issues);
  }

  const now = new Date();
  const publishedAt = publicationDate(parsed.data, now);
  const firstPublishedAt =
    post.firstPublishedAt ?? post.publishedAt ?? publishedAt;
  let updatedPost: typeof posts.$inferSelect;

  try {
    [updatedPost] = await getDb()
      .update(posts)
      .set({
        title: parsed.data.title,
        slug: parsed.data.slug,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        firstPublishedAt,
        publishedAt,
        updatedAt: now,
      })
      .where(eq(posts.id, post.id))
      .returning();
  } catch (error) {
    if (isSlugUniqueViolation(error)) {
      return {
        fieldErrors: { slug: ["A post with this slug already exists."] },
        message: "Please choose a different slug.",
      };
    }

    throw error;
  }

  revalidatePostPaths(post.slug, updatedPost.slug);
  redirect(`/admin/${updatedPost.id}`);
}

export async function deletePost(
  postId: string,
  formData: FormData,
): Promise<never> {
  const user = await requireUser();
  if (!z.uuid().safeParse(postId).success) {
    notFound();
  }

  const [post] = await getDb()
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post || !canEditPost(user, post)) {
    notFound();
  }
  if (
    !z
      .object({ confirmDelete: z.literal("delete") })
      .safeParse({ confirmDelete: formData.get("confirmDelete") }).success
  ) {
    notFound();
  }

  await getDb().delete(posts).where(eq(posts.id, post.id));
  revalidatePostPaths(post.slug);
  redirect("/admin");
}
