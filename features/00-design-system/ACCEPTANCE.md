# Acceptance criteria

- [ ] Tokens define colour, typography, spacing, radius, elevation and motion for both themes
- [ ] The eleven core primitives and the four state components ship and are exported
- [ ] App shell is responsive with a working sidebar, mobile drawer and skip link
- [ ] `/design` gallery renders every component, variant and state, in both themes, `noindex`
- [ ] Lint fails on a colour, spacing or duration literal outside the token file
- [ ] Axe passes on the gallery in both themes; keyboard traversal verified
- [ ] Reduced motion suppresses animation while preserving end state
- [ ] `packages/ui` contains no data fetching, API type or business rule
- [ ] Feature-specific cards are documented as owned by their own slice, not built here
- [ ] Automated tests pass
