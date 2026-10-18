# 09 - Decisions and Open Questions

Status values: **Accepted** (decided, build to it), **Proposed** (the Product Owner's recommendation, awaiting the founder's confirmation - build to it unless the founder says otherwise), **Superseded**.

## Decisions (ADR log)
| ID | Decision | Date | Status |
|---|---|---|---|
| ADR-001 | Name: UrbanPetly, domain urbanpetly.com (also register .in) | 2026-10-18 | Accepted |
| ADR-002 | Monorepo with pnpm workspaces; three separate frontend apps (customer, provider, admin) plus API | 2026-10-18 | Accepted |
| ADR-003 | Client-side rendered React (Vite). No Next.js. Prerender key SEO pages at build time | 2026-10-18 | Accepted |
| ADR-004 | Node + TypeScript + Fastify, Zod schemas shared | 2026-10-18 | Accepted |
| ADR-005 | MySQL 8 with Knex (migrations, seeds, raw SQL for spatial queries) | 2026-10-18 | Accepted |
| ADR-006 | Self-hosted S3-compatible object storage on Dokploy; presigned uploads | 2026-10-18 | Accepted (product choice to be confirmed in a Tech Lead spike) |
| ADR-007 | Phone OTP login through the founder's SMS API, behind an `OtpSender` interface | 2026-10-18 | Accepted (API details pending - open question 1) |
| ADR-008 | Launch in Delhi NCR; at-home service mode included in v1 | 2026-10-18 | Accepted |
| ADR-009 | v1 has request-based bookings with no online payment | 2026-10-18 | Accepted (confirmed by the Product Owner as v1 scope; see ADR-021 for monetisation) |
| ADR-010 | Email-only notifications in v1 | 2026-10-18 | Accepted |
| ADR-011 | Maps: MapLibre/Leaflet with a free-tier tile and geocoding provider | 2026-10-18 | Proposed (provider to choose in spike) |
| ADR-012 | Priority definitions: P0 = launch blocker, P1 = committed to launch but may slip, P2 = parking lot. **"v1" means P0 + P1.** | 2026-10-18 | Accepted |
| ADR-013 | Priority corrections for consistency with 05-ux-spec and 08-delivery-plan: E2-S5 sort, E3-S3 call/WhatsApp and E8-S6 CSV import are raised to P0; "one review per customer per provider" is a P0 constraint folded into E5-S1 | 2026-10-18 | Accepted |
| ADR-014 | Either party may mark an accepted request completed once the appointment window has passed, and a request auto-completes 48h after it (the window's end is defined in ADR-028) | 2026-10-18 | Accepted |
| ADR-015 | Reviews in v1 come only from completed requests. No walk-in reviews, with or without proof | 2026-10-18 | Proposed |
| ADR-016 | SMS and WhatsApp notifications are out of v1. The provider is emailed; the provider confirms with the customer by phone or WhatsApp themselves | 2026-10-18 | Proposed |
| ADR-017 | Admin rejection of a profile or edit is a visible state: the listing stays private, the provider sees the reason, and can resubmit | 2026-10-18 | Accepted |
| ADR-018 | Price display is "from Rs X" = lowest starting price across a provider's active services. The "max price" filter matches providers with at least one active service whose starting price is at or below the value | 2026-10-18 | Accepted |
| ADR-019 | A provider is published after admin review of the profile. Verification documents are **not** required to publish; they are required only for the "Verified" badge | 2026-10-18 | Accepted |
| ADR-020 | Thin-page rule: a locality x category page is prerendered and listed in the sitemap only when it has 3 or more published providers. Below that it is not indexed and canonicalises to the city x category page | 2026-10-18 | **Superseded by ADR-029** |
| ADR-021 | No monetisation modelling in v1: no plans, commissions, invoicing or billing data. Revisit only after the enquiry volume target in 00-product-brief.md §7 is met | 2026-10-18 | Proposed |
| ADR-022 to ADR-025 | *Reserved for the Tech Lead's technical ADRs on `docs/adr-phase0`. Do not allocate these numbers here.* | 2026-10-18 | Reserved |
| ADR-026 | E7 gated / ungated edit split: a published listing's identity fields (name, description, categories, location, contact details, website) and **adding** a photo need admin review; services, prices, hours, closures, service areas, travel fees, photo ordering and **removing** a photo go live immediately | 2026-10-18 | Accepted |
| ADR-027 | E4-S5 (customer told of the response), E4-S6 (72-hour expiry) and E5-S5 (7-day review edit window) are raised from P1 to P0 | 2026-10-18 | Accepted |
| ADR-028 | End of the appointment window, IST: morning 12:00, afternoon 17:00, evening 21:00, a specific time = that time + 2 hours | 2026-10-18 | Accepted |
| ADR-029 | Thin-page rule, restated. The 3-published-provider threshold for prerendering and sitemap inclusion stands. Below it a locality x category page serves its own title, meta description and a canonical pointing at the city x category page, is excluded from the sitemap, and is **not** marked "do not index". With **zero** published providers it is still a working page and shows the E2-S1 empty state rather than nothing | 2026-10-18 | Accepted |
| ADR-030 | A CSV import batch is reversible in one click for the listings it **created** (unpublished to draft, never hard-deleted). Listings it **updated** are restored by hand from stored before-values | 2026-10-18 | Accepted |
| ADR-031 | Deleting a review inside the 7-day window **spends** the customer's one review for that provider. The review stops being public and stops counting towards the average and the review count, but the customer gets no new review for that provider or that request. The delete confirmation says so and offers "Edit" instead | 2026-10-18 | Accepted |

### Notes on the newer ADRs

**ADR-014 (completion).** The original spec let only the provider mark a request complete, and only a completed request unlocks a review. That let a provider block an unflattering review simply by never completing. Reviews must not depend on the cooperation of the party being reviewed, so either side may complete, and it happens automatically if neither does.

**ADR-015 (review source).** Walk-in reviews would roughly double the moderation surface and the fake-review risk for a product whose main trust promise is "real reviews", with no reliable way to verify a walk-in. The cost is slower review accumulation at launch; the mitigation is seeding supply and nudging customers after completion.

**ADR-016 (channels).** WhatsApp Business API needs a business verification and a per-message cost that is not budgeted, and template approval takes weeks. Email plus the provider's own phone is enough to prove the loop works. The 24-hour response-rate metric in 00-product-brief.md §7 is the trigger to revisit: if it is far below 70%, notification channel is the first thing to change.

**ADR-019 (publishing bar).** Requiring documents before publishing would stall the cold start (00-product-brief.md §9) because most small groomers and walkers have no GST registration. Admin review of the profile is the quality bar; the badge is the trust differentiator.

**ADR-020 (thin pages).** 5 cities x ~40 localities x 7 categories is over a thousand locality pages, most of which would be empty at launch. 06-nfr.md requires no soft-404s, so empty pages must not be indexed. Three providers is the threshold at which a listing page is worth landing on. *Superseded by ADR-029 - the threshold was right, the handling below the threshold was not.*

**ADR-026 (gated / ungated edits).** E7-S1 originally said any customer-visible edit goes back through review, while E7-S3, S4 and S5 let prices, photos and hours change immediately. A price is customer-visible, so the two could not both be true and no one could say what the review queue was supposed to contain. The line drawn here is **what we have vouched for** versus **what the provider is trading on today**. A groomer who raises a price on Monday, shuts for a wedding on Tuesday and drops a service on Wednesday cannot wait for us each time; that friction is how a directory goes stale. But the business name, the address, the phone number and the photos are the things a customer trusts because *we* reviewed them, and letting a claimed listing silently rewrite those is how a directory gets abused.

Photos are split rather than simply gated. Adding one puts imagery we have never seen in front of customers, so it waits. Removing one is the lever a provider pulls when a photo is wrong, embarrassing or shows someone it should not - making that wait for an admin is a privacy problem of our own making. Reordering only rearranges photos already approved.

**ADR-027 (three P1 promises raised to P0).** Each of these three sat behind a promise already printed on a P0 screen. E4-S1's confirmation tells every customer the provider has 72 hours; E4-S2 shows every provider a countdown - without E4-S6 the countdown reaches zero and nothing happens. E4-S3 says "the customer is told" on accept; without E4-S5 nobody tells them. E5-S1 offers a repeat customer the chance to "update my existing one instead" and E5-S2 states an edited review moves the average; without E5-S5 neither is possible. Shipping a P0 screen that makes a promise the product does not keep is worse than not making it, and all three stories are small. The alternative - stripping the promises - would mean a request that stays pending forever and a review nobody can correct, which is a worse product.

**ADR-028 (appointment window ends).** E4-S7's completion gate and its 48-hour sweep both turn on "the end of the appointment window", but E4-S1 only ever offered morning / afternoon / evening / a specific time. Neither criterion was testable. The exact values matter far less than their existence; these follow ordinary Delhi NCR trading hours, and two hours is a fair allowance for an unspecified-length visit. IST throughout, because every user and provider is in NCR (00 §5).

**ADR-029 (thin pages, restated).** ADR-020 asked for "do not index" **and** a canonical pointing at the city page. Those are contradictory instructions: a search engine told not to index a page stops treating its canonical as meaningful, so the link equity the canonical was meant to pass is simply lost. Worse, ADR-020 put the behaviour in the prerenderer, and a page that is not prerendered is exactly the page that never runs it. Dropping "do not index" and keeping the canonical gives one unambiguous signal - "this content belongs to the city page" - and sitemap exclusion still keeps us from actively advertising a thin page. The page stays perfectly usable for the person who lands on it.

The empty case had to be named explicitly, because at launch most of those thousand locality pages have **no** providers at all, and dropping "do not index" removed the thing that used to keep them out of the index. A page that answers 200 with nothing on it is exactly the soft-404 that 06-nfr.md forbids, and relying on the canonical to tidy it up is a hope, not a criterion. So a zero-provider locality x category page carries the same empty state E2-S1 already defines one level up - the other categories here, the same category nearby - which is real content, genuinely useful to whoever landed there, and testable. A redirect to the city page was the alternative; it was rejected because it throws away a shareable, bookmarkable address the moment our first provider in that locality signs up.

**ADR-030 (import reversal).** A thousand-row import that goes wrong is the single most damaging action an admin can take, and until now nothing in the spec said how to take it back. Hard deletion is not an option: by the time a bad import is noticed a customer may already have enquired with one of those listings, and deleting the business would delete their enquiry with it. Unpublishing to draft removes the listing from the public directory, which is the actual harm, while keeping every record. Updates are deliberately **not** rolled back automatically - an updated listing may have been corrected by hand or claimed by its owner in between, and blindly restoring it would undo real work. Showing the admin the before-values and letting them choose is slower and right.

**ADR-031 (deleting a review).** E5-S5 offers "Delete" for 7 days and settles the case where the window has closed, but not whether a deletion inside the window frees the customer's one-review-per-provider slot (ADR-013). It does not. Inside the window the customer already has "Edit", which changes the rating, the title, the body and the photos and recalculates the average - everything a delete-and-rewrite would achieve, except that an edit is marked as edited. The only thing delete-and-repost adds is a way to re-rate a provider with the edit marker stripped off, which is precisely the manipulation the one-review rule exists to prevent. Keeping the slot spent also keeps a reported review's moderation record intact (E5-S4, E8-S3), which a true deletion would destroy.

The cost is a customer who deletes in haste and then cannot speak at all, so the confirmation has to say plainly that the review is gone for good and point at "Edit" as the thing they probably want. That warning is a criterion, not copy polish: without it the rule is a trap. The customer's visible outcome is still a deletion - gone from the profile, out of the average and the count, no longer attributed to them; whether the slot is held by a soft-deleted row or by some other record is the Tech Lead's call (gap T8).

**Zero-provider pages versus pages that do not exist (ADR-029).** ADR-029 now covers a real locality of a real city with no supply yet: 200, the E2-S1 empty state, canonical to the city x category page. It must not be stretched to cover an address that names a locality we do not have, or a locality belonging to a different city - those are still "not found", exactly as a non-existent city or category already was. The two cases look similar from the outside and are opposite in meaning: one says "nothing here yet", the other says "no such place". Collapsing them into a 200 would manufacture the soft-404 ADR-029 is trying to avoid, on an unbounded set of invented addresses rather than a known thousand.

## ADR numbering (governance)

Agreed with the Tech Lead (SAM-45, in answer to M5):

- **Product decisions** are numbered inline in this file. ADR-001 to ADR-021 stand exactly as merged in `fc1de59`; nothing is renumbered.
- **ADR-022 to ADR-025 are reserved** for the four technical ADRs on the Tech Lead's `docs/adr-phase0` branch. This file must not allocate them, which is why the product ADRs in this pass start at ADR-026.
- **Technical decisions** get their own file in `docs/adr/`, with the number allocated by the Tech Lead.
- One shared number sequence across both locations, so a bare "ADR-0xx" is never ambiguous.
- Before allocating a number, check both this table and `docs/adr/`; the highest number in either wins.

## Spikes assigned to the Tech Lead (Phase 0)
1. Prerender approach: `vite-react-ssg` vs a Playwright snapshot script; how to serve per-provider meta for non-prerendered pages. Must also cover the ADR-029 thin-page rule and the nightly refresh in E9-S1/E9-S3. Note that ADR-029 puts below-threshold pages outside the prerenderer entirely: they still have to answer a crawler with their own title, meta description and canonical, so the spike has to cover that path, not only the prerendered one - including the zero-provider page, which must still answer with its own meta and the empty-state content.
2. Object store product (MinIO status check, Garage, SeaweedFS) and backup approach.
3. Map tiles and geocoding provider with acceptable free tier and terms for commercial use in India.
4. Session design details (cookie domains across `provider.`/`admin.` subdomains).
5. **New:** scheduled-job design for the jobs E4-S6, E4-S7, E9-S3 and E11-S3 depend on (request expiry, auto-completion, nightly sitemap, orphaned-upload cleanup) on a single-instance deployment.

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
| 7 | Over a thousand locality x category pages would mostly be empty, conflicting with the "no soft-404s" bar | 01 E9-S1 vs 06 SEO | ADR-020, restated as ADR-029 |
| 8 | "v1" and "P1" were used interchangeably with no definition of what blocks launch | 00, 01, 08 | ADR-012 |

Resolved in the SAM-45 follow-up pass (raised in the SAM-40 Tech Lead review of spec v1.0):

| # | Issue | Where | Resolution |
|---|---|---|---|
| 9 | E7-S1 said every customer-visible edit needs review, while E7-S3, S4 and S5 let prices, photos and hours go live without one. Blocked gap T1 | 01 E7 | "Shared rules for E7" gated / ungated table, ADR-026 |
| 10 | Three P0 criteria depended on P1 stories: E4-S1/S2 promise a 72h window (E4-S6), E4-S3 says "the customer is told" (E4-S5), E5-S1 points at the edit window (E5-S5) | 01 E4, E5 | E4-S5, E4-S6 and E5-S5 raised to P0 with full criteria, ADR-027 |
| 11 | E4-S7's completion gate and 48h sweep both turn on "the end of the appointment window", which was never defined for morning / afternoon / evening | 01 E4-S7 vs E4-S1 | End-of-window table in "Shared rules for E4", ADR-028 |
| 12 | Thin locality pages were to be marked "do not index" **and** canonicalised elsewhere - contradictory signals - and the rule was placed in the prerenderer, which never runs for an unprerendered page | 01 E9-S1, E9-S4 | Canonical to the city x category page, no "do not index", excluded from the sitemap, ADR-029 |
| 13 | E8-S6 recorded no provenance for imported listings, though 00 §6 requires it and E8-S5 already had the criterion | 01 E8-S6 vs 00 §6 | Provenance criteria added to E8-S6; import refused without a source |
| 14 | E8-S6 had no reversal criterion, so a bad 1000-row import could not be undone (gap T5) | 01 E8-S6 | Undo criteria added to E8-S6, ADR-030 |
| 15 | E6-S5 criteria 2 and 8 contradicted: "cannot sign in again with that number" vs a later sign-up on the same number getting a fresh account. The literal reading forced a permanent number blocklist | 01 E6-S5 | Criterion 2 reworded to "cannot get back into the deleted account", with an explicit criterion that the number itself is never blocked |
| 16 | E2-S3 promised an exact per-area travel fee on every search card, joining service areas against the customer's pincode on the hottest query in the product | 01 E2-S3 vs E3-S2 | Generic "travel fee may apply" on the card; the exact fee stays on the profile |
| 17 | E8-S6's P0 justification cited a Phase 1 exit criterion that E12-S7 seeds and E8-S5 hand-entry already satisfy | 01 E8-S6 vs 08 Phase 1 | Rewritten to rest on the 500-listing target in 00 §7, which hand-entry cannot reach |
| 18 | ADR-029 defined the below-threshold locality page for 1 and 2 providers but not for **0**, the majority case at launch - a 200 with no content and no "do not index" is the soft-404 06 forbids | 01 E9-S1 vs 06 SEO | Zero-provider criteria added to E9-S1: the E2-S1 empty state, canonical to the city page, still out of the sitemap (ADR-029) |
| 19 | "At most one pending **field** change" read as one field, where E8-S2's "changes highlighted" implies a set - load-bearing for gap T1 | 01 E7 shared rules | Reworded to one pending **set** of gated field changes, replaced wholesale on re-save; noted on T1 |

Resolved in the SAM-50 pass (raised by the Tech Lead while merging SAM-45):

| # | Issue | Where | Resolution |
|---|---|---|---|
| 20 | E5-S5 offers "Delete" inside the 7-day window but never said whether the customer's one-review-per-provider slot (ADR-013, `UNIQUE(provider_id, customer_id)`) is freed by it, so the constraint could not be built either way | 01 E5-S5, E5-S1 vs 03 reviews | The slot is spent; the confirmation warns and offers "Edit" instead. ADR-031, gap T8 |
| 21 | E9-S1's only "not found" criterion covered a city or category that does not exist, so a locality that does not exist - or belongs to another city - fell into the same branch as a real locality with no supply (row 18) | 01 E9-S1 | Explicit criterion: a non-existent or wrong-city locality is "not found"; the zero-provider empty state is only for a real locality of that city |

Open for the Project Manager (sequencing, not product):

| # | Issue | Where |
|---|---|---|
| P1 | Phase 1 requires admin-created and imported listings (E8-S5, E8-S6), which require admin sign-in (E8-S1), which requires OTP (E1) - but E1 is scheduled in Phase 2 and E8 in Phase 3. Either E1 + E8-S1 + E8-S5 + E8-S6 move into Phase 1, or Phase 1 seeds content another way | 08 Phases 1-3 |
| P2 | Phase 1 delivers search filters (E2-S4) including "Open now", which depends on opening hours (E7-S5) from Phase 3 | 08 Phases 1 and 3 |
| P3 | Phase 0 lists "ADRs finalised" including the map provider, but the map view (E2-S6) is P1 and lands in Phase 1 - confirm the spike still needs to complete in Phase 0 | 08 Phase 0 |

Open for the Tech Lead (technical, not product):

| # | Gap | Where | Needed from |
|---|---|---|---|
| T1 | A provider profile has no rejected state, so ADR-017 cannot be represented. Also needed: somewhere to hold a submitted edit while the live version stays public (E7-S1, E8-S2). **Unblocked:** the exact set of fields a pending edit must carry is now fixed by ADR-026 and the "Shared rules for E7" table - name, description, categories, address line, map pin, locality, pincode, contact phone, WhatsApp, email, website, plus added photos. Nothing else is ever pending, and one listing holds at most **one pending set** of those fields, replaced wholesale when the provider saves again (added photos queue individually) | 03 `providers.status` | Tech Lead |
| T2 | Requests have no "reported" path, but E4-S7 lets either party dispute an automatic completion | 03 `service_requests` | Tech Lead |
| T3 | There is no record of where an admin-created listing's information came from, which 00 §6 requires us to keep. Now required of imported listings too, not only hand-entered ones (E8-S6) | 03 `providers` | Tech Lead |
| T4 | Request creation needs a customer-visible state for "provider proposed a new time, awaiting customer" - today a proposal leaves the request simply `pending` | 03, 04 | Tech Lead |
| T5 | Nothing records which admin import produced a listing, so a bad import cannot be reversed (E8-S6). **Unblocked:** ADR-030 defines what reversal means - created listings go back to draft in one click, updated listings keep a before-image that an admin restores by hand - so the batch record needs to distinguish created from updated rows and hold the before-values | 03 | Tech Lead |
| T6 | The customer needs an endpoint to accept a proposed time and to mark a request completed (E4-S3, E4-S7) | 04 customer routes | Tech Lead |
| T7 | Review moderation needs a route to find any review, not only reported ones (E8-S3) | 04 admin routes | Tech Lead |
| T8 | `reviews` has no deleted state, but ADR-031 requires a deleted review to stop being public and stop counting while still holding the customer's `UNIQUE(provider_id, customer_id)` and `request_id` slot, and to keep enough of a record for a report already raised against it (E5-S4, E8-S3) | 03 `reviews`, `review_reports` | Tech Lead |

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

Questions 1-4 and 10 are external or legal dependencies: nothing in the product can resolve them, and no reasonable assumption makes them safe to launch without. Questions 5-9, 11 and 12 have working assumptions above and are being built to; the founder can overturn any of them at the cost of rework in the named stories.
