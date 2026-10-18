# 09 - Decisions and Open Questions

## Decisions (ADR log)

ADR-012 onward have a file each in [adr/](adr/). ADR-001..011 are recorded only in this table.

| ID | Decision | Date | Status |
|---|---|---|---|
| ADR-001 | Name: UrbanPetly, domain urbanpetly.com (also register .in) | 2026-10-18 | Accepted |
| ADR-002 | Monorepo with pnpm workspaces; three separate frontend apps (customer, provider, admin) plus API | 2026-10-18 | Accepted |
| ADR-003 | Client-side rendered React (Vite). No Next.js. Prerender key SEO pages at build time | 2026-10-18 | Accepted |
| ADR-004 | Node + TypeScript + Fastify, Zod schemas shared | 2026-10-18 | Accepted |
| ADR-005 | MySQL 8 with Knex (migrations, seeds, raw SQL for spatial queries) | 2026-10-18 | Accepted |
| ADR-006 | Self-hosted S3-compatible object storage on Dokploy; presigned uploads | 2026-10-18 | Accepted (product chosen in [ADR-013](adr/0013-object-storage-product-and-backups.md)) |
| ADR-007 | Phone OTP login through the founder's SMS API, behind an `OtpSender` interface | 2026-10-18 | Accepted (API details pending) |
| ADR-008 | Launch in Delhi NCR; at-home service mode included in v1 | 2026-10-18 | Accepted |
| ADR-009 | v1 has request-based bookings with no online payment | 2026-10-18 | Proposed |
| ADR-010 | Email-only notifications in v1 | 2026-10-18 | Accepted |
| ADR-011 | Maps: MapLibre/Leaflet with a free-tier tile and geocoding provider | 2026-10-18 | Accepted (provider chosen in [ADR-014](adr/0014-map-tiles-and-geocoding-provider.md); Leaflet dropped) |
| ADR-012 | [Prerender SEO pages with React Router v8 framework mode (`ssr: false` + `prerender`)](adr/0012-prerender-approach-for-seo-pages.md) | 2026-10-18 | Accepted |
| ADR-013 | [Object storage: SeaweedFS single node; rclone + mysqldump off-server encrypted backups](adr/0013-object-storage-product-and-backups.md) | 2026-10-18 | Accepted |
| ADR-014 | [Maps: MapLibre GL JS + Geoapify for tiles and geocoding; Ola Maps as upgrade path](adr/0014-map-tiles-and-geocoding-provider.md) | 2026-10-18 | Accepted |
| ADR-015 | [Sessions: host-only `__Host-` refresh cookie on `api.`, one session per audience](adr/0015-auth-sessions-across-subdomains.md) | 2026-10-18 | Accepted |

## Spikes assigned to the Tech Lead (Phase 0)
All four are complete; each produced an ADR.

| # | Spike | Outcome |
|---|---|---|
| 1 | Prerender approach and per-provider meta for non-prerendered pages | [ADR-012](adr/0012-prerender-approach-for-seo-pages.md) - React Router v8 framework mode; `vite-react-ssg` and Playwright snapshots rejected (Playwright kept as fallback) |
| 2 | Object store product (MinIO status check, Garage, SeaweedFS) and backups | [ADR-013](adr/0013-object-storage-product-and-backups.md) - SeaweedFS; MinIO archived 2026-04 and rejected |
| 3 | Map tiles and geocoding with commercial-use terms for India | [ADR-014](adr/0014-map-tiles-and-geocoding-provider.md) - Geoapify; MapTiler and Stadia free tiers forbid commercial use |
| 4 | Session design across `provider.`/`admin.` subdomains | [ADR-015](adr/0015-auth-sessions-across-subdomains.md) - host-only `__Host-` cookie on `api.`, per-audience sessions |

Each ADR lists what it still owes. ADR-012 in particular carries a **blocking Phase 1 validation**
that must pass before SEO content work depends on prerendering.

## Open questions (owner: founder unless stated)
1. OTP API: documentation, DLT template registration, rate limits, costs.
2. Email provider and sender domain (e.g. `no-reply@urbanpetly.com`) and SPF/DKIM setup.
3. Legal pages: who writes privacy policy and terms; grievance officer details.
4. Initial supply: sources of the first providers and permission to list them.
5. Branding: logo, colours, tone; does the designer propose or does the founder have preferences?
6. Request confirmation by phone call/WhatsApp only, or should WhatsApp notifications be added soon after launch?
7. Is a minimum verification (phone OTP) enough to publish a provider, or must documents be approved first? (Spec assumes: publish after admin review; "Verified" badge needs documents.)
8. Review rules: allow reviews only after a completed request (spec) or also from walk-in customers with proof?
9. Monetisation timeline (affects whether to model plans and commissions now).
10. Hosting capacity: VPS size, location (India region), and who manages server updates.
11. Backup destination for the daily off-server copy (Backblaze B2, a second VPS, a Hetzner Storage Box) and who holds its credentials. Blocks the backup job in [ADR-013](adr/0013-object-storage-product-and-backups.md); until it is answered we have no backups, only a backup design.
12. Does any India data-residency requirement, Survey of India licence or National Geospatial Policy obligation apply to our use of a foreign map and geocoding service? If yes, [ADR-014](adr/0014-map-tiles-and-geocoding-provider.md) switches to Ola Maps. Legal question, not technical.
13. Confirm `urbanpetly.in` will only 301-redirect to `urbanpetly.com` and never serve an app. [ADR-015](adr/0015-auth-sessions-across-subdomains.md) depends on every browser origin sharing one registrable domain; serving `.in` would require a different, weaker session design.
14. Self-hosted object storage (ADR-006) versus a managed bucket: managed storage would remove most of [ADR-013](adr/0013-object-storage-product-and-backups.md) and half the backup work for a few dollars a month, at the cost of data-residency control and an extra DPDP processor to disclose. Raising it once, now, while it is still cheap to change.
15. (Owner: Tech Lead) The corporate npm proxy used by the dev environment serves packages but 404s on `@pnpm/exe`, so `corepack` cannot install pnpm. Workaround: install the `pnpm` JS package (`npm i -g pnpm`), which the proxy does serve. Confirm CI uses a registry without this gap.
