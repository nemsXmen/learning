# Contract

## Inputs and outputs

- Input: `CONTENT_DIR` tree.
- Output: `ContentGraph { technologies, modules, chapters, skills, edges, quizzes }`
  where every node carries `id`, `contentPath` and `contentVersion`, or a
  `ValidationIssue[]` of `{ path, line, code, message }`.

## API or event boundary

Library and CLI only:
- `loadContentGraph(dir): Promise<Result<ContentGraph, ValidationIssue[]>>`
- `pnpm content:validate` → exit 0 or 1, issues on stdout.

## Validation and errors

Issue codes are stable and named: `DUPLICATE_ID`, `DUPLICATE_SLUG`, `UNKNOWN_SKILL`,
`UNKNOWN_PREREQUISITE`, `CYCLIC_SKILL_GRAPH`, `MISSING_FRONTMATTER_FIELD`,
`MISSING_SECTION`, `INVALID_QUIZ`, `ANSWER_OUT_OF_RANGE`, `MISSING_EXPLANATION`,
`BROKEN_LINK`. All issues are collected; the validator never stops at the first.

## Invariants

- Loading is pure with respect to the filesystem: same tree, same graph, same hashes.
- A chapter always resolves to exactly one module and one technology.
- The skill graph is a DAG.
