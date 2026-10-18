# 04 - API Contract (v1)

Base URL: `/api/v1`. JSON only. The OpenAPI document is generated from Zod route schemas and published at `/api/docs` (non-production or protected). This document defines the intended surface; the generated OpenAPI becomes authoritative once implemented.

## Conventions
- Auth: `Authorization: Bearer <access_token>` (15 min). Refresh token in httpOnly, Secure, SameSite=Lax cookie (30 days, rotating).
- IDs in URLs are `public_id` (ULID) or `slug` where noted.
- Pagination: `?page=1&pageSize=20` (max 50) -> `{ data: [...], meta: { page, pageSize, total } }`.
- Sorting/filter params are explicit query params validated by Zod; unknown params are rejected with 400.
- Errors use one shape: `{ error: { code, message, details? } }` with codes in `packages/shared`.
  - 400 `VALIDATION_ERROR`, 401 `UNAUTHENTICATED`, 403 `FORBIDDEN`, 404 `NOT_FOUND`, 409 `CONFLICT`, 422 `BUSINESS_RULE`, 429 `RATE_LIMITED`, 500 `INTERNAL`.
- Idempotency: `POST /requests` accepts an `Idempotency-Key` header.
- All mutations by providers/admins write an `audit_logs` row; every endpoint enforces role and ownership checks.
- Timestamps are ISO 8601 UTC. Money is integer INR.

## Auth
| Method | Path | Role | Description |
|---|---|---|---|
| POST | /auth/otp/request | public | `{ phone, purpose }` -> 204 (always, no user enumeration) |
| POST | /auth/otp/verify | public | `{ phone, code }` -> `{ accessToken, user }` + sets refresh cookie |
| POST | /auth/refresh | cookie | rotates refresh token |
| POST | /auth/logout | user | revokes current refresh token |
| POST | /auth/logout-all | user | revokes all |

## Public catalogue
| Method | Path | Description |
|---|---|---|
| GET | /cities | active cities |
| GET | /cities/:citySlug/localities | localities |
| GET | /categories | active categories |
| GET | /providers | search. Query: `q, category, city, locality, lat, lng, radiusKm, mode (at_provider|at_home), minRating, maxPrice, openNow, verified, sort (relevance|distance|rating|price), page, pageSize` |
| GET | /providers/:slug | provider detail (services, hours, media, rating summary) |
| GET | /providers/:slug/reviews | published reviews, paginated |
| POST | /providers/:slug/events | `{ type: 'call'|'whatsapp'|'share' }` (rate-limited, no PII) |
| GET | /seo/meta?path= | meta/JSON-LD for a URL path (used by the meta handler) |
| GET | /sitemap/providers | feed for sitemap generation |

## Customer (role: customer)
| Method | Path | Description |
|---|---|---|
| GET/PATCH | /me | profile |
| DELETE | /me | request account deletion (anonymises; see NFR) |
| GET/POST | /me/pets, PATCH/DELETE /me/pets/:id | pets |
| GET/POST | /me/addresses, PATCH/DELETE /me/addresses/:id | addresses |
| GET/PUT/DELETE | /me/favorites/:providerId | favourites |
| POST | /requests | create enquiry/booking request |
| GET | /requests | my requests (filter by status) |
| GET | /requests/:id | detail incl. event timeline |
| POST | /requests/:id/cancel | cancel pending/accepted |
| POST | /requests/:id/reviews | create review (only if `completed`) |
| PATCH | /reviews/:id | edit within 7 days |
| POST | /reviews/:id/report | report a review |
| POST | /media/uploads | `{ kind, mime, size }` -> presigned URL + media id |
| POST | /media/:id/complete | confirm upload; triggers processing |

## Provider (role: provider)
| Method | Path | Description |
|---|---|---|
| POST | /provider/profile | create business profile (draft) |
| GET/PATCH | /provider/profile | own profile |
| POST | /provider/profile/submit | submit for review |
| GET | /provider/claimable?phone= | listings matching my phone |
| POST | /provider/claims | start claim for a listing |
| CRUD | /provider/services | services |
| PUT | /provider/service-areas | replace areas |
| PUT | /provider/hours, CRUD /provider/closures | availability |
| PUT | /provider/photos | order/attach photos |
| POST | /provider/verification-documents | attach doc |
| GET | /provider/requests | inbox (filter by status) |
| POST | /provider/requests/:id/accept, /decline, /propose, /complete | actions |
| POST | /provider/reviews/:id/reply | reply once |
| GET | /provider/stats?range=30d | P2 |

## Admin (role: admin)
| Method | Path | Description |
|---|---|---|
| GET | /admin/providers | filter by status/verification |
| POST | /admin/providers | create listing (unclaimed) |
| PATCH | /admin/providers/:id | edit |
| POST | /admin/providers/:id/approve, /reject, /suspend, /verify | moderation |
| POST | /admin/claims/:id/approve, /reject | claims |
| GET | /admin/reviews?status=reported | moderation queue |
| POST | /admin/reviews/:id/hide, /restore | moderation |
| CRUD | /admin/categories, /admin/cities, /admin/localities | taxonomy |
| POST | /admin/imports/providers | CSV upload, `?dryRun=true` |
| GET | /admin/users, POST /admin/users/:id/suspend | users |
| GET | /admin/audit-logs | audit trail |

## Operational
`GET /health` (liveness), `GET /ready` (DB + object store checks). Not under `/api/v1`.

## Rate limits (defaults)
- Global: 120 req/min per IP.
- `/auth/otp/request`: 3 per phone / 15 min, 10 per IP / hour.
- `/auth/otp/verify`: 5 attempts per challenge.
- `POST /requests`: 10 per user / day.
- Uploads: 30 per user / hour.
