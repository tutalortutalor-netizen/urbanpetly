# UrbanPetly Design System

Owner: UI/UX Designer. Status: v0.1 (2026-10-18), Phase 0. Source of truth for every visual decision.
Implementation lives in `packages/ui` (`src/tokens.ts`, `src/styles/tokens.css`, `tailwind-preset.cjs`).

> **Brand: "Indigo Care", chosen by the founder on 2026-10-18** (Paperclip SAM-7).
> The decision and the rejected alternative are recorded in [brand-direction.md](brand-direction.md).
> Wordmark is **`UrbanPetly`**, capitalised.

## 1. How tokens are layered

```
primitive tokens      --up-indigo-600, --up-slate-200, --up-rose-500
  (raw palette, never used directly in app code)
        v
semantic tokens       --color-primary, --color-fg-muted, --color-border-strong
  (what a colour means; this is what components use)
        v
Tailwind utilities    bg-primary, text-fg-muted, border-border-strong
  (what app code writes)
```

Rules:
1. App code never writes a hex value, a raw px spacing value, or a raw primitive token. Use the Tailwind utility backed by a semantic token (`02-architecture.md` §5).
2. New semantic token = a design decision. Add it here first, then to `tokens.css`, then to the preset.
3. If you need a colour that does not exist as a semantic token, you probably need an existing one. Ask the designer on the issue.

## 2. Colour

### 2.1 Primitives — "Indigo Care"

| Ramp | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| `indigo` (brand) | `#EEF2FF` | `#E0E7FF` | `#C7D2FE` | `#A5B4FC` | `#818CF8` | `#6366F1` | `#4F46E5` | `#4338CA` | `#3730A3` | `#312E81` |
| `rose` (accent) | `#FFF1F2` | `#FFE4E6` | `#FECDD3` | `#FDA4AF` | `#FB7185` | `#E11D48` | `#BE123C` | `#9F1239` | — | — |
| `slate` (cool neutral) | `#F8FAFC` | `#F1F5F9` | `#E2E8F0` | `#CBD5E1` | `#94A3B8` | `#64748B` | `#475569` | `#334155` | `#1E293B` | `#0F172A` |

In CSS the ramps are named by **role**, not hue — `--up-brand-*`, `--up-accent-*`, `--up-neutral-*` — so a future brand change replaces values only, never names.

`slate-400` (`#94A3B8`) is **2.56:1 on white and fails WCAG 1.4.11**. It is decorative only; interactive borders use `slate-500`. The contrast guard fails the build if `--color-border-strong` is ever repointed at it.

Status primitives: success `#15803D` / subtle `#ECFDF3` / fg `#166534` · warning `#B45309` / subtle `#FFF8EB` / fg `#854D0E` · danger `#DC2626` / subtle `#FEF2F2` / fg `#991B1B` · info `#0369A1` / subtle `#EFF8FF` / fg `#075985`.

### 2.2 Semantic tokens

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `slate-50` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, sheets, inputs |
| `--color-surface-sunken` | `slate-100` | Inset areas, skeletons, disabled fields |
| `--color-surface-raised` | `#FFFFFF` + `--shadow-md` | Modals, popovers, sticky bars |
| `--color-overlay` | `rgba(15,23,42,0.56)` | Scrim behind modal/sheet |
| `--color-fg` | `slate-900` | Body and heading text |
| `--color-fg-muted` | `slate-600` | Secondary text, labels, metadata |
| `--color-fg-subtle` | `slate-500` | Placeholder, disabled text, icon-only decoration |
| `--color-fg-inverse` | `slate-50` | Text on dark surfaces |
| `--color-border` | `slate-300` | Decorative dividers, card outlines |
| `--color-border-strong` | `slate-500` | **Interactive** control borders (inputs, checkbox, unselected chip) |
| `--color-primary` | `indigo-600` | Primary action fill, active nav, links |
| `--color-primary-hover` | `indigo-700` | Hover |
| `--color-primary-active` | `indigo-800` | Pressed |
| `--color-primary-subtle` | `indigo-50` | Selected chip background, info banner |
| `--color-primary-fg` | `#FFFFFF` | Text/icon on `--color-primary` |
| `--color-accent` | `rose-500` (`#E11D48`) | Rating stars, "Featured" ribbon, selected map-pin ring |
| `--color-accent-subtle` | `rose-50` | Accent chip background |
| `--color-accent-fg` | `#FFFFFF` | **White** on the accent *fill*. Never dark ink — see §2.3 |
| `--color-accent-strong` | `rose-700` (`#9F1239`) | Accent **ink** — text and icons on `accent-subtle` or on `surface` |
| `--color-success` / `-subtle` / `-fg` | `#15803D` / `#ECFDF3` / `#166534` | Accepted, open now, saved |
| `--color-warning` / `-subtle` / `-fg` | `#B45309` / `#FFF8EB` / `#854D0E` | Pending, closing soon, unclaimed |
| `--color-danger` / `-subtle` / `-fg` | `#DC2626` / `#FEF2F2` / `#991B1B` | Errors, declined, destructive |
| `--color-info` / `-subtle` / `-fg` | `#0369A1` / `#EFF8FF` / `#075985` | Neutral system messages |
| `--color-focus-ring` | `indigo-600` | Focus indicator (see §9) |

### 2.3 Verified contrast (WCAG 2.1 AA)

Measured, not assumed. Text needs 4.5:1 (3:1 for ≥24px or ≥19px bold); UI boundaries and focus indicators need 3:1 (1.4.11).

| Pair | Ratio | Verdict |
|---|---|---|
| `fg` on `surface` (`#0F172A`/`#FFFFFF`) | 17.85 | AAA |
| `fg` on `bg` (`#0F172A`/`#F8FAFC`) | 17.06 | AAA |
| `fg-muted` on `surface` (`#475569`) | 7.58 | AAA |
| `fg-subtle` on `surface` (`#64748B`) | 4.76 | AA — placeholders/disabled only |
| `primary-fg` on `primary` (white/`#4F46E5`) | 6.29 | AA |
| `primary` on `surface` (link text) | 6.29 | AA |
| white on `primary-hover` (`#4338CA`) | 7.90 | AAA |
| white on `primary-active` (`#3730A3`) | 9.93 | AAA |
| `accent-fg` on `accent` (white/`#E11D48`) | 4.70 | AA |
| **`fg` on `accent`** (dark ink on rose) | **3.80** | **FAIL — forbidden combination** |
| `accent-strong` on `accent-subtle` (`#9F1239`/`#FFF1F2`) | 7.30 | AAA |
| `accent-strong` on `surface` | 8.02 | AAA |
| `accent` on `surface` (rating stars, non-text) | 4.70 | AA (1.4.11) |
| **`accent-fg` on `accent-subtle`** (white on rose-50) | **1.10** | **FAIL — use `accent-strong` for ink on a subtle chip** |
| `success` on `surface` | 5.02 | AA |
| `danger` on `surface` (and white on `danger`) | 4.83 | AA |
| `info` on `surface` | 5.93 | AA |
| `warning-700` on `surface` (`#B45309`) | 5.02 | AA |
| status `-fg` on matching `-subtle` (4 pairs) | 6.49–7.60 | AAA |
| `border-strong` on `surface` (`#64748B`) | 4.76 | AA (1.4.11) |
| `border` on `surface` (`#CBD5E1`) | 1.48 | Decorative only — never the sole indicator of a control |
| `focus-ring` on `surface` / `bg` / `surface-sunken` | 6.29 / 6.01 / 5.74 | AA (1.4.11) |
| `indigo-300` on `slate-900` (dark focus ring) | 8.96 | AAA |

These numbers are not hand-maintained. `packages/ui/scripts/check-contrast.mjs` parses `tokens.css`, resolves each semantic token to its literal, and fails the build if any required pair drops below its threshold **or if a forbidden pair starts passing**. Run it with `pnpm --filter @urbanpetly/ui check:tokens`; CI runs it on every PR.

### 2.4 Colour rules
- Colour is never the only carrier of meaning: status chips pair colour with a label and an icon; map pins pair colour with a shape.
- Rose is a **highlight**, not an action colour. Primary buttons are indigo. Rose appears in: rating stars, the "Featured" badge, the selected map-pin ring, empty-state illustration. The **"Verified" badge is `success`, not accent** (`component-inventory.md` §10) — trust reads green, and it must not be confused with the featured/paid highlight.
- **Rose (`#E11D48`) and danger (`#DC2626`) are neighbouring hues.** Treat this as a real risk, not a theoretical one: accent never carries an interactive or destructive meaning, errors always pair `danger` with an icon and a message, and the two never sit adjacent in the same component. If a screen needs both at once, drop the accent.
- Destructive actions use `danger` and always require confirmation (`Modal`), per `06-nfr.md`.
- Dark mode is **out of scope for v1** but every token is a CSS variable, so a `[data-theme="dark"]` block is a later additive change.

## 3. Typography

| Token | Font | Size / line-height (mobile) | ≥768px | Weight | Use |
|---|---|---|---|---|---|
| `--text-display` | heading | 28 / 34 | 40 / 46 | 700 | Home hero only |
| `--text-h1` | heading | 24 / 30 | 32 / 40 | 700 | One per page |
| `--text-h2` | heading | 20 / 26 | 24 / 32 | 600 | Section titles |
| `--text-h3` | heading | 18 / 24 | 18 / 26 | 600 | Card titles, accordion headers |
| `--text-body-lg` | body | 17 / 26 | 17 / 26 | 400 | Profile intro, lead paragraphs |
| `--text-body` | body | 16 / 24 | 16 / 24 | 400 | Default |
| `--text-body-sm` | body | 14 / 20 | 14 / 20 | 400 | Metadata, helper text |
| `--text-caption` | body | 12 / 16 | 12 / 16 | 500 | Chips, badges, timestamps |
| `--text-price` | body | 16 / 24 | 16 / 24 | 600 | Prices — `font-variant-numeric: tabular-nums` |

Families: heading `"Outfit", system-ui, sans-serif` (600); body `"Inter", system-ui, sans-serif` (400/500).

Outfit has no Devanagari sibling. When the Hindi release lands, headings fall back to `"Noto Sans Devanagari"` for Devanagari text — so never rely on the heading face to carry brand meaning on its own, and keep the wordmark as an SVG asset rather than live text.

Rules:
- **Never below 12px.** Body copy never below 14px. Base rem = 16px; sizes in `rem` so browser zoom works.
- Self-host fonts (`06-nfr` performance budget): `woff2`, `font-display: swap`, preload only the body 400 + heading 700 subsets (latin). Do not block render on fonts.
- `font-variant-numeric: tabular-nums` on prices, distances, ratings and counts so lists do not shift.
- Line length max `68ch` for prose blocks.
- All strings go through the i18n layer (`06-nfr`). **No text baked into images** — Devanagari lands later, so avoid fixed-height text containers and allow ~30% string growth.

## 4. Spacing

4px base scale. Only these steps exist:

| Token | `1` | `2` | `3` | `4` | `5` | `6` | `8` | `10` | `12` | `16` | `20` | `24` |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| px | 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64 | 80 | 96 |

Conventions: screen gutter `4` (16px) at 360px, `6` (24px) ≥768px. Card padding `4`. Gap between cards in a list `3`. Section vertical rhythm `8` mobile / `12` desktop. Related elements `2`, unrelated `6`.

## 5. Layout, grid and breakpoints

| Name | Min width | Columns | Gutter | Max content |
|---|---|---|---|---|
| base | 360 | 4 | 16 | fluid |
| `sm` | 480 | 4 | 16 | fluid |
| `md` | 768 | 8 | 24 | 720 |
| `lg` | 1024 | 12 | 24 | 960 |
| `xl` | 1280 | 12 | 24 | 1200 |

- **Mobile first, designed and tested at 360px** (`05-ux-spec`, `02-architecture` §5). Every spec in `docs/design/` is written at 360px first; wider views are listed as "Responsive".
- Content max width 1200px; prose max 68ch; listing grid: 1 column < 768, 2 columns ≥768, 3 columns ≥1280 (list view with map collapses to 1 column + map panel ≥1024).
- Sticky elements: header (`--z-header`) and, on provider profile, a bottom action bar. Bottom bar sits above the safe area: `padding-bottom: max(var(--space-4), env(safe-area-inset-bottom))`.

## 6. Radius, elevation, borders

| Radius | `sm` 6px | `md` 12px | `lg` 16px | `xl` 24px | `pill` 9999px |
|---|---|---|---|---|---|
| Used by | Chips, badges, small inputs | Buttons, inputs, selects | Cards, images | Sheets, modals | Chips, avatars, filter pills |

| Shadow | Value | Use |
|---|---|---|
| `xs` | `0 1px 2px rgba(15,23,42,0.06)` | Resting card |
| `sm` | `0 2px 6px rgba(15,23,42,0.08)` | Hover card, sticky header on scroll |
| `md` | `0 8px 20px rgba(15,23,42,0.10)` | Popover, dropdown, map mini-card |
| `lg` | `0 16px 36px rgba(15,23,42,0.14)` | Modal, bottom sheet |

Elevation is shadow + surface, never a different brand colour. Default border is `1px solid var(--color-border)`; interactive controls use `--color-border-strong` so they meet 3:1.

## 7. Motion

| Token | Value | Use |
|---|---|---|
| `--duration-fast` | 120ms | Hover, colour, chip toggle |
| `--duration-base` | 180ms | Dropdowns, accordions, toasts |
| `--duration-slow` | 240ms | Bottom sheet, modal, route transition |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default |
| `--ease-enter` | `cubic-bezier(0, 0, 0, 1)` | Entering (decelerate) |
| `--ease-exit` | `cubic-bezier(0.3, 0, 1, 1)` | Leaving (accelerate) |

Rules: animate `transform` and `opacity` only (never `height`/`top` — CLS budget is 0.1). Nothing animates for longer than 240ms. Skeletons use a 1.2s opacity pulse, not a sweeping gradient.

**Reduced motion is mandatory.** Under `@media (prefers-reduced-motion: reduce)` all durations collapse to `1ms`, the skeleton pulse becomes a static tint, and sheets appear without sliding. This is handled once globally in `tokens.css`; components do not reimplement it.

## 8. Z-index

`--z-base: 0` · `--z-dropdown: 100` · `--z-sticky: 200` · `--z-header: 300` · `--z-overlay: 400` · `--z-modal: 500` · `--z-toast: 600`. No raw z-index values in app code.

## 9. Interaction states (applies to every component)

Every interactive component must specify all of: **default, hover, focus-visible, active, disabled, loading, error, selected** (where it applies). Storybook shows each.

| State | Rule |
|---|---|
| Hover | Only on `@media (hover: hover)`. Background steps one shade; never move layout. |
| **Focus** | `outline: 3px solid var(--color-focus-ring); outline-offset: 2px;` on `:focus-visible`. **Never** `outline: none` without an equally visible replacement. Focus is visible on every background (verified 5.74–6.29:1). |
| Active | `--color-primary-active`; optional `transform: scale(0.98)` within reduced-motion rules. |
| Disabled | `--color-surface-sunken` background, `--color-fg-subtle` text, `cursor: not-allowed`, `aria-disabled="true"`. Prefer *enabled + explain the error* over disabling a submit button. |
| Loading | Keep the element's size (no layout shift), show a spinner, set `aria-busy="true"`, and announce via `aria-live="polite"`. Buttons keep their label and add the spinner before it. |
| Error | `--color-danger` border + a text message linked with `aria-describedby`. Icon + text, never colour alone. |
| Selected | `--color-primary-subtle` fill, `--color-primary` border and text, `aria-pressed`/`aria-selected`/`aria-checked` set. |

**Touch targets: minimum 44×44px** (`05-ux-spec`). Smaller visuals (a 20px close icon) get padding or a pseudo-element to reach 44px. Adjacent targets are at least 8px apart. Primary actions sit in the lower third of the screen on mobile (thumb zone).

## 10. Accessibility baseline (WCAG 2.1 AA)

Non-negotiable, checked by axe in CI (`07-test-plan`) plus a manual keyboard + screen-reader pass:

1. One `<h1>` per page; headings nest without skipping levels.
2. Every control has an accessible name. Visible `<label>` for every input — placeholders are not labels. Icon-only buttons need `aria-label`.
3. Full keyboard operation: logical tab order, visible focus, `Esc` closes overlays, focus is trapped inside modals/sheets and returns to the trigger on close.
4. Landmarks on every page: `header`, `nav`, `main`, `footer`; "Skip to content" link as the first focusable element.
5. Live regions: search result counts, toasts and async errors announce politely; errors on submit move focus to the first invalid field.
6. Images: meaningful images get descriptive `alt` (provider name + what is shown); decorative images get `alt=""`. All `<img>` carry `width`/`height`.
7. Target size ≥44px; zoom to 200% without horizontal scrolling; works in portrait and landscape.
8. Maps always have a non-map equivalent (the list) — a map is never the only route to information.
9. Respect `prefers-reduced-motion`; no auto-playing media; no content that flashes.
10. Form errors say what is wrong *and* how to fix it, in plain language.

## 11. Voice and copy

Warm, plain, specific. Second person. No exclamation marks in system messages, no jargon, no cute pet puns in functional copy.

| Do | Don't |
|---|---|
| "Send request" | "Submit enquiry form" |
| "No groomers in Sector 56 yet. Try a wider area." | "No results found." |
| "We couldn't load providers. Check your connection and try again." | "Error 500" |
| "Verified by UrbanPetly" | "VERIFIED ✅✅" |
| "Starts at ₹800 · At home" | "From Rs. 800/- (home service available)" |

Formats: price `₹800` (no decimals, tabular numerals, "Starts at ₹800" for a range); distance `1.2 km away` (one decimal under 10km, whole numbers above); rating `4.6 (38 reviews)`; dates `Tue, 21 Oct`; time windows `4–6 pm`; phone `+91 98765 43210`. Sentence case everywhere, including buttons. Never show a raw error code to a user (log it, show a plain message).

## 12. Iconography and imagery

- Icons: one set, 24px default (20px inside dense tables), 1.75px stroke, `currentColor`, `aria-hidden="true"` unless the icon *is* the label.
- Photography leads provider cards (`05-ux-spec`). Aspect ratios: card thumbnail 4:3, gallery hero 3:2, avatar 1:1. Always reserve the box (`aspect-ratio`) so nothing shifts.
- Missing photo = a branded placeholder with the category glyph on `--color-primary-subtle`. Never a broken image, never a stock photo of a different business.
- Images are WebP/AVIF, lazy-loaded below the fold, `fetchpriority="high"` on the single LCP image (`06-nfr`).

## 13. Related documents

| Doc | Contents |
|---|---|
| [brand-direction.md](brand-direction.md) | The brand decision ("Indigo Care") and the rejected alternative |
| [component-inventory.md](component-inventory.md) | Every component: anatomy, props, states, a11y |
| [core-flows.md](core-flows.md) | The three prototyped end-to-end flows |
| [home.md](home.md) · [search-listing.md](search-listing.md) · [provider-profile.md](provider-profile.md) · [request-flow.md](request-flow.md) | Screen specs |
| `packages/ui/README.md` | How to consume tokens and the Tailwind preset |
