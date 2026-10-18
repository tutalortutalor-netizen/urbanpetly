# Architecture Decision Records

One file per significant, lasting decision. Format: context, options considered, decision, consequences.

## Numbering and history
ADR-001 .. ADR-011 were recorded as table rows in
[09-decisions-and-open-questions.md](../09-decisions-and-open-questions.md) before this folder existed.
That table stays as the index of all decisions; from ADR-012 onward each decision also gets a file here.
Do not renumber. New ADRs take the next free number.

## Index
| ID | Title | Status |
|---|---|---|
| 001-011 | See the table in [09-decisions-and-open-questions.md](../09-decisions-and-open-questions.md) | - |
| [012](0012-prerender-approach-for-seo-pages.md) | Prerender approach for SEO pages | Accepted |
| [013](0013-object-storage-product-and-backups.md) | Object storage product and backup approach | Accepted |
| [014](0014-map-tiles-and-geocoding-provider.md) | Map tiles and geocoding provider | Accepted |
| [015](0015-auth-sessions-across-subdomains.md) | Auth sessions across subdomains | Accepted |

## Writing an ADR
- File name `NNNN-kebab-case-title.md`, four digits.
- Status is one of `Proposed`, `Accepted`, `Superseded by NNNN`, `Rejected`.
- Record the options you rejected and *why*. A list with one option is not a decision.
- Record consequences honestly, including the ones you do not like.
- An ADR is immutable once Accepted. To change a decision, write a new ADR and mark the old one superseded.
- Add the row to the index above and to the table in `09-decisions-and-open-questions.md` in the same PR.
