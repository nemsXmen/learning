# Test plan

## Unit

- Content module: every section has the fields its component requires.
- Metadata builder: title, description, canonical, OG and Twitter tags present.
- Path list falls back to the static list when the build-time fetch fails.

## Integration

- `/` renders every section in both themes.
- `robots.txt` allows `/` and disallows every private route.
- `sitemap.xml` lists public routes only.

## End to end

- Landing → register → dashboard completes as one journey.
- Axe passes in both themes; keyboard traversal reaches every CTA.
- Lighthouse: no render-blocking third-party script; no client-side fetch on load.

## Edge cases and regression risks

- A private route accidentally added to the sitemap.
- A new technology published with no landing copy.
- 320px viewport and 200% zoom.
