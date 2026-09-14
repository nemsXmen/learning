# Test plan

## Unit

- Progress aggregation: chapter → module → technology, including zero and complete.
- Lock resolution: unlocked when all prerequisite skills reach the unlock threshold, locked with the exact
  failing skills listed otherwise.
- Continue selection: most recent in-progress chapter, else first unlocked chapter.

## Integration

- Technology list is scoped to the caller and reflects their progress only.
- Detail payload matches the contract for a user with mixed progress.
- Unknown technology → 404; unauthenticated → 401.
- A user with no progress gets every non-prerequisite chapter unlocked.

## End to end

- Two users see different progress for the same technology.
- Locked chapter cannot be opened by direct URL.

## Edge cases and regression risks

- A chapter with no skills attached must not be permanently locked.
- Content sync removing a module while a user has progress in it.
- Technology with a single module, and module with a single chapter.
