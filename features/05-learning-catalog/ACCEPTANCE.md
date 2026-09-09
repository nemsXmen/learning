# Acceptance criteria

- [x] Catalog endpoints match the contract, scoped to the authenticated user
- [x] Lock state and its reason are computed server-side and surfaced in the UI
- [x] Progress aggregation is consistent across chapter, module and technology
- [x] Continue action resumes the correct chapter
- [x] Loading, empty, error, success and locked states are implemented
- [x] Roadmap is accessible without relying on the visual sequence
- [ ] Direct URL access to a locked chapter is refused server-side - the chapter page
      and the lock check on the content endpoint belong to slice 06; the catalog
      already computes and returns the lock
- [x] Automated tests pass
