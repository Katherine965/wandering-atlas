# Edit Mode Source-to-Target Mapping

Inspected before UI changes on 2026-10-16. Protected source is read-only. Source paths below are repository-relative, not private absolute paths. Runtime code/cascade takes precedence over asset inventories and historical design claims.

## Confirmed implementation and differences

| Theme | Original Edit Entry | Original Journey/Place Buttons | Original Form/Modal Styling | Current Standalone Difference | Required Restoration |
| --- | --- | --- | --- | --- | --- |
| Parchment | `app/travel/page.tsx`: `travel-tool-journey`, `requestOwnerAccess` / `exitEditMode`, pressed/active state | `TravelButton`: `frame=md`, `frameAsset=legend`; MapPin/Flag. `Mark a Place` opens Location; original Begin toggles editing. Entry Type selector permits Journey | `app/globals.css`: shared `.travel-journal*`, `.travel-log-*`, `.travel-photo-*`; final `--travel-edit-*` tokens (warm paper, 14px radius, bordered fields) | Added floating local mode bar, bespoke modal padding/border, missing final theme tokens, custom datalist form | Restore source modal dimensions, full source field structure/controls, final semantic cascade; use local capability instead of Owner |
| Snow (`ice-world`) | Same source entry pattern; original Ice hover/active states | Same labels/placement; Ice-specific frame/image and red icon treatment already retained | `.travel-theme-ice-world .travel-journal*` plus final Ice tokens: blue paper, blue fields/accent, red danger; source mobile cascade | Generic warm local surface; theme class/tokens not applied to local dialog | Restore Ice source tokens/selectors under actual theme ancestor; no new art |
| Deep Sea (`deep-sea`) | Same source entry pattern; Deep Sea button skins | Same labels/placement with current Deep Sea frames/icons | Final combined `.travel-theme-cyber,.travel-theme-deep-sea` edit tokens: dark sea/cyan fields, accent, borders, overlay | Generic paper fields; source final styles not migrated | Restore dark semantic edit surface; preserve Deep Sea artwork already copied |
| Cyber (`cyber`) | Same source entry pattern; HUD active state | Same labels/placement with Cyber CSS polygon border/pseudo-elements and icons | Same final dark/cyan semantic surface as Deep Sea; original journal typography/layout shared | New shared paper style erased dark surface | Restore source dark inputs/buttons/photo management, preserve HUD toolbar |
| Fairy Tale (`fairy-tale`) | Same source entry pattern; rose active/hover treatment | Same labels/placement and floral frame assets | Earlier `.travel-theme-fairy-tale .travel-journal` references floral `ownerEditFrame`, **and its higher-specificity selector keeps that floral background in the final cascade**. Final rose/cream tokens; source Fairy padding and overlay cascade retained | Generic padded paper card; missing final cascade and theme ancestry | Restore effective source floral frame and rose/cream fields, source 116/118/154px desktop padding and responsive rules. Restore the source floral artwork (rights HOLD pending clearance) |

## Exact source references

- `app/travel/page.tsx`: `openNewEntry`, `openEntryEditor`, `handlePlaceSelect`, `resetDraft`, `handleDeleteEntry`, journal JSX; toolbar `.travel-tool-location`, `.travel-tool-journey`, `.travel-tool-archive`.
- `app/travel/components/TravelButton.tsx`: frame/legend fallback and source icon/label DOM. Retained candidate counterpart; no replacement creation toolbar.
- `app/travel/travel-photo-fields.tsx`: cover upload, scrapbook order, drag/earlier/later, photo caption/date, Use as cover (moves a photo out of gallery into cover). Candidate already migrated this source file.
- `app/travel/travel-image-upload.ts`: client-only draft/preview preparation; cloud upload/delete functions remain excluded.
- `app/globals.css`: original base journal/form/photo selectors (around lines 1196–1285), Fairy rules (1422–1434), Ice rules (1555–1564), mobile/reduced-motion rules (1698–1715), **final** semantic edit tokens/surfaces and photo grid overrides (1852 onward).
- `app/travel/components/TravelAtlasStage.tsx`, five theme config files: theme root class and optional ownerEditFrame. Local dialogs must inherit the stage theme even while fixed-positioned.
- `docs/travel/TRAVEL_ASSET_INVENTORY.md`: historic Fairy owner-edit frame entry and shared edit behavior; asset reference is not proof of effective current cascade or redistribution rights.
- `app/components/owner-edit-mode.tsx`: Owner login/session excluded. Its generic floating controls are explicitly not shown on `/travel`; the candidate's new floating local bar was not source-equivalent.

## Restoration constraints / source facts not to invent

The source has **no five distinct form React components**, no custom theme-specific delete-confirmation modal (it uses `window.confirm`), and no independent Journey-create click on Begin (it toggles Owner editing). The candidate needs password-free activation and a direct Journey-create entry requested in the prior local-edit task. Any minimal behavioral adaptation must be recorded rather than falsely described as byte-identical interaction.

`Open the Archive` originally navigates to the private app root; the candidate's current list/opening behavior is explicitly protected by the additional request. Only passive photo figures inside its opened list will be restored using original `travel-scrapbook-photo`, image, caption/portrait and grid rules. Do not replace navigation/list/close handlers with the original private root.

Original whole-app live visual baseline is **UNVERIFIED**: launching its development build would write into the protected checkout and requires its private framework/auth environment. No production auth, private seed/photos or source edits are used for screenshots. Source-only cascade/DOM comparisons and synthetic isolated candidate screenshots are distinct evidence, not a claim of original-runtime screenshot equivalence.

Approved exceptions retained: stage-centered title, Parchment-sized top labels, Fairy Tale top-label downward offset, visible inert creation buttons in public read-only mode. No Globe/Atlas renderer, Timeline or Postcard layout change is authorized.

## Button responsibilities — confirmed by user

- Begin a Journey / 开启旅程 only activates/deactivates local editing. It never opens or creates a record. Its source active and pressed states are retained.
- Mark a Place / 标记地点 opens the source log form. Its Entry Type selector chooses Location or Journey.
- Open the Archive / 翻阅档案 keeps its existing standalone behavior.

This supersedes any earlier provisional adaptation that opened a Journey on activation.

## Archive panel follow-up

User approved matching the Archive panel to the active theme’s editor. Removed the temporary warm-paper Archive-only shell overrides. Both panels now use the same original travel-journal, heading, overlay and close-button cascade; Archive list separators use the same semantic line token. Opening/closing, list actions and photo persistence remain unchanged.
