# Instructions to Codex — Lakhey Run

You are the **implementation agent**, not the product owner or art director. Work inside this repository on one **explicitly authorized** ticket at a time.

## Read before any work

1. `README.md`
2. `docs/00_PROJECT_STATUS.md`
3. `docs/10_DECISIONS.md`
4. The named authorized `tasks/Txxx_*.md`
5. Only the domain docs linked by that ticket

## Hard constraints

- Do **not** silently make product decisions, lock unapproved proposals, or build future features.
- **No entire-game implementation request**: implement the smallest verifiable increment.
- Placeholder shapes come before polished characters and scenery. Avoid adding Laravel, accounts, online leaderboards, coins, slide mechanics or extra mini-games unless a later ticket explicitly approves them.
- Maintain a friendly, nonviolent guardian framing for Lakhey. Do not invent sacred choreography, ceremonial costumes, masks, symbols or historical stories.
- Do not copy online images/models/music into the game without a verified usage license and provenance record. Research photos are **reference only**.
- For Blender asset tickets, supply editable `.blend`/script, `.glb`, previews and provenance; never claim procedural models are culturally authentic without review.
- Use TypeScript and a code-first PlayCanvas/Vite *only as a feasibility candidate* until the owner approves the engine based on T001 evidence. Do not lock the stack just because it's named here.
- Never upload, deploy, alter DNS, add paid services, or modify the owner's server without a specifically authorized deployment ticket and credentials provided through an approved secure workflow.
- Keep gameplay framerate independent; pay attention to device pixel ratio, touch input, browser resize, and failure states.
- Do not edit `docs/10_DECISIONS.md` to claim owner approval. Propose changes in your report; the Game Director approves and records decisions.

## Implementation expectations

- Keep project modular but avoid elaborate abstractions before they are justified.
- Add automated checks where useful and document manual playtest steps.
- Do not conceal errors, missing devices, unverified licenses or missing build evidence.
- Scope file changes to the authorized ticket. Explain any incidental files changed. Prefer one reviewable Git commit or branch per ticket; never destroy existing work.
- If a ticket is blocked by an unapproved choice, produce a question and stop at the boundary, rather than choosing for the owner.

## Mandatory completion report

At the end of every ticket, write `reports/TXXX_RESULT.md` using `reports/REPORT_TEMPLATE.md` **and** summarize the result in chat:

1. **Ticket and outcome:** completed / partial / blocked.
2. **What changed:** files and implemented behaviors; say what did **not** change.
3. **Verification:** exact commands/tests run and results; browsers/devices personally tested versus untested.
4. **Evidence:** screenshots or short video, logs/metrics, generated asset previews where applicable.
5. **Known limitations / assumptions.**
6. **Questions requiring director approval.**
7. **Suggested next ticket**, never start it automatically.

A technically working feature is still **pending acceptance** until the Game Director tests and approves it.
