# Personal Blog

A read-only personal blog built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, and Drizzle ORM.

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to a PostgreSQL database.
3. Set `NEXT_PUBLIC_SITE_URL` to the public origin of the blog (for example, `https://example.com`). Development defaults to `http://localhost:3000`; production logs a warning when this value is missing.
4. Apply the checked-in SQL migration with `npm run db:migrate`.
5. Load the three sample posts with `npm run db:seed`.
6. Start the development server with `npm run dev`.

The homepage and post pages use 60-second ISR. Production builds statically render database-backed pages, so the configured PostgreSQL database must be reachable and contain the schema during `npm run build`.

Post content is rendered as Markdown with GitHub Flavored Markdown support. Raw HTML is not enabled, and rendered Markdown is sanitized. RSS is available at `/feed.xml`; the sitemap and feed include published posts only.

## Reader themes

The theme picker offers System, Default, Dark, Sepia, and Custom. System follows the device color-scheme preference; other choices are saved in the browser's local storage. Custom asks only for a background color and automatically derives readable foreground and muted colors. No account or database setting is involved.

To test the themes, use the header picker to select each preset, change the Custom background color, reload to check persistence, and choose System (or clear the saved theme) to verify the operating-system preference is followed. Check keyboard navigation and visible focus indicators while testing.

## Admin sign-in

Admin access uses Auth.js with JWT sessions and GitHub/Google OAuth. No auth database tables or adapter are used. Configure these values in `.env.local` for local development and in the Vercel project environment for production:

- `AUTH_SECRET`: a private random signing secret (generate one with `openssl rand -base64 32`).
- `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`: the GitHub OAuth app client ID and secret.
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`: the Google OAuth client ID and secret.
- `ADMIN_EMAILS`: comma-separated allowed email addresses; matching is case-insensitive.
- `NEXTAUTH_URL`: `http://localhost:3000` locally and `https://blog-app-rust-seven-88.vercel.app` in production.

Create a GitHub OAuth app under **Settings → Developer settings → OAuth Apps**. GitHub OAuth apps have one callback URL each, so create one app for local development and another for production. Set each app's homepage and callback URL to the matching environment:

- Local homepage: `http://localhost:3000`; callback: `http://localhost:3000/api/auth/callback/github`
- Production homepage: `https://blog-app-rust-seven-88.vercel.app`; callback: `https://blog-app-rust-seven-88.vercel.app/api/auth/callback/github`

Set the matching app's client ID and secret in each environment. The app requests `user:email` and verifies the primary GitHub email through GitHub's authenticated email API before allowing access.

Create Google OAuth credentials in Google Cloud Console under **APIs & Services → Credentials** as OAuth client IDs for Web applications. Add the appropriate local and production origins and authorized redirect URIs:

- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://blog-app-rust-seven-88.vercel.app/api/auth/callback/google`

Add only trusted email addresses to `ADMIN_EMAILS`. Google sign-in requires Google's `email_verified` claim. In production, authentication fails with a clear configuration error if `AUTH_SECRET` or a non-empty `ADMIN_EMAILS` is missing.

## Database commands

- `npm run db:generate` creates a readable SQL migration from `src/db/schema.ts`.
- `npm run db:migrate` applies pending migrations.
- `npm run db:seed` inserts three sample posts; rerunning it does not duplicate existing slugs.

The initial migration is in [`drizzle/0000_initial_posts.sql`](./drizzle/0000_initial_posts.sql).

## Validation

- `npm run lint`
- `npm run format:check`
- `npm run build`
