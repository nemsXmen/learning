# UX specification

## User flow

No dedicated screen. Consumed by slice 06 (reader), 05 (catalog) and 13 (dashboard).

## States

- success: the caller receives the authoritative row and re-renders from it, never from
  an optimistic guess that could exceed the server value.
- error: a failed progress report is silent to the reader but retried once; a failed
  explicit completion surfaces a retryable message in slice 06.
- loading / empty / disabled: owned by consuming features.

## Responsive and accessibility requirements

Progress values returned must be usable as text (`72%`) for screen readers, not only
as a bar width.
