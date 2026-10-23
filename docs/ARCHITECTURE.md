# Read-only Architecture

`index.html` → `app/main.tsx` → `app/travel/page.tsx`. Vite/React provide a client-side shell. A small native-image adapter at `app/components/Image.tsx` preserves existing fill geometry without a framework image-service dependency.

`travel-data-source.ts` exposes only `listEntries()` and `getEntry(id)` from local JSON, retaining display normalization in `travel-storage.ts`. No mutation or remote storage client is present.

Travel page retains shared state/filters/country focus. Atlas uses d3-geo/equirectangular geometry, Globe uses orthographic projection and renderer-local rotation, markers share geographic inputs. Copper/felt Three.js surfaces retain material, texture, relief/fiber, readiness/fallback and disposal behavior. Timeline, postcard and gallery/lightbox retain original presentation and interaction. Only editing/auth/root navigation and out-of-scope theme branches were removed.

Three local Natural Earth GeoJSON inputs are fetched; city editing lookup is unnecessary and excluded. Country choice is geographic selection/focus; Region/City are display fields, not editing controls.

CSS extraction preserved declaration values and source ordering for retained Travel selectors, common resets and animation rules; unrelated modules, edit controls and excluded-theme rules were filtered. The removed editing toolbar space is not redesigned.

`scripts/read-only.ts` denies API/upload paths before content serving; Vite dev/preview and the included built static server use it. No environment configuration can register writes. Production hosting must preserve the no-backend boundary.

The project owns its package manifest, lockfile and installed dependencies. No original source/hidden config/symlink is required.
