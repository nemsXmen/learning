# Acceptance criteria

- [x] Chapter and quiz endpoints match the documented payloads exactly
- [x] A recursive assertion proves no answer key or explanation is ever serialized
- [x] Rendered HTML is sanitized against a hostile content fixture
- [x] Redis cache is version-keyed and provably invalidates on content change
- [x] `content:sync` is idempotent and prunes removed content
- [x] Path traversal and unknown slugs return the documented errors
- [x] `apps/web` contains no filesystem read of `content/`
- [x] Automated tests pass
