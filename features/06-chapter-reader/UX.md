# UX specification

## User flow

Chapter card → chapter page → read → practice or quiz → completion state → next best
action. The sidebar shows `✓` completed, `→` current and `○` not started (CDC §22).

## States

- loading: streamed shell — sidebar and title first, body streaming in; skeletons match
  final metrics.
- empty: a chapter with no quiz yet still offers next-chapter navigation.
- error: content fetch failure renders a retryable message with the sidebar intact.
- success: completion shows the checklist (lesson, practice, test) and one primary action.
- disabled / permission denied: locked chapter shows the required skills and a link to
  the review that unlocks it.

## Responsive and accessibility requirements

- Desktop: sidebar plus content, content measure capped around 72 characters.
- Tablet: collapsible sidebar. Mobile: drawer, content full width, no horizontal scroll
  except inside code blocks and tables.
- Headings are correctly nested and anchor-linked; the outline uses `aria-current`.
- Copy buttons are real buttons with accessible names and a polite confirmation.
- Full keyboard reading path with a skip-to-content link; visible focus throughout.
- Dark and light themes both meet AA on prose and code; reduced motion honoured.
