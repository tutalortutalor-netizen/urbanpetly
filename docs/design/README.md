# Design documentation

Owner: UI/UX Designer. These documents are the build contract for the UI. They expand
[`05-ux-spec.md`](../05-ux-spec.md) — if the two disagree, raise it on the issue rather than
guessing (`docs/README.md` rule 1).

| Document | What it answers |
|---|---|
| [design-system.md](design-system.md) | Tokens, colour with verified contrast, type, spacing, layout, radius, elevation, motion, interaction states, accessibility baseline, voice and copy formats |
| [brand-direction.md](brand-direction.md) | The brand — **"Indigo Care", decided 2026-10-18** — and the alternative that was rejected |
| [component-inventory.md](component-inventory.md) | Every component: anatomy, props, all states, responsive behaviour, a11y, build order |
| [core-flows.md](core-flows.md) | The three core flows end to end, plus the provider and admin screens they touch |
| [home.md](home.md) | Home / city landing |
| [search-listing.md](search-listing.md) | Search, listing and SEO listing pages |
| [provider-profile.md](provider-profile.md) | Provider profile |
| [request-flow.md](request-flow.md) | The 3-step request flow, inline OTP and confirmation |
| [prototype/index.html](prototype/index.html) | Clickable prototype of core flow 1 — open it in a browser, no build step |

Implementation of the tokens lives in [`packages/ui`](../../packages/ui/README.md).

## Conventions for these documents

Every screen spec contains, in this order: user flow, wireframe at 360px, components used,
section rules, **all content states** (default, loading, empty, error, offline, no location
permission, unauthorized, not found — `05-ux-spec` §Content states), responsive behaviour,
copy table, accessibility notes, and where relevant SEO and performance notes.

Wireframes are ASCII at the 360px base width and Mermaid for flows — deliberately, so they
live in git, diff in a pull request and never go stale in a design tool nobody can open.

## Open with the Product Owner / founder

1. The home hero tagline — placeholder stands, see [home.md](home.md) copy table.
2. Whether any logo or colour from the domain purchase must be preserved — affects the logo SVG only, not the tokens.
3. Nothing is blocking; assumptions made in these specs are stated inline where they occur.

The brand question is **closed**: "Indigo Care", wordmark `UrbanPetly` — [brand-direction.md](brand-direction.md).
