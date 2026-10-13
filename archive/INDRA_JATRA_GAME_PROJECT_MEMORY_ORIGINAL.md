# Indra Jatra Game — Project Memory

_Last updated: 2026-09-30_

## Instructions for ChatGPT in a New Chat

This file contains the current source of truth for a game project I am building.

When this file is uploaded into a new chat:

- Read this file first before giving project advice.
- Treat it as the project's working memory and source of truth.
- I am a Laravel/web developer with programming experience but no previous game-development experience.
- Work with me step-by-step from game design through Unity development, assets, game logic, debugging, polishing, optimization, and release.
- Explain unfamiliar game-development concepts in terms a web/Laravel developer can understand.
- Keep the project beginner-friendly and aggressively protect the scope from becoming too large.
- Prefer a small, polished, finishable game over a large unfinished game.
- Do not assume every brainstormed idea belongs in Version 1.
- When major project decisions, scope, mechanics, technology choices, or milestones change, update this project-memory file so it remains current.
- If a new suggestion conflicts with an existing decision in this file, point out the conflict before silently changing direction.
- Continue from the current project state described below rather than restarting the planning process from zero.

Uploading this file by itself should be enough context to resume work on the project.

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
