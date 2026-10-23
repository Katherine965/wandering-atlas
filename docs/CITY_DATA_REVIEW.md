# City coordinate replacement — resolved source rights

All 99 coordinates in `public/data/travel-city-mapping.json` were regenerated from verified external data. The old coordinates, whose underlying source was unknown, were not used as source data. The old file hash remains in DATA_SOURCES.json only as replacement history.

## Preserved schema and behavior

`schema_version: 1`, string `description`, 28 `countries[]` with `name` and `cities[]`, each containing only `name`, `latitude` and `longitude`. All 99 display names, country grouping and ordering remain identical to the old file. Local editor city selection and coordinate autofill continue through the same fetch/schema; no UI code changed. Coordinates now represent the selected source points, so numeric positions may differ from the old lookup. Existing saved records are not migrated or changed.

## Sources and per-record evidence

95 coordinates come from Natural Earth 10m populated places 5.1.2 at revision `ca96624a56bd078437bca8184e78163e5039ad19`, SHA-256 `9b8e3de09048ef00dfc70357dbb9fa324493f214b5e0ae4daf1aa79a8d10116b`. The audit downloaded and verified that complete upstream file. Source LATITUDE/LONGITUDE fields are copied without approximating from the previous mapping. The official Natural Earth terms allow redistribution/modification of its vector data in the public domain.

Four coordinates come from GeoNames official country extracts downloaded 2026-10-23. Its official dump readme explicitly licenses the data under CC BY 4.0; the readme and full Creative Commons legal code are retained under licenses/. GeoNames attribution, the license link and the extraction/regrouping changes are recorded in THIRD_PARTY_NOTICES.md and in the generated JSON description.

| Display option | GeoNames ID | Source record | Feature / selection |
| --- | --- | --- | --- |
| Iceland / Vik | 2625252 | Vík í Mýrdal | P/PPL populated place; short display label retained |
| Switzerland / Interlaken | 2660253 | Interlaken | P/PPLA2 town; not the administrative municipality |
| Greece / Santorini | 252919 | Santorini Island | T/ISL island reference point; not Fira city |
| Turkey / Cappadocia | 322954 | Cappadocia | L/RGNH historical region reference point; not the administrative province or a hotel |

Santorini/Cappadocia remain region/island options, as in the existing mapping; their coordinates are gazetteer reference points rather than precise city centers. Hong Kong's existing grouping under China is preserved while its original Natural Earth Hong Kong S.A.R./sovereign China metadata remains in evidence. Fes retains the UI spelling while matching source Fez.

`docs/CITY_COORDINATE_SOURCES.csv` has all 99 country/city rows, exact coordinates, source feature IDs/names/countries, license, original dataset URL/hash and selection notes. `docs/data/city-source-snapshot.json` retains the 95 complete original Natural Earth features and four original GeoNames TSV rows, record hashes and archive/extracted-file hashes. These are selected source snapshots, not full downloaded datasets; live GeoNames URLs can change. DATA_SOURCES.json pins the retained snapshot, row-evidence and generated JSON hashes.

## Reproduce and verify

```sh
python3 scripts/generate-city-mapping.py --check
# Only when deliberately regenerating from reviewed source records:
python3 scripts/generate-city-mapping.py --write
```

Python 3.9+ is required only for this maintenance command; the app still needs only Node/npm. Generation reads the retained source snapshot, not the old coordinate file. After a future source change, update DATA_SOURCES.json and manifests, verify all names/order and coordinate semantics, then run tests/typecheck/build and the release check. Node tests separately check source-record agreement and evidence hashes.

The prior failed large-download/Wikidata attempts did not supply any coordinates. This change succeeded using complete, verified official country extracts. The current city-data licensing HOLD is resolved; the remaining attribution placeholder and image-reference review are separate publication decisions.
