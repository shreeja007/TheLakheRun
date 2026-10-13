# Browser architecture and hosting — proposed

**Not a locked tech decision.** First validate a small code-first WebGL feasibility scene on a real desktop and a real phone.

## Preferred test stack

- Game rendering/logic candidate: **PlayCanvas Engine** (standalone), **TypeScript**, **Vite**; JavaScript/WebGL in the browser. Babylon.js + TypeScript is a fallback if measured issues warrant it.
- 3D: Blender (manually or via procedural scripts) → `.glb` with efficient assets.
- Initial personal best: browser `localStorage`, with safe read/write fallback when storage is disabled.
- No Laravel API, authentication, database, online leaderboard, WebSockets or server-side 3D rendering in V1.

## Suggested code boundaries (implement only as needed)

```text
src/
  main.ts                # bootstrap, render lifecycle
  game/                  # state machine and update loop
  input/                 # keyboard / gesture adapters
  runner/                # lane switch, jump, player state
  world/                 # road tiles and obstacles
  ui/                    # start, score, game over
  assets/                # references/loaders, not raw source art
public/assets/          # finalized glb/textures/audio, once licensed
art-source/              # Blender .blend and generator scripts
```

This is guidance, **not** a mandate to create empty folders in T001.

## Browser/performance behavior

- Handle touch, keyboard, canvas resize, high/low device pixel density, lost/recovered WebGL context if feasible, input cancellation and visibility/pause transitions.
- Use frame delta for movement, clamp large delta spikes on resume, and clean up listeners on restart/dispose.
- Test GPU/CPU, render calls, memory and actual download on target devices before committing budgets.
- Do not optimize server core count for client graphics; rendering happens on the player's device.

## Server: reported inventory

Owner reports a server with **16 CPU cores and 8 GB RAM**. This may be adequate for serving static build files. Still **unknown**: bandwidth/egress limits, SSD/disk, geographic latency, OS, domain, deployment access, TLS, traffic and backup procedure.

Proposed deployment once authorized: `vite build` → versioned static bundle → Nginx or Caddy + HTTPS + compression + immutable caching of hashed assets + straightforward rollback. Add CDN only if measured transfer/latency warrants. Do not touch server in feasibility tickets.

## Security, privacy and licensing

- Single-player frontend stores only local best score by default; no account/PII collection in the MVP.
- Keep dependencies current, pin versions and track third-party asset licenses.
- If a future online score service is requested, assume browser-submitted scores can be forged and add abuse controls.
- No backend credentials in client bundles, no hardcoded server passwords, no undocumented telemetry.

## Technical decision gate

T001 must give real observations from tested devices, browser support, bundle metrics, controls and resize behavior. Director then confirms PlayCanvas stack or requests Babylon fallback test. Numeric performance and size budgets are also subject to a later explicit decision.

**Related:** `../tasks/T001_WEB_3D_FEASIBILITY.md`, `../tasks/T014_STATIC_STAGING_HOSTING.md`.
