# Travel Theme Validation

English is normative. Chinese review copy: [zh-CN/08-validation.md](zh-CN/08-validation.md).

## 1. Validation Gates

A theme moves through these gates:

1. Repository and geometry audit.
2. Concept decomposition and geometry-family declaration.
3. Batched asset audit and manifest readiness.
4. Geometry-first build.
5. Skin application.
6. Visual, interaction, responsive, and regression validation.
7. Manifest/checkpoint reconciliation.

A later gate MUST NOT begin when an earlier required gate is incomplete.

## 2. Pre-Implementation Readiness

Before application-code work, confirm:

- The theme ID and approved concept are unambiguous.
- A geometry family and reference are named.
- Shared values, family values, skin values, and proposed exceptions are separated.
- Every concept-required asset role is `READY` or justified `NOT_REQUIRED`.
- No required role is `MISSING`, `UNSAFE`, or materially `UNCLEAR`.
- Every geometry or typography exception is recorded and approved.

If this gate fails, implementation MUST stop. CSS invention and unrelated structural decoration MUST NOT be used to make the asset set appear complete.

## 3. Geometry Validation

At identical stage dimensions, compare the implementation with both the approved concept and selected geometry reference.

MUST record viewport, device pixel ratio, locale, theme, Atlas/Globe, selected entry/country, Timeline year/mode, camera rotation/zoom and reduced-motion state. For fixed-camera comparisons, pause auto-rotation through an existing supported control or a separately approved test fixture; MUST NOT invent a debug URL or report a moving screenshot as a matched baseline. Browser name/version and console/network failures belong in the evidence record.

- The Header Composition Group MUST retain its internal relationships.
- The toolbar MUST remain Brand-relative.
- Shared functional bounds, order, hitboxes, and typography tokens MUST match.
- Atlas geometry, clipped material, country hit paths, and markers MUST remain registered through the same zoom/scope transform stack. Marker boxes MUST stay visually stable under world zoom and the shared country-focus X/Y scale.
- Layout overrides MUST match declared corrections or approved exceptions.
- Raster overflow MUST NOT change semantic boxes.

Use browser-computed geometry and screenshots, not memory or source declarations alone.

## 4. Visual and Asset Validation

Verify background fit, alpha, crop, safe areas, material clipping, marker art, legend, zoom, timeline, postcard, and optional ambient assets against the manifest. The implementation MUST NOT contain unapproved map frames, panels, borders, shadow boxes, or substitute artwork.

The manifest MUST be updated when a runtime mapping, fit rule, status, or exception changes.

## 5. Interaction and Content Validation

Verify:

- Theme switching, persistence, fallback, and switching back to every existing theme.
- English/Chinese text growth and visible runtime labels.
- Map loading, borders/outline, world zoom from `0.75` to `2.75`, placement preview, and marker selection.
- Country selection highlight, keyboard activation, Explore, focused-country geometry/material/entry filtering, Back to World/Escape, and scope reset when entering Globe or Owner Edit.
- Timeline filtering and country filtering composing without leaking out-of-scope markers or leaving a hidden selected postcard open.
- Timeline previous/next/select behavior and boundary states.
- Timeline v2 user scroll, wheel, click, previous/next, and arrow-key movement as one continuous displacement with no second snap or focused-year correction.
- Native `scrollend` and the `140 ms` fallback settling the same scroll sequence only once; scroll-derived focused-year changes MUST NOT trigger an external alignment effect.
- Postcard selection, close, photo order, portrait treatment, tabs, captions, metadata, scrapbook/gallery, and lightbox keyboard behavior.
- Read-only boundaries: no edit/upload/auth controls or mutation endpoints. Future editing features require separately scoped tests.
- Focus, disabled, hover, selected, and reduced-motion states.

Visual skin MUST NOT change these behaviors.

## 6. Responsive Validation

Validate the approved desktop viewport, a narrow desktop/tablet viewport, and current mobile behavior. Geometry-family movement SHOULD occur as coordinated groups. Report known mobile limitations rather than inventing a new per-theme mobile composition. MUST distinguish tested desktop Chrome, macOS Safari, mobile Chrome and iOS Safari from source-only expectations; untested browsers MUST be marked `NOT TESTED`. Cover WebGL failure/fallback, orientation changes, font resolution and reduced motion. Record rotation/drag frame time and memory evidence for both glow-heavy and Three.js copper/felt materials.

Visual `READY` and browser PASS do not establish redistribution rights. Public handoff MUST verify the manifest rights/provenance fields and separate public-safe evidence from private credentials, travel records, photos and logs.

## 7. Regression and Repository Checks

For Globe work, also profile auto-rotation and dragging. Confirm one RAF, renderer-local rotation, no per-frame React render, zero per-frame sphere path generation, at most one path generation for each enabled land/country/graticule geometry, stable texture image elements, and static halo/atmosphere/rim layers outside rotating geography. Compare at least one glow-heavy theme and one antique theme for filter/compositing regressions.

Run the repository's current checks, normally:

```bash
npm run lint
npm run build
git diff --check
git status --short
```

Existing themes MUST remain behaviorally and visually stable. The final diff MUST be inspected for accidental backend, API, schema, migration, storage, content, generated-file, or unrelated asset changes. Do not claim a browser or interaction check that was not performed.

## 8. Checkpoint Record

Before handoff:

- Reconcile the manifest with actual runtime references.
- Record the geometry family and approved exceptions.
- Identify confirmed unused, duplicate, or rejected assets without deleting ambiguous originals.
- Record unresolved architecture or visual debt.
- Confirm English/Chinese documentation parity when the specification changed.

A fresh session SHOULD be able to continue from the repository, approved concept, selected geometry reference, and manifest without hidden conversation history.
