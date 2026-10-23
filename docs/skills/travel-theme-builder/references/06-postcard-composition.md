# Travel Postcard Composition

English is normative. Chinese review copy: [zh-CN/06-postcard-composition.md](zh-CN/06-postcard-composition.md).

## 1. Shared Postcard Contract

Postcard behavior and information hierarchy are shared. Artwork MAY vary strongly, but a theme MUST inherit the selected geometry-family composition and shared typography roles unless an approved structural exception exists.

Shared behavior includes selection and close, photo ordering and selection, portrait treatment, tabs, captions, notes, details, metadata, scrapbook/gallery, lightbox, keyboard navigation, and body-scroll locking.

## 2. Information Hierarchy

The runtime hierarchy MUST remain:

1. Place identity: title plus country/region/type eyebrow.
2. Section navigation: Photos, Notes, Details.
3. Primary photograph.
4. Thumbnail selection.
5. Caption, notes, or detail content.
6. Date, rating, and location metadata.
7. Optional archive/scrapbook affordance.

Visual order MAY be adapted only by an approved postcard geometry variant. Data and interaction logic MUST remain shared.

## 3. Standard Atlas Postcard Reference

The Deep Sea postcard supplies the initial Standard Atlas portrait composition. Values below are relative to the unscaled postcard box; the family applies a uniform `1.5` outer scale from the top-right origin.

| Role | Reference geometry |
| --- | --- |
| Outer card | top `6%`, right `0`, width `23.5%` of stage, aspect `3/4` |
| Close control | top `13.8%`, right `12%`, width `5.3%` of card |
| Eyebrow | top `16.8%`, left `18%`, width `64%` |
| Place title | top `18.7%`, left `18%`, width `64%` |
| Tabs | top `23.1%`, left `17%`, width `66%`, height `3.8%` |
| Main photo | top `28%`, left `17%`, width `66%`, height `25%` |
| Thumbnails | top `55.2%`, left `17%`, width `66%`, height `7.4%` |
| Caption/content | top `65%`, left `17%`, width `66%`, height `8.5%` |
| Metadata | top `75.2%`, left `17%`, width `66%`, height `11.5%` |

These values define hierarchy and alignment. A different frame's audited safe area MAY require bounded inset corrections; it MUST NOT justify a new information hierarchy by itself.

## 4. Frame and Safe Area

Before implementation, the manifest MUST record:

- Outer canvas and visible artwork bounds.
- Transparent aperture and content-safe rectangle.
- Photo opening, decorative overlaps, and permanent printed-art regions.
- Close-control-safe region.
- Allowed fit and stretch behavior.

Raster bounds MUST NOT become the card's functional bounds automatically. The runtime interior SHOULD be positioned from the audited safe area while preserving the inherited hierarchy.

## 5. Typography

Postcard title, eyebrow, tabs, caption, metadata labels, and metadata values MUST use the shared roles in [03 Typography](03-typography.md). A theme MAY change family, color, material, effects, style, tracking, and allowed optical scale.

Text MUST NOT be reduced merely to fit decorative padding. If the approved frame cannot support the inherited hierarchy at readable sizes, declare a structural exception or reject the asset for that role.

## 6. Photos and Runtime Content

- Landscape photos SHOULD use the shared crop behavior.
- Portrait photos SHOULD use the configured contain/backdrop treatment.
- Thumbnails MUST remain selectable and ordered from shared state.
- Place names, dates, rating, location, captions, notes, tags, and selected photo MUST remain runtime content.
- City-specific artwork MUST NOT be used as a generic postcard shell.
- Permanent decorative print MAY remain in the frame only when it does not conflict with locale or runtime data.

## 7. Structural Variants

A landscape card, vertical thumbnail rail, hidden visible tabs, reordered metadata, or detached archive control is a structural variant, not a skin. It MUST be declared as a geometry exception or named reusable postcard family before implementation.

One existing theme-specific branch is not evidence that another branch is acceptable. Reusable presentation needs SHOULD become typed variants or slots.

## 8. Validation

Validate long English and Chinese titles, no-photo state, portrait and landscape photos, maximum thumbnail count, all tabs, long captions/notes/tags, absent metadata, close target, gallery/lightbox entry, and frame overlap at matched desktop and narrow viewports.
