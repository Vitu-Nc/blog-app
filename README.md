# Personal Blog

A read-only personal blog built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, and Drizzle ORM.

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to a PostgreSQL database.
3. Apply the checked-in SQL migration with `npm run db:migrate`.
4. Load the three sample posts with `npm run db:seed`.
5. Start the development server with `npm run dev`.

The homepage and post pages use 60-second ISR. Production builds statically render database-backed pages, so the configured PostgreSQL database must be reachable and contain the schema during `npm run build`.

## Database commands

- `npm run db:generate` creates a readable SQL migration from `src/db/schema.ts`.
- `npm run db:migrate` applies pending migrations.
- `npm run db:seed` inserts three sample posts; rerunning it does not duplicate existing slugs.

The initial migration is in [`drizzle/0000_initial_posts.sql`](./drizzle/0000_initial_posts.sql).

## Validation

- `npm run lint`
- `npm run format:check`
- `npm run build`
