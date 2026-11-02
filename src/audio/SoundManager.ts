/**
 * SoundManager — Procedural Audio Engine for Lakhey Run
 *
 * Culturally grounded in Kathmandu's Indra Jatra (Yenya) festival:
 * - Dhime (Dhimay) double-headed drum: deep resonant Mankhah palm bass + sharp Nasah chatacha stick crack.
 * - Bhusya bronze cymbals: metallic clashes and rhythmic accents.
 * - Guardian footsteps & menacing sub-bass dread drone.
 * - Athletic player sprint footsteps, wind-rush dodges, and stone landing thuds (NO CARTOON SINE BOINGS).
 *
 * 100% Procedural Web Audio API — zero external audio assets, zero licensing risks, instant load.
 */
import type { JumpStyle, SlideStyle, DodgeStyle } from '../types';

export class SoundManager {
  private ctx: AudioContext | null = null;
  private isMutedState = false;
  private masterGain: GainNode | null = null;
  private distortionNode: WaveShaperNode | null = null;

  // Music loop state
  private isMusicPlaying = false;
  private baseTempoBpm = 134; // Driving festival cadence
  private currentTempoBpm = 134;
  private nextNoteTime = 0;
  private currentBeat = 0;
  private timerId: number | null = null;
  private isUrgent = false;

  // Proximity Tension Sub-Bass Drone
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext(): boolean {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMutedState ? 0 : 0.85;
      this.masterGain.connect(this.ctx.destination);

      // Warm analog saturation waveshaper for thunderous drum presence
      this.distortionNode = this.ctx.createWaveShaper();
      this.distortionNode.curve = this.createDistortionCurve(18) as Float32Array<ArrayBuffer>;
      this.distortionNode.oversample = '2x';
      this.distortionNode.connect(this.masterGain);

      // Start sub-bass proximity drone
      this.initTensionDrone();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return true;
  }

  private createDistortionCurve(amount: number): Float32Array {
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  private initTensionDrone(): void {
    if (!this.ctx || !this.masterGain) return;

    this.droneOsc = this.ctx.createOscillator();
    this.droneGain = this.ctx.createGain();

    this.droneOsc.type = 'sawtooth';
    this.droneOsc.frequency.setValueAtTime(42, this.ctx.currentTime); // Low 42Hz dread rumble

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(95, this.ctx.currentTime);

    this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime); // Silent by default

    this.droneOsc.connect(filter);
    filter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc.start();
  }

  public unlock(): void {
    this.initContext();
    if (!this.isMusicPlaying && !this.isMutedState) {
      this.startMusic();
    }
  }

  public toggleMute(): boolean {
    this.isMutedState = !this.isMutedState;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMutedState ? 0 : 0.85, this.ctx.currentTime);
    }
    // START/Resume owns music startup. Unmuting must not restart a paused run.
    return this.isMutedState;
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  // --- Thunderous Newar Dhime Synthesis ---

  /**
   * Explosive Opening Festival Flourish — Signals chase kickoff with dramatic Dhime drum roll & bronze cymbals
   */
  public playIntroFlourish(): void {
    if (!this.initContext() || !this.ctx) return;
    const now = this.ctx.currentTime;
    // Dramatic Dhime triplet "Dhā - n - ti - ki - tā!"
    this.playDhimeBass(now, 1.4);
    this.playBhusyaCymbal(now, true);
    this.playDhimeStickCrack(now + 0.12, 1.1);
    this.playDhimeStickCrack(now + 0.22, 1.2);
    this.playDhimeBass(now + 0.34, 1.5);
    this.playBhusyaCymbal(now + 0.34, true);
  }

  /**
   * Heavy, chest-thumping Dhime Bass strike (Mankhah palm face)
   */
  public playDhimeBass(time: number, accent = 1.0): void {
    if (!this.ctx || !this.masterGain || !this.distortionNode) return;

    // 1. Sub-bass fundamental drop (92Hz down to 36Hz)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(92 * accent, time);
    subOsc.frequency.exponentialRampToValueAtTime(36, time + 0.35);

    subGain.gain.setValueAtTime(1.1 * accent, time);
    subGain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(time);
    subOsc.stop(time + 0.4);

    // 2. Overdriven leather body resonance through waveshaper
    const bodyOsc = this.ctx.createOscillator();
    const bodyFilter = this.ctx.createBiquadFilter();
    const bodyGain = this.ctx.createGain();

    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(130 * accent, time);
    bodyOsc.frequency.exponentialRampToValueAtTime(45, time + 0.22);

    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(190, time);

    bodyGain.gain.setValueAtTime(0.75 * accent, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    bodyOsc.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(this.distortionNode);
    bodyOsc.start(time);
    bodyOsc.stop(time + 0.26);

    // 3. Dense impact punch transient (stretched goat/cow leather skin slap)
    this.playNoiseBurst(time, 0.035, 850, 1.4, 0.6 * accent);
  }

  /**
   * Sharp, cracking Dhime Stick strike (Nasah face with chatacha stick)
   */
  public playDhimeStickCrack(time: number, accent = 1.0): void {
    if (!this.ctx || !this.masterGain) return;

    // 1. Sharp wooden rim crack transient
    this.playNoiseBurst(time, 0.045, 2600, 3.2, 0.55 * accent);

    // 2. Resonant high pitch ping
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(460 * accent, time);
    osc.frequency.exponentialRampToValueAtTime(220, time + 0.06);

    gain.gain.setValueAtTime(0.4 * accent, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.08);
  }

  /**
   * Clashing Bhusya Bronze Cymbals
   */
  public playBhusyaCymbal(time: number, isAccent = false): void {
    if (!this.ctx || !this.masterGain) return;

    const duration = isAccent ? 0.32 : 0.12;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Dual filters for metallic bronze timbre
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(4800, time);

    const metalPeak = this.ctx.createBiquadFilter();
    metalPeak.type = 'peaking';
    metalPeak.frequency.setValueAtTime(7800, time);
    metalPeak.Q.setValueAtTime(4.0, time);
    metalPeak.gain.setValueAtTime(8.0, time);

    const gain = this.ctx.createGain();
    const vol = isAccent ? 0.55 : 0.28;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(highpass);
    highpass.connect(metalPeak);
    metalPeak.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + duration + 0.05);
  }

  /**
   * Heavy Guardian Stomp — earth-shaking footfall vibration
   */
  public playGuardianStomp(volume = 0.5): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

    gain.gain.setValueAtTime(volume * 0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.21);

    // Low cobblestone rumble
    this.playNoiseBurst(now, 0.08, 220, 1.2, volume * 0.4);
  }

  /**
   * Athletic Player Sprint Footstep — crisp cobblestone patter
   */
  public playFootstep(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.playNoiseBurst(now, 0.025, 1400, 1.8, 0.14);
  }

  // --- Real Physical Movement Sound Effects (NO CARTOON BOINGS) ---

  /**
   * Rapid Athletic Sprint Dodge — with distinct procedural whooshes for each dodge style:
   * - Variant 0: Skater Carve Swipe — sharp lateral carving air whoosh
   * - Variant 1: Lateral Barrel Hop — buoyant parabolic hop whoosh with air lift
   * - Variant 2: 360° Spin Quick-Step — rapid double-whip cloth pirouette whoosh
   */
  public playDodgeSound(variant: DodgeStyle = 0): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    if (variant === 1) {
      // Style 1: Lateral Barrel Hop — buoyant parabolic hop whoosh with air lift
      const duration = 0.18;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(3.2, now);
      filter.frequency.setValueAtTime(420, now);
      filter.frequency.exponentialRampToValueAtTime(1650, now + 0.08);
      filter.frequency.exponentialRampToValueAtTime(580, now + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      return;
    }

    if (variant === 2) {
      // Style 2: 360° Spin Quick-Step — rapid double-whip cloth pirouette whoosh
      const playSpinWhip = (startTime: number, startFreq: number, endFreq: number, vol: number) => {
        if (!this.ctx || !this.masterGain) return;
        const dur = 0.09;
        const bSize = Math.floor(this.ctx.sampleRate * dur);
        const buf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bSize; i++) d[i] = Math.random() * 2 - 1;

        const src = this.ctx.createBufferSource();
        src.buffer = buf;

        const flt = this.ctx.createBiquadFilter();
        flt.type = 'bandpass';
        flt.Q.setValueAtTime(3.5, startTime);
        flt.frequency.setValueAtTime(startFreq, startTime);
        flt.frequency.exponentialRampToValueAtTime(endFreq, startTime + dur);

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(vol, startTime);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        src.connect(flt);
        flt.connect(g);
        g.connect(this.masterGain);
        src.start(startTime);
      };

      playSpinWhip(now, 1800, 3200, 0.48);
      playSpinWhip(now + 0.07, 3400, 950, 0.52);
      return;
    }

    // Style 0: Skater Carve Swipe — sharp lateral carving air whoosh
    const duration = 0.14;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Resonant bandpass sweeping down creates realistic whoosh of displaced air
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.2, now);
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(450, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  /**
   * Powerful Athletic Jump — with unique procedural audio stems for each jump style:
   * - Variant 0: Normal Parkour Vault — ground push-off punch and upward air updraft rush
   * - Variant 1: Front Flip Somersault — acrobatic aerodynamic dual-phase somersault whoosh
   * - Variant 2: Backward Teasing Jump — upward whoosh with playful airborne harmonic whistle/taunt
   */
  public playJumpSound(variant: JumpStyle = 0): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    if (variant === 1) {
      // Style 1: Front Flip Somersault — Acrobatic aerodynamic somersault whoosh & spin resonance
      // 1. Snappy push-off pop
      const pushOsc = this.ctx.createOscillator();
      const pushGain = this.ctx.createGain();
      pushOsc.type = 'sine';
      pushOsc.frequency.setValueAtTime(130, now);
      pushOsc.frequency.exponentialRampToValueAtTime(55, now + 0.09);

      pushGain.gain.setValueAtTime(0.50, now);
      pushGain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);

      pushOsc.connect(pushGain);
      pushGain.connect(this.masterGain);
      pushOsc.start(now);
      pushOsc.stop(now + 0.11);

      // 2. Dual-phase rotational air whoosh (launch sweep -> inversion spin whip)
      const duration = 0.32;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Resonant bandpass with high Q sweeping up through apex then dropping
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(3.6, now);
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(2900, now + 0.13); // Inversion apex
      filter.frequency.exponentialRampToValueAtTime(750, now + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.55, now);
      gain.gain.linearRampToValueAtTime(0.68, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);

      // 3. Aerodynamic rotational harmonic flutter (simulates spinning body displaced air)
      const spinOsc = this.ctx.createOscillator();
      const spinGain = this.ctx.createGain();
      spinOsc.type = 'triangle';
      spinOsc.frequency.setValueAtTime(320, now + 0.05);
      spinOsc.frequency.linearRampToValueAtTime(560, now + 0.14);
      spinOsc.frequency.exponentialRampToValueAtTime(220, now + 0.28);

      spinGain.gain.setValueAtTime(0.001, now);
      spinGain.gain.linearRampToValueAtTime(0.18, now + 0.12);
      spinGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      spinOsc.connect(spinGain);
      spinGain.connect(this.masterGain);
      spinOsc.start(now + 0.04);
      spinOsc.stop(now + 0.29);
      return;
    }

    if (variant === 2) {
      // Style 2: Backward Teasing Jump — Upward whoosh + playful airborne festival taunt chirp
      // 1. Athletic push-off
      const pushOsc = this.ctx.createOscillator();
      const pushGain = this.ctx.createGain();
      pushOsc.type = 'sine';
      pushOsc.frequency.setValueAtTime(95, now);
      pushOsc.frequency.exponentialRampToValueAtTime(48, now + 0.1);
      pushGain.gain.setValueAtTime(0.42, now);
      pushGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      pushOsc.connect(pushGain);
      pushGain.connect(this.masterGain);
      pushOsc.start(now);
      pushOsc.stop(now + 0.13);

      // 2. Updraft air whoosh
      const duration = 0.24;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(2.6, now);
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(1850, now + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.46, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);

      // 3. Playful airborne harmonic twirl (Newar festival whistle harmonic chirp E6 -> G6)
      const chirpOsc = this.ctx.createOscillator();
      const chirpFilter = this.ctx.createBiquadFilter();
      const chirpGain = this.ctx.createGain();

      chirpOsc.type = 'sine';
      chirpOsc.frequency.setValueAtTime(1318, now + 0.08); // E6
      chirpOsc.frequency.exponentialRampToValueAtTime(1568, now + 0.22); // G6

      chirpFilter.type = 'lowpass';
      chirpFilter.frequency.setValueAtTime(2400, now + 0.08);

      chirpGain.gain.setValueAtTime(0.001, now + 0.08);
      chirpGain.gain.linearRampToValueAtTime(0.22, now + 0.13);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      chirpOsc.connect(chirpFilter);
      chirpFilter.connect(chirpGain);
      chirpGain.connect(this.masterGain);

      chirpOsc.start(now + 0.08);
      chirpOsc.stop(now + 0.26);
      return;
    }

    // Style 0: Normal Parkour Hurdle Vault
    // 1. Ground push-off punch
    const pushOsc = this.ctx.createOscillator();
    const pushGain = this.ctx.createGain();
    pushOsc.type = 'sine';
    pushOsc.frequency.setValueAtTime(95, now);
    pushOsc.frequency.exponentialRampToValueAtTime(48, now + 0.1);

    pushGain.gain.setValueAtTime(0.45, now);
    pushGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    pushOsc.connect(pushGain);
    pushGain.connect(this.masterGain);
    pushOsc.start(now);
    pushOsc.stop(now + 0.13);

    // 2. Updraft air whoosh
    const duration = 0.2;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.5, now);
    filter.frequency.setValueAtTime(380, now);
    filter.frequency.exponentialRampToValueAtTime(1750, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  /**
   * Fast Athletic Pavement Slide — with unique procedural audio stems for each slide style:
   * - Variant 0: Temple Run Flagstone Glide — smooth gritty stone friction scrape & rumble
   * - Variant 1: Parkour Dive Roll — low aerodynamic whoosh + cushioned tactile ground roll
   * - Variant 2: Rockstar Double-Knee Slide — intense prolonged dual-knee stone skid grit & friction rasp
   */
  public playSlideSound(variant: SlideStyle = 0): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    if (variant === 2) {
      // Style 2: Rockstar Double-Knee Power Slide — High-friction stone skid grit & resonant fabric scrape
      const duration = 0.48; // Extended dramatic slide duration
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      // 1. High-frequency stone skid grit sizzle
      const noiseHigh = this.ctx.createBufferSource();
      noiseHigh.buffer = buffer;

      const filterHigh = this.ctx.createBiquadFilter();
      filterHigh.type = 'bandpass';
      filterHigh.Q.setValueAtTime(3.8, now);
      filterHigh.frequency.setValueAtTime(2600, now);
      filterHigh.frequency.exponentialRampToValueAtTime(950, now + duration);

      const gainHigh = this.ctx.createGain();
      gainHigh.gain.setValueAtTime(0.58, now);
      gainHigh.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseHigh.connect(filterHigh);
      filterHigh.connect(gainHigh);
      gainHigh.connect(this.masterGain);
      noiseHigh.start(now);

      // 2. Mid-register flagstone friction rasp
      const noiseMid = this.ctx.createBufferSource();
      noiseMid.buffer = buffer;

      const filterMid = this.ctx.createBiquadFilter();
      filterMid.type = 'bandpass';
      filterMid.Q.setValueAtTime(2.6, now);
      filterMid.frequency.setValueAtTime(1150, now);
      filterMid.frequency.exponentialRampToValueAtTime(420, now + duration);

      const gainMid = this.ctx.createGain();
      gainMid.gain.setValueAtTime(0.42, now);
      gainMid.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseMid.connect(filterMid);
      filterMid.connect(gainMid);
      gainMid.connect(this.masterGain);
      noiseMid.start(now);

      // 3. Resonant fabric-on-stone friction bite (double-knee drag against pavement)
      const dragOsc = this.ctx.createOscillator();
      const dragFilter = this.ctx.createBiquadFilter();
      const dragGain = this.ctx.createGain();

      dragOsc.type = 'sawtooth';
      dragOsc.frequency.setValueAtTime(460, now);
      dragOsc.frequency.exponentialRampToValueAtTime(180, now + duration * 0.85);

      dragFilter.type = 'bandpass';
      dragFilter.Q.setValueAtTime(4.2, now);
      dragFilter.frequency.setValueAtTime(540, now);
      dragFilter.frequency.exponentialRampToValueAtTime(260, now + duration * 0.85);

      dragGain.gain.setValueAtTime(0.24, now);
      dragGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.85);

      dragOsc.connect(dragFilter);
      dragFilter.connect(dragGain);
      dragGain.connect(this.masterGain);
      dragOsc.start(now);
      dragOsc.stop(now + duration);

      // 4. Low cobblestone rumble
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + duration);
      oscGain.gain.setValueAtTime(0.45, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.02);
      return;
    }

    if (variant === 1) {
      // Style 1: Parkour Dive Roll — Low aerodynamic whoosh + cushioned tactile ground roll
      const duration = 0.28;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      // 1. Low aerodynamic dive-in whoosh
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(2.8, now);
      filter.frequency.setValueAtTime(1900, now);
      filter.frequency.exponentialRampToValueAtTime(520, now + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.48, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);

      // 2. Sequential cushioned micro-impacts (forearms/shoulder touch, then back roll)
      const playRollThump = (time: number, startFreq: number, endFreq: number, vol: number) => {
        if (!this.ctx || !this.masterGain) return;
        const thumpOsc = this.ctx.createOscillator();
        const thumpGain = this.ctx.createGain();
        thumpOsc.type = 'sine';
        thumpOsc.frequency.setValueAtTime(startFreq, time);
        thumpOsc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.08);

        thumpGain.gain.setValueAtTime(vol, time);
        thumpGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

        thumpOsc.connect(thumpGain);
        thumpGain.connect(this.masterGain);
        thumpOsc.start(time);
        thumpOsc.stop(time + 0.10);
      };

      playRollThump(now + 0.03, 120, 50, 0.36); // Forearm/shoulder contact
      playRollThump(now + 0.13, 95, 42, 0.30);  // Back roll contact
      return;
    }

    // Style 0: Temple Run Flagstone Glide (Classic)
    const duration = 0.38;
    // 1. Gritty stone surface friction abrasion
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.2, now);
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.52, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);

    // 2. Low cobblestone friction rumble
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(68, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + duration * 0.8);
    oscGain.gain.setValueAtTime(0.38, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /**
   * Resonant Guardian Festival Exertion Surge ("Haaa-re!" ceremonial vocal burst)
   */
  public playGuardianRoarExertion(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain || this.isMutedState) return;
    const now = this.ctx.currentTime;
    const duration = 0.55;

    // Formant filter simulating powerful vocal tract resonance
    const osc = this.ctx.createOscillator();
    const formant = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(142, now);
    osc.frequency.linearRampToValueAtTime(158, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(96, now + duration);

    formant.type = 'bandpass';
    formant.Q.setValueAtTime(4.5, now);
    formant.frequency.setValueAtTime(540, now);
    formant.frequency.linearRampToValueAtTime(680, now + 0.18);
    formant.frequency.exponentialRampToValueAtTime(380, now + duration);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.48, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(formant);
    formant.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);

    // Deep sub-bass chest vibration
    this.playNoiseBurst(now, 0.22, 180, 2.0, 0.35);
  }

  /**
   * Celebratory Guardian Outpaced Flourish — Rewarding clean slide/vault escape
   */
  public playGuardianOutpaced(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain || this.isMutedState) return;
    const now = this.ctx.currentTime;

    // 1. Resonant golden temple bell chime (E6 -> A6)
    const bell1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    bell1.type = 'sine';
    bell1.frequency.setValueAtTime(1318.5, now);
    g1.gain.setValueAtTime(0.35, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    bell1.connect(g1);
    g1.connect(this.masterGain);
    bell1.start(now);
    bell1.stop(now + 0.42);

    const bell2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    bell2.type = 'sine';
    bell2.frequency.setValueAtTime(1760.0, now + 0.1);
    g2.gain.setValueAtTime(0.38, now + 0.1);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    bell2.connect(g2);
    g2.connect(this.masterGain);
    bell2.start(now + 0.1);
    bell2.stop(now + 0.58);

    // 2. Energetic rhythmic Dhime kick
    this.playDhimeBass(now + 0.08, 1.25);
  }

  /**
   * Solid Pavement Landing — heavy stone foot plant
   */
  public playLandingSound(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Low stone thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.15);

    // Pavement slap
    this.playNoiseBurst(now, 0.05, 950, 1.5, 0.4);
  }

  /**
   * Dramatic Challenge Conclusion / Lakhey Catch Flourish
   */
  public playCatchFlourish(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Rapid thunderous drum rolls
    this.playDhimeBass(now, 1.2);
    this.playDhimeStickCrack(now + 0.08, 1.2);
    this.playDhimeBass(now + 0.16, 1.4);
    this.playDhimeStickCrack(now + 0.22, 1.3);
    this.playDhimeBass(now + 0.28, 1.6);
    this.playBhusyaCymbal(now + 0.28, true);

    // Deep sub-bass shockwave
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now + 0.28);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.85);

    gain.gain.setValueAtTime(0.8, now + 0.28);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now + 0.28);
    osc.stop(now + 0.95);
  }

  // Pentatonic scale frequency multipliers for ascending arpeggios:
  // Root (1.0), Maj 2nd (1.122), Maj 3rd (1.26), 5th (1.498), Maj 6th (1.682), Octave (2.0), 9th (2.245), 10th (2.52)
  private static readonly PENTATONIC_SCALE = [1.0, 1.122, 1.26, 1.498, 1.682, 2.0, 2.245, 2.52];

  /**
   * Ceremonial Brass Paisa Coin Pickup — pure dual-tone metallic bell chime
   * with musical pentatonic pitch scaling for rapid combo streaks
   */
  public playCoinPickup(comboStep = 0): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const scaleIdx = Math.min(SoundManager.PENTATONIC_SCALE.length - 1, Math.max(0, comboStep));
    const pitchMultiplier = SoundManager.PENTATONIC_SCALE[scaleIdx];

    const baseFreq1 = 1760 * pitchMultiplier;
    const endFreq1 = 1980 * pitchMultiplier;
    const baseFreq2 = 2640 * pitchMultiplier;

    // Harmonic bell chime: Fundamental + High resonance fifth
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq1, now);
    osc1.frequency.exponentialRampToValueAtTime(endFreq1, now + 0.05);

    gain1.gain.setValueAtTime(0.42, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq2, now);

    gain2.gain.setValueAtTime(0.28, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now);
    osc2.stop(now + 0.3);

    // Micro metallic transient tap
    this.playNoiseBurst(now, 0.018, Math.min(12000, 6200 * pitchMultiplier), 3.5, 0.22);
  }

  /**
   * Terracotta Clay Pot Shatter — crisp ceramic fracture + hollow earthen thud
   */
  public playPotSmash(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // 1. Hollow clay pot thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.18);

    // 2. Ceramic crack snap
    this.playNoiseBurst(now, 0.07, 2800, 2.8, 0.55);

    // 3. Earthy clay crumb scatter
    this.playNoiseBurst(now + 0.02, 0.15, 650, 1.4, 0.38);
  }

  /**
   * Heavy Wooden Gate Slide Friction — timber grinding along stone runner
   */
  public playGateSlide(distance = 5.0): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const proxVol = Math.max(0.05, Math.min(0.28, (16.0 - distance) / 16.0 * 0.28));
    this.playNoiseBurst(now, 0.12, 380, 2.2, proxVol);
  }

  /**
   * Earthy Terracotta Pot Rolling Rumble — cobblestone rolling friction
   */
  public playMatkaRoll(distance = 5.0): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const proxVol = Math.max(0.04, Math.min(0.22, (18.0 - distance) / 18.0 * 0.22));
    this.playNoiseBurst(now, 0.08, 220, 1.5, proxVol);
  }

  /**
   * Skill Callout: Clean Vault — dynamic athletic updraft rush + bright golden chime
   */
  public playCleanVaultCallout(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // 1. Aerodynamic updraft whoosh
    this.playNoiseBurst(now, 0.16, 1600, 2.0, 0.35);

    // 2. High harmonic chime (F#6 / C#7 triumphant bell ping)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1480, now);
    osc1.frequency.exponentialRampToValueAtTime(2220, now + 0.08);

    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.32);
  }

  /**
   * Skill Callout: Close Call / Near Miss — adrenaline-pumping whoosh + razor-sharp tension ping
   */
  public playNearMissCallout(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // 1. Resonant brush whoosh
    const duration = 0.15;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(4.5, now);
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(650, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.48, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);

    // 2. Sharp high-tension metallic snap
    const osc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.06);

    snapGain.gain.setValueAtTime(0.3, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(snapGain);
    snapGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * Multiplier Upgrade: Power chord swell ascending with multiplier tier (2x - 8x)
   */
  public playMultiplierUp(multiplier: number): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const multTier = Math.max(1, Math.min(8, multiplier));
    const baseFreq = 523.25 * Math.pow(1.122, multTier); // Ascending scale

    // Resonant bell chord: Fundamental + 5th
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now);

    const vol = Math.min(0.42, 0.22 + multTier * 0.025);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.46);
    osc2.stop(now + 0.46);
  }

  /**
   * In-Run High Score Celebration Fanfare: Bhusya cymbal crash + double Dhime drums
   */
  public playHighScoreCelebration(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Resonant Bhusya cymbal clashes
    this.playBhusyaCymbal(now, true);
    this.playBhusyaCymbal(now + 0.22, true);

    // Double thunderous Dhime strike
    this.playDhimeBass(now, 1.4);
    this.playDhimeStickCrack(now + 0.1, 1.25);
    this.playDhimeBass(now + 0.22, 1.6);

    // Ascending brass temple bell arpeggio (C6, E6, G6, C7)
    const notes = [1046.5, 1318.5, 1568.0, 2093.0];
    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.32, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(noteTime);
      osc.stop(noteTime + 0.42);
    });
  }

  /**
   * Playful Tease / Taunt Audio Flourish:
   * Cheeky syncopated two-tone festival whistle (E6 -> G6) + light Bhusya cymbal accent
   */
  public playTeaseTaunt(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const tones = [1318.5, 1568.0];
    tones.forEach((freq, idx) => {
      const noteTime = now + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.08, noteTime + 0.06);

      gain.gain.setValueAtTime(0.24, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(noteTime);
      osc.stop(noteTime + 0.24);
    });

    this.playBhusyaCymbal(now + 0.04, false);
  }

  // --- Traditional Dhime Galloping Chase Rhythm Scheduler ---

  public startMusic(): void {
    if (!this.initContext() || this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.nextNoteTime = this.ctx!.currentTime + 0.05;
    this.currentBeat = 0;
    this.scheduleNotes();
  }

  public stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    }
  }

  /**
   * Dynamic chase tension and proximity feedback:
   * Scales tempo from 134 BPM up to 158 BPM and intensifies sub-bass drone
   */
  public updateProximityTension(guardianDistance: number): void {
    if (!this.ctx || !this.droneGain) return;

    const isClose = guardianDistance <= 2.8;
    this.setUrgency(isClose);

    // Proximity tension drone volume (0 at 4.2m, rising to 0.28 at 1.2m)
    const proximityRatio = Math.max(0, Math.min(1, (4.2 - guardianDistance) / (4.2 - 1.2)));
    const targetDroneVol = proximityRatio * 0.28;

    this.droneGain.gain.setTargetAtTime(targetDroneVol, this.ctx.currentTime, 0.15);
  }

  public setUrgency(urgent: boolean): void {
    this.isUrgent = urgent;
    this.currentTempoBpm = urgent ? 158 : this.baseTempoBpm;
  }

  private scheduleNotes(): void {
    if (!this.isMusicPlaying || !this.ctx) return;

    const secondsPerBeat = 60.0 / this.currentTempoBpm;
    const sixteenth = secondsPerBeat / 4;

    while (this.nextNoteTime < this.ctx.currentTime + 0.22) {
      const step = this.currentBeat % 16;

      // Galloping Traditional Newar Chase Cadence
      // 0: Massive DHA-CHYA | 2: TAK | 3: GHA | 4: DHA | 6: TAK | 7: TAK | 8: DHA-CHYA | 10: GHA | 12: CHYA | 14: TAK
      if (step === 0) {
        this.playDhimeBass(this.nextNoteTime, 1.3);
        this.playBhusyaCymbal(this.nextNoteTime, true);
      } else if (step === 2) {
        this.playDhimeStickCrack(this.nextNoteTime, 0.95);
      } else if (step === 3) {
        this.playDhimeBass(this.nextNoteTime, 0.8);
      } else if (step === 4) {
        this.playDhimeBass(this.nextNoteTime, 1.1);
      } else if (step === 6) {
        this.playDhimeStickCrack(this.nextNoteTime, 0.85);
      } else if (step === 7) {
        this.playDhimeStickCrack(this.nextNoteTime, 1.0);
      } else if (step === 8) {
        this.playDhimeBass(this.nextNoteTime, 1.25);
        this.playBhusyaCymbal(this.nextNoteTime, false);
      } else if (step === 10) {
        this.playDhimeBass(this.nextNoteTime, 0.9);
      } else if (step === 12) {
        this.playDhimeBass(this.nextNoteTime, 1.15);
        this.playBhusyaCymbal(this.nextNoteTime, true);
      } else if (step === 14) {
        this.playDhimeStickCrack(this.nextNoteTime, 0.9);
      }

      // In urgent close chase, add rolling 16th stick drive on off-beats
      if (this.isUrgent) {
        if ([1, 5, 9, 13, 15].includes(step)) {
          this.playDhimeStickCrack(this.nextNoteTime, 0.65);
        }
        if (step % 2 === 0) {
          this.playBhusyaCymbal(this.nextNoteTime, false);
        }
      }

      this.nextNoteTime += sixteenth;
      this.currentBeat++;
    }

    this.timerId = window.setTimeout(() => this.scheduleNotes(), 40);
  }

  private playNoiseBurst(
    time: number,
    duration: number,
    filterFreq: number,
    filterQ: number,
    volume: number
  ): void {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, time);
    filter.Q.setValueAtTime(filterQ, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + duration + 0.01);
  }

  /**
   * Biome Transition Flourish — shifts sonic atmosphere when crossing into each Kathmandu biome
   */
  public playBiomeEntryFlourish(biome: string): void {
    if (!this.initContext() || !this.ctx || !this.masterGain || this.isMutedState) return;
    const now = this.ctx.currentTime;

    if (biome === 'DURBAR_ALLEY') {
      // Warm resonant Kathmandu temple bell chime (Ghanti)
      const freqs = [880, 1760, 2640];
      const gains = [0.35, 0.15, 0.08];
      freqs.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        g.gain.setValueAtTime(gains[idx], now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(g);
        g.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 1.25);
      });
    } else if (biome === 'RIVER_CAUSEWAY') {
      // River gorge wind sweep and water spray flourish
      this.playNoiseBurst(now, 0.75, 680, 1.8, 0.28);
      const splash = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      splash.type = 'triangle';
      splash.frequency.setValueAtTime(420, now);
      splash.frequency.exponentialRampToValueAtTime(140, now + 0.4);
      sGain.gain.setValueAtTime(0.18, now);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      splash.connect(sGain);
      sGain.connect(this.masterGain);
      splash.start(now);
      splash.stop(now + 0.5);
    } else if (biome === 'TEMPLE_HILL') {
      // Resonant Himalayan Tibetan Singing Bowl (Jambati bowl) harmonic swell
      const fundamental = 216; // Low singing tone
      const harmonics = [fundamental, fundamental * 3, fundamental * 6];
      const harmonicVols = [0.42, 0.18, 0.09];
      harmonics.forEach((hFreq, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(hFreq, now);
        osc.frequency.linearRampToValueAtTime(hFreq + 1.5, now + 0.8);
        osc.frequency.linearRampToValueAtTime(hFreq - 1.5, now + 1.6);
        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(harmonicVols[idx], now + 0.15);
        g.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
        osc.connect(g);
        g.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 2.25);
      });
    }
  }

  /**
   * Biome 2: River Ghat Step Vault — River foam wash & wooden plank leap
   */
  public playWaterSplash(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain || this.isMutedState) return;
    const now = this.ctx.currentTime;

    // 1. Water spray white-noise wash
    this.playNoiseBurst(now, 0.42, 850, 2.2, 0.35);

    // 2. Liquid droplet bubble resonance (frequency drop 520Hz -> 180Hz)
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.22);
    g.gain.setValueAtTime(0.25, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  /**
   * Biome 2: Suspension Bridge Rope — Harmonic tension cable twang & rope whoosh
   */
  public playBridgeRopeSound(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain || this.isMutedState) return;
    const now = this.ctx.currentTime;

    // 1. Fast rope displacement friction rush
    this.playNoiseBurst(now, 0.35, 1200, 3.5, 0.28);

    // 2. Steel-hemp suspension cable tension resonance (harmonic 310Hz -> 480Hz pitch bend)
    const cable = this.ctx.createOscillator();
    const cGain = this.ctx.createGain();
    cable.type = 'triangle';
    cable.frequency.setValueAtTime(310, now);
    cable.frequency.linearRampToValueAtTime(480, now + 0.08);
    cable.frequency.exponentialRampToValueAtTime(190, now + 0.38);
    cGain.gain.setValueAtTime(0.28, now);
    cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    cable.connect(cGain);
    cGain.connect(this.masterGain);
    cable.start(now);
    cable.stop(now + 0.45);
  }

  /**
   * Biome 3: Himalayan Prayer Flag Gale — Mountain wind rush & fluttering cloth rip
   */
  public playWindGaleSound(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain || this.isMutedState) return;
    const now = this.ctx.currentTime;

    // 1. High-altitude mountain crosswind gust (bandpass noise sweep)
    const bufferSize = this.ctx.sampleRate * 0.55;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.linearRampToValueAtTime(1100, now + 0.25);
    filter.frequency.exponentialRampToValueAtTime(380, now + 0.52);
    filter.Q.setValueAtTime(3.8, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.54);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
    noise.stop(now + 0.55);

    // 2. Fluttering prayer flag cloth ripples (rapid subtle amplitude clicks)
    const flutter = this.ctx.createOscillator();
    const fGain = this.ctx.createGain();
    flutter.type = 'sawtooth';
    flutter.frequency.setValueAtTime(28, now); // 28Hz rapid flapping flutter
    fGain.gain.setValueAtTime(0.12, now);
    fGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    flutter.connect(fGain);
    fGain.connect(this.masterGain);
    flutter.start(now);
    flutter.stop(now + 0.38);
  }

  /**
   * Phase 4: Ceremonial Torana Bronze Temple Bell (Ghanti) Chime & Milestone Fanfare
   * Resonant Ashtadhatu Newari bronze temple bell strike with rich acoustic partials,
   * authentic 2.6Hz acoustic beating, and celebratory Dhime / Bhusya fanfare accent.
   */
  public playGhantiBellChime(): void {
    if (!this.initContext() || !this.ctx || !this.masterGain || this.isMutedState) return;
    const now = this.ctx.currentTime;

    // 1. Initial Metallic Clapper Contact Transient Click (high bandpass metallic snap)
    this.playNoiseBurst(now, 0.05, 3400, 4.5, 0.42);

    // 2. Ceremonial Bronze Temple Bell Acoustic Modes (Harmonic Modes)
    const bellModes = [
      { freq: 330, gain: 0.35, decay: 2.8 },   // Hum mode (deep warm foundation)
      { freq: 659.2, gain: 0.55, decay: 2.5 }, // Prime strike note (E5)
      { freq: 661.8, gain: 0.45, decay: 2.4 }, // Detuned twin creates authentic 2.6Hz acoustic ring beating!
      { freq: 784.0, gain: 0.38, decay: 2.2 }, // Tierce (minor third)
      { freq: 987.8, gain: 0.32, decay: 1.9 }, // Quint (fifth)
      { freq: 1318.5, gain: 0.28, decay: 1.6 },// Nominal (octave ring)
      { freq: 1820.0, gain: 0.22, decay: 1.3 },// Super-nominal shimmer
      { freq: 2637.0, gain: 0.16, decay: 1.0 },// Crystalline bronze sparkle
    ];

    for (const mode of bellModes) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(mode.freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(mode.gain * 0.75, now + 0.006); // Fast 6ms strike attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + mode.decay);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + mode.decay + 0.1);
    }

    // 3. Celebratory Festival Milestone Fanfare: Resonant Dhime Bass strike & Bhusya cymbal
    this.playDhimeBass(now + 0.04, 1.4);
    this.playBhusyaCymbal(now + 0.05, true);
  }

  /**
   * Pulu Kisi (White Elephant) Neck Ghangla Brass Bell Chime
   * Spherical hollow festival brass bell ringing as Pulu Kisi dashes across crossroad.
   * Twin detuned brass mode frequencies (2150Hz & 3420Hz) with sharp metallic clapper attack.
   */
  public playPuluKisiBell(distance = 0): void {
    if (!this.initContext() || !this.ctx || !this.masterGain || this.isMutedState) return;
    if (distance > 42.0) return; // Beyond audible radius

    const distFactor = Math.max(0, 1 - distance / 42.0);
    const volume = distFactor * distFactor * 0.42;
    if (volume < 0.005) return;

    const now = this.ctx.currentTime;

    // 1. Sharp metallic clapper strike transient
    this.playNoiseBurst(now, 0.025, 4200, 5.0, volume * 0.6);

    // 2. High resonant brass bell overtones (2150Hz & 3420Hz)
    const bellFrequencies = [2150, 2185, 3420, 4850];
    const bellGains = [0.45, 0.35, 0.28, 0.15];
    const decays = [0.24, 0.22, 0.18, 0.12];

    for (let i = 0; i < bellFrequencies.length; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(bellFrequencies[i], now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(bellGains[i] * volume, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + decays[i]);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + decays[i] + 0.05);
    }
  }

  /**
   * Pulu Kisi Gallop Footfalls
   * Rhythmic double-patter footfalls of the two dancers inside the elephant frame.
   * Staggered low-frequency floor impacts + canvas shuffle.
   */
  public playPuluKisiGallop(distance = 0): void {
    if (!this.initContext() || !this.ctx || !this.masterGain || this.isMutedState) return;
    if (distance > 36.0) return;

    const distFactor = Math.max(0, 1 - distance / 36.0);
    const volume = distFactor * distFactor * 0.32;
    if (volume < 0.005) return;

    const now = this.ctx.currentTime;

    // Double step (front runner & back runner)
    const stepOffsets = [0, 0.065];
    for (const offset of stepOffsets) {
      const stepTime = now + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, stepTime);
      osc.frequency.exponentialRampToValueAtTime(45, stepTime + 0.08);

      gain.gain.setValueAtTime(0.001, stepTime);
      gain.gain.linearRampToValueAtTime(volume * 0.7, stepTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(stepTime);
      osc.stop(stepTime + 0.1);

      // Cloth / wicker rustle noise
      this.playNoiseBurst(stepTime, 0.04, 650, 1.8, volume * 0.35);
    }
  }

  /**
   * Distant Procession Spectacle Ambience
   * Distant muffled festival Dhime double-drum strikes and faint Bhusya bronze cymbals
   * echoing from the elevated boulevard where the Raths of Kumari, Bhairab & Ganesh roll.
   */
  public playDistantProcessionAmbience(distance = 0): void {
    if (!this.initContext() || !this.ctx || !this.masterGain || this.isMutedState) return;
    if (distance > 65.0) return;

    const distFactor = Math.max(0, 1 - distance / 65.0);
    const volume = distFactor * distFactor * 0.28;
    if (volume < 0.005) return;

    const now = this.ctx.currentTime;

    // 1. Distant low-pass filtered Dhime Bass resonance (Mankhah)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, now); // Distant muffled wall occlusion

    osc.type = 'sine';
    osc.frequency.setValueAtTime(74, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.35);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume * 0.85, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.6);

    // 2. Faint distant Bhusya cymbal shimmer (gentle metallic clash)
    this.playNoiseBurst(now + 0.02, 0.22, 1800, 3.2, volume * 0.22);
  }
}



