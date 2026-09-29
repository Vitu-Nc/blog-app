import Link from "next/link";
import { getPublishedPosts } from "@/lib/posts";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-10 sm:py-24">
      <header className="mb-16 border-b border-stone-200 pb-10">
        <p className="mb-5 text-sm font-medium tracking-[0.18em] text-emerald-800 uppercase">
          Notes &amp; essays
        </p>
        <h1 className="font-serif text-5xl leading-tight tracking-tight text-stone-950 sm:text-6xl">
          A Personal Blog
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">
          Thoughts on making things, paying attention, and everything in
          between.
        </p>
      </header>

      <section aria-labelledby="recent-posts-heading">
        <h2
          id="recent-posts-heading"
          className="mb-8 text-sm font-semibold tracking-[0.14em] text-stone-500 uppercase"
        >
          Recent writing
        </h2>
        {posts.length > 0 ? (
          <ul className="divide-y divide-stone-200">
            {posts.map((post) => (
              <li key={post.id} className="py-7 first:pt-0">
                <article>
                  <time
                    dateTime={post.publishedAt.toISOString()}
                    className="text-sm text-stone-500"
                  >
                    {post.publishedAt.toLocaleDateString("en-US", {
                      dateStyle: "long",
                      timeZone: "UTC",
                    })}
                  </time>
                  <h3 className="mt-2 font-serif text-2xl leading-snug text-stone-950">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="decoration-emerald-700 decoration-2 underline-offset-4 hover:underline focus-visible:underline"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 leading-7 text-stone-600">
                    {post.excerpt}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-600">There are no published posts yet.</p>
        )}
      </section>
    </main>
  );
}
