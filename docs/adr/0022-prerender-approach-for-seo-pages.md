# ADR-022: Prerender approach for SEO pages

- Status: Accepted
- Date: 2026-10-18
- Deciders: Tech Lead (spike), founder (approval)
- Refines: ADR-003 (client-side rendered React, no Next.js, prerender key SEO pages)
- Implements: ADR-020 (thin-page rule for locality x category pages)
- Spike: SAM-4 item 1

## Context

[02-architecture.md](../02-architecture.md) §6 requires a client-rendered React app that nevertheless
ships real HTML for SEO pages:

- Build-time prerender of home, city, city x category, locality x category and static pages.
- Prerender of the top N provider profiles; the remaining profiles serve an SPA shell whose
  `<title>`, meta and JSON-LD are correct.
- The prerendered output must boot as a normal SPA after hydration.
- [06-nfr.md](../06-nfr.md) sets the bar: unique title and meta description per prerendered page,
  one H1, valid JSON-LD, no soft-404s, LCP <= 2.5 s on mobile.

The open question was *how*: `vite-react-ssg`, a Playwright snapshot script, or something else.

### What this spike actually did

Documentation and package review, not a running benchmark. The corporate npm proxy in the current
environment serves packages but blocks the `@pnpm/exe` binary and direct git/HTTPS egress from
scratch directories, so a throwaway build was not run end to end. Package availability and versions
were verified against the registry on 2026-10-18:

| Package | Latest version seen |
|---|---|
| `react-router` | 8.4.0 |
| `vite-react-ssg` | 0.9.2 |

The decision below rests on documented behaviour and maintenance posture. **Phase 1 must prove it**
with the acceptance test listed under "Validation owed" before any content work depends on it.

## Options considered

### A. React Router v8 framework mode, `ssr: false` + `prerender` (chosen)

React Router shipped its own static pre-rendering in v7 and improved it in v8 (released 2026-06-17).
Setting `ssr: false` with a `prerender` list builds real HTML for the listed paths and, critically for
us, writes an SPA fallback for everything else:

- `build/client/index.html` if `/` is not prerendered
- `build/client/__spa-fallback.html` if `/` is prerendered

The static host rewrites unmatched paths to that fallback (`/*  /__spa-fallback.html  200`). That is
exactly the hybrid §6 asks for, from first-party code, with no extra rendering dependency.
`prerender` accepts a function, so the path list can be fetched from the API at build time.

- (+) First-party, actively maintained, same team as the router we already mandate.
- (+) Prerendered routes may use real `loader`s, which run at build time.
- (+) One build artefact; hydration correctness is the framework's problem, not ours.
- (-) Requires adopting React Router **framework mode** (its Vite plugin and route config), not just
  the declarative `<Routes>` API.
- (-) v8 is ESM-only and `react-router-dom` no longer exists; imports come from `react-router`.
- (-) Non-prerendered routes may only use `clientLoader`, not `loader`. This is fine for us — our
  data comes from the API over HTTP anyway — but it is a real constraint on future code.

### B. `vite-react-ssg`

A third-party SSG layer for React on Vite, still published (0.9.2). It solved this problem before
React Router had an answer. Its own guidance now points React Router v7+ users at the router's
built-in SSG for better integration and official support.

- (+) Works with the plain declarative router API; smaller conceptual change.
- (-) A third-party dependency sitting between us and the router, whose maintainer defers to the
  option we are choosing anyway. Adopting it means owning that integration risk for the life of
  the product to avoid a one-time migration cost.
- Rejected: strictly more risk than A for no benefit we need.

### C. Playwright snapshot script

Build the SPA, serve it, drive a headless browser over a URL list, write the resulting DOM to disk.

- (+) Framework-agnostic; works with any router, any version.
- (-) Snapshots post-hydration DOM, which routinely captures loading states, scroll position and
  other transient UI unless carefully fenced.
- (-) Slow and serial: a browser page load per URL, versus a render per URL.
- (-) Puts a browser download and a running server in the critical path of every production build.
- (-) Nothing guarantees the snapshot rehydrates cleanly; mismatches surface as client-side
  errors in production rather than build failures.
- Rejected as the primary mechanism. **Kept as the documented fallback** if A fails the Phase 1
  validation, because it has no framework coupling at all.

### D. Do nothing; serve the SPA shell everywhere

- Rejected: fails the §6 and 06-nfr SEO bars outright. Organic search is the primary acquisition
  channel in [00-product-brief.md](../00-product-brief.md).

### E. Adopt Next.js

- Rejected: ADR-003 already settled this, and nothing found in this spike reopens it.

## Decision

**Build `apps/web` with React Router v8 in framework mode, `ssr: false`, and a dynamic `prerender`
list.** `apps/provider` and `apps/admin` stay plain client-rendered SPAs — they are behind login
and must not be indexed, so they get no prerendering and no framework mode.

### Prerender path list

`prerender` is a function, not a static array. At build time it reads a **prerender manifest**:

1. A build step calls `GET /api/v1/seo/prerender-manifest` against the environment's API and writes
   `apps/web/prerender-manifest.json`.
2. The manifest contains: static paths, city paths, city x category, locality x category, and the
   top N provider slugs (N configurable, start at 200, ordered by rating then views).
3. If the API is unreachable, the build step falls back to a committed
   `prerender-manifest.fallback.json` holding static and city pages only, and **logs a warning
   rather than failing**. A slow day for SEO beats a broken production deploy.

This keeps the build deterministic given a manifest, and keeps the "which pages are worth
prerendering" rule in the API next to the data, where it belongs.

**The manifest endpoint owns the ADR-020 thin-page rule.** A locality x category path is included
only when that locality and category have **3 or more published providers**; below the threshold the
page is not prerendered, not in the sitemap, and renders with `<link rel="canonical">` pointing at the
city x category page plus `<meta name="robots" content="noindex,follow">`. Putting the threshold in
the endpoint rather than the build script means prerendering, the sitemap job (E9-S3) and the runtime
canonical tag all read one implementation and cannot drift apart — which is the failure mode that
produces the soft-404s 06-nfr.md forbids. The nightly sitemap job and the next build therefore pick
up a locality crossing the threshold automatically; no manual list is maintained.

### Per-provider meta for non-prerendered pages

The SPA fallback is a single HTML file and therefore carries generic meta. Provider profiles outside
the top N get correct meta from a small API-side handler:

- The reverse proxy routes `/p/:slug` to the static files first. On miss, it proxies to
  `GET /api/v1/seo/page?path=<path>` instead of serving the fallback directly.
- That route loads `__spa-fallback.html` once at boot, and injects `<title>`, `<meta name="description">`,
  `<link rel="canonical">`, Open Graph tags and `LocalBusiness` JSON-LD into a `<!--seo-->` placeholder.
- Unknown or unpublished slugs return **404 with a real 404 page**, not a 200 shell. No soft-404s.
- Responses carry `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`.

The handler does string injection into a fixed placeholder, not HTML parsing. It has two injection
sites and they need **different** escaping rules. Conflating them is how this goes wrong, so both are
stated explicitly:

- **Markup attributes and text — `<title>`, `<meta name="description">`, `<link rel="canonical">`,
  Open Graph tags — are HTML-escaped**: `&`, `<`, `>`, `"` and `'` become entities. These values sit
  in ordinary markup, where the HTML parser decodes entities back to the original characters.
- **The JSON-LD payload is JSON-escaped, never HTML-escaped.** It is produced with `JSON.stringify`,
  and then `<`, `>` and `&` are each replaced by their **JSON unicode escape** — the six-character
  sequence backslash-`u003c` and so on, exactly as written in the snippet below — before the string
  is written into the `<script type="application/ld+json">` block:

  ```js
  const json = JSON.stringify(ld)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  ```

HTML escaping inside the JSON-LD block would be wrong on both counts. HTML entities are **not**
decoded inside a `script` element, so `&lt;` would arrive at the JSON parser literally and break the
JSON-LD, while a display name containing `</script>` would still terminate the block early — the
exact attack the escaping exists to stop. The unicode escapes are valid JSON, are decoded by the JSON
parser back to the original characters, and contain no `<`, so nothing in the payload can close the
script element.

Provider-controlled text reaching a `<script>` block is the obvious XSS route here and this handler
is the only place it can happen, so it gets dedicated tests — including a display name of
`</script><img src=x onerror=alert(1)>`, asserting both that the rendered page is inert and that the
JSON-LD still parses.

### Sitemap

Unchanged from §6: nightly job generates `sitemap.xml` from the DB. The sitemap lists **all**
published providers, not just prerendered ones — for provider profiles, prerendering is a performance
and crawl-budget optimisation, not an indexing gate.

Locality x category pages are the one exception, and it is a product decision rather than a
performance one: ADR-020 keeps a page with fewer than 3 published providers out of both the prerender
manifest and the sitemap. The job reads the same threshold from the manifest endpoint, so "prerendered"
and "in the sitemap" cannot disagree for these pages.

## Consequences

- `apps/web` uses React Router framework mode; the other two apps use the plain router API. Two
  routing idioms in one monorepo is a real inconsistency cost, accepted because the apps have
  genuinely different requirements. Reviewers should expect it rather than "fix" it.
- Pin React Router to v8 across all three apps so shared components in `packages/ui` stay portable.
  Import from `react-router`, never `react-router-dom`.
- `packages/ui` components must not use framework-mode-only APIs — `Form`, route module exports
  (`loader`, `action`, `meta`), or the typed `href` helper. A component that does works in `apps/web`
  and breaks in `apps/provider` and `apps/admin`, which is the specific way the two idioms would start
  leaking into each other. Shared components take data and callbacks as props; routing concerns stay
  in the app. `packages/ui` does not exist yet, so this costs nothing to adopt now.
- The customer web build depends on API availability for a *good* build and on nothing for a
  *working* build.
- Production build time grows with N. Revisit N when the manifest exceeds ~2000 paths.
- Deployment gains a required nginx rewrite rule. Getting it wrong produces 404s on valid routes,
  which is the single most likely launch bug from this decision — it goes in the smoke test.
- New API surface: `GET /api/v1/seo/prerender-manifest` and `GET /api/v1/seo/page`. Both are public
  and cacheable; both need adding to [04-api-contract.md](../04-api-contract.md) when implemented.

## Validation owed (Phase 1, blocking content work)

1. A prerendered city x category page returns HTML containing the H1 and listings **with JavaScript
   disabled**.
2. The same page hydrates and behaves as an SPA with no console hydration warnings.
3. A provider profile *not* in the manifest returns 200 with a unique `<title>` and valid JSON-LD,
   **served by the proxy falling through to `GET /api/v1/seo/page`** — not by the static fallback.
   Assert this by comparing two non-prerendered profiles: their titles and canonicals must differ. A
   misconfigured proxy that serves the generic fallback also returns 200 with a `<title>`, so a
   single-page check passes while every profile ships identical meta.
4. An unknown provider slug returns 404.
5. Client-side navigation between a prerendered and a non-prerendered route works in both directions.
6. A locality x category page with fewer than 3 published providers is absent from both the manifest
   and the sitemap, and serves `noindex,follow` with a canonical pointing at the city x category page
   (ADR-020). Crossing the threshold adds it on the next build and the next nightly sitemap run.
7. **A cold load of a non-prerendered, non-`/p/` route** — e.g. `/search?city=delhi&category=grooming`
   typed into a fresh tab, and a hard refresh on that URL — returns 200 and boots the SPA. This is the
   nginx `/* -> /__spa-fallback.html 200` rewrite, which the Consequences section calls the single most
   likely launch bug from this decision. Item 5 does not cover it: client-side navigation works fine
   with a completely broken rewrite, because the server is never asked. Only a cold load or hard
   refresh exercises it.
8. **A production build with the API unreachable** exits 0, emits a warning, and prerenders from the
   committed fallback manifest. Point the build at a dead port and assert all three. This branch runs
   only during an outage, which is the worst possible time to discover it was never tested.

If (1) or (2) fails and cannot be fixed within a day, fall back to option C and supersede this ADR.

## References
- [React Router pre-rendering](https://reactrouter.com/how-to/pre-rendering)
- [React Router SPA mode](https://reactrouter.com/how-to/spa)
- [React Router v8 release](https://remix.run/blog/react-router-v8)
- [vite-react-ssg](https://github.com/Daydreamer-riri/vite-react-ssg)
