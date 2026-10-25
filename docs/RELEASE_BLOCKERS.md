# v1.0 release readiness

The owner authorized the v1.0 public GitHub release on 2026-10-25. This document records current release scope and remaining operational steps; it does not authorize publication of subsequently discovered private data or unresolved third-party material.

## Privacy and redistribution scope

- **Original code:** standard MIT LICENSE credits `Copyright (c) 2026 Katherine965`. Other materials retain their own terms.
- **Theme imagery:** 59 files retain **Visual Review Passed**. The owner confirmed that this release set has no known unresolved third-party input-rights issue. ASSETS.md records this qualified owner declaration, not independent reconstruction of every generation session, an AI-only classification, or exclusive copyright. No specific file-level HOLD is currently reported. Any concrete later exception must be documented and cleared or excluded for that exact file.
- **Geographic data:** three GeoJSON datasets have pinned Natural Earth sources and terms. All 99 city coordinates were regenerated from 95 Natural Earth and four GeoNames records with per-row evidence and CC BY 4.0 attribution. Source data and hashes remain unchanged.
- **Dependencies and fonts:** full notices and terms are retained. The source/static package does not bundle native sharp/libvips binaries; npm installation is not an LGPL blocker.
- **Private content:** `.local/`, private uploads, environment files, caches and build output remain excluded. The Git repository has an independent initial commit, not inherited Personal-OS history. README screenshots are real captures from fictional/synthetic archives with geometric placeholders.
- **Excluded themes:** non-owned film/game themes remain absent from the five-theme release scope.

## Required release operations

Run the existing tests and production build, then `npm run check:release` against the prepared build. Review the exact staged file list before committing, push only to `Katherine965/wandering-atlas`, confirm the remote tree, change visibility to Public and create v1.0.0. Do not force-push or alter Personal-OS.

Git SSH authentication alone does not grant GitHub API permissions to change visibility or create Releases. If the current environment has no authenticated GitHub CLI or browser, stop after the verified push and use the repository's Settings → General → Danger Zone → Change repository visibility, then Releases → Draft a new release. Do not mark public access verified until it actually succeeds.

## v1.1 candidates, not v1.0 blockers

- Real-device iPhone Safari and Android touch/performance verification.
- Optional performance profiling for Globe rendering and theme switching.
- Small contrast/readability refinements based on user feedback.
- Documentation and contributor workflows as usage grows.

No new feature, backup/restore implementation, theme redesign or cloud system is part of this release task.
