# Travel Layout Geometry

English is normative. Chinese review copy: [zh-CN/02-layout-geometry.md](zh-CN/02-layout-geometry.md).

## 1. Geometry Layers

1. **Shared product geometry** defines invariant product relationships and functional bounds.
2. A **geometry reference** is a measured, approved composition that seeds a reusable **geometry family**.
3. **Theme skin** decorates the inherited boxes without moving them.

Every new theme MUST choose shared geometry plus a named family before applying skin. Deep Sea is the initial reference for the `standard-atlas` family.

## 2. Coordinate System

- The desktop stage MUST remain `16:9`.
- The shared map coordinate space MUST remain `1672 x 941` unless a separately scoped core change updates projection, inverse projection, markers, and all dependent layers together.
- Geometry SHOULD be expressed in stage-relative percentages and `cqw`, not viewport pixels.
- Browser measurements MUST be stage-local and taken after the effective cascade, transforms, and container sizing are applied.
- Atlas geometry, material, and marker coordinates MUST share the same zoom/scope transform stack. World zoom and the shared country-focus scope MUST use uniform scaling, and marker boxes MUST counter-scale equally on X/Y; themes MUST NOT add independent transform math.

## 3. Shared Product Geometry

These are frozen product relationships, not per-theme choices:

| Role | Shared value or rule |
| --- | --- |
| Stage | `16:9`; clipped and isolated |
| Map coordinates | Shared `1672 x 941` viewBox and projection |
| Minimum control hitbox | `2.25cqw` |
| Toolbar order | Atlas/Globe, locale, Mark a Place, Begin a Journey, Open the Archive |
| Toolbar alignment | One row and one vertical baseline |
| Toolbar control height | `4.5cqw` |
| View-control width | `12.3cqw` each |
| Locale group width | `7.4cqw` |
| Primary-action width | `13.25cqw` each |
| Toolbar group gap | `0.2cqw`; internal button gap `0` |
| Atlas zoom | center-anchored; `0.75` to `2.75` by `.25`; default `1` |
| Country scope control | `14cqw x 3.5cqw`, top `52%`, right `1.6%`; Cyber mirrors it to left `1.6%` |
| Timeline v2 root | centered; width `69.5cqw`, height `16.8cqw`, bottom `-3.25%` |
| Timeline v2 frame | `59.5cqw x 16.8cqw`; functional viewport `39.5cqw`; year spacing `9.2cqw` |
| Timeline v2 controls | `3cqw` arrows, `2cqw` gaps; fixed selection at frame center |
| Runtime layering | Background below map; controls above map/patina; postcard above atlas controls |

Functional bounds, text regions, hit areas, focus geometry, and sibling alignment MUST use these shared values. Raster artwork MAY overflow or be scaled inside them.

## 4. Header Composition Group

The Header Composition Group MUST be solved internally before it is placed on the stage.

For `standard-atlas`, use this reference relationship:

| Group relationship | Reference value |
| --- | --- |
| Group origin | stage left `6%`, stage top `3.5%` |
| Switcher box | `5.1cqw` square at group origin, optical Y `-.95cqw` |
| Brand start | switcher right edge + `.8cqw` |
| Brand width | `31cqw` reference box |
| Toolbar start | group origin + `12.5cqw` X, + `8%` stage-height Y |
| Toolbar end | stage right inset `2.5%` |

The current implementation encodes the toolbar's equivalent stage position as left `18.5%`, top `11.5%`. New documentation and future token work MUST define that position from the Brand relationship above, not as an unrelated viewport anchor.

The whole Header Composition Group MAY move for a responsive composition. Its children MUST retain their relative geometry unless an approved exception changes a specific relationship.

## 5. Standard Atlas Geometry Reference

Deep Sea contributes these proven spatial relationships without contributing its artistic skin:

| System | `standard-atlas` reference |
| --- | --- |
| Brand mode | Left-aligned runtime title/subtitle beside switcher |
| Map viewport | Uniform `scale(.94)`, translate Y `1.2cqw`, centered origin |
| Runtime map transforms | Shared uniform zoom layer plus shared country-focus scope layer; theme skin does not alter their math |
| Zoom | left `7.2%`, top `26%`, width `3.55cqw`, aspect `1/3` |
| Reference-tool stack | left `7.2%`; top `60%` plus `-2cqw` optical offset |
| Legend | width `13cqw`, aspect `4/3` |
| Map detail | width `12.5cqw`, below legend with `.16cqw` stack gap |
| Timeline | Shared Timeline v2 values from Section 3 |
| Open postcard | top `6%`, right `0`, width `23.5%`, aspect `3/4`, family scale `1.5`, origin top-right |

All seven available themes use the shared stage, Atlas/Globe geometry, and Timeline v2 composition, with theme-scoped optical corrections. Disabled planned themes do not acquire a geometry family until implementation is separately approved.

## 6. Geometry Classification

Shared/frozen examples:

- Stage ratio, map projection, component ownership, toolbar order, semantic boxes, minimum hit areas, timeline behavior, and typography size roles.
- Toolbar-to-brand relationship; Atlas zoom/country-scope behavior and map/material/marker transform coupling.

Geometry-family examples:

- Left versus centered brand composition.
- Map inset, left tool-stack placement, timeline archetype, postcard outer composition, and responsive rearrangement.
- Deep Sea values in Section 5 for `standard-atlas`.

Theme-skin examples:

- Color, material, texture, imagery, font family, glow, shadow, border treatment, marker art, and decorative silhouette.
- Raster `contain`/`cover`/`fill`, cropping, and artwork-only scale recorded by the manifest.

## 7. Corrections Versus Redesigns

A theme MAY use a small optical offset to correct transparent padding, irregular silhouettes, or font metrics. It MUST NOT change functional bounds or sibling relationships.

The following require an exception:

- Moving a functional anchor more than `.6cqw` or changing a functional dimension more than `5%` from its inherited value.
- Reordering groups, changing the toolbar baseline, splitting the Header Composition Group, or positioning the toolbar directly from the viewport.
- Switching postcard orientation, changing information order, moving the legend/detail system to another side, or adding theme-specific non-uniform map scale outside the shared country-focus transform.
- Adding a map frame, panel, border, shadow box, or decorative map container not inherited or approved.

Artwork-only crop/scale MAY exceed these thresholds when the manifest proves that functional bounds remain unchanged.

## 8. Responsive Geometry

Responsive behavior SHOULD adapt the geometry family as a whole. Do not independently scatter component overrides across breakpoints. Until a complete mobile family is approved, preserve current behavior, report limitations, and do not claim mobile parity.
