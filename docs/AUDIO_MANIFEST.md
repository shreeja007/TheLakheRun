# Audio provenance and technical manifest — T012

**Project:** Lakhey Run: The Guardian's Challenge  
**Ticket:** `tasks/T012_AUDIO_HUD_AND_GAME_FEEL.md`  
**Architecture:** 100% Procedural Web Audio API Synthesis (`src/audio/SoundManager.ts`)  
**External Sample Dependencies:** **ZERO** (0 bytes external audio, 0 audio network requests)  
**Licensing Status:** 100% Original Procedural Synthesizer Code — Zero Copyright Claims / Completely Free of Sample Royalty or Sacred Record Restrictions  

---

## 1. Cultural Grounding & Instrument Emulation

All audio in *Lakhey Run* is synthesized mathematically in real-time, inspired by the festival music of Kathmandu's Indra Jatra / Yenya:

1. **Newar Dhime (Dhimay) Double-Headed Drum:**
   - **Mankhah (Bass Head):** Palm face strike synthesized using a frequency-dropped sine fundamental ($92\text{ Hz} \to 36\text{ Hz}$ over $380\text{ ms}$) blended with waveshaped triangle body resonance ($130\text{ Hz} \to 45\text{ Hz}$) through an analog saturation curve and dense noise transient ($850\text{ Hz}$ bandpass slap).
   - **Nasah (Treble Head):** Stick face strike (*chatacha*) synthesized using a sharp rim crack transient ($2,600\text{ Hz}$ bandpass, $Q=3.2$) coupled with an exponential high resonant ping ($460\text{ Hz} \to 220\text{ Hz}$).
   - **Traditional Galloping Cadence:** 16-step rhythmic pattern (Dha-Chya, Tak, Gha, Dha, Tak, Tak...) accelerating dynamically from 134 BPM up to 158 BPM as Lakhey closes in.
2. **Bhusya (Bronze Cymbals):**
   - Synthesized using dual-filtered metallic white noise ($4,800\text{ Hz}$ highpass + $7,800\text{ Hz}$ peaking filter at $+8\text{ dB}$, $Q=4.0$), producing shimmering metallic clashes on accented downbeats.
3. **Sub-Bass Tension Dread Drone:**
   - A $42\text{ Hz}$ low-pass filtered sawtooth drone ($95\text{ Hz}$ cutoff) whose amplitude scales smoothly with Lakhey's distance ($0.0\text{ vol}$ at $4.2\text{m}$, intensifying to $0.28\text{ vol}$ at $1.2\text{m}$).
4. **Physical Movement Sound Effects (No Cartoon Boings):**
   - **Athletic Dodge:** Downward resonant bandpass air displacement whoosh ($2,400\text{ Hz} \to 450\text{ Hz}$).
   - **Athletic Jump:** Low ground push-off punch ($95\text{ Hz} \to 48\text{ Hz}$) combined with an upward air updraft rush ($380\text{ Hz} \to 1,750\text{ Hz}$).
   - **Pavement Landing:** Heavy stone footstep thump ($110\text{ Hz} \to 45\text{ Hz}$) with high-frequency cobblestone slap ($950\text{ Hz}$).
   - **Guardian Stomp:** Sub-bass seismic earth vibration ($65\text{ Hz} \to 32\text{ Hz}$) accompanied by low cobblestone rumble ($220\text{ Hz}$).
   - **Challenge Conclusion:** Thunderous rapid drum rolls culminating in a cymbal crash and $80\text{ Hz} \to 25\text{ Hz}$ sub-bass shockwave.

---

## 2. Browser Autoplay & User Gesture Compliance

- **Web Audio Context Lifecycle:** The browser's `AudioContext` remains uncreated/idle on initial page load, strictly respecting Chromium, Safari, and Firefox autoplay policies.
- **Gesture Activation:** The audio context unlocks and initializes on the very first allowed user gesture (tap on Start banner, click on Play button, or pressing Space).
- **Discoverable Mute Affordance:** The HUD contains a prominent top-right button (`btn-audio-toggle`) toggling `masterGain` between `0.85` and `0.0`. State is reflected with explicit text (`Dhime Drums: ON` / `Music: MUTED`).

---

## 3. Cultural Boundary Compliance (`AGENTS.md`)

- Zero samples were captured or transcribed from sacred secret ceremonies, consecrated tantric mantras, or unreleased private recordings.
- The procedural algorithm uses public folk festival percussion patterns commonly performed in open Kathmandu public squares during Indra Jatra.
