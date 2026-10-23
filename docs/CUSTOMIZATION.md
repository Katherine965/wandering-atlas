# Customize Local Travel Data

Use a text editor to change `data/sample-travel.json`, then rebuild. This is manual source customization, not webpage editing. `listEntries()` and `getEntry(id)` only read normalized records.

Each entry has a unique `id`, `type` (journey/location), `city`, `country`, optional `region`, `coordinates` ({ latitude, longitude } or null), `memory`, `tags`, `coverImage` and `photos`. Temporal fields `startYear/startMonth/endYear/endMonth` and rating are optional. Preserve coordinates for visible markers; country naming must match shared geography for country-scoped filtering.

Photo objects retain `id/src/storageKey/width/height`, caption/order and optional year/month/featured. `storageKey` is a compatibility identifier here, not an R2 capability. Put approved local images under `public/images/sample/`, refer to them with `/images/sample/...`, and give correct dimensions. The portrait sample demonstrates original postcard portrait behavior. Sample SVGs are newly authored geometric placeholders; all sample records are fictional.

Do not copy private photos, GPS/EXIF, real notes or remote credential URLs. Verify rights/metadata before sharing replacement imagery. No download service, login, photo-upload endpoint or filesystem-write permission is implemented.

For future theme work, use `docs/skills/travel-theme-builder/SKILL.md`; keep shared projection, state, filtering and interaction intact.
