# Glossary

The project's vocabulary. Use these words in code, tests, UI copy, commits and issues; if you find
yourself reaching for a synonym, either the synonym is wrong or this file is missing a term.

Terms are grounded in [docs/03-data-model.md](docs/03-data-model.md) and the ADRs in
[docs/adr/](docs/adr/). Add a term here in the same PR that introduces it.

## Domain

| Term | Meaning | Not to be confused with |
|---|---|---|
| **Provider** | A pet-services business listed on UrbanPetly (`providers`). The unit of search, the thing a customer contacts. | "Vendor", "partner", "seller", "shop" - do not use |
| **Customer** | A pet parent with an account (`users.role = 'customer'`). | "User", which means any account holder including providers and admins |
| **Owner** | The user who controls a provider listing (`providers.owner_user_id`). | A pet's owner - say **customer** for that |
| **Pet** | An animal belonging to a customer (`pets`). | The customer. Pets have no accounts |
| **Category** | A kind of service: grooming, boarding, vet, training, walking (`categories`). | **Service**, which is one provider's concrete offering |
| **Service** | A specific offering by one provider, with price and mode (`provider_services`). | **Category**, which is the taxonomy above it |
| **Service mode** | Where a service happens: `at_provider`, `at_home`, or `both`. | Delivery, shipping |
| **Service area** | Where a provider will travel for `at_home` services (`provider_service_areas`), by pincode, locality or radius. | The provider's own location |
| **Request** | A customer's enquiry to a provider (`service_requests`). The core v1 transaction. | "Booking" or "order" - v1 has no confirmed slots and no payment (ADR-009) |
| **Claim** | A business owner proving they control an existing unclaimed listing (`provider_claims`). | **Verification** |
| **Verification** | Admin approval of a provider's documents (`verification_documents`), which grants the "Verified" badge. | **Claim**; also distinct from `providers.status = 'published'` |
| **Unclaimed listing** | A published provider with no `owner_user_id`, seeded by us. | A draft or unpublished listing |
| **Locality** | A named sub-city area - sector, block, colony (`localities`). The granularity customers search at. | **City**; also not a pincode, though a locality has one |
| **City** | A Delhi NCR city (`cities`). Launch scope is NCR only (ADR-008). | Locality, state |

## Technical

| Term | Meaning |
|---|---|
| **Audience** | Which app a session belongs to: `customer`, `provider` or `admin`. Each has its own cookie and its own session; a token's audience is checked separately from the user's role ([ADR-025](docs/adr/0025-auth-sessions-across-subdomains.md)) |
| **Session family** | A chain of rotated refresh tokens descending from one login. Presenting an already-used token revokes the whole family |
| **Access token** | Short-lived JWT, held **in memory only**, sent as `Authorization: Bearer` |
| **Refresh token** | Opaque random value in a host-only `__Host-` cookie on `api.urbanpetly.com`, stored hashed, rotated on every use |
| **Prerender manifest** | The build-time list of paths to render to HTML, fetched from the API. The endpoint that produces it is also where the thin-page threshold is enforced ([ADR-022](docs/adr/0022-prerender-approach-for-seo-pages.md)) |
| **Thin page** | A locality x category page with fewer than 3 published providers. Not prerendered, not in the sitemap, `noindex,follow`, canonical to the city x category page (ADR-020) |
| **SPA fallback** | The single HTML file served for paths that were not prerendered, hydrated by the client router |
| **Meta handler** | The API route that injects per-provider title, meta and JSON-LD into the SPA fallback for non-prerendered profiles |
| **Presigned URL** | A time-limited S3 URL letting a browser upload or download one object directly. Uploads are never trusted on their declared `Content-Type` ([ADR-023](docs/adr/0023-object-storage-product-and-backups.md)) |
| **Media bucket** | `urbanpetly-media` - public read, provider photos, served from `media.urbanpetly.com` |
| **Docs bucket** | `urbanpetly-docs` - private, verification documents, presigned GET only, 5-minute expiry |
| **Public ID** | The ULID in `public_id`, used in URLs and API responses. Internal `id` values are never exposed |
| **Story ID** | The backlog identifier, e.g. `E2-S3`, used in branch names and PR titles ([docs/10-git-workflow.md](docs/10-git-workflow.md)) |

## Words we do not use

- **Booking** for a v1 request. There is no confirmed slot and no payment; calling it a booking
  promises the customer something the product does not do.
- **Vendor** / **partner** / **merchant** for a provider.
- **Listing** on its own when **provider** is meant. "Unclaimed listing" is the one accepted use.
- **Verified** for a provider who has merely claimed their listing. Verification means approved
  documents, and the badge is a promise to customers.
