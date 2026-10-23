---
name: travel-theme-builder
description: Specify, audit, implement, and validate Wandering Atlas visual themes in repositories using a shared Travel core while preserving shared product geometry, data, and behavior. Use for Travel theme concepts, assets, geometry families, typography, maps, postcards, ambient presentation, and cross-theme validation; do not use for unrelated Travel backend or product work.
---

# Travel Theme Builder

English is normative. The synchronized Chinese review copy is [SKILL.zh-CN.md](SKILL.zh-CN.md). In this specification, **MUST** is required, **SHOULD** is the default unless documented evidence justifies otherwise, and **MAY** is optional.

## 1. Contract and Vocabulary

1. **Shared product geometry** is the product-wide spatial and behavioral contract: stage/projection, component ownership, semantic order, functional bounds, hit areas, runtime-content regions, and shared typography sizes.
2. A **geometry reference** is a proven composition whose measured relationships seed a **geometry family**. Themes in that family inherit those relationships before adding art.
3. A **theme skin** is the replaceable visual layer: assets, font family, color, material, texture, effects, and bounded optical corrections.
4. Deep Sea is the initial **Standard Atlas Geometry Reference**. New themes MUST start from the current shared Atlas/Globe/Timeline composition and use Deep Sea only as the measured geometry reference, not as a visual template.

## 2. Non-Negotiable Invariants

- A new theme MUST inherit shared product geometry and a named geometry family before applying its skin.
- Shared component geometry and typography MUST NOT be independently redesigned per theme.
- Theme Switcher, Wandering Atlas brand, and Primary Toolbar form one **Header Composition Group**. Their internal relationships MUST be established first; the group is then positioned as a whole.
- Primary Toolbar geometry MUST be defined relative to the Brand, not independently from the viewport.
- Raster asset bounds MUST NOT redefine functional component bounds, hit areas, text regions, focus geometry, or sibling alignment.
- Structural decoration MUST NOT be invented. A map frame, border, panel, shadow box, or decorative map container is allowed only when it is visible in the approved concept, declared in `ASSET_MANIFEST.md`, or inherited from the selected geometry reference.
- Postcard artwork MAY vary strongly, but information hierarchy and typography geometry MUST inherit shared/reference values unless an approved structural exception exists.
- Themes MAY change font family, color, material, texture, effects, weight, style, tracking, and narrowly bounded optical type scale. They MUST NOT freely choose new type sizes.
- Layout overrides MUST be corrections, not redesigns.
- Asset inspection MUST be batched and summarized in `ASSET_MANIFEST.md`. Implementation SHOULD use the manifest and reopen only ambiguous or changed assets.
- An incomplete required asset set MUST be detected before implementation. Missing roles MUST be recorded and MUST NOT be replaced with invented CSS artwork or unrelated structural elements.
- Shared code owns Travel data, behavior, state, accessibility, projection, and persistence. A theme owns presentation only.
- World geography MUST come from shared GeoJSON. Atlas geometry, materials, and markers MUST remain in the same shared zoom/scope transform stack; a theme MUST NOT introduce independent projection or transform math.
- Atlas and Globe MUST remain shared renderers. A theme MUST NOT clone either renderer to obtain a different material or effect.
- Atlas zoom, country selection/focus, country-scoped entry filtering, and return-to-world behavior are shared product behavior. Themes own only their colors, effects, and control skin.
- Globe rotation MUST stay renderer-local and MUST NOT drive React state on every animation frame. Static sphere effects MUST remain separate from rotating geography.
- Timeline v2 MUST preserve its fixed selection ornament, runtime year strip, single-settle scroll contract, filtering semantics, and shared accessibility behavior.
- **ONE ASSET = ONE IMAGE.** Each logical raster role or animation frame MUST have one image file; composite sheets containing multiple independent controls, states, or runtime nodes MUST NOT be used as live component assets.
- Existing themes and non-theme systems MUST NOT regress. Visual theme work MUST NOT modify backend, API, schema, migrations, storage, or content models without separate scope.

## 3. Progressive Reference Loading

Read only the references required for the current phase:

| Phase or question | Required reference |
| --- | --- |
| Ownership, registry, behavior, extension points | [01 Architecture](references/01-architecture.md) |
| Geometry selection, Deep Sea reference, responsive layout, exceptions | [02 Layout Geometry](references/02-layout-geometry.md) |
| Any runtime text or control sizing | [03 Typography](references/03-typography.md) |
| Concept decomposition, asset generation, intake, or audit | [04 Assets](references/04-assets.md) |
| Atlas/Globe material, projection, performance, static halo, borders, markers, zoom, or map decoration | [05 Map Rendering](references/05-map-rendering.md) |
| Postcard frame, photos, metadata, tabs, gallery, or lightbox | [06 Postcard Composition](references/06-postcard-composition.md) |
| Particles, weather, creatures, or decorative motion | [07 Ambient Behavior](references/07-ambient-behavior.md) |
| Readiness gates, browser comparison, regression, or final checks | [08 Validation](references/08-validation.md) |

Do not load all references by default. Start with architecture plus the current phase reference; add layout and typography whenever geometry or runtime text is involved.

## 4. Required Workflow

### 4.1 Repository and Geometry Audit

Before proposing or implementing a theme, inspect the current Travel composition, theme types/registry, relevant CSS, selected geometry reference, approved concept, asset directory, manifest, and dirty working tree. Classify each observed value as shared product geometry, geometry-family reference, or theme skin before editing.

### 4.2 Concept and Inheritance Declaration

The theme specification MUST name its geometry family and inherited reference. It MUST list skin changes separately from geometry changes. If the concept cannot fit the selected family, use the exception process in Section 5; do not silently create a new layout.

### 4.3 Asset Readiness Gate

Audit supplied assets in one batch using [04 Assets](references/04-assets.md). Create or reconcile `public/travel/themes/<theme-id>/ASSET_MANIFEST.md` before application-code work. Every required visual role MUST be `READY`, explicitly `NOT_REQUIRED`, or covered by an approved exception. If any required role is `MISSING`, `UNSAFE`, or materially `UNCLEAR`, theme implementation MUST stop for that concept.

### 4.4 Implementation

Apply inherited geometry first and verify it without theme ornament. Then map approved assets and theme skin onto existing components. New typed presentation capabilities MAY be added when reusable; theme-ID behavior branches SHOULD NOT be added. Do not clone Travel page state or interaction logic.

### 4.5 Validation and Checkpoint

Validate at matched viewport sizes against the approved concept and the geometry reference. Verify interaction, locale growth, asset fit, responsive behavior, reduced motion, cross-theme isolation, and repository checks using [08 Validation](references/08-validation.md). Reconcile the manifest and record unresolved debt before handoff.

## 5. Exceptions

A geometry or typography exception MUST be declared in the theme's `ASSET_MANIFEST.md` under `## Geometry Exceptions` before implementation. Each record MUST identify:

- Component and inherited family/token.
- Proposed value or structural change.
- Concept or asset evidence that makes inheritance impossible.
- Smallest viable scope.
- Approval status and validation viewports.

An exception SHOULD modify one relationship or component, not create an unnamed parallel layout. CSS overrides without this record are not an exception declaration. A recurring exception SHOULD become a named geometry-family or shared-token proposal only after cross-theme evidence.

## 6. Current Baseline

Paths and numeric examples below describe the current checkout, not a universal installation layout. In another repository, MUST discover and map equivalent entry, registry, renderers, CSS and data paths before applying instructions; missing files or unsupported contracts MUST be reported rather than invented. Existing completed themes MUST remain unchanged during documentation, security or publication audits.


The repository is the behavioral source of truth. Five themes are available: Parchment, Cyber, Deep Sea, Ice World (Snow), and Fairy Tale. The standalone release is read-only: no Owner Edit, auth, upload, Quick Upload, D1/R2 or local webpage editing exists. Entry normalization comes from `app/travel/travel-storage.ts`; read-only JSON access from `app/travel/travel-data-source.ts`. Core component and theme paths remain under `app/travel/`; Vite entry is `app/main.tsx`. Current contracts are recorded in [01 Architecture](references/01-architecture.md); rendering/performance rules in [05 Map Rendering](references/05-map-rendering.md).

## 7. English and Chinese Synchronization

English files are normative. Chinese files under `references/zh-CN/` and `SKILL.zh-CN.md` are review translations. Every paired file MUST keep the same numbered sections, tables, token names, code identifiers, and MUST/SHOULD/MAY strength. A change is incomplete until its pair is updated. If meanings conflict, follow English and correct Chinese in the same change.

## 8. Scope Boundary

This skill MAY guide theme-system documentation and visual theme work. It does not authorize changes to backend, API, schema, migrations, storage, content models, or unrelated product behavior. A documentation-only request MUST NOT modify theme implementation or assets.
