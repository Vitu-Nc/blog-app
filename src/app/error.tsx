"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main
      id="main-content"
      role="alert"
      className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 sm:px-10"
    >
      <h1 className="text-fg font-serif text-4xl">Something went wrong</h1>
      <p className="text-muted mt-4">
        This page could not be loaded. Please try again.
      </p>
      {error.digest && (
        <p className="text-subtle mt-2 text-sm">Reference: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="bg-fg text-bg mt-8 rounded-md px-4 py-2 font-medium hover:opacity-80"
      >
        Try again
      </button>
    </main>
  );
}
