import { Application, Entity } from 'playcanvas';
import { CollisionInfo, GameState, GameOverData, GuardianState, InputAction, LaneIndex, PlayerTelemetry, SkillCalloutEvent, BiomeType, JumpStyle, SlideStyle, DodgeStyle, JUMP_STYLE_NAMES, SLIDE_STYLE_NAMES, DODGE_STYLE_NAMES } from '../types';
import { InputManager } from '../input/InputManager';
import { PlayerController } from '../runner/PlayerController';
import { RoadView } from '../world/RoadView';
import { ObstacleManager } from '../world/ObstacleManager';
import { CollectibleManager } from '../world/CollectibleManager';
import { ScoreManager } from './ScoreManager';
import { GuardianController } from '../runner/GuardianController';
import { SoundManager } from '../audio/SoundManager';
import { ParticleFxManager } from '../fx/ParticleFxManager';
import { runSpeedAt, rowSpacingAt } from './Difficulty';
import { Haptics } from './Haptics';
import { GameSettings } from './Settings';
import { BestMarker } from '../world/BestMarker';

export interface GameTelemetryPayload {
  runId: number;
  player: PlayerTelemetry;
  state: GameState;
  lastInput: string;
  activeObstacles: number;
  collisionCount: number;
  seed: number;
  spawnSpacing: number;
  currentScore: number;
  bestScore: number;
  isStorageSupported: boolean;
  guardianDistance: number;
  guardianState: GuardianState;
  currentSpeed: number;
  isAudioMuted: boolean;
  coinCombo: number;
  multiplier: number;
  multiplierProgress: number;
  bonusScore: number;
  totalScore: number;
  activeCallout?: SkillCalloutEvent;
  isNewRecordInRun?: boolean;
  currentBiome: BiomeType;
  biomeName: string;
  biomeTagline: string;
  biomeProgress: number;
}

export class GameManager {
  private runId = 0;
  private state: GameState = 'READY';
  private player: PlayerController;
  private road: RoadView;
  private obstacleManager: ObstacleManager;
  private collectibleManager: CollectibleManager;
  private scoreManager: ScoreManager;
  private guardian: GuardianController;
  private input: InputManager;
  private sound: SoundManager;
  private fx: ParticleFxManager;
  private haptics = new Haptics();
  private bestMarker: BestMarker;

  private activeSkillCallout?: SkillCalloutEvent;
  private isRecordBrokenInRun = false;
  private timeScale = 1.0;
  private hitstopTimer = 0;
  private lastMilestoneIndex = 0;

  private collisionCount = 0;
  private lastBiomeType: BiomeType = 'DURBAR_ALLEY';
  private lastInputText = 'Initialized (Ready to Run)';
  private caughtSequenceTimer = 0;
  public static readonly CAUGHT_DURATION = 2.6;
  /** Longest Z step tested as one collision sample; larger frame steps are subdivided. */
  public static readonly MAX_COLLISION_STEP = 0.5;
  /** Follow distance Lakhey surges to when Tuku bumps into the road edge. */
  public static readonly EDGE_BUMP_SURGE_DISTANCE = 2.2;
  /** Set by an edge bump; a second bump while Lakhey is still close ends the run. */
  private edgeBumpStrike = false;
  private pendingGameOverData?: GameOverData;
  private onStateChangeCb?: (state: GameState) => void;
  private onTelemetryCb?: (payload: GameTelemetryPayload) => void;
  private onGameOverCb?: (data: GameOverData) => void;
  private actionGuard?: (action: InputAction) => boolean;

  constructor(app: Application, camera: Entity, canvas: HTMLElement) {
    this.road = new RoadView(app);
    this.obstacleManager = new ObstacleManager(app);
    this.collectibleManager = new CollectibleManager(app);
    this.scoreManager = new ScoreManager();
    this.guardian = new GuardianController(app);
    this.player = new PlayerController(app, camera);
    this.input = new InputManager(canvas);
    this.sound = new SoundManager();
    this.fx = new ParticleFxManager(app);
    this.bestMarker = new BestMarker(app, camera, document.getElementById('overlay'));

    // Hook athletic player footsteps, landings, jumps, slides, and dodge skids
    this.player.onFootstep(() => {
      if (this.state === 'RUNNING') this.sound.playFootstep();
    });
    this.player.onLanding((x: number, y: number, z: number) => {
      if (this.state === 'RUNNING') {
        this.sound.playLandingSound();
        this.fx.emitLandingDust(x, y, z);
      }
    });
    this.player.onJump((variant: JumpStyle) => {
      if (this.state === 'RUNNING') {
        this.sound.playJumpSound(variant);
      }
    });
    this.player.onSlide((x: number, y: number, z: number, variant: SlideStyle) => {
      if (this.state === 'RUNNING') {
        this.sound.playSlideSound(variant);
        this.fx.emitSlideFriction(x, y, z);
      }
    });
    this.player.onEdgeBump((dir) => this.handleEdgeBump(dir));
    this.player.onDodge((dir: number, variant: DodgeStyle) => {
      if (this.state === 'RUNNING') {
        this.sound.playDodgeSound(variant);
        this.fx.emitDodgeSkid(this.player.getX(), PlayerController.GROUND_Y, this.player.getZ(), dir);
      }
    });

    // Hook heavy guardian earth-shaking stomps
    this.guardian.onStomp((vol: number, gx: number, gz: number) => {
      if (this.state === 'RUNNING') {
        this.sound.playGuardianStomp(vol);
        this.fx.emitStompShockwave(gx, 0, gz, vol);
        this.fx.emitGuardianFootstep(gx, 0.04, gz);
        const dist = this.guardian.getFollowDistance();
        if (dist < 3.4) {
          // Camera micro-tremor when guardian stomps in close proximity
          this.player.triggerCameraShake(0.045 * (3.4 - dist), 0.14);
          // Blazing embers from guardian mask aura
          this.fx.emitGuardianAura(gx, 1.2, gz, (3.5 - dist) / 1.5);
        }
      }
    });

    // Hook obstacle physical cues (dust trail behind rolling pots, roll/slide proximity sounds)
    this.obstacleManager.onMatkaRollDust((x, y, z) => {
      if (this.state === 'RUNNING') this.fx.emitMatkaRollDust(x, y, z);
    });
    this.obstacleManager.onMatkaAudioRumble((dist) => {
      if (this.state === 'RUNNING') this.sound.playMatkaRoll(dist);
    });
    this.obstacleManager.onGateAudioSlide((dist) => {
      if (this.state === 'RUNNING') this.sound.playGateSlide(dist);
    });
    this.obstacleManager.onWaterSplash((x, y, z) => {
      if (this.state === 'RUNNING') {
        this.fx.emitWaterSplash(x, y, z);
        this.sound.playWaterSplash();
      }
    });
    this.obstacleManager.onWindGale((x, y, z) => {
      if (this.state === 'RUNNING') {
        this.fx.emitWindGaleStreaks(x, y, z);
      }
    });
    this.obstacleManager.onPuluKisiBell((dist) => {
      if (this.state === 'RUNNING') this.sound.playPuluKisiBell(dist);
    });
    this.obstacleManager.onPuluKisiGallop((dist) => {
      if (this.state === 'RUNNING') this.sound.playPuluKisiGallop(dist);
    });

    // Hook distant chariot procession spectacle audio (Dhime drum & Bhusya bronze cymbals)
    this.road.onDistantProcessionAudio((dist) => {
      if (this.state === 'RUNNING') this.sound.playDistantProcessionAmbience(dist);
    });

    this.setupInputHandling();
  }

  private setupInputHandling(): void {
    this.input.onAction((action: InputAction, source: string) => {
      this.handleAction(action, source);
    });
  }

  public handleAction(action: InputAction, source: string): void {
    if (this.actionGuard && !this.actionGuard(action)) return;
    if (this.state === 'GAME_OVER' || this.state === 'CAUGHT') {
      if (['START', 'RESET', 'RETRY', 'JUMP'].includes(action)) {
        this.retry();
        this.lastInputText = `[${source}] -> Instant Retry Started`;
        this.notifyTelemetry();
        return;
      }
      return;
    }

    if (this.state === 'READY') {
      if (['START', 'LEFT', 'RIGHT', 'JUMP', 'SLIDE', 'RETRY'].includes(action)) {
        this.sound.unlock();
        this.player.startIntroPan();
        this.sound.playIntroFlourish();
        this.sound.startMusic();
        this.setState('RUNNING');
      }
    }

    let actionExecuted = false;

    switch (action) {
      case 'LEFT':
        if (this.state === 'RUNNING') {
          actionExecuted = this.player.moveLeft();
          const dodgeStyle = DODGE_STYLE_NAMES[this.player.getDodgeVariant()];
          this.lastInputText = `[${source}] -> Move Left ${actionExecuted ? `(${dodgeStyle}) OK` : '(Edge bump)'}`;
        }
        break;

      case 'RIGHT':
        if (this.state === 'RUNNING') {
          actionExecuted = this.player.moveRight();
          const dodgeStyle = DODGE_STYLE_NAMES[this.player.getDodgeVariant()];
          this.lastInputText = `[${source}] -> Move Right ${actionExecuted ? `(${dodgeStyle}) OK` : '(Edge bump)'}`;
        }
        break;

      case 'JUMP':
        if (this.state === 'RUNNING') {
          actionExecuted = this.player.jump();
          const jumpStyle = JUMP_STYLE_NAMES[this.player.getJumpVariant()];
          this.lastInputText = `[${source}] -> Jump (${jumpStyle}) ${actionExecuted ? 'Initiated' : '(Buffered near landing)'}`;
        }
        break;

      case 'SLIDE':
        if (this.state === 'RUNNING') {
          actionExecuted = this.player.slide();
          const slideStyle = SLIDE_STYLE_NAMES[this.player.getSlideVariant()];
          this.lastInputText = `[${source}] -> Slide (${slideStyle}) ${actionExecuted ? 'Initiated' : '(Already sliding)'}`;
        }
        break;

      case 'TEASE':
        if (this.state === 'RUNNING') {
          const teaseResult = this.player.triggerTease();
          if (teaseResult.started) {
            actionExecuted = true;
            this.sound.playTeaseTaunt();
            // Provoke Lakhey: angry roar & surge closer
            this.guardian.surgeCloser(2.6);
            this.sound.playGuardianRoarExertion();

            // Reward risky trickster taunt: +150 score bonus & multiplier bump
            const bonusAwarded = this.scoreManager.addSkillBonus(150);
            const currentMult = this.scoreManager.getMultiplier();
            this.sound.playMultiplierUp(currentMult);

            const titles = [
              '😜 "CATCH ME IF YOU CAN!"',
              '🙌 FESTIVAL TAUNT!',
              '😎 "TOO FAST FOR YOU!"',
            ];
            const title = titles[teaseResult.variant] || '😜 CHEEKY TEASE!';
            this.activeSkillCallout = {
              type: 'TEASE_TAUNT',
              title,
              subtitle: `Daring Stride Taunt (+${bonusAwarded})`,
              points: bonusAwarded,
              multiplier: currentMult,
              timestamp: performance.now(),
            };
            this.lastInputText = `[${source}] -> Mid-Run Tease (Taunt #${teaseResult.variant + 1}) OK`;
          } else {
            this.lastInputText = `[${source}] -> Tease ignored (${teaseResult.reason})`;
          }
        }
        break;

      case 'START':
        if (this.state === 'READY') {
          this.sound.unlock();
          this.player.startIntroPan();
          this.sound.playIntroFlourish();
          this.sound.startMusic();
          this.setState('RUNNING');
          this.lastInputText = `[${source}] -> Started Run`;
        } else if (this.state === 'PAUSED') {
          this.sound.startMusic();
          this.setState('RUNNING');
          this.lastInputText = `[${source}] -> Resumed`;
        }
        break;

      case 'PAUSE':
        if (this.state === 'RUNNING') {
          this.sound.stopMusic();
          this.setState('PAUSED');
          this.lastInputText = `[${source}] -> Game Paused`;
        } else if (this.state === 'PAUSED') {
          this.sound.startMusic();
          this.setState('RUNNING');
          this.lastInputText = `[${source}] -> Resumed`;
        }
        break;

      case 'RESET':
        this.sound.stopMusic();
        this.reset();
        this.lastInputText = `[${source}] -> Reset to Ready`;
        break;

      case 'RETRY':
        this.retry();
        this.lastInputText = `[${source}] -> Retry Run`;
        break;
    }

    this.notifyTelemetry();
  }

  public setDebugDistance(dist: number): void {
    this.player.setDistance(dist);
    this.road.update(-dist, 0.016);
    this.guardian.update(0.016, this.player.getX(), -dist, true);
    this.obstacleManager.update(0.016, -dist);
  }

  public triggerHitstop(duration = 0.065, scale = 0.35): void {
    this.hitstopTimer = duration;
    this.timeScale = scale;
  }

  public update(dt: number): void {
    // Pause preserves the whole simulation, including airborne/lane/intro timing.
    if (this.state === 'PAUSED') {
      this.notifyTelemetry();
      return;
    }
    const isRunning = this.state === 'RUNNING';
    const isCaught = this.state === 'CAUGHT';

    // 0. Micro-Dilation (Hit-stop / Chrono-Freeze on Near-Misses)
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      if (this.hitstopTimer <= 0) {
        this.timeScale = 1.0;
      }
    }
    const effectiveDt = dt * this.timeScale;

    // Cinematic Caught Sequence Choreography (Lakhey scoops runner aloft & twirls before challenge again modal)
    if (isCaught) {
      this.bestMarker.update(0, 0, false);
      this.caughtSequenceTimer -= effectiveDt;
      const progress = Math.min(1.0, 1.0 - Math.max(0, this.caughtSequenceTimer / GameManager.CAUGHT_DURATION));

      this.player.updateCaught(effectiveDt, progress, this.guardian.getX());
      this.guardian.updateCaught(effectiveDt, progress, this.player.getX(), this.player.getZ());
      this.fx.update(effectiveDt);

      if (this.caughtSequenceTimer <= 0) {
        this.setState('GAME_OVER');
        if (this.onGameOverCb && this.pendingGameOverData) {
          this.onGameOverCb(this.pendingGameOverData);
        }
      }
      this.notifyTelemetry();
      return;
    }

    // Player & road progression
    const guardianDist = this.guardian.getFollowDistance();
    const previousPlayerZ = this.player.getZ();
    this.player.update(effectiveDt, isRunning, guardianDist);
    this.road.update(this.player.getZ(), effectiveDt);
    this.bestMarker.update(this.scoreManager.getBest(), this.player.getTelemetry().distance,
      this.state === 'READY' || this.state === 'RUNNING');

    // Guardian tracking & stride
    this.guardian.update(effectiveDt, this.player.getTelemetry().x, this.player.getZ(), isRunning);

    // Particle FX simulation (dust puffs, shockwave rings, friction sparks, ambient motes)
    this.fx.update(effectiveDt);

    if (isRunning) {
      const currentDist = this.player.getTelemetry().distance;

      // Atmospheric ambient biome particles (butter-lamp embers, river mist, mountain incense)
      if (Math.random() < 0.28) {
        const b = this.road.getCurrentBiome(currentDist);
        this.fx.emitAmbientBiomeMote(this.player.getX(), this.player.getY(), this.player.getZ(), b.type);
      }

      // Check Biome Shift Soundscape Flourish
      const curBiomeInfo = this.road.getCurrentBiome(currentDist);
      if (curBiomeInfo.type !== this.lastBiomeType) {
        this.lastBiomeType = curBiomeInfo.type;
        this.sound.playBiomeEntryFlourish(curBiomeInfo.type);
      }

      // 1–2. Difficulty curve: speed and hazard-row spacing keep ramping for ~2 minutes (see Difficulty.ts)
      const dynamicSpeed = runSpeedAt(currentDist);
      this.player.setSpeed(dynamicSpeed);
      this.obstacleManager.spawnSpacing = rowSpacingAt(currentDist, dynamicSpeed);

      // 3. Dynamic chase tension: drone rumble & tempo escalation
      const gDist = this.guardian.getFollowDistance();
      this.sound.updateProximityTension(gDist);

      this.obstacleManager.update(effectiveDt, this.player.getZ());

      // Update combo multiplier timer decay
      this.scoreManager.update(effectiveDt);

      // High Multiplier (4x+) Runner Speed Aura (Golden trail behind Tuku)
      if (this.scoreManager.getMultiplier() >= 4 && Math.random() < 0.28) {
        this.fx.emitCoinMagneticTrail(this.player.getX(), 0.1, this.player.getZ() + 0.3);
      }

      // Check skill actions (Clean Vault, Clean Slide, Close Call, Gate Evaded)
      const skill = this.obstacleManager.checkSkills(
        this.player.getX(),
        this.player.getY(),
        this.player.getZ(),
        this.player.getTelemetry().isJumping,
        this.player.isPlayerSliding()
      );

      if (skill) {
        let title = '';
        let subtitle = '';
        let pts = 0;
        if (skill.type === 'CLEAN_VAULT') {
          title = 'CLEAN VAULT!';
          subtitle = skill.obstacleType === 'GHAT_STEPS' ? '+50 River Step Vault' : '+50 Skill Bonus';
          pts = 50;
          this.sound.playCleanVaultCallout();
          if (skill.obstacleType === 'GHAT_STEPS') {
            this.sound.playWaterSplash();
            this.fx.emitWaterSplash(this.player.getX(), 0.05, this.player.getZ());
          }
          this.triggerHitstop(0.065, 0.4);
          this.player.triggerCameraShake(0.028, 0.1);
          this.fx.emitVaultSpeedStreaks(this.player.getX(), this.player.getY(), this.player.getZ());
          this.guardian.pushBack(0.75); // Outpaces Lakhey
          if (this.guardian.getFollowDistance() >= 4.4) this.sound.playGuardianOutpaced();
        } else if (skill.type === 'CLEAN_SLIDE') {
          title = 'CLEAN SLIDE!';
          subtitle = skill.obstacleType === 'BRIDGE_ROPE' ? '+55 Suspension Cable' : '+55 Low Clearance';
          pts = 55;
          if (skill.obstacleType === 'BRIDGE_ROPE') {
            this.sound.playBridgeRopeSound();
          } else {
            this.sound.playCleanVaultCallout();
          }
          this.triggerHitstop(0.065, 0.38);
          this.player.triggerCameraShake(0.032, 0.12);
          this.fx.emitSlideFriction(this.player.getX(), 0.05, this.player.getZ());
          this.guardian.pushBack(0.85); // Ducking beam/cable gains substantial lead
          if (this.guardian.getFollowDistance() >= 4.4) this.sound.playGuardianOutpaced();
        } else if (skill.type === 'WIND_GUST_EVADED') {
          title = 'WIND SLIP!';
          subtitle = '+60 Lung-ta Gale Evaded';
          pts = 60;
          this.sound.playWindGaleSound();
          this.sound.playCleanVaultCallout();
          this.triggerHitstop(0.070, 0.35);
          this.player.triggerCameraShake(0.035, 0.14);
          this.fx.emitWindGaleStreaks(this.player.getX(), 1.1, this.player.getZ());
          this.guardian.pushBack(0.9);
          if (this.guardian.getFollowDistance() >= 4.4) this.sound.playGuardianOutpaced();
        } else if (skill.type === 'CLOSE_CALL') {
          title = 'CLOSE CALL!';
          subtitle = '+35 Near Miss';
          pts = 35;
          this.sound.playNearMissCallout();
          this.haptics.nearMiss();
          this.triggerHitstop(0.075, 0.32);
          this.player.triggerCameraShake(0.048, 0.14);
          this.fx.emitNearMissFriction(this.player.getX(), this.player.getY(), this.player.getZ(), skill.lateralDir);
          // Hair-raising close brush makes Lakhey surge closer with a fierce roar!
          this.guardian.surgeCloser(2.5);
          this.sound.playGuardianRoarExertion();
        } else if (skill.type === 'GATE_EVADED') {
          title = 'GATE EVADED!';
          subtitle = '+60 Precision Slip';
          pts = 60;
          this.sound.playCleanVaultCallout();
          this.triggerHitstop(0.065, 0.35);
          this.player.triggerCameraShake(0.038, 0.12);
          this.fx.emitNearMissFriction(this.player.getX(), this.player.getY(), this.player.getZ(), skill.lateralDir);
          this.guardian.pushBack(0.8);
          if (this.guardian.getFollowDistance() >= 4.4) this.sound.playGuardianOutpaced();
        } else if (skill.type === 'PULU_KISI_EVADED') {
          title = '🐘 PULU KISI EVADED!';
          subtitle = '+180 Crossroad Dash';
          pts = 180;
          this.sound.playCleanVaultCallout();
          this.sound.playPuluKisiBell(0);
          this.triggerHitstop(0.08, 0.35);
          this.player.triggerCameraShake(0.042, 0.15);
          this.fx.emitNearMissFriction(this.player.getX(), this.player.getY(), this.player.getZ(), skill.lateralDir);
          this.guardian.pushBack(1.1); // Dashing past sacred elephant outpaces Lakhey
          if (this.guardian.getFollowDistance() >= 4.4) this.sound.playGuardianOutpaced();
        }

        const bonusAwarded = this.scoreManager.addSkillBonus(pts);
        const currentMult = this.scoreManager.getMultiplier();
        this.sound.playMultiplierUp(currentMult);

        this.activeSkillCallout = {
          type: skill.type,
          title,
          subtitle: `${subtitle} (${currentMult}x)`,
          points: bonusAwarded,
          multiplier: currentMult,
          timestamp: performance.now(),
          lateralDir: skill.lateralDir,
        };
      }

      // Check in-run personal best record milestone
      const recordCheck = this.scoreManager.checkInRunRecord(currentDist);
      if (recordCheck.firstTimeThisRun) {
        this.sound.playHighScoreCelebration();
        this.player.triggerCameraShake(0.052, 0.22);
        this.isRecordBrokenInRun = true;
        this.activeSkillCallout = {
          type: 'RECORD_BROKEN',
          title: '🏆 NEW PERSONAL BEST!',
          subtitle: `${currentDist.toFixed(1)}m Reached!`,
          points: 100,
          multiplier: this.scoreManager.getMultiplier(),
          timestamp: performance.now(),
        };
      }

      // Phase 4: Torana Gateway Arch Milestone Celebrations (140m, 280m, 420m, etc.)
      const milestoneIndex = Math.floor(currentDist / RoadView.BIOME_LENGTH);
      if (milestoneIndex > this.lastMilestoneIndex && milestoneIndex >= 1) {
        this.lastMilestoneIndex = milestoneIndex;
        const milestoneMeters = milestoneIndex * RoadView.BIOME_LENGTH;
        const newBiome = this.road.getCurrentBiome(currentDist);

        // 1. Ceremonial Ghanti Temple Bell Chime & Festive Fanfare
        this.sound.playGhantiBellChime();

        // 2. Torana Milestone Particle Eruption (3D Marigold Petal Shower & Golden Sparkles)
        const milestoneZ = -milestoneMeters;
        this.fx.emitToranaMilestoneCelebration(this.player.getX(), 5.2, milestoneZ);

        // 3. Trigger In-Game Bell Pendulum Swing on Torana Gateway Arch
        this.road.triggerToranaBellSwing(milestoneMeters);

        // 4. Kinetic Adrenaline & Camera Surge
        this.triggerHitstop(0.08, 0.35);
        this.player.triggerCameraShake(0.045, 0.18);

        // 5. Award Milestone Bonus (+150 pts) & Multiplier Upgrade
        const bonusAwarded = this.scoreManager.addSkillBonus(150);
        const currentMult = this.scoreManager.getMultiplier();

        // 6. Celebratory Torana Milestone Callout Event
        this.activeSkillCallout = {
          type: 'MILESTONE_CLEARED',
          title: `⛩️ ${milestoneMeters}m TORANA CLEARED!`,
          subtitle: `${newBiome.name} Unlocked! (+${bonusAwarded})`,
          points: bonusAwarded,
          multiplier: currentMult,
          timestamp: performance.now(),
        };

        // 7. Friendly Guardian Surge Pushback
        this.guardian.pushBack(0.65);
      }

      // Update brass coins, magnetic attraction, and collection
      const coinResult = this.collectibleManager.update(
        effectiveDt,
        this.player.getX(),
        this.player.getY(),
        this.player.getZ(),
        this.obstacleManager.getActiveObstacles()
      );

      if (coinResult.collectedCount > 0) {
        for (let c = 0; c < coinResult.collectedCount; c++) {
          this.scoreManager.addCoin();
          this.sound.playCoinPickup(coinResult.comboCount);
        }
        for (const pos of coinResult.collectedPositions) {
          this.fx.emitCoinSparkle(pos.x, pos.y, pos.z);
        }

        // Rapid coin streaks also boost multiplier!
        if (coinResult.comboCount >= 3 && coinResult.comboCount % 3 === 0) {
          const { multiplier, upgraded } = this.scoreManager.boostMultiplier();
          if (upgraded) {
            this.sound.playMultiplierUp(multiplier);
            this.activeSkillCallout = {
              type: 'COMBO_SURGE',
              title: `${multiplier}x COMBO SURGE!`,
              subtitle: 'Rapid Coin Streak',
              points: 25 * multiplier,
              multiplier,
              timestamp: performance.now(),
            };
          }
        }
      }

      // Magnetic vacuum trail feedback
      if (coinResult.pulledCoins.length > 0) {
        for (const pos of coinResult.pulledCoins) {
          if (Math.random() < 0.45) {
            this.fx.emitCoinMagneticTrail(pos.x, pos.y, pos.z);
          }
        }
      }

      // 3D AABB Collision query (subdivided when a slow frame moves Tuku further than an obstacle is deep)
      const hit = this.checkSweptCollisions(previousPlayerZ, currentDist);

      if (hit) {
        this.collisionCount++;
        this.player.flashCollision();

        if (hit.obstacleType === 'ROLLING_MATKA') {
          this.fx.emitPotShatter(this.player.getX(), this.player.getY(), this.player.getZ());
          this.sound.playPotSmash();
        } else if (hit.obstacleType === 'GHAT_STEPS') {
          this.fx.emitWaterSplash(this.player.getX(), 0.1, this.player.getZ());
          this.sound.playWaterSplash();
        } else if (hit.obstacleType === 'BRIDGE_ROPE') {
          this.sound.playBridgeRopeSound();
        } else if (hit.obstacleType === 'PRAYER_FLAG_GALE') {
          this.sound.playWindGaleSound();
        }
        this.catchRunner(currentDist, hit.obstacleType, hit.lane);
      }
    }

    this.notifyTelemetry();
  }

  private checkSweptCollisions(previousZ: number, distance: number): CollisionInfo | null {
    const bounds = this.player.getBounds();
    const step = previousZ - this.player.getZ(); // forward motion is toward -Z
    const samples = Math.min(4, Math.floor(step / GameManager.MAX_COLLISION_STEP));
    if (samples > 0) {
      const { minZ, maxZ } = bounds;
      // Test the skipped positions oldest-first, using this frame's X/Y and obstacle positions.
      for (let i = samples; i >= 1; i--) {
        const back = (step * i) / (samples + 1);
        bounds.minZ = minZ + back;
        bounds.maxZ = maxZ + back;
        const hit = this.obstacleManager.checkCollisions(bounds, distance);
        if (hit) {
          bounds.minZ = minZ;
          bounds.maxZ = maxZ;
          return hit;
        }
      }
      bounds.minZ = minZ;
      bounds.maxZ = maxZ;
    }
    return this.obstacleManager.checkCollisions(bounds, distance);
  }

  /** Friendly, nonviolent catch shared by obstacle hits and the repeated edge bump. */
  private catchRunner(currentDist: number, cause: GameOverData['obstacleType'], lane?: LaneIndex): void {
    this.guardian.triggerCatch();
    this.player.triggerCaughtSequence();
    this.haptics.catch();
    this.sound.playCatchFlourish();
    this.sound.playGuardianRoarExertion();
    this.fx.emitCaughtCelebration(this.player.getX(), 1.2, this.player.getZ());
    this.sound.stopMusic();

    // Record high score and high coins
    const { isNewRecord, best, bestCoins } = this.scoreManager.registerScore(currentDist);
    const coinsCollected = this.scoreManager.getCoins();
    this.lastInputText = `👹 GUARDIAN CATCH: Lakhey scoops up the runner at ${currentDist.toFixed(1)}m!`;

    this.pendingGameOverData = {
      finalDistance: currentDist,
      bestDistance: best,
      isNewRecord,
      coins: coinsCollected,
      bestCoins: bestCoins,
      obstacleType: cause,
      lane,
      guardianDistance: this.guardian.getFollowDistance(),
    };

    // Transition directly to cinematic CAUGHT sequence (Lakhey scoops & hoists Tuku before challenge modal)
    this.caughtSequenceTimer = GameManager.CAUGHT_DURATION;
    this.setState('CAUGHT');
    this.notifyTelemetry();
  }

  /**
   * Swiping toward a side Tuku cannot go: a visible bump and Lakhey surges closer.
   * Bumping again before Lakhey has drifted back to his normal distance ends the run.
   */
  private handleEdgeBump(dir: -1 | 1): void {
    if (this.state !== 'RUNNING') return;
    const telemetry = this.player.getTelemetry();

    if (this.edgeBumpStrike && !this.guardian.hasRecoveredFollowDistance()) {
      this.edgeBumpStrike = false;
      this.collisionCount++;
      this.player.flashCollision();
      this.sound.playLandingSound();
      this.catchRunner(telemetry.distance, 'EDGE_BUMP', telemetry.targetLane);
      return;
    }

    this.edgeBumpStrike = true;
    this.haptics.bump();
    this.guardian.surgeCloser(GameManager.EDGE_BUMP_SURGE_DISTANCE);
    this.sound.playLandingSound();
    this.sound.playGuardianRoarExertion();
    this.player.triggerCameraShake(0.12, 0.22);
    this.fx.emitDodgeSkid(telemetry.x + dir * 0.6, PlayerController.GROUND_Y, telemetry.z, dir);
    this.activeSkillCallout = {
      type: 'EDGE_BUMP',
      title: "Blocked! Lakhey's closing in",
      subtitle: 'Bump again before he drops back and he catches you',
      points: 0,
      multiplier: this.scoreManager.getMultiplier(),
      timestamp: performance.now(),
      lateralDir: dir,
    };
  }

  public isEdgeBumpStrikeActive(): boolean {
    return this.edgeBumpStrike && !this.guardian.hasRecoveredFollowDistance();
  }

  public retry(): void {
    this.runId++;
    this.fx.reset();
    this.player.reset();
    this.player.startIntroPan();
    this.road.reset();
    this.obstacleManager.reset();
    this.collectibleManager.reset();
    this.scoreManager.resetRun();
    this.activeSkillCallout = undefined;
    this.isRecordBrokenInRun = false;
    this.hitstopTimer = 0;
    this.lastMilestoneIndex = 0;
    this.timeScale = 1.0;
    this.caughtSequenceTimer = 0;
    this.pendingGameOverData = undefined;
    this.guardian.reset(0);
    this.collisionCount = 0;
    this.edgeBumpStrike = false;
    this.sound.unlock();
    this.sound.playIntroFlourish();
    this.sound.startMusic();
    this.setState('RUNNING');
    this.lastInputText = 'Run restarted! Guardian is giving chase!';
    this.notifyTelemetry();
  }

  public reset(seed?: number): void {
    this.runId++;
    this.sound.stopMusic();
    this.fx.reset();
    this.player.reset();
    this.road.reset();
    this.obstacleManager.reset(seed);
    this.collectibleManager.reset(seed !== undefined ? seed + 46 : undefined);
    this.scoreManager.resetRun();
    this.activeSkillCallout = undefined;
    this.isRecordBrokenInRun = false;
    this.hitstopTimer = 0;
    this.lastMilestoneIndex = 0;
    this.timeScale = 1.0;
    this.caughtSequenceTimer = 0;
    this.pendingGameOverData = undefined;
    this.guardian.reset(0);
    this.collisionCount = 0;
    this.edgeBumpStrike = false;
    this.lastBiomeType = 'DURBAR_ALLEY';
    this.setState('READY');
    this.lastInputText = 'Reset complete. Tap to run.';
    this.notifyTelemetry();
  }

  public setSeed(newSeed: number): void {
    this.obstacleManager.setSeed(newSeed);
    this.reset(newSeed);
    this.lastInputText = `PRNG Seed updated to: ${newSeed}`;
    this.notifyTelemetry();
  }

  public setSpawnSpacing(spacing: number): void {
    this.obstacleManager.spawnSpacing = spacing;
    this.notifyTelemetry();
  }

  public setState(newState: GameState): void {
    if (this.state !== newState) {
      this.state = newState;
      if (this.onStateChangeCb) {
        this.onStateChangeCb(this.state);
      }
    }
  }

  public getState(): GameState {
    return this.state;
  }

  public getScoreManager(): ScoreManager {
    return this.scoreManager;
  }

  public getGuardian(): GuardianController {
    return this.guardian;
  }

  public getFx(): ParticleFxManager {
    return this.fx;
  }

  public getPlayer(): PlayerController {
    return this.player;
  }

  public getObstacleManager(): ObstacleManager {
    return this.obstacleManager;
  }

  public getSound(): SoundManager {
    return this.sound;
  }

  public getCollectibleManager(): CollectibleManager {
    return this.collectibleManager;
  }

  public toggleAudio(): boolean {
    return this.sound.toggleMute();
  }

  public isAudioMuted(): boolean {
    return this.sound.isMuted();
  }

  /** T039: apply player settings (volumes, camera shake, vibration). */
  public applySettings(settings: GameSettings): void {
    this.sound.setVolumes(settings.musicVolume, settings.effectsVolume);
    this.player.setShakeScale(settings.reduceShake ? 0 : 1);
    this.haptics.enabled = settings.vibration;
  }

  public isVibrationSupported(): boolean {
    return this.haptics.supported;
  }

  public unlockAudio(): void {
    this.sound.unlock();
  }

  public onGameOver(cb: (data: GameOverData) => void): void {
    this.onGameOverCb = cb;
  }

  public onTelemetry(cb: (payload: GameTelemetryPayload) => void): void {
    this.onTelemetryCb = cb;
  }

  public onStateChange(cb: (state: GameState) => void): void {
    this.onStateChangeCb = cb;
  }

  private cachedPayload?: GameTelemetryPayload;

  private notifyTelemetry(): void {
    if (this.onTelemetryCb) {
      const playerTel = this.player.getTelemetry();
      playerTel.coins = this.scoreManager.getCoins();
      const mult = this.scoreManager.getMultiplier();
      const multProg = this.scoreManager.getMultiplierProgress();
      const bonusScore = this.scoreManager.getBonusScore();
      const totalScore = this.scoreManager.getTotalScore(playerTel.distance);
      const biomeInfo = this.road.getCurrentBiome(playerTel.distance);

      if (!this.cachedPayload) {
        this.cachedPayload = {
          runId: this.runId,
          player: playerTel,
          state: this.state,
          lastInput: this.lastInputText,
          activeObstacles: this.obstacleManager.getActiveCount(),
          collisionCount: this.collisionCount,
          seed: this.obstacleManager.getSeed(),
          spawnSpacing: this.obstacleManager.spawnSpacing,
          currentScore: playerTel.distance,
          bestScore: this.scoreManager.getBest(),
          isStorageSupported: this.scoreManager.isStorageSupported(),
          guardianDistance: this.guardian.getFollowDistance(),
          guardianState: this.guardian.getGuardianState(),
          currentSpeed: this.player.getSpeed(),
          isAudioMuted: this.sound.isMuted(),
          coinCombo: this.collectibleManager.getComboCount(),
          multiplier: mult,
          multiplierProgress: multProg,
          bonusScore,
          totalScore,
          activeCallout: this.activeSkillCallout,
          isNewRecordInRun: this.isRecordBrokenInRun,
          currentBiome: biomeInfo.type,
          biomeName: biomeInfo.name,
          biomeTagline: biomeInfo.tagline,
          biomeProgress: biomeInfo.progress,
        };
      } else {
        const p = this.cachedPayload;
        p.runId = this.runId;
        p.player = playerTel;
        p.state = this.state;
        p.lastInput = this.lastInputText;
        p.activeObstacles = this.obstacleManager.getActiveCount();
        p.collisionCount = this.collisionCount;
        p.seed = this.obstacleManager.getSeed();
        p.spawnSpacing = this.obstacleManager.spawnSpacing;
        p.currentScore = playerTel.distance;
        p.bestScore = this.scoreManager.getBest();
        p.isStorageSupported = this.scoreManager.isStorageSupported();
        p.guardianDistance = this.guardian.getFollowDistance();
        p.guardianState = this.guardian.getGuardianState();
        p.currentSpeed = this.player.getSpeed();
        p.isAudioMuted = this.sound.isMuted();
        p.coinCombo = this.collectibleManager.getComboCount();
        p.multiplier = mult;
        p.multiplierProgress = multProg;
        p.bonusScore = bonusScore;
        p.totalScore = totalScore;
        p.activeCallout = this.activeSkillCallout;
        p.isNewRecordInRun = this.isRecordBrokenInRun;
        p.currentBiome = biomeInfo.type;
        p.biomeName = biomeInfo.name;
        p.biomeTagline = biomeInfo.tagline;
        p.biomeProgress = biomeInfo.progress;
      }
      this.onTelemetryCb(this.cachedPayload);
    }
  }

  public getCurrentBiome() {
    return this.road.getCurrentBiome(this.player.getTelemetry().distance);
  }

  public triggerAction(action: InputAction, source: string): void {
    this.handleAction(action, source);
  }

  /** UI may consume controls while a modal or first-run guidance is open. */
  public setActionGuard(guard: (action: InputAction) => boolean): void {
    this.actionGuard = guard;
  }
}

