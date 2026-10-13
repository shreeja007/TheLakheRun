# Indra Jatra Game — Project Memory

_Last updated: 2026-10-09_

## Instructions for ChatGPT in a New Chat

This file contains the current source of truth for a game project I am directing. The latest decisions in Sections 18-21 supersede older platform, tool, story, and workflow assumptions elsewhere in this file.

When this file is uploaded into a new chat:

- Read this file first before giving project advice.
- Treat it as the project's working memory and source of truth.
- I am a Laravel/web developer with programming experience but no previous game-development experience.
- Work with me primarily as a game-design partner and project manager: define the experience, scope, specifications, acceptance criteria, and implementation briefs. Delegate actual development to Codex in VS Code, unless I explicitly request coding here.
- Explain unfamiliar game-development concepts in terms a web/Laravel developer can understand.
- Keep the project beginner-friendly and aggressively protect the scope from becoming too large.
- Prefer a small, polished, finishable game over a large unfinished game.
- Do not assume every brainstormed idea belongs in Version 1.
- When major project decisions, scope, mechanics, technology choices, or milestones change, update this project-memory file so it remains current.
- If a new suggestion conflicts with an existing decision in this file, point out the conflict before silently changing direction.
- Continue from the current project state described below rather than restarting the planning process from zero.

Uploading this file by itself should be enough context to resume work on the project. Read Sections 18-21 for the latest decisions and the split between planning and implementation.

---

## Purpose of this file

This file is the project's memory/source of truth.

If we forget what we originally planned, come back to this document before adding new ideas or changing the scope.

---

# 1. Background

The developer is a Laravel/web developer with programming experience, but no previous game-development experience.

The goal is to build a **small, polished, culturally distinctive game inspired by Indra Jatra and Kathmandu**, rather than attempting a large open-world or story-heavy game.

The game should be realistic for a first-time game developer to finish.

The philosophy is:

> Small game + strong identity + satisfying gameplay + high-score replayability.

Players should be able to:

1. Start the game quickly.
2. Play a short session.
3. Chase a high score.
4. Finish or fail.
5. Retry or exit.

This keeps development manageable while still creating something fun and memorable.

---

# 2. Overall Game Direction

The current concept is a collection of small **Indra Jatra-inspired mini-games** sharing the same Kathmandu festival atmosphere.

The strongest initial combination is:

1. **Lakhey Run**
2. **Rath Pull Challenge**
3. **Festival Collection / Unlocks**

The first release does NOT need all possible mini-games.

The priority is to make one game mode fun first, then add the others.

---

# 3. Main Game Mode — Lakhey Run

## Working concept

An endless-runner-style game set in the narrow streets and alleys of Kathmandu during an Indra Jatra-inspired festival.

The player runs through the streets while a **Lakhey chases them**.

The inspiration can be compared to games such as Temple Run, but the game should develop its own visual identity and mechanics rather than simply copying another game.

## Core gameplay loop

```text
Start Run
   ↓
Run through Kathmandu streets
   ↓
Dodge / Jump / Slide
   ↓
Collect items / score
   ↓
Lakhey keeps chasing
   ↓
Game becomes faster / harder
   ↓
Player crashes or is caught
   ↓
Show score / high score
   ↓
Retry or exit
```

## Possible controls

For mobile:

- Swipe left/right — change lane or direction
- Swipe up — jump
- Swipe down — slide
- Optional tap action for special abilities

Controls must remain simple.

## Possible obstacles

Examples:

- Festival crowds
- Motorcycles
- Street stalls
- Wooden structures
- Temple steps
- Hanging decorations
- Narrow passages
- Festival barriers
- Sudden turns
- Objects being carried through the street

The cultural setting should influence obstacle design.

## Difficulty progression

As the run continues:

- Player speed increases
- Obstacles appear more frequently
- Streets become tighter
- Turns become harder
- Crowd density increases
- Lakhey gets closer when the player makes mistakes

The game should become tense without feeling unfair.

---

# 4. Lakhey

Lakhey is one of the central visual identities of the game.

The Lakhey should feel:

- Powerful
- Energetic
- Mysterious
- Festival-like
- Slightly intimidating
- Not simply a generic horror monster

Animation, drums, footsteps, camera movement, and sound should make the chase exciting.

Possible mechanics:

- Lakhey gets closer after mistakes
- Near-misses increase score
- Certain areas briefly hide the player
- Lakhey can appear beside the player in special sequences
- Drum intensity changes depending on how close Lakhey is

---

# 5. Second Mini-Game — Rath Pull Challenge

This is a separate game mode from Lakhey Run.

The goal is to make the player feel like they are part of the crowd pulling a festival chariot.

## Core feeling

The player should feel:

> "I am helping pull this massive Rath together with the crowd."

This should not just be random tapping.

Possible gameplay:

- Swipe/pull in rhythm
- Tap when the crowd chants
- Hold and release at the correct time
- Maintain rope tension
- Coordinate with an on-screen crowd rhythm

## Possible scoring

Score could depend on:

- Distance pulled
- Rhythm accuracy
- Combo streak
- Pull strength
- Crowd synchronization
- Number of successful sections completed

## Possible events

During the pull:

- Crowd momentum changes
- Rope tension increases
- Turns become difficult
- Rain begins
- Obstacles block the route
- Crowd loses synchronization
- Special boost moments happen during chants/drums

This mode should feel physical even though it uses simple mobile controls.

---

# 6. Possible Future Mini-Games

These are ideas only.

They should NOT automatically become part of the first version.

## Lakhey Dance

A rhythm/memory mini-game where the player controls Lakhey and matches dance patterns.

Possible actions:

- Left
- Right
- Jump
- Spin
- Stomp

Could use a combo/high-score system.

## Festival Collection

Players unlock cultural items by playing the main mini-games.

Possible unlocks:

- Masks
- Character costumes
- Locations
- Instruments
- Decorative items
- Short cultural notes/stories

This could become the progression system tying the mini-games together.

## Festival Preparation / Builder

A more relaxed mode involving decorating or preparing festival areas.

This is currently considered too large for the first release and should remain a future idea.

---

# 7. Progression

The game should avoid complicated RPG systems initially.

Possible simple progression:

```text
Play
 ↓
Earn score / festival tokens
 ↓
Unlock cosmetic items
 ↓
Unlock new streets / environments
 ↓
Try for a higher score
```

Good rewards:

- New Lakhey masks
- New player outfits
- New Kathmandu street environments
- Visual effects
- Music/drum variations
- Character skins
- Festival collectibles

Avoid pay-to-win mechanics during the early project.

---

# 8. Art Direction

The game should NOT try to create a photorealistic Kathmandu.

A stylized art direction will be easier to produce and more visually consistent.

Desired feeling:

> A colorful, energetic, slightly exaggerated Kathmandu during Indra Jatra.

Important visual elements may include:

- Brick Newari architecture
- Wooden windows
- Temples
- Narrow alleys
- Prayer/festival decorations
- Crowds
- Festival lighting
- Masks
- Rath
- Traditional instruments
- Kathmandu street details

The goal is **emotional authenticity**, not perfect simulation.

---

# 9. Audio Direction

Audio may be one of the most important parts of the game's identity.

Possible elements:

- Dhimay drums
- Bells
- Crowd chants
- Footsteps
- Rath movement/wood sounds
- Street ambience
- Festival ambience
- Lakhey movement
- Increasing drum tempo during chase sequences

The audio should help make the player feel like they are inside the festival.

---

# 10. Technology Direction

Current preferred stack:

## Game Engine

**Unity**

Primary programming language:

**C#**

Why Unity currently fits:

- Good mobile support
- Suitable for 3D endless runners
- Large ecosystem
- Many tutorials/resources
- C# should be approachable for someone already experienced with PHP/Laravel
- Strong asset/tool ecosystem

## 3D Models / Assets

Likely tools:

- Blender
- Existing licensed assets where appropriate
- Custom modeling
- AI-assisted concept/art workflows where useful

We do NOT need to model every object ourselves.

The development approach should favor reusable/modular environment pieces.

Example:

- One brick wall module
- Several windows
- Several doors
- Street props
- Temple modules
- Shop/stall modules

These can be combined into many different street sections.

---

# 11. First MVP

The FIRST playable game should be extremely small.

Do not start by creating Kathmandu.

Do not start by creating detailed Lakhey models.

Do not start by creating menus and cosmetics.

First prove that the gameplay is fun.

## MVP Goal

Create:

```text
A capsule/player
      ↓
Automatically runs forward
      ↓
Can move left/right
      ↓
Can jump
      ↓
Obstacles spawn
      ↓
Collision causes Game Over
      ↓
Score increases with distance
      ↓
Retry button
```

Then add:

```text
Lakhey chase
```

Then replace prototype objects with real visuals.

---

# 12. Development Order

Recommended order:

## Phase 1 — Prototype

- Install/setup Unity
- Learn Unity editor basics
- Create player
- Create running movement
- Create lane movement
- Jump
- Collision
- Basic camera
- Basic endless road
- Score
- Game over
- Retry

## Phase 2 — Chase

- Add Lakhey placeholder
- Chase distance system
- Mistakes bring Lakhey closer
- Catch animation/game over
- Chase audio feedback

## Phase 3 — Kathmandu Environment

- Modular streets
- Buildings
- Props
- Festival decorations
- Lighting
- Crowd placeholders

## Phase 4 — Art and Animation

- Player model
- Lakhey model
- Running animations
- Lakhey animations
- Environment polish

## Phase 5 — Juice / Game Feel

- Camera shake
- Particles
- Better sound
- Music
- Impact effects
- Near-miss effects
- Speed effects
- Better UI

## Phase 6 — Rath Pull Mini-Game

Only after Lakhey Run works well.

## Phase 7 — Progression

- High scores
- Unlocks
- Collectibles
- Cosmetics
- Additional environments

## Phase 8 — Release

- Android optimization
- Device testing
- Bug fixing
- Store assets
- Build/release

---

# 13. Important Scope Rules

These rules should protect the project from becoming too large.

## Rule 1

**Finish one fun mechanic before adding another.**

## Rule 2

No open world for version 1.

## Rule 3

No multiplayer for version 1.

## Rule 4

No massive story campaign.

## Rule 5

No complicated combat system unless the game direction changes later.

## Rule 6

Do not create 100 assets before gameplay works.

## Rule 7

Prototype with ugly placeholders first.

## Rule 8

Polish matters more than feature count.

## Rule 9

The game's cultural identity should come from the full experience — environment, music, movement, crowd, architecture, and festival atmosphere — rather than simply placing traditional objects into a generic runner.

## Rule 10

Whenever a new feature is proposed, ask:

> Does this make the core game more fun, or is it only making the project bigger?

---

# 14. Current Priority

The immediate goal is NOT to begin coding yet.

We are currently in:

**Concept / Game Design Phase**

Before implementation, we should decide:

- Core mini-games
- Core gameplay loop
- Art style
- Player character concept
- Lakhey behavior
- Scoring
- Progression
- What goes into Version 1
- What gets postponed

After that we can create a more formal Game Design Document and development roadmap.

---

# 15. Current Working Vision

The current vision can be summarized as:

> A small, highly replayable mobile game inspired by Kathmandu's Indra Jatra, built around short high-score mini-games. The flagship mode is an endless chase through stylized Kathmandu streets with Lakhey pursuing the player. A separate Rath-pulling rhythm/strength mini-game can later add another culturally distinctive experience. The project should remain intentionally small, polished, atmospheric, and achievable for a first-time game developer.

---

# 16. Role of ChatGPT in the Project

ChatGPT will help throughout the project with:

- Brainstorming
- Game design
- Scope management
- Unity learning
- C# scripts
- Architecture
- Debugging
- Gameplay systems
- UI planning
- Game economy/progression
- Model/asset planning
- Blender guidance
- Shader/material guidance
- Animation setup
- Audio implementation planning
- Optimization
- Android builds
- Testing checklists
- Store/release preparation
- Polish and game-feel improvements

The developer still controls the creative decisions and tests the game.

The goal is to work together iteratively until there is a finished playable game.

---

# 17. Project Principle

Whenever we feel overwhelmed:

> Go back to the smallest playable version.

The project succeeds when someone can pick up the game, immediately understand what to do, enjoy several minutes of gameplay, care about beating their score, and want to play again.

That is the target.


---

# 18. Updated Decisions and Studio Workflow (2026-10-09)

This section records decisions made after the original 2026-09-30 plan. It is the latest guidance wherever earlier sections refer to Unity, Android-first distribution, or ChatGPT directly writing all implementation code.

## 18.1 Confirmed direction

- **Game:** Lakhey Run remains the flagship, short-session, high-score endless runner with a distinctive Kathmandu / Indra Jatra festival identity.
- **Platform:** Browser-first, playable on both desktop and mobile. Do not require an app installation for Version 1.
- **Visual target:** Stylized 3D with readable action and compact, reusable environments. Avoid photorealism and a large open world.
- **Scope:** Finish a small, polished runner before Rath Pull Challenge, unlock systems, online leaderboards, or other game modes.
- **Working arrangement:** The owner acts as Game Director and Product Owner; ChatGPT in the planning conversation acts as Game Designer / Project Manager; **Codex in VS Code** is the implementation agent. ChatGPT Work can help with broader deliverables, but Codex is the preferred tool for repository coding, running commands, and tests.
- **Coding boundary:** Do not write application code in the management conversation unless explicitly requested. Produce decision documents, clear implementation tickets, and review feedback instead.
- **Approval:** The owner approves significant design choices and personally evaluates playable builds. AI-generated code is not considered accepted merely because it runs.

## 18.2 Current proposals, NOT yet confirmed

- **Gameplay structure:** A three-lane, third-person endless runner with automatic forward movement, left/right lane changes, and jump.
- **Initial mechanics:** One street environment; two recognizable obstacles; distance score; retry; Lakhey chase added only after the graybox running mechanics are enjoyable.
- **Engine:** A **code-first PlayCanvas Engine + TypeScript + Vite** project is the leading candidate because Codex will implement inside VS Code. This differs from the previous proposal to primarily use the PlayCanvas visual Editor. Validate an actual desktop/mobile prototype before locking the engine; Babylon.js + TypeScript remains a fallback.
- **Backend:** No Laravel service, login, or online leaderboard needed for the first playable version. Local best score is sufficient initially.
- **Performance:** Aim for responsive play on a representative mid-range mobile device, test on actual hardware, and choose precise performance and loading budgets during technical planning.
- **Session target:** Short runs around one to three minutes; tune using playtesting rather than treating this as a fixed rule.

## 18.3 Open design decisions

- Mobile portrait versus landscape orientation; desktop camera framing.
- Player identity and relationship to Lakhey: playful chase versus intimidating chase, and how Lakhey catches the player.
- Exact failure rules: one-hit failure in graybox versus a forgiving mistake/chase-distance system later.
- Obstacles, jump timing, speed curve, difficulty fairness, camera feel, and scoring details.
- Audio direction and cultural review of Indra Jatra representations.
- Final low-poly art references, color palette, interfaces, asset sources, rights, and licensing.
- Whether to use the PlayCanvas standalone engine or a different web-native 3D solution after a small feasibility test.

## 18.4 How the team works

1. **Plan in this chat.** Define one experience or feature at a time: player goal, feel, visuals, controls, requirements, edge cases, and exactly what is out of scope.
2. **Approve a design decision.** The owner confirms it. Record as CONFIRMED, PROPOSED, or POSTPONED in the project memory and decision log.
3. **Prepare a bounded Codex ticket.** Each ticket must contain a goal, relevant project context, in-scope work, out-of-scope work, browser/device requirements, acceptance criteria, verification steps, and expected report-back artifacts.
4. **Implement in VS Code.** Codex works in the repository, runs available checks, documents changed files and limitations, and produces a testable result. Codex may suggest alternatives but must not silently redesign the product.
5. **Review the playable result.** The owner tests on desktop and mobile. This planning conversation assesses feedback, resolves design issues, and either accepts the work or writes a targeted follow-up ticket.
6. **Update documentation.** Approved decisions and finished milestones go back into this memory and, as needed, the Game Design Document and task tracker.

## 18.5 Proposed design documents

These are planned documents, not necessarily files already created:

- `PROJECT_MEMORY.md` - current truth, status, and scope boundaries.
- `GAME_VISION.md` - desired feeling, intended player, and design principles.
- `GAME_DESIGN_DOCUMENT.md` - gameplay loop, rules, controls, scoring, failure, progression, and difficulty.
- `ART_AUDIO_DIRECTION.md` - visual references, reusable assets, camera, sound, and cultural guidance.
- `TECHNICAL_PLAN.md` - engine decision, repository, browser targets, asset pipeline, tests, builds, and hosting.
- `TASKS.md` - milestone tickets, acceptance criteria, and status.
- `DECISIONS.md` - choices approved, reasons, dates, and superseded choices.

Keep the documentation lightweight. Do not try to finalize every future feature before testing the MVP.

## 18.6 Development milestones to delegate

- **M0: Design brief.** Finalize the first-play experience, controls, camera/orientation, obstacle rules, visual target, and the technical feasibility test.
- **M1: Browser 3D feasibility.** Render a simple scene on desktop and mobile with correct resize, touch/keyboard input, and basic performance observations.
- **M2: Graybox runner.** Placeholder character, automatic motion, three lanes, jump, obstacles, collision, distance score, game over, and retry. No festival assets yet.
- **M3: Lakhey chase.** A placeholder pursuer, understandable mistake feedback, and a clear losing state.
- **M4: Festival polish.** Modular Kathmandu street, culturally grounded Lakhey representation, audio, animation, effects, and legible interface.
- **M5: Browser release.** Device testing, load/performance optimizations, reliable deployment, and shareable link.

## 18.7 Initial Codex task discipline

- Give Codex **one milestone or bounded ticket**, not the instruction to build the entire game at once.
- For each task: identify the exact expected behavior, how the owner can test it, and prohibited extras.
- Ask Codex to state assumptions, files changed, commands/tests run, manual checks required, and any blockers.
- Preserve Git history and review diffs before accepting large changes.
- Never treat passing automated tests as a substitute for judging game feel on real devices.

## 18.8 Non-negotiable scope rule

The management team plans the **next smallest playable, testable increment**. The development agent builds only that increment. If a proposal does not improve the runner's core fun, cultural identity, accessibility, or release readiness, postpone it.

---

# 19. Expanded Cultural Research, Model Production, and Hosting (2026-10-09)

Section 19 follows a new research conversation. It adds CONFIRMED production and hosting context, plus story and asset proposals. These proposals are not approved game features until the owner explicitly accepts them.

## 19.1 Confirmed operational changes

- Codex in VS Code should be asked to develop or procedurally generate reusable 3D models and integrate them into the game, in addition to programming. Model deliverables must include editable sources, exported GLBs, previews, and license/source records. A human reviews quality and cultural fit.
- The owner reports access to a server with 16 CPU cores and 8 GB RAM. It is a possible deployment host; network capacity, disk, domain, deployment access, and real capacity have NOT been assessed.
- The owner wants to research authentic Indra Jatra stories and use them to enrich the game's narrative and feel, without abandoning small scope.

## 19.2 Important cultural finding

Local accounts describe Majipa Lakhey as a guardian who protects children, not solely a dangerous horror villain. This creates tension with the older 'Lakhey chases the player' description only if we interpret the chase as malicious. A playful challenge or protective guardian role could resolve the conflict. This change is PROPOSED, not confirmed. Seek informed community review.

Indra Jatra references worth considering: Yenya, Lakhey masked performances/drums, ceremonial pole raising, the Kumari chariot procession, and the story of Indra descending to search for a flower/herb for his mother; Pulu Kisi represents a searching white elephant. Do not treat these as license to invent 'historical facts' or turn sacred rituals into disposable obstacles.

## 19.3 Proposed game story and art

- PROPOSED: 'Lakhey Run: The Guardian's Challenge', a short optional intro in which a young festival participant accepts a Lakhey guardian's playful test of agility. Main gameplay remains an endless score chase, with no heavy cutscenes or level/quest campaign.
- PROPOSED: believable textured stylized 3D, with Newar architectural references, repeating street modules, warm festival lighting, carefully represented drum rhythm and iconic Lakhey silhouette. Fully photorealistic urban reconstruction remains out of scope unless explicitly reapproved with cost/scope discussion.
- POSTPONED: Pulu Kisi encounter, parijat-themed chapter, interactive chariot rituals, larger narrative missions.

## 19.4 Proposed technical approach

- Continue feasibility testing standalone PlayCanvas Engine + TypeScript + Vite, with Blender scripted mesh production and GLB export. This is NOT a confirmed engine selection yet.
- Host the first static, client-rendered game build on existing server behind HTTPS and Nginx/Caddy. No backend is required for initial local personal-best scoring; rendering takes place on the user's device.
- Proposed performance target: run at approximately 30 FPS on a chosen midrange Android test device with responsive inputs; precise file-size and network budgets are pending measurement.
- Keep licensed and original asset records; use Poly Haven/Kenney CC0 or other legitimately licensed assets where needed; source imagery is reference, not a free-to-use texture library.

## 19.5 Supporting research and design brief

For sources, detailed model pipeline, story alternatives, cultural guardrails, server planning and stage-gated implementation scope, consult `INDRA_JATRA_RESEARCH_ART_STORY_HOSTING_BRIEF.md` (same date).

## 19.6 New open questions

- Approve or revise the Lakhey-as-guardian chase story.
- Decide how realistic the visual target should be without undermining mobile web performance and feasibility.
- Confirm portrait versus landscape mobile mode.
- Identify someone familiar with Indra Jatra / Newar tradition for cultural consultation.
- Check actual hosting bandwidth, disk, network/TLS and domain requirements when approaching deployment.

---

# 20. Approved Hybrid Story Direction and Cultural Design Gate (2026-10-09)

## 20.1 Confirmed by the owner

- APPROVED: Develop Lakhey Run as a **hybrid** concept: the first game is a playful guardian pursuit with short, fun high-score runs; carefully researched Indra Jatra / Yenya legends may be introduced later as optional discoveries and updates.
- APPROVED: Prioritize the first runner's game feel rather than a story-heavy campaign. Expanded mythology, Pulu Kisi gameplay, and Rath Pull remain postponed pending later approvals.
- APPROVED: Lakhey is **not framed as a malicious horror villain**. The fictional chase is a spirited agility challenge. This supersedes any interpretation of the original 'Lakhey chase' concept as lethal or harmful.
- AGREED INTENT: Real Indra Jatra legends should be incorporated carefully and distinguished from the fictional game story. RECOMMENDED DESIGN GATE (not yet explicitly approved): consult knowledgeable community members before final sacred character depictions or public promotion.

## 20.2 New cultural research informing the direction

- In reported Lakhey performances, **Jhyalincha** playfully teases Lakhey, who chases the figure. This provides an existing cultural context for playful pursuit, but the first playable character should NOT automatically be advertised as an authentic Jhyalincha ritual portrayal.
- Published local reporting notes a 2020 Lakhey/Pulu Kisi-inspired runner project that reportedly was shelved following objections about using sacred figures. Views differed about artistic appropriation. Treat this as a real cultural/stakeholder risk, not a prohibition or automatic legal requirement.
- Reported variants of Indra's story include gathering parijat flowers for his mother, but naming, detail, and emphasis vary. Label future story cards as traditional tellings and verify them; never treat our invented game scenes as history.

## 20.3 Detailed design still proposed / unapproved

- Working title: 'Lakhey Run: The Guardian's Challenge'.
- Short skippable opening: old Kathmandu-inspired street, drum call, Lakhey silhouette, start running.
- Fictional festival participant runner inspired by playful exchange, NOT an unreviewed literal ritual reenactment.
- Three-lane running, lateral movement, jump, two obstacle types, distance score and instant retry.
- Modest art scope: one fictional, modular Kathmandu street; no photorealism or full sacred processions.
- Short future optional story cards about Lakhey, Pulu Kisi, the Indra/parijat legend; all deferred from the first gameplay prototype.
- Story and detailed scope reference document: `LAKHEY_RUN_GAME_VISION_STORY_V01.md`.

## 20.4 Open decisions and next management action

- Decide player identity and whether mobile is portrait or landscape.
- Choose the initial camera framing and first two obstacle behaviors.
- Establish a cultural review contact before final Lakhey character art or external marketing.
- Keep PlayCanvas Engine + TypeScript + Vite as a provisional technical choice until the feasibility prototype passes.
- AFTER the next M0 decisions, create one small M1 Codex ticket. No broad autonomous build instruction yet.

## Research references

- https://ntb.gov.np/indra-jatra
- https://kathmandupost.com/miscellaneous/2014/09/05/bucking-tradition-to-keep-a-tradition-alive
- https://kathmandupost.com/visual-stories/2021/10/02/i-will-treasure-my-time-as-the-lakhey-while-i-can
- https://kathmandupost.com/art-culture/2020/09/04/the-thin-line-between-artistic-homage-and-cultural-appropriation
- https://kathmandupost.com/art-culture/2020/09/01/how-indra-jatra-came-to-be-one-of-kathmandu-s-most-celebrated-festivals


---

# 21. Original Player Trickster Direction (2026-10-09)

## 21.1 Approved by the owner

- CONFIRMED: The playable runner will be an **original, playful trickster character** inspired by the fun and dynamic energy of the Lakhey-Jhyalincha relationship, **not** an accurate portrayal of Jhyalincha or a literal reenactment of the ritual.
- CONFIRMED: Maintain the hybrid story direction: a spirited, nonviolent guardian challenge first; carefully sourced Indra Jatra stories may come later as optional content.
- This updates Section 20's open decision about player-character archetype. Costume, name, age, appearance and individual animations remain proposed until separately approved.

## 21.2 Proposed concept, not yet approved

- Working nickname **Tuku** (fictional placeholder; no claim of Newar-language meaning or cultural authenticity).
- Young-adult, friendly, quick-witted, cheeky but kind; humor through expressive reactions rather than ceremonial taunts or disruption.
- Slightly stylized 3D silhouette: swept hair, teal cropped everyday jacket, short orange neckerchief, cream trousers, simple shoes and diagonal satchel strap.
- Original running/jumping reactions and a brief fictional greeting that begins the playful chase. Avoid ritual choreography, exact Jhyalincha clothing/props, sacred costumes, and destructible ceremonial objects.
- Deliver a graybox/blockout first, with editable Blender sources and GLB export; rig and polished art are later gated tasks after visual and playtesting approval.
- Proposed detailed spec: `LAKHEY_RUN_TUKU_CHARACTER_DESIGN_V01.md`.

## 21.3 Next approvals and constraints

- Set mobile orientation / camera because player readability will depend on rear-view framing.
- Review the working name, age, color palette, silhouette, animation reactions and culture-safe distinctions.
- Confirm a cultural reviewer for the final guardian portrayal and the story before publication.
- The engine choice is still provisional, and detailed art does not block early graybox gameplay testing.

## 21.4 References

- https://kathmandupost.com/miscellaneous/2014/09/05/bucking-tradition-to-keep-a-tradition-alive
- https://artsandculture.google.com/story/7wVxVo4jDR4cLA
- https://kathmandupost.com/art-culture/2020/09/04/the-thin-line-between-artistic-homage-and-cultural-appropriation
