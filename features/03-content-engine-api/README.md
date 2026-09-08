# Feature: Content engine API

Slice 03. The API becomes the single reader of `content/`: it parses, renders,
caches and serves chapters and quiz metadata, and projects catalog metadata into
PostgreSQL via `content:sync`.

Depends on: 02. Blocks: 05, 06, 08.
Reference: `docs/decisions.md` — NestJS owns `content/`.
