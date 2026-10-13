# QA, playtesting and release gates

## What counts as 'good'

It starts quickly, plays well on a real phone, feels fair, visibly reflects the festival's atmosphere, shows a correct score, and resets in one action. Passing unit tests alone is insufficient.

## Minimum hands-on browser matrix — proposed

| Platform | Browser | Required observations |
|---|---|---|
| Desktop | Chrome / Edge | Keyboard, resize, FPS, restart, audio |
| Desktop | Firefox | Startup, movement, WebGL, retry |
| Android midrange | Chrome | Touch swipe/jump, readability, FPS, heat, reload |
| iPhone | Safari | Touch behavior, audio gesture, safe-area, FPS, resize |

If these exact devices aren't available, report the gap; do not claim tested coverage. Actual supported browser versions and target phone will be set after T001.

## Gameplay acceptance

- [ ] All control inputs deterministic and explained on first use.
- [ ] Reachable safe path in generated obstacle sequences.
- [ ] Jump and lane-change hitboxes feel fair; no obvious unavoidable failures.
- [ ] Score resets on retry, and highest score persists locally if storage available.
- [ ] Repeated retries do not double listeners, spawn duplicate objects or leak resources.
- [ ] Background/resume behavior is deliberate and understandable.
- [ ] All UI is legible, touch targets reachable, and mute works.
- [ ] Lakhey catch is nonviolent and follows approved fiction.

## Art/audio acceptance

- [ ] Tuku rear-view silhouette readable on mobile.
- [ ] Environment tiling and collision volumes align; no clipping or bad seams.
- [ ] Third-party models/music/textures have documented licenses and attributions.
- [ ] Culturally sensitive character/story depictions reviewed by informed stakeholders before public launch.

## Technical acceptance

- [ ] Production build succeeds and runs over HTTPS.
- [ ] Budget measurements logged, not estimated; numeric targets only after device test.
- [ ] Browser reload/offline errors display useful states.
- [ ] No secrets or server credentials shipped to browser.
- [ ] Cache/versioning and rollback verified on hosting target.
- [ ] Public page has game instructions and suitable privacy/credits information if needed.

## Release flow

1. Internal desktop/phone test.
2. Director gameplay/art approval.
3. Cultural and licensing review, record sign-offs/concerns.
4. Staging deployment with explicit authorization.
5. Browser/asset performance pass, fix blockers.
6. Production publication approved by director, with rollback plan.

**Do not deploy publicly merely because a technical task was completed.**
