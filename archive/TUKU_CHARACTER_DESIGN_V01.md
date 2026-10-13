# Lakhey Run - Player Character Design: Tuku (Draft v0.1)

Date: 2026-10-09
Owner: Game Director
Planning: ChatGPT
Production: Codex in VS Code, only after art/ticket approval
Status: PLAYER ARCHETYPE CONFIRMED; NAME, LOOK, BACKSTORY, ANIMATIONS AND TECHNICAL BUDGETS PROPOSED

## 1. Approved design boundary

- APPROVED: The playable character is an original, playful trickster inspired by the spirit of the Lakhey-Jhyalincha interaction, NOT a literal Jhyalincha depiction or ritual reenactment.
- APPROVED: The first game remains a friendly guardian chase, a short-session web-based 3D runner, not a combat or story-heavy game.
- The game and its inventions must distinguish fiction from Indra Jatra traditions and receive informed cultural review before final ceremonial character work or public promotion.

## 2. Character pitch (PROPOSED)

Working nickname: **Tuku**. This is a fictional placeholder; it is not asserted to be a Newar-language term or culturally recognized nickname. Confirm language, local appropriateness, branding and availability before publication.

Tuku is a lively young adult festival-goer (visually about 18-22), known for a playful grin, lightning-fast steps, quick thinking and celebrating escapes a moment too early. Tuku is cheeky but kind; they never harass people, vandalize sacred objects or interrupt processions. The character's humor comes from small, expressive reactions and overconfidence rather than insulting Lakhey.

Emotional qualities: likeable, agile, curious, brave, expressive, optimistic.

Game relationship: Tuku accepts a fictional, friendly agility challenge from an awe-inspiring guardian. Lakhey is never portrayed as a murderous villain. If caught, the game ends in an energetic nonviolent flourish and instant-retry opportunity.

## 3. Visually distinct from Jhyalincha (BOUNDARIES)

- Do not copy Jhyalincha's reported blue/white ceremonial costume, mask, performance props, or traditional dance gestures.
- Do not call Tuku Jhyalincha, identify Tuku as an authentic ritual participant, or present the game's chase as a factual ritual.
- No sacred markings, ritual masks, ceremonial tools or festival objects as comic trophies or damageable gameplay props.
- The game takes place on an imaginary side street inspired by old Kathmandu, not an authenticated reenactment of any specific procession route.
- Tuku should be age-coded as a young adult, not the ritual child performer.
- Lakhey design remains separately subject to consultation with cultural stakeholders.

## 4. Visual direction (PROPOSED)

Style: believable stylized 3D, slightly exaggerated adult proportions, hand-crafted material feel, visible facial expressions. Not photorealism and not a superhero costume.

Primary silhouette from the third-person camera:
- Short tousled hair with one recognizable upward sweep, but no ceremonial headgear.
- Compact, cropped teal jacket with a distinctive marigold-orange neckerchief (short, to avoid cloth simulation).
- Off-white comfortable tapered trousers; charcoal lightweight shoes.
- One simple diagonal crossbody satchel strap across the back for readability; no item-collection system implied.
- Playful, springy lean-forward running posture, quick knees and light, agile arm swings.

Proposed starting palette (test for contrast with red brick streets and crimson Lakhey):
- Teal jacket #147D7A
- Marigold-orange accent #E8A43A
- Warm cream trousers #EADFC8
- Charcoal shoes / dark hair #26343A
- Natural, varied skin tone selected with care and without caricature.

Avoid long scarves, simulated hair, layers of cloth, fine jewelry, detailed embroidery that cannot be read at mobile size, and excessive props.

Design test: Tuku must remain identifiable when viewed mostly from behind at smartphone gameplay scale. Teal should separate the runner from brick walls and Lakhey's red dominant palette.

## 5. Personality and motion (PROPOSED)

- Idle or start: a small bounce on the heels, alert eyes, one quick friendly wave, then forward launch.
- Running: rhythmic but not copying ritual choreography; springy, brave, eager.
- Lane switch: short lean toward the chosen lane; responsive and clear.
- Jump: knees tuck slightly, lightweight landing, no acrobatic flips required.
- Near miss: tiny surprised shoulder reaction / quick happy head turn if it does not obscure obstacle recognition.
- Mistake: brief recoverable stumble and a worried glance backwards if a forgiving chase mechanic is later approved.
- Catch/game over: no harm; playful surprise while Lakhey ends the challenge with a culturally reviewed, nonviolent movement.

Required first-pass animations: RUN, JUMP, GAME_OVER/STUMBLE. Optional after gameplay works: IDLE, CELEBRATE, LOOK_BACK. Avoid voice acting and complex facial rigs in the first prototype.

## 6. Proposed opening micro-scene (not an authentic ritual)

On a fictional decorated side street, drums sound in the distance. Tuku glances back and shares a playful grin, as if accepting a challenge. An imposing guardian silhouette reacts; the camera falls behind Tuku and the running begins. Keep under roughly 8-12 seconds, skippable. No staged disruption of a sacred procession and no theft of ritual objects.

## 7. Codex asset workflow, once approved

A. SILHOUETTE TEST: Build a simple placeholder Tuku in Blender using accessible source files or a reproducible Blender Python script; export GLB, deliver three preview angles and an in-camera browser screenshot. Check size/readability on a phone first.

B. RIG AND MOTION: After visual approval, add a reusable humanoid armature and basic run/jump/game-over clips. Maintain straightforward animation names and reproducible exports. Test actual browser playback and pivot/collider alignment.

C. POLISH: After gameplay feels good, refine materials and expressions while preserving silhouette and mobile performance.

Deliverables per approved ticket: .blend or equivalent editable source, scripts if used, .glb, preview renders, animation list, attribution/license information, and a short verification note.

Working asset constraints, not hard commitments until tested: single compact rigged character, approximately 5k-10k triangles when polished, ideally 1-2 materials, restrained texture use, no realtime cloth simulation. The first graybox can be far simpler. Test loading, frame rate and animation on midrange mobile hardware.

## 8. Scope restrictions

NO skill tree, outfit shop, spoken dialogues, multiple character variants, wall running, complex tricks, costume unlocks or cinematic story sequences in Version 1. Personal expressiveness should come from silhouette, movement and a few small reactions.

## 9. Review questions still open

1. Approve or rename Tuku. Confirm desired cultural/linguistic fit with knowledgeable local speakers.
2. Approve teal-orange everyday outfit and crossbody strap, or request another look.
3. Decide mobile portrait vs landscape; final rear silhouette is camera-dependent.
4. Confirm exact runner age/style and gender presentation, if needed.
5. Review story/costume/movement with knowledgeable Newar community representatives before final art/public communication.
6. Approve a silhouette-only Codex ticket after game-engine feasibility work; do NOT commission final model prematurely.

## 10. Reference sources (cultural grounding only, not model/textures licensing)

- The Kathmandu Post (2014), "Bucking tradition to keep a tradition alive": https://kathmandupost.com/miscellaneous/2014/09/05/bucking-tradition-to-keep-a-tradition-alive
- Google Arts & Culture / ICHCAP, "Infamous but Captivating Lakhe Dance of Nepal": https://artsandculture.google.com/story/7wVxVo4jDR4cLA
- The Kathmandu Post (2020), "The thin line between artistic homage and cultural appropriation": https://kathmandupost.com/art-culture/2020/09/04/the-thin-line-between-artistic-homage-and-cultural-appropriation

These cultural references describe a living tradition; the proposed fictional character is not a reconstruction of Jhyalincha.
