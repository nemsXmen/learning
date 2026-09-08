# Acceptance criteria

- [x] Tokens define colour, typography, spacing, radius, elevation and motion for both themes
- [x] The eleven core primitives and the four state components ship and are exported
- [x] App shell is responsive with a working sidebar, mobile drawer and skip link
- [x] `/design` gallery renders every component, variant and state, in both themes, `noindex`
- [ ] Lint fails on a colour, spacing or duration literal outside the token file
- [ ] Axe passes on the gallery in both themes; keyboard traversal verified
- [x] Reduced motion suppresses animation while preserving end state
- [x] `packages/ui` contains no data fetching, API type or business rule
- [x] Feature-specific cards are documented as owned by their own slice, not built here
- [x] Automated tests pass
