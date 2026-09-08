# UX specification

## User flow

No UI. The engine's user-facing obligation is the `reason` field: it must be phrased so
slices 12 and 13 can show it verbatim, in the product's credible tone (CDC §78) — for
example "Ton score est de 48% et tu as échoué 3 fois sur cette compétence", never
"🔥🔥🔥 INCROYABLE".

## States

Recommendation outputs must cover the states the UI has to render: nothing due, one
clear action, several competing actions, and everything mastered.

## Responsive and accessibility requirements

Not applicable. Reasons must be plain text with no markup or emoji dependency, so they
render identically to a screen reader.
