# Requirements

## Goal

A developer clones the repository, runs the documented commands, and gets a running
web app, a running API, a migrated database and a green CI pipeline.

## Scope

### Must

- pnpm workspace with `apps/web`, `apps/api` and `packages/{types,validation,learning-engine,content,ui,config}`.
- `apps/api`: NestJS bootstrapped, TypeORM configured with `synchronize: false`,
  Redis connection, health endpoint, Zod validation pipe, env schema that fails fast.
- `apps/web`: Next.js App Router, Tailwind, dark and light theme tokens, root layout,
  server-side API client reading `API_BASE_URL`.
- `docker/compose.yml` with PostgreSQL 16 and Redis 7.
- Root scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `content:validate`, `content:sync`.
- CI: install, lint, typecheck, content:validate, test, build.
- `.env.example` covering every variable in `docs/development.md`.

### Must not

- No product entity, endpoint or page beyond health and an empty shell.
- No build orchestrator (Turborepo/Nx) — see `docs/decisions.md`.
- No dependency outside the CDC stack without a decision entry.
