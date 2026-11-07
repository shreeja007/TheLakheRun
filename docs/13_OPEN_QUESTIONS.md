# Open questions — director review queue

All unanswered points stay **proposed**; do not let Codex decide them without approval.

*Status note, 2026-11-07:* several questions below were written before the game existed. "Built as" notes describe what the current game does; they are not recorded decisions. Only `10_DECISIONS.md` records approval.

## Highest priority (M0, before core gameplay)

- [ ] **Q01:** Mobile view: portrait-first (recommended for runner) or landscape? Desktop framing rules? *Built as: both orientations work, portrait-first layout.*
- [ ] **Q02:** Confirm first control mapping and touch gestures. *Built as: swipes, on-screen buttons and keyboard.*
- [ ] **Q03:** Confirm initial hazard shapes: one jumpable and one lane-avoid obstacle; set minimum reaction window for playtesting. *Built as: nine hazard types; at least 1.0 s between rows (T037).*
- [ ] **Q04:** Select at least one representative Android device (plus iPhone test access if available), and record device/browser versions. *Owner's Android phone used for D-016; model not recorded; iPhone untested.*
- [x] **Q05:** Authorize T001 engine feasibility experiment and require evidence rather than a polished game. *Done; T001 accepted in D-016.*

## Next: characters / story / art

- [ ] **Q06:** Approve Tuku v0.2 costume and silhouette for concept-sheet exploration (not immediate polished modeling).
- [ ] **Q07:** Keep nickname 'Tuku' or choose a culturally reviewed alternative; no invented meaning claims.
- [ ] **Q08:** Character facial/gender presentation and final color-block choices.
- [ ] **Q09:** Identify knowledgeable Newar / Majipa Lakhey reviewers; what materials can they review?
- [ ] **Q10:** Review Lakhey concept and movement before final hero modeling.
- [ ] **Q11:** Confirm exact opening-story length (or none) after gameplay prototype.

## Technical / release

- [ ] **Q12:** Confirm final engine based on T001 findings. *Built with PlayCanvas; D-009 still PROPOSED.*
- [ ] **Q13:** Set measurable FPS, total initial download and load-time budgets after phone testing.
- [ ] **Q14:** Gather server OS, disk, bandwidth/traffic limits, domain/subdomain, TLS and deployment/rollback access. *Owner hosts on Vercel since 2026-11-07; decide whether the owner's own server is still needed.*
- [ ] **Q15:** Decide whether game progress stays strictly local for V1 (recommended). *Built as: local only.*
- [ ] **Q16:** Choose source of licensed music/ambience and attribution format. *Built as: all audio synthesized in code, no licensed tracks.*

## Suggested review procedure

Pick **only the questions needed for the next ticket**; avoid blocking graybox work on optional story and final costume choices. On each approval, record a dated `CONFIRMED` decision in `10_DECISIONS.md` and update any dependent task from `PLANNED` to `READY FOR APPROVAL`.
