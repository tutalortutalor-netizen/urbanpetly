# 03 - Data Model (MySQL 8, managed with Knex)

Conventions
- Table names: plural snake_case. Primary keys: `id BIGINT UNSIGNED AUTO_INCREMENT`; public identifiers use `public_id CHAR(26)` (ULID) where exposed in URLs/APIs.
- Timestamps: `created_at`, `updated_at` (UTC, `DATETIME(3)`); soft delete via `deleted_at` where noted.
- charset `utf8mb4`, collation `utf8mb4_0900_ai_ci`. Enums as `VARCHAR` + check in app (easier migrations) unless noted.
- Phone numbers stored in E.164 (`+91XXXXXXXXXX`).
- Every migration is reversible and reviewed by the Tech Lead. Row types are mirrored in `packages/shared`.

## Geography
- `cities` (id, slug UNIQUE, name, state, is_active)
- `localities` (id, city_id FK, slug, name, pincode, lat, lng) UNIQUE(city_id, slug)

## Users and auth
- `users` (id, public_id, phone UNIQUE, phone_verified_at, name, email NULL, role ENUM('customer','provider','admin'), status ('active','suspended','deleted'), last_login_at, consent_version, consent_at, deleted_at)
- `otp_challenges` (id, phone, code_hash, expires_at, attempts, consumed_at, ip, created_at) - store only a hash; purge after 24h.
- `refresh_tokens` (id, user_id FK, token_hash, expires_at, revoked_at, user_agent, ip, replaced_by)
- `addresses` (id, user_id FK, label, line1, line2, locality_id FK NULL, city_id FK, pincode, lat, lng, is_default)

## Customers' pets
- `pets` (id, public_id, user_id FK, name, species ('dog','cat','other'), breed, birth_date NULL, weight_kg NULL, gender, notes, photo_media_id NULL)

## Providers
- `categories` (id, slug UNIQUE, name, icon, sort_order, is_active)
- `providers` (id, public_id, slug UNIQUE, owner_user_id FK NULL (NULL = unclaimed), business_name, description, phone, whatsapp, email, website, address_line, locality_id FK, city_id FK, pincode, lat, lng, `location POINT SRID 4326 NOT NULL` + SPATIAL INDEX, status ('draft','pending_review','published','suspended'), claim_status ('unclaimed','claimed'), verification_status ('none','pending','verified','rejected'), rating_avg DECIMAL(3,2), rating_count INT, price_from INT NULL, cover_media_id NULL, created_by_user_id, published_at, deleted_at)
- `provider_categories` (provider_id, category_id) PK both
- `provider_services` (id, provider_id FK, category_id FK, name, description, price_min INT, price_max INT NULL, price_unit ('flat','per_hour','per_day','per_km','per_visit'), duration_min NULL, service_mode ('at_provider','at_home','both'), pet_types SET/JSON, is_active)
- `provider_service_areas` (id, provider_id FK, pincode NULL, locality_id NULL, radius_km DECIMAL NULL, extra_fee INT NULL) - used when any service has `at_home`/`both`
- `provider_hours` (id, provider_id FK, weekday TINYINT 0-6, opens_at TIME, closes_at TIME, is_closed) multiple rows per day allowed
- `provider_closures` (id, provider_id FK, start_date, end_date, reason)
- `provider_media` (id, provider_id FK, media_id FK, sort_order)
- `provider_claims` (id, provider_id FK, user_id FK, method ('phone_otp','document','admin'), status ('pending','approved','rejected'), reviewed_by, reviewed_at, note)
- `verification_documents` (id, provider_id FK, type ('gst','shop_licence','vet_registration','id_proof','other'), media_id FK (private bucket), status, reviewed_by, reviewed_at, note)
- `provider_staff` (provider_id, user_id, role) - P2

## Requests (enquiries / bookings)
- `service_requests` (id, public_id, customer_id FK, provider_id FK, service_id FK NULL, pet_id FK NULL, mode ('at_provider','at_home'), address_id FK NULL, preferred_date DATE, preferred_window ('morning','afternoon','evening','custom'), preferred_time TIME NULL, note, status ('pending','accepted','declined','expired','cancelled','completed'), decline_reason, proposed_datetime NULL, responded_at, expires_at, completed_at)
- `service_request_events` (id, request_id FK, actor_user_id, type, payload JSON, created_at) - audit trail

## Reviews
- `reviews` (id, public_id, provider_id FK, customer_id FK, request_id FK UNIQUE, rating TINYINT 1-5, title, body, status ('published','hidden','pending'), provider_reply, provider_reply_at, edited_until) UNIQUE(provider_id, customer_id)
- `review_media` (review_id, media_id)
- `review_reports` (id, review_id FK, reporter_user_id FK, reason, status, resolved_by, resolved_at)
- Rating aggregates on `providers` are recomputed in the same transaction as review changes.

## Engagement
- `favorites` (user_id, provider_id, created_at) PK both
- `provider_events` (id, provider_id, type ('view','call','whatsapp','share'), user_id NULL, session_hash, created_at) - append-only, aggregated daily; no raw IP stored.

## Media
- `media` (id, public_id, owner_user_id FK, kind ('provider_photo','pet_photo','review_photo','document'), bucket, object_key, mime, size_bytes, width, height, variants JSON, status ('pending','ready','failed'), created_at)
- Documents are stored in a private bucket and accessed only via short-lived signed URLs.

## Notifications and system
- `notifications` (id, user_id FK, channel ('email'), template, payload JSON, status ('queued','sent','failed'), attempts, sent_at, error)
- `email_preferences` (user_id PK, marketing BOOL, reminders BOOL)
- `audit_logs` (id, actor_user_id, action, entity_type, entity_id, before JSON, after JSON, ip, created_at)
- `slug_redirects` (id, entity_type, old_slug, new_slug, created_at) for 301s.
- `jobs_lock` / use DB advisory locks for scheduled jobs (single-instance safe).

## Index and query notes
- `providers`: SPATIAL(location); INDEX(city_id, status); INDEX(locality_id, status); FULLTEXT(business_name, description) (ngram parser for partial matches); INDEX(rating_avg).
- `service_requests`: INDEX(provider_id, status, created_at); INDEX(customer_id, created_at).
- `reviews`: INDEX(provider_id, status, created_at).
- Search results must be reproducible with a seeded fixture so the QA suite can assert ordering.
