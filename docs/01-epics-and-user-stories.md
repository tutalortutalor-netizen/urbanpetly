# 01 - Epics and User Stories

Story ID format: `E<epic>-S<n>`. Priority: P0 (launch blocker), P1 (launch), P2 (post-launch).
Acceptance criteria use Given/When/Then. Every story also needs tests per 07-test-plan.

## E1 - Authentication (phone OTP)
| ID | Story | Pri |
|---|---|---|
| E1-S1 | As a user I can sign in with my mobile number and an OTP | P0 |
| E1-S2 | As a user I stay signed in across visits and can sign out | P0 |
| E1-S3 | As a user I can sign out of all devices | P1 |
| E1-S4 | As the system I limit OTP requests and verification attempts | P0 |

E1-S1 acceptance:
- Given a valid 10-digit Indian mobile number, when I request an OTP, then an OTP is sent and I see a resend timer (30s).
- Given a correct OTP within 5 minutes, when I submit it, then I am signed in; a new user record is created on first login.
- Given a wrong OTP 5 times, then the number is locked for 15 minutes.
- The OTP provider is behind an interface (`OtpSender`) with a console/fake implementation for dev and tests.

E1-S4 acceptance: max 3 OTP requests per phone per 15 min, 10 per IP per hour; responses never reveal whether a number is registered.

## E2 - Discovery and search
| ID | Story | Pri |
|---|---|---|
| E2-S1 | Browse providers by category and city | P0 |
| E2-S2 | Search by text (name, service, locality) | P0 |
| E2-S3 | Use "near me" (browser location) or pick a locality; results sorted by distance | P0 |
| E2-S4 | Filter by service mode (at provider / at home), rating, price range, open now, verified | P0 |
| E2-S5 | Sort by relevance, distance, rating, price | P1 |
| E2-S6 | Toggle list and map views; map pins open a mini card | P1 |
| E2-S7 | Pagination or infinite scroll with stable URLs (filters live in the URL query string) | P0 |

Acceptance (E2-S3): Given I allow location, when I search "grooming", then results within the default radius (10 km) are ordered by distance and each card shows distance in km. If location is denied, I am asked to pick a locality.
At-home matching: a provider with `at_home` mode matches a customer location when the customer's pincode is in the provider's service area or the customer is within the provider's service radius.

## E3 - Provider profile page
| ID | Story | Pri |
|---|---|---|
| E3-S1 | View a provider's profile: about, services and prices, photos, hours, address with map, contact, rating | P0 |
| E3-S2 | See whether a service is at provider, at home or both, and the home-visit area | P0 |
| E3-S3 | Call or WhatsApp the provider directly (click-to-call link, tracked) | P1 |
| E3-S4 | See verification badge and "Unclaimed" label when applicable | P0 |
| E3-S5 | Share the profile (copy link, WhatsApp) | P2 |

## E4 - Enquiries and booking requests
| ID | Story | Pri |
|---|---|---|
| E4-S1 | As a signed-in customer I can send an enquiry/booking request: service, pet, preferred date/time window, mode (provider/home), address if home, note | P0 |
| E4-S2 | As a provider I get an email and see the request in my dashboard | P0 |
| E4-S3 | As a provider I can accept, decline (with reason) or propose another time | P0 |
| E4-S4 | As a customer I can see request status and cancel a pending request | P0 |
| E4-S5 | Customer is emailed on provider's response | P1 |
| E4-S6 | Request auto-expires after 72h with no response and the customer is told | P1 |

State machine: `pending -> accepted | declined | expired | cancelled`; `accepted -> completed | cancelled`.
Only `completed` requests enable a review (see E5).
Customer's phone number is shared with the provider only after the provider accepts (privacy).

## E5 - Reviews and ratings
| ID | Story | Pri |
|---|---|---|
| E5-S1 | After a completed request I can rate (1-5) and review with optional photos | P0 |
| E5-S2 | Reviews show on the profile and update the average rating | P0 |
| E5-S3 | Provider can publicly reply once to a review | P1 |
| E5-S4 | Anyone signed in can report a review; admin moderates | P0 |
| E5-S5 | One review per customer per provider; editable for 7 days | P1 |

## E6 - Customer account and pets
| ID | Story | Pri |
|---|---|---|
| E6-S1 | Create and edit my profile (name, email, saved addresses) | P0 |
| E6-S2 | Add pet profiles (name, species, breed, age, weight, notes, photo) | P0 |
| E6-S3 | Save favourite providers | P1 |
| E6-S4 | View my request history | P0 |
| E6-S5 | Delete my account and data (DPDP right to erasure) | P0 |

## E7 - Provider onboarding and dashboard
| ID | Story | Pri |
|---|---|---|
| E7-S1 | Sign up as a provider (OTP), create a business profile, choose categories | P0 |
| E7-S2 | Claim an existing unclaimed listing; verified via OTP to the listed phone, else manual admin review | P0 |
| E7-S3 | Manage services, prices, durations, service mode and service area | P0 |
| E7-S4 | Manage photos (upload, reorder, delete; limits in NFR) | P0 |
| E7-S5 | Set opening hours, holidays and temporary closures | P0 |
| E7-S6 | Manage enquiries inbox (E4) | P0 |
| E7-S7 | Submit documents for verification (GST/shop licence/vet registration) | P1 |
| E7-S8 | Basic stats: profile views, calls, enquiries (30 days) | P2 |
| E7-S9 | Multiple staff users per business | P2 |

## E8 - Admin back office
| ID | Story | Pri |
|---|---|---|
| E8-S1 | Admin signs in (phone OTP + allowlist, role `admin`) | P0 |
| E8-S2 | Review and approve/reject new or edited provider profiles and verification documents | P0 |
| E8-S3 | Moderate reviews and reports (hide, restore, warn) | P0 |
| E8-S4 | Manage categories, services templates, cities, localities | P1 |
| E8-S5 | Create/edit listings on behalf of providers; mark as unclaimed | P0 |
| E8-S6 | Bulk import listings from CSV with a dry-run preview and error report | P1 |
| E8-S7 | View and search users; suspend a user or provider | P1 |
| E8-S8 | Audit log of admin actions | P1 |

## E9 - SEO and content pages
| ID | Story | Pri |
|---|---|---|
| E9-S1 | Prerendered landing pages: `/{city}/{category}` and `/{city}/{locality}/{category}` with unique title, meta, H1, intro text and provider list | P0 |
| E9-S2 | Provider pages have correct title/meta/OpenGraph and JSON-LD (`LocalBusiness`) | P0 |
| E9-S3 | `sitemap.xml` and `robots.txt` generated at build/deploy and refreshed on a schedule | P0 |
| E9-S4 | Canonical URLs, clean slugs, 301 redirects for renamed slugs | P0 |
| E9-S5 | Static content pages: about, contact, privacy, terms, FAQ, blog shell | P1 |

## E10 - Notifications
| ID | Story | Pri |
|---|---|---|
| E10-S1 | Transactional emails with templates: request received, accepted/declined, review received, verification result | P0 |
| E10-S2 | Per-user email preferences and unsubscribe for non-essential mail | P1 |
| E10-S3 | Email provider abstracted behind `Mailer` interface (SMTP/SES/Resend compatible) | P0 |

## E11 - Media
| ID | Story | Pri |
|---|---|---|
| E11-S1 | Upload images via presigned URL to S3-compatible store; server validates type/size and generates WebP variants (thumb, card, full) | P0 |
| E11-S2 | Images served via CDN-friendly URLs with cache headers | P0 |
| E11-S3 | Orphaned uploads cleaned by a scheduled job | P1 |

## E12 - Platform
| ID | Story | Pri |
|---|---|---|
| E12-S1 | Monorepo scaffolding, lint, format, typecheck, test scripts | P0 |
| E12-S2 | CI: install, lint, typecheck, unit + integration tests, build on every PR | P0 |
| E12-S3 | Dokploy deployment for api, web, provider, admin, MySQL, object store; staging and production | P0 |
| E12-S4 | Structured logging, health/readiness endpoints, error tracking | P0 |
| E12-S5 | Automated daily DB backups and object-store backups to off-server storage; restore tested | P0 |
| E12-S6 | Privacy-friendly analytics (page views, search, enquiry events) with consent | P1 |
| E12-S7 | Database seed data for dev and tests | P0 |
