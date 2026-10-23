# Outstanding Public Release Gates

The application is a local release candidate, with a read-only public build and a separate local editor. It is not publicly published. P1 priorities below still block public distribution of the affected file while its rights are unresolved.

1. **Resolved — LICENSE public attribution.** Standard MIT text now credits `Copyright (c) 2026 Katherine965`. MIT covers project-owned original code; third-party components, data and theme bitmaps keep their own terms. This copyright credit does not clear pending image-reference rights.
2. **P1 — ASSETS.md reference exceptions.** All 59 theme bitmaps have Visual Review Passed, not full source-rights clearance and not 59 blanket HOLDs. Owner must identify actual external-reference/download exceptions (or confirm none). Add exact output paths, reference source, permission and decision to the manual table. Only actual unresolved exceptions become file-level HOLD/exclusions. Use the 59-file checklist in ASSETS.md, with the 11 FIRST-priority files reviewed before the remaining 48. FIRST is an evidence-review priority, not a file HOLD. Do not assume no reference exceptions. Change the reference review status only after completing this review.
3. **Resolved — public/data/travel-city-mapping.json.** All 99 coordinates regenerated from 95 Natural Earth and 4 GeoNames source records. Names/order/schema retained; city dropdown/autofill remains. Per-row evidence, retained source snapshots, full data terms and hashes are included. No old coordinates passed off as new-source data.
4. **Resolved for current source/static builds — maps and dependency attachments.** Three GeoJSON files match pinned Natural Earth sources and terms; 59 bitmap hashes are recorded. d3/Lucide combined notices, fflate/sharp and relevant transitive terms are retained. Build/export now include attachments; npm-installed sharp/libvips is not an LGPL blocker. Any future bundled native binaries require a separate platform-specific review.
5. **Other release review remains.** Browser/device visual and performance limits from the prior engineering audit, privacy/credential review of the actual package, and dependency updates need their own review. This license finishing task does not certify or alter UI quality.

`npm run check:release` verifies the compiled artifact and enforces the remaining reference gates and any unresolved city-source status. Normal local builds can pass while those publication gates remain. For a source release perform the same rights decisions and retain the attached license/evidence files; do not ship `.local/`, uploads, backups, node_modules or test artifacts. No Stranger Things/Rusty Lake asset directories belong in the first release.

No public GitHub repository, remote, push, deployment or production operation is authorized by creating this candidate. Detailed private source findings are not included.

## Private source backup

A private GitHub source backup to `Katherine965/wandering-atlas` is authorized. It is not a public release and does not clear asset reference review or any specific HOLD. Preserve all source and rights evidence; exclude private archives, uploaded photographs, credentials, build output and caches. Public visibility changes and deployment require a separate task.
