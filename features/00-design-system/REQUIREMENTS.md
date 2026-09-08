# Requirements

## Goal

Every screen in the product is assembled from an existing, accessible, themed
component. Design is a dependency that is already satisfied when a feature starts, not
a blocking step discovered at the end of it.

## Scope

### Must

- Design tokens in `packages/ui`: colour (dark and light), typography scale, spacing,
  radius, elevation, motion durations. Dark is the reference theme (CDC §60).
- Core primitives, shipped in slice 00: `Button`, `Card`, `Badge`, `ProgressBar`,
  `ProgressRing`, `Tabs`, `Modal`, `Drawer`, `Tooltip`, `Toast`, `CodeBlock`.
- State patterns as reusable components, not per-feature improvisation: `Skeleton`,
  `EmptyState`, `ErrorState`, `Spinner`, so CDC §85's checklist is cheap to satisfy.
- App shell: header (streak, XP, level, theme toggle, account), primary navigation,
  responsive sidebar and mobile drawer, skip-to-content link.
- A `/design` gallery route in `apps/web`: every component, every variant, every state,
  both themes, dev-only and `noindex`. This is the surface where progress is visible
  continuously.
- Accessibility baseline enforced in the primitives themselves: focus ring, keyboard
  interaction, `aria` wiring, AA contrast in both themes, `prefers-reduced-motion`.

### Later, with their feature (progressive delivery)

`ChapterCard` (05) · `QuizCard` and `QuestionCard` (08) · `SkillCard` and `MasteryCard`
(10) · `BoostCard` (12) · `AchievementCard` (11). Each is added to `packages/ui` and to
the gallery by its own slice, reusing the tokens and primitives from here.

### Must not

- No business logic, no data fetching and no API type inside `packages/ui`.
- No component built without a screen that needs it — the list above is the ceiling.
- No second styling system alongside Tailwind, and no component library dependency.
- No colour, spacing or duration literal outside the token file.
