---
name: owner-security-review
description: Review password authentication, Owner Edit, API authorization, sessions, secrets and deployment trust boundaries before related changes or repository publication. Use for authentication/password changes, owner-only mutations, Cloudflare configuration changes and release security review; does not authorize production changes.
---

# Owner Security Review

## Scope and safety

Review first. Do not automatically fix findings, rotate credentials, change authentication configuration, deploy, alter production data or try discovered credentials. Preserve the user's requested scope. Stop and record Critical/High findings immediately as release blockers in a **private** report; never print passwords, hashes, salts, tokens, cookie values or credential-bearing filenames. Record file/line or redacted stable location, category and exposure path instead.

Examples may use only synthetic placeholders such as `SYNTHETIC_PASSWORD_HASH_PLACEHOLDER`, `SYNTHETIC_SESSION_SECRET_PLACEHOLDER` and `https://atlas.example`; placeholders are deliberately invalid and are not working default credentials. Only isolated tests may generate test-only material, without printing it or changing actual bindings.

## Discover the trust boundaries

**Current candidate: Owner Auth is NOT implemented.** No Owner provider/session endpoint, mutation API, upload page or storage integration exists. For this release review, verify their absence and the read-only boundary using existing files:

- `app/travel/travel-data-source.ts`, `data/sample-travel.json`, `app/travel/travel-storage.ts`.
- `scripts/read-only.ts`, `scripts/serve.ts`, `vite.config.ts`; `tests/runtime-boundaries.test.ts`, `tests/data.test.ts`, `scripts/scan.mjs`.

For a separately authorized future Full Personal implementation, discover its actual auth/password/session, permission, persistence and configuration files. Those files are **planned, not present**; the following authentication checklist applies only when such a feature is requested. Do not invent or import private files to satisfy it.

Separate six layers in the report; a PASS in one never substitutes for another:

| Layer | Review question |
| --- | --- |
| Frontend access control | Is Edit visibility/preference mistaken for permission? Does disabling a prompt leave guards unchanged? |
| Backend authentication | Is identity verified server-side with safe password verification, without default credentials or fail-open fallbacks? |
| Backend authorization | Does **every** create/update/delete/upload/cleanup handler check the authenticated Owner before storage effects? |
| Session management | Are signature, subject, expiry, revocation and cookie handling enforced independently of UI state? |
| Secret storage | Are verifier/signing/storage credentials confined to server bindings, absent from client bundles/logs/Git/examples? |
| Deployment configuration | Are Demo/local/full modes explicit; are resources user-owned; does missing/malformed config deny writes? |

## Practical checklist

### Password and login

- Trace generator -> encoded hash -> parser -> runtime crypto -> constant-time comparison. Check salt/output lengths, UTF-8 size bounds, encoded cost limits, unsupported-runtime errors and failure states.
- Never replace a failed password derivation with success, plaintext comparison, a temporary bypass or silently lower cost. A local compatibility test does not prove production runtime limits. Consult current primary security/runtime guidance when changing cost/algorithm and report unverified sources.
- Verify body bounds **before unbounded buffering**, content type, attempt throttling/backoff, generic failures, and abuse/CPU budget. Origin checks do not stop non-browser guessing.
- Discover actual init/reset scripts. Distinguish initial secret generation from updating only a password hash; stdout output is sensitive. Do not run operational generators without explicit intent.

### Owner authorization and uploads

- Enumerate exported handlers by method, including upload/delete and cleanup. Record guard order, reachable bypasses, storage calls and expected anonymous/cross-origin/unavailable outcomes.
- Check Origin/host policy and CSRF controls; request headers are not authentication. UI flags, sessionStorage/localStorage and mock platform identity are never Owner proof.
- Validate identifiers, namespace/path traversal, upload byte limits/type/signature/full-decode requirements, dimension claims and per-entry ownership rules appropriate to the single-owner model.
- State whether saved metadata/photos are publicly readable. A private bucket plus a public proxy is public photo access. Immutable caches can retain data after origin deletion.
- Review partial D1/R2 failure, best-effort cleanup and orphan handling without changing production objects.

### Sessions

- Verify signed token structure, bounded parsing, subject/version, issue/expiry/maximum lifetime, random session ID and backing session lookup/revocation.
- Verify HttpOnly, SameSite, Secure in production, Path, lifetime and no-store; check actual proxy/HTTPS behavior rather than only source defaults.
- Separate ordinary password change from incident recovery: does changing a hash invalidate already-issued sessions? Record session-reset/rotation consequences and require explicit owner approval for any operational action.

### Secrets and configuration

- Inspect server bindings vs client-defined environment allowlist, source maps/bundles, example files, build outputs, debug logs, error objects and download filenames. Do not copy sensitive matches into tool output or reports.
- Distinguish resource IDs/domains from authentication secrets; identifiers can still be private operational coupling or unsafe deploy defaults.
- Verify missing DB/bucket/hash/signing key, malformed keys, crypto errors and unavailable storage **deny mutations**. Demo must remain read-only at the backend even if synthetic valid credentials are configured locally.
- Review separate platform mock-auth paths; never grant Owner privileges based on development cookies or injected user headers.
- Scan tracked files plus locally reachable history and explicitly scope omitted refs/generated/ignored/binary material. Use an available secret scanner with redacted output; if absent, label a heuristic scan as incomplete, not clean-history proof. Do not install a scanner or scan external systems without needed approval.

## Verification and acceptance

Run only commands that exist in the current checkout. In the current read-only project, `npm test` runs synthetic-data/theme and HTTP denial tests; no auth/session implementation is present. Future auth/session tests are not implemented. Inspect tests before executing them for remote access or mutation. Any missing supporting test/script is **planned work**, not a claimed command.

In an isolated local harness, verify the following matrix and record expected vs actual results. If no harness exists, record `NOT TESTED` and propose separately scoped tests:

1. Correct/wrong/short/malformed password; missing secrets; crypto import/derive/compare failure; runtime cost boundary.
2. Anonymous, invalid, forged, expired and revoked sessions; valid Owner; missing DB/table/signing secret; cross-origin/missing Origin and spoofed platform headers.
3. Every write route: denial before D1/R2 effects; expected 401/403/503 or equivalent denial; valid-session mutation only in Full Personal.
4. Demo direct mutation attempts with otherwise valid test credentials: no mutation. Upload/delete: invalid key/type/size/signature, spoofed dimensions, chunked oversized bodies and cleanup failure.
5. Cookie attributes on local HTTP and production-like HTTPS; logout replay, password-change recovery, cache behavior and secret-shaped exception/log capture.
6. Throttling/recovery and emitted client/build/history scan using synthetic input only.

Required output: private severity-ranked findings with location, redacted evidence, impact, remediation and release-blocker decision; six-layer assessment; endpoint guard matrix; exact checks performed/results; explicit gaps and next approved task. Acceptance requires no unresolved Critical/High risk, denial on missing configuration, no sensitive values exposed, all mutation paths enforced, and honest test coverage. Production verification is a separate approved action, never inferred from local PASS.
