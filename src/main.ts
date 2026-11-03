import {
  Application,
  Color,
  Entity,
  FILLMODE_FILL_WINDOW,
  FOG_LINEAR,
  Keyboard,
  Mouse,
  RESOLUTION_AUTO,
  TouchDevice,
} from 'playcanvas';
import { GameManager, GameTelemetryPayload } from './game/GameManager';
import { GameOverData, GameState } from './types';
import { BIOME_CONFIGS } from './world/RoadView';
import { ControlsTutorial } from './ui/ControlsTutorial';
import { HomeScreen } from './ui/HomeScreen';
import { RunFeedback } from './ui/RunFeedback';
import './ui/mobile.css';

const debugHud = new URLSearchParams(location.search).get('debug') === '1';
document.documentElement.classList.toggle('debug-hud', debugHud);

// Canvas
const canvas = document.getElementById('application-canvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas #application-canvas not found');
}

// PlayCanvas Application
const app = new Application(canvas, {
  keyboard: new Keyboard(window),
  mouse: new Mouse(canvas),
  touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0 ? new TouchDevice(canvas) : undefined,
});

// Performance pass: clamp max pixel ratio to 1.75 to protect high-DPI mobile screens from fillrate bottlenecks
const devicePixelRatio = window.devicePixelRatio || 1;
app.graphicsDevice.maxPixelRatio = Math.min(devicePixelRatio, 1.75);
app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
app.setCanvasResolution(RESOLUTION_AUTO);

// Camera
const camera = new Entity('MainCamera');
camera.addComponent('camera', {
  clearColor: new Color(0.08, 0.1, 0.18), // Deep twilight Kathmandu evening sapphire
  fov: 56,
  nearClip: 0.1,
  farClip: 160,
});
app.root.addChild(camera);

// Kathmandu Twilight Scene Fog
app.scene.fog.type = FOG_LINEAR;
app.scene.fog.color = new Color(0.08, 0.1, 0.18);
app.scene.fog.start = 40;
app.scene.fog.end = 135;

// Lighting (Warm Sunset Festival Lantern & Sunlight)
const sunLight = new Entity('SunLight');
sunLight.addComponent('light', {
  type: 'directional',
  color: new Color(1.0, 0.88, 0.72), // Warm golden festival amber
  castShadows: false,
  intensity: 1.45,
});
sunLight.setEulerAngles(45, 30, 0);
app.root.addChild(sunLight);

const ambientFill = new Entity('AmbientFill');
ambientFill.addComponent('light', {
  type: 'directional',
  color: new Color(0.38, 0.38, 0.58), // Cool evening skylight fill
  castShadows: false,
  intensity: 0.55,
});
ambientFill.setEulerAngles(-40, -140, 0);
app.root.addChild(ambientFill);

// Warm festival front fill light (illuminates runner & guardian faces during intro and chase)
const introFrontLight = new Entity('IntroFrontLight');
introFrontLight.addComponent('light', {
  type: 'directional',
  color: new Color(1.0, 0.84, 0.62), // Warm Newar oil lamp amber
  castShadows: false,
  intensity: 1.35,
});
introFrontLight.setEulerAngles(35, -150, 0);
app.root.addChild(introFrontLight);

// Dynamic Atmospheric Color State (Zero heap allocation lerping)
const currentFogColor = new Color(0.08, 0.1, 0.18);
const currentClearColor = new Color(0.08, 0.1, 0.18);
const currentSunColor = new Color(1.0, 0.88, 0.72);
const currentAmbientColor = new Color(0.38, 0.38, 0.58);

const targetFogColorScratch = new Color();
const targetClearColorScratch = new Color();
const targetSunColorScratch = new Color();
const targetAmbientColorScratch = new Color();

// Game Manager
const game = new GameManager(app, camera, canvas);
const tutorial = new ControlsTutorial(game);
const homeScreen = new HomeScreen();
const runFeedback = new RunFeedback();
const pauseForInterruption = () => {
  if (game.getState() === 'RUNNING') game.triggerAction('PAUSE', 'Browser interruption');
};
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseForInterruption();
});
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  pauseForInterruption();
  console.warn('WebGL context lost; run paused while the browser restores rendering.');
});
canvas.addEventListener('webglcontextrestored', () => {
  app.resizeCanvas();
  console.info('WebGL context restored; resume when ready.');
});
game.setActionGuard((action) => !homeScreen.isOpen() && tutorial.allowAction(action));

const pausePanel = document.getElementById('pause-panel');
const helpButton = document.getElementById('btn-help');
const homeScreenButton = document.getElementById('btn-home-screen');
helpButton?.addEventListener('click', () => tutorial.open());
homeScreenButton?.addEventListener('click', () => homeScreen.open());
document.getElementById('btn-resume')?.addEventListener('click', () => game.triggerAction('START', 'Resume button'));
document.getElementById('btn-play')?.addEventListener('click', () => game.triggerAction('START', 'Play button'));

// DOM Elements
const gameStateEl = document.getElementById('game-state');
const fpsEl = document.getElementById('fps-val');
const dcEl = document.getElementById('dc-val');
const triEl = document.getElementById('tri-val');
const laneEl = document.getElementById('lane-val');
const speedEl = document.getElementById('speed-val');
const guardianStatusEl = document.getElementById('guardian-status-val');
const proximityFillEl = document.getElementById('proximity-fill');
const guardianMeterValEl = document.getElementById('guardian-meter-val');
const hudScoreEl = document.getElementById('hud-score-val');
const hudBestEl = document.getElementById('hud-best-val');
const hudCoinsEl = document.getElementById('hud-coins-val');
const hudCoinBadgeEl = document.getElementById('hud-coin-badge');
const hudComboBadgeEl = document.getElementById('hud-combo-badge');
const diagCoinsEl = document.getElementById('diag-coins-val');
const diagBestCoinsEl = document.getElementById('diag-best-coins-val');
const diagBiomeEl = document.getElementById('diag-biome-val');
const lastInputLogEl = document.getElementById('last-input-log');
const readyBanner = document.getElementById('ready-banner');

// Polish HUD Elements: Multiplier, Celebration Banner, Callout Toasts
const hudMultiplierPill = document.getElementById('hud-multiplier-pill');
const hudMultVal = document.getElementById('hud-mult-val');
const hudMultBar = document.getElementById('hud-mult-bar');
const skillFlashEl = document.getElementById('skill-flash');
const confettiContainer = document.getElementById('confetti-container');
const scoreBoardEl = document.querySelector('.score-board');
const overlayEl = document.getElementById('overlay');

// Keep decorative DOM effects off compact screens and reduced-motion layouts.
const compactEffects = matchMedia('(max-width: 640px), (max-height: 500px), (pointer: coarse)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const decorationTimers = new Set<number>();
const scheduleDecoration = (callback: () => void, delay: number) => {
  const timer = window.setTimeout(() => { decorationTimers.delete(timer); callback(); }, delay);
  decorationTimers.add(timer);
};
const clearDecorations = () => {
  for (const timer of decorationTimers) clearTimeout(timer);
  decorationTimers.clear();
  confettiContainer?.replaceChildren();
  if (skillFlashEl) skillFlashEl.className = '';
  document.querySelectorAll('.fly-score-digit').forEach(el => el.remove());
  scoreBoardEl?.classList.remove('score-pulse');
};
const allowDecorations = () => !compactEffects.matches && !reducedMotion.matches;
for (const media of [compactEffects, reducedMotion]) {
  media.addEventListener('change', () => { if (!allowDecorations()) clearDecorations(); });
}

// 1. Adrenaline / Skill Screen Flash
const triggerSkillFlash = (type: string) => {
  if (!allowDecorations()) return;
  if (!skillFlashEl) return;
  skillFlashEl.className = '';
  void skillFlashEl.offsetWidth;
  if (type === 'CLEAN_VAULT' || type === 'CLEAN_SLIDE' || type === 'WIND_GUST_EVADED') {
    skillFlashEl.classList.add('flash-vault');
  } else if (type === 'CLOSE_CALL' || type === 'GATE_EVADED') {
    skillFlashEl.classList.add('flash-near-miss');
  } else if (type === 'RECORD_BROKEN' || type === 'GUARDIAN_OUTPACED' || type === 'MILESTONE_CLEARED' || type === 'TEASE_TAUNT') {
    skillFlashEl.classList.add('flash-record');
  }
  scheduleDecoration(() => {
    if (skillFlashEl) skillFlashEl.className = '';
  }, 140);
};

// 2. Flying Bonus Score Digit (+Points flying to HUD Distance Meter)
const spawnFlyingScore = (points: number) => {
  if (!overlayEl || points <= 0 || !allowDecorations()) return;
  const flyEl = document.createElement('div');
  flyEl.className = 'fly-score-digit';
  flyEl.textContent = `+${points}`;
  overlayEl.appendChild(flyEl);

  scheduleDecoration(() => {
    if (scoreBoardEl) {
      scoreBoardEl.classList.remove('score-pulse');
      void (scoreBoardEl as HTMLElement).offsetWidth;
      scoreBoardEl.classList.add('score-pulse');
      scheduleDecoration(() => scoreBoardEl?.classList.remove('score-pulse'), 180);
    }
  }, 480);

  scheduleDecoration(() => {
    flyEl.remove();
  }, 680);
};

// 3. Kathmandu Festival Marigold Petals (Sayapatri) & Gold Confetti Shower
const launchFestivalConfetti = () => {
  if (!confettiContainer || !allowDecorations()) return;
  confettiContainer.innerHTML = '';
  const totalPetals = 38;

  for (let i = 0; i < totalPetals; i++) {
    const isGold = Math.random() < 0.28;
    const isDeepSaffron = !isGold && Math.random() < 0.5;
    const petal = document.createElement('div');
    petal.className = isGold
      ? 'confetti-gold-foil'
      : isDeepSaffron
      ? 'confetti-petal deep-saffron'
      : 'confetti-petal';

    const leftPercent = Math.random() * 96 + 2;
    const animDelay = Math.random() * 0.75;
    const animDuration = 1.8 + Math.random() * 0.8;

    petal.style.left = `${leftPercent}%`;
    petal.style.animationDelay = `${animDelay}s`;
    petal.style.animationDuration = `${animDuration}s`;

    confettiContainer.appendChild(petal);
  }

  scheduleDecoration(() => {
    if (confettiContainer) confettiContainer.innerHTML = '';
  }, 2800);
};

// Audio Toggle Elements
const btnAudioToggle = document.getElementById('btn-audio-toggle');
const audioIcon = document.getElementById('audio-icon');
const audioLabel = document.getElementById('audio-label');

let displayedAudioMuted: boolean | undefined;
const updateAudioUi = (isMuted: boolean) => {
  if (isMuted === displayedAudioMuted) return;
  displayedAudioMuted = isMuted;
  if (audioIcon) audioIcon.textContent = isMuted ? '🔇' : '🔊';
  if (audioLabel) audioLabel.textContent = isMuted ? 'Sound off' : 'Sound on';
  if (btnAudioToggle) {
    btnAudioToggle.setAttribute('aria-label', isMuted ? 'Unmute sound' : 'Mute sound');
    btnAudioToggle.setAttribute('aria-pressed', String(isMuted));
    if (isMuted) btnAudioToggle.classList.add('muted');
    else btnAudioToggle.classList.remove('muted');
  }
};

btnAudioToggle?.addEventListener('click', (e) => {
  e.stopPropagation();
  const isMuted = game.toggleAudio();
  updateAudioUi(isMuted);
});

const gameOverModal = document.getElementById('gameover-modal');
const gameOverCauseEl = document.getElementById('gameover-cause');
const newRecordBadge = document.getElementById('new-record-badge');
const modalDistanceEl = document.getElementById('modal-distance-val');
const modalBestEl = document.getElementById('modal-best-val');
const modalCoinsEl = document.getElementById('modal-coins-val');
const btnModalRetry = document.getElementById('btn-modal-retry');

// Buttons
const btnLeft = document.getElementById('btn-left');
const btnJump = document.getElementById('btn-jump');
const btnSlide = document.getElementById('btn-slide');
const btnRight = document.getElementById('btn-right');
const btnTease = document.getElementById('btn-tease');
const btnToggleRun = document.getElementById('btn-toggle-run');
const btnReset = document.getElementById('btn-reset');
const btnCycleSeed = document.getElementById('btn-cycle-seed');

// Wire Action Buttons
btnLeft?.addEventListener('click', (e) => {
  e.stopPropagation();
  game.triggerAction('LEFT', 'UI Button [Left]');
});

btnRight?.addEventListener('click', (e) => {
  e.stopPropagation();
  game.triggerAction('RIGHT', 'UI Button [Right]');
});

btnJump?.addEventListener('click', (e) => {
  e.stopPropagation();
  game.triggerAction('JUMP', 'UI Button [Jump]');
});

btnSlide?.addEventListener('click', (e) => {
  e.stopPropagation();
  game.triggerAction('SLIDE', 'UI Button [Slide]');
});

btnTease?.addEventListener('click', (e) => {
  e.stopPropagation();
  game.triggerAction('TEASE', 'UI Button [Tease]');
});

btnToggleRun?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (game.getState() === 'RUNNING') {
    game.triggerAction('PAUSE', 'UI Button [Pause]');
  } else if (game.getState() === 'READY' || game.getState() === 'PAUSED') {
    game.triggerAction('START', 'UI Button [Start]');
  } else if (game.getState() === 'GAME_OVER') {
    game.triggerAction('RETRY', 'UI Button [Retry]');
  }
});

btnReset?.addEventListener('click', (e) => {
  e.stopPropagation();
  game.triggerAction('RESET', 'UI Button [Reset]');
});

btnModalRetry?.addEventListener('click', (e) => {
  e.stopPropagation();
  game.triggerAction('RETRY', 'Modal Button [Retry]');
});

// Seed presets
const SEED_PRESETS = [42, 101, 777, 999];
let seedIndex = 0;
btnCycleSeed?.addEventListener('click', (e) => {
  e.stopPropagation();
  seedIndex = (seedIndex + 1) % SEED_PRESETS.length;
  const newSeed = SEED_PRESETS[seedIndex];
  game.setSeed(newSeed);
  if (btnCycleSeed) btnCycleSeed.textContent = `🎲 Seed: ${newSeed}`;
});

// Telemetry Listener with DOM Write Throttling
const laneLabels: Record<number, string> = {
  [-1]: 'LEFT (-1)',
  [0]: 'CENTER (0)',
  [1]: 'RIGHT (+1)',
};

let prevLaneStr = '';
let prevSpeedStr = '';
let prevScoreStr = '';
let prevBestStr = '';
let prevCoinsStr = '';
let prevGuardianStr = '';
let prevMeterStr = '';
let prevDangerOpacity = -1;
let prevMult = 1;
let lastDecoratedCallout: GameTelemetryPayload['activeCallout'];
let decorationRunId: number | undefined;
const guardianBar = document.querySelector('.guardian-bar');
const dangerVignette = document.getElementById('danger-vignette');

game.onTelemetry((payload: GameTelemetryPayload) => {
  const { player, state, lastInput, currentScore, bestScore, guardianDistance, guardianState } = payload;

  if (debugHud && gameStateEl) {
    gameStateEl.textContent = state;
    gameStateEl.style.color =
      state === 'RUNNING' ? '#4ade80' : state === 'CAUGHT' ? '#f59e0b' : state === 'PAUSED' ? '#fbbf24' : state === 'GAME_OVER' ? '#f87171' : '#38bdf8';
  }

  if (debugHud && laneEl) {
    const isTransitioning = player.lane !== player.targetLane;
    const laneStr = `${laneLabels[player.targetLane]}${isTransitioning ? ' (moving)' : ''}`;
    if (laneStr !== prevLaneStr) {
      laneEl.textContent = laneStr;
      prevLaneStr = laneStr;
    }
  }

  if (debugHud && speedEl) {
    const speedStr = `${payload.currentSpeed.toFixed(1)} m/s`;
    if (speedStr !== prevSpeedStr) {
      speedEl.textContent = speedStr;
      speedEl.style.color = payload.currentSpeed > 13 ? '#fbbf24' : '#38bdf8';
      prevSpeedStr = speedStr;
    }
  }

  updateAudioUi(payload.isAudioMuted);

  // Live Score Display
  if (hudScoreEl) {
    const scoreStr = `${Math.floor(currentScore)}m`;
    if (scoreStr !== prevScoreStr) {
      hudScoreEl.textContent = scoreStr;
      prevScoreStr = scoreStr;
    }
  }

  if (hudBestEl) {
    const bestStr = `${Math.floor(bestScore)}m`;
    if (bestStr !== prevBestStr) {
      hudBestEl.textContent = bestStr;
      prevBestStr = bestStr;
    }
  }

  // Live Coin Counter with Juice (Punch Animation & Combo Streaks)
  if (hudCoinsEl) {
    const coinsStr = `${player.coins}`;
    if (coinsStr !== prevCoinsStr) {
      hudCoinsEl.textContent = coinsStr;
      prevCoinsStr = coinsStr;

      // Trigger spring punch animation on the coin badge
      if (hudCoinBadgeEl) {
        hudCoinBadgeEl.classList.remove('coin-pop');
        void hudCoinBadgeEl.offsetWidth;
        hudCoinBadgeEl.classList.add('coin-pop');
        setTimeout(() => hudCoinBadgeEl?.classList.remove('coin-pop'), 150);
      }
    }
  }

  // Musical Combo Badge (e.g. x2, x3, x4)
  if (hudComboBadgeEl) {
    if (payload.coinCombo >= 2) {
      hudComboBadgeEl.textContent = `x${payload.coinCombo}`;
      hudComboBadgeEl.classList.add('active');
    } else {
      hudComboBadgeEl.classList.remove('active');
    }
  }

  // Combo Streak Multiplier Pill & Depleting Meter
  if (hudMultiplierPill) {
    if (payload.multiplier > 1) {
      hudMultiplierPill.classList.remove('hidden');
      if (hudMultVal && payload.multiplier !== prevMult) {
        hudMultVal.textContent = `${payload.multiplier}x${payload.multiplier >= 8 ? ' MAX' : ''}`;
        // Pulse pop animation on multiplier upgrade
        if (payload.multiplier > prevMult) {
          hudMultiplierPill.classList.remove('multiplier-pop');
          void hudMultiplierPill.offsetWidth;
          hudMultiplierPill.classList.add('multiplier-pop');
          setTimeout(() => hudMultiplierPill?.classList.remove('multiplier-pop'), 200);
        }
      }
      if (hudMultBar) {
        const percent = Math.round(payload.multiplierProgress * 100);
        hudMultBar.style.width = `${percent}%`;
      }
      // Update Tier classes for escalating visual intensity
      hudMultiplierPill.classList.remove('tier-1', 'tier-2', 'tier-3', 'tier-4');
      if (payload.multiplier >= 8) {
        hudMultiplierPill.classList.add('tier-4');
      } else if (payload.multiplier >= 6) {
        hudMultiplierPill.classList.add('tier-3');
      } else if (payload.multiplier >= 4) {
        hudMultiplierPill.classList.add('tier-2');
      } else {
        hudMultiplierPill.classList.add('tier-1');
      }
    } else {
      hudMultiplierPill.classList.add('hidden');
    }
    prevMult = payload.multiplier;
  }

  runFeedback.update(payload);
  if (payload.runId !== decorationRunId) clearDecorations();
  decorationRunId = payload.runId;
  if (payload.activeCallout !== lastDecoratedCallout) {
    lastDecoratedCallout = payload.activeCallout;
    if (state === 'RUNNING' && payload.activeCallout) {
      const callout = payload.activeCallout;
      triggerSkillFlash(callout.type);
      if (callout.type === 'RECORD_BROKEN' || callout.type === 'MILESTONE_CLEARED') launchFestivalConfetti();
      if (callout.type !== 'RECORD_BROKEN' && callout.type !== 'COMBO_SURGE') spawnFlyingScore(callout.points);
    }
  }

  if (debugHud && diagCoinsEl) {
    diagCoinsEl.textContent = `${player.coins}`;
  }
  if (debugHud && diagBestCoinsEl) {
    diagBestCoinsEl.textContent = `${game.getScoreManager().getBestCoins()}`;
  }
  if (debugHud && diagBiomeEl) {
    diagBiomeEl.textContent = `${payload.biomeName} (${Math.round(payload.biomeProgress * 100)}%)`;
  }

  // Guardian Proximity Telemetry & Meter
  if (debugHud && guardianStatusEl) {
    const stateText =
      state === 'CAUGHT'
        ? 'Caught Aloft!'
        : guardianState === 'CAUGHT'
        ? 'Caught Up'
        : guardianState === 'CLOSING'
        ? 'Closing In'
        : `Pursuing (${guardianDistance.toFixed(1)}m)`;
    if (stateText !== prevGuardianStr) {
      guardianStatusEl.textContent = stateText;
      guardianStatusEl.style.color =
        state === 'CAUGHT' || guardianState === 'CAUGHT' ? '#f87171' : guardianState === 'CLOSING' ? '#fbbf24' : '#38bdf8';
      prevGuardianStr = stateText;
    }
  }

  if (guardianMeterValEl) {
    const meterStr = `${guardianDistance.toFixed(1)}m`;
    if (meterStr !== prevMeterStr) {
      guardianMeterValEl.textContent = meterStr;
      prevMeterStr = meterStr;
    }
  }

  if (proximityFillEl) {
    // Normal follow is 4.2m (20% filled), catch is 1.2m (100% filled)
    const proximityRatio = Math.max(0, Math.min(1, (4.5 - guardianDistance) / (4.5 - 1.2)));
    const percent = Math.round(20 + proximityRatio * 80);
    proximityFillEl.style.width = `${percent}%`;

    if (guardianDistance <= 1.5) {
      proximityFillEl.style.backgroundColor = '#ef4444'; // Red (Close/Caught)
    } else if (guardianDistance <= 3.0) {
      proximityFillEl.style.backgroundColor = '#f59e0b'; // Amber (Approaching)
    } else {
      proximityFillEl.style.backgroundColor = '#10b981'; // Green (Safe)
    }

    // Toggle danger pulsing animation on guardian presence bar
    if (guardianBar) {
      if (guardianDistance <= 2.8 && state === 'RUNNING') {
        guardianBar.classList.add('danger-pulse');
      } else {
        guardianBar.classList.remove('danger-pulse');
      }
    }
  }

  // Dynamic Danger Vignette Pulse when Guardian closes in
  if (dangerVignette) {
    if (guardianDistance <= 3.2 && state === 'RUNNING') {
      const intensity = Math.min(1, (3.2 - guardianDistance) / (3.2 - 1.2));
      const opacity = intensity * 0.8;
      if (Math.abs(opacity - prevDangerOpacity) > 0.02) {
        dangerVignette.style.opacity = `${opacity}`;
        prevDangerOpacity = opacity;
      }
    } else if (prevDangerOpacity !== 0) {
      dangerVignette.style.opacity = '0';
      prevDangerOpacity = 0;
    }
  }

  if (debugHud && lastInputLogEl) {
    lastInputLogEl.textContent = `Last: ${lastInput}`;
    if (lastInput.includes('CHALLENGE') || lastInput.includes('COLLISION') || lastInput.includes('CATCH')) {
      lastInputLogEl.style.color = '#f87171';
    } else {
      lastInputLogEl.style.color = '#facc15';
    }
  }
});

// Game Over Event — Triggered after Lakhey friendly catch & hoist animation concludes
game.onGameOver((data: GameOverData) => {
  if (gameOverModal) {
    gameOverModal.classList.remove('hidden');
    btnModalRetry?.focus();
  }

  if (modalDistanceEl) {
    modalDistanceEl.textContent = `${data.finalDistance.toFixed(1)}m`;
  }

  if (modalBestEl) {
    modalBestEl.textContent = `${data.bestDistance.toFixed(1)}m`;
  }

  if (modalCoinsEl) {
    modalCoinsEl.textContent = `${data.coins}`;
  }

  if (newRecordBadge) {
    if (data.isNewRecord) {
      newRecordBadge.classList.remove('hidden');
    } else {
      newRecordBadge.classList.add('hidden');
    }
  }

  if (gameOverCauseEl) {
    const obsLabel =
      data.obstacleType === 'PULU_KISI_CROSSING'
        ? 'Pulu Kisi crossing'
        : data.obstacleType === 'LOW_BARRIER'
        ? 'Low Timber Hurdle'
        : data.obstacleType === 'ROLLING_MATKA'
        ? 'Rolling Clay Matka Pot'
        : data.obstacleType === 'SLIDING_GATE'
        ? 'Sliding Street Gate'
        : data.obstacleType === 'OVERHEAD_BEAM'
        ? 'Overhead Timber Beam'
        : data.obstacleType === 'GHAT_STEPS'
        ? 'Ghat Wooden Steps'
        : data.obstacleType === 'BRIDGE_ROPE'
        ? 'Suspension Bridge Cable'
        : data.obstacleType === 'PRAYER_FLAG_GALE'
        ? 'Himalayan Prayer Flag Gale'
        : 'Terracotta Obstacle';
    const laneName = data.lane !== undefined ? laneLabels[data.lane] : '';
    gameOverCauseEl.textContent = data.obstacleType === 'EDGE_BUMP'
      ? `Bumped the road edge again in ${laneName} while Lakhey was close. He scooped up the runner with friendly guardian pride!`
      : `Caught on ${obsLabel} in ${laneName}. Lakhey scooped up the runner with friendly guardian pride!`;
  }
});

game.onStateChange((state: GameState) => {
  document.body.dataset.gameState = state;
  pausePanel?.classList.toggle('hidden', state !== 'PAUSED');
  helpButton?.classList.toggle('hidden', state === 'RUNNING' || state === 'CAUGHT');
  homeScreenButton?.classList.toggle('hidden', state === 'RUNNING' || state === 'CAUGHT');
  document.querySelector('.dpad-bar')?.classList.toggle('hidden', state === 'GAME_OVER' || state === 'CAUGHT');
  if (readyBanner) {
    if (state === 'READY') {
      readyBanner.classList.remove('hidden');
    } else {
      readyBanner.classList.add('hidden');
    }
  }

  if (gameOverModal && state !== 'GAME_OVER') {
    gameOverModal.classList.add('hidden');
  }

  if (state !== 'RUNNING') {
    runFeedback.clear();
    hudMultiplierPill?.classList.add('hidden');
    clearDecorations();
  }

  if (btnToggleRun) {
    btnToggleRun.textContent = state === 'RUNNING' ? '⏸ Pause' : state === 'PAUSED' ? '▶ Resume' : state === 'CAUGHT' ? 'Finishing…' : state === 'GAME_OVER' ? '↻ Retry' : '▶ Play';
    (btnToggleRun as HTMLButtonElement).disabled = state === 'CAUGHT';
    if (state === 'RUNNING') canvas.focus();
  }
});

document.body.dataset.gameState = game.getState();
updateAudioUi(game.isAudioMuted());

window.addEventListener('resize', () => {
  app.resizeCanvas();
});

// Main Update Loop
let frameCount = 0;
let lastFpsTime = performance.now();

app.on('update', (dt: number) => {
  const clampedDt = Math.min(dt, 0.1);
  game.update(clampedDt);

  // Smooth Atmospheric Biome Interpolation
  const currentBiome = game.getCurrentBiome();
  const targetConfig = BIOME_CONFIGS[currentBiome.type];
  const lerpFactor = Math.min(1.0, clampedDt * 2.2);

  targetFogColorScratch.set(targetConfig.fogColor.r, targetConfig.fogColor.g, targetConfig.fogColor.b);
  targetClearColorScratch.set(targetConfig.clearColor.r, targetConfig.clearColor.g, targetConfig.clearColor.b);
  targetSunColorScratch.set(targetConfig.sunColor.r, targetConfig.sunColor.g, targetConfig.sunColor.b);
  targetAmbientColorScratch.set(targetConfig.ambientColor.r, targetConfig.ambientColor.g, targetConfig.ambientColor.b);

  currentFogColor.lerp(currentFogColor, targetFogColorScratch, lerpFactor);
  currentClearColor.lerp(currentClearColor, targetClearColorScratch, lerpFactor);
  currentSunColor.lerp(currentSunColor, targetSunColorScratch, lerpFactor);
  currentAmbientColor.lerp(currentAmbientColor, targetAmbientColorScratch, lerpFactor);

  if (app.scene.fog.color) app.scene.fog.color.copy(currentFogColor);
  if (camera.camera) camera.camera.clearColor.copy(currentClearColor);
  if (sunLight.light) {
    sunLight.light.color.copy(currentSunColor);
    sunLight.light.intensity += (targetConfig.sunIntensity - sunLight.light.intensity) * lerpFactor;
  }
  if (ambientFill.light) {
    ambientFill.light.color.copy(currentAmbientColor);
  }
  app.scene.fog.start += (targetConfig.fogStart - app.scene.fog.start) * lerpFactor;
  app.scene.fog.end += (targetConfig.fogEnd - app.scene.fog.end) * lerpFactor;

  frameCount++;
  const now = performance.now();
  const elapsed = now - lastFpsTime;

  if (debugHud && elapsed >= 500) {
    const fps = Math.round((frameCount * 1000) / elapsed);
    if (fpsEl) fpsEl.textContent = `${fps}`;
    if (dcEl) {
      const dc = app.stats.drawCalls ? app.stats.drawCalls.total : 0;
      dcEl.textContent = `${dc}`;
    }
    if (triEl) {
      const fwd = app.stats.drawCalls ? app.stats.drawCalls.forward : 0;
      triEl.textContent = `${fwd} fwd`;
    }
    frameCount = 0;
    lastFpsTime = now;
  }
});

// Start engine
app.start();
window.dispatchEvent(new Event('lakhey-ready'));

// Expose engine handles for profiling and diagnostics
(window as any).__pcApp = app;
(window as any).__game = game;

console.log('Lakhey Run initialized.');
