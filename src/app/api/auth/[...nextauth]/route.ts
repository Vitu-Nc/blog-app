import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { getAuthOptions } from "@/auth";

type AuthRouteContext = {
  params: Promise<{ nextauth: string[] }>;
};

function handleAuth(request: NextRequest, context: AuthRouteContext) {
  return NextAuth(request, context, getAuthOptions());
}

export { handleAuth as GET, handleAuth as POST };
