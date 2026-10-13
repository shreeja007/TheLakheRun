# T033 — Preserve focused-button shortcuts and merge the migration

**Authorization:** On 2026-10-13, after the merge review identified the focused-button keyboard regression and recommended fixing it before merging, the owner instructed: “ok check and proceed the merge”. This authorizes the bounded fix, verification, backup and local merge described in that review.
**Implementation state:** COMPLETE; focused-button regression and all 18 combined checks passed. Local fast-forward merge completed; director/device acceptance remains pending.

## Read / references

- `../README.md`, `../docs/00_PROJECT_STATUS.md`, `../docs/10_DECISIONS.md`
- `../docs/07_AUDIO_UI_AND_ACCESSIBILITY.md`
- `../docs/08_TECHNICAL_ARCHITECTURE.md`
- `../docs/09_QA_AND_RELEASE.md`
- `T032_OPTION_C_INTEGRATION.md`, `../reports/T032_RESULT.md`

## Scope

Fix the new keyboard guard so T/E tease and P/Escape pause shortcuts work while a game button has focus. Preserve native Space/Enter button/link activation, isolate text-entry controls and retain tutorial/install-dialog action guards. Add a focused-button regression to the existing UI checks; allow a separate evidence directory so historical T032 artifacts remain unchanged.

Run the production build and combined UI/mobile/PWA suite. Preserve current master at `backup/pre-t032-merge`, commit this correction separately on `migration/t032-option-c-integration`, then fast-forward master to the checked migration. Verify merge ancestry, protected asset/source preservation and a clean final worktree. Write `../reports/T033_RESULT.md` using the report template.

## Exclusions

No new mechanics, art, engine/business approvals, decision-log changes, remote push or deployment. Existing stale planning docs and the historical raw-byte hash verifier's Windows line-ending portability issue are reported, not expanded into unrelated fixes. Merge authorization does not constitute gameplay, cultural or real-device acceptance.

## Acceptance / next boundary

Focused-button shortcuts reach the game; P/Escape change pause state; Space/Enter activate only the focused native button. Existing combined checks pass, historical evidence is preserved, backup exists, local master contains the migration and correction. Physical-device acceptance remains the next owner review; no later ticket starts automatically.
