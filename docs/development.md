# Development

## Prerequisites

| Tool | Version | Why |
| --- | --- | --- |
| Node.js | 22 LTS | runtime for both apps |
| pnpm | 9+ | workspace manager (CDC §82) |
| Docker + Compose | current | local PostgreSQL 16 and Redis 7 |

No global Nest or Next CLI is required; both are workspace dependencies.

## First run

```bash
pnpm install
cp .env.example .env                 # then fill the secrets below
docker compose -f docker/compose.yml up -d   # PostgreSQL, Redis, Mailpit
pnpm --filter @app/api migration:run
pnpm content:validate
pnpm content:sync                    # projects content/ metadata into PostgreSQL
pnpm dev                             # web on :3000, api on :3001
```

`pnpm dev` builds the shared packages, then runs both apps;
`pnpm --filter @app/web dev` runs one (build the packages first with
`pnpm --filter "./packages/*" build`).

`@app/types`, `@app/validation`, `@app/learning-engine` and `@app/content` emit
JavaScript to `dist`, because the API loads them at runtime. `@app/ui` stays
TypeScript source and is compiled by Next through `transpilePackages`.

## Environment variables

Server-side only. No credential is ever prefixed `NEXT_PUBLIC_`.

### `apps/api`

| Name | Example | Notes |
| --- | --- | --- |
| `PORT` | `3001` | |
| `DATABASE_URL` | `postgres://learn:learn@localhost:5432/learning` | |
| `REDIS_URL` | `redis://localhost:6379` | cache, rate limiting, BullMQ |
| `JWT_ACCESS_SECRET` | random 32+ bytes | short-lived access token |
| `JWT_REFRESH_SECRET` | random 32+ bytes | rotating refresh token |
| `JWT_ACCESS_TTL` | `15m` | |
| `JWT_REFRESH_TTL` | `30d` | |
| `CONTENT_DIR` | `../../content` | the only filesystem path the API reads |
| `WEB_ORIGIN` | `http://localhost:3000` | CORS allowlist, exact match |
| `APP_URL` | `http://localhost:3000` | base for links inside emails |
| `SMTP_HOST` | `localhost` | Mailpit locally, real host when deployed |
| `SMTP_PORT` | `1025` | `587` with STARTTLS when deployed |
| `SMTP_SECURE` | `false` | `true` for implicit TLS on 465 |
| `SMTP_USER` / `SMTP_PASSWORD` | — | empty locally, required when deployed |
| `MAIL_FROM` | `Learning <no-reply@example.com>` | sender identity |
| `EMAIL_VERIFICATION_TTL` | `24h` | |
| `PASSWORD_RESET_TTL` | `60m` | |

### `apps/web`

| Name | Example | Notes |
| --- | --- | --- |
| `API_BASE_URL` | `http://localhost:3001` | server-side fetches only |
| `SESSION_COOKIE_SECURE` | `false` locally, `true` deployed | |

Startup validates env with a Zod schema and exits on a missing variable rather than
failing at the first request.

## Commands

| Command | Does |
| --- | --- |
| `pnpm dev` | run web and api with hot reload |
| `pnpm build` | build every workspace package in dependency order |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` across the workspace |
| `pnpm test` | Vitest in packages and web, Jest in api |
| `pnpm test:e2e` | Playwright journeys against a running stack |
| `pnpm content:validate` | content schema and graph checks (CDC §44) |
| `pnpm content:sync` | project content metadata into PostgreSQL |
| `pnpm --filter @app/api mail:test --to <addr>` | send one probe email to verify SMTP config |
| `pnpm --filter @app/api migration:generate --name <name>` | create a migration |
| `pnpm --filter @app/api migration:run` / `migration:revert` | apply / roll back |

## Database rules

`synchronize` is `false` in every environment, local included. A schema change is a
reviewed migration or it does not exist. Reset locally with
`docker compose down -v && docker compose up -d && pnpm --filter @app/api migration:run`.

## Content workflow

1. Edit or add files under `content/`.
2. `pnpm content:validate` — it fails with `path:line — problem`.
3. `pnpm content:sync` — updates the catalog mirror and invalidates the render cache.

Adding a technology means adding a `content/<slug>/` tree and running these two
commands. No code change should be required (CDC §89.28).

## CI

On every push: install → `lint` → `typecheck` → `content:validate` → `test` → `build`.
`content:validate` failing fails the build (CDC §44). E2E runs on pull requests
against a compose-provisioned stack.

## Ports

`3000` web · `3001` api · `5432` postgres · `6379` redis ·
`1025` Mailpit SMTP · `8025` Mailpit web inbox.

## Email in development

Mailpit captures everything the API sends; open <http://localhost:8025> to read
verification and password-reset messages. No real SMTP account is used locally, and no
message ever leaves the machine. Deployed environments point `SMTP_*` at the real host.
