# UX specification

## User flow

Arrive → understand the promise in the hero → scroll through the loop, the Boost and
the paths → register. One primary action repeated at top and bottom: "Commencer".
Secondary action: "Se connecter" in the header.

## Sections

1. Hero — one sentence on the promise, the loop as a visual, primary CTA.
2. The loop — apprendre, pratiquer, tester, identifier, réviser, progresser.
3. Learning Boost — the differentiator (CDC §88), shown as a real session example.
4. Paths — JavaScript and TypeScript available now, the rest marked "bientôt", honestly.
5. Mastery — why skill-level progress beats "chapitre lu = 100%" (CDC §11).
6. Gamification — stated as secondary, in the product's credible tone (CDC §78).
7. Final CTA + footer.

## States

- loading: none — the page is static.
- empty: a path list with nothing published still renders the section with a "bientôt"
  message rather than an empty grid.
- error: not applicable at runtime; build-time fallback covers the only failure mode.
- success: CTA navigates to `/register`.
- disabled: a path marked "bientôt" is visibly non-clickable with the reason in text.

## Responsive and accessibility requirements

- One column on mobile with the primary CTA above the fold; content measure capped for
  readability on desktop.
- Landmarks, one `h1`, logical heading order, real `<a>` for every link.
- AA contrast in both themes; decorative visuals are `aria-hidden` with text nearby.
- Animations are entrance-only, subtle, and disabled under `prefers-reduced-motion`.
- Largest Contentful Paint driven by text or an optimised image, never a heavy script.
