# 08 - Delivery Plan

Phases are sequential at the milestone level; work inside a phase runs in parallel. Each milestone ends with a demo on staging and a founder review.

## Phase 0 - Foundations
Goal: everyone can build, test and deploy.
- ADRs finalised (prerender approach, auth/session details, map provider, object store choice).
- Scheduled-job design settled (spike 5 in 09-decisions-and-open-questions.md). Four stories across three phases wait on it, so the design cannot slip past Phase 0 even though nothing runs a job yet.
- Monorepo scaffold, tooling, CI, `.env.example`s, Docker Compose for local (E12-S1, S2, S7).
- Dokploy staging environment with MySQL and object store; backups configured (E12-S3, S5).
- Design tokens and base components in `packages/ui`; Storybook.
- Exit: "hello world" deployed from CI to staging for all four apps; seed data loads.

## Phase 1 - Core read path (browse and discover)
- E2 (search, filters, geo), E3 (provider profile), E9 (SEO pages, sitemap), E11 (media pipeline).
- Admin can create listings manually (E8-S5) and import CSV (E8-S6) so there is content.
- The scheduled-job runner is built here (see "Cross-phase enablers"); E9-S3's nightly sitemap refresh is its first consumer.
- Exit: a visitor can find and view seeded providers on staging; Lighthouse budgets met.

## Phase 2 - Accounts and requests
- E1 (OTP), E6 (profile, pets, addresses, favourites), E4 (requests), E10 (emails).
- **E4-S5** (the customer is emailed the provider's answer) and **E4-S6** (a request nobody answers expires after 72h) are launch-blocking here, raised from P1 by ADR-027. They are not follow-ons to be picked up later: E4-S3 says "the customer is told" and E4-S1 shows every customer a 72-hour promise, both on P0 screens.
- Sequencing inside the phase: E4-S5 goes in the same slice as E4-S2 and E10-S1 - one send path, two recipients, and splitting them means building the template plumbing twice. E4-S6 goes in the same slice as E4-S7 - one job family on one runner, both P0, and both need the same catch-up and no-duplicate-email behaviour.
- Exit: a customer can sign in and send a request; the provider is emailed; the customer is emailed the provider's answer; a request left unanswered for 72h expires on its own and tells the customer.

## Phase 3 - Provider tools and trust
- E7 (onboarding, claim, dashboard), E5 (reviews), E8 (moderation, verification, audit log).
- **E5-S5** (edit or delete my review for 7 days) is launch-blocking here, raised from P1 by ADR-027. It ships in the same slice as E5-S1 and E5-S2 rather than after them: E5-S1's "update my existing one instead" and E5-S2's "an edited review changes the average" are P0 criteria that cannot be met without it.
- Exit: provider self-serve end to end; admin can approve and moderate; a customer can correct a review inside its 7-day window and the provider's average moves with it.

## Phase 4 - Hardening and launch
- Performance, accessibility and security passes (06), load test, backup restore drill, privacy and terms pages, analytics with consent (E12-S6).
- Seed supply: onboard first ~50 providers in Gurgaon (grooming and vet first) manually.
- Soft launch (invite-only), fix S1/S2 issues, then public launch.

## Phase 5 - Post-launch backlog (not committed)
Provider stats, staff users, WhatsApp notifications, Hindi UI, payments, chat, subscriptions, more cities.

## Cross-phase enablers
Work that no single story owns but several depend on. Each one is scheduled against its **first** consumer, not its most important one.

| Enabler | Phase | Consumers | Note |
|---|---|---|---|
| Scheduled-job runner | 1 | E9-S3 (P0, Phase 1), E4-S6 (P0, Phase 2), E4-S7 (P0, Phase 2), E11-S3 (P1, Phase 1) | Designed by the Phase 0 spike; **no story in 01-epics-and-user-stories.md builds it**. Raised with the Product Owner. Until a story exists, whichever of E9-S3 or E11-S3 is picked up first carries it, and the sizing of E4-S6 assumes the runner already exists. |
| Transactional email send path | 2 | E4-S2, E4-S5, E4-S6, and the E7/E8 decision emails | E10-S1 and E10-S3 are the enabler; the per-event emails are thin on top of it. |

The runner is the one to watch. 02-architecture.md already gives the jobs a home (`apps/api/src/jobs/` - "expire requests, cleanup, sitemap"), but a folder is not a schedule: nothing says what runs them, on a single-instance deployment (spike 5), or how a job that missed its window catches up without double-sending (E4-S6's last criterion). Three P0 stories across two phases stop dead without it.

## Scope changes to this plan
Decisions that changed the launch-blocking set after the phases above were first drawn. Recorded so that scope is absorbed deliberately rather than discovered mid-phase.

| When | Decision | Effect on the plan |
|---|---|---|
| 2026-10-18 | ADR-013 raised E2-S5 (sort), E3-S3 (call/WhatsApp) and E8-S6 (CSV import) to P0 | Absorbed into Phase 1; E8-S6 was already named in the Phase 1 bullets. |
| 2026-10-18 | ADR-027 raised E4-S5, E4-S6 and E5-S5 to P0 | Three stories, no new phase. E4-S5 and E4-S6 join Phase 2, E5-S5 joins Phase 3, each slotted beside the P0 story whose promise it keeps. Phase 2 and Phase 3 exit criteria extended to name them, so a phase cannot be called done while one is outstanding. Surfaced the missing scheduled-job runner above. |

## Ownership (agent roles)
| Role | Responsibilities |
|---|---|
| Product Owner | Owns spec and backlog, writes acceptance criteria, answers product questions, accepts stories |
| Project Manager | Sequencing, dependencies, status reports, risk tracking, creates and tracks issues |
| Tech Lead | ADRs, architecture, scaffold review, PR reviews, migration review, unblocking developers |
| Full-stack devs (x3) | Stories end to end (API + UI). Suggested split: Dev A: API platform, auth, requests; Dev B: discovery/search, geo, SEO, media; Dev C: provider dashboard, reviews, admin |
| UI/UX Designer | Tokens, components, mockups, prototypes, usability review of built screens |
| QA Tester | Test plan execution, automation, traceability, regression, release sign-off |

## Working agreement
- One story per branch/PR; small PRs (<400 changed lines preferred).
- Branches from `main`; `main` is always deployable; squash merge.
- Tech Lead reviews architecture-affecting PRs; any dev can review others; QA verifies on staging.
- Blockers and spec questions are raised in the issue, tagged to the Product Owner.
- Do not start Phase N+1 stories until Phase N exit criteria are met, except P2 items and design work, which may run ahead.
