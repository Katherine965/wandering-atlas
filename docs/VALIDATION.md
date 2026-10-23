# Validation Evidence — Local Read-only Candidate

Date: **2026-10-16**. This report records executed checks, not permission to publish. PASS is scoped to the evidence below; unresolved acceptance gates remain UNVERIFIED/BLOCKED.

## Scope and source protection

- **PASS:** protected source HEAD, full tracked/non-ignored untracked inventory, Git status and SHA-256 of **403 files** match the pre-extraction snapshot. Existing source audit/Skill edits remain unchanged. No original application/configuration/assets/history were edited.
- **PASS:** independent sibling candidate; **114 source-derived files: 79 byte-identical copies, 35 adapted files**, recorded in `EXTRACTION_MANIFEST.csv`. Filename-only sanitization preserves image bytes and is counted as a copy with a distinct reason. New standalone files/notices are separately inventoried in `GENERATED_FILES.csv`.
- **PASS:** all **58 active theme images** retain their source hashes: Ice 14, Deep Sea 15, Cyber 3, Fairy-tale 13, Parchment 13. Deep Sea download-derived names/references are sanitized; original credential-shaped filenames are withheld from public records.
- **PASS:** copied public files match none of the original private Travel image hashes. Four synthetic entries and four newly authored local geometric SVG placeholders replace private Travel content. This hash comparison does not alone establish the privacy/rights of unrelated images.
- **PASS:** no release-tree symlinks, absolute source imports, original local package dependencies, original environment files, source history or private audit documents are required/copied. Dependency-internal executable symlinks in ignored `node_modules` are not source links.
- **PASS:** original Three.js copper/felt surface files are byte-identical. A PostCSS comparison found **1,205 retained individual-selector/declaration occurrences, zero changed declaration sets**. Grouped selectors were compared individually; this is CSS preservation evidence, not pixel-equivalence proof.

## Independently executed build/tool checks

Executed from the standalone directory using its own manifest, lockfile and dependencies:

| Check | Result | Evidence / limits |
| --- | --- | --- |
| `npm ci --no-audit --no-fund` | PASS | Clean reinstall into candidate; no source dependency directory needed |
| `npm run typecheck` | PASS | TypeScript |
| `npm run lint` | PASS | ESLint |
| `npm test` | PASS — 6/6 | JSON isolation, placeholder paths, Timeline filtering/undated Location, five-theme registry/renderer presence, local asset resolution, runtime mutation denial |
| `npm run build` | PASS | Vite 8.3.4; JS 858.55 kB / gzip 232.02 kB; CSS 180.77 kB / gzip 35.01 kB |
| `npm audit --json` | PASS — 0 known vulnerabilities | Registry advisory result at this check, not a permanent security guarantee |
| `npm run scan` | PASS — no heuristic findings | Source plus emitted build; final staged review is separate below |
| `npm run test:browser` | PASS — 6/6, 0 skipped/flaky | Five theme scenarios plus production HTTP denial; approximately 6.9 minutes |

The initial standalone Vite version produced a high dependency advisory; the candidate alone was updated to 8.3.4 and reinstalled/rebuilt/audited. ESLint installation emitted a deprecation warning, recorded as a tooling follow-up rather than hidden or treated as a failed lint check. The build retains a >500 kB chunk warning; no visual redesign/broad optimization was performed. Public assets total **109,664,511 bytes**; transfer/decoding performance has not been profiled on real mobile devices.

## Browser functional matrix

Installed Google Chrome via Playwright, headless, SwiftShader software rendering; desktop **1440 × 1000**, mobile viewport **390 × 844**. These are Chrome viewport checks, not Safari, iOS or actual Android-device certification.

| Theme | Atlas / country / markers | Timeline / postcard / gallery | Globe / switches / keyboard / mobile |
| --- | --- | --- | --- |
| `ice-world` | PASS | PASS | PASS |
| `deep-sea` | PASS | PASS | PASS |
| `cyber` | PASS | PASS | PASS |
| `fairy-tale` | PASS | PASS | PASS; felt final-stage canvas, positive fiber count |
| `parchment` | PASS | PASS | PASS; copper surface canvas |

Each theme scenario executed: theme selection; keyboard country selection and France exploration/back; Journey and Location marker/postcard selection; gallery opening, ArrowRight and Escape; scrapbook Details; Timeline next/previous year and all/year modes; Globe view and pointer drag; reduced-motion setting; returning to Atlas; English/Chinese switching; mobile Atlas/Globe switches. There were no captured page errors, former API requests or active Owner/upload/edit controls. Copper/felt canvases disappear when leaving Globe (DOM cleanup); GPU disposal correctness is not proven solely by DOM removal.

**Mobile layout caveat:** inherited styles keep a 760-pixel stage below 500-pixel viewport widths and horizontal scrolling. Small-viewport controls/rendering were exercised; complete unclipped layouts, touch/scroll ergonomics and actual-device acceptance are **UNVERIFIED**. No mobile layout redesign was introduced.

## Read-only HTTP enforcement

- **PASS:** Vite dev and preview each start with credential-related environment variables removed; each rejects **25 former route/method combinations with 404**, and root POST with **405**.
- **PASS:** standalone production server starts without Owner/Cloudflare configuration and serves the application. Browser suite checks **20 former route/method combinations → 404**, root POST → **405**.
- **PASS:** isolated boundary unit test checks **30 former API/upload route/method combinations → 404**, four root mutation methods → **405**, GET root → **200**, and **zero downstream effects**.
- No Owner session/auth, mutation route, upload/Quick Upload page, D1/R2 client, browser JSON persistence or local webpage editing is implemented. Preference-only theme/locale/view state is not Travel-record persistence. Hosting must not attach a separate mutation backend.

## Privacy / credential evidence and limits

- Bounded scanner checks filenames, credential/download metadata shapes, known token/hash/key forms, Owner bindings, private absolute paths, Cloudflare imports, resource-ID patterns, excluded directories and symlinks. Findings are redacted; no discovered credential was used or validated externally.
- Source/emitted-output scan: **no findings**, 109 text files scanned, 120 binaries not content-scanned at the final pre-Git run. Counts may grow as evidence documents are updated.
- Additional active-image inventory: **58 source-byte-preserved images, zero EXIF blocks, zero PNG text/XMP metadata blocks** using PNG chunk/JPEG marker inspection. This is not arbitrary binary or third-party metadata clearance.
- `gitleaks`, `trufflehog` and `exiftool` were not installed. Scans are **bounded heuristics**, not proof that every possible secret, private identifier, embedded binary string, dependency or license issue has been detected. Ignored dependencies, browser artifacts and Git objects are outside the ordinary tree scan; the initial staged snapshot is separately scanned before commit.
- **Public release BLOCKED** pending robust staged/source/build review and owner privacy/credential approval. No unresolved credential/private-content finding is known in the intended local snapshot.

## Extraction defects encountered and corrected

1. Built-server root initially returned 403 because its containment check mishandled the directory root; fixed in the candidate, production root and HTTP denial checks rerun.
2. Initial CSS allowlist omitted shared `.parchment-button` styles and hid text labels; restored the original declarations and reran browser checks/CSS comparison.
3. Screenshot-heavy automation timed out (notably Ice mobile) and a Deep Sea run was interrupted. Screenshots are now optional via `ATLAS_CAPTURE=1`; the successful full functional run did not depend on captures. Earlier screenshots are exploratory, not complete matched-baseline evidence.
4. The first staged whitespace check found extraction-created blank-line whitespace and CRLF in new CSVs; normalized these adapted/generated text files without changing rendering or source assets.
5. Supplemental screenshot capture initially waited on offscreen lazy images and was interrupted; immediate capture could also precede paint/decode. Final captures wait only for visible image loading/decoding and settled browser paint. No application change was made to obtain a screenshot.

## Visual / performance acceptance gates

- **PASS (capture only):** five standalone desktop Atlas frames captured at 1440 × 1000, reduced motion, local synthetic content, after visible-image decode; retained locally under ignored `artifacts/visual-review/`. These are same-viewport standalone review frames, not matched original comparisons. Exploratory desktop/mobile frames and functional-run JSON are local-only artifacts and not staged.

- **UNVERIFIED:** matched original-versus-candidate captures at identical viewports, theme/locale/selection and fixed Globe camera. Original source was not started or modified merely to obtain a baseline. Standalone captures are not comparison proof.
- **UNVERIFIED:** real Safari/iOS Safari, Android/mobile Chrome touch testing, native-GPU fidelity/smoothness, FPS, image-loading/large-transfer profiling, repeated theme switching and long-run memory/context-loss recovery. Existing renderer cleanup logic is preserved, but resource lifetime has not been measured.
- **BLOCKED:** intended application-code license/contributor rights, each active image's original/reference/third-party provenance, exact geographic source/conversion lineage and final distribution notices review. General owner confirmation of OpenAI art is recorded without inventing per-file rights.

## Skills

**PASS:** three normative Skill YAML name/description entries; **46 relative Markdown links** resolve; **nine English/Chinese numbered-section and table-structure pairs** match. Standalone paths/read-only boundary were migrated; Owner Auth explicitly does not exist and its implementation checklist is future-only. Translation structure checks do not substitute for exhaustive semantic translation review.

## Fresh local Git snapshot

**PASS:** fresh repository initialized only after candidate sanitization, tree scan and functional/build validation. Reviewed all **157 staged files**, exactly 114 allowlisted source-derived files plus 43 inventoried standalone files/notices. The staged scan covered **99 text files**, with **58 image binaries** separately byte/metadata/hash reviewed; no heuristic findings. `git diff --cached --check` passes after the harmless whitespace correction. Ignored dependencies/builds/browser artifacts/private environment patterns are not staged. There was no pre-existing commit history and no remote.

**BLOCKED — local initial commit not created:** the reviewed commit attempt failed because this new repository has no author name/email configured. No source-local identity was copied and no global Git identity was changed. All 157 reviewed files remain staged in an independent repository with zero commits. The owner must provide the intended author identity before retrying the local commit. No remote, public repository, push, deployment or production change is authorized. Rights/visual/robust-public-release review blockers remain in place even when a local sanitized snapshot is committed.

See `RELEASE_BLOCKERS.md` for the outstanding gates. This candidate is locally runnable; it is **not approved for public GitHub publication**.

## Display-only explorer controls follow-up

At the owner's explicit request, the original three explorer buttons were restored visually using the existing `TravelButton`, original toolbar classes/frame choices/icons, bilingual labels and retained original CSS. `aria-disabled`, `tabIndex=-1` and an unavailable tooltip mark these as display-only without dimming/redesigning their original appearance. No handlers, Owner state, editor, upload or archive navigation were restored. The earlier absence-of-controls assertion now verifies that all three controls are disabled instead. This changes the earlier UI-removal decision, not the runtime read-only boundary.

Follow-up checks executed: TypeScript PASS, lint PASS, unit/runtime tests 6/6 PASS, production build PASS, and the new five-theme display-only toolbar browser test 1/1 PASS (43.2 seconds). It verifies all three controls are accessibility-disabled, out of tab order, have no effect when click events are dispatched, preserve the current page/theme, and make no API/mutation requests; Chinese labels also pass. The earlier full five-theme interaction suite was not rerun after this presentation-only follow-up. Source snapshot, 58 image hashes and 1,205 original CSS declaration occurrences still match. Source/build and staged scans are rerun after updating this evidence.
