# Traceability matrix

Owner: QA Tester. Required by `07-test-plan.md`: *"All P0 stories have at least one automated E2E or integration test mapped to acceptance criteria (traceability table kept in `docs/traceability.md` by QA)."*

This file maps each acceptance criterion in `01-epics-and-user-stories.md` to the test or tests that prove it. A criterion with no row is a coverage hole; a row with no passing test is a gate on the story's Definition of Done.

## How to read this file

**Test ID** - `<story-id>-<LEVEL><nn>`, e.g. `E4-S5-API03`. Shared rules that several stories lean on get `SR<n>-<LEVEL><nn>`.

| Level | Tool and home | Meaning |
|---|---|---|
| `UNIT` | Vitest, co-located `*.test.ts` next to the source | Pure logic: window arithmetic, state machine, template selection |
| `API` | Vitest + Fastify `inject()` against seeded MySQL, co-located `*.test.ts` | Route, authz, persistence, job behaviour |
| `E2E` | Playwright, `e2e/specs/*.spec.ts` | What the customer or provider actually sees |
| `A11Y` | axe-core inside a Playwright spec | Keyboard, labels, contrast on the screens the story adds |

**Status** - `planned` (specified here, not yet written) / `written` / `green` (passing in CI) / `blocked` (cannot be written yet; the blocker is named).

Every test ID below is `planned`: the test harness itself is SAM-8 (`test/E12-qa-infrastructure`), which lands after the monorepo scaffold. Planned file paths follow the scaffold's co-located convention (`apps/api/src/modules/<area>/<file>.test.ts`) and are confirmed when SAM-8 lands.

**Scope of this revision.** Full case-level mappings for the three stories raised to P0 by ADR-027 (E4-S5, E4-S6, E5-S5), for the two shared rules they depend on (ADR-028 window ends, the 72-hour response window), and for the four E4-S7 criteria that ADR-028 made testable. Current as of `1b00739` on `main`, which added two criteria to E5-S5 and one to E5-S1 (ADR-031). The remaining P0 stories are mapped in SAM-8, which extends this file rather than replacing it.

---

## SR1 - End of the appointment window (ADR-028)

`01-epics-and-user-stories.md` → "Shared rules for E4". Every criterion that says *"the appointment window has passed"* or *"the end of the appointment window"* resolves through one function. Testing it once here means the stories that use it (E4-S7 today, reminders and disputes later) assert behaviour, not arithmetic.

Under test: a pure helper in `packages/shared` (planned `packages/shared/src/appointment-window.ts`), called with the request's `preferred_date`, `preferred_window` and `preferred_time`, returning a UTC instant.

| Case | Input | Expected end | Test ID | Level | Status |
|---|---|---|---|---|---|
| Morning | 2026-03-10, `morning` | 2026-03-10 12:00 IST (06:30 UTC) | `SR1-UNIT01` | UNIT | planned |
| Afternoon | 2026-03-10, `afternoon` | 2026-03-10 17:00 IST (11:30 UTC) | `SR1-UNIT02` | UNIT | planned |
| Evening | 2026-03-10, `evening` | 2026-03-10 21:00 IST (15:30 UTC) | `SR1-UNIT03` | UNIT | planned |
| Specific time, same day | 2026-03-10, `custom` 09:15 | 2026-03-10 11:15 IST | `SR1-UNIT04` | UNIT | planned |
| Specific time, rolls past midnight | 2026-03-10, `custom` 22:30 | 2026-03-11 00:30 IST - the worked example in the spec | `SR1-UNIT05` | UNIT | planned |
| Specific time, exactly 22:00 | 2026-03-10, `custom` 22:00 | 2026-03-11 00:00 IST - midnight itself, not 23:59 | `SR1-UNIT06` | UNIT | planned |
| The end instant counts as passed | now == the end instant | treated as passed (`now >= end`) | `SR1-UNIT07` | UNIT | planned |
| One millisecond before | now == end - 1ms | not passed | `SR1-UNIT08` | UNIT | planned |
| Stored and compared in UTC | any window | the returned instant is UTC and the offset is a fixed +05:30 - IST has no daylight saving, so no date in the year shifts the result | `SR1-UNIT09` | UNIT | planned |
| Server in a non-IST timezone | `TZ=UTC` and `TZ=America/New_York` | identical results - the rule must not read the server clock's zone | `SR1-UNIT10` | UNIT | planned |
| 48h sweep due time derives from the same instant | morning on D | auto-completion due 12:00 IST on D+2 | `SR1-UNIT11` | UNIT | planned |
| 48h sweep across a rollover | `custom` 22:30 on D | end 00:30 IST D+1, auto-completion due 00:30 IST D+3 | `SR1-UNIT12` | UNIT | planned |

> **Assumption flagged.** The spec says the window "has passed" but does not say whether the end instant itself counts. `SR1-UNIT07`/`SR1-UNIT08` assert `now >= end`, i.e. at exactly 12:00:00.000 IST a morning appointment is over. This matches E4-S7's "when the clock passes 12:00 IST on that date, then 'Mark completed' becomes available". If the Product Owner wants the strict reading, these two cases flip and nothing else changes.

## SR2 - The 72-hour response window

`01-epics-and-user-stories.md` → "Shared rules for E4": the window runs from the moment the request is sent, **or** from the moment the provider's most recent proposed time is recorded, whichever is later. Persisted as `service_requests.expires_at` (`03-data-model.md`).

| Case | Test ID | Level | Status |
|---|---|---|---|
| A new request's window ends 72h after it was sent | `SR2-UNIT01` | UNIT | planned |
| A proposal recorded at T moves the end to T+72h, later than the original | `SR2-UNIT02` | UNIT | planned |
| "Whichever is later" is a max, not an overwrite: a proposal whose recorded time is somehow earlier than the request does not shorten the window | `SR2-UNIT03` | UNIT | planned |
| `POST /provider/requests/:id/propose` writes the new `expires_at` in the same transaction as the proposal | `SR2-API01` | API | planned |
| A second proposal moves the end again, from the most recent one | `SR2-API02` | API | planned |
| The provider inbox countdown (E4-S2) and the customer's view read the same `expires_at` - no second calculation to drift | `SR2-API03` | API | planned |

---

## E4-S5 - Customer is told the provider's answer

Email assertions run against the fake mailer (`07-test-plan.md`); "within 5 minutes" is asserted as *enqueued in the same request transaction and sent on the first drain*, since a wall-clock wait is not a test.

| # | Acceptance criterion | Test ID | Level | Status | Notes |
|---|---|---|---|---|---|
| 1 | Provider accepts → customer emailed within 5 min, naming provider, service, date and time window, mode, the provider's phone number, and a link to the request | `E4-S5-API01` | API | planned | One assertion per named field; a missing field fails the case |
| 1 | Same, end to end: provider accepts in the provider app, customer opens the mail and lands on the request | `E4-S5-E2E01` | E2E | planned | Covers journey 4 in `07-test-plan.md` |
| 2 | Provider declines → emailed within 5 min with the reason in plain language and a link to similar providers | `E4-S5-API02` | API | planned | |
| 2 | The decline email contains no suggestion to contact the provider anyway | `E4-S5-API03` | API | planned | Negative assertion on the rendered body: no phone number, no WhatsApp or `tel:` link, no "you can still reach them" copy |
| 3 | Provider proposes another time → emailed within 5 min with the proposed date and time and a link to the request where the customer can accept it | `E4-S5-API04` | API | planned | |
| 3 | Customer follows that link and accepts the proposal; request becomes Accepted with the proposed date and time | `E4-S5-E2E02` | E2E | planned | Shares the boundary with `SR2-API01` |
| 4 | Customer has no email address on file → nothing sent, nothing errors, the answer is still in the request history | `E4-S5-API05` | API | planned | `users.email` is nullable (`03-data-model.md`); assert zero `notifications` rows, a 2xx response and the status visible on `GET /requests/:id` |
| 5 | Opening the request history instead of the email shows the status already up to date | `E4-S5-API06` | API | planned | The email is a notification, never the only route |
| 5 | Same, in the browser, with the mailer disabled entirely | `E4-S5-E2E03` | E2E | planned | Proves the product does not depend on mail delivery |
| 6 | Provider accepts, then the customer cancels → each email reflects the state when it was sent, and no email contradicts the status now shown | `E4-S5-API07` | API | planned | Assert the accept mail still reads "accepted" and that no email claims the request is live |
| 7 | Before the provider accepts, these emails contain nothing about the provider that is not already public | `E4-S5-API08` | API | planned | Decline and propose templates only. Mirror of the E4-S2 privacy rule, which withholds the *customer's* details |
| 7 | Privacy matrix over all three templates: which fields may appear at which status | `E4-S5-API09` | API | planned | Table-driven; the accept template is the only one allowed to carry the provider's phone number |
| - | The mailed link opens a request the signed-out recipient cannot read, and the sign-in round trip returns them to it | `E4-S5-E2E04` | E2E | planned | Authz edge: the link must not be a bearer token |
| - | Request detail page reached from the email passes axe-core | `E4-S5-A11Y01` | A11Y | planned | |

Planned homes: `apps/api/src/modules/requests/respond.test.ts`, `apps/api/src/modules/notifications/templates.test.ts`, `e2e/specs/request-response.spec.ts`.

## E4-S6 - A request with no answer expires

The expiry job is driven by an injectable clock, never by sleeping. Job runs are invoked directly in API tests so the catch-up case is reachable.

| # | Acceptance criterion | Test ID | Level | Status | Notes |
|---|---|---|---|---|---|
| 1 | Pending request, 72h past the start of its response window with no provider response → status becomes Expired | `E4-S6-API01` | API | planned | Start of window per SR2 |
| 1 | Neither party can act on an expired request: accept, decline, propose, cancel and complete are all refused | `E4-S6-API02` | API | planned | Table-driven over every transition the state machine forbids; expect 422 `BUSINESS_RULE` |
| 2 | On expiry the customer is emailed within 15 min, saying the provider did not reply in time, with a link back to search | `E4-S6-API03` | API | planned | |
| 2 | The provider is **not** emailed on expiry | `E4-S6-API04` | API | planned | Assert no `notifications` row addressed to the provider |
| 3 | Provider proposed a new time; 72h pass from that proposal with no answer from the customer → expires identically | `E4-S6-API05` | API | planned | Depends on `SR2-API01`; the request must not expire 72h after *sending* |
| 3 | That expiry email says the proposal lapsed, not that the provider never replied | `E4-S6-API06` | API | planned | Different template from criterion 2 |
| 4 | Provider responds with one minute to spare → does not expire, the response stands | `E4-S6-API07` | API | planned | Clock at `expires_at - 1m`; assert status, and that a later job run leaves it alone |
| 4 | Boundary: a response recorded at exactly `expires_at` | `E4-S6-API08` | API | planned | Same `now >= end` convention as `SR1-UNIT07`; at the instant itself the request has expired and the response is refused |
| 5 | A cancelled request, and one the provider already answered, are untouched when the 72h pass, and no expiry email is sent | `E4-S6-API09` | API | planned | Parameterised over `accepted`, `declined`, `cancelled`, `completed`, `expired` |
| 6 | Expired request: the timeline shows that it expired and when; no accept, decline or cancel action is offered | `E4-S6-API10` | API | planned | A `service_request_events` row, not just a status change |
| 6 | Same, as both parties see it in the browser | `E4-S6-E2E01` | E2E | planned | Journey 9 in `07-test-plan.md` ("expired request") |
| 7 | Expired request offers the customer no review option | `E4-S6-API11` | API | planned | `POST /requests/:id/reviews` refused, and the action absent from the page |
| 8 | The job has not run for several hours → the next run expires every request that should have expired | `E4-S6-API12` | API | planned | Seed a batch straddling the cutoff, advance the clock by 9h, run once; assert exactly the due ones expired |
| 8 | Each gets exactly one email and no duplicates | `E4-S6-API13` | API | planned | Run the job twice in a row; the second run sends nothing and changes nothing |
| 8 | Two job instances racing do not double-expire or double-send | `E4-S6-API14` | API | planned | `03-data-model.md` provides `jobs_lock` / advisory locks; this is the case that justifies them |
| - | Customer's expiry email link lands on a search prefilled with the original category and locality | `E4-S6-E2E02` | E2E | planned | Criterion 2's "link back to search for other providers" |
| - | The expired-state request page passes axe-core, and the status chip is not conveyed by colour alone | `E4-S6-A11Y01` | A11Y | planned | |

Planned homes: `apps/api/src/modules/requests/expiry-job.test.ts`, `e2e/specs/request-expiry.spec.ts`.

## E4-S7 - Completing a request (the ADR-028-dependent criteria)

These four criteria were untestable before ADR-028 fixed the end of each window. The rest of E4-S7 is mapped in SAM-8.

| # | Acceptance criterion | Test ID | Level | Status | Notes |
|---|---|---|---|---|---|
| 1 | Accepted request whose window end has passed → either party can mark it completed; both see who marked it and when | `E4-S7-API01` | API | planned | Run for customer and for provider |
| 2 | Window end not yet passed → the action is not offered | `E4-S7-API02` | API | planned | Not offered in the payload **and** refused if posted directly - an absent button is not an authz check |
| 2 | Boundary, all four window types | `E4-S7-API03` | API | planned | At `end - 1ms` refused, at `end` allowed; parameterised over morning, afternoon, evening and a `custom` time, reusing the SR1 fixtures |
| 3 | Accepted request nobody acted on → auto-completed 48h after the window end, and the timeline records that it was automatic | `E4-S7-API04` | API | planned | Distinct event type from a manual completion |
| 4 | Morning window: once the clock passes 12:00 IST that day the action is available to both parties, and auto-completion is due 12:00 IST two days later | `E4-S7-API05` | API | planned | The spec's own worked example; pairs with `SR1-UNIT11` |
| 4 | The same for a `custom` time that rolls past midnight | `E4-S7-API06` | API | planned | 22:30 on D → available 00:30 D+1, auto-complete 00:30 D+3; pairs with `SR1-UNIT12` |
| - | Customer completes after the window, then leaves a review | `E4-S7-E2E01` | E2E | planned | Journey 4 in `07-test-plan.md`, with the clock advanced past the window end |

Planned homes: `apps/api/src/modules/requests/complete.test.ts`, `apps/api/src/modules/requests/autocomplete-job.test.ts`.

## E5-S5 - Edit my review for 7 days

Eleven criteria since ADR-031 (`1b00739`), which settled what a deletion inside the window does to the customer's one-review-per-provider slot: it **spends** it. Criteria 4 and 5 are new and the ones after them shifted by two; the `#` column below follows the merged story.

`04-api-contract.md` offers `PATCH /reviews/:id` ("edit within 7 days") and still has no delete route - see Open items. ADR-031 now fixes what that route has to do (stop the review being public and counting, keep the slot), so the shape is no longer open, only the contract entry and the schema behind it (gap T8).

| # | Acceptance criterion | Test ID | Level | Status | Notes |
|---|---|---|---|---|---|
| 1 | Review posted less than 7 days ago → Edit and Delete are offered, with the time remaining shown | `E5-S5-API01` | API | planned | Against `reviews.edited_until` (`03-data-model.md`), not a recomputed 7 days |
| 1 | Boundary: at `edited_until - 1ms` the actions are offered; at `edited_until` they are not | `E5-S5-API02` | API | planned | Same instant convention as SR1 |
| 1 | The remaining time is shown to the customer and counts down | `E5-S5-E2E01` | E2E | planned | |
| 2 | Edit within the window → new rating, title, body and photos replace the old ones on the profile | `E5-S5-API03` | API | planned | Photos are replaced as a set, per the story's Out of scope |
| 2 | The average rating and star breakdown are recalculated | `E5-S5-API04` | API | planned | Closes E5-S2's "a review edited within its edit window changes the average"; assert `providers.rating_avg` in the same transaction |
| 2 | The review is marked as edited | `E5-S5-API05` | API | planned | Visible on the profile, with no version history (Out of scope) |
| 2 | Edit changing 5★ to 1★ on a provider with one review moves the average to 1.0, not to an average of the two values | `E5-S5-API06` | API | planned | Guards the obvious aggregate bug |
| 3 | Delete within the window → the review disappears from the profile; the average and count no longer include it | `E5-S5-API07` | API | planned | |
| 3 | Deleting the only review returns the provider to the "New on UrbanPetly" empty state, not to a 0.0 rating | `E5-S5-API08` | API | planned | E5-S2's last-review-removed case |
| 4 | After deleting inside the window the customer's one review for that provider is spent: a new review for that provider is refused and they are told why | `E5-S5-API17` | API | planned | ADR-031. ID carried over from the blocked pair below, which this answer resolved |
| 4 | "or for the completed request it came from": the original request offers no review action, and `POST /requests/:id/reviews` against it is refused | `E5-S5-API18` | API | planned | Absent from the payload **and** refused when posted directly; expect 422 `BUSINESS_RULE`, not a 500 from `request_id UNIQUE` |
| 4 | "then or later": the slot is still spent once the 7-day window has closed | `E5-S5-API19` | API | planned | Clock advanced past `edited_until`; distinguishes "spent" from "blocked while the window runs" |
| 4 | A deleted review stays out of the profile, the average and the count after a later request completes | `E5-S5-API20` | API | planned | Guards a soft delete that holds the slot (gap T8) from leaking back into the listing or the aggregate |
| 4 | Repeat request with a provider whose review was deleted → the customer is told they have already used their review, and no new review is offered | `E5-S1-API01` | API | planned | E5-S1 criterion 5, the flip side of ADR-031. First E5-S1 ID; SAM-8 continues from `E5-S1-API02` |
| 5 | The delete confirmation says the review is gone for good and that no new review can be written for this provider, and offers "Edit" | `E5-S5-E2E03` | E2E | planned | Three assertions on the dialog: the permanence, the named consequence, and an "Edit" control. Copy wording is free; the three facts are not |
| 5 | Choosing "Edit" from the confirmation lands on the edit form with the review intact, and nothing is deleted | `E5-S5-E2E04` | E2E | planned | The alternative has to work, otherwise it is a label |
| 5 | Dismissing the confirmation leaves the review untouched | `E5-S5-E2E05` | E2E | planned | No delete request sent; review still on the profile and still counted |
| 6 | Review older than 7 days → no edit or delete offered, and the customer is told the window has closed | `E5-S5-API09` | API | planned | Refused on a direct `PATCH` too, with 422 `BUSINESS_RULE` |
| 7 | Another completed request with an already-reviewed provider, earlier review still inside its window → offered to update it | `E5-S5-API10` | API | planned | Closes E5-S1's "update my existing one instead" |
| 7 | Same, window closed → told the existing review stands, and no second review is created | `E5-S5-API11` | API | planned | `UNIQUE(provider_id, customer_id)` must not be reached as a 500; expect a clean 422 |
| 8 | Edited body containing contact details → held for moderation exactly as a new review would be, and the previous version stays public meanwhile | `E5-S5-API12` | API | planned | Two assertions: new version `pending`, profile still serving the old text |
| 9 | Admin hid the review → an edit inside the window is refused and the customer is shown why it was hidden | `E5-S5-API13` | API | planned | `reviews.status = 'hidden'` |
| 10 | Someone else's review → edit and delete both refused | `E5-S5-API14` | API | planned | Signed out, wrong role, and signed in as another customer; nothing about the review leaked in the error |
| 11 | After an edit the provider sees the current version only, and is not emailed again | `E5-S5-API15` | API | planned | Assert no new `notifications` row |
| - | A review reported before it was deleted keeps its moderation record and is still reachable from the admin queue | `E5-S5-API21` | API | planned | ADR-031's stated reason for spending the slot rather than hard-deleting; pairs with E5-S4 and E8-S3 and is the case gap T8 has to satisfy |
| - | Edit and delete flows end to end, including the confirmation step before a delete | `E5-S5-E2E02` | E2E | planned | |
| - | Edit form and delete confirmation pass axe-core; the confirmation is reachable and dismissible by keyboard and the rating control is labelled | `E5-S5-A11Y01` | A11Y | planned | |
| - | The permanence warning is in the dialog's accessible name or description, not only in sighted copy | `E5-S5-A11Y02` | A11Y | planned | A screen-reader user must hear the consequence before the confirm button, otherwise ADR-031's trap is only closed for sighted customers |

> **`E5-S5-API16` is withdrawn, not renumbered.** The previous revision carried a mutually exclusive pair for the question SAM-50 was holding: `API16` for "the customer may write a new one", `API17` for "the review is spent". ADR-031 chose spent, so `API17` is now a live case above and `API16` is gone. The number is **not** reused, so nothing that referenced it can silently come to mean the opposite.

Planned homes: `apps/api/src/modules/reviews/edit.test.ts`, `apps/api/src/modules/reviews/ratings.test.ts`, `e2e/specs/review-edit.spec.ts`.

---

## Open items

| # | Item | Raised with | Effect if unanswered |
|---|---|---|---|
| 1 | ~~Deleting a review inside the 7-day window: is the customer's one review spent, or may they write a new one?~~ **Answered: spent (ADR-031, `1b00739`).** Criteria 4 and 5 of E5-S5 and criterion 5 of E5-S1 are mapped above | - | Closed |
| 2 | `04-api-contract.md` has `PATCH /reviews/:id` but still no delete route, while E5-S5 criterion 3 requires Delete. ADR-031 settles the behaviour, so what is left is the contract entry: the route, and the response the refused repeat review gets (`E5-S5-API17`, `E5-S5-API18`) | Tech Lead | `E5-S5-API07`, `API08`, `API17`-`API20` can be written against the behaviour, but the contract test cannot |
| 3 | A deletion that holds the slot has no home in the schema: `reviews` in `03-data-model.md` has no deleted state and `status` is `('published','hidden','pending')`. Now tracked as the Tech Lead's gap **T8** in `09-decisions-and-open-questions.md` | Tech Lead, gap T8 | `E5-S5-API20` and `E5-S5-API21` are the two cases whatever T8 lands on has to pass: out of the public listing and the aggregate, still holding the slot, still carrying a raised report |
| 4 | Does the end instant of an appointment window count as passed? Assumed yes (`SR1-UNIT07`) | Product Owner, if they disagree | Two unit cases flip; no other case changes |

## What this file still owes

Case-level mappings for the remaining P0 stories across E1-E12, the authorisation test matrix from `07-test-plan.md`, and the non-functional suites. Tracked in SAM-8 (`test/E12-qa-infrastructure`), which extends this file. Until then the gate in `07-test-plan.md` - every P0 story mapped to at least one automated test - is met for E4-S5, E4-S6, E5-S5 and the window-dependent half of E4-S7, and not yet for the others.

Two specific hand-offs to SAM-8, so neither is lost between stories:

- **E5-S1** has one case here, `E5-S1-API01` (its criterion 5, the ADR-031 flip side, which only makes sense next to the delete cases). Its other ten criteria are unmapped; SAM-8 continues the numbering from `E5-S1-API02`.
- **E9-S1** gained two criteria in `d87050c` and `1b00739` - the zero-provider locality page (ADR-029) and the not-found for a locality that does not exist or belongs to another city. They are new untested surface and they are deliberately **not** absorbed here: this revision covers E4-S5, E4-S6, E5-S5 and part of E4-S7, and E9-S1 has no rows at all yet. The pair wants testing together, because serving one where the other belongs is exactly the soft-404 the two decisions exist to prevent.
