# 08 - Delivery Plan

Phases are sequential at the milestone level; work inside a phase runs in parallel. Each milestone ends with a demo on staging and a founder review.

## Phase 0 - Foundations
Goal: everyone can build, test and deploy.
- ADRs finalised (prerender approach, auth/session details, map provider, object store choice).
- Monorepo scaffold, tooling, CI, `.env.example`s, Docker Compose for local (E12-S1, S2, S7).
- Dokploy staging environment with MySQL and object store; backups configured (E12-S3, S5).
- Design tokens and base components in `packages/ui`; Storybook.
- Exit: "hello world" deployed from CI to staging for all four apps; seed data loads.

## Phase 1 - Core read path (browse and discover)
- E2 (search, filters, geo), E3 (provider profile), E9 (SEO pages, sitemap), E11 (media pipeline).
- Admin can create listings manually (E8-S5) and import CSV (E8-S6) so there is content.
- Exit: a visitor can find and view seeded providers on staging; Lighthouse budgets met.

## Phase 2 - Accounts and requests
- E1 (OTP), E6 (profile, pets, addresses, favourites), E4 (requests), E10 (emails).
- Exit: customer can sign in and send a request; provider receives email.

## Phase 3 - Provider tools and trust
- E7 (onboarding, claim, dashboard), E5 (reviews), E8 (moderation, verification, audit log).
- Exit: provider self-serve end to end; admin can approve and moderate.

## Phase 4 - Hardening and launch
- Performance, accessibility and security passes (06), load test, backup restore drill, privacy and terms pages, analytics with consent (E12-S6).
- Seed supply: onboard first ~50 providers in Gurgaon (grooming and vet first) manually.
- Soft launch (invite-only), fix S1/S2 issues, then public launch.

## Phase 5 - Post-launch backlog (not committed)
Provider stats, staff users, WhatsApp notifications, Hindi UI, payments, chat, subscriptions, more cities.

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
