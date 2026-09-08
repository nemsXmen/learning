# Test plan

## Unit

- Each schema accepts a valid fixture and rejects each individual field violation.
- Frontmatter parser: missing field, wrong type, unknown level, out-of-range difficulty.
- Section checker: chapter missing `Erreurs fréquentes` fails with `MISSING_SECTION`.
- Quiz parser: `answer` index out of range, missing `explanation`, unknown type.
- Graph builder: cycle detection, unknown prerequisite, unknown skill.
- Content hash is stable across runs and changes when a byte changes.

## Integration

- Valid seed content loads into a complete graph with expected counts.
- A corrupt fixture tree produces every expected issue code in one run.

## End to end

- `pnpm content:validate` exits 0 on seed content, 1 on the corrupt fixture tree.

## Edge cases and regression risks

- Two chapters sharing a slug in different technologies (allowed) versus in the same
  technology (rejected).
- Windows line endings and non-ASCII paths.
- A self-referencing skill prerequisite.
