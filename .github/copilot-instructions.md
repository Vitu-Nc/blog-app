# Personal blog project rules

Project: personal blog — Next.js (App Router) + TypeScript strict + Tailwind + PostgreSQL (Drizzle ORM).

- Work on a branch per task; never push to main directly; open a PR when done.
- Server components by default; use `"use client"` only when necessary.
- No API routes unless asked — fetch data in server components. RSS at `/feed.xml` is the only permitted route handler.
- Use ISR (`revalidate`) for blog pages.
- Generate Drizzle migrations as readable SQL files; clearly show any migration in the PR description.
- No new dependencies without justification in the PR description.
- Run `npm run lint` and `npm run build` before finishing; fix all errors.
- Minimal, clean design — Tailwind only, no UI component libraries.
- Theming uses CSS variables and `data-theme`, with no theme library.
- Database schema is managed exclusively through Drizzle migrations in `drizzle/` — never modify the database directly.
- The Neon CLI/MCP manages Neon infrastructure only (branches, connection config) — never use it to create/modify tables or data.
- `DATABASE_URL` comes from `.env.local` (never commit it). If it's missing, stop and tell me — do not code around it.
