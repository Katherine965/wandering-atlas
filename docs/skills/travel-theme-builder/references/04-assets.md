# Travel Theme Assets

English is normative. Chinese review copy: [zh-CN/04-assets.md](zh-CN/04-assets.md).

## 1. Asset Authority

Approved assets are art authority, not layout authority. Raster canvas bounds MUST NOT redefine shared functional boxes, text regions, hit areas, projection geometry, or component relationships.

The active theme definition and direct CSS URLs determine what runtime loads. `ASSET_MANIFEST.md` records evidence and intent but MUST be reconciled when it disagrees with executable references.

## 2. ONE ASSET = ONE IMAGE

**ONE ASSET = ONE IMAGE** is the default runtime convention:

- Each logical raster role or state MUST have one image file and one canonical runtime path.
- A file MUST NOT combine multiple independent controls, markers, Timeline nodes, selected/unselected states, localized text, or component shells for runtime cropping.
- One semantic frame image MAY be sliced or stretched by CSS to preserve its fixed endcaps and continuous center because it remains one frame asset.
- One role image MAY be reused at multiple sizes when the theme deliberately uses identical art, as current button-frame configurations do.
- Animation uses one image per frame in an ordered array. A sprite sheet is not the current convention.
- Provenance sheets and superseded composites MAY remain documented, but they MUST NOT be treated as live assets unless the code actually references them.

Runtime text, years, labels, dates, ratings, coordinates, photos, selected state, disabled state, and accessible names MUST remain HTML/SVG/data.

## 3. Current Asset Categories and Slots

Classify each image by one primary role:

1. Background/environment: `assets.background`.
2. Atlas material: `assets.landTexture`, clipped to live Atlas land.
3. Globe material: `assets.globe.landTexture` and `assets.globe.oceanTexture`.
4. Component skin: buttons, legend, zoom, postcard, Timeline, switcher, map-view controls, or Owner Edit.
5. Marker artwork: Journey or Location, optionally with legend-specific copies.
6. Ambient decoration or animation frame: only for separately authorized future work; none is mounted in this five-theme release.

The current tree mixes role-named files with retained opaque `MsgID` filenames, and many `.jpeg` paths contain PNG data. Inspect file content, dimensions, alpha, and visual role; do not infer format or semantics from the extension/name.

## 4. Material and Texture Rules

- Atlas and Globe materials MUST be flat reusable surfaces without baked continents, country borders, graticules, labels, markers, sphere edges, lighting, or selection state.
- Atlas country focus reuses `assets.landTexture` inside the live focused-country path and projected bounds. It MUST NOT introduce a country-specific texture, silhouette, selected overlay, or composite control asset.
- Globe land and ocean are separate roles. Land is clipped by the live projected land path; ocean is clipped by the fixed sphere path.
- A Globe texture MUST NOT be a full page background, Atlas screenshot, UI frame, or pre-rendered globe.
- Record aspect ratio, coverage scale, travel ratio, opacity, blend mode, filter, crop, and non-repeat requirements.
- Coverage MUST remain complete at all allowed rotations without seams, empty edges, or visible repetition.
- Prefer dedicated Atlas and Globe materials. Reusing one material, as Fairy Tale currently does for Atlas land and Globe land, is a documented current exception rather than a default.
- Texture images MUST remain mounted while Globe rotates; runtime updates position attributes, not image resources.

## 5. Batched Audit Workflow

1. Inventory paths, actual formats, dimensions, alpha, and hashes in one batch.
2. Produce one contact sheet per coherent batch when practical.
3. Inspect each asset for role, visible bounds, padding, safe area, baked content, crop/stretch constraints, duplicates, and anomalies.
4. Compare findings with the active theme definition and direct CSS references.
5. Reconcile `ASSET_MANIFEST.md`; reopen only changed or ambiguous assets during implementation.

Filenames and dimensions MUST NOT substitute for visual inspection.

## 6. Manifest Contract

Use `public/travel/themes/<theme-id>/ASSET_MANIFEST.md` with at least:

```markdown
| Canonical path | Dimensions | Alpha | Category | Role/state | Fit/safe area | Required | Status | Notes |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- |
```

Allowed status values are `READY`, `MISSING`, `UNSAFE`, `UNCLEAR`, `REJECTED`, `DUPLICATE`, `UNUSED`, and `NOT_REQUIRED`.

The manifest MUST record creator/source, acquisition date, license evidence and redistribution status, required attribution, public-release eligibility and verification action separately from visual readiness. Unknown rights MUST stay `UNVERIFIED`; `READY` is not legal approval. Free downloads or generated-looking art MUST NOT be assumed redistributable. Credential-bearing download query metadata MUST NOT be copied into public manifests or filenames; record a redacted stable identifier and request separately approved sanitization instead of renaming assets during an audit.

The manifest MUST record provenance, runtime path, fit/crop/stretch/clip rule, transparent padding, functional safe area, baked-content hazards, animation-frame order, texture layout, and `## Geometry Exceptions`.

## 7. Readiness and Safe Areas

- Every concept-required role MUST be `READY` or justified `NOT_REQUIRED` before implementation is called complete.
- Missing art MUST NOT be replaced with unrelated frames, generic panels, invented structural decoration, or baked runtime content.
- Distinguish source canvas, painted bounds, decorative overflow, functional box, runtime content safe area, and hit area.
- `contain`, `cover`, `fill`, crop, slicing, or controlled optical scale MAY follow the manifest, but artwork MUST NOT move the functional anchor or shrink the semantic hitbox.

## 8. Current Directory Convention

```text
public/travel/themes/<theme-id>/
|-- ASSET_MANIFEST.md
|-- background.png
|-- textures/
|-- ui/
`-- ambient/ or ui/crawler/
```

Role-based lowercase names SHOULD be used for new normalized assets. Do not rename opaque/provenance files solely for consistency; update the runtime reference and manifest together when normalization is actually approved.
