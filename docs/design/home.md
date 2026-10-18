# Screen spec — Home (`/` and `/{city}`)

Owner: UI/UX Designer · v0.1 · Stories: E2-S1, E2-S3, E9 (SEO landing) · Spec: `05-ux-spec.md` §Key screens 1.

Home has one job: get a pet parent from "I need a groomer" to a result list in **one tap**. Everything else on the page is secondary.

## User flow

```mermaid
flowchart TD
  A[Land on Home] --> B{Location known?}
  B -- "saved / geolocated" --> C[City + locality shown in the header]
  B -- "unknown" --> D[Locality combobox is the hero control]
  C --> E[Tap a category tile]
  D --> F[Pick locality or 'Use my location'] --> E
  A --> G[Type in the search box] --> H[/search?q=...]
  E --> I["/{city}/{category} listing"]
  A --> J[Tap a featured provider card] --> K["/p/{slug}"]
  A --> L[List your business] --> M[provider.urbanpetly.com onboarding]
```

## Wireframe — 360px

```
+------------------------------------------+
| ☰   UrbanPetly            [Sign in]      |  sticky header, 56px
| 📍 Gurgaon · Sector 56            (edit) |  location row, 44px, tappable
+------------------------------------------+
|                                          |
|  Every pet service in Delhi NCR,         |  h1 / --text-display
|  in one place.                           |
|                                          |
|  [ 🔎 Search groomers, vets, boarding ]  |  Input lg, 52px, radius md
|                                          |
+------------------------------------------+
|  ┌────────┐ ┌────────┐ ┌────────┐        |  category tiles: 3 cols @360
|  │  🐾    │ │  🩺    │ │  🏠    │        |  each tile >=96px tall
|  │Grooming│ │  Vets  │ │Boarding│        |
|  └────────┘ └────────┘ └────────┘        |
|  ┌────────┐ ┌────────┐ ┌────────┐        |
|  │Training│ │Walking │ │ Stores │        |
|  └────────┘ └────────┘ └────────┘        |
|  ┌────────┐                              |
|  │Transport│                             |
|  └────────┘                              |
+------------------------------------------+
|  Popular near you            [See all >] |  h2 + ghost link
|  ┌──────────────────────────────────┐    |
|  │ [photo 4:3]                  [♡] │    |  ProviderCard carousel,
|  │ Happy Tails Grooming             │    |  horizontal scroll, 1.15 cards
|  │ ★ 4.6 (38) · 1.2 km · Sector 56  │    |  visible so the edge hints
|  │ Starts at ₹800 · At home         │    |
|  └──────────────────────────────────┘    |
+------------------------------------------+
|  How it works                            |  h2
|  1  Search your area                     |  numbered, icon + 1 line each
|  2  Compare prices and reviews           |
|  3  Send a request — no payment needed   |
+------------------------------------------+
|  ┌──────────────────────────────────┐    |
|  │ Run a pet business?              │    |  accent-subtle panel
|  │ Get found by pet parents nearby. │    |
|  │ [ List your business ]           │    |  secondary Button
|  └──────────────────────────────────┘    |
+------------------------------------------+
|  Footer: About · Contact · Privacy ·     |
|  Terms · FAQ · © UrbanPetly              |
+------------------------------------------+
```

## Components used

`Combobox` (locality), `Input` (search), category tile (composition of Card + icon + label), `ProviderCard`, `Button`, `IconButton` (favourite), `Skeleton`, `EmptyState`, `Badge`, footer links.

## Sections in detail

**Header (sticky, `--z-header`).** Logo (links to `/`), location row, "Sign in" (or avatar menu when signed in). The location row opens a `Modal/Sheet` containing the locality `Combobox` and "Use my current location". The chosen city/locality persists (localStorage) and drives the URL (`/gurgaon`).

**Hero.** H1 (the only H1), then the search `Input`. Submitting goes to `/search?q=…&city=…`. The search box is **not** a combobox here — typing then Enter is enough; suggestions are a Phase 1+ enhancement.

**Category tiles.** 7 categories from `00-product-brief` §4. 3 columns at 360px, 4 at 768, 7 in a row at 1280. Each tile is a real `<a href="/{city}/{category}">` so crawlers follow it (`02-architecture` §6). Icon 32px in `primary`, label `--text-body-sm` 600, `surface` bg, radius `lg`, border `border`, hover `--shadow-sm`, whole tile is the target.

**Popular near you.** Up to 8 `ProviderCard`s; sorted by distance when location is known, otherwise by rating within the city. Section heading changes accordingly: "Popular near you" vs "Popular in Gurgaon". Horizontal scroll on mobile with scroll-snap; 2-up grid at 768, 4-up at 1280. Keyboard: the carousel is a list — Tab moves card to card and the container scrolls the focused card into view.

**How it works.** Three steps, static, no illustrations needed at launch. Reassurance line under it: "Free for pet parents. No payment on UrbanPetly."

**List your business.** `accent-subtle` panel with `accent-strong` ink (never `accent-fg` — that is white, for the solid accent fill only), secondary button → `provider.urbanpetly.com`. External link gets no `target="_blank"` (keeps the back button working).

## States

| State | Behaviour |
|---|---|
| **Default (location known)** | As drawn. |
| **Location unknown** | The hero adds a one-line prompt and the locality `Combobox` sits directly under the search box: "Where are you? Pick your area to see distances." "Popular near you" becomes "Popular in Delhi NCR". |
| **Location permission denied** | No error banner. The location row shows "Pick your area" and tapping opens the sheet with the combobox focused. Never ask twice in one session. |
| **Loading** | Header and hero render immediately (static). The "Popular" rail shows 3 `ProviderCardSkeleton`s of identical geometry. Category tiles are static — they never show a skeleton. |
| **Empty (no providers in this city yet)** | The rail is replaced by an `EmptyState`: "We're still adding providers in Faridabad" / "Try Gurgaon or Delhi while we grow." + "Browse Gurgaon". |
| **Error** | Rail only: inline error card with "We couldn't load providers." + "Try again". The rest of the page stays usable. |
| **Offline** | A non-blocking `Toast`: "You're offline. Some content may be out of date." Cached content stays visible. |
| **Not found (`/{city}` is not an NCR city)** | 404 `EmptyState` with links to the five supported cities. Must return a real 404 for crawlers (`06-nfr` SEO: no soft-404s). |

## Responsive

| Width | Layout |
|---|---|
| 360–479 | Single column, 16px gutters, 3 category columns, carousel rails |
| 480–767 | Same, 4 category columns, larger hero type |
| 768–1023 | 720px content, hero and search centred (max 560px), 2-up provider grid, "How it works" in 3 columns |
| 1024+ | 960/1200px content, 7 category tiles on one row, 4-up provider grid, footer in 4 columns |

## Copy

| Element | Text |
|---|---|
| H1 | Every pet service in Delhi NCR, in one place. *(placeholder — founder to confirm, see brand-direction.md)* |
| Search placeholder | Search groomers, vets, boarding… |
| Location row (known) | 📍 Gurgaon · Sector 56 |
| Location row (unknown) | 📍 Pick your area |
| Rail heading | Popular near you / Popular in Gurgaon |
| How it works | Search your area · Compare prices and reviews · Send a request — no payment needed |
| Reassurance | Free for pet parents. No payment on UrbanPetly. |
| Provider CTA | Run a pet business? Get found by pet parents nearby. → "List your business" |
| Sign in | Sign in |

## Accessibility

- Exactly one `<h1>`; sections use `<h2>`; the category grid is a `<ul>` of links.
- "Skip to content" is the first focusable element, jumping to `<main>`.
- The location row is a `<button>` named "Change location, currently Gurgaon, Sector 56".
- Category tile accessible name is the category plus context: "Grooming in Gurgaon".
- The carousel is keyboard-scrollable and does not trap focus; no auto-advance.
- Favourite `IconButton` on a card: `aria-pressed`, label "Save Happy Tails Grooming" / "Saved".
- Emoji in the wireframe are placeholders for icon components; real icons are SVG with `aria-hidden="true"`.
- Hero image (if added later) must not push content: reserve the box and keep CLS ≤ 0.1.

## SEO notes (E9)

Prerendered. Unique `<title>`/meta per city; `LocalBusiness`/`ItemList` JSON-LD for the featured rail; `BreadcrumbList` on `/{city}`; canonical `/` for the default city; all category links are crawlable `<a href>` (`02-architecture` §6).

## Performance

The LCP element is the H1 (text) — no hero photo at launch, which keeps LCP well under 2.5 s on 4G (`06-nfr`). Carousel images are lazy-loaded except the first card's. Fonts preload body 400 + heading 700 only.
