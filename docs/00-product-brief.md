# 00 - Product Brief

## 1. Vision
One place where a pet parent in Delhi NCR can find, trust and contact every pet service they need:
vets, groomers, boarders, trainers, walkers, pet stores and more.

## 2. Problem
- Pet services are scattered across Google Maps, Instagram, WhatsApp groups and word of mouth.
- Parents cannot easily compare price, location, ratings and whether a provider comes home.
- Small providers have no affordable way to be discovered and have no lead channel.

## 3. Users
| Persona | Description | Main goals |
|---|---|---|
| Pet parent (customer) | Owns 1+ pets, lives in Delhi, Gurgaon, Noida, Faridabad or Ghaziabad | Find a nearby, trusted provider fast; compare; contact or request a booking |
| Provider | Clinic, groomer, boarder, trainer, walker, store, taxi | Be listed, look credible, receive and manage leads |
| Admin | UrbanPetly staff | Verify providers, moderate reviews, keep data clean |

## 4. Scope

"v1" means everything marked **P0 or P1** in 01-epics-and-user-stories.md (ADR-012).
The parking lot is **P2 plus the out-of-scope list below**. Nothing moves between the two without an ADR.

### In scope for v1
- Service categories: Veterinary, Grooming, Boarding and Daycare, Training, Walking and Sitting, Pet Stores, Pet Transport.
- Discovery: search by category, locality and radius, filters, sort, list and map views.
- Provider profile pages: services, prices, photos, hours, location, reviews, and direct contact (click-to-call and WhatsApp).
- Service mode on every service: `at_provider`, `at_home`, or `both`. At-home services declare a service area (pincodes and/or radius).
- Enquiry and booking requests (provider confirms; no online payment in v1).
- Phone OTP login for customers and providers (OTP API supplied later; abstracted behind an interface).
- Verified reviews and ratings: one per customer per provider, only after a completed request, moderated (ADR-015).
- Pet profiles and favourites for customers.
- Provider onboarding, "claim this listing" flow, and provider dashboard.
- Admin back office: verification, moderation, categories, reports, CSV import.
- SEO landing pages (city x category, locality x category) via build-time prerendering.
- Email notifications.

### Out of scope for v1 (parking lot)
- Online payments, payouts, commissions and invoicing.
- Native mobile apps (the web apps must be mobile-first and installable as a PWA later).
- Chat between customer and provider.
- Provider subscription plans and ads.
- Adoption and rescue marketplace.
- Cities outside Delhi NCR; Hindi UI (design for i18n now, ship English first).
- Scraping third-party sites (see data sourcing).
- SMS and WhatsApp notifications - the provider is emailed and confirms with the customer themselves (ADR-016).
- Reviews from walk-in customers, with or without proof of visit (ADR-015).
- Monetisation modelling of any kind: no plans, commissions, invoicing or billing data (ADR-021).
- Rescheduling a request by the customer, cancellation fees and no-show handling (cancel and re-request in v1).
- Changing the mobile number on an account, and transferring a listing between owners (admin does this by hand).
- Call masking or proxy phone numbers.

## 5. Geography
Launch: Delhi NCR (Delhi, Gurgaon/Gurugram, Noida, Faridabad, Ghaziabad).
Locations are modelled as city -> locality -> pincode, with latitude/longitude on each provider.

## 6. Data sourcing (important)
Do not scrape Google, Justdial, Instagram or competitor sites; this violates their terms.
Supply comes from: (a) provider self-signup, (b) admin-entered or CSV-imported listings from sources we are allowed to use (own research, partnerships), (c) "claim this listing" so providers can take over a draft listing.
Unclaimed listings are labelled "Unclaimed" and show only public business info.

## 7. Success metrics (first 6 months after launch)
- Listed providers: 500+ across NCR, 60% with 3+ photos.
- Monthly active customers and enquiries sent per month (primary north-star: enquiries sent).
- Provider response rate within 24h: 70%+.
- Share of traffic from organic search: 40%+.
- Median search-to-enquiry conversion tracked per category.

## 8. Principles
1. Trust first: verification badges, real reviews, clear pricing.
2. Fast on mid-range phones over 4G.
3. Simple for non-technical providers.
4. Privacy by default (see NFR).
5. Boring technology, strong conventions, easy for agents to extend.

## 9. Assumptions and risks
| Risk | Mitigation |
|---|---|
| Cold start: no providers, no customers | Seed supply by hand; claim flow; focus on 2 categories first (Grooming, Vet) in Gurgaon |
| Fake or abusive reviews | OTP-verified accounts, one review per provider, moderation queue, report button |
| Spam enquiries to providers | Rate limits per phone, OTP required to send an enquiry |
| SEO is weaker with client-side rendering | Prerender top pages, sitemap, structured data |
| SMS OTP cost and abuse | Rate limiting, per-phone and per-IP caps, CAPTCHA fallback |
