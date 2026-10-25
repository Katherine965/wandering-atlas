# Third-party notices and distribution scope

The standard MIT text in LICENSE covers project-owned original code and the four original geometric sample SVGs. Third-party packages, fonts, data and vendored files retain their own terms. Theme bitmaps have separate, qualified permissions and the owner's v1.0 reference review declaration in ASSETS.md. MIT does not license private uploads or third-party inputs. The public copyright attribution in LICENSE is Katherine965.

## Runtime, font and vendored components

Versions refer to the current package-lock.json. The complete upstream texts listed below are retained without rewriting under licenses/; retain the full texts, including additional copyright sections, when redistributing the corresponding code or fonts.

| Component | Current version | Applicable terms / retained text |
| --- | --- | --- |
| React / React DOM | 19.2.6 | MIT; react-LICENSE.txt, react-dom-LICENSE.txt |
| scheduler (React DOM dependency) | See lockfile | MIT; scheduler-LICENSE.txt |
| Three.js | 0.186.1 | MIT; three-LICENSE.txt |
| d3-geo | 3.1.1 | ISC plus the GeographicLib / Charles Karney MIT section in d3-geo-LICENSE.txt; retain both |
| d3-array / internmap | See lockfile | ISC; d3-array-LICENSE.txt, internmap-LICENSE.txt |
| Lucide React | 1.31.0 | ISC plus MIT for Feather-derived material; retain both sections of lucide-react-LICENSE.txt |
| fflate | 0.8.3 | MIT; fflate-LICENSE.txt |
| tw-animate-css | 1.4.0 | MIT; tw-animate-css-LICENSE.txt |
| Instrument Serif / @fontsource/instrument-serif | 5.3.0 | Instrument Serif Project Authors; SIL OFL 1.1; fontsource-instrument-serif-LICENSE.txt |
| Tailwind CSS | 4.2.1 | MIT; tailwindcss-LICENSE.txt (generated CSS attribution retained) |
| Vendored shadcn Tailwind CSS | 4.13.0 vendor file | MIT; vendor/shadcn-tailwind-4.13.0.LICENSE.md, copied as licenses/shadcn-tailwind-LICENSE.md for compiled packages |
| sharp (local Node image processing) | 0.35.5 | Apache 2.0; sharp-LICENSE.txt; native dependencies have distinct terms below |
| @img/colour, detect-libc, semver (sharp dependencies) | See lockfile | MIT / Apache 2.0 / ISC respectively; img-colour-LICENSE.txt, detect-libc-LICENSE.txt, semver-LICENSE.txt |

Instrument Serif originates from the Instrument Serif project distributed through Google Fonts and Fontsource. The current build emits unchanged latin and latin-ext, weight 400 normal WOFF/WOFF2 files. Preserve OFL copyright/license text with the fonts; do not sell a font by itself, relicense it as MIT, or violate reserved font name conditions when modifying it. OFL does not relicense the application. System-font fallbacks are not bundled font assets.

Upstream projects: https://github.com/facebook/react, https://github.com/mrdoob/three.js, https://github.com/d3/d3-geo, https://github.com/d3/d3-array, https://github.com/mbostock/internmap, https://github.com/lucide-icons/lucide, https://github.com/101arrowz/fflate, https://github.com/Wombosvideo/tw-animate-css, https://github.com/fontsource/fontsource, https://github.com/Instrument/instrument-serif, https://github.com/tailwindlabs/tailwindcss, https://github.com/shadcn-ui/ui, https://github.com/lovell/sharp.

## Verified geographic data

Made with Natural Earth. The three shipped GeoJSON files exactly match the Natural Earth maintainer repository at revision `ca96624a56bd078437bca8184e78163e5039ad19`:

| Local file | Upstream file (geojson/) | Version | SHA-256 |
| --- | --- | --- | --- |
| public/data/travel-world-countries-50m.geojson | ne_50m_admin_0_countries.geojson | 5.1.1 | 3e458fc036ad0a66411f2c1e6cac49c5d7bfb81cb1123bc513b22511a2b7fdeb |
| public/data/travel-world-landmass-50m.geojson | ne_50m_land.geojson | 4.1.0 | e874b27a51d146452be360cafb3cc50c86001074a67d534113e6534682f9826b |
| public/data/travel-country-detail-10m.geojson | ne_10m_admin_0_countries.geojson | 5.1.1 | 239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255 |

Natural Earth's official [terms](https://www.naturalearthdata.com/about/terms-of-use/) place all its vector/raster datasets in the public domain and allow modification and redistribution, including commercially, without mandatory attribution. The statement and its accuracy disclaimers are retained in licenses/natural-earth-TERMS.txt. Full pinned URLs and hashes are in docs/DATA_SOURCES.json. These verified terms do not clear the city mapping or any bitmap globe texture. No OpenStreetMap source was established for the shipped data; no ODbL attribution is invented.

## Source-backed city suggestions

`public/data/travel-city-mapping.json` now contains 99 fully regenerated coordinates: 95 from Natural Earth 10m populated places 5.1.2 (Public Domain) and four from **GeoNames**, https://www.geonames.org/ (**CC BY 4.0**, https://creativecommons.org/licenses/by/4.0/). GeoNames official extracts: https://download.geonames.org/export/dump/IS.zip, CH.zip, GR.zip and TR.zip. Each complete URL, download hash and original feature ID is retained in docs/CITY_COORDINATE_SOURCES.csv and docs/data/city-source-snapshot.json.

Attribution: **Contains geographical data from GeoNames, licensed under Creative Commons Attribution 4.0 International.** Changes: selected source records and latitude/longitude fields were extracted and regrouped into the Wandering Atlas schema; existing UI names/order were retained. Santorini is an island reference point and Cappadocia a historical-region reference point. No endorsement by GeoNames or Natural Earth is implied. Retain this credit, source/license links and change notice with the data; apply CC BY 4.0 to GeoNames-derived data, not the project's MIT code. Data is provided as-is; no accuracy guarantee is made.

The official [GeoNames dump readme](https://download.geonames.org/export/dump/readme.txt) and full CC BY 4.0 legal code are retained at licenses/geonames-README.txt and licenses/CC-BY-4.0.html. The old unknown-source coordinates were not used. Reproduction and selection details are in docs/CITY_DATA_REVIEW.md; generated JSON, row evidence and retained source snapshot hashes are in docs/DATA_SOURCES.json.

## Source installation versus native binary redistribution

The current source repository excludes node_modules, and the browser dist package contains no sharp/libvips `.node`, `.dylib`, `.dll`, `.so` or `.wasm` binaries. Users obtain official platform dependencies through `npm ci`. This installation model does **not** make LGPL a blocker to licensing project-owned code under MIT and does not require removing sharp or changing application code. Processing an image with sharp does not itself apply LGPL to the resulting image.

If a later installer, container, server bundle, npm tarball or Release actually redistributes prebuilt sharp/libvips binaries, review its exact platform/version and all bundled native libraries. libvips and some dependencies use LGPL-3.0-or-later; other libraries have their own permissive, patent or Mozilla terms. Preserve the applicable notices/licenses and satisfy any corresponding-source and user replacement/relinking obligations for that distribution. An installed macOS package's license list is not universal proof for Windows, Linux or wasm binaries.

Official references reviewed: [sharp v0.35.5 LICENSE](https://github.com/lovell/sharp/blob/v0.35.5/LICENSE), [sharp-libvips THIRD-PARTY-NOTICES](https://github.com/lovell/sharp-libvips/blob/main/THIRD-PARTY-NOTICES.md), and the installed `@img/sharp-libvips-*` README licensing table. A reference snapshot of the official THIRD-PARTY-NOTICES is retained at licenses/sharp-libvips-THIRD-PARTY-NOTICES.md; it does not replace platform-specific obligations when binaries are bundled. The static release check rejects unexpected native binaries so a future binary package cannot silently inherit this browser-only assessment.

## Development tools

The source uses @playwright/test, TypeScript, Vite, @vitejs/plugin-react, ESLint, typescript-eslint, PostCSS, Tailwind's PostCSS integration, and the @types packages for d3-geo, GeoJSON, Node, React, React DOM and Three. Playwright/TypeScript use Apache 2.0; the other direct tooling is MIT. Transitive tools include Lightning CSS (MPL 2.0). Merely installing/running a build tool does not apply its license to the application output. If distributing tools or their binaries, retain their actual package LICENSE/NOTICE files and review that artifact separately; browser dist does not include these tools.

docs/DEPENDENCY_LICENSES.csv records all current lockfile package entries and installed/lockfile license metadata, including optional platform packages. It is an inventory, not a substitute for the full terms or a blanket certification of future bundled dependency distributions. Re-review it on dependency updates.

## Build and release checks

`npm run build` now copies LICENSE, ASSETS.md, this notice, licenses/ and the data/asset evidence documents into dist, then verifies attachment bytes, shipped data/asset hashes, the five-theme scope and absence of native binaries. Explicit local archive export uses the same attachment mechanism; uploaded photographs still require separate consent and rights review.

`npm run check:release -- --dist <artifact-directory>` adds publication gates. It fails while unresolved city-source status or asset-reference review is unresolved. Passing attachment checks alone is not permission to publish. Follow docs/RELEASE_BLOCKERS.md, review privacy/contributor rights and preserve all attached terms in the actual source/compiled package. No command in this mechanism uploads, deploys or creates a release.
