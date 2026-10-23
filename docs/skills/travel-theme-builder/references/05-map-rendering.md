# Travel Atlas and Globe Rendering

English is normative. Chinese review copy: [zh-CN/05-map-rendering.md](zh-CN/05-map-rendering.md).

## 1. Shared Geography Contract

World Atlas and Globe MUST use `/data/travel-world-landmass-50m.geojson` and `/data/travel-world-countries-50m.geojson` through the shared `1672 x 941` coordinate system. Country Focus MUST use `/data/travel-country-detail-10m.geojson` only. Markers, labels, selection, Borders/Outline state, and time-filtered entries remain shared behavior.

Geography MUST be live paths. Raster materials MUST NOT contain continents, borders, markers, labels, graticules, or selected state.

## 2. Atlas Architecture

`TravelMap.tsx` consumes paths created by `travel-geometry.ts` using an equirectangular mapping and shared bounds `(208, 162, 1256, 628)`.

- `createAtlasPaths` creates world land paths with `d3-geo` antimeridian clipping and preserves every Polygon/MultiPolygon ring. `createCountryAtlasPaths` adds a stable `ISO_A3`/`ADM0_A3` country ID, name, world path, antimeridian-unwrapped focus path, compact longitude center, and complete projected bounds. The current data treatment merges Taiwan geometry into `CHN` and does not expose a separate `TWN` focus target.
- `ink`, `neon`, and `investigation` are presentation families over the same paths.
- `.travel-map-zoom-layer` owns uniform center-anchored zoom from `0.75` to `2.75` in `.25` steps, default `1`.
- `.travel-map-scope-layer` owns the shared country-focus transform. `createCountryFocusTransform` fits the complete country bounds with uniform scale and `10%` padding.
- Geography, clipped material, country hit paths, and `TravelMarkerLayer` MUST remain in that shared transform stack. Marker boxes counter-scale on X/Y so the art and hit area stay stable. A theme MUST NOT replace this math.
- In world scope, a country click or Enter/Space selection highlights its live path and exposes the shared Explore control. Focus scope renders the selected country path/material, filters the already time-filtered entries through shared country-name aliases, and disables further country picking.
- Back to World and Escape restore world scope and zoom `1`. Entering Globe, Owner Edit, entry editing, or location placement also restores world scope. Owner Edit inverse placement is world-scope only.
- `assets.landTexture` is clipped to live Atlas land; country focus uses the selected country's projected bounds for the material image.
- Country borders may be hidden by shared map-detail state; coastline/land remains.
- Country focus behavior is shared. Themes may skin `--travel-country-focus-fill`, `--travel-country-focus-stroke`, `--travel-country-focus-glow`, and the shared `TravelButton`, but MUST NOT change selection, filtering, scope, or transform behavior.
- Deep Sea-specific Atlas glow/shading is current theme-ID debt and MUST NOT be copied into another theme branch.

## 3. Globe Geometry and Layers

`TravelGlobe.tsx` uses `d3-geo` `geoOrthographic()` with `clipAngle(90)`, precision `0.8`, center `(836, 476)`, diameter `485`, and initial rotation `[-10, -18, 0]`.

Parchment additionally selects `TravelCopperGlobeSurface.tsx`; Fairy Tale selects `TravelFairyFeltGlobeSurface.tsx` with dedicated textures. These Three.js canvas surfaces share the rotation/geography contract and signal readiness to the SVG fallback. MUST validate WebGL-unavailable behavior, resource disposal, device pixel ratio, resize and reduced-motion behavior rather than assuming the SVG-only profile applies to every material.

The shared SVG/marker layer architecture is:

1. Static backdrop SVG: shadow, fixed halo fields, and programmatic ocean base.
2. Rotating geography SVG: ocean texture, one live land geometry, optional land bloom/fill/texture/light, optional graticule, coast glow, countries, coastline, and geographic labels.
3. Static foreground SVG: reflection, atmosphere, rim, and rim light.
4. Static interaction SVG: transparent sphere hit path.
5. HTML marker layer: projected markers updated imperatively.

The sphere path is computed once for a renderer instance. Land geometry is stored once per frame and reused through `<use>` and clip paths by bloom, fill, texture, light, and coastline layers.

## 4. Rotation and Per-Frame Contract

Globe rotation is renderer-local, not React-render-driven:

- `TravelGlobeRenderer` owns one projection, one `geoPath`, current rotation, and target rotation.
- Exactly one RAF loop handles both drag targets and idle auto-rotation.
- Pointer move only updates target rotation. It MUST NOT run projection repeatedly or create a second RAF.
- React state MAY track low-frequency UI facts such as dragging and reduced-motion preference; rotation MUST NOT use per-frame `setState`.
- Hidden documents cancel RAF; visible documents restart it with a reset timestamp; unmount cancels RAF and commits the last rotation once.
- Auto-rotation speed, drag sensitivity, latitude clamp, backface culling, and marker behavior are shared and MUST NOT become theme settings.

For one rendered rotation frame:

- Land path generation occurs at most once when land GeoJSON exists.
- Country path generation occurs at most once when the country path is mounted.
- Graticule path generation occurs at most once when enabled.
- Sphere path generation is zero per frame.
- All land visual layers reuse the same live geometry.
- Marker and geographic-label elements remain mounted and receive imperative position/visibility/opacity updates.
- Texture image elements remain mounted; only their `x`/`y` positions change.

## 5. Static Halo vs Rotating Geography

Effects that depend only on the sphere boundary MUST remain outside the rotating geography SVG. This includes outer halo, atmosphere, reflection, rim, rim light, and ground shadow.

- A blur, drop-shadow, mask, or filter MUST NOT be applied to the entire rotating geography group.
- Static sphere effects SHOULD use fixed circles/ellipses/gradients or the cached sphere path.
- Land bloom and coast glow MAY rotate because they depend on the live coastline, but they MUST reference the same land geometry and MUST NOT generate a second projected path.
- Dynamic filter regions SHOULD be bounded to the Globe rather than the full stage.
- CSS transitions MUST NOT lag dynamic geography or create stale-frame ghosting.

This boundary is required for Cloudflare/browser compositing performance and MUST be preserved while changing theme glow values.

## 6. Globe Theme and Texture Contract

Themes may configure `material`, `renderMode`, label style, `surface`, and per-texture layout. Assets use `assets.globe.landTexture` and `assets.globe.oceanTexture`.

- Ocean textures are clipped to the sphere; land textures are clipped to live projected land.
- `textureLayout` controls material aspect ratio, optional coverage scale, and horizontal travel ratio. Coverage MUST survive the full allowed latitude/longitude range.
- Missing textures fall back to programmatic surfaces; missing Globe land may reuse `assets.landTexture` as the current compatibility fallback.
- `renderMode: "texture-only"` removes themed overlays but preserves projection, clipping, rotation, markers, and interaction.
- Filters, opacity, blend mode, graticule, coast glow, and halo are appearance fields. They MUST NOT change geometry or rebuild image resources per frame.

## 7. Markers, Labels, Zoom, and Detail

- Marker type, coordinates, button/hitbox, selection, label behavior, and horizon culling are shared.
- Marker artwork and artwork-only scale are theme skin.
- Globe geographic labels are shared runtime data, clipped/culling with projection; themes only style them.
- Atlas zoom actions, limits, default, center anchor, country scope, and inverse marker scaling are shared. Globe has drag/auto-rotation, not Atlas zoom or country focus.
- Map-detail capability controls country borders in both renderers.

## 8. Validation

Validate world Atlas zoom, country selection/focus, time-plus-country filtering, marker registration, material clipping, keyboard activation, Escape/Back to World, and scope resets before comparing Atlas and Globe detail state. For Globe, profile initial, auto-rotation, and drag states and verify one RAF, no per-frame React render, one path per enabled geometry class, stable texture DOM, static halo separation, correct culling, and no filter ghosting. Visual validation MUST also cover seams, empty texture edges, clipping, marker/label registration, and reduced motion.
