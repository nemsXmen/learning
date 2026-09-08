# Agent orchestration prompt

You are building this project from its CDC at `docs/CDC.md`.

## First mission: establish the architecture

Before implementing product code, the orchestrator must:

1. Extract goals, users, scope, constraints, integrations and unknowns from the CDC.
2. Split the work into small, independently testable features under `features/`.
3. Propose the smallest architecture that satisfies the CDC. Do not select a
   framework, database, vendor or dependency without recording why in
   `docs/decisions.md`.
4. Document the approved architecture, boundaries, request/data flow, security
   assumptions and local development path in `docs/architecture.md` and
   `docs/development.md`.
5. Define each feature's acceptance criteria and contract before parallel work.

## Agent workflow

For each feature, read its `REQUIREMENTS.md`, `CONTRACT.md`, `UX.md`,
`TEST_PLAN.md` and `ACCEPTANCE.md` as applicable. Then coordinate work in this
order: contract -> backend/domain -> UX -> frontend -> QA verification.

The orchestrator owns scope and consistency. Specialist agents own their
deliverables but must not invent business rules or undocumented endpoints.

## Non-negotiable delivery rules

- Keep modules and documents small and cohesive; split before they become large.
- Validate inputs and handle loading, empty, error, success and permission states.
- Keep secrets server-side. Browser-facing code must not receive private service credentials.
- Every completed feature has meaningful automated tests and completed acceptance criteria.
- Record unresolved CDC questions in `docs/decisions.md`; do not silently guess.
- Update the feature pack and architecture documentation when implementation changes a contract.
