import type { Metadata } from "next";
import Link from "next/link";
import { PostForm } from "@/app/admin/post-form";
import { requireUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New post",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewPostPage() {
  await requireUser();

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-16"
    >
      <Link
        href="/admin"
        className="text-accent inline-flex min-h-12 items-center font-medium hover:underline"
      >
        &larr; All posts
      </Link>
      <h1 className="text-fg mt-5 font-serif text-4xl">New post</h1>
      <PostForm />
    </main>
  );
}
