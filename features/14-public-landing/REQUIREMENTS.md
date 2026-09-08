# Requirements

## Goal

A developer who has never heard of the platform understands in one screen that this is
an adaptive coach, not a course library, and knows what to do next.

## Scope

### Must

- `/` under the `(marketing)` route group, fully static, server rendered.
- Sections: hero with the loop (apprendre → pratiquer → tester → réviser → progresser),
  how the Learning Boost works, the available learning paths, mastery and skill graph
  explained, an honest note on gamification, and a final call to action.
- Metadata: title, description, Open Graph and Twitter cards, canonical URL, sitemap
  and `robots.txt` allowing public pages and disallowing private ones (CDC §61).
- A theme toggle that works before sign-in and persists.
- Content of the page lives in one typed content module, not scattered in JSX.

### Must not

- No claim the product cannot back: no fake testimonial, no invented user count, no
  logo of a company that is not a customer.
- No pricing until a pricing decision exists.
- No client-side data fetching, no analytics script, no third-party embed in V1.
- No duplicated design primitives — everything comes from `packages/ui`.
