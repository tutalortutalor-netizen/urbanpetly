# UrbanPetly - Specification Set

Status: DRAFT v0.1 (2026-10-18). Owner: Product Owner. Reviewer: founder.

UrbanPetly (urbanpetly.com) is an aggregator for pet services in Delhi NCR.
Pet parents find, compare and contact providers; providers get a listing and leads.

| # | Document | Purpose |
|---|---|---|
| 00 | [Product brief](00-product-brief.md) | Vision, users, scope, success metrics |
| 01 | [Epics and user stories](01-epics-and-user-stories.md) | Backlog with acceptance criteria |
| 02 | [Architecture](02-architecture.md) | Monorepo, stack, deployment, SEO strategy |
| 03 | [Data model](03-data-model.md) | MySQL tables (Knex migrations) |
| 04 | [API contract](04-api-contract.md) | REST endpoints, conventions, errors |
| 05 | [UX spec](05-ux-spec.md) | Screens, flows, design principles |
| 06 | [Non-functional requirements](06-nfr.md) | Security, privacy (DPDP), performance, accessibility |
| 07 | [Test plan](07-test-plan.md) | Test strategy, tooling, definition of done |
| 08 | [Delivery plan](08-delivery-plan.md) | Phases, milestones, agent ownership |
| 09 | [Decisions and open questions](09-decisions-and-open-questions.md) | ADR log, pending items |
| 10 | [Git workflow and review policy](10-git-workflow.md) | Feature branches, PRs, review chain (mandatory) |
| - | [Architecture decision records](adr/) | One file per decision from ADR-012 onward |
| - | [Glossary](../GLOSSARY.md) | Project vocabulary; use these words in code and docs |

## Rules for agents working from this spec
1. This spec is the source of truth. If code and spec disagree, raise it; do not silently diverge.
2. Change the spec in the same PR as the behaviour change.
3. Keep PRs small and scoped to one story. Reference the story ID (e.g. `E2-S3`) in the PR title.
4. Anything not covered by the spec is a question for the Product Owner, not a guess.
5. Never commit secrets. Configuration comes from environment variables (see 02-architecture).
