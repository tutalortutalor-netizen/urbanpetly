# Architecture Decision Records

One file per significant, lasting decision. Format: context, options considered, decision, consequences.

## Numbering and history
There is **one** ADR sequence for the whole project, product and technical alike. ADR-001 .. ADR-021
were recorded only as table rows in
[09-decisions-and-open-questions.md](../09-decisions-and-open-questions.md), before this folder existed.
That table stays as the index of all decisions; from ADR-022 onward each decision also gets a file here.

Do not renumber, and do not start a second series for "technical" ADRs. A new ADR takes the next free
number in the table in 09, whoever writes it. Claim the number by adding the row in the same PR as the
file - two branches that both take "the next number" without landing the row is exactly how ADR-014
briefly meant two different things.

## Index
| ID | Title | Status |
|---|---|---|
| 001-021 | See the table in [09-decisions-and-open-questions.md](../09-decisions-and-open-questions.md) | - |
| [022](0022-prerender-approach-for-seo-pages.md) | Prerender approach for SEO pages | Accepted |
| [023](0023-object-storage-product-and-backups.md) | Object storage product and backup approach | Accepted |
| [024](0024-map-tiles-and-geocoding-provider.md) | Map tiles and geocoding provider | Accepted |
| [025](0025-auth-sessions-across-subdomains.md) | Auth sessions across subdomains | Accepted |

## Writing an ADR
- File name `NNNN-kebab-case-title.md`, four digits.
- Status is one of `Proposed`, `Accepted`, `Superseded by NNNN`, `Rejected`.
- Record the options you rejected and *why*. A list with one option is not a decision.
- Record consequences honestly, including the ones you do not like.
- An ADR is immutable once Accepted. To change a decision, write a new ADR and mark the old one superseded.
- Add the row to the index above and to the table in `09-decisions-and-open-questions.md` in the same PR.
