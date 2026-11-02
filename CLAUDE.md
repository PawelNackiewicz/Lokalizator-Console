# CLAUDE.md

Monorepo (Turborepo + pnpm): `apps/api` (NestJS + Drizzle + Postgres), `apps/web` (React +
Vite + TanStack Router/Query + Tailwind v4 + shadcn/ui + Leaflet), `packages/shared-types`
(zod contracts shared by both), `e2e` (Playwright). The README explains every design
decision — read the relevant section before changing auth, env loading or routing.

## Setup

```bash
pnpm install
cp .env.example .env          # one .env at the repo root serves every package
pnpm docker:up                # Postgres only
pnpm db:migrate && pnpm db:seed
pnpm dev                      # api :3000, web :5173 — login admin / admin
```

## Definition of done

A change is finished only when both pass:

```bash
pnpm verify      # prettier --check + lint + typecheck + unit tests, whole monorepo
pnpm test:e2e    # builds api + web, runs Playwright against them (needs a seeded DB)
```

Never weaken, skip or delete a test to make it pass. If a test is wrong, say so and why.
Run `pnpm format` before committing — `verify` fails on unformatted files.

## Where things go

- **API contract changes start in `packages/shared-types`.** Add or change the zod schema
  there first, then use it in both the controller (`ZodValidationPipe`) and the web form.
  Never duplicate a schema or hand-write a type that a schema already infers.
- **New API endpoint** → controller + service in `apps/api/src/<feature>/`, Swagger
  decorators on every route (English, see below), a unit test for any mapping or logic.
- **Every endpoint is protected by default** (global `JwtCookieGuard`). `@Public()` is a
  security decision: only add it when the ticket asks for a public endpoint, and add the
  route to `PUBLIC_ENDPOINTS` in `e2e/tests/api-guard.spec.ts` in the same change.
- **DB schema change** → edit `apps/api/src/db/schema.ts`, then `pnpm db:generate` and
  commit the generated migration. Never hand-edit files in `apps/api/drizzle/`.
- **New page** → a file in `apps/web/src/routes/` (file-based routing; protected pages are
  nested under `_authed`). `routeTree.gen.ts` is generated — never edit it.
- **Feature UI and data fetching** → `apps/web/src/features/<feature>/` with TanStack Query
  options in `<feature>.queries.ts`. `components/ui/` holds shadcn/ui primitives only.
- **New user-visible behaviour** → an e2e test in `e2e/tests/`. Select elements by role and
  accessible name (`getByRole`, `getByLabel`), not by CSS classes.
- **New env variable** → `.env.example`, `apps/api/src/config/env.schema.ts` (API) and
  `globalEnv` in `turbo.json`. Browser-visible variables need the `VITE_` prefix.

## High-risk areas

Changes here need a human reviewer — keep them minimal and call them out in the PR:
`apps/api/src/auth/**`, `apps/api/src/config/**`, `apps/api/src/db/schema.ts`,
`apps/api/drizzle/**`, `packages/shared-types/**`, `.github/**`, `turbo.json`,
`pnpm-workspace.yaml`, `e2e/tests/api-guard.spec.ts`.

Do not add dependencies unless the ticket requires it; prefer what is already installed.

## Comments

**English only.** A Polish comment is a bug — never write one, and translate any you
find while editing a file. This applies to every commentable file: `.ts`, `.tsx`,
`.css`, `.js`, `.env*`, `.gitignore`, `.npmrc`, `docker-compose.yml`.

**Write as few comments as possible.** Default to none. Code, names and types carry the
explanation; a comment restating them is noise that rots on the next edit.

Delete rather than translate when a comment only says what the line below already says:

```ts
// Bad — the signature already says this
/** Returns the user by id. */
findById(id: string) {}

// Bad — restates the call
// Register the cookie parser
app.use(cookieParser());
```

Keep a comment only when it records something the code cannot:

- **why**, not what — a non-obvious tradeoff, or a constraint imposed from outside
  (`// CORS with credentials requires an exact origin — browsers reject a wildcard`)
- a deliberate omission or a known limit (`// No refresh tokens — see the TODO in README`)
- a subtle invariant a future edit would break
  (`// The guard reads the token from the cookie, so the parser must run before routing.`)

No section-divider banners (`// --- Users ---`), no commented-out code, no changelog or
"added by" notes — git covers that.

User-facing strings (validation messages, UI copy, seed data) stay Polish. Only comments
and API documentation are English.

## API documentation (Swagger/OpenAPI)

**English only**, same rule as comments: `DocumentBuilder().setTitle()/.setDescription()`,
`@ApiOperation` summaries, `@ApiResponse`/`@ApiParam`/`@ApiBody` descriptions, and every
`example` value inside a schema are developer-facing docs, not runtime output — write them
in English even though the API's actual responses stay Polish. An `example` illustrates the
shape of a field, it does not need to match the literal string the API returns.
