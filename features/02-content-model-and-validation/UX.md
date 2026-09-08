# UX specification

## User flow

The user is a content author at a terminal. Flow: edit content → run
`pnpm content:validate` → read the issue list → fix → re-run.

## States

- success: `✓ 5 chapters, 12 skills, 28 questions validated`.
- error: one line per issue, grouped by file, with path, line and a plain-language fix.
- empty: an empty content directory is reported explicitly, not treated as valid.
- loading / disabled: not applicable.

## Responsive and accessibility requirements

Terminal output stays legible without colour (colour is emphasis only) and is not
truncated when piped to a file or CI log.
