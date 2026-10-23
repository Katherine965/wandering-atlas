---
name: open-source-release-review
description: Audit a private project's readiness for standalone open-source release, including dependency extraction, private data, asset provenance, secrets, configuration templates and independent Git history. Use for pre-publication reviews and extraction planning, not automatic repository creation or deployment.
---

# Open Source Release Review

## Boundary

This is an evidence review and extraction plan, not permission to extract, publish, fork private history, push, merge, deploy, delete assets or change credentials. Preserve completed themes/features. Keep private findings inside the current private workspace; produce a separately sanitized public summary only when requested.

## Workflow

1. **Inspect actual files and state.** Inventory tracked/untracked/generated material, routes, dynamic/fetched assets, dependencies, data, build/configuration, existing instructions and licenses. Record snapshot and scope. Source/runtime evidence overrides old diagrams or manifests.
2. **Map dependencies.** Trace internal/external imports and runtime fetch/CSS/asset references. Classify direct technical copy candidates, adaptation, shared modules, exclusions and configuration templates. A technical copy candidate is not a license/privacy approval. Check both main route and mobile/upload/auth routes; do not assume a directory is independent.
3. **Separate modes.** Plan credential-free public-sample read-only Demo and optional authenticated personal storage. Trace secret-bound modules in imports/build plugins. Require backend mutation disablement for Demo. Browser localStorage is not project-file persistence; local-edit proposals need explicit filesystem authorization and a trust-boundary design.
4. **Review private data.** Examine seeds/photos/captions/coordinates, identities, unrelated modules, filenames, metadata, screenshots, backups/logs/builds, domains/absolute paths and resource identifiers. Distinguish actual secrets from identifiers. Never reproduce credentials; record categories/redacted locations and request owner-led remediation.
5. **Review rights.** Build a per-file manifest: runtime role/theme, creator/source/date, license/redistribution evidence, required attribution, public eligibility and follow-up. Unknown rights remain unverified/held. Free downloads, AI-looking art and an asset visual `READY` status are not evidence of redistribution rights. Include fonts/maps/vendor/code license evidence and third-party IP references; preserve completed themes until an explicit rights/remediation decision.
6. **Security gate.** If available, use a scoped authentication/secrets review Skill; otherwise perform an equivalent review of frontend/backend authorization, sessions, configuration and history. Record all mutation endpoints and fail-closed behavior. No Skill dependency is required for this review to work.
7. **Fresh history plan.** Recommend a sanitized allowlist snapshot and independent Git history, not a fork/import of private history. Scan the intended source, generated output and new history using redacted tooling. Existing ignore rules or rewriting a current file do not remove historical exposure.
8. **Public configuration/docs.** Replace private resource names/project identity and real environment values with invalid synthetic placeholders. Document installation/default Demo and optional personal deployment using only scripts that actually exist. Any future adapter/template/script is clearly labeled planned; do not claim it works.
9. **Consolidate knowledge.** Preserve useful existing Skills; merge overlapping capability categories rather than generating many generic files. Validate frontmatter, links, relative source paths, translations and acceptance criteria. Skills must be reusable without private absolute paths, secret examples or private reports as dependencies.
10. **Produce staged acceptance gates.** List blockers, dependencies, responsible approvals, implementation order and exact checks performed. Unperformed browsers/security/legal checks are `NOT TESTED`/`UNVERIFIED`, not PASS.

## Existing-path discovery examples

For this read-only checkout, inspect `app/travel/`,  `data/sample-travel.json`, `public/travel/themes/`, `public/data/`,  configuration/scripts and `docs/skills/`. No API, D1/R2, Owner or upload implementation exists in this candidate. Future storage/auth paths must be treated as planned, not current. These are example current locations, not a promised universal tree. Discover equivalent paths if moved. Proposed adapters, new sample files and release notices must be marked planned until created.

## Verification and acceptance

- Dependency map includes fetched/bundled assets and optional storage/auth build coupling, not only static imports.
- Every shipped file has a disposition; personal seeds/photos/unrelated modules/private audit reports are absent from the proposed public allowlist.
- All required completed themes remain supported; each live asset has verified release evidence or remains a release blocker. No unapproved redesign/removal.
- Default Demo runs/builds without credentials and cannot write via direct endpoints; optional personal mode authenticates/authorizes all mutations and fails closed on missing config.
- Code license/contributor rights, font/vendor notices, geographic provenance and third-party assets have explicit owner/legal-review decisions as appropriate.
- Credentials and download query metadata are absent from source, filenames, logs, emitted output and intended new history; scan coverage/limitations are stated.
- Public docs/templates use no private absolute paths or live credentials/resource defaults; referenced commands/resources exist, and future work is labeled.
- Clean-clone install/build/test, fixed-camera desktop/mobile browser checks and advisory/license review are performed in the eventual extracted candidate or explicitly remain blocked. Never claim those pass based solely on private-repo unit tests.

Use the checkout's existing checks only after inspection; common Git inspection commands (`git status --short`, `git diff --check`) are read-only but filenames may need redaction before display. Missing release/secret scanners should be documented as a gap, not invented. Return dependency/theme/data/privacy findings, a private severity-ranked security assessment, a Skill inventory and a staged roadmap. Final decision must be `BLOCKED`, `CONDITIONAL` or `READY` with evidence and unresolved gates; this review does not execute publication.
