# Test plan

## Unit

- Markdown rendering: headings get stable ids; code blocks get the declared language.
- Sanitizer strips `<script>`, `onerror`, `javascript:` hrefs from a hostile fixture.
- Outline extraction matches the fixture's heading order and depth.
- Cache key changes when content changes and only then.

## Integration

- Chapter endpoint returns the full documented payload for seed content.
- Quiz endpoint response contains no `answer` and no `explanation` key at any depth.
- Unknown slug → 404 `CONTENT_NOT_FOUND`.
- Path traversal attempt (`../`) is rejected, not resolved.
- `content:sync` run twice produces identical rows; a removed chapter is removed.

## End to end

- Boot with an invalid content tree fails with a named path.
- Cold then warm request return byte-identical bodies.

## Edge cases and regression risks

- A chapter whose module was renamed between syncs.
- Very large chapter body rendering time stays within budget.
- Concurrent syncs must not interleave into a partial catalog.
