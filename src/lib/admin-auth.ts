import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { getAuthOptions, isAdminEmail } from "@/auth";

export async function requireAdminSession() {
  const session = await getServerSession(getAuthOptions());
  const email = session?.user?.email;

  if (!email || !isAdminEmail(email)) {
    redirect("/admin/login");
  }

  return { session, email };
}
