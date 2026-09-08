# Contract

## Inputs and outputs

Inputs: environment variables from `docs/development.md`. Outputs: two running
processes and a set of buildable packages.

## API or event boundary

- `GET /health` → `200 {"status":"ok","db":"up","redis":"up"}`; `503` with the failing
  dependency named if either is down. Unauthenticated, not rate limited, `noindex`.

## Validation and errors

- Env is parsed by a Zod schema at boot; a missing or malformed variable exits non-zero
  with the variable name. The process never starts half-configured.
- Dependency failure is reported, never swallowed.

## Invariants

- Package dependencies point downward only: apps → validation → types;
  api → content → types; learning-engine → types.
- `synchronize` is false in every environment.
- No credential is exposed under `NEXT_PUBLIC_*`.
