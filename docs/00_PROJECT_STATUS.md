# Project status — read first

**As of:** 2026-11-02  
**Phase:** Playable browser-3D runner built and **accepted by the Game Director** (D-016) after personal playtesting on Windows desktop (Chrome/Edge) and a physical Android phone (Chrome).  
**Near-term aim:** cultural/rights review, iPhone/Safari check, then HTTPS staging (T014) and release QA (T015) once authorized.

> *Earlier header (2026-10-09): "Concept / game design / planning; implementation not started" — superseded by the built and accepted game above. The sections below are preserved as originally recorded.*

## Accepted build (2026-11-02)

- All built tickets accepted for gameplay: T001–T013, T017–T020, T031–T034 and the unnumbered polish/biome/FX reports. See `../tasks/00_TASK_INDEX.md`.
- Acceptance is gameplay/function only. It does **not** cover cultural sign-off for Lakhey, festival elements (Pulu Kisi, raths) or asset rights/provenance.
- Not yet tested: iPhone/Safari, Firefox, OS install/offline on HTTPS hosting.
- Implemented features the 2026-10-09 lists below still call PROPOSED/DEFERRED (coins, slide, Pulu Kisi hazard, rath procession, biomes) are now in the accepted build; the director should formally reconcile those rows in `docs/10_DECISIONS.md`.

## CONFIRMED by owner

- Lakhey Run is the flagship, short, replayable game; one enjoyable core loop first.
- Web-first for **desktop and mobile**, no app installation required for Version 1.
- **Stylized 3D**, small world, Kathmandu / Indra Jatra-inspired atmosphere; not an open-world recreation.
- **Hybrid story:** an exciting, **nonviolent** guardian challenge now; real festival legends are researched and optional *later*.
- The playable character is an **original playful trickster**, not a direct Jhyalincha reenactment.
- Tuku's **clothing approach** is contemporary Kathmandu clothing with subtle, non-ritual Newar textile-inspired details; precise model and colors still pending final art approval.
- Owner = Game Director; planning chat = design/project management; **Codex in VS Code** = tasked implementation and selected Blender asset work.
- Owner has reported access to a **16-core CPU / 8 GB RAM** server, but real deployment properties aren't yet verified.
- Finish a fun game before adding Rath Pull or other mini-games.

## PROPOSED, not locked

- Working title: *Lakhey Run: The Guardian's Challenge*; nickname **Tuku** is a placeholder pending cultural/language review.
- PlayCanvas Engine + TypeScript + Vite (code-first) as leading web-3D feasibility candidate; Babylon.js remains a fallback.
- Third-person camera, 3 lanes, forward auto-run, left/right + jump, 2 obstacles, distance score, local personal best, one-action retry.
- First graybox collision = game over; a later Lakhey proximity/mistake mechanism only if tested and approved.
- A short, skippable intro; fictional old Kathmandu street with modular Newar-inspired facade elements and subtle festival lighting.
- Tuku turnaround v0.2: teal jacket, cream longline inner shirt, charcoal trousers, short maroon scarf and charcoal satchel. This updates an earlier visual proposal, **not yet signed off as final costume**.
- Target 30 FPS on an agreed midrange phone and small download where practical; performance and size thresholds TBD from measured tests.

## DEFERRED / excluded from first runner

- Story quests, sacred objects as collectibles, Pulu Kisi gameplay, Indra/parijat chapter, Rath Pull Challenge, Lakhey Dance, festival builder, cosmetics/unlocks, online leaderboard, player accounts, multiplayer, extensive crowds, photorealism.

## Blocking owner decisions

See `docs/13_OPEN_QUESTIONS.md`. Top priorities: mobile orientation; input/camera/obstacle behavior; which visual details are approved; real device target; cultural reviewer before final Lakhey depiction; engine confirmation only after T001 results.

## Next authorized action

**No new ticket is authorized.** Remaining work: T014 HTTPS staging (blocked on server details and permission), T015 final QA/release review (needs T014 plus cultural/rights sign-off), T028 income-research decisions, cultural reviewer contact, and owner decisions on engine (D-009), orientation, "Tuku" name and total-score meaning.

*Earlier (2026-10-09): proposed first assignment was T001 feasibility; superseded — T001 is implemented and accepted.*

## Documentation update rule

After a director decision, add an entry in `docs/10_DECISIONS.md` and adjust the domain doc/this status file. Do **not** append a new chronological essay to one master memory file. Preserve older writing in `archive/`.
