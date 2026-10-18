# 02 - Architecture

## 1. Stack
| Layer | Choice | Notes |
|---|---|---|
| Monorepo | pnpm workspaces (+ Turborepo optional) | Node 22 LTS |
| Frontend (x3) | React 18+, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query | Client-side rendering only. No Next.js. |
| API | Node, TypeScript, Fastify | Zod schemas (shared) + `fastify-type-provider-zod`, `@fastify/swagger` |
| DB | MySQL 8 | utf8mb4, spatial columns and indexes for geo search |
| Data access | **Knex** (query builder, migrations, seeds) | Hand-written row types in `packages/shared`; raw SQL for spatial queries |
| Object store | S3-compatible, self-hosted on Dokploy | Accessed via AWS SDK v3; endpoint from env |
| Maps | MapLibre GL or Leaflet + tile provider with a free tier | Do not use OSM public tile servers in production |
| Auth | Phone OTP -> short-lived JWT access token + rotating refresh token (httpOnly cookie) | OTP provider supplied later |
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
- Build-time prerender of: home, city pages, city x category, locality x category, static pages. Data comes from the API at build time. Approach to confirm in an ADR spike (candidates: `vite-react-ssg`, or Playwright-based snapshot script). Result must hydrate/boot as a normal SPA.
- Provider detail pages: prerender the top N (by rating and views); for the rest serve the SPA shell with correct `<title>`, meta and JSON-LD injected by a small server-side meta handler (API endpoint behind the reverse proxy) so crawlers that do not run JS still see basics.
- `sitemap.xml` generated from the DB (nightly job); `robots.txt`; canonical tags; structured data (`LocalBusiness`, `BreadcrumbList`).
- Core Web Vitals budgets in 06-nfr.

## 7. Environments and deployment (Dokploy on VPS)
| Env | Purpose |
|---|---|
| local | Docker Compose: MySQL, object store, mailhog; OTP uses fake sender |
| staging | Auto-deploy from `main`; seeded demo data; real SMS disabled or allowlisted |
| production | Deploy on tagged release; manual approval |

Services: `api`, `web`, `provider`, `admin` (static files via nginx), `mysql`, `objectstore`, reverse proxy (Traefik via Dokploy).
Domains: `urbanpetly.com` (web), `provider.urbanpetly.com`, `admin.urbanpetly.com` (restrict by IP/VPN if possible), `api.urbanpetly.com`, `media.urbanpetly.com`.
Backups: daily MySQL dump and object-store sync to an off-server destination; retention 14 days; quarterly restore drill.

## 8. Configuration (env vars, no secrets in git)
`NODE_ENV, PORT, DATABASE_URL (or DB_HOST/PORT/USER/PASSWORD/NAME), JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, OTP_PROVIDER, OTP_API_URL, OTP_API_KEY, S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY, MEDIA_PUBLIC_URL, SMTP_URL (or provider key), APP_WEB_URL, ADMIN_PHONE_ALLOWLIST, SENTRY_DSN (optional)`.
Provide `.env.example` in each app; validate with Zod at startup.

## 9. Observability
Pino JSON logs with request IDs; `/health` (liveness) and `/ready` (DB check); error tracking (Sentry or equivalent); uptime monitor on the public domains.
