# T036 — Tuku movement fixes and edge-bump rule

**Status:** REVIEW — implementation complete; director/device acceptance pending  
**Authorization:** Direct owner instruction on 2026-11-03: "fix the tuku character phase by phase, re swiping (if the character is in the right side and the user swipes right then user should feel like it bumped to the place the tuku cant go and lakhe comes a bit closer and if user does it again lakhe catches and game is over)". Owner choices on 2026-11-03: a second bump catches only **while Lakhey is still close** from the first bump; dive roll keeps the full roll with Tuku **lifted** above the road.  
**Dependencies:** T035 audit (`reports/T035_RESULT.md`).

## Phases

1. M1 — frame-rate-independent lane spring (exact critically damped step); frame-rate-independent bank smoothing; camera shake normalized by its own duration (M7).
2. M2 — dive-roll slide rotates around the body centre so Tuku stays above the road. M3 — mid-air slide drops over a short slam instead of teleporting. M4 — slide camera offset eased.
3. M5 — buffered jump fires jump feedback and picks a style. M9 — held lane/slide keys do not auto-repeat. M6 — extra collision samples when one frame moves Tuku further than an obstacle's depth.
4. Edge bump — swiping toward a side Tuku cannot go: visible bump, thud, warning, Lakhey surges closer (2.2 m). A second edge bump before Lakhey has drifted back to normal follow distance triggers the normal friendly catch and game over.

## Exclusions

No touch multi-swipe re-anchoring (M8), stride-bounce change (M10), speed/jump/spacing retuning, new art/audio assets, deployment. Hitboxes and obstacle rules unchanged except the edge-bump catch.

## Acceptance criteria

- Lane change settles without overshoot at 24/30/60/120 fps.
- No Tuku mesh below the road during any slide style.
- Edge bump behaves as specified; held keys cannot cause accidental double bumps.
- Build, `test:ui`, `test-polish` and a new movement regression script pass.
