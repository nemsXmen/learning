# Contract

## Inputs and outputs

Static. Inputs are the content module and the published technology list from slice 05
(read at build time; falls back to the static list if the API is unavailable).
Output is an HTML document with complete metadata.

## API or event boundary

- `GET /` — public, cacheable, indexable.
- `GET /sitemap.xml`, `GET /robots.txt` — generated, listing public routes only.

## Validation and errors

- A build with a missing required metadata field fails rather than shipping a page
  without a description.
- If the technology list cannot be fetched at build time, the page renders the static
  fallback and the build logs a warning; it never fails the deploy.

## Invariants

- No authenticated data and no personalised content on this page.
- `robots.txt` and metadata never allow indexing of `/dashboard`, `/learn`, `/boost`
  or `/profile`.
- Every call to action leads to `/register` or `/login`, never to a dead anchor.
