"use client";

import Link from "next/link";
import { useActionState, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import { createPost, deletePost, updatePost } from "@/app/admin/actions";
import type { PostActionState } from "@/lib/post-validation";
import { isPostSlugLocked } from "@/lib/post-slug-lock";

type PostFormValues = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: Date | null;
  firstPublishedAt: Date | null;
  updatedAt: Date;
};

type PostFormProps = {
  post?: PostFormValues;
};

type DeletePostFormProps = {
  postId: string;
  separated?: boolean;
};

const initialPostActionState: PostActionState = {
  fieldErrors: {},
  message: null,
};

function suggestSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toLocalDateTime(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function subscribeToNothing() {
  return () => {};
}

function FieldErrors({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;

  return (
    <ul id={id} className="text-sm text-red-700" aria-live="polite">
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}

export function PostForm({ post }: PostFormProps) {
  const action = post ? updatePost.bind(null, post.id) : createPost;
  const [state, formAction, pending] = useActionState(
    action,
    initialPostActionState,
  );
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [scheduledLocal, setScheduledLocal] = useState<string | null>(null);
  const browserScheduledLocal = useSyncExternalStore(
    subscribeToNothing,
    () =>
      post?.publishedAt ? toLocalDateTime(post.publishedAt.toISOString()) : "",
    () => "",
  );
  const scheduledValue = scheduledLocal ?? browserScheduledLocal;
  const [scheduledIso, setScheduledIso] = useState(
    post?.publishedAt?.toISOString() ?? "",
  );
  const slugLocked = post
    ? isPostSlugLocked(post.firstPublishedAt, post.publishedAt)
    : false;

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited && !slugLocked) {
      setSlug(suggestSlug(value));
    }
  }

  function handleScheduledChange(value: string) {
    setScheduledLocal(value);
    const date = new Date(value);
    setScheduledIso(
      value && !Number.isNaN(date.getTime()) ? date.toISOString() : "",
    );
  }

  const errors = state.fieldErrors;

  return (
    <div className="mt-8 space-y-8">
      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            maxLength={200}
            required
            value={title}
            onChange={(event) => handleTitleChange(event.currentTarget.value)}
            aria-invalid={Boolean(errors.title?.length)}
            aria-describedby={errors.title?.length ? "title-errors" : undefined}
            className="border-border bg-bg text-fg min-h-12 w-full rounded-md border px-3 py-2"
          />
          <FieldErrors id="title-errors" errors={errors.title} />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="block font-medium">
            Slug
          </label>
          <div className="text-muted border-border flex min-h-12 min-w-0 items-center rounded-md border">
            <span className="shrink-0 pl-3">/blog/</span>
            <input
              id="slug"
              name="slug"
              type="text"
              maxLength={180}
              required
              readOnly={slugLocked}
              value={slug}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(event.currentTarget.value);
              }}
              aria-invalid={Boolean(errors.slug?.length)}
              aria-describedby={errors.slug?.length ? "slug-errors" : undefined}
              className="text-fg min-w-0 flex-1 bg-transparent px-2 py-2 read-only:opacity-70"
            />
          </div>
          {slugLocked && (
            <p className="text-muted text-sm">
              The slug is locked because this post has been scheduled or
              published.
            </p>
          )}
          <FieldErrors id="slug-errors" errors={errors.slug} />
        </div>

        <div className="space-y-2">
          <label htmlFor="excerpt" className="block font-medium">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            maxLength={500}
            required
            rows={3}
            value={excerpt}
            onChange={(event) => setExcerpt(event.currentTarget.value)}
            aria-invalid={Boolean(errors.excerpt?.length)}
            aria-describedby={
              errors.excerpt?.length ? "excerpt-errors" : undefined
            }
            className="border-border bg-bg text-fg min-h-24 w-full rounded-md border px-3 py-2"
          />
          <FieldErrors id="excerpt-errors" errors={errors.excerpt} />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="block font-medium">
            Content (Markdown)
          </label>
          <textarea
            id="content"
            name="content"
            maxLength={100_000}
            rows={16}
            value={content}
            onChange={(event) => setContent(event.currentTarget.value)}
            aria-invalid={Boolean(errors.content?.length)}
            aria-describedby={
              errors.content?.length ? "content-errors" : undefined
            }
            className="border-border bg-bg text-fg min-h-80 w-full rounded-md border px-3 py-2 font-mono text-sm leading-6"
          />
          <FieldErrors id="content-errors" errors={errors.content} />
        </div>

        <div className="space-y-2">
          <label htmlFor="scheduled-at" className="block font-medium">
            Schedule for
          </label>
          <input
            id="scheduled-at"
            type="datetime-local"
            value={scheduledValue}
            onChange={(event) =>
              handleScheduledChange(event.currentTarget.value)
            }
            aria-invalid={Boolean(errors.publishedAt?.length)}
            aria-describedby={
              errors.publishedAt?.length ? "published-at-errors" : undefined
            }
            className="border-border bg-bg text-fg min-h-12 w-full rounded-md border px-3 py-2"
          />
          <input type="hidden" name="publishedAt" value={scheduledIso} />
          <FieldErrors id="published-at-errors" errors={errors.publishedAt} />
          <p className="text-muted text-sm">
            The selected local time is converted to an ISO timestamp before it
            is sent.
          </p>
        </div>

        {state.message && (
          <p className="text-sm" role="status">
            {state.message}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={pending}
            className="bg-fg text-bg min-h-12 w-full rounded-md px-5 py-3 font-medium disabled:opacity-60 sm:w-auto"
          >
            {pending ? "Saving…" : "Save draft"}
          </button>
          <button
            type="submit"
            name="intent"
            value="publish"
            disabled={pending}
            className="border-border min-h-12 w-full rounded-md border px-5 py-3 font-medium disabled:opacity-60 sm:w-auto"
          >
            Publish now
          </button>
          <button
            type="submit"
            name="intent"
            value="schedule"
            disabled={pending}
            className="border-border min-h-12 w-full rounded-md border px-5 py-3 font-medium disabled:opacity-60 sm:w-auto"
          >
            Schedule
          </button>
          <Link
            href="/admin"
            className="border-border flex min-h-12 w-full items-center justify-center rounded-md border px-5 py-3 text-center font-medium sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>

      {post && <DeletePostForm postId={post.id} separated />}
    </div>
  );
}

export function DeletePostForm({
  postId,
  separated = false,
}: DeletePostFormProps) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Delete this post? This action cannot be undone.")) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={deletePost.bind(null, postId)}
      onSubmit={confirmDelete}
      className={separated ? "border-border border-t pt-6" : "w-full sm:w-auto"}
    >
      <input type="hidden" name="confirmDelete" value="delete" />
      <button
        type="submit"
        className="min-h-12 w-full rounded-md border border-red-700 px-5 py-3 font-medium text-red-700 sm:w-auto"
      >
        Delete
      </button>
    </form>
  );
}
