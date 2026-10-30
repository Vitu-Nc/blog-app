"use client";

import { signIn, signOut } from "next-auth/react";

const buttonClassName =
  "rounded-md border border-border px-4 py-2 font-medium text-fg hover:bg-border/50";

export function AdminSignInButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        className={buttonClassName}
        onClick={() => void signIn("google", { callbackUrl: "/admin" })}
      >
        Continue with Google
      </button>
      <button
        type="button"
        className={buttonClassName}
        onClick={() => void signIn("github", { callbackUrl: "/admin" })}
      >
        Continue with GitHub
      </button>
    </div>
  );
}

export function AdminSignOutButton() {
  return (
    <button
      type="button"
      className="bg-fg text-bg rounded-md px-4 py-2 font-medium hover:opacity-80"
      onClick={() => void signOut({ callbackUrl: "/admin/login" })}
    >
      Sign out
    </button>
  );
}
