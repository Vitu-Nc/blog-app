import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-10 sm:py-24"
    >
      <header className="border-border mb-16 border-b pb-10">
        <p className="text-accent mb-5 text-sm font-medium tracking-[0.18em] uppercase">
          Notes &amp; essays
        </p>
        <h1 className="text-fg font-serif text-5xl leading-tight tracking-tight sm:text-6xl">
          A Personal Blog
        </h1>
        <p className="text-muted mt-5 max-w-xl text-lg leading-8">
          Thoughts on making things, paying attention, and everything in
          between.
        </p>
      </header>

      <section aria-labelledby="recent-posts-heading">
        <h2
          id="recent-posts-heading"
          className="text-subtle mb-8 text-sm font-semibold tracking-[0.14em] uppercase"
        >
          Recent writing
        </h2>
        {posts.length > 0 ? (
          <ul className="divide-border divide-y">
            {posts.map((post) => (
              <li key={post.id} className="py-7 first:pt-0">
                <article>
                  <time
                    dateTime={post.publishedAt.toISOString()}
                    className="text-subtle text-sm"
                  >
                    {post.publishedAt.toLocaleDateString("en-US", {
                      dateStyle: "long",
                      timeZone: "UTC",
                    })}
                  </time>
                  <h3 className="text-fg mt-2 font-serif text-2xl leading-snug">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="decoration-accent decoration-2 underline-offset-4 hover:underline focus-visible:underline"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-muted mt-2 leading-7">{post.excerpt}</p>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">There are no published posts yet.</p>
        )}
      </section>
    </main>
  );
}
