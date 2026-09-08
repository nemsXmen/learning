# Test plan

## Unit

- Env schema: accepts a complete env, rejects each missing variable with its name.
- API client: sends the configured base URL and propagates non-2xx as typed errors.

## Integration

- `GET /health` returns 200 with PostgreSQL and Redis up.
- `GET /health` returns 503 naming the dependency when Redis is stopped.
- Migration run then revert leaves a clean schema.

## End to end

- `pnpm build` succeeds from a clean install.
- CI pipeline passes on a clean checkout.

## Edge cases and regression risks

- Package cycle introduced by mistake — enforced by a lint rule on import boundaries.
- `synchronize` re-enabled by a later config change — asserted in a test.
- A secret leaking into a `NEXT_PUBLIC_*` variable — asserted against `.env.example`.
