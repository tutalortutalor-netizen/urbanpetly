# 02 - Architecture

## 1. Stack
| Layer | Choice | Notes |
|---|---|---|
| Monorepo | pnpm workspaces (+ Turborepo optional) | Node 22 LTS |
| Frontend (x3) | React 18+, TypeScript, Vite, Tailwind CSS, React Router v8, TanStack Query | Client-side rendering only. No Next.js. `web` uses React Router framework mode for prerendering ([ADR-022](adr/0022-prerender-approach-for-seo-pages.md)); `provider` and `admin` use the plain router API. v8 is ESM-only: import from `react-router`, never `react-router-dom`. |
| API | Node, TypeScript, Fastify | Zod schemas (shared) + `fastify-type-provider-zod`, `@fastify/swagger` |
| DB | MySQL 8 | utf8mb4, spatial columns and indexes for geo search |
| Data access | **Knex** (query builder, migrations, seeds) | Hand-written row types in `packages/shared`; raw SQL for spatial queries |
| Object store | SeaweedFS (S3 gateway), self-hosted on Dokploy ([ADR-023](adr/0023-object-storage-product-and-backups.md)) | Accessed via AWS SDK v3; endpoint from env. MinIO is archived and must not be used |
| Maps | MapLibre GL JS + Geoapify tiles and geocoding ([ADR-024](adr/0024-map-tiles-and-geocoding-provider.md)) | Do not use OSM public tile servers in production. Geocoding is proxied through the API; tile key is public and domain-restricted |
| Auth | Phone OTP -> short-lived JWT access token (in memory) + rotating opaque refresh token in a host-only `__Host-` cookie on `api.` ([ADR-025](adr/0025-auth-sessions-across-subdomains.md)) | OTP provider supplied later. One session per audience; no SSO across apps |
| Email | `Mailer` interface; SMTP or a transactional provider | |
| Tests | Vitest, Playwright, axe-core | See 07 |

## 2. Monorepo layout
```
urbanpetly/
  apps/
    web/          customer site (Vite + React)
    provider/     provider dashboard (Vite + React)
    admin/        admin back office (Vite + React)
    api/          Fastify API
  packages/
    shared/       Zod schemas, TS types, constants, enums, error codes
    api-client/   typed fetch client generated from / aligned with the API contract
    ui/           shared React components + Tailwind preset + design tokens
    config/       eslint, prettier, tsconfig bases
  docs/           this spec
  infra/          Dockerfiles, Dokploy notes, nginx config
```
Rules:
- Apps may import from `packages/*`, never from each other.
- `packages/shared` has no runtime dependencies other than Zod.
- The API is the only code that talks to MySQL and the object store.

## 3. API structure (apps/api)
```
src/
  server.ts            bootstrap
  app.ts               builds the Fastify instance (used by tests via inject())
  config/              env parsing (Zod), fail fast on missing vars
  plugins/             auth, rate-limit, cors, helmet, swagger, db, storage
  modules/<feature>/   routes.ts, service.ts, repository.ts, schemas.ts, *.test.ts
  jobs/                scheduled tasks (expire requests, cleanup, sitemap)
  db/migrations/       Knex migrations (timestamped, reversible)
  db/seeds/
```
Layering: route (validation, auth) -> service (business rules) -> repository (Knex only). Services never import Fastify; repositories never contain business rules.
Every mutation is transactional where more than one table is touched.

## 4. Geo search
- Providers have `location POINT SRID 4326` with a SPATIAL INDEX, plus `lat`/`lng` decimals.
- Radius query: bounding-box pre-filter with the spatial index, then `ST_Distance_Sphere` for exact distance and ordering.
- At-home matching uses `provider_service_areas` (pincode rows and/or `radius_km`).
- Raw SQL lives in repositories with tests against a real MySQL instance.

## 5. Frontend conventions
- Mobile-first, responsive; tested at 360px width.
- Routing: React Router; URLs mirror state (filters in query string).
- Data fetching: TanStack Query via `packages/api-client`; no ad-hoc `fetch` in components.
- Forms: React Hook Form + Zod resolvers from `packages/shared`.
- Design tokens live in `packages/ui`; no hard-coded colours or spacing in app code.
- Code-split per route; images lazy-loaded with width/height set.

## 6. SEO with client-side rendering
Mechanism decided in [ADR-022](adr/0022-prerender-approach-for-seo-pages.md): React Router v8 framework mode with `ssr: false` and a dynamic `prerender` list. Read that ADR before changing anything in this section.
- Build-time prerender of: home, city pages, city x category, locality x category, static pages. The path list comes from `GET /api/v1/seo/prerender-manifest` at build time, written to `apps/web/prerender-manifest.json`; if the API is unreachable the build falls back to a committed manifest of static and city pages and warns rather than failing. Output hydrates/boots as a normal SPA.
- That manifest endpoint enforces the ADR-020 thin-page rule: a locality x category path is included only at 3 or more published providers. Below the threshold the page is not prerendered, not in the sitemap, and serves `noindex,follow` with a canonical to the city x category page. The threshold lives in the endpoint so prerendering, the nightly sitemap job and the runtime canonical cannot drift apart.
- Provider detail pages: prerender the top N (by rating and views, N starts at 200); for the rest the proxy falls through to `GET /api/v1/seo/page?path=...`, which injects the correct `<title>`, meta, canonical and JSON-LD into the SPA fallback HTML so crawlers that do not run JS still see basics. Unknown or unpublished slugs return a real 404, never a 200 shell.
- Static hosting must rewrite unmatched paths to `__spa-fallback.html` (or `index.html` if `/` is not prerendered). A missing rewrite rule produces 404s on valid routes; this is covered by the deploy smoke test.
- The sitemap lists all published providers, not only prerendered ones. For provider profiles, prerendering is a performance and crawl-budget optimisation, not an indexing gate. Locality x category pages are the exception, governed by ADR-020 above.
- `sitemap.xml` generated from the DB (nightly job); `robots.txt`; canonical tags; structured data (`LocalBusiness`, `BreadcrumbList`).
- Core Web Vitals budgets in 06-nfr.

## 7. Environments and deployment (Dokploy on VPS)
| Env | Purpose |
|---|---|
| local | Docker Compose: MySQL, object store, mailhog; OTP uses fake sender |
| staging | Auto-deploy from `main`; seeded demo data; real SMS disabled or allowlisted |
| production | Deploy on tagged release; manual approval |

Services: `api`, `web`, `provider`, `admin` (static files via nginx), `mysql`, `objectstore`, reverse proxy (Traefik via Dokploy).
Domains: `urbanpetly.com` (web), `provider.urbanpetly.com`, `admin.urbanpetly.com` (restrict by IP/VPN if possible), `api.urbanpetly.com`, `media.urbanpetly.com`. `www` and `urbanpetly.in` 301-redirect to the apex and never serve an app - [ADR-025](adr/0025-auth-sessions-across-subdomains.md) depends on every browser origin sharing the `urbanpetly.com` registrable domain.
Backups ([ADR-023](adr/0023-object-storage-product-and-backups.md)): daily `mysqldump --single-transaction` and daily `rclone sync` of the object store **through the S3 API** (never by copying volume files) to an off-server destination; encrypted at rest at the destination; retention 14 days plus monthly kept 6 months; write-and-list-only backup credentials; failures alert; quarterly restore drill against staging.

## 8. Configuration (env vars, no secrets in git)
`NODE_ENV, PORT, DATABASE_URL (or DB_HOST/PORT/USER/PASSWORD/NAME), JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, OTP_PROVIDER, OTP_API_URL, OTP_API_KEY, S3_ENDPOINT, S3_REGION, S3_BUCKET_MEDIA, S3_BUCKET_DOCS, S3_ACCESS_KEY, S3_SECRET_KEY, MEDIA_PUBLIC_URL, MAPS_PROVIDER, GEOCODING_API_KEY, SMTP_URL (or provider key), APP_WEB_URL, CORS_ALLOWED_ORIGINS, ADMIN_PHONE_ALLOWLIST, SENTRY_DSN (optional)`.
Frontend build-time vars (shipped to the browser, **not secrets**): `VITE_API_URL, VITE_MAP_STYLE_URL, VITE_MAP_TILE_KEY`.
The tile key is public by necessity and domain-restricted; `GEOCODING_API_KEY` is server-side only and must never appear in a frontend bundle. They are separate keys ([ADR-024](adr/0024-map-tiles-and-geocoding-provider.md)).
Provide `.env.example` in each app; validate with Zod at startup.

## 9. Observability
Pino JSON logs with request IDs; `/health` (liveness) and `/ready` (DB check); error tracking (Sentry or equivalent); uptime monitor on the public domains.
