export default function Loading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-10 sm:py-24"
    >
      <p className="sr-only">Loading posts</p>
      <div aria-hidden="true" className="animate-pulse">
        <div className="bg-border h-4 w-32 rounded" />
        <div className="bg-border mt-6 h-12 max-w-md rounded" />
        <div className="bg-border mt-4 h-6 max-w-xl rounded" />
        <div className="border-border bg-bg mt-16 h-28 rounded border-y" />
        <div className="border-border bg-bg h-28 rounded border-b" />
      </div>
    </main>
  );
}
