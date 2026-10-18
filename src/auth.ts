import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

function getAdminAllowlist() {
  const configuredEmails = process.env.ADMIN_EMAILS;
  const emails = new Set(
    (configuredEmails ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );

  if (process.env.NODE_ENV === "production" && emails.size === 0) {
    throw new Error(
      "Admin authentication is not configured: set ADMIN_EMAILS in the production environment.",
    );
  }

  return emails;
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error(
      "Admin authentication is not configured: set AUTH_SECRET in the production environment.",
    );
  }

  return secret;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function getAllowlistedGitHubEmail(
  accessToken: string,
  adminEmails: Set<string>,
) {
  const response = await fetch("https://api.github.com/user/emails", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload: unknown = await response.json();

  if (!Array.isArray(payload)) {
    return null;
  }

  const verifiedEmail = payload.find(
    (entry: unknown) =>
      isRecord(entry) &&
      entry.primary === true &&
      entry.verified === true &&
      typeof entry.email === "string" &&
      adminEmails.has(entry.email.trim().toLowerCase()),
  );

  return isRecord(verifiedEmail) && typeof verifiedEmail.email === "string"
    ? verifiedEmail.email.trim().toLowerCase()
    : null;
}

export function isAdminEmail(email: string) {
  return getAdminAllowlist().has(email.trim().toLowerCase());
}

export function getAuthOptions(): NextAuthOptions {
  const adminEmails = getAdminAllowlist();

  return {
    secret: getAuthSecret(),
    session: {
      strategy: "jwt",
    },
    providers: [
      GitHubProvider({
        clientId: process.env.AUTH_GITHUB_ID ?? "",
        clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
        authorization: {
          params: {
            scope: "read:user user:email",
          },
        },
      }),
      GoogleProvider({
        clientId: process.env.AUTH_GOOGLE_ID ?? "",
        clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
      }),
    ],
    pages: {
      signIn: "/admin/login",
    },
    callbacks: {
      async signIn({ account, profile, user }) {
        if (!account) {
          return false;
        }

        if (account.provider === "google") {
          const email =
            isRecord(profile) &&
            profile.email_verified === true &&
            typeof profile.email === "string" &&
            profile.email.trim().toLowerCase();

          if (!email || !adminEmails.has(email)) {
            return false;
          }

          user.email = email;
          return true;
        }

        if (account.provider === "github" && account.access_token) {
          const email = await getAllowlistedGitHubEmail(
            account.access_token,
            adminEmails,
          );

          if (!email) {
            return false;
          }

          user.email = email;
          return true;
        }

        return false;
      },
    },
  };
}
