# Gameplay design — working rules

**Status:** The simple endless-runner loop is confirmed; exact rules below remain proposed pending director approval and gameplay testing.

## Core loop

`Start → automatic forward run → dodge / jump → earn distance → obstacle or guardian catch → score + personal best → retry`

## MVP mechanic proposal

| System | Initial proposal | Approval / testing note |
|---|---|---|
| Camera | Fixed trailing third-person | Mobile portrait vs landscape unresolved |
| Forward motion | Automatic | No free-roaming / open-world controls |
| Lane changes | 3 discrete lanes; one-lane move per valid input | Smooth travel, no teleport feeling; tune |
| Jump | One predictable jump arc; no double jump | Tune duration, landing and obstacle clearance |
| Obstacles | 1 jumpable low barrier, 1 tall avoidance block | Respect fictional festival setting |
| Generation | Reuse street sections; guaranteed reachable path | No impossible obstacle configurations |
| Difficulty | Gradually increase pace and density | Never overwhelm before a new mechanic is taught |
| Score | Distance only, personal best local to browser | No accounts/coins/global scoreboard |
| Failure | First graybox collision ends run | Guardian distance/forgiving rule later, unapproved |
| Retry | One click/tap, no full browser reload | State resets deterministically |

## Input proposal

- **Desktop:** Left/Right or A/D change lane; Space or Up jumps. Browser default scrolling should not interfere when actively playing.
- **Mobile:** horizontal swipes switch lanes; upward swipe jumps; input works without relying on hover. Orientation still to be chosen.
- Show a brief nonblocking control cue at first run. Keyboard focus and pause/restart handling need tests.

## State machine (technical behavior proposal)

`READY → RUNNING → GAME_OVER → RETRY/READY`. The eventual guardian layer may add `WARNING` and `CAUGHT` animation, but only after graybox gameplay tests.

## Obstacle fairness requirements

- Preserve a reachable safe route given actual lane-change and jump timings.
- Spawn hazards far enough ahead to react at planned run speed.
- Telegraph hazard type with clear shape/color; never rely on audio only.
- Define consistent collision hitboxes. A jumpable obstacle must never accidentally count as a tall obstacle.
- Test simultaneous input, rapid swipes, landing collisions, frame-rate changes and reset states.

## Chase behavior — second stage only

Lakhey initially appears as a **placeholder follower** with clear visual/audio proximity feedback. Whether the first stumble brings the guardian closer and the second ends the run remains a **playtest hypothesis**. No AI combat, pathfinding maze, lethal catch or jump-scare mechanics.

## Playtest questions

1. Can a first-time player choose the correct action within one glance?
2. Is the lane change responsive but controllable?
3. Can the player predict when a jump succeeds?
4. Do players understand why they lost?
5. Is there a compelling reason to retry immediately?

## Not in early builds

Sliding, powers, missions, shops, coins, cosmetics, multi-zone turns, time-limited challenges and online leaderboard. Each must justify itself against fun and scope.

**Related:** `07_AUDIO_UI_AND_ACCESSIBILITY.md`, `../tasks/T002_PLAYER_MOVEMENT.md`, `../tasks/T003_ROAD_OBSTACLES.md`, `../tasks/T004_SCORE_GAME_OVER_RETRY.md`.
