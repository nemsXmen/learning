# Test plan

## Unit

- Each primitive renders every documented variant and state.
- `Button`: loading disables interaction and announces a busy state.
- `Modal` and `Drawer`: focus trap, focus restoration on close, `Escape` closes,
  background scroll locked.
- `Tabs`: arrow-key navigation, `aria-selected`, roving tabindex.
- `Toast`: announced politely, dismissible by keyboard, auto-dismiss pausable.
- `ProgressRing` and `ProgressBar`: expose a text value and an accessible name.
- Motion tokens resolve to zero duration under `prefers-reduced-motion`.

## Integration

- The `/design` gallery renders every exported component in both themes without error.
- Theme switch updates every component in one pass with no flash of the wrong theme.

## End to end

- Axe scan of the gallery passes in dark and light with no serious violation.
- Keyboard-only traversal of the gallery reaches every interactive element.

## Edge cases and regression risks

- A hard-coded colour reintroduced outside tokens — caught by a lint rule with a test.
- Long labels, very small viewports (320px), and 200% browser zoom.
- Nested overlays: a modal opened from a drawer.
