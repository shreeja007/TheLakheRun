# Original-project migration and ongoing work

Owner authorized the phased migration on 2026-10-13. The active workspace for this sequence and subsequent authorized work is:

`C:/Users/ShreejaManandhar/Desktop/TheGame/lakhey-run-planning_antigravity_original`

The sibling `lakhey-run-planning_antigravity` remains a preserved reference. Do not delete it or copy its whole source tree over this project's friend-side development.

## Phase evidence

- [T031 research transfer](../reports/T031_RESULT.md): five missing research files copied exactly; dated proposal and business decisions remain pending review.
- [T032 Option C integration](../reports/T032_RESULT.md): current HTML/main/input/game/build integration and fresh combined-game UI/PWA checks; technical completion is not director acceptance.
- Earlier sibling tasks/reports reside under `docs/bob_branch_archive/`. Active T017–T020 concern friend-side animation/audio/festival work; those identifiers were not repurposed by migration.

Use the current game models and animation code as the base for future tickets. Both Pulu versions remain available: the active animated-runtime model and the preserved editable static concept handoff. Buildings/gateway are already copied; placement and Pulu appearance refinement are future separately scoped work.

## Coordination

Work on one directly authorized ticket at a time, with a local branch/commit and mandatory result report. For this migration, T031 and T032 have separate commits. Review/acceptance remains the owner's responsibility; no owner approval was written into the decision log.

Agree who is editing a file before concurrent development. If collaborators use the same computer, separate Git worktrees prevent one person's branch switch from changing the other's open project. If they use separate computers, exchange reviewed commits through the team's configured Git workflow. This migration does not configure/push a remote or merge another person's branch.

## Director's physical-device checklist

1. From this original project, run `npm run build`, then `npm run preview`. Use a separately authorized HTTPS staging setup for real-phone installation/offline checks; ordinary LAN HTTP does not provide those browser capabilities.
2. Fresh browser profile: Play opens the tutorial. Practise left/right/up/down; the runner stays still. Skip also starts the run. On later reloads, completed guidance stays skipped; How to play reopens it from Ready/Paused/Results.
3. Run, pause and resume. Try swipe/keyboard movement, jump/slide variants and the Tease button/T/E shortcut. Move/jump/slide to interrupt tease. Retry after a catch; check score reset, mute, portrait/landscape layout and safe areas.
4. Normal HUD hides diagnostics. `/?debug=1` exposes diagnostics, Reset and seed controls. Confirm the normal HUD leaves the lane view usable.
5. On a supporting browser, open Home screen, inspect installation guidance and wait for Game saved. Reload once to get worker control, then test offline launch and current festival models. Close all game tabs to activate a saved update. Record actual browser/device and failures.

Physical Android/iPhone installation, Safari/Firefox coverage, hardware GPU performance, heat and real touch comfort require owner/device testing. Automated emulation does not replace those checks. No deployment, ad/analytics/payment service or cultural/model acceptance is included in this migration.
