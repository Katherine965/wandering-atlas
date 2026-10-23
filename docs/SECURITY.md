# Read-only Security Boundary

No Owner/login/session/reset endpoints, Travel mutations, photo upload, Quick Upload, D1/R2 clients or credential bindings exist. Local JSON and images are public display content. There are no passwords or required environment variables.

The provided dev, preview and production-local server apply the same early guard: all `/api` paths and `/travel/upload` are 404; non-GET/HEAD requests elsewhere are 405. No mutation callback runs. Tests exercise direct HTTP requests including synthetic cookie/origin headers. A static hosting platform must not attach old APIs, proxy credentials or enable filesystem writes.

Theme preferences are browser storage, not project-file writes or authentication. Manual JSON edits require source-file access outside the webpage.

`npm run scan` scans distributable source/build filenames/text with redacted heuristic checks and verifies local sample/asset references. It is not a comprehensive provider-token detector or rights clearance. Robust credential/advisory review remains a pre-publication gate. Do not publish personal data or credentials in issue reports.

Future auth/storage/editing must be separately designed and approved; `owner-security-review` documents those future review requirements, not an existing feature. No private security audit is distributed.
