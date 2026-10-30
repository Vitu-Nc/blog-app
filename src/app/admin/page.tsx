import type { Metadata } from "next";
import { AdminSignOutButton } from "@/components/admin-auth-buttons";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const { email } = await requireAdminSession();

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:px-10 sm:py-24"
    >
      <h1 className="text-fg font-serif text-4xl">Admin</h1>
      <p className="text-muted mt-4">Signed in as {email}</p>
      <div className="mt-8">
        <AdminSignOutButton />
      </div>
    </main>
  );
}
