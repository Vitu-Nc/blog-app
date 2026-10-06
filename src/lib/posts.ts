import { and, desc, eq, isNotNull, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { posts } from "@/db/schema";

export async function getPublishedPosts() {
  const publishedPosts = await getDb()
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(
      and(isNotNull(posts.publishedAt), lte(posts.publishedAt, new Date())),
    )
    .orderBy(desc(posts.publishedAt));

  return publishedPosts.flatMap(({ publishedAt, ...post }) =>
    publishedAt ? [{ ...post, publishedAt }] : [],
  );
}

export async function getPublishedSlugs() {
  return await getDb()
    .select({ slug: posts.slug })
    .from(posts)
    .where(
      and(isNotNull(posts.publishedAt), lte(posts.publishedAt, new Date())),
    );
}

export async function getPublishedPostBySlug(slug: string) {
  const [post] = await getDb()
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      content: posts.content,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(
      and(
        eq(posts.slug, slug),
        isNotNull(posts.publishedAt),
        lte(posts.publishedAt, new Date()),
      ),
    )
    .limit(1);

  if (!post?.publishedAt) return undefined;

  const { publishedAt, ...rest } = post;
  return { ...rest, publishedAt };
}