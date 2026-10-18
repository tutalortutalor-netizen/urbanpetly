# 09 - Decisions and Open Questions

Status values: **Accepted** (decided, build to it), **Proposed** (the Product Owner's recommendation, awaiting the founder's confirmation - build to it unless the founder says otherwise), **Superseded**.

## Decisions (ADR log)

One sequence for every decision, product and technical. ADR-001..021 are recorded only in this table;
ADR-022 onward also have a file each in [adr/](adr/). Claim a number by adding its row here in the same
PR as the file.

| ID | Decision | Date | Status |
|---|---|---|---|
| ADR-001 | Name: UrbanPetly, domain urbanpetly.com (also register .in) | 2026-10-18 | Accepted |
| ADR-002 | Monorepo with pnpm workspaces; three separate frontend apps (customer, provider, admin) plus API | 2026-10-18 | Accepted |
| ADR-003 | Client-side rendered React (Vite). No Next.js. Prerender key SEO pages at build time | 2026-10-18 | Accepted |
| ADR-004 | Node + TypeScript + Fastify, Zod schemas shared | 2026-10-18 | Accepted |
| ADR-005 | MySQL 8 with Knex (migrations, seeds, raw SQL for spatial queries) | 2026-10-18 | Accepted |
| ADR-006 | Self-hosted S3-compatible object storage on Dokploy; presigned uploads | 2026-10-18 | Accepted (product chosen in [ADR-023](adr/0023-object-storage-product-and-backups.md)) |
| ADR-007 | Phone OTP login through the founder's SMS API, behind an `OtpSender` interface | 2026-10-18 | Accepted (API details pending - open question 1) |
| ADR-008 | Launch in Delhi NCR; at-home service mode included in v1 | 2026-10-18 | Accepted |
| ADR-009 | v1 has request-based bookings with no online payment | 2026-10-18 | Accepted (confirmed by the Product Owner as v1 scope; see ADR-021 for monetisation) |
| ADR-010 | Email-only notifications in v1 | 2026-10-18 | Accepted |
| ADR-011 | Maps: MapLibre/Leaflet with a free-tier tile and geocoding provider | 2026-10-18 | Accepted (provider chosen in [ADR-024](adr/0024-map-tiles-and-geocoding-provider.md); Leaflet dropped) |
| ADR-012 | Priority definitions: P0 = launch blocker, P1 = committed to launch but may slip, P2 = parking lot. **"v1" means P0 + P1.** | 2026-10-18 | Accepted |
| ADR-013 | Priority corrections for consistency with 05-ux-spec and 08-delivery-plan: E2-S5 sort, E3-S3 call/WhatsApp and E8-S6 CSV import are raised to P0; "one review per customer per provider" is a P0 constraint folded into E5-S1 | 2026-10-18 | Accepted |
| ADR-014 | Either party may mark an accepted request completed once the appointment window has passed, and a request auto-completes 48h after it | 2026-10-18 | Accepted |
| ADR-015 | Reviews in v1 come only from completed requests. No walk-in reviews, with or without proof | 2026-10-18 | Proposed |
| ADR-016 | SMS and WhatsApp notifications are out of v1. The provider is emailed; the provider confirms with the customer by phone or WhatsApp themselves | 2026-10-18 | Proposed |
| ADR-017 | Admin rejection of a profile or edit is a visible state: the listing stays private, the provider sees the reason, and can resubmit | 2026-10-18 | Accepted |
| ADR-018 | Price display is "from Rs X" = lowest starting price across a provider's active services. The "max price" filter matches providers with at least one active service whose starting price is at or below the value | 2026-10-18 | Accepted |
| ADR-019 | A provider is published after admin review of the profile. Verification documents are **not** required to publish; they are required only for the "Verified" badge | 2026-10-18 | Accepted |
| ADR-020 | Thin-page rule: a locality x category page is prerendered and listed in the sitemap only when it has 3 or more published providers. Below that it is not indexed and canonicalises to the city x category page | 2026-10-18 | Accepted |
| ADR-021 | No monetisation modelling in v1: no plans, commissions, invoicing or billing data. Revisit only after the enquiry volume target in 00-product-brief.md §7 is met | 2026-10-18 | Proposed |
| ADR-022 | [Prerender SEO pages with React Router v8 framework mode (`ssr: false` + `prerender`)](adr/0022-prerender-approach-for-seo-pages.md) | 2026-10-18 | Accepted |
| ADR-023 | [Object storage: SeaweedFS single node; rclone + mysqldump off-server encrypted backups](adr/0023-object-storage-product-and-backups.md) | 2026-10-18 | Accepted |
| ADR-024 | [Maps: MapLibre GL JS + Geoapify for tiles and geocoding; Ola Maps as upgrade path](adr/0024-map-tiles-and-geocoding-provider.md) | 2026-10-18 | Accepted |
| ADR-025 | [Sessions: host-only `__Host-` refresh cookie on `api.`, one session per audience](adr/0025-auth-sessions-across-subdomains.md) | 2026-10-18 | Accepted |

### Notes on the newer ADRs

**ADR-014 (completion).** The original spec let only the provider mark a request complete, and only a completed request unlocks a review. That let a provider block an unflattering review simply by never completing. Reviews must not depend on the cooperation of the party being reviewed, so either side may complete, and it happens automatically if neither does.

**ADR-015 (review source).** Walk-in reviews would roughly double the moderation surface and the fake-review risk for a product whose main trust promise is "real reviews", with no reliable way to verify a walk-in. The cost is slower review accumulation at launch; the mitigation is seeding supply and nudging customers after completion.

**ADR-016 (channels).** WhatsApp Business API needs a business verification and a per-message cost that is not budgeted, and template approval takes weeks. Email plus the provider's own phone is enough to prove the loop works. The 24-hour response-rate metric in 00-product-brief.md §7 is the trigger to revisit: if it is far below 70%, notification channel is the first thing to change.

**ADR-019 (publishing bar).** Requiring documents before publishing would stall the cold start (00-product-brief.md §9) because most small groomers and walkers have no GST registration. Admin review of the profile is the quality bar; the badge is the trust differentiator.

**ADR-020 (thin pages).** 5 cities x ~40 localities x 7 categories is over a thousand locality pages, most of which would be empty at launch. 06-nfr.md requires no soft-404s, so empty pages must not be indexed. Three providers is the threshold at which a listing page is worth landing on.

## Spikes assigned to the Tech Lead (Phase 0)

Spikes 1-4 are complete; each produced an ADR. Spike 5 is open.

| # | Spike | Outcome |
|---|---|---|
| 1 | Prerender approach and per-provider meta for non-prerendered pages, covering the ADR-020 thin-page rule and the nightly refresh in E9-S1/E9-S3 | [ADR-022](adr/0022-prerender-approach-for-seo-pages.md) - React Router v8 framework mode; `vite-react-ssg` and Playwright snapshots rejected (Playwright kept as fallback) |
| 2 | Object store product (MinIO status check, Garage, SeaweedFS) and backups | [ADR-023](adr/0023-object-storage-product-and-backups.md) - SeaweedFS; MinIO archived 2026-04 and rejected |
| 3 | Map tiles and geocoding with commercial-use terms for India | [ADR-024](adr/0024-map-tiles-and-geocoding-provider.md) - Geoapify; MapTiler and Stadia free tiers forbid commercial use |
| 4 | Session design across `provider.`/`admin.` subdomains | [ADR-025](adr/0025-auth-sessions-across-subdomains.md) - host-only `__Host-` cookie on `api.`, per-audience sessions |
| 5 | **Open:** scheduled-job design for the jobs E4-S6, E4-S7, E9-S3 and E11-S3 depend on (request expiry, auto-completion, nightly sitemap, orphaned-upload cleanup) on a single-instance deployment | Not started |

Each ADR lists what it still owes. ADR-022 in particular carries a **blocking Phase 1 validation**
that must pass before SEO content work depends on prerendering.

## Spec gaps and conflicts found while finalising v1.0
Resolved in this pass:

| # | Issue | Where | Resolution |
|---|---|---|---|
| 1 | Only the provider could complete a request, yet only a completed request unlocks a review - a provider could veto any review | 01 E4, 04 provider actions | New story E4-S7, ADR-014 |
| 2 | "Call" is on the P0 provider profile screen but E3-S3 was P1 | 05 §3 vs 01 E3 | E3-S3 raised to P0, ADR-013 |
| 3 | Phase 1 exit depends on CSV import but E8-S6 was P1 | 08 Phase 1 vs 01 E8 | E8-S6 raised to P0, ADR-013 |
| 4 | Sort options appear in the P0 search contract but E2-S5 was P1 | 04 `GET /providers` vs 01 E2 | E2-S5 raised to P0, ADR-013 |
| 5 | "One review per customer per provider" is a hard rule in 00 and 03 but sat in a P1 story | 00 §4, 03 reviews vs 01 E5-S5 | Folded into E5-S1 as P0, ADR-013 |
| 6 | "Max price" and "from Rs X" had no defined meaning against a provider with many services | 01 E2-S4, 04 `maxPrice` | ADR-018 |
| 7 | Over a thousand locality x category pages would mostly be empty, conflicting with the "no soft-404s" bar | 01 E9-S1 vs 06 SEO | ADR-020 |
| 8 | "v1" and "P1" were used interchangeably with no definition of what blocks launch | 00, 01, 08 | ADR-012 |

Open for the Project Manager (sequencing, not product):

| # | Issue | Where |
|---|---|---|
| P1 | Phase 1 requires admin-created and imported listings (E8-S5, E8-S6), which require admin sign-in (E8-S1), which requires OTP (E1) - but E1 is scheduled in Phase 2 and E8 in Phase 3. Either E1 + E8-S1 + E8-S5 + E8-S6 move into Phase 1, or Phase 1 seeds content another way | 08 Phases 1-3 |
| P2 | Phase 1 delivers search filters (E2-S4) including "Open now", which depends on opening hours (E7-S5) from Phase 3 | 08 Phases 1 and 3 |
| P3 | Phase 0 lists "ADRs finalised" including the map provider, but the map view (E2-S6) is P1 and lands in Phase 1 - confirm the spike still needs to complete in Phase 0 | 08 Phase 0 |

Open for the Tech Lead (technical, not product):

| # | Gap | Where | Needed from |
|---|---|---|---|
| T1 | A provider profile has no rejected state, so ADR-017 cannot be represented. Also needed: somewhere to hold a submitted edit while the live version stays public (E7-S1, E8-S2) | 03 `providers.status` | Tech Lead |
| T2 | Requests have no "reported" path, but E4-S7 lets either party dispute an automatic completion | 03 `service_requests` | Tech Lead |
| T3 | There is no record of where an admin-created listing's information came from, which 00 §6 requires us to keep | 03 `providers` | Tech Lead |
| T4 | Request creation needs a customer-visible state for "provider proposed a new time, awaiting customer" - today a proposal leaves the request simply `pending` | 03, 04 | Tech Lead |
| T5 | Nothing records which admin import produced a listing, so a bad import cannot be reversed (E8-S6) | 03 | Tech Lead |
| T6 | The customer needs an endpoint to accept a proposed time and to mark a request completed (E4-S3, E4-S7) | 04 customer routes | Tech Lead |
| T7 | Review moderation needs a route to find any review, not only reported ones (E8-S3) | 04 admin routes | Tech Lead |

## Open questions
Each question below has the Product Owner's recommendation so that work is never blocked. Where a question is marked **blocking**, a story cannot be finished without the answer.

| # | Question | Owner | PO recommendation / working assumption | Blocks |
|---|---|---|---|---|
| 1 | OTP API: documentation, DLT template registration, rate limits, costs | Founder | Build against the fake sender; the real one is a drop-in (ADR-007). DLT template text needs to be registered before the first real SMS | **Blocking for launch** (not for building E1) |
| 2 | Email provider and sender domain (e.g. `no-reply@urbanpetly.com`) with SPF/DKIM | Founder | Build against a capture-only sender (E10-S3). Any SMTP provider will do; the domain setup is the long pole | **Blocking for launch** (not for building E10) |
| 3 | Legal pages: who writes the privacy policy and terms; grievance officer details | Founder / legal | The product reserves the pages and the consent-version mechanism (E1-S1, E9-S5). Content is not ours to write | **Blocking for launch** |
| 4 | Initial supply: sources of the first providers and permission to list them | Founder | Admin-created and CSV-imported listings only, from sources we are allowed to use; every listing records its source (gap T3). No scraping (00 §6) | **Blocking for Phase 4** |
| 5 | Branding: logo, colours, tone - does the designer propose or does the founder have preferences? | Founder | Designer proposes two directions in Phase 0 and the founder picks. Tokens are swappable so this does not block build | No |
| 6 | Request confirmation by phone/WhatsApp only, or WhatsApp notifications soon after launch? | Founder | **ADR-016**: email only in v1; revisit if the 24h response rate is far below 70% | No |
| 7 | Is phone OTP enough to publish a provider, or must documents be approved first? | Founder | **ADR-019**: admin review of the profile publishes; documents are only for the "Verified" badge | No |
| 8 | Reviews only after a completed request, or also from walk-in customers with proof? | Founder | **ADR-015**: completed requests only in v1 | No |
| 9 | Monetisation timeline (affects whether to model plans and commissions now) | Founder | **ADR-021**: model nothing in v1 | No |
| 10 | Hosting capacity: VPS size, region (India), and who manages server updates | Founder | India region for DPDP data-residency (06). Sizing and patching ownership are the founder's call; E12-S3 and E12-S5 cannot be finished without it | **Blocking for E12-S3/S5** |
| 11 | **New:** do we publish a provider's phone number on the public profile, or only after sign-in? | Founder | Publish it. It is already public business information, hiding it damages SEO and the "contact fast" promise, and the privacy rule we actually need protects the *customer's* number (E4), not the provider's | No |
| 12 | **New:** what is the target first-response time for the admin review queue (E8-S2)? | Founder | 1 working day. This is an operational commitment shown to providers after they submit, not a product feature | No |
| 13 | **From Phase 0:** backup destination for the daily off-server copy (Backblaze B2, a second VPS, a Hetzner Storage Box) and who holds its credentials | Founder | Tech Lead: pick one with object versioning and write-and-list-only credentials. Until it is answered we have no backups, only a backup design ([ADR-023](adr/0023-object-storage-product-and-backups.md)) | **Blocking for E12 go-live** |
| 14 | **From Phase 0:** does any India data-residency requirement, Survey of India licence or National Geospatial Policy obligation apply to our use of a foreign map and geocoding service? | Founder / legal | Tech Lead: build on Geoapify behind the `GeocodingProvider` port. If the answer is yes we switch to Ola Maps, which is an adapter change ([ADR-024](adr/0024-map-tiles-and-geocoding-provider.md)) | No (port makes it cheap to reverse) |
| 15 | **From Phase 0:** confirm `urbanpetly.in` will only 301-redirect to `urbanpetly.com` and never serve an app | Founder | Tech Lead: redirect only. Serving `.in` makes it cross-*site* to `api.urbanpetly.com`, voiding the `SameSite=Lax` + `Origin`-check design and forcing CSRF tokens ([ADR-025](adr/0025-auth-sessions-across-subdomains.md)) - a cross-cutting auth change, not a DNS change | No, but answer before E1 ships |
| 16 | **From Phase 0:** self-hosted object storage (ADR-006) versus a managed bucket | Founder | Tech Lead: raising it once, now, while it is cheap to change. Managed storage deletes most of [ADR-023](adr/0023-object-storage-product-and-backups.md) and half the backup work for a few dollars a month, at the cost of data-residency control and an extra DPDP processor to disclose. Absent an answer, self-hosting stands | No |
| 17 | **From Phase 0:** the corporate npm proxy in the dev environment serves packages but 404s on `@pnpm/exe`, so `corepack` cannot install pnpm | Tech Lead | Workaround in place: install the `pnpm` JS package (`npm i -g pnpm`), which the proxy does serve. Confirm CI uses a registry without this gap | No |

Questions 1-4, 10 and 13 are external or legal dependencies: nothing in the product can resolve them, and no reasonable assumption makes them safe to launch without. Questions 5-9, 11, 12 and 14-17 have working assumptions above and are being built to; the founder can overturn any of them at the cost of rework in the named stories.
