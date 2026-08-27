# CLAUDE.md

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
- a subtle invariant a future edit would break (`// The guard reads the token from the
  cookie, so the parser must run before routing.`)

No section-divider banners (`// --- Users ---`), no commented-out code, no changelog or
"added by" notes — git covers that.

User-facing strings (validation messages, UI copy, seed data) stay Polish. Only comments
are English.
