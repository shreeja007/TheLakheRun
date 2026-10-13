# Lakhey Run - Game Vision and Hybrid Story (Draft 0.1)

Date: 2026-10-09
Owner: Game Director
Planning: ChatGPT
Implementation: Codex in VS Code (after task approval)
Status: HYBRID STORY DIRECTION APPROVED; detailed gameplay/art decisions remain proposed

## 1. The game in one sentence

A short, exciting, replayable 3D browser runner through a fictional Kathmandu festival lane, built around a playful, non-villainous guardian chase inspired by Indra Jatra, with carefully researched legends added as optional discoveries in future updates.

## 2. Approved creative direction

- CONFIRMED: The first game is Lakhey Run, a simple web game for desktop and mobile.
- CONFIRMED: The first release prioritizes fun running, dodging, jumping, atmosphere and high scores.
- CONFIRMED: The main story framing is a playful guardian chase, not a malicious monster hunt.
- CONFIRMED: Wider Indra Jatra / Yenya lore arrives gradually through future optional content, rather than a large first-release campaign.
- CONFIRMED: Cultural sources and community consultation matter; invented game fiction must not be presented as ritual history.
- CONFIRMED: Codex will be assigned both implementation and selected scripted 3D asset tasks, subject to human review.

## 3. The emotional experience

The player should experience wonder at the festival, a sudden playful dare, growing tension as drums accelerate, satisfaction from a clean dodge, and an immediate urge to retry after being caught. Lakhey can feel awe-inspiring and slightly intimidating without being an evil villain.

Proposed player experience: understand the controls in about five seconds; experience a short run lasting around one to three minutes at first; replay in one tap/click. These durations are playtest targets, not fixed requirements.

## 4. Cultural grounding vs. game fiction

### Cultural background supported by published reporting

- The Nepal Tourism Board describes Indra Jatra as a revered Newar festival featuring ceremonial pole raising, masked Lakhey performances, drums and religious/chariot processions.
- Reporting in The Kathmandu Post describes Majipa Lakhey as a protector of children and the Kumari in local accounts, not solely a malevolent demon.
- Kathmandu Post reporting describes Jhyalincha, a playful figure who teases Lakhey and is chased during performances.
- The legend of Indra descending for parijat flowers (or, in some summaries, a plant/herb) is told in multiple variants.
- Pulu Kisi is represented as Indra's searching white elephant in traditional performance.
- In 2020, a developer reportedly stopped plans to release a Lakhey/Pulu Kisi-inspired runner amid objections to treatment of sacred cultural figures. There were also differing views on creative reuse. Cultural review is an important practical risk-control step.

### Fiction we invent for this game

- A fictional festival-goer takes part in a fast-paced guardian chase around an imaginary, Kathmandu-inspired festival lane.
- A run is a friendly game of agility; catching the player ends the challenge, not their life.
- The runner is inspired by the playful relationship in the tradition but is NOT automatically a literal depiction of Jhyalincha or any sacred ritual role.
- Lakhey being a 'game challenge host,' or any invented speech, is not a historical claim. This treatment must be reviewed with informed local stakeholders before public promotion.

## 5. Proposed micro-story and pacing

Title: 'Lakhey Run: The Guardian's Challenge' (working title; not final branding).

Opening in approximately 8-12 seconds (skippable):

1. A stylized brick-lined old Kathmandu street; festival lamps, bunting and spectators beyond the runner lanes.
2. A drum flourish. The fictional player character looks behind them as a powerful guardian silhouette appears.
3. Text, or a single line of narration: 'The drums are calling. Can you keep up with the guardian's challenge?'
4. An obvious 'Run!' moment. Camera settles behind the player. No extended cutscene.

Run arc (proposal, subject to playtest):
- Early seconds: readable street and simple dodges; show controls unobtrusively.
- Mid-run: speed and percussion build; one safe route is always visible.
- High tension: mistakes make Lakhey feel closer, through sound, shadow, and framing.
- Game over: a nonviolent catch or dance-like stop, score, personal best, one-action retry.

No quests, dialog trees, complex cutscenes, or multi-stage campaign in V1.

## 6. Proposed game rules - not all approved yet

- Third-person auto-runner, likely three lanes.
- Left/right lane switching and jump; avoid sliding until it is demonstrably needed.
- Desktop: left/right arrow or A/D, Space to jump. Mobile: horizontal and upward swipes.
- Two obstacle archetypes for the first prototype: one to jump over and one to avoid by switching lanes.
- Distance-only scoring and local personal best.
- Graybox MVP: one collision can mean game over. A later, forgiving chase version may allow one mistake to bring Lakhey closer and another to end the run. This must be playtested.
- Keep a guaranteed reachable safe path; no unavoidable random obstacle walls.
- Target short, fun, high-score-oriented sessions and immediate restart.

## 7. First environment and art scope

Use ONE fictional street inspired by old Kathmandu, not a claim to precisely reconstruct a specific sacred procession route.

Mood: believable materials, warm festival lighting, textured yet stylized 3D, recognizable red brick and carved timber windows, lively drums, compact environment. Not photorealistic.

Starter assets, made with scripted Blender work and/or appropriately licensed sources:
- Graybox character + graybox Lakhey pursuer for mechanics.
- A small modular kit: road section, two building facades, wooden window variant, doors, roof section, and hanging decoration.
- Two readable obstacle types; festival stalls and baskets can help provide context but must not portray sacred items as targets to smash.
- One small set of distant/non-colliding spectators or simple silhouettes; avoid complex crowd simulation.
- A final Lakhey model and animation only after a visual style review and cultural consultation.

Deliver edited .blend/source files, .glb exports, reference/licensing records, preview renders and browser performance observations. AI-generated output requires visual and cultural inspection.

## 8. Audio direction

Festival ambience and legible rhythmic tension are more important than expensive cinematics. Layer light ambient crowd noise, footsteps, dodge feedback, and a carefully sourced or originally composed drum-inspired rhythm. Do not assume traditional recordings or sacred performance pieces are free to use. Support a mute control; do not make audio cues the only gameplay signal.

## 9. Future story updates - separate approvals required

- Update A: Optional Festival Stories section (short, cited, reviewed cards) explaining Lakhey's protective role, the festival, and the difference between the game's fiction and ritual traditions.
- Update B: A Pulu Kisi discovery or distant cameo explaining the searching white elephant (do not automatically make it an enemy/collectible).
- Update C: An optional story chapter about versions of Indra's search for parijat, his capture, and his mother's search; annotate variant tellings without declaring one universal account.
- Update D: Expanded festival setting, followed much later by Rath Pull Challenge if the runner is successful.

No collectable holy icons, masks of real sacred performers, Kumari figures as score objects, destructible ritual chariots, or impersonation of living participants. Any such ideas need specific cultural input before reconsideration.

## 10. Cultural review gate

Before approving the final character assets/marketing and before public release:

1. Consult people knowledgeable about the Majipa Lakhey tradition, including relevant Newar cultural practitioners or custodians, and review the portrayal, title, costume, dance gestures, and script.
2. Explain explicitly where the game is fictional and where it references documented traditions.
3. Check festival terminology, names, music rights, visual source rights, and credits. Published photographs are reference material, not automatically game textures.
4. Record feedback and adjust the representation where necessary. Consultation is a relationship and design-quality step, not a guarantee of universal agreement.

## 11. Technical and deployment status

- Current engine candidate: code-first PlayCanvas Engine + TypeScript + Vite; final choice PENDING a desktop/mobile feasibility spike. Babylon.js remains an alternative.
- The user reports a 16-core, 8 GB server. Static browser-game deployment is plausible, but storage, bandwidth, domain, HTTPS and real client performance remain unverified.
- No Laravel backend, accounts, online leaderboard or live server-side gameplay is needed for V1. Local personal best is enough.

## 12. Hand-off milestones and quality gates

- M0 Design approval: settle camera/orientation, controls, one screen of story, and obstacle rules.
- M1 Feasibility: render tiny 3D scene and verify desktop/mobile input and responsive sizing.
- M2 Graybox: auto-run, lane switch, jump, obstacles, distance, fail, retry; demonstrate fair play.
- M3 Chase: add a placeholder guardian and readable, nonviolent catch sequence; evaluate game feel.
- M4 Art/audio: procedural modular city assets; final assets only after review, optimized sound and UI.
- M5 Release: device tests, loading/performance optimization, cultural approval gate, deployment.

Each Codex ticket needs objective, scope, exclusions, acceptance criteria, test instructions and report-back. Never assign 'build the whole game' as one task.

## 13. Design decisions still open

- Portrait mobile versus landscape mobile; responsive desktop camera.
- Fictional player identity and styling (young festival participant vs a more symbolic design).
- Detailed failure/chase mechanic.
- Exact obstacle look, art reference board, HUD, music treatment.
- Confirm final engine after browser prototype.
- Identify cultural reviewers and a source/license approval process.

## Sources for cultural claims and sensitivity context

- Nepal Tourism Board, Indra Jatra: https://ntb.gov.np/indra-jatra
- Kathmandu Post, 2021, 'I will treasure my time as the Lakhey while I can': https://kathmandupost.com/visual-stories/2021/10/02/i-will-treasure-my-time-as-the-lakhey-while-i-can
- Kathmandu Post, 2014, 'Bucking tradition to keep a tradition alive': https://kathmandupost.com/miscellaneous/2014/09/05/bucking-tradition-to-keep-a-tradition-alive
- Kathmandu Post, 2020, 'The thin line between artistic homage and cultural appropriation': https://kathmandupost.com/art-culture/2020/09/04/the-thin-line-between-artistic-homage-and-cultural-appropriation
- Kathmandu Post, 2020, 'How Indra Jatra came to be one of Kathmandu's most celebrated festivals': https://kathmandupost.com/art-culture/2020/09/01/how-indra-jatra-came-to-be-one-of-kathmandu-s-most-celebrated-festivals
- Kathmandu Post, 2019, 'A feast fit for the gods': https://kathmandupost.com/food/2019/09/13/a-feast-fit-for-the-gods
