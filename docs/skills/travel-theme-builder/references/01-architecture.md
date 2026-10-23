# Travel Theme Architecture

English is normative. Chinese review copy: [zh-CN/01-architecture.md](zh-CN/01-architecture.md).

## 1. Sources of Truth and Current Files

Executable code wins over this reference, manifests, and historical audits. Inspect the current versions of:

| Concern | Current source |
| --- | --- |
| Page state and composition | `app/travel/page.tsx` |
| Shared stage and controls | `app/travel/components/TravelAtlasStage.tsx`, `TravelHeader.tsx`, `TravelButton.tsx`, `TravelThemeSwitcher.tsx` |
| Atlas | `TravelMap.tsx`, `travel-geometry.ts` |
| Globe | `TravelGlobe.tsx`, `TravelGlobeGeographicLabels.tsx`, `travel-globe-labels.ts`, `TravelCopperGlobeSurface.tsx`, `TravelFairyFeltGlobeSurface.tsx` |
| Shared markers | `TravelMarkerLayer.tsx`, `TravelMarker.tsx` |
| Timeline and filtering | `TravelTimeline.tsx`, `travel-time.ts` |
| Theme contract and registry | `app/travel/themes/types.ts`, `registry.ts`, `use-travel-theme.ts`, and each available theme file |
| Effective presentation | Travel selectors in `app/globals.css` |
| Runtime assets | `public/travel/themes/<theme-id>/` and the active theme definition |

Current standalone architecture is documented in `docs/ARCHITECTURE.md`; current source and actual browser evidence take precedence.

## 2. Available Themes

The current registry exposes five selectable themes:

| Theme ID | Map renderer | Globe material | Timeline v2 presentation |
| --- | --- | --- | --- |
| `parchment` | `ink` | `antique`, programmatic Three.js copper with SVG fallback | HUD frame and point |
| `cyber` | `neon` | `crystalline`, dedicated land/ocean textures | HUD frame and point |
| `deep-sea` | `investigation` | `crystalline`, dedicated land/ocean textures | Asset frame and point |
| `ice-world` | `investigation` | `crystalline`, dedicated land/ocean textures | Asset frame and point |
| `fairy-tale` | `investigation` | `antique`, dedicated land/ocean textures, Three.js felt surface; Atlas reuses Globe land | Asset frame and point |

Only the five registered themes are in scope; do not add experimental themes without separate authorization.

## 3. Ownership Model

Shared core MUST own:

- Read-only entry normalization, filtering, local JSON data access and local image references.
- Journey/Location semantics, selection, postcard, gallery, lightbox, and read-only behavior.
- Atlas/Globe selection, Atlas zoom and country scope, the `1672 x 941` coordinate space, GeoJSON, projections, inverse Atlas placement, marker coordinates, Globe rotation, and visibility culling.
- Timeline mode, focused year, year range, scrolling, snapping, keyboard behavior, and entry filtering.
- Accessible names, semantic controls, focus, disabled state, and reduced-motion behavior.

Theme presentation MAY own:

- Background/environment art, font family, color, material, texture, borders, shadows, glows, and restrained motion.
- Renderer selection from the existing typed families.
- Atlas country-highlight color/effect variables and the shared scope-control skin, without changing country behavior or transform math.
- Globe surface values, texture layout, label style, and optional texture-only presentation.
- Marker artwork and artwork-only optical scale.
- Skins for controls, legend, zoom, Timeline v2, postcard, gallery, lightbox, and Owner Edit.
- Optional non-semantic ambient assets and presentation.

A theme MUST NOT duplicate shared state, projection, renderer markup, or interaction logic to obtain a different appearance.

## 4. Current Composition

```text
TravelPage
`-- TravelAtlasStage
    |-- background and optional map frame
    |-- TravelHeader / TravelThemeSwitcher
    |-- shared toolbar and Atlas/Globe selector
    |-- TravelMap OR TravelGlobe
    |   `-- TravelMarkerLayer
    |-- optional theme ambient actor
    |-- TravelZoomControl
    |-- TravelLegend / TravelMapDetailToggle
    |-- TravelTimeline
    |-- TravelPostcard / scrapbook / TravelLightbox
    `-- read-only data source
```

`TravelPage` first computes `timelineFilteredPlaces`. World scope passes that set to the active renderer; Atlas country scope filters it again through the shared country-name/ID mapping and renders only the focused country. Entering Globe returns Atlas scope and zoom to the world defaults. Globe rotation is live inside `TravelGlobe` and is committed to `TravelPage.globeRotation` only on Globe unmount so switching views restores orientation.

## 5. Theme Contract

`AvailableTravelTheme` currently supplies:

| Contract area | Current shape |
| --- | --- |
| Metadata | `id`, `label`, `labelZh`, `available` |
| Layout/capabilities | `brandLayout`, `capabilities.globe`, `capabilities.mapDetail` |
| Activation | `rootClassName`, `data-travel-theme` |
| Renderers | button, legend, map, marker, postcard, switcher, timeline, zoom |
| Visuals | `globe`, Journey/Location `markerScale`, postcard portrait treatment, Timeline v2 strategy/layout |
| Assets | background plus optional control, marker, Atlas material/frame, Globe textures, postcard, Timeline, switcher, ambient, and Owner Edit slots |

Registration and persistence remain centralized in `registry.ts` and `use-travel-theme.ts`. The storage key is `wandering-atlas-theme`; invalid or unavailable IDs fall back to Parchment.

- Renderer names select presentation only; they MUST NOT create separate data or interaction implementations.
- A reusable presentation need SHOULD become a typed renderer variant, capability, visual field, or asset slot.
- A one-off visual correction MAY remain theme-scoped CSS when it does not alter structure or behavior.
- New theme-ID branches SHOULD NOT be added to shared behavior or component markup.

## 6. Atlas, Globe, and Timeline Boundaries

Atlas and Globe consume the same landmass/country GeoJSON and marker data but use different projections. Atlas owns the custom equirectangular world projection, center-anchored zoom, country selection/focus, country-scoped entry filtering, and read-only map interaction. Globe uses the shared orthographic renderer, pointer drag, idle rotation, horizon culling, geographic labels, and renderer-local frame updates. Read [05 Map Rendering](05-map-rendering.md) before changing either renderer or any Globe effect.

Every available theme selects `visuals.timeline.structure: "v2"`. Timeline v2 renders the complete runtime year range, keeps the frame and selected ornament fixed, and scrolls the year strip beneath them. Its settle rules are shared behavior:

- User scroll, wheel, click, previous/next, and arrow-key navigation MUST resolve to one focused-year change and one visual movement.
- Native `scrollend` and the `140 ms` fallback MUST be deduplicated by the current scroll sequence.
- A focused year produced by the current scroll/click sequence MUST NOT trigger the external focused-year effect to scroll again.
- An external focused-year change MAY align the strip once with `behavior: "auto"`.
- CSS center snap remains the alignment mechanism; settle MUST NOT add a second manual correction.
- Changing `focusedYear` does not switch `mode`; `all` shows every entry and `year` applies `filterTravelEntries`.

## 7. Current Exceptions

The following are implementation facts, not patterns to copy:

- `TravelMap.tsx` selects Deep Sea-only map effects by theme ID.
- `TravelGlobe.tsx` currently selects copper and felt surfaces by Parchment/Fairy-tale IDs. These are presentation branches, not permission to duplicate geographic behavior.
- Theme root and `data-travel-theme` selectors in CSS are intentional presentation boundaries.

New work MUST prefer typed presentation configuration over adding another theme-ID branch.

## 8. Extension Decision

Use this order:

1. Existing shared component and shared behavior.
2. Existing renderer family or typed visual/asset field.
3. Theme-scoped skin or asset-safe-area correction.
4. Approved geometry exception.
5. Reusable typed capability or named geometry family when multiple themes prove the need.

Do not redesign shared behavior because an asset is inconvenient.
