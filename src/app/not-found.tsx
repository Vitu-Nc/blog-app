import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 sm:px-10"
    >
      <p className="text-accent text-sm font-medium tracking-[0.18em] uppercase">
        404
      </p>
      <h1 className="text-fg mt-4 font-serif text-4xl">Post not found</h1>
      <p className="text-muted mt-4">
        This post may have moved or may not be published.
      </p>
      <Link
        href="/"
        className="text-accent mt-8 inline-block font-medium underline-offset-4 hover:underline"
      >
        Return to all writing
      </Link>
    </main>
  );
}
