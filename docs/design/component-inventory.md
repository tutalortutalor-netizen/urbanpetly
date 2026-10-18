# Component inventory — build contract for `packages/ui`

Owner: UI/UX Designer. Status: v0.1 (2026-10-18). Covers the inventory in `05-ux-spec.md`.

This is the contract a developer builds against: anatomy, props, **every state**, responsive behaviour and accessibility per component. Tokens come from [design-system.md](design-system.md); nothing here hard-codes a colour, size or duration.

## Rules that apply to every component

1. **States.** Default, hover, focus-visible, active, disabled, loading, error, selected — wherever the state is meaningful. Storybook shows each as a named story, plus one "all states" grid story used for visual regression.
2. **Focus.** `3px` ring in `--color-focus-ring`, `2px` offset, on `:focus-visible`. Never removed.
3. **Touch target.** ≥44×44px. Pad small visuals up to it.
4. **Naming.** `PascalCase` component, `camelCase` props. Boolean props read as adjectives (`isLoading`, `isDisabled`, `hasError`).
5. **Composition.** Every component forwards `className` (merged last), `ref`, and the remaining native props of its root element. No component fetches data or reads the router — pass data in.
6. **Polymorphism.** `Button` and `Card` take `as` (`'button' | 'a' | typeof Link`) so a navigation action is a real link.
7. **Strings.** No literal user-facing text inside a component except via props. Labels, placeholders and error text are passed in (i18n layer, `06-nfr`).
8. **Skeletons, not spinners,** for first paint of content areas. Spinners only inside controls the user just pressed.
9. **Testing.** Each component ships a Vitest + Testing Library test covering: renders label, fires handler, disabled blocks handler, keyboard path, and axe has no violations (`07-test-plan`).

---

## 1. Button

Primary interactive control.

**Anatomy:** `[ leading icon? ] label [ trailing icon? ]`, optional spinner replacing the leading icon while loading.

| Prop | Type | Default |
|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `isLoading`, `isDisabled`, `isFullWidth` | `boolean` | `false` |
| `leadingIcon`, `trailingIcon` | `ReactNode` | — |
| `as` | `'button' \| 'a' \| Component` | `'button'` |

Sizes: `sm` 36px tall / `--text-body-sm` / padding `3`; `md` 44px / `--text-body` / padding `4`; `lg` 52px / `--text-body-lg` / padding `5`. Radius `md`. `sm` is only allowed inside a container whose whole row is ≥44px tall.

| Variant | Default | Hover | Active | Disabled |
|---|---|---|---|---|
| primary | `primary` bg, `primary-fg` text | `primary-hover` | `primary-active` | `surface-sunken` bg, `fg-subtle` text |
| secondary | `surface` bg, `border-strong` border, `fg` text | `surface-sunken` bg | `border` → `fg-muted` | as above, border `border` |
| ghost | transparent, `primary` text | `primary-subtle` bg | `primary-subtle` + `primary-active` text | `fg-subtle` text |
| danger | `danger` bg, white text (4.83:1) | `danger` −10% L | −20% L | as primary disabled |

**Loading:** keeps its exact width, swaps the leading icon for a 16px spinner, sets `aria-busy="true"`, and stays focusable so the user is not thrown out of the tab order. **Error:** not a Button state — the form shows it.

**Responsive:** `isFullWidth` below 480px for primary form actions; auto width from `sm` up. In sticky bars the primary button is always full width minus the secondary action.

**A11y:** real `<button type>`; `as="a"` requires `href`; icon-only is not allowed here (use `IconButton`); disabled uses `aria-disabled` + ignored handler rather than the `disabled` attribute when the button must stay discoverable (e.g. an unsubmittable form) — otherwise native `disabled` is fine.

## 2. IconButton

Square control, icon only. Sizes `sm` 36 / `md` 44 / `lg` 48, always padded to a 44px hit area. Variants `ghost` (default), `secondary`, `danger`. **`aria-label` is required** — the lint rule enforces it. Tooltip optional and never the only label. Used for: close, favourite (toggles `aria-pressed`), share, map controls, gallery arrows.

## 3. Input

**Anatomy:** label (always visible) → optional helper text → field (optional prefix/suffix) → error text.

Props: `label`, `helperText`, `errorText`, `isRequired`, `isDisabled`, `isReadOnly`, `prefix`, `suffix`, `size ('md'|'lg')`, `inputMode`, `autoComplete`, `maxLength`.

| State | Appearance |
|---|---|
| Default | 44px (md) / 52px (lg), `surface` bg, `1px border-strong` (3.28:1), radius `md`, `fg` text |
| Placeholder | `fg-subtle` — never carries the label |
| Hover | border `fg-muted` |
| Focus | focus ring + `primary` border |
| Filled | unchanged (no colour change on content) |
| Disabled | `surface-sunken` bg, `fg-subtle` text, `border` border |
| Read-only | `surface` bg, `border` border, no focus ring change, still selectable |
| Error | `danger` border, danger icon in the suffix slot, `errorText` below in `danger-fg` |
| Loading (async validate) | 16px spinner in the suffix, `aria-busy` |

**A11y:** `<label for>` wired to `id`; `aria-describedby` points at helper *and* error; `aria-invalid="true"` on error; error text begins with the field name ("Phone number — enter 10 digits"); character counters are `aria-live="polite"` and only announce near the limit.

## 4. PhoneInput

India-only in v1. Fixed `+91` prefix (not editable, exposed to AT as part of the value), 10-digit entry, `inputMode="numeric"`, `autoComplete="tel-national"`, display grouping `98765 43210`, paste handles `+91`, `0` and spaces. Validation: starts 6–9, exactly 10 digits. Error copy: "Enter a 10-digit mobile number." All `Input` states apply. Never log or display the full number in system messages (`06-nfr`).

## 5. OtpInput

Six single-character boxes (48×52, gap `2`, radius `md`, `--text-h3`, tabular numerals).

Behaviour: auto-advance on entry, Backspace moves back, full 6-digit paste distributes across boxes, `inputMode="numeric"`, `autoComplete="one-time-code"` on the first box, auto-submit when complete.

States: default · focus (ring on the active box only) · filled · **error** (all boxes `danger` border, shake suppressed under reduced motion, message "That code is incorrect. 2 attempts left.") · **loading** (boxes read-only + spinner under) · **expired** ("Code expired" + enabled Resend).

Resend: a text button with a countdown, disabled while counting, label "Resend code in 0:29" → "Resend code"; the countdown is `aria-live="off"`, the ready state announces once.

**A11y:** the group has `role="group"` and an `aria-label` ("Enter the 6-digit code"); boxes are labelled "Digit 1 of 6"; failures move focus to box 1 and announce politely. Never reveal whether the phone number exists (`06-nfr`, no user enumeration).

## 6. Select

Native `<select>` on mobile (best platform behaviour, free a11y), styled consistently with `Input`; chevron suffix; same state table. Used for sort order and short known lists. If a list needs search, use `Combobox` instead.

## 7. Combobox (locality picker)

Text input + filtered listbox; the key discovery control.

Behaviour: debounce 200ms; minimum 1 character; shows up to 8 options grouped by city (`Gurgaon · Sector 56`); matched substring is **bolded**, not colour-only; "Use my current location" is a pinned first option with a location icon; recent choices (max 3) show when the field is empty.

States: idle · typing (spinner in the suffix after 300ms) · results · **no results** ("No locality matches 'xyz'. Try a sector number or pick a city.") · error (retry inline) · selected (chip-style value with a clear button) · disabled · **location denied** (the pinned option becomes "Location is off — pick a locality instead" and links to help).

**A11y:** full WAI-ARIA combobox pattern — `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`; ↑/↓ move, Enter selects, Esc closes and restores the typed text, Tab closes and commits; the listbox is a `role="listbox"` with `role="option"` children; result count announced politely ("8 localities"). Options are ≥44px tall.

## 8. Checkbox / RadioGroup

20px box (radius `sm`) or 20px circle, inside a 44px tappable row; label is always clickable; optional description below the label in `fg-muted`.

States: unchecked · checked (`primary` fill, white tick) · indeterminate (checkbox only) · hover (`primary-subtle` halo) · focus ring · disabled (`surface-sunken`) · error (group border/message, e.g. "Choose a service mode").

**A11y:** native inputs only. `RadioGroup` uses `role="radiogroup"` with a group label; arrow keys move within the group and Tab leaves it; the error message is wired with `aria-describedby` on the group.

## 9. Chip (filter pill)

Pill, 36px tall, `--text-body-sm`, padding `3`, optional leading icon and trailing count or remove "×".

Modes: `toggle` (filters — `aria-pressed`), `choice` (single-select row — `role="radio"`), `removable` (active filter — the × is a 44px target with `aria-label="Remove filter: Open now"`).

States: default (`surface` bg, `border-strong`) · hover (`surface-sunken`) · focus ring · **selected** (`primary-subtle` bg, `primary` border and text) · disabled · loading (count replaced by a 3-dot pulse while the facet refreshes).

Responsive: horizontally scrollable row on mobile with 16px edge padding and no scrollbar; **arrow keys scroll, and the row is reachable by keyboard**; wraps to multiple lines ≥768px.

## 10. Badge

Static status marker, 24px tall, radius `sm`, `--text-caption` 500, icon + text (never colour alone).

| Badge | Tokens | Copy |
|---|---|---|
| Verified | `success-subtle` / `success-fg` + check-shield | "Verified" |
| Unclaimed | `warning-subtle` / `warning-fg` + info | "Unclaimed" |
| At home | `primary-subtle` / `primary` + house | "At home" |
| At provider | `surface-sunken` / `fg-muted` + storefront | "At centre" |
| Open now | `success-subtle` / `success-fg` + dot | "Open now" |
| Closed | `surface-sunken` / `fg-muted` | "Closed · Opens 9 am" |
| Featured | `accent-subtle` / `accent-fg` + star | "Featured" |

Request-status badges reuse the same shapes: Pending `warning`, Accepted `success`, Declined `danger`, Expired/Cancelled neutral, Completed `info`.

## 11. Rating

**Display:** 5 stars in `accent` (16px list / 20px profile) + numeric value + review count — `4.6 (38)`. Half stars render via a clipped overlay. The accessible name is the full sentence: `aria-label="Rated 4.6 out of 5 from 38 reviews"`; the stars themselves are `aria-hidden`. **No rating yet** → "New" badge, never "0.0".

**Input:** 44px stars, hover and keyboard preview, `role="radiogroup"` with 5 radios labelled "1 star"…"5 stars"; arrow keys change the value; the chosen value also shows as text ("4 — Good") so it is never colour/shape only. Error state: "Choose a rating to continue."

## 12. Card family

Shared shell: `surface` bg, radius `lg`, `--shadow-xs`, padding `4`, hover `--shadow-sm` + 1px border lift (no movement), focus ring on the whole card. Each card has exactly **one** primary link; nested buttons (favourite, call) stop propagation and have their own labels.

### 12a. ProviderCard
The most important component in the product. Shows the three things parents care about (`05-ux-spec`): rating, distance/locality, starting price, plus service mode.

```
+------------------------------------------+
| [ 4:3 photo            ] [♡]             |  favourite: IconButton, top-right, 44px
|  Verified  Featured                      |  badges overlay bottom-left of photo
+------------------------------------------+
| Happy Tails Grooming                     |  h3, 2 lines max, ellipsis
| ★ 4.6 (38) · 1.2 km · Sector 56          |  body-sm, fg-muted, tabular nums
| Starts at ₹800 · At home                 |  price 600 weight + mode badge
| [ Open now ]                             |  status badge
+------------------------------------------+
```
States: default · hover · focus · **loading** (skeleton with identical geometry — photo box, 3 text bars) · **unavailable** (dimmed photo, "Not taking requests" badge, card still opens) · no-photo (category placeholder). Distance is omitted entirely (not "– km") when location is unknown.

### 12b. ServiceCard
Row inside the profile accordion: service name, duration, mode badge(s), price (right-aligned, tabular), optional description, "Request" button. States: default · expanded · selected (`primary-subtle`, used in request step 1) · unavailable ("Currently unavailable", button disabled with a reason) · price-on-request ("Price on request").

### 12c. ReviewCard
Avatar/initial, display name, rating, relative date ("2 weeks ago", `<time datetime>`), body text clamped to 4 lines with a "Read more" disclosure, optional photo thumbnails, optional provider reply block (indented, `surface-sunken`), "Report" ghost action. States: default · expanded · reported ("Reported — under review") · hidden-by-moderation (placeholder text, never silently deleted).

## 13. Tabs

Underline tabs, 44px tall, scrollable on mobile. States: default · hover · focus · **selected** (`primary` text + 2px `primary` underline) · disabled. Full WAI-ARIA tabs pattern: `role="tablist"`, arrow-key navigation, `aria-selected`, panels with `role="tabpanel"` and `tabIndex={0}`. The selected tab is reflected in the URL query so it survives reload and sharing.

## 14. Accordion

Used for services-by-category on the profile and the FAQ. Header is a full-width `<button>` with `aria-expanded` and `aria-controls`; chevron rotates 180° in `--duration-base`; content height animates via `grid-template-rows` (no layout thrash). Single- or multi-open via a prop. States: collapsed · expanded · hover · focus · disabled (empty category, explained inline).

## 15. Modal / Sheet

One component, two presentations: **bottom sheet** below 768px (slides up, radius `xl` on top corners, drag handle, max height 90vh, scrollable body, sticky footer actions), **centred modal** at 768px+ (max width 480, radius `xl`, `--shadow-lg`).

Behaviour: `--color-overlay` scrim, body scroll locked, **focus trapped**, focus returns to the trigger on close, Esc closes, click on the scrim closes unless `isDismissable={false}` (destructive confirmations). Enter animation `--duration-slow` / `--ease-enter`; reduced motion = instant.

**A11y:** `role="dialog"` `aria-modal="true"`, labelled by its title id, described by its body id; the close button is an `IconButton` with `aria-label="Close"`. Only one modal at a time — never stack.

## 16. Toast

Transient confirmation, bottom-centre on mobile (above the sticky bar), bottom-right ≥768px. Variants success / error / info. Auto-dismiss 5s (errors never auto-dismiss); hover and focus pause the timer; max 3 stacked; optional single action ("Undo").

**A11y:** `role="status"` + `aria-live="polite"` for success/info, `role="alert"` for errors. A toast never carries information the user cannot get elsewhere. Dismiss button is 44px.

## 17. Skeleton

Shapes: `text` (height matches its type token, last line 60% width), `rect`, `circle`, plus composed `ProviderCardSkeleton`, `ProfileSkeleton`, `ListSkeleton(count)`. Must match the real content's geometry exactly — this is the CLS defence (`06-nfr`: CLS ≤ 0.1). 1.2s opacity pulse; static tint under reduced motion. The container carries `aria-busy="true"` and the skeletons are `aria-hidden`; a visually hidden "Loading results" is announced once.

## 18. EmptyState

Illustration (or category glyph on `primary-subtle`), `--text-h3` title, `--text-body` `fg-muted` body, 1–2 actions. Variants and their copy:

| Variant | Title | Body | Action |
|---|---|---|---|
| no-results | "No groomers in Sector 56 yet" | "Try a wider area or a different service." | "Search nearby areas" |
| no-favourites | "Nothing saved yet" | "Tap the heart on any provider to save them here." | "Browse providers" |
| no-requests | "No requests yet" | "When you send a booking request it will show up here." | "Find a provider" |
| error | "We couldn't load this" | "Check your connection and try again." | "Try again" |
| offline | "You're offline" | "We'll reload as soon as you're back." | "Retry" |
| location-denied | "Location is off" | "Turn on location, or pick your area manually." | "Pick an area" |
| not-found (404) | "We can't find that page" | "The link may be old or the listing may have been removed." | "Go to home" |
| unauthorized | "Sign in to continue" | "You need to be signed in to see this." | "Sign in" |

Every content screen must handle all of these (`05-ux-spec` §Content states). The error variant renders inside the page layout — never as a blank screen.

## 19. Pagination

Default to "Load more" (44px, full width on mobile, shows "Showing 20 of 134"). Numbered pagination is used only on prerendered SEO listing pages, where real `<a href>` links with `rel="prev"/"next"` are required for crawlers. `aria-label="Pagination"` on the `<nav>`; current page `aria-current="page"`; new results announced politely; focus moves to the first new result after "Load more".

## 20. Map

MapLibre/Leaflet wrapper (`02-architecture`). Props: `markers`, `center`, `zoom`, `selectedId`, `onMarkerClick`, `onBoundsChange`, `showUserLocation`.

Pins: `primary` teardrop, selected pin is larger with an `accent` ring **and** a different shape (not colour alone); clusters show a count. Tapping a pin opens a mini `ProviderCard` (`--shadow-md`) above the map with a 44px close button. Controls: zoom ±, recentre, "Search this area" button that appears after a pan.

States: loading (skeleton tile grid) · ready · **tiles failed** ("Map unavailable — results are listed below" with the list still complete) · no results in view · location denied.

**A11y:** the map is `role="application"` with an `aria-label`, and is **never the only way** to reach information — the list beside/below it is the accessible equivalent, which is also how keyboard users get there. Pins are reachable by Tab with the same accessible name as the card. The list/map toggle is a `Tabs`-style control and the choice persists in the URL.

## 21. Gallery / Lightbox

Profile hero carousel: 3:2 hero, dot indicators, swipe, counter "3 / 12". Lightbox: full-screen, pinch zoom, arrows ≥768px, Esc closes, focus trapped, `alt` describes the subject ("Happy Tails Grooming — grooming table"). Arrow keys navigate; the counter is announced on change. Thumbnails are lazy-loaded; every image has `width`/`height`.

## 22. ImageUploader

Provider photos and review photos. Drop zone + "Choose photos" (camera capture on mobile), multi-file, per-file progress, thumbnail grid with remove, reorder by drag **with keyboard alternatives** ("Move left/right" buttons).

Validation surfaced before upload: jpeg/png/webp, max 8 MB, max N files (`06-nfr`). States: idle · dragover · uploading (per-file %) · success · **per-file error** ("photo3.heic — use JPG, PNG or WebP") without failing the batch · server rejection · at-limit ("10 of 10 photos added. Remove one to add another.").

**A11y:** the drop zone is a real `<input type="file">` with a visible label; progress uses `role="progressbar"` with `aria-valuenow`; each thumbnail has an alt-text field (encouraged, not blocking).

## 23. DateWindowPicker

Request step 2. Date strip of the next 14 days (chips: "Today", "Tomorrow", then "Tue 21"), then **time-window chips**. Windows map exactly to `service_requests.preferred_window` in `03-data-model.md`: **Morning** (8 am–12 pm), **Afternoon** (12–4 pm), **Evening** (4–8 pm), plus an optional "Pick an exact time" disclosure that sets `custom` + `preferred_time`. Windows, not exact times, are the default because the provider confirms (`04-api-contract`).

States: default · selected · **unavailable** (provider closed — disabled chip with "Closed" and an `aria-disabled` + title explanation) · past (today's elapsed windows disabled) · loading availability (chip skeletons) · error (fall back to all windows enabled with a note).

**A11y:** `role="radiogroup"` per strip with group labels "Choose a date" / "Choose a time window"; arrow keys move; the selection is echoed as text ("Tue, 21 Oct · 4–6 pm") above the Continue button; dates use `<time datetime>`.

## 24. Stepper

Request flow (3 steps) and provider onboarding (6 steps). Mobile: compact "Step 2 of 3" + a progress bar + the current step title. ≥768px: numbered dots with labels. Completed steps are tappable (go back); future steps are not.

**A11y:** `<nav aria-label="Progress">` with an `<ol>`; current step `aria-current="step"`; completed steps say "completed" in their accessible name; on step change focus moves to the new step heading and the change is announced politely. The progress bar is decorative (`aria-hidden`) because the text already carries it.

## 25. Table (admin)

Dense rows (44px), sticky header, column sort, row selection with bulk actions, per-row overflow menu, pagination. Below 768px each row collapses to a stacked card — admin is desktop-first but must not break on a phone.

States: default · loading (row skeletons) · empty (EmptyState in the body) · error · selected rows ("12 selected" bar with actions) · sorted column (arrow + `aria-sort`).

**A11y:** real `<table>` with `<caption>` (visually hidden if needed) and `<th scope>`; sortable headers are buttons with `aria-sort`; selection checkboxes have row-specific labels ("Select Happy Tails Grooming"); the sticky header must not cover focused rows (`scroll-margin-top`).

## 26. FilterBar

Composition, not a new primitive: a scrollable `Chip` row + a "Filters" button opening a `Modal/Sheet` with the full facet set (service mode, rating, price, open now, verified, distance), plus a `Select` for sort.

Rules: the chip row shows **active** filters first with remove "×"; a count badge sits on the "Filters" button ("Filters · 3"); "Clear all" appears only when something is active; every change writes to the URL query string (`02-architecture` §5) so results are shareable and the back button works; results reload without moving the bar; the result count is announced politely ("24 groomers in Sector 56").

Sheet footer is sticky: "Clear all" (ghost, left) and "Show 24 results" (primary, right) — the count updates live as facets change.

---

## Storybook

`packages/ui/.storybook`, run with `pnpm --filter @urbanpetly/ui storybook`.

- Addons: a11y (axe on every story), viewport (360 / 480 / 768 / 1024 / 1280 presets, default 360), controls, interactions.
- Every component: a default story, one story per state, one "All states" grid, and a mobile-viewport story.
- The tokens are documented as living pages: Colour (with contrast ratios rendered from the token values), Typography, Spacing, Radius/Elevation, Motion.
- CI runs `storybook:build` plus the a11y addon in test mode; a story with axe violations fails the build (`07-test-plan`).

## Build order (suggested for the developers)

1. Tokens + Tailwind preset + Storybook shell *(this PR: tokens and preset; Storybook with the scaffold)*.
2. Button, IconButton, Input, Badge, Chip, Skeleton, EmptyState — unblocks almost every screen.
3. ProviderCard, Rating, Card shell, FilterBar, Pagination — unblocks Phase 1 search and listing.
4. Accordion, Tabs, Gallery, Map, ServiceCard, ReviewCard — unblocks the provider profile.
5. Modal/Sheet, Toast, PhoneInput, OtpInput, Stepper, DateWindowPicker — unblocks Phase 2 login and requests.
6. ImageUploader, Table, Select, Combobox refinements — Phase 3 provider and admin tools.
