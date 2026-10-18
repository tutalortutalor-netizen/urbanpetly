# 01 - Epics and User Stories

Story ID format: `E<epic>-S<n>`.

## Priority definitions (ADR-012)
| Pri | Meaning | Ships in |
|---|---|---|
| P0 | Launch blocker. Public launch cannot happen without it. | v1 |
| P1 | Committed to launch, but may slip to the first post-launch iteration without blocking the launch. | v1 |
| P2 | Post-launch backlog (parking lot). Not committed, not estimated. | later |

"v1" therefore means **P0 + P1**. The parking lot is **P2 plus the out-of-scope list in 00-product-brief.md §4**.

## Rules for this document
- Every **P0** story has acceptance criteria written as Given / When / Then plus an explicit **Out of scope** list. P1 and P2 stories get criteria when they are pulled into a sprint.
- Acceptance criteria describe observable behaviour only. They never name a table, a column, a library or an endpoint - the technical HOW belongs to the Tech Lead (02, 03, 04).
- A story should be finishable by one developer in about a day. Stories that are known to be larger are listed in [Stories that need splitting](#stories-that-need-splitting); the Project Manager splits them when scheduling, keeping the parent ID as a prefix (e.g. `E7-S3a`).
- Criteria are the contract QA tests against (07-test-plan.md, Definition of Done). If an implementation disagrees with a criterion, raise it on the issue; do not silently diverge.
- Unless a story says otherwise, these defaults apply to every screen: all states in 05-ux-spec.md "Content states" are handled, copy goes through the i18n layer, and WCAG 2.1 AA applies (06-nfr.md).

---

## E1 - Authentication (phone OTP)
| ID | Story | Pri |
|---|---|---|
| E1-S1 | As a user I can sign in with my mobile number and an OTP | P0 |
| E1-S2 | As a user I stay signed in across visits and can sign out | P0 |
| E1-S3 | As a user I can sign out of all devices | P1 |
| E1-S4 | As the system I limit OTP requests and verification attempts | P0 |

### E1-S1 - Sign in with mobile number and OTP
As a pet parent or provider, I want to sign in with my mobile number and a one-time code, so that I do not have to remember a password.

Acceptance criteria
- Given I am on the sign-in screen, when I enter a valid 10-digit Indian mobile number and submit, then a 6-digit code is sent to that number and I see the code entry screen with a resend countdown of 30 seconds.
- Given the resend countdown has reached zero, when I tap "Resend code", then a new code is sent and the countdown restarts.
- Given I enter the correct code within 5 minutes of it being sent, when I submit it, then I am signed in and returned to the page I started from.
- Given I am signing in for the first time with this number, when I am signed in, then an account is created for me and I am asked for my name once (skippable) before I continue.
- Given I enter a number that is not a valid Indian mobile number, when I submit, then I see an inline error naming the problem and no code is sent.
- Given I enter a wrong code, when I submit it, then I see "That code is not right" and I can try again; the screen never reveals whether the number already has an account.
- Given I enter a wrong code 5 times for the same request, when I submit the fifth wrong code, then sign-in for that number is refused for 15 minutes and I am told when I can try again.
- Given the code is older than 5 minutes, when I submit it, then I am told it has expired and offered a resend.
- Given I agree to the privacy policy and terms at the sign-in screen, when my account is created, then the version I agreed to and the time are recorded (06-nfr.md, DPDP).
- Given the environment is development, staging or test, when a code is requested, then a fake sender is used and the real SMS provider is never called.

Out of scope
- Email or social sign-in, passwords, magic links.
- Non-Indian phone numbers.
- Changing the mobile number on an existing account (P2).
- Admin allowlist checks (E8-S1).

### E1-S2 - Stay signed in and sign out
As a signed-in user, I want to stay signed in between visits and to be able to sign out, so that I do not re-enter a code every time but can end my session when I want.

Acceptance criteria
- Given I signed in earlier and did not sign out, when I return to the site within 30 days, then I am still signed in without entering a code.
- Given my session has been idle long enough that my short-lived access has expired, when I use the site, then my session is renewed silently and I notice nothing.
- Given I have not visited for more than 30 days, when I return, then I am signed out and asked to sign in again.
- Given I am signed in, when I choose "Sign out", then I am signed out on this device only, other devices stay signed in, and I land on the home page.
- Given I have signed out, when I press the browser back button to a signed-in page, then I see the signed-out state and am prompted to sign in, not stale personal data.
- Given I sign in on the customer site, when I open the provider app with the same account and the account is a provider, then I do not have to sign in again.

Out of scope
- "Remember this device" / trusted-device management.
- Signing out of all devices (E1-S3).
- Session listing and device names.

### E1-S4 - Limit OTP requests and verification attempts
As the business, I want strict limits on code requests and attempts, so that SMS costs and account abuse stay under control.

Acceptance criteria
- Given a mobile number has already been sent 3 codes in the last 15 minutes, when a 4th is requested, then no SMS is sent, the user sees "Too many attempts, try again in X minutes" and the response does not reveal whether the number has an account.
- Given a single internet connection has requested 10 codes in the last hour, when an 11th is requested from it, then no SMS is sent and the user sees the same throttle message.
- Given a code request is throttled, when I wait out the stated window, then a new request succeeds.
- Given any number of code requests, when I look at the application logs, then no log line contains the code or a full mobile number.
- Given the limits are in force, when a legitimate user requests one code and enters it correctly, then they are never throttled.

Out of scope
- CAPTCHA (held as a fallback, see 00-product-brief.md §9; add only if abuse is observed).
- Per-device fingerprinting.
- Blocking by carrier or number range.

---

## E2 - Discovery and search
| ID | Story | Pri |
|---|---|---|
| E2-S1 | Browse providers by category and city | P0 |
| E2-S2 | Search by text (name, service, locality) | P0 |
| E2-S3 | Use "near me" (browser location) or pick a locality; results sorted by distance | P0 |
| E2-S4 | Filter by service mode (at provider / at home), rating, price range, open now, verified | P0 |
| E2-S5 | Sort by relevance, distance, rating, price | P0 (raised, ADR-013) |
| E2-S6 | Toggle list and map views; map pins open a mini card | P1 |
| E2-S7 | Pagination or infinite scroll with stable URLs (filters live in the URL query string) | P0 |

Shared rules for E2 (apply to every story in this epic)
- Only providers whose listing is published are ever shown to the public.
- A provider card always shows: business name, primary category, rating and review count (or "New"), locality, distance when a location is known, starting price as "from Rs X", and an "At home" tag when at least one active service can be delivered at the customer's location.
- "from Rs X" is the lowest starting price across the provider's active services (ADR-018).
- Empty results always offer a way forward: widen the radius, clear a filter, or pick a nearby locality.

### E2-S1 - Browse by category and city
As a pet parent, I want to browse providers by service category in my city, so that I can see what is available without typing a search.

Acceptance criteria
- Given I am on the home page, when I pick a category tile and a city, then I see a listing page for that city and category showing published providers in that city.
- Given a city and category listing page, when it loads, then the heading names the city and category in plain English (e.g. "Dog groomers in Gurgaon") and the result count is shown.
- Given a city and category combination with no published providers, when I open it, then I see an empty state that offers the other categories in that city and the same category in neighbouring cities, and the page is not reported as an error.
- Given I am on a city and category listing, when I open a locality from the locality list, then I see the same category filtered to that locality.
- Given a locality and category combination with no published providers, when I open it, then I see the equivalent empty state at locality level - the other categories in that locality and the same category in neighbouring localities of the same city - and the page is not reported as an error (E9-S1 relies on this page existing and being useful).
- Given a category that is no longer active, when I try to open its listing, then I am sent to the city page rather than shown an empty page.
- Given I open a listing page, when I check the page address, then it reflects the city and category so I can bookmark and share it.

Out of scope
- Text search (E2-S2), geolocation (E2-S3), filters (E2-S4), map (E2-S6).
- Prerendering and SEO metadata for these pages (E9-S1).
- Editorial ordering or featured placement.

### E2-S2 - Text search
As a pet parent, I want to type what I am looking for, so that I can find a provider by name, service or area in one step.

Acceptance criteria
- Given I type a business name that exists, when I search, then that provider appears in the results.
- Given I type a service word such as "grooming" or "vaccination", when I search, then providers offering a matching service or category appear.
- Given I type a locality name such as "Sector 56", when I search, then providers in or near that locality appear and the locality is offered as a suggestion I can apply as a filter.
- Given I type a partial word of at least 3 characters, when I search, then matches on the start of a word are returned (e.g. "groo" matches "grooming").
- Given I search for something with no matches, when the results load, then I see an empty state suggesting the nearest categories and localities, and a way to clear the search.
- Given I have searched, when I look at the page address, then my search text is in it, so reloading or sharing reproduces the same results.
- Given I type fewer than 2 characters, when I submit, then I am asked for a longer search instead of getting all providers.
- Given the same search text and the same seeded data, when the search is repeated, then the result order is identical (so QA can assert it).

Out of scope
- Spelling correction, synonyms, Hindi or transliterated queries.
- Autocomplete of business names (locality suggestions only).
- Ranking tuning beyond "name match beats service match beats description match".

### E2-S3 - Near me and locality-based search
As a pet parent, I want results near my actual location, so that I can see who can realistically serve me and how far away they are.

Acceptance criteria
- Given I allow the browser to share my location, when I search a category, then I see published providers within the default radius of 10 km, ordered nearest first, and each card shows the distance in km to one decimal place.
- Given I denied or dismissed the location prompt, when I search, then I am asked to pick a city and locality instead, and after I pick one the results are ordered by distance from that locality.
- Given my browser cannot determine a location, when I search, then I see the same locality picker and no error dialog.
- Given I have a location and no results fall inside 10 km, when the results load, then I am offered one tap to widen the radius to 25 km and the count at that radius is shown.
- Given a provider offers at-home service and my pincode is listed in its service area, when I search from that pincode, then the provider appears and its card is tagged "At home", even if its own address is outside my chosen radius.
- Given a provider offers at-home service with a service radius, when my location is inside that radius, then the provider appears and is tagged "At home".
- Given a provider only serves customers at its own premises, when I search from a location outside the radius, then it does not appear.
- Given I change the radius or the locality, when the results reload, then the page address reflects the change.
- Given an at-home provider that charges a travel fee for any of its areas, when I view its card in the results, then the card says "travel fee may apply" next to the price so the price is not misleading. The card does **not** show an amount.
- Given I want to know the actual amount, when I open that provider's profile, then the exact fee for each area it serves is shown there (E3-S2).
- Given an at-home provider that charges no travel fee anywhere, when I view its card, then no travel-fee wording appears.

Out of scope
- Live travel time or traffic-aware distance (straight-line distance only).
- Multiple saved locations or automatic switching between them.
- Map rendering (E2-S6).

### E2-S4 - Filters
As a pet parent, I want to narrow results, so that I only see providers that fit my needs.

Acceptance criteria
- Given a results list, when I apply the "At home" filter, then only providers with at least one active service deliverable at my location remain.
- Given a results list, when I apply the "At provider" filter, then only providers with at least one active service delivered at their own premises remain.
- Given a results list, when I set a minimum rating of 4, then only providers with an average rating of 4.0 or more remain; providers with no reviews are excluded and the empty state explains this.
- Given a results list, when I set a maximum price, then only providers with at least one active service whose starting price is at or below that value remain (ADR-018).
- Given a results list, when I apply "Open now", then only providers whose opening hours cover the current time in India Standard Time remain, and providers currently marked as temporarily closed are excluded.
- Given a results list, when I apply "Verified", then only providers whose documents have been approved remain.
- Given several filters applied together, when the results load, then all of them apply at once and each active filter is shown as a chip I can remove individually.
- Given active filters, when I choose "Clear all", then every filter is removed and the full result set returns.
- Given active filters, when I look at the page address, then every active filter is in it, and opening that address in a new tab reproduces the same filtered results.
- Given a filter combination with no matches, when the results load, then I see which filters are narrowing the result and can remove them from the empty state.

Out of scope
- Filtering by pet type, by individual service, or by specific amenity (P2).
- Saving filter presets.
- "Open at a chosen future time" (only "open now" in v1).

### E2-S5 - Sorting
As a pet parent, I want to change the order of results, so that I can put price, rating or distance first depending on what matters to me.

Acceptance criteria
- Given a results list, when I choose "Nearest", then results are ordered by ascending distance; this is the default whenever a location is known.
- Given a results list, when I choose "Top rated", then results are ordered by descending average rating, and providers with fewer than 3 reviews are ranked below those with 3 or more.
- Given a results list, when I choose "Price: low to high", then results are ordered by ascending starting price, and providers with no priced service are shown last.
- Given no location is known, when the results load, then the default order is "Most relevant" and the "Nearest" option prompts me to set a location.
- Given I change the sort, when the results reload, then the sort is in the page address and the first page is shown again.
- Given two providers tie on the chosen sort, when results load repeatedly with the same seeded data, then their relative order is the same every time.

Out of scope
- Personalised or learned ranking.
- Paid or sponsored placement.
- Sorting by number of reviews or by response rate (P2).

### E2-S7 - Paging and shareable result URLs
As a pet parent, I want to move through long result lists and share or bookmark what I am looking at, so that I can come back to the same results.

Acceptance criteria
- Given more results exist than fit on one page, when I reach the end of the list, then I can load the next set and the page address updates to reflect where I am.
- Given I am on a later page, when I reload the page or open the address in a new tab, then I see the same results, filters, sort and position.
- Given I am on a later page, when I press the browser back button, then I return to the previous page of results and not to the home page.
- Given I change a filter, a sort or the search text, when the results reload, then I am returned to the first page.
- Given I ask for a page beyond the last one, when it loads, then I see an empty state with a link back to the first page, not an error.
- Given results are loading, when I wait, then I see skeleton placeholders rather than a blank area or a shifting layout.
- Given a request for an unusually large page size, when it is made, then it is capped and the list still renders correctly.

Out of scope
- Infinite scroll with scroll-position restoration across full page reloads (one approach, chosen by the Tech Lead, is enough).
- Server-side caching strategy.

---

## E3 - Provider profile page
| ID | Story | Pri |
|---|---|---|
| E3-S1 | View a provider's profile: about, services and prices, photos, hours, address with map, contact, rating | P0 |
| E3-S2 | See whether a service is at provider, at home or both, and the home-visit area | P0 |
| E3-S3 | Call or WhatsApp the provider directly (click-to-call link, tracked) | P0 (raised, ADR-013) |
| E3-S4 | See verification badge and "Unclaimed" label when applicable | P0 |
| E3-S5 | Share the profile (copy link, WhatsApp) | P2 |

### E3-S1 - View a provider profile
As a pet parent, I want one page with everything about a provider, so that I can decide whether to contact them.

Acceptance criteria
- Given a published provider, when I open its profile, then I see the business name, primary category, average rating with review count, locality and city, description, photo gallery, services with prices, opening hours, address, a map showing its location, and a way to contact it.
- Given a provider with no reviews, when I open its profile, then the rating area shows "New on UrbanPetly" instead of a zero rating.
- Given a provider with no photos, when I open its profile, then a category-appropriate placeholder is shown and the layout does not collapse.
- Given opening hours are set, when I open the profile, then I see whether it is open or closed right now in India Standard Time, and the next opening time when it is closed.
- Given a provider is inside a declared temporary closure period, when I open its profile, then a notice shows the closure and its end date, and the contact actions are still available but marked as closed.
- Given a provider is not published, suspended or deleted, when I open its address, then I see a "not found" page and a link to the relevant category listing.
- Given a provider's web address has been changed, when I open the old address, then I am permanently redirected to the new one (E9-S4).
- Given I am on a small screen, when I scroll the profile, then the primary contact action stays reachable at the bottom of the screen.

Out of scope
- Live availability or bookable time slots.
- Staff or practitioner profiles.
- Any price other than what the provider entered (no quotes, no estimates).
- Sharing (E3-S5), reviews list behaviour (E5-S2).

### E3-S2 - Service mode and home-visit area
As a pet parent, I want to know whether a provider comes to my home and where they travel, so that I do not enquire with someone who cannot serve me.

Acceptance criteria
- Given a provider's services, when I view the services list, then each service is tagged "At our place", "At your home" or "Both".
- Given a provider offers at least one at-home service, when I open the profile, then a "Home visits" section lists the areas served, as pincodes and/or localities and/or a radius in plain words ("Home visits within 8 km of Sector 56, Gurgaon").
- Given a home-visit area carries an extra travel fee, when I view that area, then the exact fee is shown next to it. The profile is the only place an exact travel fee is shown; search cards carry the generic "travel fee may apply" wording instead (E2-S3).
- Given I have set my location or picked a locality, when I open a profile that offers home visits, then I see a clear "Serves your area" or "Does not serve your area yet" line.
- Given a provider offers no at-home service, when I open the profile, then no "Home visits" section appears anywhere.
- Given a service is marked inactive by the provider, when I open the profile, then it is not listed.

Out of scope
- Distance-based automatic pricing.
- Checking the customer's address against the service area during the request flow (E4-S1 covers the request-time check).

### E3-S3 - Call or WhatsApp the provider
As a pet parent, I want to phone or WhatsApp a provider directly from the profile, so that I can ask a quick question without filling in a form.

Acceptance criteria
- Given a published provider with a phone number, when I tap "Call" on a mobile device, then my phone's dialler opens with that number pre-filled.
- Given a published provider with a WhatsApp number, when I tap "WhatsApp", then WhatsApp opens a chat with that number and a short pre-filled message naming the business and UrbanPetly.
- Given a provider has no WhatsApp number recorded, when I open the profile, then the WhatsApp action is not shown.
- Given I am on a desktop browser, when I view the contact area, then the phone number is visible and selectable rather than only tappable.
- Given I tap "Call" or "WhatsApp", when the action fires, then the event is counted for that provider for E7-S8 statistics, with no personal data about me recorded.
- Given I tap the same contact action repeatedly, when the events are counted, then obvious repeats from the same visit are not inflated into many separate contacts.
- Given an unclaimed listing, when I open it, then contact actions still work on the publicly listed number and the "Unclaimed" label is visible alongside them.

Out of scope
- Call masking, proxy numbers or call recording.
- Measuring whether a call was answered.
- In-app chat.

### E3-S4 - Verification badge and unclaimed label
As a pet parent, I want to know how much UrbanPetly has checked a listing, so that I can judge how much to trust it.

Acceptance criteria
- Given a provider whose verification documents have been approved, when I open its profile or see its card, then a "Verified" badge is shown, and tapping it explains in one sentence what we checked.
- Given a provider that has claimed its listing but has no approved documents, when I view it, then no "Verified" badge is shown and no negative label is shown either.
- Given a listing created by UrbanPetly that nobody has claimed, when I view its profile or card, then an "Unclaimed" label is shown, with a short explanation and an "Is this your business?" link to the claim flow.
- Given an unclaimed listing, when I open its profile, then only publicly available business information is shown - no owner name, no email address, and no reviews-based claims we cannot support.
- Given a provider whose verification was rejected or withdrawn, when I view it, then it is treated exactly as unverified and no reason is shown publicly.
- Given a badge or label, when I use a screen reader, then it is announced with its meaning and not as a decorative image.

Out of scope
- Multiple verification tiers or trust scores.
- Showing which document type was approved.
- Verification badge on reviews (E5).

---

## E4 - Enquiries and booking requests
| ID | Story | Pri |
|---|---|---|
| E4-S1 | As a signed-in customer I can send an enquiry/booking request | P0 |
| E4-S2 | As a provider I get an email and see the request in my dashboard | P0 |
| E4-S3 | As a provider I can accept, decline (with reason) or propose another time | P0 |
| E4-S4 | As a customer I can see request status and cancel a pending request | P0 |
| E4-S5 | Customer is emailed on provider's response | P0 (raised, ADR-027) |
| E4-S6 | Request auto-expires after 72h with no response and the customer is told | P0 (raised, ADR-027) |
| E4-S7 | Either party can mark an accepted request as completed; it auto-completes 48h after the appointment | P0 (new, ADR-014) |

Shared rules for E4
- Status flow: `pending -> accepted | declined | expired | cancelled`, and `accepted -> completed | cancelled`. No other transition is allowed.
- Only a `completed` request unlocks a review (E5-S1).
- The customer's phone number is disclosed to the provider **only after the provider accepts**. Before that, the provider sees the customer's first name and the request details only (06-nfr.md).
- **End of the appointment window (ADR-028).** Several criteria turn on when a request's appointment is over. All four time-window choices in E4-S1 have a defined end, in India Standard Time, on the request's appointment date:

  | Time window chosen | Window ends at |
  |---|---|
  | Morning | 12:00 IST |
  | Afternoon | 17:00 IST |
  | Evening | 21:00 IST |
  | A specific time | that time plus 2 hours IST |

  Wherever a criterion says "the appointment window has passed" or "the end of the appointment window", it means this instant. A specific time of 22:30 therefore ends at 00:30 the following day.
- **The 72-hour response window** runs from the moment the request is sent, or from the moment the provider's most recent proposed time is recorded (E4-S3), whichever is later.

### E4-S1 - Send an enquiry or booking request
As a signed-in pet parent, I want to send a provider a structured request, so that they have everything they need to answer me.

Acceptance criteria
- Given I am on a provider profile and signed in, when I choose "Request booking", then I am taken through three steps: pick a service, give the details (pet, date, time window, mode, address if at home, note), then review and send.
- Given I am signed out, when I choose "Request booking", then sign-in is offered inside the flow and, after I sign in, I continue from where I was with nothing re-entered.
- Given I am on the details step, when I pick a date, then I can only pick today or a date within the next 60 days, and I pick one of: morning, afternoon, evening, or a specific time.
- Given a service offered both at the provider and at home, when I reach the mode choice, then I can pick either; when I pick "At my home" I must choose a saved address or add one.
- Given I pick "At my home" with an address outside the provider's service area, when I try to continue, then I am told the provider does not serve that area and I can change the address or switch to "At their place".
- Given I have pets saved, when I reach the pet choice, then I can pick one or add a new pet without leaving the flow; the pet is optional for categories where it does not apply (e.g. pet transport).
- Given I am on the review step, when I check what I am about to send, then I see exactly what the provider will see, including the note, and I am told my phone number is shared only if they accept.
- Given I send the request, when it succeeds, then I see a confirmation explaining that the provider has 72 hours to reply, and the request appears in my request history as "Pending".
- Given I accidentally submit twice (double tap, flaky network), when both submissions arrive, then only one request is created.
- Given I have already sent 10 requests today, when I try to send another, then I am told the daily limit has been reached and when it resets.
- Given I try to send a request to a provider that is not published, when I submit, then it is refused with a clear message.

Out of scope
- Online payment, deposits or quotes.
- Requesting several services or several providers at once.
- Real-time slot availability (the provider answers manually).
- Attaching photos or documents to a request (P2).

### E4-S2 - Provider receives the request
As a provider, I want to be told immediately and find the request in my dashboard, so that I can respond quickly.

Acceptance criteria
- Given a customer sends me a request, when it is created, then an email reaches my business email address within 5 minutes, naming the service, date, time window, mode, the pet (if given) and the note, with a link that opens the request in my dashboard.
- Given I open that email before accepting, when I read it, then it does **not** contain the customer's phone number, email address or full home address.
- Given a request where the customer chose "At my home", when I read it before accepting, then I see the locality and pincode only, so I can judge travel, but not the full street address.
- Given I sign in to the dashboard, when I open my requests inbox, then pending requests are listed first, newest first, with an unread marker, and the count of pending requests is shown on the dashboard.
- Given my business email address is missing or bounces, when a request arrives, then it still appears in my dashboard and the dashboard shows a prompt to fix my email address.
- Given several requests arrive, when I view the inbox, then each shows how long is left before it expires.
- Given I am a provider, when I open a request that belongs to a different business, then I am refused access.

Out of scope
- SMS or WhatsApp notification of new requests (parking lot, ADR-016).
- Push notifications.
- Auto-accept rules.

### E4-S3 - Provider responds to a request
As a provider, I want to accept, decline or propose another time, so that the customer gets a clear answer.

Acceptance criteria
- Given a pending request, when I accept it, then its status becomes "Accepted", the customer's phone number becomes visible to me, and the customer is told (E4-S5).
- Given a pending request, when I decline it, then I must pick or type a reason, the status becomes "Declined", the reason is shown to the customer, and the customer's phone number is never revealed to me.
- Given a pending request, when I propose another date and time, then the request stays pending, the proposal is recorded on the request, the customer can see it, and my 72-hour window restarts from the proposal.
- Given I have proposed a time, when the customer accepts the proposal, then the request becomes "Accepted" with the proposed date and time.
- Given a request that is already accepted, declined, expired or cancelled, when I try to act on it again, then the action is refused and I am shown the current status.
- Given an accepted request, when I view it, then I see the customer's name, phone number and, for a home visit, the full address.
- Given any response I make, when it is recorded, then the request's timeline shows who did what and when.
- Given I decline a request, when the customer later views it, then the reason is shown in plain language and the customer is invited to look at similar providers.

Out of scope
- Negotiating price in the request.
- Multiple rounds of proposed times (one open proposal at a time).
- Partial acceptance (accepting one service out of several).

### E4-S4 - Customer sees status and cancels
As a pet parent, I want to see where my request stands and to cancel it if my plans change, so that I am not left guessing and the provider is not left waiting.

Acceptance criteria
- Given I have sent requests, when I open my request history, then each one shows the provider, service, date, time window, mode and a status chip, with the most recent first.
- Given I open a request, when it loads, then I see a timeline of what has happened and when - sent, provider responded, cancelled, completed.
- Given a pending request, when I cancel it, then its status becomes "Cancelled", the provider sees it as cancelled in their inbox, and I can no longer act on it.
- Given an accepted request, when I cancel it before the appointment, then its status becomes "Cancelled" and the provider is told.
- Given a request that is declined, expired, cancelled or completed, when I open it, then no cancel action is offered.
- Given an accepted request, when I view it, then I see the provider's phone number so I can call about the appointment.
- Given a request belonging to another customer, when I try to open it, then I am refused access and nothing about the request is revealed.
- Given I have never sent a request, when I open my request history, then I see an empty state inviting me to search.

Out of scope
- Rescheduling by the customer (cancel and re-request in v1).
- Cancellation fees or no-show handling.
- Reminders before an appointment (P2).

### E4-S5 - Customer is told the provider's answer
As a pet parent, I want to hear back as soon as the provider answers, so that I am not refreshing the site to find out.

Raised to P0 (ADR-027): E4-S3 promises "the customer is told" on a P0 screen, so the telling cannot sit in a story that may slip.

Acceptance criteria
- Given a request of mine, when the provider accepts it, then I am emailed within 5 minutes, and the email names the provider, the service, the date and time window, the mode, the provider's phone number, and links to the request.
- Given a request of mine, when the provider declines it, then I am emailed within 5 minutes with the reason in plain language and a link to similar providers, and the email contains no suggestion that I should contact them anyway.
- Given a request of mine, when the provider proposes another date and time, then I am emailed within 5 minutes with the proposed date and time, and the email links me to the request where I can accept it.
- Given I have no email address on file, when the provider answers, then nothing is sent, nothing errors, and the answer is still visible in my request history (E4-S4).
- Given the provider answers, when I open my request history instead of my email, then the status is already up to date - the email is a notification, never the only route to the information.
- Given a provider accepts and then I cancel, when the emails are compared, then each one reflects the state at the time it was sent and no email contradicts the current status shown in the product.
- Given any of these emails, when the provider has not accepted, then it contains nothing about the provider that is not already public.

Out of scope
- SMS or WhatsApp versions of these notifications (parking lot, ADR-016).
- Per-user preferences for turning these emails off (E10-S2; these are transactional and not optional in v1).
- Reminding the customer about an upcoming appointment (P2).

### E4-S6 - A request with no answer expires
As a pet parent, I want a request nobody answered to close itself and tell me, so that I stop waiting and go and find someone else.

Raised to P0 (ADR-027): E4-S1 shows every customer a "the provider has 72 hours to reply" promise and E4-S2 shows every provider a countdown, both on P0 screens. Without expiry those are promises the product does not keep.

Acceptance criteria
- Given a pending request, when 72 hours have passed since the start of its response window (see "Shared rules for E4") with no response from the provider, then its status becomes "Expired" and neither party can act on it any further.
- Given a request expires, when it does, then the customer is emailed within 15 minutes to say the provider did not reply in time, with a link back to search for other providers; the provider is not emailed.
- Given the provider proposed a new time, when 72 hours pass from that proposal with no answer from the customer, then the request expires in exactly the same way and the customer's expiry email says the proposal lapsed.
- Given a pending request, when the provider responds with one minute to spare, then it does not expire and the response stands.
- Given a request the customer cancelled, or that the provider already answered, when the 72 hours pass, then nothing happens to it and no expiry email is sent.
- Given an expired request, when either party opens it, then the timeline shows that it expired and when, and no accept, decline or cancel action is offered.
- Given an expired request, when the customer opens it, then no review option is offered (only completed requests unlock a review).
- Given the job that expires requests does not run for several hours, when it next runs, then every request that should have expired expires, each with one email and no duplicates.

Out of scope
- Nudging the provider before the window closes (P2).
- A provider-configurable response window (72 hours is fixed in v1).
- Automatically re-sending the request to other providers.

### E4-S7 - Completing a request
As a pet parent and as a provider, I want a request to be marked as completed, so that the visit is closed off and the customer can leave a review.

Rationale: in the original spec only the provider could mark a request complete, which meant a provider could block an unflattering review by never completing it. Reviews must not depend on the reviewed party's cooperation.

Acceptance criteria
- Given an accepted request whose end of the appointment window (see "Shared rules for E4") has passed, when either the customer or the provider marks it as completed, then its status becomes "Completed" and both parties see who marked it and when.
- Given an accepted request whose end of the appointment window has not yet passed, when either party tries to mark it completed, then the action is not offered.
- Given an accepted request that neither party has acted on, when 48 hours have passed since the end of the appointment window, then it is automatically marked completed, and the timeline records that it was completed automatically.
- Given an accepted request for the morning window on a given date, when the clock passes 12:00 IST on that date, then the "Mark completed" action becomes available to both parties and auto-completion is due at 12:00 IST two days later.
- Given a request is completed, when the customer opens it, then they are invited to leave a review (E5-S1).
- Given a request is completed, when either party tries to cancel it, then the action is refused.
- Given an accepted request that did not happen, when either party cancels it before the auto-completion window closes, then it becomes "Cancelled" and no review is possible.
- Given a request is completed automatically, when either party disputes it, then they can report it to UrbanPetly from the request page; the report reaches the admin queue.

Out of scope
- Attendance or check-in proof.
- Reopening a completed request.
- Automatic completion of requests that were never accepted.

---

## E5 - Reviews and ratings
| ID | Story | Pri |
|---|---|---|
| E5-S1 | After a completed request I can rate (1-5) and review with optional photos | P0 |
| E5-S2 | Reviews show on the profile and update the average rating | P0 |
| E5-S3 | Provider can publicly reply once to a review | P1 |
| E5-S4 | Anyone signed in can report a review; admin moderates | P0 |
| E5-S5 | Editable for 7 days | P0 (raised, ADR-027) |

The "one review per customer per provider" rule is a P0 constraint and is part of E5-S1 (ADR-013). The 7-day edit window is also P0 (ADR-027): E5-S1 tells a repeat customer to "update my existing one instead", and E5-S2 states that an edited review changes the average - both are P0 criteria that cannot be met without it.

### E5-S1 - Leave a review after a completed request
As a pet parent, I want to rate and review a provider I actually used, so that other parents get an honest picture.

Acceptance criteria
- Given a request of mine that is completed, when I open it, then I am offered "Write a review" for that provider.
- Given I write a review, when I submit it, then I must have given a star rating of 1 to 5; a title and body are optional, and up to 3 photos may be attached.
- Given I submit a review, when it succeeds, then it appears on the provider's profile attributed to my first name and the month of the visit.
- Given I have already reviewed this provider and that review still stands, when I complete another request with them, then I am not offered a second review; I am offered to update my existing one instead (within the window in E5-S5).
- Given I deleted my review for this provider, when I complete another request with them, then I am told I have already used my review for this provider and no new review is offered (ADR-031). A review I deleted does not "still stand", so only this criterion applies to that case.
- Given a request that is pending, accepted, declined, expired or cancelled, when I open it, then no review option is offered.
- Given someone else's completed request, when I try to review against it, then the attempt is refused.
- Given my review body contains contact details such as a phone number or email address, when I submit, then it is held for moderation rather than published immediately.
- Given I attach photos, when they are processed, then any location information embedded in the photo is removed before the photo is shown publicly (06-nfr.md).
- Given I submit a review, when the provider views it, then the provider cannot see my phone number or email address.

Out of scope
- Reviews from walk-in customers with proof of visit (ADR-015 - confirmed out of v1).
- Sub-ratings (cleanliness, punctuality, value).
- Rewarding or incentivising reviews.
- Review helpfulness voting.

### E5-S2 - Reviews on the profile and the average rating
As a pet parent, I want to read reviews and see a trustworthy average, so that I can compare providers.

Acceptance criteria
- Given a provider with published reviews, when I open its profile, then I see the average rating to one decimal place, the number of reviews, a breakdown by star value, and the reviews themselves, newest first.
- Given a provider with more reviews than fit on one screen, when I reach the end of the list, then I can load more without leaving the page.
- Given a new review is published, when the profile is next viewed, then the average rating and review count already include it.
- Given a review is hidden by an admin, when the profile is next viewed, then the review is gone and the average rating and count no longer include it.
- Given a review is edited within its edit window, when it is saved, then the average rating reflects the new star value.
- Given a provider with no published reviews, when I open its profile, then I see "New on UrbanPetly" and an invitation to be the first to review, not a zero rating.
- Given a review has photos, when I view it, then the photos are shown as thumbnails that open full size.
- Given a review written by an account that has since been deleted, when I view it, then it is attributed to "Former user" and contains no personal data (E6-S5).

Out of scope
- Weighting recent reviews more heavily, or any anti-gaming score.
- Sorting or filtering reviews.
- Showing reviews on search result cards beyond the average and count.

### E5-S4 - Report a review
As any signed-in user, I want to report a review I believe is false or abusive, so that it can be checked.

Acceptance criteria
- Given a published review, when I am signed in and choose "Report", then I pick a reason from a short list and may add a comment.
- Given I submit a report, when it succeeds, then I am told it has been received and that we will look at it; the review stays visible meanwhile.
- Given I have already reported a review, when I view it again, then I am shown that I reported it and cannot report it again.
- Given I am signed out, when I choose "Report", then I am asked to sign in first and returned to the review afterwards.
- Given a review is reported, when an admin opens the moderation queue, then the report appears there with the reason, the reporter and the review (E8-S3).
- Given a review receives reports, when the provider views its own profile, then it can see that a review is under review but cannot hide it.

Out of scope
- Automatic hiding after N reports.
- Reporting a provider's reply (handled through the same queue in P1).
- Appeals process.

### E5-S5 - Edit my review for 7 days
As a pet parent, I want to change or remove my review for a short while after writing it, so that I can fix a mistake or soften something I wrote in the heat of the moment.

Raised to P0 (ADR-027): two P0 criteria already depend on it (E5-S1 "update my existing one instead", E5-S2 "a review edited within its edit window changes the average").

Acceptance criteria
- Given a review I posted less than 7 days ago, when I open it, then I am offered "Edit" and "Delete", and I can see how long I have left to change it.
- Given I edit my review within the window, when I save, then the new rating, title, body and photos replace the old ones on the provider's profile, the average rating and star breakdown are recalculated, and the review is marked as edited.
- Given I delete my review within the window, when I confirm, then it disappears from the provider's profile and the average rating and review count no longer include it.
- Given I delete my review within the window, when the deletion succeeds, then my one review for that provider is spent: no new review is offered for that provider or for the completed request it came from, then or later (ADR-031).
- Given I choose "Delete", when I am asked to confirm, then I am told the review is gone for good and that I will not be able to write another one for this provider, and "Edit" is offered as the alternative.
- Given a review I posted more than 7 days ago, when I open it, then no edit or delete action is offered and I am told the window has closed.
- Given I complete another request with a provider whose review of mine still stands, when the earlier review is still inside its 7-day window, then I am offered to update it (E5-S1); when the window has closed, then I am told my existing review stands and no second review is created. A review I deleted does not still stand and is never offered for update; that case is E5-S1's (ADR-031).
- Given my edited review contains contact details, when I save it, then it is held for moderation exactly as a new review would be (E5-S1) and the previous version stays public meanwhile.
- Given an admin hid my review, when I try to edit it inside the window, then the edit is refused and I am shown why it was hidden.
- Given someone else's review, when I try to edit or delete it, then the attempt is refused.
- Given I edit my review, when the provider views it, then the provider sees the current version only and is not emailed again.

Out of scope
- An edit history visible to customers or providers (the audit trail is internal, E8-S8).
- Extending or reopening the window on request.
- Editing a review's attached photos individually (re-attach the set).

---

## E6 - Customer account and pets
| ID | Story | Pri |
|---|---|---|
| E6-S1 | Create and edit my profile (name, email, saved addresses) | P0 |
| E6-S2 | Add pet profiles (name, species, breed, age, weight, notes, photo) | P0 |
| E6-S3 | Save favourite providers | P1 |
| E6-S4 | View my request history | P0 |
| E6-S5 | Delete my account and data (DPDP right to erasure) | P0 |

### E6-S1 - My profile and addresses
As a pet parent, I want to keep my name, email and addresses, so that sending a request is quick and providers know who is coming.

Acceptance criteria
- Given I am signed in, when I open my account, then I see my name, my mobile number, my email address if set, and my saved addresses.
- Given I edit my name or email address, when I save, then the change is stored and shown immediately.
- Given I enter an email address that is not a valid address, when I save, then I see an inline error and nothing is saved.
- Given my mobile number, when I view my account, then it is shown but cannot be edited in v1, with a note that it is my sign-in identity.
- Given I add an address, when I save it, then I must give at least a street line, a locality or city, and a 6-digit pincode, and I can label it (Home, Work, other).
- Given I have more than one address, when I mark one as default, then it is pre-selected the next time I request a home visit.
- Given an address is used by a pending or accepted request, when I delete it, then the request still shows the address it was sent with.
- Given I have no addresses, when I start a home-visit request, then I am asked to add one inside the flow (E4-S1).

Out of scope
- Picking an address on a map or address autocomplete.
- Changing the mobile number.
- Separate billing addresses.

### E6-S2 - Pet profiles
As a pet parent, I want to save my pets' details, so that I do not retype them for every request and the provider knows what to expect.

Acceptance criteria
- Given I am signed in, when I add a pet, then I must give a name and a species (dog, cat, other); breed, date of birth, weight, sex, notes and a photo are optional.
- Given I save a pet with a date of birth, when I view it, then the age is shown in years and months, calculated from today.
- Given I add a photo, when it finishes uploading, then it appears on the pet card; while it uploads I see progress and can still save the rest.
- Given I edit or delete a pet, when I save, then my request history still shows the pet details as they were when each request was sent.
- Given I have pets saved, when I send a request, then I can pick one of them in the flow (E4-S1).
- Given I have no pets, when I open the pets section, then I see an empty state explaining why saving a pet helps.
- Given another user's pet, when I try to open or edit it, then I am refused access.
- Given I enter a weight, when I save, then it must be a positive number under 150 kg.

Out of scope
- Vaccination records, medical history or reminders.
- Sharing a pet profile with a provider outside a request.
- More than one photo per pet.

### E6-S4 - My request history
See E4-S4 - the customer-facing status, timeline and cancel behaviour is specified there. E6-S4 covers only the account-level entry point.

Acceptance criteria
- Given I am signed in, when I open "My requests" from my account, then I see all my requests grouped as Active (pending, accepted) and Past (completed, declined, expired, cancelled).
- Given I have a request awaiting my attention - a proposed time to accept, or a completed visit to review - when I open "My requests", then that request is surfaced at the top with the action named.
- Given I have many past requests, when I scroll, then older ones load as I go.
- Given I filter by status, when the list reloads, then only requests with that status are shown.

Out of scope
- Exporting request history.
- Searching within request history.

### E6-S5 - Delete my account
As a pet parent, I want to delete my account and personal data, so that I can exercise my right to erasure under the DPDP Act.

Acceptance criteria
- Given I am signed in, when I open "Delete my account", then I am shown in plain English exactly what will be deleted, what will be kept, and that the action cannot be undone.
- Given I confirm the deletion, when it completes, then I am signed out, cannot get back into the deleted account, and my name, email address, addresses, pets and pet photos are gone.
- Given my account is deleted, when I sign in again with the same mobile number, then signing in still works and I land in a brand-new empty account - the number is never blocked from the product, only detached from everything the old account held.
- Given I had written reviews, when my account is deleted, then the reviews remain but are attributed to "Former user" and contain nothing that identifies me.
- Given I had sent requests, when my account is deleted, then the providers' records of those requests no longer carry my name, phone number or address, while the fact that a request happened is kept for the provider's own history.
- Given I have a pending or accepted request, when I start the deletion, then I am told those requests will be cancelled and the providers notified, and I must confirm.
- Given the deletion completes, when I look for my data anywhere in the product, then it is not visible to customers, providers or admins.
- Given I ask to delete my account, when the request is processed, then it completes within the time stated in the privacy policy and I receive a confirmation if I had an email address on file.
- Given a deleted account, when someone signs up later with the same number, then they get a brand-new empty account with no trace of the previous one - no name, no addresses, no pets, no request history and no reviews carried over.

Out of scope
- Downloading a copy of my data before deletion (P1, right of access).
- Deleting a provider business account (E8-S7 suspension covers v1).
- Deletion of backups before the backup retention window expires (documented in the privacy policy instead).

---

## E7 - Provider onboarding and dashboard
| ID | Story | Pri |
|---|---|---|
| E7-S1 | Sign up as a provider (OTP), create a business profile, choose categories | P0 |
| E7-S2 | Claim an existing unclaimed listing | P0 |
| E7-S3 | Manage services, prices, durations, service mode and service area | P0 |
| E7-S4 | Manage photos (upload, reorder, delete) | P0 |
| E7-S5 | Set opening hours, holidays and temporary closures | P0 |
| E7-S6 | Manage enquiries inbox (E4) | P0 |
| E7-S7 | Submit documents for verification | P1 |
| E7-S8 | Basic stats: profile views, calls, enquiries (30 days) | P2 |
| E7-S9 | Multiple staff users per business | P2 |

Shared rules for E7 - which edits need admin review (ADR-026)

A published listing has two kinds of editable field. The split below is the single source of truth for the whole epic; no story in E7, E8 or elsewhere may widen or narrow it.

| | Fields | What happens when the provider of a published listing edits one |
|---|---|---|
| **Gated** - admin review before the change is public | Business name, description, categories, address line, map pin, locality, pincode, contact phone number, WhatsApp number, email address, website, and **adding a photo** | The edit is held as a pending change, the current public version stays live and unchanged, and the item appears in the admin review queue (E8-S2). |
| **Ungated** - public as soon as it is saved | Services (add, edit, deactivate, delete), prices and price units, durations, service mode, opening hours, holidays and temporary closures, service areas and travel fees, **photo ordering** including which photo is the cover, and **removing a photo** | The change is live immediately. No review, no queue item. |

- The line is identity and claims we have vouched for (gated) versus day-to-day trading information a provider must be able to correct the same morning (ungated).
- Photos are deliberately asymmetric. Adding one puts unvetted imagery in front of customers, so it waits for review; removing one is how a provider fixes a wrong, embarrassing or privacy-breaking photo, so it must never wait for us. Reordering only rearranges photos we have already approved.
- A provider may have at most one pending **set of gated field changes** at a time, however many fields were saved together. Saving again replaces that whole pending set with the new one - the admin always reviews the provider's latest intent, never a queue of successive drafts, and approving it applies every field in the set at once. The admin sees the set with each changed field highlighted against the live value (E8-S2). Added **photos** are the exception: each queues and is approved or rejected on its own, so one slow photo never holds up the rest.
- Ungated edits stay live while a gated change is pending. The two never block each other.
- A listing that is not yet public (draft, submitted, or rejected and being reworked) has no gated fields - nothing is public, so everything is edited freely until it is submitted.
- Edits made by an admin are never gated, on any field (E8-S5).

### E7-S1 - Provider sign-up and business profile
As a pet business owner, I want to list my business myself, so that pet parents can find me.

Acceptance criteria
- Given I am on the provider site and signed out, when I choose "List your business", then I sign in with my mobile number and an OTP (E1-S1) and land on an onboarding wizard.
- Given I am in the wizard, when I move through it, then the steps are: business details, categories, location, services and prices, photos, opening hours, then submit.
- Given I am part-way through the wizard, when I leave and come back later, then everything I entered is still there and I resume at the step I left.
- Given the business details step, when I save, then I must give a business name, a contact phone number, an address line, a city, a locality and a pincode; a description, email address, website and WhatsApp number are optional.
- Given the categories step, when I save, then I must pick at least one and at most three categories, and the first one I pick is my primary category.
- Given the location step, when I save, then a map pin must be placed, pre-positioned from my locality and pincode, and I can drag it to the exact spot.
- Given I have not completed every required step, when I try to submit, then I am told exactly which steps are incomplete and taken to the first one.
- Given I submit my profile, when it succeeds, then my listing is not public yet, I see "Submitted for review" with what happens next, and it appears in the admin review queue (E8-S2).
- Given my submitted profile is approved, when the approval happens, then my listing becomes public and I am emailed.
- Given my submitted profile is rejected, when the rejection happens, then I see the reason in my dashboard, my listing stays private, and I can edit and resubmit (ADR-017).
- Given a business name that already exists at a similar address, when I submit, then the admin queue flags it as a possible duplicate (E8-S2).
- Given my listing is public, when I edit a **gated** field (see "Shared rules for E7"), then the change goes back through review before it is public, and the current public version stays live meanwhile.
- Given my listing is public, when I edit an **ungated** field, then the change is public as soon as I save it and no review queue item is created.
- Given I have a gated change waiting for review, when I open my dashboard, then I can see exactly which fields are pending, what the live value still is, and that I can withdraw the change.

Out of scope
- Verification documents (E7-S7) - a business can be published without them, it simply is not "Verified" (ADR-019).
- Staff users (E7-S9).
- Bulk creation of several branches under one account (P2).

### E7-S2 - Claim an unclaimed listing
As a pet business owner, I want to take over the listing UrbanPetly already created for my business, so that I control what it says.

Acceptance criteria
- Given an unclaimed listing, when I open it as a visitor, then I see "Is this your business?" leading to the claim flow.
- Given I start a claim and the mobile number I sign in with matches the number on the listing, when I verify that number with an OTP, then the claim is approved immediately, the listing becomes mine, and the "Unclaimed" label disappears.
- Given I start a claim and my number does not match the listing, when I submit the claim, then I am asked for evidence that I run the business, the claim goes to the admin queue as pending, and I am told we will respond.
- Given a pending manual claim, when an admin approves it, then the listing becomes mine and I am emailed; when an admin rejects it, then I am emailed with the reason and the listing stays unclaimed.
- Given a listing that has already been claimed, when I try to claim it, then I am told it is already claimed and offered a way to report a mistake.
- Given I have a claim pending on a listing, when I start another claim on the same listing, then no second claim is created.
- Given I claim a listing successfully, when I open my dashboard, then I can edit everything about it exactly as if I had created it (E7-S1, S3, S4, S5).
- Given a listing I have just claimed, when customers view it, then the information that was already there stays live while I edit, and my edits follow the gated / ungated split in "Shared rules for E7" exactly as they would on a listing I created myself.

Out of scope
- Transferring a listing from one owner to another (admin does this manually in v1).
- Merging duplicate listings (admin, E8-S5).
- Claiming by email or postcard verification.

### E7-S3 - Manage services, prices and service area
As a provider, I want to list what I offer, at what price and where, so that customers know what to ask for.

Acceptance criteria
- Given my dashboard, when I add a service, then I must give a name, a category from the ones I selected, a starting price in rupees and a price unit (flat, per hour, per day, per km, per visit), and a service mode (at my place, at the customer's home, or both).
- Given a service, when I save it, then I may optionally add a description, an upper price, a duration in minutes, and which pet types it applies to.
- Given an upper price lower than the starting price, when I save, then I see an inline error and nothing is saved.
- Given a service, when I mark it inactive, then it disappears from my public profile and from search, and existing requests referring to it are unaffected.
- Given I offer at least one service at the customer's home, when I save, then I must define at least one service area - a list of pincodes, a list of localities, or a radius in km around my address - and I may add a travel fee per area.
- Given no service of mine is at the customer's home, when I view my dashboard, then the service area section is hidden.
- Given I define a service area, when I save it, then my public profile shows it in plain words and the "At home" tag appears on my cards in search (E2-S3).
- Given I reorder my services, when I save, then my public profile lists them in that order.
- Given I delete a service that a pending request refers to, when I confirm, then the service is removed from my profile and the request still shows what was originally asked for.
- Given I change a price, when I save, then the new price appears on my public profile immediately without a further admin review - prices are ungated ("Shared rules for E7").
- Given I add, edit, deactivate or delete a service, or change a service area or travel fee, when I save, then the change is public immediately and no review queue item is created.

Out of scope
- Per-pet-size or per-breed pricing tiers.
- Packages, bundles and discounts.
- Seasonal or time-of-day pricing.
- Automatic distance-based travel fees.

### E7-S4 - Manage photos
As a provider, I want good photos on my listing, so that parents trust what they see.

Acceptance criteria
- Given my dashboard, when I upload a photo, then only JPEG, PNG and WebP files up to 8 MB are accepted and anything else is rejected with a clear message (06-nfr.md).
- Given I upload a photo, when it is processing, then I see progress, and when it is ready it appears in my dashboard gallery marked "Waiting for review" and is not yet on my public profile ("Shared rules for E7").
- Given a photo I have uploaded, when an admin approves it, then it appears on my public profile and the "Waiting for review" marker is gone; when an admin rejects it, then I see the reason in my dashboard and it never becomes public.
- Given my listing has never been published, when I upload photos during onboarding, then they are reviewed as part of the whole profile submission (E7-S1) rather than one by one.
- Given I have 20 photos counting those waiting for review, when I try to upload a 21st, then I am told the limit and asked to remove one first.
- Given several photos, when I reorder them, then the first one becomes my cover photo on cards and at the top of my profile immediately - ordering is ungated.
- Given a photo, when I delete it, then it disappears from my public profile immediately, with no review step, whether or not it had been approved.
- Given a photo containing location information, when it is published, then that information has been removed (06-nfr.md).
- Given a very large photo, when it is published, then smaller versions are served to small screens so the page stays fast (06-nfr.md).
- Given an upload fails or is abandoned, when I return to the gallery, then I do not see a broken or half-uploaded photo.
- Given I have no photos, when I view my dashboard, then the profile completeness prompt tells me photos are the single biggest improvement I can make.

Out of scope
- In-product cropping, filters or editing.
- Video.
- Per-service photo galleries.
- Automatic image moderation.

### E7-S5 - Opening hours and closures
As a provider, I want my opening hours to be right, so that customers do not turn up when I am shut.

Acceptance criteria
- Given my dashboard, when I set opening hours, then I can set them per weekday, with more than one period in a day (e.g. 10:00-14:00 and 17:00-20:00), or mark the day closed.
- Given a closing time earlier than the opening time in the same period, when I save, then I see an inline error and nothing is saved.
- Given overlapping periods on the same day, when I save, then I see an inline error naming the overlap.
- Given I save my hours, when a customer views my profile, then the current open or closed state is shown in India Standard Time, with the next opening time when I am closed (E3-S1).
- Given I add a temporary closure with a start and end date and an optional reason, when I save it, then my profile shows a closure notice for those dates and I am excluded from the "Open now" filter during them (E2-S4).
- Given a closure whose end date is in the past, when the dates pass, then the notice disappears from my profile automatically.
- Given a closure end date before its start date, when I save, then I see an inline error.
- Given I am open 24 hours on a day, when I set it, then the profile says "Open 24 hours" rather than "00:00-23:59".
- Given I have not set any hours, when a customer views my profile, then it says "Hours not provided" rather than showing me as closed, and I am excluded from the "Open now" filter.
- Given my listing is public, when I change my hours or add a closure, then the change is on my profile immediately with no admin review - hours and closures are ungated ("Shared rules for E7").

Out of scope
- Per-service hours.
- Public holiday calendars.
- Hours per staff member.
- Bookable capacity or slot limits.

### E7-S6 - Requests inbox
The provider-side behaviour is specified in E4-S2 and E4-S3. E7-S6 covers only the inbox screen itself.

Acceptance criteria
- Given my dashboard, when I open the requests inbox, then I can filter by Pending, Accepted, Completed and Closed (declined, expired, cancelled), with Pending shown by default.
- Given a request in the inbox, when I view the row, then I see the customer's first name, the service, the date and time window, the mode, and how long is left to respond.
- Given a pending request, when I act on it from the list, then I can accept or decline without opening the full page; proposing a time opens the full page.
- Given I have unanswered pending requests, when I open the dashboard home, then the count is shown prominently.
- Given no requests at all, when I open the inbox, then I see an empty state explaining how customers find and contact me.

Out of scope
- Bulk accept or decline.
- Saved reply templates.
- Exporting the inbox.

---

## E8 - Admin back office
| ID | Story | Pri |
|---|---|---|
| E8-S1 | Admin signs in (phone OTP + allowlist, role `admin`) | P0 |
| E8-S2 | Review and approve/reject new or edited provider profiles and verification documents | P0 |
| E8-S3 | Moderate reviews and reports (hide, restore, warn) | P0 |
| E8-S4 | Manage categories, services templates, cities, localities | P1 |
| E8-S5 | Create/edit listings on behalf of providers; mark as unclaimed | P0 |
| E8-S6 | Bulk import listings from CSV with a dry-run preview and error report | P0 (raised, ADR-013) |
| E8-S7 | View and search users; suspend a user or provider | P1 |
| E8-S8 | Audit log of admin actions | P1 |

### E8-S1 - Admin sign-in
As UrbanPetly staff, I want a separate, tightly controlled way into the back office, so that only we can reach it.

Acceptance criteria
- Given a mobile number that is on the admin allowlist, when I sign in with an OTP, then I reach the admin back office.
- Given a mobile number that is not on the allowlist, when I complete the OTP step correctly, then I am refused with a generic message and I am not told that an allowlist exists.
- Given I am signed in as a customer or provider, when I open an admin address, then I am refused and nothing about the back office is revealed.
- Given I am an admin, when my session is idle for 60 minutes, then I am signed out of the back office and must sign in again.
- Given the admin app, when a search engine fetches it, then it is excluded from indexing (06-nfr.md).
- Given any admin sign-in attempt, successful or not, when it happens, then it is recorded for audit.

Out of scope
- Roles within admin (all admins are equal in v1).
- Two-factor beyond the OTP itself.
- Self-service admin invitations - the allowlist is managed by the founder outside the product.

### E8-S2 - Review provider profiles and verification documents
As an admin, I want to check listings before they go public, so that the directory stays accurate and trustworthy.

Acceptance criteria
- Given a provider has submitted a new profile, when I open the review queue, then it appears with the business name, categories, location, services, photos and who submitted it, oldest first.
- Given a provider has edited a gated field on a live profile ("Shared rules for E7"), when I open the queue item, then I see the current public version and the proposed version side by side with the changes highlighted, and only gated fields appear in the diff. One queue item is one pending set of changes, however many fields it contains; approving or rejecting it decides the whole set at once.
- Given a provider has added photos to a live profile, when I open the queue item, then each new photo is shown and I can approve or reject it with a reason.
- Given a queue item, when I approve it, then the listing becomes public (or the edit goes live), the provider is emailed, and the item leaves the queue.
- Given a queue item, when I reject it, then I must give a reason, the listing stays private (or the live version stays unchanged), the provider sees the reason and can resubmit, and the item leaves the queue (ADR-017).
- Given a listing flagged as a possible duplicate, when I open it, then the likely duplicates are listed so I can compare before deciding.
- Given a provider has submitted verification documents, when I open them, then I can view each one, approve or reject it with a reason, and the provider is told the outcome.
- Given every required document is approved, when I mark the business verified, then the "Verified" badge appears on its profile and cards (E3-S4).
- Given a verification document, when I view it, then the link that let me see it stops working shortly afterwards and the document is never publicly reachable (06-nfr.md).
- Given I approve, reject or verify anything, when the action completes, then it is recorded with my identity and the time (E8-S8).
- Given a queue with nothing in it, when I open it, then I see an empty state, not an error.

Out of scope
- Automated or AI-assisted checking of documents.
- A service-level target for review turnaround (tracked operationally, not enforced by the product).
- Partial approval of a profile edit (approve or reject the whole submission).

### E8-S3 - Moderate reviews and reports
As an admin, I want to deal with reported reviews, so that the directory is fair to both sides.

Acceptance criteria
- Given a review has been reported, when I open the moderation queue, then it appears with the review text, the rating, the provider, the reporter and the reason, oldest first.
- Given a reported review, when I hide it, then I must give a reason, it disappears from the public profile, the provider's rating and review count are recalculated without it, and the author is told it was hidden and why.
- Given a hidden review, when I restore it, then it reappears on the profile and the rating and count include it again.
- Given a reported review, when I dismiss the report, then the review stays visible, the report is closed, and the reporter is not told who decided.
- Given a review that breaks the rules badly, when I hide it, then I can also suspend its author (E8-S7) from the same screen.
- Given I act on a review, when the action completes, then it is recorded with my identity, the reason and the time (E8-S8).
- Given a review held for moderation because it looked like it contained contact details (E5-S1), when I open the queue, then it appears there and I can publish or hide it.
- Given reviews that have never been reported, when I search the moderation area, then I can still find a specific review by provider or by author in order to act on it.

Out of scope
- Editing the text of a review.
- Warning templates and a warning history per user (the "warn" action in v1 is an email plus an audit entry).
- Automatic hiding based on word lists.

### E8-S5 - Create and edit listings on behalf of providers
As an admin, I want to add businesses myself, so that the directory has content before providers sign up.

Acceptance criteria
- Given the admin back office, when I create a listing, then I can fill in the same information a provider would (E7-S1, S3, S5) and set it live without a separate review step.
- Given a listing I create, when I save it, then it is marked unclaimed by default and shows the "Unclaimed" label publicly (E3-S4).
- Given an unclaimed listing, when I record where the information came from, then that source is stored for our records and never shown publicly (00-product-brief.md §6).
- Given an unclaimed listing, when I edit it, then the change goes live immediately without a review step.
- Given a listing that a provider has claimed, when I edit it, then the change goes live immediately and the provider can see that UrbanPetly made it.
- Given a listing, when I unpublish it, then it disappears from search and its profile address returns "not found".
- Given I create or edit a listing, when the action completes, then it is recorded with my identity and the time (E8-S8).
- Given I am creating a listing, when I enter a business name and address similar to an existing one, then I am warned about the possible duplicate before saving.

Out of scope
- Scraping any third-party source to populate listings (00-product-brief.md §6 - forbidden).
- Merging two existing listings (manual data fix in v1).
- Admin-side photo uploading at scale (CSV import covers bulk, E8-S6).

### E8-S6 - CSV import of listings
As an admin, I want to load many listings at once from a spreadsheet, so that we can reach useful coverage before launch.

Raised to P0 (ADR-013) because of the supply target, not the Phase 1 exit criterion. Phase 1's exit ("a visitor can find and view seeded providers on staging") is already met by E12-S7 seed data plus hand-entry in E8-S5. What hand-entry cannot reach is the 500-listing coverage target in 00-product-brief.md §7: at a realistic few minutes per listing that is weeks of admin typing, and the Phase 4 plan of onboarding the first ~50 providers by hand only underlines the gap. Import is how the directory gets to launch size, so it blocks launch.

Acceptance criteria
- Given a CSV file in the documented format, when I upload it as a dry run, then nothing is saved and I see how many rows would be created, how many updated, and how many rejected.
- Given a dry run, when rows are rejected, then I see each rejected row number with the reason in plain English (missing business name, unknown city, invalid pincode, bad price).
- Given a dry run I am happy with, when I confirm the import, then exactly the rows the dry run said would be created or updated are created or updated, and the rejected ones are skipped.
- Given an imported listing, when it is created, then it is unclaimed and published, exactly as if I had created it by hand (E8-S5).
- Given an import, when a listing is created or updated by it, then that listing records where its information came from, taken from a source column in the file or from a single source I give for the whole file; the import is refused if neither is present. The source is stored for our records and never shown publicly (00-product-brief.md §6, E8-S5).
- Given an import, when each listing is created or updated, then the listing also records which import batch did it, so a batch can be found again afterwards.
- Given a CSV with a row whose business name and address match an existing listing, when I import, then that row updates the existing listing rather than creating a duplicate, and the summary says so.
- Given a CSV that is not in the expected format at all, when I upload it, then I am told what columns are expected and nothing is imported.
- Given an import that fails part-way, when I look at the result, then either everything in the batch was applied or nothing was, never a partial mess.
- Given a completed import, when I open the result, then I can download a report of what happened for every row.
- Given an import, when it completes, then it is recorded with my identity, the file name, the counts and the time (E8-S8).
- Given a CSV with 1000 rows, when I import it, then the back office stays usable and I am told when the import has finished.
- Given a finished import I should not have run, when I open it and choose "Undo this import", then in one confirmed action every listing the batch **created** is unpublished - it leaves search, its profile address returns "not found", and it is back in draft. Nothing is deleted outright: a customer may already have enquired, and that history must survive (ADR-030).
- Given the same undo, when the batch had also **updated** existing listings, then those are not touched automatically; I am shown the list of them with the values each one held before the import, so I can put any of them back by hand.
- Given an undone import, when I look at it afterwards, then it is clearly marked as undone, with who undid it and when, and the undo action is not offered a second time.
- Given a listing the batch created that a provider has since claimed, when I undo the import, then that listing is **not** unpublished; it is listed as skipped with the reason, because it now belongs to someone.
- Given an undo, when it completes, then it is recorded with my identity, the batch and the time (E8-S8).

Out of scope
- Importing photos, opening hours or reviews.
- Scheduled or automatic imports from an external feed.
- Exporting listings to CSV (P1).
- Automatic rollback of the rows an import **updated** (restored by hand from the before-values, ADR-030).
- Undoing an import after a later import has changed the same listings (the admin resolves that by hand).

---

## E9 - SEO and content pages
| ID | Story | Pri |
|---|---|---|
| E9-S1 | Prerendered landing pages: `/{city}/{category}` and `/{city}/{locality}/{category}` | P0 |
| E9-S2 | Provider pages have correct title/meta/OpenGraph and JSON-LD (`LocalBusiness`) | P0 |
| E9-S3 | `sitemap.xml` and `robots.txt` generated at build/deploy and refreshed on a schedule | P0 |
| E9-S4 | Canonical URLs, clean slugs, 301 redirects for renamed slugs | P0 |
| E9-S5 | Static content pages: about, contact, privacy, terms, FAQ, blog shell | P1 |

### E9-S1 - Prerendered landing pages
As a pet parent searching Google, I want to land on a useful UrbanPetly page, so that I find a provider without going through the home page.

Acceptance criteria
- Given a city and category combination with at least one published provider, when a crawler that does not run JavaScript fetches the page, then the returned HTML already contains the page title, one H1, an introduction paragraph and the list of providers with their names, localities and starting prices.
- Given a locality, category and city combination with at least 3 published providers, when it is fetched the same way, then the same applies (ADR-029).
- Given a locality and category combination with fewer than 3 published providers, when a crawler that does not run JavaScript fetches it, then the returned HTML carries that page's own title and meta description and a canonical address pointing at the matching city and category page; the page is **not** marked "do not index", and it is not in the sitemap (ADR-029).
- Given such a below-threshold page with at least one published provider, when a person opens it in a browser, then it is a normal working page showing the one or two providers it does have, not an error and not a redirect.
- Given a locality and category combination with **no** published providers, when a person opens it in a browser, then it is a normal working page - not an error and not a redirect - showing the same empty state as the city-level one in E2-S1: the other categories in that locality and the same category in neighbouring localities of that city.
- Given that same zero-provider page, when a crawler that does not run JavaScript fetches it, then the returned HTML carries that page's own title and meta description, a canonical address pointing at the matching city and category page, and those empty-state links as real content, so it is never a blank page that reads as a soft 404 (06-nfr.md); like any below-threshold page it is kept out of the sitemap and is **not** marked "do not index" (ADR-029).
- Given a below-threshold page crosses to 3 published providers, when the next scheduled refresh runs, then it is prerendered, enters the sitemap, and its canonical becomes its own address.
- Given a page that is prerendered and in the sitemap, when it is fetched, then its canonical is its own address and never the city and category page.
- Given any prerendered page, when I open it in a browser, then it becomes a normal interactive page - filters, sorting and paging all work.
- Given two different prerendered pages, when I compare them, then their titles, meta descriptions and introduction text are distinct and name the actual city, locality and category.
- Given a prerendered page, when it loads on a throttled mobile connection, then it meets the Core Web Vitals budgets in 06-nfr.md.
- Given a new provider is published, when the next scheduled refresh runs, then it appears on the relevant prerendered pages without a manual deploy.
- Given a city or category that does not exist, when it is requested, then a proper "not found" response is returned, not an empty page that looks like a result.
- Given a locality that does not exist, or a locality that is not part of the city in the address, when the page is requested, then a proper "not found" response is returned - the zero-provider empty state above is only ever for a real locality of that city that has no supply yet, so "we have nothing here" and "there is no such place" are never the same response.

Out of scope
- Prerendering every provider profile (E9-S2 covers the approach for those).
- Editorially written city guides or blog content (E9-S5, and content is the founder's).
- Hindi versions of landing pages.

### E9-S2 - Provider page metadata and structured data
As a pet parent searching Google, I want a provider's UrbanPetly page to show useful information in the search result, so that I can judge it before clicking.

Acceptance criteria
- Given a published provider, when a crawler that does not run JavaScript fetches its profile, then the HTML contains a title naming the business, its primary category and its locality, a meta description, OpenGraph tags with the cover photo, and structured data describing the business.
- Given the structured data, when it is checked with a standard validator, then it passes with no errors, and it includes name, address, geo coordinates, phone number, opening hours, price range and - where there are reviews - the aggregate rating.
- Given a provider with no reviews, when its structured data is produced, then no aggregate rating is included rather than a rating of zero.
- Given a provider is unpublished or suspended, when its profile is fetched, then a "not found" response is returned and it is not in the sitemap.
- Given a provider's cover photo changes, when the page is next fetched, then the OpenGraph image reflects the new photo.
- Given a provider profile link is pasted into WhatsApp, when the preview renders, then it shows the business name, locality, rating and cover photo.
- Given an unclaimed listing, when its page is produced, then the structured data contains only information we may publish and no owner details (00-product-brief.md §6).

Out of scope
- Rich results for individual services or offers.
- Review snippets markup beyond the aggregate rating.
- Submitting URLs to search engines through an API.

### E9-S3 - Sitemap and robots
As the business, I want search engines to find and respect the right pages, so that our organic traffic target is reachable.

Acceptance criteria
- Given the site, when `/sitemap.xml` is requested, then a valid sitemap is returned listing the home page, every active city page, every qualifying city-category and locality-category page (ADR-029), every published provider profile, and the public static pages.
- Given a sitemap entry, when I inspect it, then it has a last-modified date that reflects when that page's content last changed.
- Given more than 50,000 URLs, when the sitemap is produced, then it is split into a sitemap index with child sitemaps.
- Given a provider is unpublished, suspended or deleted, when the sitemap is next refreshed, then that URL is gone from it.
- Given the sitemap, when the scheduled refresh runs each night, then it reflects the state of the catalogue at that time without a deploy.
- Given `/robots.txt` is requested, then it allows the public site, disallows the account, provider and admin areas, and points at the sitemap.
- Given the staging environment, when `/robots.txt` is requested, then it disallows everything.
- Given the admin app, when any of its pages is fetched, then it tells search engines not to index it (06-nfr.md).

Out of scope
- Search Console account setup and URL submission (founder, operational).
- Image or video sitemaps.
- IndexNow or similar ping protocols.

### E9-S4 - Canonicals, slugs and redirects
As the business, I want one address per piece of content, so that search engines do not split or penalise our pages.

Acceptance criteria
- Given any public page, when it is fetched, then it declares a single canonical address that is absolute and uses the production domain.
- Given a page reached with tracking or filter parameters in the address, when it is fetched, then its canonical address points at the clean version of the page.
- Given a provider, when its listing is first published, then its web address uses a readable slug built from its business name and locality, in lower case with hyphens.
- Given two businesses that would produce the same slug, when the second is published, then it gets a distinct slug and neither address breaks.
- Given a provider's slug changes, when the old address is requested, then it permanently redirects to the new one, and the old address is removed from the sitemap.
- Given a chain of slug changes, when the oldest address is requested, then it redirects straight to the current one in a single hop.
- Given a page address with a trailing slash or different capitalisation, when it is requested, then it redirects permanently to the single canonical form.
- Given a locality-category page below the 3-provider threshold (ADR-029), when it is fetched, then its canonical points at the corresponding city-category page and the page is not marked "do not index" - a "do not index" instruction and a canonical pointing elsewhere are contradictory signals and search engines discard the canonical.
- Given any public page that is not prerendered, when a crawler that does not run JavaScript fetches it, then the returned HTML already carries that page's own title, meta description and canonical - never a generic placeholder shared by every address.

Out of scope
- Vanity or short URLs.
- Internationalised addresses.
- Redirect management UI for admins (slug changes are rare and handled by the product).

---

## E10 - Notifications
| ID | Story | Pri |
|---|---|---|
| E10-S1 | Transactional emails with templates | P0 |
| E10-S2 | Per-user email preferences and unsubscribe for non-essential mail | P1 |
| E10-S3 | Email sending is swappable between providers | P0 |

### E10-S1 - Transactional emails
As a user of either side, I want to be emailed when something happens that needs me, so that I do not have to keep checking the site.

Acceptance criteria
- Given a customer sends a request, when it is created, then the provider is emailed within 5 minutes with the request details and a link to act on it (E4-S2).
- Given a provider accepts, declines or proposes a new time, when the response is recorded, then the customer is emailed with the outcome and a link to the request.
- Given a provider's profile is approved or rejected, when the decision is recorded, then the provider is emailed, including the reason when rejected.
- Given a provider's verification documents are approved or rejected, when the decision is recorded, then the provider is emailed.
- Given a customer posts a review, when it is published, then the provider is emailed with the rating and a link to it.
- Given a request expires with no response, when it expires, then the customer is emailed (E4-S6) and the provider is not.
- Given any of these emails, when I read it, then the sender is clearly UrbanPetly, the subject names the action, the content works as plain text as well as formatted, and there is a link to the relevant page.
- Given any email sent before a provider has accepted a request, when I read it, then it contains no customer phone number, email address or full street address (06-nfr.md).
- Given a send fails, when it is retried, then it is retried a limited number of times and a permanent failure is recorded for support to see, without blocking the action that triggered it.
- Given a user has no email address on file, when an event would email them, then nothing is sent, nothing errors, and the information is still visible in the product.
- Given an email is sent, when I look at the application logs, then no full email address or message body is written to them.

Out of scope
- Marketing or digest emails (E10-S2 covers preferences; campaigns are post-launch).
- SMS and WhatsApp notifications (parking lot, ADR-016).
- Localised (Hindi) email templates.
- In-product notification centre (P2).

### E10-S3 - Swappable email sending
As the business, I want to change email provider without changing product behaviour, so that we are not locked in and tests do not send real mail.

Acceptance criteria
- Given the test and local environments, when any email would be sent, then it is captured for inspection and no real email leaves the system.
- Given the staging environment, when any email would be sent, then it only reaches addresses on an allowlist.
- Given production, when the email provider is changed in configuration, then no email content or trigger changes and no code change is needed.
- Given the email provider is unavailable, when an email is attempted, then the user-facing action still succeeds and the failure is recorded for retry (E10-S1).
- Given an automated test, when it asserts on an email, then it can check the recipient, subject and content of what would have been sent.

Out of scope
- Choosing the email provider and setting up the sending domain (founder - open question 2).
- Inbound email handling (replies).
- Deliverability monitoring and reputation management.

---

## E11 - Media
| ID | Story | Pri |
|---|---|---|
| E11-S1 | Upload images; server validates type and size and produces web-sized versions | P0 |
| E11-S2 | Images are served fast and cached | P0 |
| E11-S3 | Orphaned uploads cleaned by a scheduled job | P1 |

### E11-S1 - Image upload and processing
As a provider or pet parent, I want to add photos easily from my phone, so that my listing or review looks real.

Acceptance criteria
- Given I pick a JPEG, PNG or WebP image up to 8 MB, when I upload it, then it is accepted, I see progress, and it is ready to use shortly afterwards.
- Given I pick a file that is not one of those types, or is larger than 8 MB, when I try to upload it, then it is rejected before the upload starts, with a message naming the limit.
- Given a file renamed to look like an image but which is not one, when it is uploaded, then it is rejected during processing and never shown anywhere.
- Given an image is accepted, when it is ready, then smaller versions suitable for thumbnails, cards and full-screen viewing exist and the right one is used in each place.
- Given an image containing location information, when it is ready, then that information is no longer present in any published version (06-nfr.md).
- Given an upload that fails or is cancelled, when I return to the screen, then nothing broken is shown and I can try again.
- Given an image is still processing, when I view the screen, then I see a placeholder rather than a broken image, and the page does not jump when it arrives.
- Given I have uploaded 30 images in the last hour, when I try another, then I am told the limit and when it resets.
- Given a verification document, when it is uploaded, then PDF is also accepted up to 10 MB, it is never publicly reachable, and only admins can view it through a link that expires within minutes (06-nfr.md).

Out of scope
- Cropping, rotation and editing (E7-S4).
- Video or audio.
- Automatic content moderation of images.

### E11-S2 - Fast, cached image delivery
As a pet parent on a mid-range phone, I want photos to load quickly, so that the site feels fast on 4G.

Acceptance criteria
- Given a listing page with many photos, when it loads on a throttled 4G connection, then the page meets the Core Web Vitals budgets in 06-nfr.md.
- Given an image on screen, when the page lays out, then space is reserved for it so nothing shifts when it arrives.
- Given images below the fold, when the page loads, then they are only fetched as I scroll towards them.
- Given a returning visitor, when they reload a page, then previously fetched images come from the browser cache rather than the network.
- Given an image is replaced by the provider, when a visitor who saw the old one returns, then they see the new one rather than a stale cached copy.
- Given a modern browser, when an image is served, then a modern efficient format is used; older browsers still get a format they can display.
- Given a photo gallery is opened full screen, when I swipe between photos, then the next photo is already loading.

Out of scope
- A third-party CDN contract (hosting decision, open question 10).
- Per-user image personalisation.
- Progressive or blur-up placeholders (nice to have, not required).

---

## E12 - Platform
| ID | Story | Pri |
|---|---|---|
| E12-S1 | Monorepo scaffolding, lint, format, typecheck, test scripts | P0 |
| E12-S2 | CI: install, lint, typecheck, unit + integration tests, build on every PR | P0 |
| E12-S3 | Deployment for all apps and services; staging and production | P0 |
| E12-S4 | Structured logging, health/readiness endpoints, error tracking | P0 |
| E12-S5 | Automated daily backups to off-server storage; restore tested | P0 |
| E12-S6 | Privacy-friendly analytics with consent | P1 |
| E12-S7 | Database seed data for dev and tests | P0 |

E12 is engineering enablement rather than user-facing product. The Product Owner sets the outcome; the Tech Lead owns every technical choice inside it. Criteria below are written from the point of view of the team member who depends on the outcome.

### E12-S1 - Monorepo scaffolding and scripts
As a developer joining the project, I want one predictable way to install, run, check and test everything, so that I can be productive on day one.

Acceptance criteria
- Given a clean machine with the documented prerequisites, when I follow the README, then I can install dependencies, start the local stack and open all three apps and the API within 15 minutes.
- Given the repository root, when I run the documented lint, format-check, typecheck, test and build commands, then each one runs across every app and package and reports clearly which one failed.
- Given I open a pull request with a formatting or lint problem, when the checks run, then they fail and name the file and rule.
- Given I add a new shared type or schema, when I import it from an app, then it resolves without manual path configuration.
- Given an app, when it tries to import directly from another app, then the check fails (02-architecture.md §2).
- Given any app, when it starts without a required setting, then it refuses to start and names the missing setting rather than failing later in an unclear way.
- Given the repository, when I look for how to configure an app, then an example configuration file exists for each one, listing every setting with safe placeholder values and no real secrets.

Out of scope
- Choice of task runner, bundler settings and tool versions (Tech Lead).
- Developer machine setup beyond what is in the README.

### E12-S2 - Continuous integration on every pull request
As a reviewer, I want every pull request checked automatically, so that review is about design rather than catching broken builds.

Acceptance criteria
- Given a pull request is opened or updated, when the checks run, then install, lint, typecheck, unit tests, integration tests and a production build all run.
- Given integration tests, when they run in CI, then they run against a real database instance so geography and state-machine behaviour is genuinely exercised (07-test-plan.md).
- Given any check fails, when I look at the pull request, then it cannot be merged and the failing check is identifiable without opening logs.
- Given all checks pass, when I look at the pull request, then the result is visible on the pull request within 15 minutes of the last push.
- Given a pull request, when the checks run, then the smoke set of end-to-end journeys runs too (07-test-plan.md).
- Given a dependency with a known high-severity vulnerability is introduced, when the checks run, then they fail.
- Given a secret is accidentally committed, when the checks run, then they fail and the secret is named without being printed.
- Given the `main` branch, when anyone tries to push to it directly, then it is refused (10-git-workflow.md).

Out of scope
- Choice of CI platform and runner sizing (Tech Lead).
- Deployment itself (E12-S3).
- Nightly and pre-release suites (07-test-plan.md, QA owns scheduling).

### E12-S3 - Staging and production deployment
As the team, I want staging and production environments we can deploy to reliably, so that work can be demonstrated and released.

Acceptance criteria
- Given a merge to `main`, when the deployment runs, then the API and all three apps are deployed to staging automatically and a visible version identifier tells us what is running.
- Given staging, when I visit it, then a database and object storage are available, seeded demo data is present, real SMS sending is disabled and emails only reach the allowlist.
- Given a tagged release, when production deployment is triggered, then it requires a manual approval before it proceeds.
- Given a deployment of the API, when it runs, then in-flight requests are allowed to finish and no request is dropped.
- Given a deployment that fails its readiness check, when it is detected, then the previous version stays serving traffic and the team is alerted.
- Given a database change in a deployment, when it is applied, then the previous application version would still have worked against the new database shape (06-nfr.md, expand/contract).
- Given production, when I check the public addresses, then the customer site, provider app, admin app, API and media are each reachable on their documented address over HTTPS.
- Given the admin app in production, when it is reached from outside the allowed network, then access is restricted as far as the hosting allows (06-nfr.md).
- Given any environment, when I look for secrets, then none are in the repository and all come from environment configuration.

Out of scope
- Choice of hosting platform, VPS sizing and region (open question 10 - founder).
- Multi-region or high-availability setup.
- Blue/green or canary strategy beyond what the platform offers.

### E12-S4 - Logging, health checks and error tracking
As whoever is on support, I want to see that the system is healthy and to find out quickly when it is not, so that outages are short.

Acceptance criteria
- Given the API is running, when the liveness address is requested, then it responds quickly and does not depend on the database.
- Given the API is running, when the readiness address is requested, then it reports whether the database and object storage are reachable, and reports not-ready when either is down.
- Given readiness reports not-ready, when the hosting platform checks it, then traffic is not sent to that instance.
- Given any API request, when it is handled, then one structured log line records the method, path, status, duration and a request identifier that also comes back in the response.
- Given a request fails, when I look at the logs, then I can follow the same request identifier from the client-visible error to the server-side cause.
- Given any log line anywhere, when I inspect it, then it contains no one-time code, no access or refresh token, no full phone number and no document content (06-nfr.md).
- Given an unhandled error occurs, when it happens, then it is reported to the error tracker with enough context to reproduce it and without personal data.
- Given the public addresses, when any of them stops responding, then an alert reaches the team within 5 minutes.
- Given production, when logs are written, then they are retained long enough to investigate an incident from the previous week.

Out of scope
- Choice of error tracker and uptime monitor (Tech Lead, within the hosting budget).
- Metrics dashboards and distributed tracing.
- On-call rota (operational, founder).

### E12-S5 - Backups and a tested restore
As the founder, I want to know we can get the business back after a disaster, so that a server failure is not an extinction event.

Acceptance criteria
- Given production, when a day passes, then a backup of the database and of the stored files has been taken automatically and copied to storage that is not on the same server.
- Given the backups, when I inspect them, then at least the last 14 days are available and each is identifiable by date.
- Given a backup, when a restore drill is performed into a scratch environment, then the restored system starts, the data is complete to within the stated recovery point objective of 24 hours, and the drill is completed within the stated recovery time objective of 4 hours (06-nfr.md).
- Given a restore drill, when it finishes, then the date, the result and anything that went wrong are written down where the team can find them.
- Given a backup job fails, when the failure happens, then an alert reaches the team the same day.
- Given the backup storage, when I check who can reach it, then it is not reachable with the credentials the running application uses.
- Given a restore drill has not been performed for a quarter, when the quarter ends, then the team is prompted to run one (06-nfr.md).

Out of scope
- Point-in-time recovery below a 24-hour recovery point.
- Off-site replication to a second region.
- Backing up staging.

### E12-S7 - Seed data for development and tests
As a developer, designer or tester, I want realistic, stable sample data, so that I can build and test against something that looks like the real thing.

Acceptance criteria
- Given a clean local database, when I run the documented seed command, then I get 3 cities, around 40 localities, all 7 categories, 60 published providers with fixed coordinates, 10 customers with pets and addresses, and requests in every status (07-test-plan.md).
- Given the seed data, when I run it twice, then the result is the same both times and no duplicates appear.
- Given the seeded providers, when I search from a known coordinate, then the distance ordering is the same on every machine, so tests can assert it.
- Given the seed data, when I browse the customer site, then every screen has something meaningful to show - providers with photos, with and without reviews, verified and unverified, claimed and unclaimed, at-home and at-premises.
- Given the seed data, when I look at it, then no real person's name, phone number or address is present and no real business is misrepresented.
- Given staging, when it is deployed, then the same seed is applied so demos are predictable.
- Given the seed data, when a new category or city is added to the product, then updating the seed is part of that change.

Out of scope
- Production data anonymisation and copy-down.
- Performance-sized data sets for load testing (QA owns these, 07-test-plan.md).

---

## Stories that need splitting
These P0 stories are larger than one developer-day. The Project Manager splits them when scheduling; acceptance criteria above apply to the set as a whole.

| Story | Suggested split |
|---|---|
| E2-S4 Filters | a) mode + verified, b) rating + price, c) open now (needs hours from E7-S5) |
| E4-S1 Send a request | a) the three-step flow for "at provider", b) at-home mode, address choice and service-area check |
| E7-S1 Provider sign-up | a) wizard shell with draft saving, b) business details + categories + location, c) submit and review handoff |
| E7-S3 Services and areas | a) services CRUD, b) service areas and travel fees |
| E8-S2 Review queue | a) new-profile approval, b) profile-edit diff and approval, c) verification documents |
| E8-S6 CSV import | a) dry run and validation report, b) apply, provenance and row report, c) undo a batch |
| E9-S1 Prerendered pages | a) city-category, b) locality-category plus the thin-page rule, c) the below-threshold and zero-provider path (own meta, canonical, empty state) |
| E12-S3 Deployment | a) staging pipeline, b) production pipeline and approval, c) domains and TLS |

## Traceability
QA maintains `docs/traceability.md` mapping every P0 acceptance criterion above to at least one automated test (07-test-plan.md). A P0 story is not Done until that mapping exists.
