import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug, getPublishedSlugs } from "@/lib/posts";

export const revalidate = 60;

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getPublishedSlugs();
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:px-10 sm:py-20">
      <Link
        href="/"
        className="text-sm font-medium text-emerald-800 hover:underline focus-visible:underline"
      >
        &larr; All writing
      </Link>
      <article className="mt-12">
        <header className="border-b border-stone-200 pb-8">
          <time
            dateTime={post.publishedAt.toISOString()}
            className="text-sm text-stone-500"
          >
            {post.publishedAt.toLocaleDateString("en-US", {
              dateStyle: "long",
              timeZone: "UTC",
            })}
          </time>
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-stone-950 sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">
            {post.excerpt}
          </p>
        </header>
        <div className="mt-8 text-lg leading-8 text-stone-700">
          {post.content.split(/\n{2,}/).map((paragraph, index) => (
            <p key={index} className="mt-6 first:mt-0">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
