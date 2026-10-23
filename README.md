# Wandering Atlas

A read-only travel atlas with five existing visual themes, an interactive Atlas and Globe, Journey/Location markers, Timeline, postcards, gallery and lightbox. The initial dataset is fictional; the local sample images are original vector placeholders, not real travel photographs.

**Local release candidate — not publicly published.** Original code uses [MIT](LICENSE); copyright credits Katherine965. [ASSETS.md](ASSETS.md) separates the 59 visually reviewed theme bitmaps from reference-image rights, and [third-party notices](THIRD_PARTY_NOTICES.md) retain external terms. Image-reference exception review remains a public release gate; city coordinates now have verified per-record sources; see [release blockers](docs/RELEASE_BLOCKERS.md).

## Run locally

Use Node.js 22.13 or newer and npm. From this directory:

```sh
npm ci
npm run dev
```

Open the address printed by Vite (default local port 5174). Production build and local read-only server:

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

The built server defaults to local port 4174. `npm run preview` is also available. No environment file, password, Cloudflare account, D1/R2, private package or original source directory is needed. Both Vite servers and the built server reject former API/upload paths and non-read methods. The built files are a client-side application; hosting must not attach a mutation backend.

## Five themes

- Snow / Ice — `ice-world`
- Deep Sea — `deep-sea`
- Cyber — `cyber`
- Fairy-tale — `fairy-tale` (existing Three.js felt Globe)
- Parchment — `parchment` (existing Three.js copper Globe)

Use **Change Atlas** to choose a theme; selection is a browser preference, not an edit to project files. The EN/中文 controls preserve the bilingual interface. Other source themes and experimental entries are not shipped.

## Customize

Edit `data/sample-travel.json` in a text editor and rebuild; [CUSTOMIZATION](docs/CUSTOMIZATION.md) explains compatible fields and local image paths. Replace sample placeholders only with images you have permission to redistribute; never include private photos by accident. Themes use the shared geographic/selection/Timeline/postcard core; their asset files and presentation configuration are preserved rather than regenerated.

## Local editing and public boundary

The default dev/build/server remains read-only. `npm run dev:local` starts the independent editor on local port 5175: Begin a Journey enables editing, Mark a Place opens the Journey/Location form, and Open the Archive retains browsing with record editing controls. Local records, uploaded images and backups live under ignored `.local/archive/`, separate from the synthetic public demo. No Cloudflare owner login, D1 or R2 is required.

An explicit public archive export is a separate opt-in command; it requires consent to share all selected archive content. License attachments are copied into local build/export output. Automatic backup restore/import is not implemented; retain the complete private archive and image files. Neither local editing nor a successful build authorizes publication of unresolved-source data or photos.

## License and release verification

`npm run build` includes the license texts and provenance documents in dist and checks their integrity. Run `npm run check:release` before sharing dist (or pass `-- --dist <artifact-directory>`). This additional gate currently fails for pending reference exception review. It performs no publication or deployment. Preserve LICENSE, ASSETS.md, THIRD_PARTY_NOTICES.md and licenses/ in distributed packages; source installations and future native-binary bundles have different obligations.

## Documentation and reusable Skills

- [Architecture](docs/ARCHITECTURE.md), [themes](docs/THEMES.md), [security](docs/SECURITY.md).
- [Validation evidence](docs/VALIDATION.md), [extraction manifest](docs/EXTRACTION_MANIFEST.csv), [asset provenance](docs/ASSET_PROVENANCE.csv).
- Three Skills under `docs/skills/`: theme builder (with Chinese references), Owner security review (future auth review only), and open-source release review.
- [MIT code license](LICENSE), [asset permissions/references](ASSETS.md), [third-party notices](THIRD_PARTY_NOTICES.md), [data sources](docs/DATA_SOURCES.json), [city-data review](docs/CITY_DATA_REVIEW.md).

## Optional browser regression checks

`npm run test:browser` uses installed Google Chrome through Playwright, exercises all five themes without screenshots by default. Optional `ATLAS_CAPTURE=1 npm run test:browser` captures ignored viewport screenshots under `artifacts/`; expensive rendering can cause screenshot timeouts. These are standalone captures, not matched original-versus-candidate equivalence proof. This browser requirement applies only to browser tests, not running/building the app. Chrome software-rendering tests do not certify Safari/iOS or real-device GPU performance.
