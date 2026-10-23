# Travel Typography

English is normative. Chinese review copy: [zh-CN/03-typography.md](zh-CN/03-typography.md).

## 1. Typography Contract

Typography size is shared geometry. Font family, color, material, texture, effects, weight, style, and tracking are theme skin.

Themes MUST start from the shared role tokens below. They MAY apply an optical scale within `0.95-1.05` for demonstrated font-metric differences. Larger changes require a declared geometry exception.

## 2. Shared Role Tokens

These are specification tokens. Existing CSS variables MAY map to them until a dedicated token refactor is scoped. Brand sizes are scoped to the Standard Atlas family; the remaining roles are shared product tokens.

| Token | Reference size | Scope | Role |
| --- | ---: | --- | --- |
| `--travel-type-brand-title` | `2.75cqw` | `standard-atlas` | Brand title |
| `--travel-type-brand-subtitle` | `.76cqw` | `standard-atlas` | Brand subtitle |
| `--travel-type-primary-action` | `1.065cqw` | Shared | Primary toolbar actions and Atlas/Globe labels |
| `--travel-type-secondary-control` | `.96cqw` | Shared | Locale and ordinary secondary controls |
| `--travel-type-secondary-compact` | `.746cqw` | Shared | Compact Outline/Borders-style controls |
| `--travel-type-legend` | `.852cqw` | Shared | Legend labels |
| `--travel-type-postcard-title` | `1.12cqw` | Shared | Postcard place title inside the unscaled reference card |
| `--travel-type-postcard-eyebrow` | `.37cqw` | Shared | Country/region/type line |
| `--travel-type-postcard-tab` | `.46cqw` | Shared | Postcard tabs |
| `--travel-type-postcard-caption` | `.48cqw` | Shared | Caption, notes, and detail copy |
| `--travel-type-postcard-meta-label` | `.43cqw` | Shared | Metadata labels |
| `--travel-type-postcard-meta-value` | `.49cqw` | Shared | Metadata values |
| `--travel-type-timeline-year` | `.68cqw` | Shared | Timeline years |
| `--travel-type-timeline-year-active` | `.76cqw` | Shared | Active timeline year |

The Standard Atlas postcard uses a `1.5` family scale, so its displayed postcard type is also scaled uniformly. A theme MUST NOT counteract this by independently choosing unrelated internal sizes.

## 3. Hierarchy Rules

- Primary actions MUST remain the strongest control labels.
- Secondary controls SHOULD be quieter but remain readable and operable.
- Legend labels MUST have equal hierarchy for Journey and Location.
- Postcard title MUST dominate eyebrow, tabs, caption, and metadata.
- Metadata values SHOULD be stronger than metadata labels.
- Active timeline year MAY be emphasized only through the active token and theme skin.
- Runtime localized text MUST remain visible unless an approved concept uses permanent decorative text and the semantic runtime label remains accessible.

## 4. Theme Freedom

A theme MAY change:

- Font family and language-specific fallbacks.
- Color, gradient fill, stroke, shadow, glow, texture, and blend treatment.
- Weight, italic/roman style, case, and tracking when text remains legible.
- Optical scale within the allowed band.

A theme MUST NOT:

- Introduce arbitrary role sizes.
- Size text from raster lettering or transparent padding.
- Shrink text merely to fit an incorrect asset safe area.
- Hide dynamic text because an unrelated asset contains baked wording.
- Change control height or text-region geometry to solve a font problem.

## 5. Localization and Fit

English and Chinese MUST use the same semantic role token. Language-specific family, tracking, or optical scale MAY differ within the allowed band. Validate the longest supported labels at the reference viewport and the current narrow layout.

If text does not fit, use this order:

1. Confirm the correct geometry family and functional width.
2. Confirm the manifest safe area and artwork fit.
3. Adjust tracking or approved font fallback.
4. Apply a narrow optical scale.
5. Declare an exception rather than silently reducing size.

## 6. Deep Sea Reference Evidence

Deep Sea establishes the current Standard Atlas hierarchy: `2.75cqw/.76cqw` brand title/subtitle, `1.065cqw` primary controls, `.96cqw` secondary locale controls, `.746cqw` compact detail controls, `.852cqw` legend text, the postcard scale listed in Section 2, and `.68/.76cqw` timeline years. Its serif choices, pearl gradient, aqua/gold color, glow, shadow, uppercase treatment, and tracking are theme skin and MUST NOT be copied as geometry.

## 7. Validation

Typography validation MUST inspect computed size, line height, overflow, clipping, contrast, and focus/disabled states in both languages. Visual comparison SHOULD use identical stage dimensions so `cqw` values are comparable.
