# Lakhey Run — Tuku Visual Turnaround Specification (v0.2)

**Date:** 2026-10-09  
**Owner:** Game Director (approval required)  
**Prepared for:** Concept artist, Blender modeler, and Codex implementation agent  
**Status:** Detailed DESIGN PROPOSAL; **not** authorization to build or publish final art  
**Related documents:** `LAKHEY_RUN_TUKU_CHARACTER_DESIGN_V01.md`, `LAKHEY_RUN_GAME_VISION_STORY_V01.md`, `INDRA_JATRA_GAME_PROJECT_MEMORY_CURRENT.md`

## 1. Design mission

Tuku is an original, quick-witted **young adult festival-goer in contemporary Kathmandu**: cheeky, agile, kind, and expressive. They are the playable runner in a short 3D browser game. Their clothes combine **modern everyday streetwear** with restrained, *invented* border-and-weave details informed by research into Newar clothing and textile craftsmanship. Tuku is **not Jhyalincha**, not a ritual performer, and not a reconstruction of any particular sacred or ceremonial garment.

The character must remain legible from behind at small mobile gameplay sizes. Their movement and outfit should feel practical, not cosplay-like. The name **Tuku** is a provisional fictional nickname; do not claim a Nepal Bhasa meaning without review.

### Relationship to earlier concept (important change)

The original Tuku v0.1 proposed **orange neckerchief + cream trousers**. The subsequent agreed-to contemporary/Newar-inspired design discussion favored **short maroon scarf + warm-cream longline inner shirt + charcoal tapered trousers**, with orange reduced to one tiny accent. **This document records that newer outfit variant explicitly; it does not silently rewrite the older project memory.** It becomes the new baseline only after owner approval of the turnaround.

## 2. Body, pose, and model scale

- **Apparent age:** around 18–22, unmistakably young adult rather than a child.
- **Build:** lean, lightly athletic, approachable; no superhero muscles or exaggerated proportions.
- **Styling:** believable stylized 3D; moderately expressive head/hands, grounded human proportions; target approximately **6.75–7 heads high**, tunable after concept review.
- **Neutral sheet pose:** relaxed **A-pose**, both feet level and shoulder-width, arms 25–35° away from torso. Fingers gently separated so a modeler can rig them; no heroic pose in orthographic views.
- **Working model height:** **1.68 m** for Blender scale reference only, to be adapted to gameplay camera and collider.
- **Gender presentation:** intentionally open / broadly androgynous until the owner approves a more specific characterization.
- **Skin and facial features:** naturalistic Kathmandu-local casting cues without stereotyping. Use a plausible warm medium-brown value in first concept for consistency; variation is possible later. Avoid treating one skin tone, hairstyle, or facial feature as an ethnic template.

## 3. Clothing pieces and construction

1. **Teal cropped jacket / overshirt** — dusty medium teal (`#2F7875` proposed), matte canvas or cotton; slightly boxy but fitted enough for a fast run; open front, short standing/soft collar, cuff seams; hem rests at upper hip. Teal is the main rear-camera silhouette color.
2. **Longline inner shirt** — warm cream (`#E8DDCA` proposed), soft cotton; simple band/open neckline, longer than jacket by roughly 8–10 cm, side slits approximately 6 cm. A subtle vertical placket and two tiny seam details, but no ceremonial construction.
3. **Tapered pants** — warm charcoal (`#2D3438` proposed), modern flexible trousers/joggers with narrow ankles and articulated knees; no overly baggy hanging fabric.
4. **Shoes** — charcoal street shoes with low-contrast warm-cream soles and a **single tiny marigold** (`#DEA94B`) heel-tab or lace mark. No ceremonial footwear.
5. **Short maroon scarf / neck wrap** — muted brick maroon (`#8C414B` proposed), close to neck, one short offset tail in front (approximately 10–14 cm). **No long cloth tails or real-time fabric simulation**. Small border bands can use dark charcoal/brick red/cream; avoid claiming these are a specific traditional weave.
6. **Crossbody satchel** — compact charcoal canvas bag on **right rear hip**, roughly 18 × 15 × 5 cm relative to the 1.68 m figure. Strap runs from the **wearer's left shoulder** diagonally to right hip. Bag should clear the right elbow and thigh in a sprint; no bouncing prop physics required.
7. **Hair** — short dark brown/near-black (`#25292B`), somewhat untidy, with a slight upward or sideways sweep visible from front and back; no headpiece.

All detailing is subordinate to the major color blocks and silhouette. Accessories do not imply an inventory or collectibles system.

## 4. Orthographic turnaround views

**Rule for all views:** identical scale, same A-pose, level ground line, flat neutral backdrop, orthographic camera with no perspective distortion. Draw or render a single consistent design, not different outfit variations. Show face, jacket hem, scarf, strap, pants, bag, and shoe details clearly.

### A. FRONT — character introduction

- Slightly tousled dark hair, swept asymmetrically; youthful face with expressive brows, attentive eyes, restrained mischievous half-smile.
- Short maroon neck wrap at collar, with the knot/off-center tuck on **wearer's left** and one very short front tail. It must not hide the chin or jacket silhouette.
- Cropped teal jacket worn open so a cream vertical panel and the lower portion of the longline shirt are visible.
- Shirt placket simple and unadorned. A narrow, original two- or three-line textile-inspired border may appear at **one sleeve cuff** and a small portion of the scarf, not across the whole outfit.
- Thin satchel strap descends diagonally from **wearer's left shoulder** to **right hip**; not a thick band that cuts the torso visually in half. Bag edge barely visible on wearer's right.
- Charcoal tapered trousers with knee shaping, cropped just above low charcoal shoes. One small marigold accent only, ideally at shoe heel or scarf stitch.
- Hands relaxed, fingers visible in A-pose for rigging; no props or symbolic gestures.

### B. LEFT PROFILE — clothing depth

- Head shape readable; hair sweep not a tall anime spike. Small, natural nose/chin projection.
- Jacket layered over inner shirt with **clear 8–10 cm hem difference**, visible at hip.
- Scarf rests close to collar; little/no protruding tail that might clip through the arm while running.
- Bag sits on far side; strap follows shoulder and torso, never floating away from the mesh.
- Slightly athletic stance with neutral vertical spine for turnaround; dynamic forward lean belongs in the separate RUN animation.
- Shoes have flexible, low-profile soles; avoid bulky fantasy boots.

### C. RIGHT PROFILE — prop placement and clipping

- Show satchel on the right-rear hip; bottom should end above the swinging upper thigh and not cover the knee.
- Bag has rounded rectangle construction, one flap seam, one small tab; no metal ornament or sacred motif.
- Strap follows chest/back path plausibly and is anchored at the bag's two sides.
- Shirt side slit visible below cropped jacket; trousers narrow toward ankles.
- Confirm arm swing can clear the satchel without penetration.

### D. BACK — **most important gameplay view**

- Wide readable **teal jacket back** is the biggest color mass; visible seam at shoulders, optional center-back yoke, **no large illustrated emblem**.
- Dark strap clearly crosses from **wearer's left shoulder toward their right hip** and leads to small bag on right rear hip. Avoid oversized bag that obscures hips, arm swing, or jump silhouette.
- Maroon scarf visible as a narrow band under hair at back of neck; no flapping cape-like tails.
- Approximately 8–10 cm of warm-cream longline shirt visible below teal hem, separating jacket from charcoal trousers.
- Hair should have one characteristic irregular sweep visible from behind.
- Tapered pants create two clean readable leg shapes in running poses; footwear has tiny cream sole edge or single marigold mark.
- At small resolution, viewer must quickly identify **teal torso + diagonal strap + cream under-hem + slim dark legs**.

### E. Optional three-quarter poses for personality review

- **Front 3/4:** playful grin and curious eyebrow, one foot casually forward. Not for orthographic modeling.
- **Rear 3/4:** jogging stance used to check silhouette, layered shirt and satchel clearance. Not for base rig pose.

## 5. Materials, palette, and culture-safe trim

| Slot | Proposed HEX | Material/look | Notes |
|---|---|---|---|
| Jacket | `#2F7875` | matte woven cotton/canvas | primary gameplay readability |
| Inner shirt | `#E8DDCA` | lightweight off-white cotton | shows below jacket |
| Pants | `#2D3438` | soft charcoal twill | subdued |
| Scarf | `#8C414B` | woven, low-contrast bands | short neck wrap |
| Dark trim / satchel | `#25292B` | canvas/leather-like, no gloss | no ornate fixtures |
| Marigold accent | `#DEA94B` | stitch/tab only | under ~2% of visual area |
| Shoe soles | `#D7CDBE` | weathered rubber | restrained contrast |

**Cultural grounding:** community documentation of Newar clothing describes homespun textiles, weaving, the traditional long shirt (*tapālan*) and fitted trousers (*suruwā*), among other garments. Here, layering and textile craftsmanship inspire the **design principles**. The small geometric stripe or stepped shape is **original decoration**, not an asserted historical Newar motif. Do not copy a hāku patāsi, a ceremonial sash, a ritual cap, or exact sacred patterns. Obtain culturally knowledgeable review before marketing the details as Newar-inspired.

**Reference:** Jhi Newa, *Newar Traditional Clothing*: https://www.newar.com.np/newar-traditional-clothing/ . Historical/contextual reference only, not a license to reuse photos or exact costume designs.

## 6. Concept sheet layout to commission

Deliver one sheet with consistent art direction and these **labeled panels**:

1. **FRONT (orthographic, color)**
2. **LEFT SIDE (orthographic, color)**
3. **BACK (orthographic, color)**
4. **RIGHT SIDE (orthographic, color)**
5. **FRONT 3/4 EXPRESSION** (small inset)
6. **DETAIL INSETS**: scarf border / jacket cuff / strap attachment / bag flap / shoe heel

Add a small neutral-value silhouette strip beneath front and back: preview both at **~120 px tall and ~70 px tall** to confirm camera readability, independent of fine-texture details. Keep all four orthographic figures identical in height and baseline. Suggested sheet canvas: at least **3200 × 2000 px**, crisp outlines and text, no atmosphere/background scenery.

If a reference image is generated with AI for concept development, require a consistency pass by the art reviewer: the bag, strap, scarf placement, colors, and proportions **must match across all views** before anyone attempts to model it. Single-shot generated turnaround views often disagree.

## 7. First playable model — production boundary for Codex

The full turnaround is **art-direction input**, not an instruction to model a polished final character immediately. The first authorized Codex task should be a **silhouette blockout** after game-engine feasibility is established:

- Editable Blender file and reproducible modeling script if procedural.
- Solid-color blockout for head, jacket, longline shirt, trousers, shoes, scarf, and bag/strap.
- GLB export, front/profile/back preview renders, and **rear-camera browser screenshot**.
- One static pose initially. After approval, rig and animation become a separate task.
- When polished later, a working guideline is **5k–10k triangles**, **1–2 materials**, efficient textures, and no real-time cloth simulation; verify targets on mobile rather than treating them as guarantees.
- Later animation set: RUN, JUMP, GAME_OVER/STUMBLE; simple bones/rig with exportable clips, correct grounded pivot and forward direction.

Do **not** add a costume shop, props to collect, special powers, cinematic choreography, or full facial performance because of this design document.

## 8. Acceptance tests for art director

- [ ] From behind at phone scale, silhouette remains recognizable without needing to read cloth texture.
- [ ] Teal remains distinct against reddish Kathmandu brick and a red-dominant Lakhey.
- [ ] Front, left, right, and back **show exactly the same garment construction and strap path**.
- [ ] Scarf and satchel do not clip during RUN / JUMP tests.
- [ ] Layered shirt is clearly visible from the rear without looking ceremonial.
- [ ] Textiles feel crafted, but decorative patterns are original/non-sacred and do not imply authentic ritual clothing.
- [ ] Tuku appears to be a young adult and is visibly distinct from Jhyalincha.
- [ ] No sacred marks, masks, priestly garments, ceremonial props, religious iconography, or ritual dance poses.
- [ ] Model opens in Blender, exports cleanly as GLB, and displays correctly in a phone browser.
- [ ] Team reviews sheet before committing to a final rigged hero asset.

## 9. Open approvals

1. **Approve** or modify this new outfit variant vs. original orange/cream-trouser proposal.
2. Confirm whether Tuku should have a more specific gender presentation; the current sheet is broadly androgynous.
3. Confirm primary mobile camera orientation (portrait vs. landscape); rear silhouette must work with the final camera framing.
4. Validate working nickname with local speakers before publication.
5. Arrange local cultural review of the final Newar-inspired textile treatment and separate Lakhey visual design.

---

**Director's one-sentence approval test:** "I can recognize Tuku instantly from behind as a playful modern Kathmandu local, and nothing about the outfit falsely suggests a sacred or traditional performance costume."
