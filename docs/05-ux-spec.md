# 05 - UX Specification

Owner: UI/UX Designer. Deliverables: design tokens, component library in `packages/ui`, high-fidelity mockups (mobile first) for every screen below, clickable prototype for the three core flows.

> Those deliverables live in **[`docs/design/`](design/README.md)**: the
> [design system](design/design-system.md), the [component build contract](design/component-inventory.md),
> screen specs for [home](design/home.md), [search and listing](design/search-listing.md),
> [provider profile](design/provider-profile.md) and the [request flow](design/request-flow.md),
> the [core flows](design/core-flows.md) and a [clickable prototype](design/prototype/index.html).
> This document stays the high-level spec; `docs/design/` is the detail the developers build from.

## Design principles
- Mobile first (360px base). Large tap targets (44px+), thumb-friendly primary actions.
- Warm, trustworthy, friendly; not childish. Photography-led cards.
- Show the three things parents care about on every card: rating, distance/locality, starting price and whether it is at home.
- Plain language; English first, copy structured for later Hindi translation (no text baked into images).
- WCAG 2.1 AA: contrast, focus states, labels, keyboard support, reduced-motion.

## Information architecture
```
Customer web (urbanpetly.com)
  Home
  /{city}                        city landing
  /{city}/{category}             category listing (prerendered)
  /{city}/{locality}/{category}  locality listing (prerendered)
  /search                        search with filters + map
  /p/{slug}                      provider profile
  /login                         phone OTP
  /account (profile, pets, addresses, favourites, requests, reviews)
  /about /contact /privacy /terms /faq

Provider app (provider.urbanpetly.com)
  Onboarding wizard -> Dashboard -> Requests -> Services -> Photos -> Hours -> Reviews -> Settings

Admin app (admin.urbanpetly.com)
  Review queue -> Providers -> Claims -> Reviews moderation -> Taxonomy -> Imports -> Users -> Audit log
```

## Key screens (customer)
1. **Home**: location selector, category tiles, search box, featured providers, how it works, "list your business" call-to-action.
2. **Search/listing**: filter chips (service mode, rating, price, open now, verified), sort, list/map toggle, provider cards, empty state with suggestions, skeleton loaders.
3. **Provider profile**: gallery, name, badges (Verified, Unclaimed), rating, services and prices accordion (each with At provider / At home tag), service area, hours with open/closed status, map, reviews, sticky "Request booking" and "Call" bar on mobile.
4. **Request flow (3 steps)**: select service -> pet, date/time window, mode (+ address if at home) -> review and send. OTP login inserted inline if signed out. Confirmation screen explains what happens next.
5. **Account**: requests with status chips and timeline; pets; addresses; favourites; delete account.
6. **Review flow**: star rating, text, photos, preview.

## Key screens (provider)
Onboarding wizard (business info -> categories -> location pin on map -> services and prices -> photos -> hours -> submit); each step saves a draft. Dashboard shows pending requests first and a profile completeness meter. Requests inbox with accept / decline / propose-time actions.
Form rule: Save and Back left, primary action right, same row.

## Key screens (admin)
Dense tables with filters, bulk actions, side-by-side diff for profile edits, reason required for reject/suspend/hide, CSV import with dry-run results.

## Core flows to prototype
1. Parent finds a groomer near them -> opens profile -> sends a request.
2. Provider receives the request -> accepts -> parent sees the update.
3. Provider signs up -> claims or creates a listing -> submitted -> admin approves.

## Component inventory (initial)
Button, IconButton, Input, PhoneInput, OtpInput, Select, Combobox (locality), Checkbox, RadioGroup, Chip, Badge, Rating (display and input), Card (ProviderCard, ServiceCard, ReviewCard), Tabs, Accordion, Modal/Sheet, Toast, Skeleton, EmptyState, Pagination, Map (with pins and mini card), Gallery/Lightbox, ImageUploader, DateWindowPicker, Stepper, Table, FilterBar.
Each component needs: states (default, hover, focus, disabled, error, loading), responsive behaviour, and a documented example (Storybook).

## Content states every screen must handle
Loading, empty, error (with retry), offline, no location permission, unauthorized, not found.
