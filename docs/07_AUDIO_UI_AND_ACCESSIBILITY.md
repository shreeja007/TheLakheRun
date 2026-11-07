# Sound, interface and accessibility

**Status:** Direction proposed; no purchased/recorded audio, finished UI or exact HUD layout approved.

## Built since this proposal (T039)

- **Settings dialog:** music volume, sound-effects volume, reduce screen shake and vibration, saved on the device. Reduce screen shake starts ticked when the device asks for reduced motion.
- **Vibration cues** on browsers that support it (Android): first edge bump, close call, catch. iPhone/iPad browsers show the switch disabled.
- **Best-distance marker:** a gold line and "Best" label on the road at the previous best.

## Audio experience

- Festival ambience should establish place; rhythm should communicate momentum, especially Lakhey proximity.
- Possible layers: gentle street ambience, footsteps, original drum-inspired musical loop, dodge feedback, stumble cue, game-over flourish.
- **Do not** copy traditional live recordings, sacred performance music or samples without verified permission; compose/record original material or license it.
- Do not make audio the only way to detect a hazard or mistake. Include a clear **mute** option and respect browser autoplay restrictions (audio begins on user gesture).

## Minimal UI screens

1. **Start / Ready:** game title, large Play button, controls hint, mute option.
2. **Playing:** distance score, discreet best score, optional pause/mute, simple feedback; keep lanes visually clear.
3. **Game Over:** distance, personal best, **Retry** primary action and simple exit/back option.
4. **Loading / failure:** show progress/state or useful error and Retry; don't leave blank canvas.

## Desktop/mobile UX

- Same gameplay; adapt to touch and keyboard.
- Safe areas, portrait-vs-landscape and viewport camera remain design decisions.
- Avoid tiny tap targets, hover-only menus, scrolling while swiping, and a HUD that hides oncoming obstacles.
- Consider reduced camera shake and flashing effects; use contrast, not only hue, to indicate hazards.
- Focus states and keyboard path should let a player navigate menu and restart without mouse.

## Acceptance questions

- Can a first-time visitor start without login or reading a manual?
- Are jump/switch hazards distinct at mobile size?
- Can players mute audio? Does play still work when muted?
- Does gameplay survive switching tab or losing focus gracefully (pause rather than surprise loss is proposed)?
- Can the user retry without a page reload?

**Related:** `02_GAMEPLAY.md`, `09_QA_AND_RELEASE.md`.
