# 06 - Non-Functional Requirements

## Security (OWASP Top 10 aligned)
- All input validated with Zod at the API boundary; parameterised queries only (Knex bindings; never string-concatenate SQL).
- Access control checked on every route; ownership checks for provider and customer resources; admin routes require `admin` role and allowlist.
- OTP: 6 digits, 5-minute expiry, stored hashed, attempt and request rate limits, no user enumeration.
- Tokens: short-lived access JWT; refresh tokens hashed in DB, rotated, revocable; cookies httpOnly + Secure + SameSite.
- Security headers via helmet; strict CORS allowlist; CSRF protection for cookie-based refresh endpoint.
- File uploads: type and size allowlist (images: jpeg, png, webp, max 8 MB; documents: pdf/jpeg/png max 10 MB), re-encode images server-side, strip EXIF location data, antivirus scan for documents if feasible.
- Verification documents in a private bucket; signed URLs expire within 5 minutes.
- Secrets only from environment; rotate on leak; dependency audit in CI (`pnpm audit`), Dependabot or Renovate enabled.
- Logs never contain OTPs, tokens, full phone numbers or document content.
- Admin app is not indexed and restricted at the proxy where possible.

## Privacy and compliance (India - DPDP Act 2023)
- Collect only what is needed. Phone number is the identifier; email optional.
- Explicit, versioned consent at sign-up (privacy policy and terms); record `consent_version` and timestamp.
- Customer phone shared with a provider only after the provider accepts a request.
- Right to access, correction and erasure: self-service account deletion anonymises user data and keeps non-personal aggregates; reviews are anonymised ("Former user") or removed on request.
- Data retention: OTP challenges 24h; inactive-account policy defined in privacy policy; audit logs 1 year.
- Data stored in India where feasible; document the processing locations and processors (SMS, email, hosting).
- Grievance officer contact and privacy policy page (content owned by the founder / legal).
- Analytics: no third-party trackers before consent; no raw IP storage.
- Children's data: service is for adults; pets only.

## Performance
- Customer web (mobile, 4G throttled): LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1 on landing and profile pages.
- Initial JS per route <= 200 KB gzip (customer app); route-level code splitting; images in WebP/AVIF with lazy loading.
- API p95 latency <= 300 ms for search and profile endpoints at 50 rps on the target VPS; search must use indexes (EXPLAIN reviewed for geo queries).
- Cache: CDN/browser caching for static assets (immutable hashes) and media; short-lived HTTP caching (`s-maxage`) for public catalogue responses.

## Reliability and operations
- Target availability 99.5% (single VPS; improve later).
- Graceful shutdown, health and readiness probes, automatic restarts via Dokploy.
- Daily DB and object-store backups, off-server, restore tested quarterly. RPO 24h, RTO 4h.
- Zero-downtime deploys for API and static apps where Dokploy allows; migrations are backward-compatible (expand/contract).
- Error tracking and uptime alerts to the team email/chat.

## Accessibility
WCAG 2.1 AA across all three apps; automated axe checks in CI plus manual keyboard and screen-reader pass before launch.

## Browser and device support
Last 2 versions of Chrome, Safari (iOS 15+), Firefox, Edge; Android Chrome on low-end devices. No IE.

## Internationalisation
All user-facing strings go through an i18n layer (English only at launch). Dates, currency (INR) and phone formats localised for India.

## Maintainability
- TypeScript strict mode; ESLint and Prettier enforced in CI.
- Conventional commits; PR template with story ID and checklist.
- No file over ~400 lines and no function over ~60 lines without justification.
- Public module APIs documented with short doc comments; ADRs for significant decisions (09).

## SEO quality bars
Unique title and meta description per prerendered page; one H1; valid JSON-LD (tested with a validator); sitemap submitted to Search Console; no soft-404s; hreflang not needed at launch.
