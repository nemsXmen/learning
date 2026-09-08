# Acceptance criteria

- [x] `pnpm install && pnpm build` succeeds from a clean clone
- [x] `docker compose up -d` then `migration:run` provisions the database
- [x] `pnpm dev` serves web on :3000 and api on :3001
- [x] `GET /health` reports database and Redis state accurately, including failure
- [x] Missing environment variables abort startup with the variable named
- [ ] Light and dark themes render with AA contrast and visible focus
- [x] CI runs lint, typecheck, content:validate, test and build, and fails on each
- [x] `docs/development.md` matches the commands that actually exist
