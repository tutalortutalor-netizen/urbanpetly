# ADR-013: Object storage product and backup approach

- Status: Accepted
- Date: 2026-10-18
- Deciders: Tech Lead (spike), founder (approval)
- Refines: ADR-006 (self-hosted S3-compatible object storage on Dokploy, presigned uploads)
- Spike: SAM-4 item 2

## Context

ADR-006 chose "self-hosted S3-compatible storage on Dokploy" but left the product open, explicitly
flagging a MinIO status check. The workload is small and well defined:

- **Public bucket** (`media`): provider photos, served from `media.urbanpetly.com`. Public read.
- **Private bucket** (`docs`): verification documents. No public read ever; access only through
  signed URLs expiring within 5 minutes ([06-nfr.md](../06-nfr.md)).
- Browser uploads via presigned URLs (ADR-006); images max 8 MB, documents max 10 MB.
- Single VPS, one node, Dokploy-managed. Target availability 99.5%. RPO 24h, RTO 4h.
- Verification documents are personal data under the DPDP Act 2023.

Expected volume at launch is single-digit GB. Nothing here needs a distributed object store; it
needs a *boring* one that will still be maintained in three years.

### MinIO status check (the reason this spike existed)

MinIO is no longer a viable choice for a new deployment:

- May/June 2025: the admin console was stripped from the community edition — user management,
  bucket policies, access control and lifecycle UI removed.
- October 2025: official community binaries and Docker images discontinued.
- December 2025: the repository went into maintenance mode.
- 2026-04-25: `minio/minio` was archived and is read-only. No releases, no reviewed patches.

The licence did not change (still AGPLv3) — the problem is abandonment, not licensing. Deploying an
archived storage server that will never receive a security patch is not acceptable for a bucket
holding identity documents. **MinIO is rejected.**

## Options considered

| | Licence | Maturity | Presigned | Multipart | Anonymous public read | Fit |
|---|---|---|---|---|---|---|
| MinIO | AGPLv3 | **Archived 2026-04** | yes | yes | yes | Rejected |
| SeaweedFS | Apache-2.0 | Mature, large production users | yes | yes | yes | **Chosen** |
| Garage | AGPL-3.0 | Mature (v2.x, production since 2020) | yes | yes | **no** | Runner-up |
| RustFS | Apache-2.0 | 1.0 GA Sept 2026 | yes | yes | yes | Rejected |

### SeaweedFS (chosen)

Apache-2.0. The S3 gateway implements the object, bucket, IAM and STS APIs on one endpoint, so AWS
SDK v3, the AWS CLI and rclone work unchanged. `weed mini` is auto-tuned for a single node, which is
exactly our deployment shape. Kubeflow Pipelines adopted it as its default storage backend,
replacing MinIO; it is run at petabyte scale elsewhere. Anonymous read for the public bucket is a
one-liner: `s3.bucket.access -name media -user anonymous -access Read,List`.

- (-) Configuration surface is larger than Garage's; the filer/volume/master split shows through
  even in single-node mode.
- (-) **Sharp edge:** a stock `weed server -s3` with no identities configured accepts anonymous
  *writes*. Identity configuration is therefore part of the deployment, not a follow-up task.

### Garage (runner-up)

Genuinely good software — light, Rust, in production since 2020, presigned URLs, full multipart and
`PutBucketCors` all implemented. Two things decided against it:

- **No bucket policies or ACLs.** Garage implements its own per-access-key-per-bucket model instead.
  That is a defensible design, but our public `media` bucket wants plain anonymous read, so we would
  have to proxy every public image through the API or Traefik with a read-only key. That is extra
  moving parts and extra latency on the LCP image of every provider card.
- AGPL-3.0. We would run it unmodified as a separate network service, which is almost certainly fine,
  but Apache-2.0 removes the question rather than answering it.

Garage remains the first fallback if SeaweedFS disappoints in operation.

### RustFS (rejected)

Positions itself as the drop-in MinIO successor: Apache-2.0, same ports, 1.0 GA in September 2026.
The security record is the problem, not the licence or the API:

- Hardcoded static gRPC authentication token committed in source, allowing any attacker with network
  access to the gRPC port to perform privileged operations including data destruction. Introduced
  July, merged without human review, fixed six months later in a change reviewed by an LLM rather
  than a person.
- Missing authorisation check on `UploadPartCopy` allowing cross-tenant object exfiltration.
- Presigned POST policy conditions not validated, bypassing `content-length-range` and `Content-Type`
  limits — directly relevant to our presigned upload design.
- Credentials logged in plaintext at INFO level.
- Stored XSS in the console enabling admin account takeover.
- Distributed mode is still not production-ready.

Individually these are ordinary young-project bugs. Together they describe a review culture we are
not willing to put verification documents behind. Revisit in a year.

### Managed S3 (AWS S3 / Backblaze B2 / Cloudflare R2) — not re-opened here

ADR-006 already chose self-hosting. Worth noting the trade honestly: a managed bucket would delete
this entire ADR plus half the backup work for a few dollars a month, at the cost of data residency
control ([06-nfr.md](../06-nfr.md) prefers India where feasible) and an external processor to
disclose under DPDP. If the founder wants to revisit ADR-006 on those grounds, this is the moment —
otherwise self-hosting stands.

## Decision

**SeaweedFS, single node, deployed as the `objectstore` service on Dokploy**, accessed through its
S3 gateway with AWS SDK v3 from `apps/api` only.

### Buckets and access

| Bucket | Access | Notes |
|---|---|---|
| `urbanpetly-media` | anonymous `Read,List` | served at `media.urbanpetly.com` via Traefik |
| `urbanpetly-docs` | **no anonymous access** | presigned GET only, max 300 s expiry |

Required at deployment time, not later:

1. Configure S3 identities **before** the service is reachable, so the anonymous-write default is
   never live. The API gets one access key with read/write on both buckets; no other key exists.
2. The S3 endpoint is **not** published on a public hostname. Only `media.urbanpetly.com`
   (read path) and the internal Docker network (API path) reach it.
3. CORS on `urbanpetly-media` allows `PUT` from the app origins only, for presigned uploads.
4. Re-encode images and strip EXIF server-side before storing ([06-nfr.md](../06-nfr.md)); the
   object store is never the validation boundary. Trusting a presigned upload's `Content-Type` is
   the classic mistake here — the API re-checks the magic bytes after upload.

### Backups

Two independent jobs, both writing **off the VPS**. A copy on the same disk is not a backup.

| What | How | Schedule | Retention |
|---|---|---|---|
| MySQL | `mysqldump --single-transaction --routines` piped to gzip | daily | 14 days + monthly kept 6 months |
| Objects | `rclone sync` over the **S3 API** | daily | 14 days, versioned destination |

- Back up objects through the S3 API, never by copying SeaweedFS volume files from under a running
  server — that produces a torn, unrestorable copy.
- Backups are **encrypted at rest at the destination** (`rclone crypt` or `age`). `urbanpetly-docs`
  holds identity documents; an unencrypted off-site copy would be the weakest link in our DPDP story.
- Backup credentials are write-and-list only where the destination supports it, so a compromised VPS
  cannot wipe the backup history.
- A restore runbook lives in `infra/` and is executed as a **quarterly drill** against staging. A
  backup that has never been restored is a hypothesis, not a backup. The drill is what satisfies
  the RTO 4h claim in [06-nfr.md](../06-nfr.md).
- Backup job failures alert; a silent backup job is worse than no backup job.

Destination choice (Backblaze B2 vs a second VPS vs a Hetzner Storage Box) is an **operational
decision for the founder**, who owns hosting — see the open question added to
[09-decisions-and-open-questions.md](../09-decisions-and-open-questions.md).

## Consequences

- `S3_ENDPOINT`/`S3_*` env vars in [02-architecture.md](../02-architecture.md) §8 are unchanged;
  nothing in application code knows which S3 implementation is behind them. That is the point — the
  AWS SDK v3 boundary is what makes this ADR cheap to reverse.
- Local development uses the same SeaweedFS image in Docker Compose, so presigned-URL behaviour is
  identical locally and in production. Do not substitute a different S3 implementation locally.
- One node means object storage is a single point of failure. Accepted at 99.5% availability; the
  daily off-server copy bounds the loss to RPO 24h.
- Lifecycle rules are not relied upon. Anything needing deletion (expired documents, orphaned
  uploads) is deleted by an explicit job in `apps/api/src/jobs/`, where it is testable.
- An integration test suite runs against real SeaweedFS in CI, covering presigned PUT, presigned GET
  expiry, and that `urbanpetly-docs` refuses anonymous GET. That last test is the one that would
  catch a misconfiguration leaking identity documents, so it is not optional.

## References
- [MinIO removes management features from Community Edition](https://blocksandfiles.com/2025/06/19/minio-removes-management-features-from-basic-community-edition-object-storage-code/)
- [SeaweedFS](https://github.com/seaweedfs/seaweedfs) / [Amazon S3 API wiki](https://github.com/seaweedfs/seaweedfs/wiki/Amazon-S3-API)
- [Garage S3 compatibility](https://garagehq.deuxfleurs.fr/documentation/reference-manual/s3-compatibility/)
- [RustFS 1.0 GA](https://linuxiac.com/rustfs-1-0-s3-compatible-object-storage-reaches-ga/)
