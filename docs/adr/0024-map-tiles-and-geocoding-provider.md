# ADR-024: Map tiles and geocoding provider

- Status: Accepted
- Date: 2026-10-18
- Deciders: Tech Lead (spike), founder (approval)
- Supersedes the "provider to choose in spike" part of ADR-011
- Spike: SAM-4 item 3

## Context

[02-architecture.md](../02-architecture.md) §1 mandates MapLibre GL or Leaflet with a tile provider
that has a free tier, and explicitly forbids using the OSM public tile servers in production. We
need three capabilities:

1. **Basemap tiles** — the results map and the provider profile map.
2. **Forward geocoding / autocomplete** — locality and address entry during provider onboarding, and
   the customer's "search in <locality>" box.
3. **Reverse geocoding** — turning a "near me" GPS fix into a locality label.

Constraints that actually decide this:

- **Commercial use must be permitted on whatever tier we use.** UrbanPetly is a commercial product
  from day one. A free tier that forbids commercial use is not a free tier for us at any volume.
- India, specifically Delhi NCR, must be covered at **locality level** (sector, block, colony).
- Launch volume is small — hundreds of map loads per day — but provider onboarding can geocode in
  bursts.

## Options considered

| Provider | Free tier | Commercial use on free tier | Notes |
|---|---|---|---|
| **Geoapify** | 3,000 credits/day, 5 req/s | **Yes**, with attribution | Tiles + geocoding + autocomplete + reverse, one key |
| MapTiler | 5,000 sessions + 100k requests/mo | **No** — Flex plan from $25/mo | Good product, wrong licence tier |
| Stadia Maps | 200,000 credits/mo | **No** — Starter from $20/mo | Generous but unusable free |
| Mapbox | 50,000 GL JS loads/mo | Yes | Terms steer their tiles to their own SDK; conflicts with MapLibre |
| LocationIQ | ~5,000 req/day | Unclear from public pages | Geocoding only; OSM-derived |
| Ola Maps (Krutrim) | Large monthly allowance per API | Yes | India-built, India data residency |
| Mappls (MapmyIndia) | Unpublished | Contact sales | Deepest India POI, Survey of India agreements |
| Self-host (Protomaps / OpenFreeMap) | n/a | n/a | No vendor terms risk, real ops burden |
| Nominatim public instance | 1 req/s | Discouraged | Same class of problem as OSM public tiles |

### Why not the generous ones

MapTiler and Stadia Maps have the most attractive free allowances on paper and are ruled out by the
same sentence in their terms: the free tier is not for commercial use. Shipping a commercial
aggregator on either would be a licence violation we would have to unwind later, and "we are small"
is not a defence. Their paid entry tiers ($25 and $20/month) are modest and both are credible
upgrade targets — the objection is to using the *free* tier, not to the vendors.

Mapbox permits commercial use on its free tier, but its terms steer use of its tile APIs to its own
SDK, which cuts against the MapLibre choice in §1. Not worth litigating when a cleaner option exists.

### Why not the India-specific ones (yet)

**Ola Maps** is attractive and nearly won: built for India, a large free allowance, and the only
shortlisted option offering India data residency — which matters for the [06-nfr.md](../06-nfr.md)
"data stored in India where feasible" goal. Two things held it back for launch:

- Commercial terms are in motion. Pricing, usage tiers and discounts were revised effective
  2026-09-01, and billing moved from automatic card billing to **prepaid credits**, with an
  interruption risk if the balance runs out. The post-change per-API free allowance is described
  only as "a substantial monthly free allowance for each API" rather than a published number.
- Betting the launch on a vendor whose pricing page changed six weeks ago is avoidable risk.

This is a *timing* objection, not a quality one. Ola Maps is the designated upgrade path.

**Mappls (MapmyIndia)** very likely has the best Delhi NCR POI data of anything listed, backed by
formal Survey of India agreements. Its pricing is not public and requires a sales conversation. That
is a fine thing for the founder to have at some point; it is not a thing to block Phase 1 on.

### Why not self-hosting tiles

Protomaps or OpenFreeMap self-hosted would eliminate vendor terms risk entirely and cost only
storage. It also adds a tile pipeline, periodic OSM extract refreshes and another service to the VPS
that ADR-023 is already asking a lot of — and it provides no geocoding, so we would still need a
geocoding vendor. Revisit if tile costs ever become material, which at our volume they will not.

## Decision

**MapLibre GL JS on the client, with Geoapify as the launch provider for both tiles and geocoding.**

Geoapify is chosen because it is the only shortlisted provider that explicitly permits commercial
production use on its free tier — *"You can use the Free plan for commercial websites, apps, and
business projects, including in production"* — while covering tiles, forward geocoding, autocomplete
and reverse geocoding behind a single key. At our launch volume we sit inside 3,000 credits/day at
roughly half the budget — the arithmetic is in [Staying inside the free tier](#staying-inside-the-free-tier)
rather than asserted — and the first paid step (API 10, $59/mo) is a known quantity rather than a
sales call.

### Boundaries, because this decision will be revisited

Both capabilities sit behind ports in `packages/shared` + `apps/api`, not scattered through feature
code:

- `GeocodingProvider` — `search(query, bias)`, `reverse(lat, lng)`, `autocomplete(query, bias)`.
  One implementation per vendor, selected by `MAPS_PROVIDER` env var.
- Tile style URL comes from config (`VITE_MAP_STYLE_URL`, `VITE_MAP_TILE_KEY`), never hardcoded in a
  component. The `VITE_` prefix is load-bearing: Vite only exposes prefixed variables to the browser
  bundle, and the prefix is itself the reader's signal that these two values ship to the client.

Swapping Geoapify for Ola Maps should be a new adapter plus env changes, touching no feature code.
That is the actual deliverable of this ADR; the vendor is the replaceable part.

### Geocoding is server-side; tiles are client-side

- **Geocoding calls go through `apps/api`**, never from the browser. This keeps the geocoding key
  server-side, lets us cache, and gives one place to enforce rate limits. The API exposes
  `GET /api/v1/geo/autocomplete` and `GET /api/v1/geo/reverse`, both authenticated or rate-limited
  per IP, both added to [04-api-contract.md](../04-api-contract.md) when implemented.
- **The tile key is necessarily public** — it ships in the browser. Treat it as public, not secret:
  restrict it to our domains in the Geoapify console, keep it in a *separate* key from the
  server-side geocoding key, and never reuse one for the other. Committing the tile key is not a
  secrets incident; committing the geocoding key is.

### Staying inside the free tier

Steady-state geocoding usage should round to zero. Three caches do that:

1. **Locality centroids are seeded into MySQL once.** A customer searching "Lajpat Nagar" costs zero
   geocoding calls, forever. Delhi NCR has a bounded, slow-changing locality list — this is a seed
   file, not a runtime lookup.
2. **Provider addresses are geocoded once at onboarding** and the result is stored on the provider
   row. Re-geocode only when the address changes.
3. **Reverse geocoding is cached** on coordinates rounded to 3 decimals (~110 m) for 30 days. "Near
   me" from the same neighbourhood hits cache.

Autocomplete is the one genuinely per-keystroke cost: debounce at 300 ms, require 3 characters, and
cap at the Geoapify 5 req/s limit server-side.

#### The credit budget, derived

A map view is not one request — a viewport pulls a tile pyramid, and panning and zooming pull more —
so "hundreds of map loads a day" has to be converted into credits before the free tier can be called
sufficient. Geoapify's published rates: **1 map tile request = 0.25 credits (4 tiles = 1 credit)**,
and 1 geocoding, autocomplete or reverse geocoding request = 1 credit. Geoapify sizes an 800x600
view at **~6 vector tiles**, against ~12-20 raster tiles.

| Item | Volume/day | Credits |
|---|---|---|
| Initial map views | 500 x 6 vector tiles x 0.25 | 750 |
| Pan/zoom on ~30% of views | 150 x ~12 further tiles x 0.25 | 450 |
| Autocomplete (onboarding + search, after debounce) | ~200 requests x 1 | 200 |
| Forward + reverse geocoding (cache misses) | ~100 requests x 1 | 100 |
| **Total** | | **~1,500 of 3,000** |

So roughly 2x headroom, not an unlimited budget. Two things follow, and both are decisions rather
than tuning:

- **Vector tiles are mandatory, not a preference.** The same traffic on raster tiles is 12-20 tiles
  per view instead of 6 — 2-3x the credits — which alone would put us at or over the cap. MapLibre
  gives us vector by default; nothing may switch the style to a raster source without redoing this
  table.
- **~1,000 map loads/day is the upgrade trigger**, not an emergency. At that point we are near the
  cap and move to API 10 ($59/mo). That is a budgeted step, and it is far cheaper than discovering
  the ceiling through 429s in production.

Usage alerting at 70% of the daily credit budget, delivered to the team channel that is actually
watched rather than to an inbox nobody reads — an alert routed nowhere is the same as no alert.

### Address accuracy: do not trust the geocoder

Geoapify is OSM-derived. Delhi NCR OSM data is good at road and locality level and uneven at
door level — apartment complexes and recent developments are frequently missing or misplaced. Since
provider location accuracy drives the core "near me" search in
[01-epics-and-user-stories.md](../01-epics-and-user-stories.md), the geocoder's output is a
**starting guess, not the answer**:

- Provider onboarding shows the geocoded pin on a draggable map and requires the provider to confirm
  or correct it. The stored `lat`/`lng` is what the provider confirmed.
- Admin review can adjust the pin.
- This design is provider-independent, so it survives a later switch to Ola Maps or Mappls — and it
  is the reason a switch is an optimisation rather than a correctness fix.

### Attribution

Geoapify requires `Powered by Geoapify` near the map, plus OSM attribution. Map styles served with
`style.json` carry attribution automatically; any custom map chrome must preserve it. This is a
licence obligation, so it belongs in the UX spec and in the component, not in a reviewer's memory.

## Consequences

- ADR-011 is now concrete: MapLibre GL JS + Geoapify. Leaflet is dropped from the options; one map
  library, vector tiles.
- New env vars, added to [02-architecture.md](../02-architecture.md) §8: `MAPS_PROVIDER` and
  `GEOCODING_API_KEY` server-side (the latter a real secret), `VITE_MAP_STYLE_URL` and
  `VITE_MAP_TILE_KEY` in the frontend builds (public by necessity, domain-restricted).
- A locality seed file for Delhi NCR becomes a Phase 1 deliverable and a dependency of search. It is
  content work as much as code work and needs an owner.
- The map is not on the critical rendering path: MapLibre is code-split and the results list renders
  and is usable without it, to protect the LCP <= 2.5 s budget in [06-nfr.md](../06-nfr.md).
- If daily credits are exceeded, autocomplete degrades to locality-list filtering from our own DB
  rather than erroring. Search must never break because a third party said 429.
- **Credit exhaustion blanks the basemap too, and that needs its own answer.** Separate tile and
  geocoding keys do not mean separate budgets — both draw on one account credit pool, so a 429 hits
  tiles on every page with a map, not just autocomplete. On tile 429 or repeated tile error, MapLibre
  is torn down and the view falls back to the **results list with the provider's address and a
  "Directions" deep link**; the map does not render as a grey void and no error dialog appears. The
  list is the primary surface and the map is an enhancement ([06-nfr.md](../06-nfr.md) keeps it off
  the critical rendering path), so this is a graceful reduction rather than an outage. A tile 429 is
  also a **paging alert** — unlike the autocomplete fallback, it means we have hit the ceiling for
  every user, and the fix is the $59/mo upgrade, not a code change.
- **Open for the founder:** whether an India data-residency requirement or any Survey of India /
  National Geospatial Policy obligation applies to our use of a foreign map service. This is a legal
  question, not a technical one; it is logged in
  [09-decisions-and-open-questions.md](../09-decisions-and-open-questions.md). If the answer is that
  residency is required, we move to Ola Maps and the port above is what makes that cheap.

## References
- [Geoapify pricing](https://www.geoapify.com/pricing/) and [free maps API](https://www.geoapify.com/free-maps-api/)
- [Ola Maps pricing](https://maps.olakrutrim.com/pricing) and [2026 pricing change notice](https://maps.olakrutrim.com/pricing/update-2026)
- [MapTiler pricing](https://www.maptiler.com/cloud/pricing/)
- [OSM raster tile providers](https://wiki.openstreetmap.org/wiki/Raster_tile_providers)
