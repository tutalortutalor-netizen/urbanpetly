# ADR-025: Auth sessions across subdomains

- Status: Accepted
- Date: 2026-10-18
- Deciders: Tech Lead (spike), founder (approval)
- Refines: ADR-007 (phone OTP login) and the auth conventions in [04-api-contract.md](../04-api-contract.md)
- Spike: SAM-4 item 4

## Context

Three browser apps, one API and the object-store read path live on five hostnames
([02-architecture.md](../02-architecture.md) §7):

| Host | App |
|---|---|
| `urbanpetly.com` | customer web |
| `provider.urbanpetly.com` | provider dashboard |
| `admin.urbanpetly.com` | admin back office |
| `api.urbanpetly.com` | API |
| `media.urbanpetly.com` | object storage read path |

[04-api-contract.md](../04-api-contract.md) already fixes the shape: `Authorization: Bearer` access
token valid 15 minutes, refresh token in an httpOnly, Secure, SameSite=Lax cookie valid 30 days,
rotating. [06-nfr.md](../06-nfr.md) adds: refresh tokens hashed in the DB, rotated, revocable;
strict CORS allowlist; CSRF protection on the cookie-based refresh endpoint.

What was unspecified, and what this ADR settles: **which host the cookie is scoped to**, whether the
three apps share one session, how CORS is configured for credentialed cross-origin requests, and
what "CSRF protection" concretely means here.

The key fact the design rests on: all five hostnames share the registrable domain `urbanpetly.com`,
so requests between them are **same-site but cross-origin**. Same-site is why `SameSite=Lax` cookies
are sent at all; cross-origin is why CORS with credentials is required.

## Options considered

### A. Domain-wide cookie: `Domain=.urbanpetly.com`

The reflexive choice, and the one to avoid.

- Sends the refresh token to **every** subdomain, including `media.urbanpetly.com`, which serves
  provider-uploaded content. Any content-injection problem on the media host becomes a session
  compromise.
- Any subdomain, present or future, can **overwrite** a parent-domain cookie ("cookie tossing").
  A single sloppy subdomain — a status page, a marketing microsite — becomes an auth vulnerability.
- Forecloses `__Host-`, the one cookie prefix that structurally prevents both problems.
- Buys nothing: all three apps call the same API origin anyway, so a host-only cookie on the API
  already reaches every app. **Rejected.**

### B. Host-only `__Host-` cookie on `api.urbanpetly.com` (chosen)

The `__Host-` prefix is enforced by the browser: the cookie must be `Secure`, must have `Path=/`,
and must have **no `Domain` attribute** — making it host-only and un-overwritable by any other
subdomain. Because every app calls `api.urbanpetly.com`, the cookie is sent from all three with
`credentials: 'include'`, and `SameSite=Lax` permits it because those requests are same-site.

### C. Separate API host per app (`api-provider.`, `api-admin.`)

Would give hard cookie isolation per app, but triples TLS, routing and deployment surface, and
splits one API into three for an isolation win that option B achieves with a cookie name.
**Rejected as disproportionate.**

### D. Token in `localStorage`, no cookies

Removes CSRF entirely and removes cross-origin cookie problems. Also makes any XSS a full,
persistent account takeover with no refresh rotation to limit it, and contradicts
[06-nfr.md](../06-nfr.md). **Rejected.**

## Decision

### Cookie

```
Set-Cookie: __Host-up_rt_<audience>=<opaque-random-256-bit>;
            Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=<per audience>
```

- Set by, and only ever sent to, `api.urbanpetly.com`. No `Domain` attribute — this is deliberate
  and `__Host-` enforces it.
- The value is **opaque random**, not a JWT. Refresh tokens carry no claims; they are a database
  lookup key, stored as a SHA-256 hash so a DB read does not yield usable tokens.
- `SameSite=Lax` (as per 04) is sufficient, not merely tolerated: cross-*site* requests cannot carry
  it, while our same-site cross-origin calls can.

### One session per audience, not one session per user

Three independent cookie names: `__Host-up_rt_customer`, `__Host-up_rt_provider`,
`__Host-up_rt_admin`. (`__Host-` mandates `Path=/`, so audiences are separated by name, not path.)

- An admin session must not be usable by the customer app. Shared-session SSO across all three would
  mean an XSS on the public customer site reaches admin capability.
- A user can legitimately be both a customer and a provider; these are different sessions with
  different lifetimes, not different roles on one session.
- Logging out of the provider dashboard must not log you out of the customer site.

Signing in separately to each app is a deliberate, accepted cost. We are not building SSO.

| Audience | Access token | Refresh token |
|---|---|---|
| customer | 15 min | 30 days |
| provider | 15 min | 30 days |
| admin | **10 min** | **12 hours** |

Admin gets shorter lifetimes on top of the proxy IP restriction and `ADMIN_PHONE_ALLOWLIST` already
in [02-architecture.md](../02-architecture.md) — it is the highest-value session we issue.

### Audience resolution

The API derives the audience from the request's `Origin` header, mapped through the CORS allowlist,
and reads only the matching cookie. A request with a missing or unrecognised `Origin` on a
cookie-authenticated endpoint is **rejected**, not defaulted. Since every app→API call is
cross-origin, `Origin` is always present on the requests that matter.

### Access token

- A JWT, kept **in memory only** — never `localStorage`, never `sessionStorage`, never a cookie. A
  page reload calls `POST /auth/refresh` to obtain a new one.
- Claims: `sub` (user `public_id`, ULID), `aud` (`customer` | `provider` | `admin`), `roles`, `sid`
  (session id, for revocation), `iss`, `iat`, `exp`.
- The API validates `aud` against the endpoint's expected audience. A valid customer token must be
  rejected by an admin route even if the user happens to hold the admin role — audience and role are
  separate checks and both are required.

### Rotation and reuse detection

Every `POST /auth/refresh` invalidates the presented token and issues a new one in the same session
family. If an **already-used** token is presented, that means the token leaked: the API revokes the
entire session family, logs a security event, and returns 401. Rotation without reuse detection
detects nothing, so these ship together or not at all.

### CORS

```
Access-Control-Allow-Origin: <echoed from an exact-match allowlist>
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Idempotency-Key
Vary: Origin
```

- Allowlist is exact origins from config, never a wildcard and never a regex over
  `*.urbanpetly.com`. A regex is how a forgotten subdomain becomes an allowed origin.
- `Access-Control-Allow-Origin: *` is incompatible with credentials; the browser rejects it. The
  allowlist is not optional defence-in-depth, it is load-bearing.
- `Vary: Origin` on every response, or a shared cache will serve one app's CORS headers to another.
- Production allowlist: `https://urbanpetly.com`, `https://provider.urbanpetly.com`,
  `https://admin.urbanpetly.com`. `www` 301-redirects to the apex and is **not** in the allowlist.

### CSRF

Scope the problem correctly. Endpoints authenticated by the `Authorization` header are not
CSRF-reachable: a cross-site page cannot set that header without a preflight our allowlist denies.
**Only the cookie-authenticated endpoints need CSRF defence** — `POST /auth/refresh`,
`POST /auth/logout`, `POST /auth/logout-all`.

Those are protected by two controls:

1. `SameSite=Lax`, which prevents the cookie being sent on cross-site POSTs at all.
2. A mandatory `Origin` exact-match check against the allowlist, rejecting missing or unknown values.

We deliberately do **not** add a double-submit CSRF token. With a host-only `__Host-` cookie,
`SameSite=Lax`, and a strict `Origin` check, it would add a moving part without closing a reachable
gap. This is written down so that a future reviewer asking "where is the CSRF token?" finds the
reasoning instead of adding one by reflex. **If we ever need `SameSite=None`** — for example to put
an app on a different registrable domain — this conclusion is void and a token becomes mandatory.

### Constraint: `urbanpetly.in` must not serve the apps

ADR-001 registers `urbanpetly.in`. It must **301-redirect to `urbanpetly.com`** and never serve an
app. A `.in` origin would be cross-*site* relative to `api.urbanpetly.com`, which breaks
`SameSite=Lax` and forces `SameSite=None` plus full CSRF tokens. Serving the app from `.in` is a
cross-cutting auth change, not a DNS change, and needs a new ADR.

### Local development

Day-to-day: the Vite dev server proxies `/api` to the local API, so dev is **same-origin** and
exercises neither CORS nor cross-origin cookies. That is the pragmatic default and it has an obvious
failure mode — "works locally, breaks in staging".

So, additionally: a Docker Compose profile serving the apps over HTTPS on `*.lvh.me` with
locally-trusted certificates (mkcert), mirroring the production origin layout. **Any PR touching
auth, cookies or CORS must be exercised against that profile**, and CI asserts the concrete
`Set-Cookie` attributes and CORS headers on the auth routes so a regression fails the build rather
than staging. (`__Host-` needs `Secure`; browsers treat `http://localhost` as a secure context, but
the `lvh.me` profile uses real HTTPS and avoids depending on that.)

## Consequences

- `packages/api-client` sets `credentials: 'include'` on every request and holds the access token in
  a module-scoped variable with a single refresh-on-401 interceptor that de-duplicates concurrent
  refreshes. Three parallel 401s must trigger one refresh, not three — three would trip reuse
  detection and log the user out.
- No shared sign-in between the three apps. The UX spec should not promise one.
- The `refresh_tokens` table needs `session_family_id`, `used_at` and `revoked_at` to support
  rotation and reuse detection — [03-data-model.md](../03-data-model.md) to be updated when
  implemented.
- `/auth/refresh` is called on every page load, so it must be fast and must not be rate-limited in a
  way that breaks normal multi-tab use.
- Adding any new browser origin is a config change plus an ADR check against the same-site
  assumption above. It is not a self-service change.
- Logs must never contain refresh token values, access tokens or full phone numbers
  ([06-nfr.md](../06-nfr.md)); the auth module gets an explicit redaction config in Pino.
