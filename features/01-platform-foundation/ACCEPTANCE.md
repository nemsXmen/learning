# Acceptance criteria

- [ ] `pnpm install && pnpm build` succeeds from a clean clone
- [ ] `docker compose up -d` then `migration:run` provisions the database
- [ ] `pnpm dev` serves web on :3000 and api on :3001
- [ ] `GET /health` reports database and Redis state accurately, including failure
- [ ] Missing environment variables abort startup with the variable named
- [ ] Light and dark themes render with AA contrast and visible focus
- [ ] CI runs lint, typecheck, content:validate, test and build, and fails on each
- [ ] `docs/development.md` matches the commands that actually exist
