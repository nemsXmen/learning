# Acceptance criteria

- [x] Dashboard renders in one aggregated round trip and matches the contract
- [x] A next best action is always present and always shows the engine reason
- [x] Today's plan respects the user's daily minutes target
- [x] Onboarding, degraded, error, empty and all-caught-up states implemented
- [x] No recommendation logic exists in `apps/web`
- [x] Private routes are `noindex`
- [x] Axe passes in both themes; keyboard path to the primary action verified - the
      skip link is the first tab stop and the next best action is reached by keyboard
      with a visible focus (`pnpm test:a11y`)
- [x] Copy is data-backed and matches the tone of CDC 78
- [x] Automated tests pass
