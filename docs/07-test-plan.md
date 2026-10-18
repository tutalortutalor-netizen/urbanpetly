# 07 - Test Plan

Owner: QA Tester (automation). Developers own unit and integration tests for their code; QA owns E2E, regression and non-functional suites.

## Pyramid and tools
| Level | Tool | Scope | Runs |
|---|---|---|---|
| Unit | Vitest | Pure logic: services, validators, utilities, React components (Testing Library) | every PR |
| API integration | Vitest + Fastify `inject()` against a real MySQL 8 (Docker/Testcontainers) | Routes, auth, permissions, repositories, geo queries, state machines | every PR |
| Contract | Zod schemas shared + OpenAPI snapshot check | API shape does not change unintentionally | every PR |
| E2E | Playwright (Chromium; WebKit and Firefox nightly) | Critical user journeys on web, provider, admin against a seeded stack | PR (smoke), nightly (full) |
| Accessibility | axe-core in Playwright | Key pages in all three apps | nightly + before release |
| Visual regression | Playwright screenshots (opt-in, key screens) | Layout drift | nightly |
| Performance | Lighthouse CI (web vitals budgets), k6 for API (search, profile, request create) | Budgets in 06 | nightly / before release |
| Security | `pnpm audit`, ZAP baseline scan on staging, manual authz test matrix | OWASP checks | weekly + before release |

## Environments and data
- Deterministic seed (`pnpm db:seed:test`): 3 cities, ~40 localities, 7 categories, 60 providers with fixed coordinates, 10 customers, requests in every state. Geo tests assert exact ordering from known coordinates.
- Fake OTP sender returns a fixed code in test/staging when `OTP_PROVIDER=fake`; never enabled in production.
- Fake mailer captures emails for assertions (mailhog locally).
- Tests must be independent and parallel-safe (isolated DB schema or transaction per test).

## Critical E2E journeys (automation backlog)
1. Anonymous visitor searches by category and locality, applies filters, opens a profile.
2. "Near me" search with mocked geolocation; results sorted by distance.
3. Customer logs in with OTP, adds a pet, sends a request (at provider and at home), sees status.
4. Provider accepts a request; customer sees update; marks completed; customer posts a review; rating updates.
5. Provider onboarding: sign-up, create profile, submit; admin approves; listing appears in search.
6. Claim flow for an unclaimed listing (OTP to listed phone and manual approval).
7. Admin moderation: report a review, hide it, rating recalculated.
8. Account deletion anonymises data.
9. Negative paths: wrong OTP, lockout, rate limiting, accessing another user's request (403/404), expired request.
10. Prerendered pages: HTML contains title, H1, JSON-LD and provider list without running JS.

## Authorisation test matrix
For every endpoint: unauthenticated, wrong role, correct role but not owner, correct owner. Automated from the OpenAPI document where possible.

## Coverage and quality gates
- Unit + integration line coverage >= 80% for `apps/api` and `packages/shared`; branch coverage >= 70% on services.
- All P0 stories have at least one automated E2E or integration test mapped to acceptance criteria (traceability table kept in `docs/traceability.md` by QA).
- CI blocks merge when: lint, typecheck, unit/integration tests, build or E2E smoke fail.
- Flaky test policy: quarantined within 24h, fixed within one week.

## Defect handling
Severity: S1 (data loss, security, outage, blocker), S2 (core journey broken), S3 (minor), S4 (cosmetic). S1/S2 block release. Bugs reference the story ID; regressions get a test before the fix.

## Definition of Done (per story)
1. Acceptance criteria met and demonstrated.
2. Unit/integration tests added; E2E added or updated for P0 journeys.
3. Types, lint and build pass; no new `any` without justification.
4. API changes reflected in `packages/shared` and docs; migrations reversible and reviewed.
5. Accessibility checked (keyboard, labels, contrast) for UI changes.
6. Security review items checked (validation, authz, logging).
7. PR reviewed by the Tech Lead (or a peer developer) and approved; story ID in PR title.
8. Deployed to staging and verified by QA.
