import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { getPublishedPostBySlug, getPublishedSlugs } from "@/lib/posts";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 60;
export const dynamicParams = true;

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const markdownComponents: Components = {
  img: ({ src, alt }) =>
    typeof src === "string" ? (
      <Image
        src={src}
        alt={alt ?? ""}
        width={1200}
        height={675}
        unoptimized
        className="h-auto max-w-full rounded-lg"
      />
    ) : null,
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

  const postUrl = new URL(
    `/blog/${encodeURIComponent(post.slug)}`,
    getSiteUrl(),
  );

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: "A Personal Blog",
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const wordCount = post.content.trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const postUrl = new URL(
    `/blog/${encodeURIComponent(post.slug)}`,
    getSiteUrl(),
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: postUrl.toString(),
  };

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:px-10 sm:py-20"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Link
        href="/"
        className="text-accent text-sm font-medium hover:underline focus-visible:underline"
      >
        &larr; All writing
      </Link>
      <article className="mt-12">
        <header className="border-border border-b pb-8">
          <time
            dateTime={post.publishedAt.toISOString()}
            className="text-subtle text-sm"
          >
            {post.publishedAt.toLocaleDateString("en-US", {
              dateStyle: "long",
              timeZone: "UTC",
            })}
          </time>
          <p className="text-muted mt-2 text-sm">{readingMinutes} min read</p>
          <h1 className="text-fg mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <p className="text-muted mt-5 text-lg leading-8">{post.excerpt}</p>
        </header>
        <div className="markdown-content text-fg mt-8 text-lg leading-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={markdownComponents}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
