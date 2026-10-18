import type { Metadata } from "next";
import { AdminSignInButtons } from "@/components/admin-auth-buttons";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-10 sm:py-24"
    >
      <h1 className="text-fg font-serif text-4xl">Admin sign in</h1>
      <p className="text-muted mt-4">
        Sign in with an account that has been added to the admin allowlist.
      </p>
      <div className="mt-8">
        <AdminSignInButtons />
      </div>
    </main>
  );
}
