# UX specification

## User flow

No direct UI. This feature defines the payload that slice 06 renders, so it owns the
reading experience's raw material: heading ids for anchors, highlighted code, an
outline for the sidebar, and neighbours for previous/next navigation.

## States

- success: complete payload, cache hit or miss indistinguishable to the client.
- error: `404` and `500` map to distinct client-visible states in slice 06.
- loading / empty / disabled: owned by the consuming feature.

## Responsive and accessibility requirements

Rendered HTML must carry stable heading ids, `lang` on code blocks, table markup that
can scroll horizontally in a container, and images with alt text taken from Markdown.
