import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemePicker } from "@/components/theme-picker";
import { getSiteUrl } from "@/lib/site-url";
import { themeBootstrapScript } from "@/lib/theme";
import "./globals.css";

const siteName = "A Personal Blog";
const description = "Notes on the things worth noticing.";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description,
  openGraph: {
    type: "website",
    siteName,
    title: siteName,
    description,
  },
  twitter: {
    card: "summary",
    title: siteName,
    description,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="bg-bg text-fg flex min-h-full flex-col">
        <a
          href="#main-content"
          className="skip-link bg-fg text-bg fixed top-2 left-2 z-50 -translate-y-20 rounded-md px-4 py-2 focus:translate-y-0"
        >
          Skip to content
        </a>
        <header className="border-border border-b">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-4 sm:px-10">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="text-fg font-serif text-lg font-semibold tracking-tight"
              >
                {siteName}
              </Link>
              <Link
                href="/feed.xml"
                className="text-accent text-sm font-medium underline-offset-4 hover:underline"
              >
                RSS feed
              </Link>
            </div>
            <ThemePicker />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
