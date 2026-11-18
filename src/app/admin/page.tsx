import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { DeletePostForm } from "@/app/admin/post-form";
import { AdminSignOutButton } from "@/components/admin-auth-buttons";
import { getDb } from "@/db";
import { posts, users } from "@/db/schema";
import { canEditPost, requireUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage posts",
  robots: {
    index: false,
    follow: false,
  },
};

function getPostStatus(publishedAt: Date | null, now: Date) {
  if (!publishedAt) return "Draft";
  return publishedAt > now ? "Scheduled" : "Published";
}

function formatDate(value: Date | null) {
  if (!value) return "—";

  return `${value.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  })} UTC`;
}

export default async function AdminPage() {
  const user = await requireUser();
  const rows = await getDb()
    .select({ post: posts, authorName: users.displayName })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(user.role === "admin" ? undefined : eq(posts.authorId, user.id))
    .orderBy(desc(posts.updatedAt));
  const manageablePosts = rows.filter(({ post }) => canEditPost(user, post));
  const now = new Date();

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-8 sm:py-16"
    >
      <header className="border-border flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-fg font-serif text-4xl">Manage posts</h1>
          <p className="text-muted mt-3">Signed in as {user.email}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/new"
            className="bg-fg text-bg flex min-h-12 items-center justify-center rounded-md px-5 py-3 text-center font-medium"
          >
            New post
          </Link>
          <AdminSignOutButton />
        </div>
      </header>

      <section aria-labelledby="posts-heading" className="mt-8">
        <h2 id="posts-heading" className="sr-only">
          Posts you can manage
        </h2>
        {manageablePosts.length > 0 ? (
          <ul className="divide-border divide-y">
            {manageablePosts.map(({ post, authorName }) => {
              const status = getPostStatus(post.publishedAt, now);

              return (
                <li key={post.id} className="py-6 first:pt-0">
                  <article className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-fg min-w-0 font-serif text-2xl break-words">
                        {post.title}
                      </h3>
                      <span className="border-border rounded-full border px-3 py-1 text-sm">
                        {status}
                      </span>
                    </div>
                    <dl className="text-muted mt-4 grid min-w-0 grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-fg font-medium">
                          {status === "Scheduled"
                            ? "Scheduled for"
                            : "Published"}
                        </dt>
                        <dd className="mt-1 break-words">
                          {formatDate(post.publishedAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-fg font-medium">Updated</dt>
                        <dd className="mt-1 break-words">
                          {formatDate(post.updatedAt)}
                        </dd>
                      </div>
                      {user.role === "admin" && (
                        <div>
                          <dt className="text-fg font-medium">Author</dt>
                          <dd className="mt-1 break-words">
                            {authorName ?? "Unassigned"}
                          </dd>
                        </div>
                      )}
                    </dl>
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
                      <Link
                        href={`/admin/${post.id}`}
                        className="border-border inline-flex min-h-12 w-full items-center justify-center rounded-md border px-5 py-3 font-medium sm:w-auto"
                      >
                        Edit
                      </Link>
                      <DeletePostForm postId={post.id} />
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted">You have no posts to manage yet.</p>
        )}
      </section>
    </main>
  );
}
