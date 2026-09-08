# Acceptance criteria

- [ ] Chapter and quiz endpoints match the documented payloads exactly
- [ ] A recursive assertion proves no answer key or explanation is ever serialized
- [ ] Rendered HTML is sanitized against a hostile content fixture
- [ ] Redis cache is version-keyed and provably invalidates on content change
- [ ] `content:sync` is idempotent and prunes removed content
- [ ] Path traversal and unknown slugs return the documented errors
- [ ] `apps/web` contains no filesystem read of `content/`
- [ ] Automated tests pass
