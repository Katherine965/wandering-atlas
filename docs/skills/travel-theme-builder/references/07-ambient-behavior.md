# Travel Ambient Behavior

English is normative. Chinese review copy: [zh-CN/07-ambient-behavior.md](zh-CN/07-ambient-behavior.md).

## 1. Scope

Ambient presentation is optional theme skin. It MUST NOT carry Travel product semantics, replace a missing structural asset, or become required to understand or operate the page.

Ambient presentation may be a passive effect or an isolated actor with its own presentational state.

## 2. Shared Constraints

- Ambient layers MUST be non-blocking, hidden from assistive technology, and use `pointer-events: none` where appropriate.
- Ambient content MUST NOT move, resize, obscure, or become the hit target for shared controls.
- Ambient state MUST remain separate from entries, markers, postcard, Timeline, locale, Owner Edit, persistence, API, and storage.
- Motion MUST respect `prefers-reduced-motion`; removal is an acceptable fallback.
- Timers, observers, RAF callbacks, and async routes MUST clean up on unmount.

## 3. Current Read-only Release

The five-theme candidate has no independent ambient actor component/frame set. Preserve these isolation/frame rules for separately authorized future decoration work; they do not request a new feature.

## 4. Asset and Architecture Rules

- Use one image per animation frame in an ordered typed array; do not replace the current sequence with a composite sprite sheet.
- Frame animation MUST remain separate from world movement and facing.
- Decorative waypoints MAY be measured from existing surfaces; they MUST NOT redefine those surfaces' geometry.
- Disconnected routes MAY use hide/reappear transitions.
- A future second ambient actor SHOULD use a reusable typed mount/configuration rather than another theme-ID branch.

## 5. Validation

Validate pointer pass-through, stacking, frame order, image loading, route bounds, resize behavior, hidden/visible transitions, CPU use, reduced motion, small-stage suppression, and cleanup. Ambient failure MUST leave the Travel interface fully usable.
