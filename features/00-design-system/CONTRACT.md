# Contract

## Inputs and outputs

`packages/ui` exports React components and a token module. It has no runtime
dependency beyond React.

`src/tokens.css` is the single source: an `@theme` block of CSS custom properties
that Tailwind reads directly, plus the light-theme and reduced-motion overrides.
`src/tokens.ts` exports *references* to those variables, never copies, so an inline
style or an SVG stroke cannot drift from the stylesheet:

```ts
export const tokens = {
  color: { bg, surface, surfaceSunken, surfaceRaised, border, borderStrong,
           text, textMuted, textSubtle, accent, accentSoft, accentAlt, accentOn,
           accentSurface, accentBorder, success, warning, danger, streak },
  radius, font, motion,
}; // every value is `var(--…)`
```

The package ships TypeScript source (it carries `'use client'` directives) and is
consumed through Next's `transpilePackages`. The Node-consumed packages — `types`,
`validation`, `learning-engine`, `content` — emit JavaScript to `dist` instead.

## API or event boundary

No network boundary. The contract with feature teams is the component API:

- Every interactive component accepts `disabled`, an accessible name where it has no
  text, and forwards `ref` and unknown props to its root element.
- Every data-shaped component accepts explicit `loading`, `empty` and `error` inputs
  rather than deciding for itself what an absent value means.
- No component reads global state, the router, or a query client.

## Validation and errors

Component props are typed; invalid combinations are unrepresentable rather than
validated at runtime.

## Invariants

- Every colour used by a component comes from `tokens`; a hard-coded hex fails lint.
- Every component renders correctly in both themes and under `prefers-reduced-motion`.
- Every interactive element is reachable and operable by keyboard with a visible focus
  ring, in both themes.
- The gallery renders every component and every documented state; a component that is
  not in the gallery is not done.
