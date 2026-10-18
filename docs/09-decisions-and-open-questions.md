# 09 - Decisions and Open Questions

## Decisions (ADR log)
| ID | Decision | Date | Status |
|---|---|---|---|
| ADR-001 | Name: UrbanPetly, domain urbanpetly.com (also register .in) | 2026-10-18 | Accepted |
| ADR-002 | Monorepo with pnpm workspaces; three separate frontend apps (customer, provider, admin) plus API | 2026-10-18 | Accepted |
| ADR-003 | Client-side rendered React (Vite). No Next.js. Prerender key SEO pages at build time | 2026-10-18 | Accepted |
| ADR-004 | Node + TypeScript + Fastify, Zod schemas shared | 2026-10-18 | Accepted |
| ADR-005 | MySQL 8 with Knex (migrations, seeds, raw SQL for spatial queries) | 2026-10-18 | Accepted |
| ADR-006 | Self-hosted S3-compatible object storage on Dokploy; presigned uploads | 2026-10-18 | Accepted (product choice to be confirmed in a Tech Lead spike) |
| ADR-007 | Phone OTP login through the founder's SMS API, behind an `OtpSender` interface | 2026-10-18 | Accepted (API details pending) |
| ADR-008 | Launch in Delhi NCR; at-home service mode included in v1 | 2026-10-18 | Accepted |
| ADR-009 | v1 has request-based bookings with no online payment | 2026-10-18 | Proposed |
| ADR-010 | Email-only notifications in v1 | 2026-10-18 | Accepted |
| ADR-011 | Maps: MapLibre/Leaflet with a free-tier tile and geocoding provider | 2026-10-18 | Proposed (provider to choose in spike) |

## Spikes assigned to the Tech Lead (Phase 0)
1. Prerender approach: `vite-react-ssg` vs a Playwright snapshot script; how to serve per-provider meta for non-prerendered pages.
2. Object store product (MinIO status check, Garage, SeaweedFS) and backup approach.
3. Map tiles and geocoding provider with acceptable free tier and terms for commercial use in India.
4. Session design details (cookie domains across `provider.`/`admin.` subdomains).

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
