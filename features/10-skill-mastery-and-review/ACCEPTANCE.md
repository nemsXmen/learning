# Acceptance criteria

- [ ] Mastery and review scheduling update transactionally with the graded attempt -
      they update synchronously in the same request, but not in one transaction;
      see the deviation recorded in CONTRACT.md
- [x] All calculation delegates to `packages/learning-engine`; no formula in this module
- [x] Every mastery change stores an explainable reason
- [x] Weak-skill and due-review endpoints return ordered, explained results
- [x] Replay from attempt history is idempotent and reproduces live state - verified
      against the live database: replaying a learner with 6 attempts, 1 completion and
      1 Boost session rebuilt their recorded fingerprint exactly, and a second run left
      it unchanged
- [ ] Empty and error states defined for the consuming surfaces - the API returns
      zeroed skills and empty lists; no UI consumes them until slice 13
- [x] Automated tests pass
