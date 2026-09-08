# Test plan

## Unit

- Scroll-depth to progress mapping, including short chapters that cannot scroll.
- Throttling emits at most the configured rate and always flushes the final value.
- Outline component marks the active heading correctly.

## Integration

- Page renders a seed chapter with sidebar status derived from real progress.
- Locked chapter returns the explanatory page, not content.
- Progress route handler forwards the session and clamps out-of-range input.

## End to end

- Read a chapter, scroll to the end, reload: progress persisted.
- Mark complete, sidebar status becomes `✓`, next chapter is reachable.
- Keyboard-only journey from `/learn` to completing a chapter.
- Axe scan passes on the chapter page in both themes.

## Edge cases and regression risks

- Very long chapter performance and time-to-first-byte with streaming.
- Chapter edited between two visits (`contentVersion` change) mid-read.
- Two tabs reporting progress for the same chapter.
