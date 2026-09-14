# Requirements

## Goal

A learner reads a chapter comfortably on any device, always knows where they are in
the module, and finishes with an obvious next action.

## Scope

### Must

- `/learn/[technology]/[chapter]` as a Server Component fetching the rendered chapter.
- Two-column layout (CDC §22): module sidebar with per-chapter status, content column
  with title, progress, body and an on-page outline.
- Premium code blocks: server-highlighted, language label, copy control, horizontal
  scroll, no layout shift.
- Reading progress: scroll depth throttled and reported, plus an explicit
  "Mark as complete" action; both go through slice 07.
- Chapter footer: previous / next navigation and the next best action (quiz, or the
  engine recommendation once slice 13 lands).
- Sticky, collapsible sidebar on desktop; a drawer on mobile.
- Every exercise and interview question offers hints revealed one at a time and a
  « Je ne sais pas » action that shows the solution, without leaving the page.

### Must not

- No client-side Markdown parsing or re-highlighting.
- No progress written directly by the browser to the API — it goes through Next.js.
- No content for a locked chapter, even with a direct URL.
