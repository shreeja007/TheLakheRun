import {
  Application,
  Color,
  Entity,
  StandardMaterial,
  Vec3,
} from 'playcanvas';
import {
  LaneIndex,
  PlayerTelemetry,
  BoundingBox3D,
  JumpStyle,
  SlideStyle,
  DodgeStyle,
  JUMP_STYLE_NAMES,
  SLIDE_STYLE_NAMES,
  DODGE_STYLE_NAMES,
} from '../types';
import { RoadView } from '../world/RoadView';

export { JUMP_STYLE_NAMES, SLIDE_STYLE_NAMES, DODGE_STYLE_NAMES };

export class PlayerController {
  public static readonly GROUND_Y = 0.5; // Base center Y for 1.0m tall runner
  public static readonly JUMP_HEIGHT = 1.6;
  public static readonly JUMP_DURATION = 0.65; // Seconds
  public static readonly BASE_RUN_SPEED = 10.5; // Units/second base forward speed
  public static readonly LANE_SWITCH_SPEED = 18.0; // Units/second lateral transition
  public static readonly INTRO_PAN_DURATION = 1.45; // Cinematic teaser swoop duration in seconds
  public static readonly SLIDE_DURATION = 0.65; // Crouch slide window in seconds

  private entity: Entity;
  private shadowEntity: Entity;
  private cameraEntity: Entity;
  private bodyMat: StandardMaterial;

  // 3D Procedural Rig Joint Nodes
  private modelRoot?: Entity;
  private leftLegNode?: Entity;
  private rightLegNode?: Entity;
  private leftArmNode?: Entity;
  private rightArmNode?: Entity;
  private satchelNode?: Entity;
  private headNode?: Entity;
  private torsoNode?: Entity;

  // Athletic Sub-Joints (Elbows, Knees, Scarf Flutter)
  private leftElbowNode?: Entity;
  private rightElbowNode?: Entity;
  private leftKneeNode?: Entity;
  private rightKneeNode?: Entity;
  private scarfTailNode?: Entity;

  // Kinetic Impact & Landing Squash
  private landingCompressionTimer = 0;

  // Cinematic Intro & Standoff State
  private isReadyStandoff = true;
  private isIntroPanning = false;
  private introPanTime = 0;
  private idleTime = 0;
  private teaseYaw = 160.0;

  // Mid-Run Playful Tease / Taunt State
  private isTeasing = false;
  private teaseTime = 0;
  private teaseVariant = 0; // 0: Beckon Wave, 1: Double Hand Wave, 2: Thumb-to-Chest
  private readonly TEASE_ENTRY_TIME = 0.22; // 220ms smoothstep 180° spin
  private readonly TEASE_HOLD_TIME = 1.10;  // 1100ms backpedal taunt
  private readonly TEASE_EXIT_TIME = 0.22;  // 220ms smoothstep 180° spin back to forward sprint
  private readonly TEASE_TOTAL_TIME = 0.22 + 1.10 + 0.22; // 1.54s

  private currentLane: LaneIndex = 0;
  private targetLane: LaneIndex = 0;
  private currentX = 0.45;
  private currentY = PlayerController.GROUND_Y;
  private currentZ = 0;
  private currentSpeed = PlayerController.BASE_RUN_SPEED;

  // Natural Lateral Kinetics & Skater Banking
  private lateralVelocity = 0;
  private currentBankAngle = 0;

  // Multi-Style Movement State (3 random styles each)
  // Jump: 0 = Hurdle Vault, 1 = Front Flip Somersault, 2 = Backward Teasing Leap
  private jumpVariant: JumpStyle = 0;
  // Slide: 0 = Temple Run Glide, 1 = Parkour Dive Roll, 2 = Rockstar Knee Slide
  private slideVariant: SlideStyle = 0;
  // Dodge: 0 = Skater Carve Swipe, 1 = Lateral Barrel Hop, 2 = 360° Spin Quick-Step
  private dodgeVariant: DodgeStyle = 0;
  private dodgeDirection: -1 | 1 = 1;
  private dodgeTimer = 0;
  private isDodgeActive = false;
  private readonly DODGE_DURATION = 0.24; // 240ms dynamic lateral dodge window

  private isJumping = false;
  private isSliding = false;
  private isStumbling = false;
  private isCaughtSequence = false;
  private caughtProgress = 0;
  private jumpElapsedTime = 0;
  private jumpBufferTimer = 0;
  private slideElapsedTime = 0;
  private totalDistance = 0;
  private collisionFlashTimer = 0;

  // Athletic Stride & Footstep cadence
  private strideTime = 0;
  private lastStepPhase = 0;
  private onFootstepCb?: () => void;
  private onLandingCb?: (x: number, y: number, z: number) => void;
  private onJumpCb?: (variant: JumpStyle) => void;
  private onDodgeCb?: (dir: number, variant: DodgeStyle) => void;
  private onSlideCb?: (x: number, y: number, z: number, variant: SlideStyle) => void;

  // Camera Shake
  private cameraShakeTime = 0;
  private cameraShakeMagnitude = 0;

  constructor(app: Application, camera: Entity) {
    this.cameraEntity = camera;

    // Root player entity
    this.entity = new Entity('PlayerRunner');
    this.entity.setPosition(0, PlayerController.GROUND_Y, 0);

    // Body (Teal runner capsule/box)
    this.bodyMat = new StandardMaterial();
    this.bodyMat.diffuse = new Color(0.184, 0.471, 0.459); // Tuku Teal (#2F7875)
    this.bodyMat.useMetalness = true;
    this.bodyMat.metalness = 0.15;
    this.bodyMat.gloss = 0.6;
    this.bodyMat.update();

    const body = new Entity('Body');
    body.addComponent('render', { type: 'box' });
    body.setLocalScale(0.7, 1.0, 0.6);
    body.setLocalPosition(0, 0, 0);
    if (body.render) body.render.material = this.bodyMat;
    this.entity.addChild(body);

    // Head / visor accent (Cream #E8DDCA) indicating forward direction
    const visorMat = new StandardMaterial();
    visorMat.diffuse = new Color(0.91, 0.87, 0.79);
    visorMat.gloss = 0.5;
    visorMat.update();

    const visor = new Entity('Visor');
    visor.addComponent('render', { type: 'box' });
    visor.setLocalScale(0.45, 0.2, 0.25);
    visor.setLocalPosition(0, 0.35, -0.28);
    if (visor.render) visor.render.material = visorMat;
    this.entity.addChild(visor);

    // Maroon accent band / scarf placeholder (#8C414B)
    const scarfMat = new StandardMaterial();
    scarfMat.diffuse = new Color(0.55, 0.25, 0.29);
    scarfMat.gloss = 0.3;
    scarfMat.update();

    const scarf = new Entity('Scarf');
    scarf.addComponent('render', { type: 'box' });
    scarf.setLocalScale(0.72, 0.14, 0.62);
    scarf.setLocalPosition(0, 0.2, 0);
    if (scarf.render) scarf.render.material = scarfMat;
    this.entity.addChild(scarf);

    // Load Tuku v0.2 3D Static Blockout Model
    app.assets.loadFromUrl('/models/tuku_blockout_v02.glb', 'container', (err, asset) => {
      if (!err && asset && asset.resource) {
        const modelEntity = (asset.resource as any).instantiateRenderEntity();
        if (modelEntity) {
          modelEntity.name = 'Tuku_3D_Blockout';
          // Ground feet at world Y = 0 (offset from entity origin at Y = GROUND_Y = 0.5)
          modelEntity.setLocalPosition(0, -PlayerController.GROUND_Y, 0);
          this.entity.addChild(modelEntity);

          this.modelRoot = modelEntity;
          this.leftLegNode = modelEntity.findByName('LeftLegRoot') as Entity;
          this.rightLegNode = modelEntity.findByName('RightLegRoot') as Entity;
          this.leftArmNode = modelEntity.findByName('LeftArmRoot') as Entity;
          this.rightArmNode = modelEntity.findByName('RightArmRoot') as Entity;
          this.satchelNode = modelEntity.findByName('SatchelRoot') as Entity;
          this.headNode = modelEntity.findByName('HeadRoot') as Entity;
          this.torsoNode = modelEntity.findByName('TorsoRoot') as Entity;
          this.leftElbowNode = modelEntity.findByName('LeftElbowRoot') as Entity;
          this.rightElbowNode = modelEntity.findByName('RightElbowRoot') as Entity;
          this.leftKneeNode = modelEntity.findByName('LeftKneeRoot') as Entity;
          this.rightKneeNode = modelEntity.findByName('RightKneeRoot') as Entity;
          this.scarfTailNode = modelEntity.findByName('ScarfTailRoot') as Entity;

          // Enhance materials with stylized PBR properties so Tuku pops cleanly from dark alleyways
          const renders = modelEntity.findComponents('render');
          for (const r of renders) {
            if ((r as any).meshInstances) {
              for (const mi of (r as any).meshInstances) {
                const mat = mi.material as StandardMaterial;
                if (mat) {
                  mat.useMetalness = true;
                  mat.gloss = 0.65;
                  mat.update();
                }
              }
            }
          }

          // Seamlessly hide primitive graybox shapes
          body.enabled = false;
          visor.enabled = false;
          scarf.enabled = false;
        }
      }
    });

    app.root.addChild(this.entity);

    // Ground shadow projection (always stays at Y = 0.01 under player)
    const shadowMat = new StandardMaterial();
    shadowMat.diffuse = new Color(0.04, 0.05, 0.07);
    shadowMat.opacity = 0.55;
    shadowMat.blendType = 2; // pc.BLEND_NORMAL
    shadowMat.update();

    this.shadowEntity = new Entity('PlayerShadow');
    this.shadowEntity.addComponent('render', { type: 'plane' });
    this.shadowEntity.setLocalScale(0.8, 1, 0.8);
    this.shadowEntity.setPosition(this.currentX, 0.01, this.currentZ);
    if (this.shadowEntity.render) this.shadowEntity.render.material = shadowMat;
    app.root.addChild(this.shadowEntity);

    this.entity.setPosition(this.currentX, this.currentY, this.currentZ);
    this.entity.setEulerAngles(0, this.teaseYaw, 0);

    // Initialize camera into cinematic standoff framing with Lakhey commanding the scene
    this.cameraEntity.setPosition(1.25, 2.05, -2.75);
    this.cameraEntity.lookAt(new Vec3(0, 1.45, 3.4));
    if (this.cameraEntity.camera) {
      this.cameraEntity.camera.fov = 54.0;
    }
  }

  public startIntroPan(): void {
    this.isReadyStandoff = false;
    this.isIntroPanning = true;
    this.introPanTime = 0;
  }

  public isIntroActive(): boolean {
    return this.isIntroPanning;
  }

  public moveLeft(forcedVariant?: number): boolean {
    if (this.isTeasing) {
      this.cancelTease();
    }
    if (this.targetLane > -1) {
      this.targetLane = (this.targetLane - 1) as LaneIndex;
      this.dodgeDirection = -1;
      this.dodgeVariant = (forcedVariant !== undefined ? Math.max(0, Math.min(2, forcedVariant)) : Math.floor(Math.random() * 3)) as DodgeStyle;
      this.dodgeTimer = this.DODGE_DURATION;
      this.isDodgeActive = true;
      if (this.onDodgeCb) this.onDodgeCb(-1, this.dodgeVariant);
      return true;
    }
    return false;
  }

  public moveRight(forcedVariant?: number): boolean {
    if (this.isTeasing) {
      this.cancelTease();
    }
    if (this.targetLane < 1) {
      this.targetLane = (this.targetLane + 1) as LaneIndex;
      this.dodgeDirection = 1;
      this.dodgeVariant = (forcedVariant !== undefined ? Math.max(0, Math.min(2, forcedVariant)) : Math.floor(Math.random() * 3)) as DodgeStyle;
      this.dodgeTimer = this.DODGE_DURATION;
      this.isDodgeActive = true;
      if (this.onDodgeCb) this.onDodgeCb(1, this.dodgeVariant);
      return true;
    }
    return false;
  }

  public onSlide(cb: (x: number, y: number, z: number, variant: SlideStyle) => void): void {
    this.onSlideCb = cb;
  }

  public onJump(cb: (variant: JumpStyle) => void): void {
    this.onJumpCb = cb;
  }

  public jump(forcedVariant?: number): boolean {
    if (this.isTeasing) {
      this.cancelTease();
    }

    if (this.isSliding) {
      // Slide-cancel into jump immediately
      this.isSliding = false;
      this.slideElapsedTime = 0;
      this.headNode?.setLocalPosition(0, 1.36, 0);
    }

    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpElapsedTime = 0;
      this.jumpBufferTimer = 0;
      this.jumpVariant = (forcedVariant !== undefined ? Math.max(0, Math.min(2, forcedVariant)) : Math.floor(Math.random() * 3)) as JumpStyle;
      if (this.onJumpCb) this.onJumpCb(this.jumpVariant);
      return true;
    } else {
      // Buffer jump if tapped within landing window
      this.jumpBufferTimer = 0.16;
      return false;
    }
  }

  public slide(forcedVariant?: number): boolean {
    if (this.isTeasing) {
      this.cancelTease();
    }

    if (this.isSliding) return false;

    // If mid-air, dive straight into a ground slide
    if (this.isJumping) {
      this.isJumping = false;
      this.jumpElapsedTime = 0;
      this.currentY = PlayerController.GROUND_Y;
    }

    this.isSliding = true;
    this.slideElapsedTime = 0;
    this.slideVariant = (forcedVariant !== undefined ? Math.max(0, Math.min(2, forcedVariant)) : Math.floor(Math.random() * 3)) as SlideStyle;
    if (this.onSlideCb) this.onSlideCb(this.currentX, 0.05, this.currentZ, this.slideVariant);
    return true;
  }

  /**
   * Mid-Run Turn and Tease Activation
   * Tuku turns 180°, runs backward facing Lakhey and the player camera,
   * performs a cheeky taunt gesture, and spins back forward into sprint.
   */
  public triggerTease(forcedVariant?: number): { started: boolean; variant: number; reason?: string } {
    if (this.isReadyStandoff || this.isIntroPanning || this.isCaughtSequence) {
      return { started: false, variant: 0, reason: 'cinematic_state' };
    }
    if (this.isJumping) {
      return { started: false, variant: 0, reason: 'in_air' };
    }
    if (this.isSliding) {
      return { started: false, variant: 0, reason: 'sliding' };
    }
    if (this.isStumbling) {
      return { started: false, variant: 0, reason: 'stumbling' };
    }
    if (this.isTeasing) {
      return { started: false, variant: this.teaseVariant, reason: 'already_teasing' };
    }

    this.isTeasing = true;
    this.teaseTime = 0;
    this.teaseVariant = forcedVariant !== undefined ? forcedVariant : Math.floor(Math.random() * 3);
    return { started: true, variant: this.teaseVariant };
  }

  public cancelTease(): void {
    if (this.isTeasing) {
      this.isTeasing = false;
      this.teaseTime = 0;
      this.teaseYaw = 0.0;
    }
  }

  public isTeasingActive(): boolean {
    return this.isTeasing;
  }

  public getTeaseVariant(): number {
    return this.teaseVariant;
  }

  public getJumpVariant(): JumpStyle {
    return this.jumpVariant;
  }

  public setJumpVariant(variant: number): void {
    this.jumpVariant = Math.max(0, Math.min(2, Math.floor(variant))) as JumpStyle;
  }

  public getSlideVariant(): SlideStyle {
    return this.slideVariant;
  }

  public setSlideVariant(variant: number): void {
    this.slideVariant = Math.max(0, Math.min(2, Math.floor(variant))) as SlideStyle;
  }

  public getDodgeVariant(): DodgeStyle {
    return this.dodgeVariant;
  }

  public setDodgeVariant(variant: number): void {
    this.dodgeVariant = Math.max(0, Math.min(2, Math.floor(variant))) as DodgeStyle;
  }

  public isDodge(): boolean {
    return this.isDodgeActive;
  }

  public setSpeed(speed: number): void {
    this.currentSpeed = speed;
  }

  public getSpeed(): number {
    return this.currentSpeed;
  }

  public setDistance(dist: number): void {
    this.currentZ = -dist;
    this.totalDistance = dist;
    this.isReadyStandoff = false;
    this.isIntroPanning = false;
    this.entity.setPosition(this.currentX, this.currentY, this.currentZ);
  }

  public triggerCameraShake(magnitude = 0.22, duration = 0.25): void {
    this.cameraShakeMagnitude = magnitude;
    this.cameraShakeTime = duration;
  }

  public update(dt: number, isRunning: boolean, guardianDistance = 4.2): void {
    // 1. Forward progression
    let speedFactor = 1.0;
    if (this.isReadyStandoff) {
      speedFactor = 0.0;
      this.teaseYaw = 160.0;
      this.currentX = 0.45;
    } else if (this.isIntroPanning) {
      this.introPanTime += dt;
      const panProgress = Math.min(1.0, this.introPanTime / PlayerController.INTRO_PAN_DURATION);

      // Phase 1 (0.00s -> 0.42s): The Climax Tease Leap ("Catch me if you can!")
      if (this.introPanTime < 0.42) {
        speedFactor = 0.0;
        this.teaseYaw = 160.0;
      }
      // Phase 2 (0.42s -> 0.85s): The 180° Spin Takeoff!
      else if (this.introPanTime < 0.85) {
        const tB = (this.introPanTime - 0.42) / 0.43;
        const sSpin = tB * tB * (3.0 - 2.0 * tB);
        this.teaseYaw = 160.0 * (1.0 - sSpin);
        this.currentX = 0.45 * (1.0 - sSpin);
        speedFactor = sSpin * 0.45;
      }
      // Phase 3 (0.85s -> 1.45s): Full Sprint Acceleration & Third-Person Camera Lock
      else {
        this.teaseYaw = 0.0;
        this.currentX = 0.0;
        const tC = Math.min(1.0, (this.introPanTime - 0.85) / 0.60);
        speedFactor = 0.45 + 0.55 * tC;
      }

      if (panProgress >= 1.0) {
        this.isIntroPanning = false;
        speedFactor = 1.0;
        this.teaseYaw = 0.0;
        this.currentX = 0.0;
      }
    } else if (this.isTeasing) {
      this.teaseTime += dt;
      if (this.teaseTime >= this.TEASE_TOTAL_TIME) {
        this.isTeasing = false;
        this.teaseTime = 0;
        this.teaseYaw = 0.0;
      } else if (this.teaseTime < this.TEASE_ENTRY_TIME) {
        // Phase 1: Rapid 180° Spin Entry (0.00s -> 0.22s)
        const p = this.teaseTime / this.TEASE_ENTRY_TIME;
        const s = p * p * (3.0 - 2.0 * p);
        this.teaseYaw = 180.0 * s;
      } else if (this.teaseTime < this.TEASE_ENTRY_TIME + this.TEASE_HOLD_TIME) {
        // Phase 2: Backpedal Taunt (0.22s -> 1.32s)
        const holdP = (this.teaseTime - this.TEASE_ENTRY_TIME) / this.TEASE_HOLD_TIME;
        const wobble = Math.sin(holdP * Math.PI * 4.0) * 3.5;
        this.teaseYaw = 180.0 + wobble;
      } else {
        // Phase 3: Rapid 180° Spin Exit (1.32s -> 1.54s)
        const p = (this.teaseTime - (this.TEASE_ENTRY_TIME + this.TEASE_HOLD_TIME)) / this.TEASE_EXIT_TIME;
        const s = p * p * (3.0 - 2.0 * p);
        this.teaseYaw = 180.0 * (1.0 - s);
      }
    } else {
      this.teaseYaw = 0.0;
    }

    if (isRunning) {
      const distanceDelta = this.currentSpeed * speedFactor * dt;
      this.currentZ -= distanceDelta;
      this.totalDistance += distanceDelta;
    }

    // 2. Lateral lane transition (Critically damped 2nd-order spring physics)
    const targetX = RoadView.LANE_X[this.targetLane];
    const dx = targetX - this.currentX;

    // Critically damped spring (omega = 26.0 rad/s: responsive, snappy ~140ms settling, zero oscillation)
    const omega = 26.0;
    const springForce = omega * omega * dx;
    const dampingForce = 2.0 * omega * this.lateralVelocity;
    this.lateralVelocity += (springForce - dampingForce) * dt;
    this.currentX += this.lateralVelocity * dt;

    if (Math.abs(dx) < 0.003 && Math.abs(this.lateralVelocity) < 0.04) {
      this.currentX = targetX;
      this.lateralVelocity = 0;
      this.currentLane = this.targetLane;
    }

    if (this.isDodgeActive) {
      this.dodgeTimer -= dt;
      if (this.dodgeTimer <= 0) {
        this.dodgeTimer = 0;
        this.isDodgeActive = false;
      }
    }

    // Dynamic bank angle: driven directly by lateral velocity for true athletic skater carve
    const targetBank = isRunning ? Math.max(-18.0, Math.min(18.0, -(this.lateralVelocity / 16.0) * 16.0)) : 0;
    this.currentBankAngle += (targetBank - this.currentBankAngle) * Math.min(1.0, dt * 26.0);
    const bankAngle = this.currentBankAngle;

    // Torso cut yaw into the lateral dodge
    const cutYaw = isRunning ? -(this.lateralVelocity / 16.0) * 11.0 : 0;

    // 3. Jump arc progression & Landing kinetic compression
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    if (this.isJumping) {
      this.jumpElapsedTime += dt;
      const progress = this.jumpElapsedTime / PlayerController.JUMP_DURATION;

      if (progress >= 1.0) {
        // Landing complete: trigger heavy stone pavement landing sound & particle impact
        if (this.onLandingCb) this.onLandingCb(this.currentX, PlayerController.GROUND_Y, this.currentZ);

        // Check if jump was buffered
        if (this.jumpBufferTimer > 0 && isRunning) {
          this.isJumping = true;
          this.jumpElapsedTime = 0;
          this.jumpBufferTimer = 0;
        } else {
          this.isJumping = false;
          this.jumpElapsedTime = 0;
          this.landingCompressionTimer = 0.14; // 140ms landing kinetic compression
          this.currentY = PlayerController.GROUND_Y;
        }
      } else {
        // Asymmetric parkour jump curve: explosive liftoff + buoyant apex hangtime
        const arc = Math.pow(Math.sin(progress * Math.PI), 0.78);
        this.currentY = PlayerController.GROUND_Y + PlayerController.JUMP_HEIGHT * arc;
      }
    } else {
      // Handle Slide Duration & Low Ground Level
      if (this.isSliding) {
        this.slideElapsedTime += dt;
        if (this.slideElapsedTime >= PlayerController.SLIDE_DURATION) {
          this.isSliding = false;
          this.slideElapsedTime = 0;
          this.headNode?.setLocalPosition(0, 1.36, 0);
        }
      }

      // Landing kinetic squash & spring recovery
      let landingSquash = 0;
      if (this.landingCompressionTimer > 0) {
        this.landingCompressionTimer -= dt;
        const compProgress = Math.max(0, this.landingCompressionTimer / 0.14);
        landingSquash = Math.sin(compProgress * Math.PI) * 0.08;
      }

      if (this.isSliding) {
        // Smooth slide entry and push-off recovery to authentic low ground clearance (-0.38m)
        const slideProg = Math.min(1.0, this.slideElapsedTime / PlayerController.SLIDE_DURATION);
        let dropCurve = 1.0;
        if (slideProg < 0.15) {
          const t = slideProg / 0.15;
          dropCurve = t * t * (3.0 - 2.0 * t);
        } else if (slideProg > 0.80) {
          const recov = (slideProg - 0.80) / 0.20;
          dropCurve = 1.0 - recov * recov * (3.0 - 2.0 * recov);
        }
        const slideDrop = -0.38 * dropCurve;
        this.currentY = PlayerController.GROUND_Y + slideDrop;
      } else if (this.isIntroPanning) {
        const panProgress = Math.min(1.0, this.introPanTime / PlayerController.INTRO_PAN_DURATION);
        const s = panProgress * panProgress * (3.0 - 2.0 * panProgress);
        this.strideTime += dt * (this.currentSpeed * 1.05) * s;
        const strideBob = Math.abs(Math.sin(this.strideTime * 2.0)) * 0.045 * s;
        this.currentY = PlayerController.GROUND_Y + strideBob - landingSquash;
      } else if (isRunning) {
        // Athletic sprint stride cadence
        this.strideTime += dt * (this.currentSpeed * 1.05);
        const strideBob = Math.abs(Math.sin(this.strideTime * 2.0)) * 0.048;

        let dodgeHopArc = 0;
        if (this.isDodgeActive && this.dodgeVariant === 1) {
          const dodgeProg = 1.0 - (this.dodgeTimer / this.DODGE_DURATION);
          dodgeHopArc = Math.sin(dodgeProg * Math.PI) * 0.20;
        }

        this.currentY = PlayerController.GROUND_Y + strideBob - landingSquash + dodgeHopArc;

        // Trigger footstep sound on stone pavement contact
        const stepPhase = Math.sin(this.strideTime * 2.0);
        if (stepPhase < 0.15 && this.lastStepPhase >= 0.15) {
          if (this.onFootstepCb) this.onFootstepCb();
        }
        this.lastStepPhase = stepPhase;
      } else {
        this.currentY = PlayerController.GROUND_Y - landingSquash;
      }
    }

    // Collision flash decay
    if (this.collisionFlashTimer > 0) {
      this.collisionFlashTimer -= dt;
      if (this.collisionFlashTimer <= 0) {
        this.collisionFlashTimer = 0;
        this.bodyMat.diffuse.set(0.184, 0.471, 0.459); // Restore Tuku Teal
        this.bodyMat.update();
      }
    }

    // 4. Procedural 3D Character Articulation (True Joint Kinetics)
    if (this.modelRoot) {
      if (this.isStumbling) {
        // Harmless, agile stumble & balance recovery pose upon obstacle brush
        this.leftLegNode?.setLocalEulerAngles(14, 0, 5);
        this.rightLegNode?.setLocalEulerAngles(-18, 0, -5);
        this.leftKneeNode?.setLocalEulerAngles(-28, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles(-15, 0, 0);
        this.leftArmNode?.setLocalEulerAngles(-32, 0, -38);
        this.rightArmNode?.setLocalEulerAngles(-32, 0, 38);
        this.leftElbowNode?.setLocalEulerAngles(40, 0, 0);
        this.rightElbowNode?.setLocalEulerAngles(40, 0, 0);
        this.satchelNode?.setLocalEulerAngles(28.0, -18, 0);
        this.scarfTailNode?.setLocalEulerAngles(-45.0, 15, 0);
        this.headNode?.setLocalEulerAngles(-12.0, 0, 0);
        this.torsoNode?.setLocalEulerAngles(-16.0, 0, 0);
      } else if (this.isJumping) {
        const jumpProgress = Math.min(1.0, this.jumpElapsedTime / PlayerController.JUMP_DURATION);
        const tuckCurve = Math.sin(jumpProgress * Math.PI);
        const airBankZ = -(this.lateralVelocity / 16.0) * 12.0;

        if (this.jumpVariant === 1) {
          // Style 1: Front Flip Somersault (Acrobatic pitch somersault)
          if (jumpProgress < 0.22) {
            // Liftoff coil & knee tuck initiate
            const p = jumpProgress / 0.22;
            this.leftLegNode?.setLocalEulerAngles(-20.0 + p * 45.0, 0, 4 + airBankZ);
            this.rightLegNode?.setLocalEulerAngles(20.0 - p * 45.0, 0, -4 + airBankZ);
            this.leftKneeNode?.setLocalEulerAngles(-(30.0 + p * 50.0), 0, 0);
            this.rightKneeNode?.setLocalEulerAngles(-(30.0 + p * 50.0), 0, 0);

            this.leftArmNode?.setLocalEulerAngles(-30.0 + p * 70.0, 0, -20.0);
            this.rightArmNode?.setLocalEulerAngles(-30.0 + p * 70.0, 0, 20.0);
            this.leftElbowNode?.setLocalEulerAngles(50.0 + p * 25.0, 0, 0);
            this.rightElbowNode?.setLocalEulerAngles(50.0 + p * 25.0, 0, 0);

            this.torsoNode?.setLocalEulerAngles(15.0 * p, cutYaw, airBankZ);
            this.headNode?.setLocalEulerAngles(12.0 * p, 0, 0);
          } else if (jumpProgress < 0.78) {
            // Apex somersault tight tuck
            const tuckPeak = Math.sin(((jumpProgress - 0.22) / 0.56) * Math.PI);
            this.leftLegNode?.setLocalEulerAngles(52.0 + tuckPeak * 12.0, 0, 4);
            this.rightLegNode?.setLocalEulerAngles(52.0 + tuckPeak * 12.0, 0, -4);
            this.leftKneeNode?.setLocalEulerAngles(-(108.0 + tuckPeak * 12.0), 0, 0);
            this.rightKneeNode?.setLocalEulerAngles(-(108.0 + tuckPeak * 12.0), 0, 0);

            // Arms hugging shins/knees tightly
            this.leftArmNode?.setLocalEulerAngles(48.0, 0, -22.0);
            this.rightArmNode?.setLocalEulerAngles(48.0, 0, 22.0);
            this.leftElbowNode?.setLocalEulerAngles(82.0, 0, 0);
            this.rightElbowNode?.setLocalEulerAngles(82.0, 0, 0);

            this.torsoNode?.setLocalEulerAngles(22.0, cutYaw, airBankZ);
            this.headNode?.setLocalEulerAngles(24.0, 0, 0); // Chin tight to chest
          } else {
            // Landing uncoil & shock absorption prep
            const p = (jumpProgress - 0.78) / 0.22;
            this.leftLegNode?.setLocalEulerAngles(52.0 * (1.0 - p), 0, 4);
            this.rightLegNode?.setLocalEulerAngles(52.0 * (1.0 - p) - 8.0 * p, 0, -4);
            this.leftKneeNode?.setLocalEulerAngles(-(108.0 * (1.0 - p) + 20.0), 0, 0);
            this.rightKneeNode?.setLocalEulerAngles(-(108.0 * (1.0 - p) + 20.0), 0, 0);

            this.leftArmNode?.setLocalEulerAngles(48.0 * (1.0 - p) - 15.0 * p, 0, -22.0);
            this.rightArmNode?.setLocalEulerAngles(48.0 * (1.0 - p) + 15.0 * p, 0, 22.0);
            this.leftElbowNode?.setLocalEulerAngles(82.0 * (1.0 - p) + 30.0 * p, 0, 0);
            this.rightElbowNode?.setLocalEulerAngles(82.0 * (1.0 - p) + 30.0 * p, 0, 0);

            this.torsoNode?.setLocalEulerAngles(22.0 * (1.0 - p), cutYaw, airBankZ);
            this.headNode?.setLocalEulerAngles(24.0 * (1.0 - p), 0, 0);
          }
          this.satchelNode?.setLocalEulerAngles(tuckCurve * 28.0, -8, 0);
          this.scarfTailNode?.setLocalEulerAngles(-35.0 - tuckCurve * 30.0, 0, 0);
        } else if (this.jumpVariant === 2) {
          // Style 2: Backward Teasing Jump (Airborne 180° glance & taunt wave at Lakhey)
          if (jumpProgress < 0.28) {
            const p = jumpProgress / 0.28;
            this.leftLegNode?.setLocalEulerAngles(18.0 * p, 0, 4);
            this.rightLegNode?.setLocalEulerAngles(-22.0 * p, 0, -4);
            this.leftKneeNode?.setLocalEulerAngles(-(30.0 + p * 40.0), 0, 0);
            this.rightKneeNode?.setLocalEulerAngles(-(40.0 + p * 30.0), 0, 0);

            this.rightArmNode?.setLocalEulerAngles(-75.0 * p, 0, 32.0 * p);
            this.rightElbowNode?.setLocalEulerAngles(-80.0 * p, 0, 0);
            this.leftArmNode?.setLocalEulerAngles(-18.0 * p, 0, -26.0 * p);
            this.leftElbowNode?.setLocalEulerAngles(-65.0 * p, 0, 0);

            this.headNode?.setLocalEulerAngles(-6.0 * p, 10.0 * p, 0);
            this.torsoNode?.setLocalEulerAngles(-8.0 * p, 0, airBankZ);
          } else if (jumpProgress < 0.72) {
            const teaseWave = Math.sin((jumpProgress - 0.28) * 32.0) * 25.0;
            this.leftLegNode?.setLocalEulerAngles(24.0, 0, 4);
            this.rightLegNode?.setLocalEulerAngles(-26.0, 0, -4);
            this.leftKneeNode?.setLocalEulerAngles(-68.0, 0, 0);
            this.rightKneeNode?.setLocalEulerAngles(-82.0, 0, 0);

            // High teasing wave towards Lakhey
            this.rightArmNode?.setLocalEulerAngles(-82.0 + teaseWave * 0.2, 0, 34.0);
            this.rightElbowNode?.setLocalEulerAngles(-85.0 + teaseWave, 0, 0);

            // Left hand cocked on hip
            this.leftArmNode?.setLocalEulerAngles(-18.0, 0, -26.0);
            this.leftElbowNode?.setLocalEulerAngles(-68.0, 0, 0);

            this.headNode?.setLocalEulerAngles(-8.0, 14.0, 8.0);
            this.torsoNode?.setLocalEulerAngles(-8.0, 4.0, airBankZ);
          } else {
            const p = (jumpProgress - 0.72) / 0.28;
            this.leftLegNode?.setLocalEulerAngles(24.0 * (1.0 - p), 0, 4);
            this.rightLegNode?.setLocalEulerAngles(-26.0 * (1.0 - p), 0, -4);
            this.leftKneeNode?.setLocalEulerAngles(-(68.0 * (1.0 - p) + 20.0), 0, 0);
            this.rightKneeNode?.setLocalEulerAngles(-(82.0 * (1.0 - p) + 20.0), 0, 0);

            this.rightArmNode?.setLocalEulerAngles(-82.0 * (1.0 - p) + 15.0 * p, 0, 34.0 * (1.0 - p) + 20.0 * p);
            this.rightElbowNode?.setLocalEulerAngles(-85.0 * (1.0 - p) + 30.0 * p, 0, 0);
            this.leftArmNode?.setLocalEulerAngles(-18.0 * (1.0 - p) - 15.0 * p, 0, -26.0 * (1.0 - p) - 20.0 * p);
            this.leftElbowNode?.setLocalEulerAngles(-68.0 * (1.0 - p) + 30.0 * p, 0, 0);

            this.headNode?.setLocalEulerAngles(-8.0 * (1.0 - p), 14.0 * (1.0 - p), 0);
            this.torsoNode?.setLocalEulerAngles(-8.0 * (1.0 - p), 0, airBankZ);
          }
          const apexP = Math.sin(jumpProgress * Math.PI);
          this.satchelNode?.setLocalEulerAngles(apexP * 18.0, -8, 0);
          this.scarfTailNode?.setLocalEulerAngles(25.0 * apexP, 12.0 * apexP, 0);
        } else {
          // Style 0: Multi-phase parkour vault articulation (Default)
          if (jumpProgress < 0.35) {
            // Liftoff phase: lead knee driving up, push-off trailing leg, arms driving skyward
            const p = jumpProgress / 0.35;
            this.leftLegNode?.setLocalEulerAngles(-15.0 + p * 35.0, 0, 4 + airBankZ);
            this.rightLegNode?.setLocalEulerAngles(25.0 - p * 45.0, 0, -4 + airBankZ);
            this.leftKneeNode?.setLocalEulerAngles(-(20.0 + p * 60.0), 0, 0);
            this.rightKneeNode?.setLocalEulerAngles(-(40.0 + p * 30.0), 0, 0);

            // Arms drive up for lift
            this.leftArmNode?.setLocalEulerAngles(-25.0 + p * 60.0, 0, -22.0);
            this.rightArmNode?.setLocalEulerAngles(30.0 - p * 30.0, 0, 22.0);
            this.leftElbowNode?.setLocalEulerAngles(70.0 - p * 25.0, 0, 0);
            this.rightElbowNode?.setLocalEulerAngles(50.0 - p * 15.0, 0, 0);

            this.torsoNode?.setLocalEulerAngles(8.0 - p * 4.0, cutYaw, airBankZ);
            this.headNode?.setLocalEulerAngles(-5.0, 0, 0);
          } else if (jumpProgress < 0.75) {
            // Apex hurdle vault: high tuck, balanced arms, satchel floating
            const apexTuck = Math.sin(((jumpProgress - 0.35) / 0.40) * Math.PI);
            this.leftLegNode?.setLocalEulerAngles(22.0 + apexTuck * 10.0, 0, 4 + airBankZ);
            this.rightLegNode?.setLocalEulerAngles(-22.0 - apexTuck * 10.0, 0, -4 + airBankZ);
            this.leftKneeNode?.setLocalEulerAngles(-(75.0 + apexTuck * 15.0), 0, 0);
            this.rightKneeNode?.setLocalEulerAngles(-(85.0 + apexTuck * 10.0), 0, 0);

            // Arms spread wide for aerodynamic balance
            this.leftArmNode?.setLocalEulerAngles(32.0, 0, -32.0);
            this.rightArmNode?.setLocalEulerAngles(32.0, 0, 32.0);
            this.leftElbowNode?.setLocalEulerAngles(35.0, 0, 0);
            this.rightElbowNode?.setLocalEulerAngles(35.0, 0, 0);

            this.torsoNode?.setLocalEulerAngles(12.0, cutYaw, airBankZ);
            this.headNode?.setLocalEulerAngles(-4.0, 0, 0);
          } else {
            // Descent & touchdown prep: legs uncoil towards stone pavement
            const p = (jumpProgress - 0.75) / 0.25;
            this.leftLegNode?.setLocalEulerAngles(22.0 * (1.0 - p), 0, 4 + airBankZ);
            this.rightLegNode?.setLocalEulerAngles(-20.0 * (1.0 - p), 0, -4 + airBankZ);
            this.leftKneeNode?.setLocalEulerAngles(-(85.0 * (1.0 - p) + 15.0), 0, 0);
            this.rightKneeNode?.setLocalEulerAngles(-(90.0 * (1.0 - p) + 15.0), 0, 0);

            this.leftArmNode?.setLocalEulerAngles(32.0 * (1.0 - p) - 10.0 * p, 0, -22.0);
            this.rightArmNode?.setLocalEulerAngles(32.0 * (1.0 - p) + 10.0 * p, 0, 22.0);
            this.leftElbowNode?.setLocalEulerAngles(35.0 + p * 20.0, 0, 0);
            this.rightElbowNode?.setLocalEulerAngles(35.0 + p * 20.0, 0, 0);

            this.torsoNode?.setLocalEulerAngles(12.0 * (1.0 - p), cutYaw, airBankZ);
            this.headNode?.setLocalEulerAngles(0, 0, 0);
          }

          // Satchel weightlessness float & scarf updraft
          this.satchelNode?.setLocalEulerAngles(tuckCurve * 24.0, -8, 0);
          this.scarfTailNode?.setLocalEulerAngles(-18.0 - tuckCurve * 26.0, 0, 0);
        }
      } else if (this.isIntroPanning) {
        // Dynamic launch transition: turns forward from standoff glance into full sprint
        const panProgress = Math.min(1.0, this.introPanTime / PlayerController.INTRO_PAN_DURATION);
        const s = panProgress * panProgress * (3.0 - 2.0 * panProgress);

        const legSwing = Math.sin(this.strideTime) * 32.0 * s;
        const armSwing = -legSwing * 0.95;

        // Smoothly blend head glance from backward look (-36°) to forward (+3°)
        const headGlance = -36.0 * (1.0 - s);
        const headNod = Math.sin(this.strideTime * 2.0) * 3.5 * s;
        this.headNode?.setLocalEulerAngles(headNod + 3.0 * s, headGlance, 0);

        // Torso counter twist blend
        const torsoTwist = -18.0 * (1.0 - s) + Math.sin(this.strideTime) * 4.0 * s;
        this.torsoNode?.setLocalEulerAngles(0, torsoTwist, 0);

        // Arms & Legs blend from ready stance to sprint stride
        this.leftLegNode?.setLocalEulerAngles(legSwing * s + 12.0 * (1.0 - s), 0, 4.0 * (1.0 - s));
        this.rightLegNode?.setLocalEulerAngles(-legSwing * s - 8.0 * (1.0 - s), 0, -4.0 * (1.0 - s));
        this.leftKneeNode?.setLocalEulerAngles((legSwing < 0 ? Math.abs(legSwing) * 1.85 : 0) * s, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles((legSwing > 0 ? Math.abs(legSwing) * 1.85 : 0) * s, 0, 0);

        const leftElbowBend = (-65.0 + Math.sin(this.strideTime) * 25.0) * s + (-35.0) * (1.0 - s);
        const rightElbowBend = (-65.0 - Math.sin(this.strideTime) * 25.0) * s + (-20.0) * (1.0 - s);
        this.leftArmNode?.setLocalEulerAngles(armSwing * s - 18.0 * (1.0 - s), 0, -18.0);
        this.rightArmNode?.setLocalEulerAngles(-armSwing * s + 14.0 * (1.0 - s), 0, 18.0);
        this.leftElbowNode?.setLocalEulerAngles(leftElbowBend, 0, 0);
        this.rightElbowNode?.setLocalEulerAngles(rightElbowBend, 0, 0);
        this.satchelNode?.setLocalEulerAngles(Math.sin(this.strideTime * 2.0 - 0.4) * 12.0 * s, -8, 0);
        this.scarfTailNode?.setLocalEulerAngles(-10.0 - s * 20.0 + Math.sin(this.strideTime * 3.0) * 10.0 * s, 0, 0);
      } else if (this.isSliding) {
        const slideProg = Math.min(1.0, this.slideElapsedTime / PlayerController.SLIDE_DURATION);
        let dropCurve = 1.0;
        if (slideProg < 0.15) {
          const t = slideProg / 0.15;
          dropCurve = t * t * (3.0 - 2.0 * t);
        } else if (slideProg > 0.80) {
          const recov = (slideProg - 0.80) / 0.20;
          dropCurve = 1.0 - recov * recov * (3.0 - 2.0 * recov);
        }

        if (this.slideVariant === 1) {
          // Style 1: Rolling slide / parkour dive roll under hurdles
          if (slideProg < 0.20) {
            const p = slideProg / 0.20;
            this.torsoNode?.setLocalEulerAngles(20.0 * p, cutYaw * 0.5, bankAngle * 0.5);
            this.headNode?.setLocalPosition(0, 1.36 - 0.08 * p, -0.08 * p);
            this.headNode?.setLocalEulerAngles(26.0 * p, 0, 0);

            this.leftArmNode?.setLocalEulerAngles(-50.0 * p, 0, -20.0);
            this.rightArmNode?.setLocalEulerAngles(-50.0 * p, 0, 20.0);
            this.leftElbowNode?.setLocalEulerAngles(45.0 * p, 0, 0);
            this.rightElbowNode?.setLocalEulerAngles(45.0 * p, 0, 0);

            this.leftLegNode?.setLocalEulerAngles(40.0 * p, 0, 4);
            this.rightLegNode?.setLocalEulerAngles(40.0 * p, 0, -4);
            this.leftKneeNode?.setLocalEulerAngles(-85.0 * p, 0, 0);
            this.rightKneeNode?.setLocalEulerAngles(-85.0 * p, 0, 0);
          } else if (slideProg < 0.80) {
            this.torsoNode?.setLocalEulerAngles(25.0, cutYaw * 0.5, bankAngle * 0.5);
            this.headNode?.setLocalPosition(0, 1.28, -0.08);
            this.headNode?.setLocalEulerAngles(32.0, 0, 0);

            this.leftArmNode?.setLocalEulerAngles(35.0, 0, -24.0);
            this.rightArmNode?.setLocalEulerAngles(35.0, 0, 24.0);
            this.leftElbowNode?.setLocalEulerAngles(75.0, 0, 0);
            this.rightElbowNode?.setLocalEulerAngles(75.0, 0, 0);

            this.leftLegNode?.setLocalEulerAngles(55.0, 0, 4);
            this.rightLegNode?.setLocalEulerAngles(55.0, 0, -4);
            this.leftKneeNode?.setLocalEulerAngles(-110.0, 0, 0);
            this.rightKneeNode?.setLocalEulerAngles(-110.0, 0, 0);
          } else {
            const p = (slideProg - 0.80) / 0.20;
            this.torsoNode?.setLocalEulerAngles(25.0 * (1.0 - p), cutYaw * 0.5, bankAngle * 0.5);
            this.headNode?.setLocalPosition(0, 1.28 + 0.08 * p, -0.08 * (1.0 - p));
            this.headNode?.setLocalEulerAngles(32.0 * (1.0 - p), 0, 0);

            this.leftArmNode?.setLocalEulerAngles(35.0 * (1.0 - p), 0, -18.0);
            this.rightArmNode?.setLocalEulerAngles(35.0 * (1.0 - p), 0, 18.0);
            this.leftElbowNode?.setLocalEulerAngles(75.0 * (1.0 - p) + 60.0 * p, 0, 0);
            this.rightElbowNode?.setLocalEulerAngles(75.0 * (1.0 - p) + 60.0 * p, 0, 0);

            this.leftLegNode?.setLocalEulerAngles(55.0 * (1.0 - p), 0, 4);
            this.rightLegNode?.setLocalEulerAngles(55.0 * (1.0 - p), 0, -4);
            this.leftKneeNode?.setLocalEulerAngles(-110.0 * (1.0 - p) - 20.0 * p, 0, 0);
            this.rightKneeNode?.setLocalEulerAngles(-110.0 * (1.0 - p) - 20.0 * p, 0, 0);
          }
          this.satchelNode?.setLocalEulerAngles(22.0 * dropCurve, -6, 0);
          this.scarfTailNode?.setLocalEulerAngles(-60.0 * dropCurve, 0, 0);
        } else if (this.slideVariant === 2) {
          // Style 2: Double-knee rockstar power slide
          this.torsoNode?.setLocalEulerAngles(38.0 * dropCurve, cutYaw * 0.5, bankAngle * 0.5);

          this.headNode?.setLocalPosition(0, 1.36 - 0.05 * dropCurve, -0.08 * dropCurve);
          this.headNode?.setLocalEulerAngles(-18.0 * dropCurve, cutYaw * 0.3, 0);

          this.leftLegNode?.setLocalEulerAngles(74.0 * dropCurve, 0, 6.0 * dropCurve);
          this.rightLegNode?.setLocalEulerAngles(74.0 * dropCurve, 0, -6.0 * dropCurve);
          this.leftKneeNode?.setLocalEulerAngles(-122.0 * dropCurve, 0, 0);
          this.rightKneeNode?.setLocalEulerAngles(-122.0 * dropCurve, 0, 0);

          this.leftArmNode?.setLocalEulerAngles(-52.0 * dropCurve, 0, -38.0 * dropCurve);
          this.leftElbowNode?.setLocalEulerAngles(45.0 * dropCurve, 0, 0);

          this.rightArmNode?.setLocalEulerAngles(35.0 * dropCurve, 0, 36.0 * dropCurve);
          this.rightElbowNode?.setLocalEulerAngles(-22.0 * dropCurve, 0, 0);

          this.satchelNode?.setLocalEulerAngles(20.0 * dropCurve, -6, 0);
          this.scarfTailNode?.setLocalEulerAngles(-68.0 * dropCurve, 0, 0);
        } else {
          // Style 0: Authentic Temple Run athletic feet-first slide on flagstone pavement (Default)
          this.torsoNode?.setLocalEulerAngles(28.0 * dropCurve, cutYaw * 0.5, bankAngle * 0.5);

          // Head tracks forward along pavement horizon (chin tucked, eyes sharp on lane ahead - NEVER bent back!)
          this.headNode?.setLocalPosition(0, 1.36 - 0.04 * dropCurve, -0.06 * dropCurve);
          this.headNode?.setLocalEulerAngles(-12.0 * dropCurve, cutYaw * 0.3, 0);

          // Lead leg (Left) extended straight out gliding along flagstones
          this.leftLegNode?.setLocalEulerAngles(86.0 * dropCurve, 0, 4.0 * dropCurve);
          this.leftKneeNode?.setLocalEulerAngles(0, 0, 0);

          // Trailing leg (Right) folded tightly beneath hip in classic runner triangle
          this.rightLegNode?.setLocalEulerAngles(-38.0 * dropCurve, 0, -10.0 * dropCurve);
          this.rightKneeNode?.setLocalEulerAngles(-116.0 * dropCurve, 0, 0);

          // Trailing arm (Right): skimming near stone pavement for balance
          this.rightArmNode?.setLocalEulerAngles(32.0 * dropCurve, 0, 18.0 + 16.0 * dropCurve);
          this.rightElbowNode?.setLocalEulerAngles(-26.0 * dropCurve, 0, 0);

          // Lead arm (Left): flexed protectively across lower chest/ribs
          this.leftArmNode?.setLocalEulerAngles(-18.0 * dropCurve, 0, -18.0 - 10.0 * dropCurve);
          this.leftElbowNode?.setLocalEulerAngles(-52.0 * dropCurve, 0, 0);

          this.satchelNode?.setLocalEulerAngles(18.0 * dropCurve, -6, 0);
          this.scarfTailNode?.setLocalEulerAngles(-55.0 * dropCurve, 0, 0);
        }
      } else if (isRunning && this.isTeasing) {
        this.headNode?.setLocalPosition(0, 1.36, 0);

        // Dynamic transition blending during entry spin and exit spin
        let blendWeight = 1.0;
        if (this.teaseTime < this.TEASE_ENTRY_TIME) {
          const p = this.teaseTime / this.TEASE_ENTRY_TIME;
          blendWeight = p * p * (3.0 - 2.0 * p);
        } else if (this.teaseTime > this.TEASE_ENTRY_TIME + this.TEASE_HOLD_TIME) {
          const p = (this.teaseTime - (this.TEASE_ENTRY_TIME + this.TEASE_HOLD_TIME)) / this.TEASE_EXIT_TIME;
          blendWeight = 1.0 - (p * p * (3.0 - 2.0 * p));
        }

        // Backpedal stride cadence (legs push backward with athletic spring)
        const strideAngle = this.strideTime;
        const legSwing = Math.sin(strideAngle) * 30.0;
        const pelvicRoll = Math.sin(strideAngle) * 2.8;
        const pelvicYaw = -Math.sin(strideAngle) * 3.5;

        // In reverse run / backpedal:
        this.leftLegNode?.setLocalEulerAngles(-legSwing, pelvicYaw, pelvicRoll + 3.0);
        this.rightLegNode?.setLocalEulerAngles(legSwing, -pelvicYaw, -pelvicRoll - 3.0);

        const leftKneeBend = legSwing > 0 ? -Math.pow(Math.abs(legSwing) / 30.0, 1.2) * 72.0 : -Math.sin(Math.max(0, -legSwing) / 30.0 * Math.PI) * 16.0;
        const rightKneeBend = legSwing < 0 ? -Math.pow(Math.abs(legSwing) / 30.0, 1.2) * 72.0 : -Math.sin(Math.max(0, legSwing) / 30.0 * Math.PI) * 16.0;
        this.leftKneeNode?.setLocalEulerAngles(leftKneeBend, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles(rightKneeBend, 0, 0);

        // Standard sprint arm values for smooth blending
        const sprintArmSwing = -legSwing * 0.95;
        const sprintLeftElbow = 68.0 - Math.sin(strideAngle) * 20.0;
        const sprintRightElbow = 68.0 + Math.sin(strideAngle) * 20.0;

        let targetRightArmPitch = 0;
        let targetRightArmYaw = 0;
        let targetRightArmRoll = 18.0;
        let targetRightElbow = 0;

        let targetLeftArmPitch = 0;
        let targetLeftArmYaw = 0;
        let targetLeftArmRoll = -18.0;
        let targetLeftElbow = 0;

        let targetHeadPitch = 0;
        let targetHeadYaw = 0;
        let targetHeadRoll = 0;

        let targetTorsoPitch = 0;
        let targetTorsoYaw = 0;
        let targetTorsoRoll = 0;

        if (this.teaseVariant === 0) {
          // Variant 0: "Come Catch Me!" Beckon Wave
          // Right Arm: High playful wave beckoning towards Lakhey
          const teaseWave = Math.sin(this.teaseTime * 14.0) * 24.0;
          targetRightArmPitch = -78.0 + teaseWave * 0.15;
          targetRightArmRoll = 32.0;
          targetRightElbow = -85.0 + teaseWave;

          // Left Arm: Confidently planted on hip
          targetLeftArmPitch = -16.0;
          targetLeftArmRoll = -26.0;
          targetLeftElbow = -72.0;

          // Head: Cheeky nod & sideways tilt glancing directly at Lakhey
          targetHeadPitch = Math.sin(this.teaseTime * 9.0) * 5.0 - 4.0;
          targetHeadYaw = Math.sin(this.teaseTime * 4.5) * 8.0 - 10.0;
          targetHeadRoll = 6.0;

          // Torso: Swagger sway
          targetTorsoPitch = 2.0;
          targetTorsoYaw = Math.sin(this.teaseTime * 4.5) * 5.5;
          targetTorsoRoll = -3.0;
        } else if (this.teaseVariant === 1) {
          // Variant 1: Cheeky Double-Handed Festival Wave
          const waveA = Math.sin(this.teaseTime * 15.0) * 22.0;
          const waveB = Math.cos(this.teaseTime * 15.0) * 22.0;

          targetRightArmPitch = -84.0 + waveA * 0.15;
          targetRightArmRoll = 36.0;
          targetRightElbow = -76.0 + waveA;

          targetLeftArmPitch = -84.0 + waveB * 0.15;
          targetLeftArmRoll = -36.0;
          targetLeftElbow = -76.0 + waveB;

          // Head: Bouncing double nod to the Dhime festival rhythm
          targetHeadPitch = Math.sin(this.teaseTime * 12.0) * 7.5 - 4.0;
          targetHeadYaw = 0;
          targetHeadRoll = 0;

          targetTorsoPitch = 0;
          targetTorsoYaw = 0;
          targetTorsoRoll = Math.sin(this.teaseTime * 6.0) * 5.5;
        } else {
          // Variant 2: "Too Fast For You!" Confident Thumb-to-Chest
          const chestThump = Math.sin(this.teaseTime * 8.0) * 5.0;
          targetRightArmPitch = -48.0;
          targetRightArmYaw = 24.0;
          targetRightArmRoll = 14.0;
          targetRightElbow = -96.0 + chestThump;

          targetLeftArmPitch = -18.0;
          targetLeftArmRoll = -22.0;
          targetLeftElbow = -52.0;

          // Head: Confident chin-up tilt with cheeky smirk
          targetHeadPitch = -14.0;
          targetHeadYaw = -8.0;
          targetHeadRoll = 4.0;

          targetTorsoPitch = -6.0;
          targetTorsoYaw = 4.0;
          targetTorsoRoll = 0;
        }

        // Smooth blend from sprint pose to tease pose
        const finalRightArmPitch = -sprintArmSwing * (1.0 - blendWeight) + targetRightArmPitch * blendWeight;
        const finalRightArmYaw = targetRightArmYaw * blendWeight;
        const finalRightArmRoll = 18.0 * (1.0 - blendWeight) + targetRightArmRoll * blendWeight;
        const finalRightElbow = sprintRightElbow * (1.0 - blendWeight) + targetRightElbow * blendWeight;

        const finalLeftArmPitch = sprintArmSwing * (1.0 - blendWeight) + targetLeftArmPitch * blendWeight;
        const finalLeftArmYaw = targetLeftArmYaw * blendWeight;
        const finalLeftArmRoll = -18.0 * (1.0 - blendWeight) + targetLeftArmRoll * blendWeight;
        const finalLeftElbow = sprintLeftElbow * (1.0 - blendWeight) + targetLeftElbow * blendWeight;

        this.rightArmNode?.setLocalEulerAngles(finalRightArmPitch, finalRightArmYaw, finalRightArmRoll);
        this.rightElbowNode?.setLocalEulerAngles(finalRightElbow, 0, 0);

        this.leftArmNode?.setLocalEulerAngles(finalLeftArmPitch, finalLeftArmYaw, finalLeftArmRoll);
        this.leftElbowNode?.setLocalEulerAngles(finalLeftElbow, 0, 0);

        this.headNode?.setLocalEulerAngles(targetHeadPitch * blendWeight, targetHeadYaw * blendWeight, targetHeadRoll * blendWeight);
        this.torsoNode?.setLocalEulerAngles(targetTorsoPitch * blendWeight, targetTorsoYaw * blendWeight, targetTorsoRoll * blendWeight);

        // Satchel & Scarf dynamics
        this.satchelNode?.setLocalEulerAngles(Math.sin(strideAngle * 2.0) * 12.0, -8, 0);
        this.scarfTailNode?.setLocalEulerAngles(18.0 * blendWeight - 32.0 * (1.0 - blendWeight) + Math.sin(strideAngle * 3.5) * 14.0, Math.cos(strideAngle * 2.2) * 10.0, 0);
      } else if (isRunning) {
        this.headNode?.setLocalPosition(0, 1.36, 0);
        // Full athletic sprint stride cycle with true biomechanical counter-rotation
        const speedRatio = Math.min(1.0, Math.max(0, (this.currentSpeed - 10.5) / 5.5));
        const strideAngle = this.strideTime;
        const legSwing = Math.sin(strideAngle) * 34.0;
        const armSwing = -legSwing * 0.95;

        // Dynamic pelvic sway and roll matching leg drive
        const pelvicRoll = Math.sin(strideAngle) * 3.2;
        const pelvicYaw = -Math.sin(strideAngle) * 4.0;

        // Hip swing with subtle stance width (slight lateral flare for stability)
        this.leftLegNode?.setLocalEulerAngles(legSwing, pelvicYaw, pelvicRoll + 3.0);
        this.rightLegNode?.setLocalEulerAngles(-legSwing, -pelvicYaw, -pelvicRoll - 3.0);

        // Biomechanical knee kinematics:
        // Knee bends BACKWARD (heel kicks up towards buttocks behind runner, negative pitch around local X)
        // When leg swings back (legSwing < 0), heel kicks up high behind hip (flex -76°)
        // When swinging forward (legSwing > 0), knee stays straight/slight plant flexion (-14°)
        const leftKneeBend = legSwing < 0 ? -Math.pow(Math.abs(legSwing) / 34.0, 1.2) * 76.0 : -Math.sin(Math.max(0, legSwing) / 34.0 * Math.PI) * 16.0;
        const rightKneeBend = legSwing > 0 ? -Math.pow(Math.abs(legSwing) / 34.0, 1.2) * 76.0 : -Math.sin(Math.max(0, -legSwing) / 34.0 * Math.PI) * 16.0;

        // Landing impact compression
        const compFlex = this.landingCompressionTimer > 0 ? -(this.landingCompressionTimer / 0.14) * 24.0 : 0;

        // Lateral dodge joint adjustments
        let dodgeKneeLeft = 0;
        let dodgeKneeRight = 0;
        let dodgeArmLeftRoll = -18.0;
        let dodgeArmRightRoll = 18.0;

        if (this.isDodgeActive) {
          const dodgeProg = 1.0 - (this.dodgeTimer / this.DODGE_DURATION);
          if (this.dodgeVariant === 1) {
            // Lateral Barrel hop tuck
            const hopFlex = Math.sin(dodgeProg * Math.PI) * -38.0;
            dodgeKneeLeft = hopFlex;
            dodgeKneeRight = hopFlex;
            dodgeArmLeftRoll = -18.0 - Math.sin(dodgeProg * Math.PI) * 22.0;
            dodgeArmRightRoll = 18.0 + Math.sin(dodgeProg * Math.PI) * 22.0;
          } else if (this.dodgeVariant === 2) {
            // 360 Spin step - arms fold close to torso
            dodgeArmLeftRoll = -12.0;
            dodgeArmRightRoll = 12.0;
          } else {
            // Skater carve
            dodgeKneeLeft = this.lateralVelocity < -1.0 ? -12.0 : 0;
            dodgeKneeRight = this.lateralVelocity > 1.0 ? -12.0 : 0;
          }
        } else {
          dodgeKneeLeft = this.lateralVelocity < -1.0 ? -12.0 : 0;
          dodgeKneeRight = this.lateralVelocity > 1.0 ? -12.0 : 0;
        }

        this.leftKneeNode?.setLocalEulerAngles(leftKneeBend + compFlex + dodgeKneeLeft, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles(rightKneeBend + compFlex + dodgeKneeRight, 0, 0);

        // Athletic sprint bent-elbow arm drive:
        // Elbow bends FORWARD (pumping fists in front of chest into running direction, positive pitch around local X)
        // Elbow angle flexes to ~75° on forward punch, opens to ~55° on backswing
        const leftElbowBend = 68.0 - Math.sin(strideAngle) * 20.0;
        const rightElbowBend = 68.0 + Math.sin(strideAngle) * 20.0;
        this.leftArmNode?.setLocalEulerAngles(armSwing, 0, dodgeArmLeftRoll);
        this.rightArmNode?.setLocalEulerAngles(-armSwing, 0, dodgeArmRightRoll);
        this.leftElbowNode?.setLocalEulerAngles(leftElbowBend, 0, 0);
        this.rightElbowNode?.setLocalEulerAngles(rightElbowBend, 0, 0);

        // Satchel inertia: lags behind pelvic bounce + lateral inertia
        const satchelWobble = Math.sin(strideAngle * 2.0 - 0.4) * 14.0;
        const satchelCentrifugal = -(this.lateralVelocity / 16.0) * 16.0;
        this.satchelNode?.setLocalEulerAngles(satchelWobble, -8 + satchelCentrifugal, satchelCentrifugal * 0.7);

        // Scarf tail aerodynamic wind flutter and speed drag
        const windFlutter = Math.sin(strideAngle * 3.5) * 16.0;
        const windDrift = Math.cos(strideAngle * 2.6) * 10.0;
        this.scarfTailNode?.setLocalEulerAngles(-32.0 - speedRatio * 22.0 + windFlutter, windDrift, 0);

        // Focused running head nod & in-chase glance when Lakhey surges close
        const headNod = Math.sin(strideAngle * 2.0) * 3.8;
        if (guardianDistance < 3.2) {
          const proximityRatio = Math.min(1.0, (3.2 - guardianDistance) / 1.6);
          const glanceYaw = -28.0 * proximityRatio + Math.sin(strideAngle * 0.5) * 4.0;
          this.headNode?.setLocalEulerAngles(headNod - 2.0 * proximityRatio, glanceYaw, 0);
        } else {
          this.headNode?.setLocalEulerAngles(headNod - 5.0, 0, 0); // Compensates for torso sprint lean, keeping eyes focused ahead!
        }

        // Spine counter-rotation: shoulders rotate opposite to pelvis to maintain angular balance!
        const torsoCounterTwist = Math.sin(strideAngle) * 5.5 + cutYaw;
        const torsoMicroPitch = Math.abs(Math.sin(strideAngle * 2.0)) * 2.0;
        this.torsoNode?.setLocalEulerAngles(torsoMicroPitch, torsoCounterTwist, -pelvicRoll * 0.5);
      } else if (this.isReadyStandoff) {
        // Expressive festival ready teasing standoff: Tuku faces Lakhey and playfully waves & bounces
        this.idleTime += dt;
        const bounceTime = this.idleTime * 4.2;
        const bounceY = Math.abs(Math.sin(bounceTime)) * 0.04;
        this.currentY = PlayerController.GROUND_Y + bounceY;

        // Right Arm: Playful teasing "Come on, catch me!" wave towards Lakhey
        const teaseWave = Math.sin(this.idleTime * 5.2) * 26.0;
        this.rightArmNode?.setLocalEulerAngles(-78.0 + teaseWave * 0.2, 0, 34.0);
        this.rightElbowNode?.setLocalEulerAngles(-85.0 + teaseWave, 0, 0);

        // Left Arm: Hand confidently planted on hip
        this.leftArmNode?.setLocalEulerAngles(-16.0, 0, -26.0);
        this.leftElbowNode?.setLocalEulerAngles(-72.0, 0, 0);

        // Torso & Pelvis swagger sway
        const torsoSway = Math.sin(this.idleTime * 2.1) * 4.5;
        this.torsoNode?.setLocalEulerAngles(torsoSway * 0.5, torsoSway, -4.0);

        // Head: Nodding & tilting cheekily at Lakhey with an expressive grin
        const headNod = Math.sin(this.idleTime * 4.2) * 6.0;
        const headTilt = Math.sin(this.idleTime * 2.1) * 8.0;
        this.headNode?.setLocalEulerAngles(headNod - 4.0, headTilt - 12.0, 8.0);

        // Legs: Bouncing rhythmically to the festival beat (natural backward knee flexion)
        this.leftLegNode?.setLocalEulerAngles(12.0, -4.0, 6.0);
        this.leftKneeNode?.setLocalEulerAngles(-(18.0 + bounceY * 180.0), 0, 0);
        this.rightLegNode?.setLocalEulerAngles(-8.0, 4.0, -6.0);
        this.rightKneeNode?.setLocalEulerAngles(-(22.0 + bounceY * 180.0), 0, 0);

        // Scarf tail & Satchel
        this.scarfTailNode?.setLocalEulerAngles(-14.0 + Math.sin(this.idleTime * 3.2) * 14.0, Math.cos(this.idleTime * 2.1) * 10.0, 0);
        this.satchelNode?.setLocalEulerAngles(6.0, -10.0, 0);
      } else if (this.isIntroPanning && this.introPanTime < 0.42) {
        // Intro Phase 1: The Climax Tease Leap ("Catch me if you can!")
        const tA = this.introPanTime / 0.42;
        const leapArc = Math.sin(tA * Math.PI);
        this.currentY = PlayerController.GROUND_Y + leapArc * 0.26;

        // Both arms throw up and out in a cheeky celebration/taunt gesture
        this.leftArmNode?.setLocalEulerAngles(-100.0 * leapArc, 0, -42.0 * leapArc);
        this.leftElbowNode?.setLocalEulerAngles(-30.0 * leapArc, 0, 0);
        this.rightArmNode?.setLocalEulerAngles(-100.0 * leapArc, 0, 42.0 * leapArc);
        this.rightElbowNode?.setLocalEulerAngles(-30.0 * leapArc, 0, 0);

        this.headNode?.setLocalEulerAngles(-18.0 * leapArc, 0, 0);
        this.torsoNode?.setLocalEulerAngles(-8.0 * leapArc, 0, 0);
        this.leftKneeNode?.setLocalEulerAngles(-48.0 * leapArc, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles(-48.0 * leapArc, 0, 0);
        this.scarfTailNode?.setLocalEulerAngles(28.0 * leapArc, 0, 0);
      } else if (this.isIntroPanning && this.introPanTime < 0.85) {
        // Intro Phase 2: The 180° Spin Takeoff!
        const tB = (this.introPanTime - 0.42) / 0.43;
        const sSpin = tB * tB * (3.0 - 2.0 * tB);
        this.currentY = PlayerController.GROUND_Y;

        // Sprint takeoff crouch drive (knees flex backwards, elbows flex forward into sprint pump)
        this.leftLegNode?.setLocalEulerAngles(-28.0 * sSpin, 0, 0);
        this.leftKneeNode?.setLocalEulerAngles(-55.0 * sSpin, 0, 0);
        this.rightLegNode?.setLocalEulerAngles(22.0 * sSpin, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles(-20.0 * sSpin, 0, 0);

        this.leftArmNode?.setLocalEulerAngles(35.0 * sSpin, 0, -18.0);
        this.leftElbowNode?.setLocalEulerAngles(60.0 * sSpin, 0, 0);
        this.rightArmNode?.setLocalEulerAngles(-45.0 * sSpin, 0, 18.0);
        this.rightElbowNode?.setLocalEulerAngles(60.0 * sSpin, 0, 0);

        this.headNode?.setLocalEulerAngles(4.0 * (1.0 - sSpin), 0, 0);
        this.torsoNode?.setLocalEulerAngles(8.0 * sSpin, 0, 0);
        this.scarfTailNode?.setLocalEulerAngles(-25.0 * sSpin, 15.0 * Math.sin(sSpin * Math.PI), 0);
      } else {
        // Neutral idle A-pose
        this.leftLegNode?.setLocalEulerAngles(0, 0, 0);
        this.rightLegNode?.setLocalEulerAngles(0, 0, 0);
        this.leftKneeNode?.setLocalEulerAngles(0, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles(0, 0, 0);
        this.leftArmNode?.setLocalEulerAngles(0, 0, -18);
        this.rightArmNode?.setLocalEulerAngles(0, 0, 18);
        this.leftElbowNode?.setLocalEulerAngles(0, 0, 0);
        this.rightElbowNode?.setLocalEulerAngles(0, 0, 0);
        this.satchelNode?.setLocalEulerAngles(0, -8, 0);
        this.scarfTailNode?.setLocalEulerAngles(0, 0, 0);
        this.headNode?.setLocalEulerAngles(0, 0, 0);
        this.torsoNode?.setLocalEulerAngles(0, 0, 0);
      }
    }

    // Apply transform to player mesh (with dynamic forward sprint lean, skater bank, & multi-style rotations)
    const leanProgress = this.isIntroPanning ? Math.min(1.0, this.introPanTime / PlayerController.INTRO_PAN_DURATION) : (isRunning ? 1.0 : 0);
    const speedLean = 7.0 + (this.currentSpeed - 10.5) * 0.85; // Athletic 7° to 15° forward lean
    const forwardLean = this.isTeasing ? 3.0 : (isRunning && !this.isJumping && !this.isSliding && !this.isStumbling ? speedLean * leanProgress : (this.isStumbling ? -10.0 : 0));

    let entityPitch = forwardLean;
    let entityYaw = this.teaseYaw + cutYaw * 0.4;
    let entityRoll = bankAngle;

    // 1. Jump Multi-Style Pitch / Yaw Rotation
    if (this.isJumping) {
      const jumpProgress = Math.min(1.0, this.jumpElapsedTime / PlayerController.JUMP_DURATION);
      if (this.jumpVariant === 1) {
        // Style 1: Front flip somersault (full 360° forward pitch roll)
        entityPitch = -360.0 * jumpProgress;
      } else if (this.jumpVariant === 2) {
        // Style 2: Backward teasing jump (180° airborne spin-glance facing Lakhey)
        let jumpSpinYaw = 0;
        if (jumpProgress < 0.28) {
          const t = jumpProgress / 0.28;
          jumpSpinYaw = 180.0 * (t * t * (3.0 - 2.0 * t));
        } else if (jumpProgress < 0.70) {
          jumpSpinYaw = 180.0 + Math.sin(((jumpProgress - 0.28) / 0.42) * Math.PI) * 6.0;
        } else {
          const t = (jumpProgress - 0.70) / 0.30;
          jumpSpinYaw = 180.0 * (1.0 - (t * t * (3.0 - 2.0 * t)));
        }
        entityYaw = jumpSpinYaw;
      }
    }
    // 2. Slide Multi-Style Pitch Rotation
    else if (this.isSliding) {
      if (this.slideVariant === 1) {
        // Style 1: Rolling slide / parkour dive roll (full 360° pitch roll along ground)
        const slideProg = Math.min(1.0, this.slideElapsedTime / PlayerController.SLIDE_DURATION);
        entityPitch = -360.0 * slideProg;
      }
    }

    // 3. Dodge Multi-Style Barrel Hop Roll & 360° Spin Quick-Step
    if (this.isDodgeActive && !this.isJumping && !this.isSliding && !this.isTeasing) {
      const dodgeProg = 1.0 - (this.dodgeTimer / this.DODGE_DURATION);
      if (this.dodgeVariant === 1) {
        // Style 1: Lateral aerial barrel roll into target lane
        const hopRoll = this.dodgeDirection * Math.sin(dodgeProg * Math.PI) * 28.0;
        entityRoll += hopRoll;
      } else if (this.dodgeVariant === 2) {
        // Style 2: 360° trickster pirouette spin step
        const s = dodgeProg * dodgeProg * (3.0 - 2.0 * dodgeProg);
        entityYaw += this.dodgeDirection * s * 360.0;
      }
    }

    this.entity.setPosition(this.currentX, this.currentY, this.currentZ);
    this.entity.setEulerAngles(entityPitch, entityYaw, entityRoll);

    // Apply transform to ground shadow
    // Shadow shrinks slightly as player gets higher to provide altitude depth cue
    const altitude = this.currentY - PlayerController.GROUND_Y;
    const shadowScale = Math.max(0.4, 0.8 - altitude * 0.2);
    this.shadowEntity.setPosition(this.currentX, 0.01, this.currentZ);
    this.shadowEntity.setLocalScale(shadowScale, 1, shadowScale);

    // 5. Camera positioning & dynamic speed-scaled FOV
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    if (this.cameraShakeTime > 0) {
      this.cameraShakeTime -= dt;
      const progress = Math.max(0, this.cameraShakeTime / 0.25);
      const intensity = this.cameraShakeMagnitude * progress;
      shakeOffsetX = (Math.random() * 2 - 1) * intensity;
      shakeOffsetY = (Math.random() * 2 - 1) * intensity;
    }

    if (this.isReadyStandoff) {
      // Cinematic standoff tableau framing Lakhey front-and-center in his full guardian glory
      // framed against the towering Durbar Palace Gateway and soaring Pagoda backdrop!
      // Tuku is in the lower foreground, turned back playfully to face the guardian.
      const idleCamSwayX = Math.sin(this.idleTime * 1.5) * 0.04;
      const idleCamBobY = Math.cos(this.idleTime * 1.8) * 0.02;

      this.cameraEntity.setPosition(1.25 + idleCamSwayX, 2.05 + idleCamBobY, this.currentZ - 2.75);
      this.cameraEntity.lookAt(new Vec3(0, 1.45, this.currentZ + 3.4));
      if (this.cameraEntity.camera) {
        this.cameraEntity.camera.fov = 54.0;
      }
    } else if (this.isIntroPanning) {
      // Exhilarating cinematic camera swoop and roll:
      // Orbiting from facing Lakhey around the side into trailing behind Tuku's shoulders
      const panProgress = Math.min(1.0, this.introPanTime / PlayerController.INTRO_PAN_DURATION);
      const s = panProgress * panProgress * (3.0 - 2.0 * panProgress);

      // Wide orbit arc sweeping smoothly along the right flank
      const arcBulgeX = Math.sin(s * Math.PI) * 1.65;
      const arcBulgeY = Math.sin(s * Math.PI) * 0.45;

      const startCamX = 1.25;
      const endCamX = this.currentX * 0.35 + shakeOffsetX;
      const camX = (startCamX + (endCamX - startCamX) * s) + arcBulgeX;

      const startCamY = 2.05;
      const endCamY = 4.2 + shakeOffsetY;
      const camY = (startCamY + (endCamY - startCamY) * s) + arcBulgeY;

      const startCamRelZ = -2.75;
      const endCamRelZ = 6.6;
      const camZ = this.currentZ + (startCamRelZ + (endCamRelZ - startCamRelZ) * s);

      this.cameraEntity.setPosition(camX, camY, camZ);

      // LookAt target smoothly tracks from Lakhey's mask down to Tuku's sprinting back
      const startLookX = 0.0;
      const endLookX = this.currentX * 0.2;
      const lookX = startLookX + (endLookX - startLookX) * s;

      const startLookY = 1.45;
      const endLookY = 0.8;
      const lookY = startLookY + (endLookY - startLookY) * s;

      const startLookRelZ = 3.4;
      const endLookRelZ = -4.5;
      const lookZ = this.currentZ + (startLookRelZ + (endLookRelZ - startLookRelZ) * s);

      this.cameraEntity.lookAt(new Vec3(lookX, lookY, lookZ));

      // Dynamic Camera Roll (Dutch tilt banking into the curve)
      // Rolls up to 5.5° during the mid-swoop, smoothly leveling off upright as chase begins
      const rollAngle = Math.sin(s * Math.PI) * 5.5;
      this.cameraEntity.rotateLocal(0, 0, rollAngle);

      if (this.cameraEntity.camera) {
        this.cameraEntity.camera.fov = 54.0 + (56.0 - 54.0) * s;
      }
    } else {
      // Standard sprint chase trailing camera
      const camSwayX = isRunning && !this.isJumping ? Math.sin(this.strideTime) * 0.035 : 0;
      const camSwayY = isRunning && !this.isJumping ? Math.abs(Math.cos(this.strideTime * 2.0)) * 0.025 : 0;
      const slideCamOffset = this.isSliding ? -0.42 : 0;

      const cameraTargetX = this.currentX * 0.35 + shakeOffsetX + camSwayX;
      const cameraTargetY = 4.2 + shakeOffsetY + camSwayY + slideCamOffset;
      const cameraTargetZ = this.currentZ + 6.6;

      this.cameraEntity.setPosition(cameraTargetX, cameraTargetY, cameraTargetZ);
      // Camera looks forward along track with excellent lane visibility and guardian framing
      this.cameraEntity.lookAt(new Vec3(this.currentX * 0.2, 0.8, this.currentZ - 4.5));

      // Dynamic speed-scaled FOV: expands from 56° to 63° to simulate speed rush
      if (this.cameraEntity.camera) {
        const speedRatio = Math.min(1.0, Math.max(0, (this.currentSpeed - 10.5) / 5.5));
        const targetFov = 56.0 + speedRatio * 7.0;
        this.cameraEntity.camera.fov = targetFov;
      }
    }
  }

  public onFootstep(cb: () => void): void {
    this.onFootstepCb = cb;
  }

  public onLanding(cb: (x: number, y: number, z: number) => void): void {
    this.onLandingCb = cb;
  }

  public onDodge(cb: (dir: number, variant: DodgeStyle) => void): void {
    this.onDodgeCb = cb;
  }

  public flashCollision(): void {
    if (this.isTeasing) this.cancelTease();
    this.collisionFlashTimer = 0.35;
    this.isStumbling = true;
    this.triggerCameraShake(0.28, 0.3);
    this.bodyMat.diffuse.set(0.88, 0.12, 0.15); // Flash Crimson on impact
    this.bodyMat.update();
  }

  private cachedBounds: BoundingBox3D = {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
    minZ: 0,
    maxZ: 0,
  };

  private cachedTelemetry: PlayerTelemetry = {
    lane: 0,
    targetLane: 0,
    x: 0,
    y: PlayerController.GROUND_Y,
    z: 0,
    isJumping: false,
    isSliding: false,
    isTeasing: false,
    jumpVariant: 0,
    slideVariant: 0,
    dodgeVariant: 0,
    distance: 0,
    coins: 0,
    bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
  };

  public getBounds(): BoundingBox3D {
    this.cachedBounds.minX = this.currentX - 0.35;
    this.cachedBounds.maxX = this.currentX + 0.35;
    if (this.isSliding) {
      this.cachedBounds.minY = 0.0;
      this.cachedBounds.maxY = 0.38; // Crouch slide low profile
      this.cachedBounds.minZ = this.currentZ - 0.55;
      this.cachedBounds.maxZ = this.currentZ + 0.55;
    } else {
      this.cachedBounds.minY = this.currentY - 0.5;
      this.cachedBounds.maxY = this.currentY + 0.5;
      this.cachedBounds.minZ = this.currentZ - 0.3;
      this.cachedBounds.maxZ = this.currentZ + 0.3;
    }
    return this.cachedBounds;
  }

  public isPlayerSliding(): boolean {
    return this.isSliding;
  }

  public triggerCaughtSequence(): void {
    if (this.isTeasing) this.cancelTease();
    this.isCaughtSequence = true;
    this.caughtProgress = 0;
    this.isStumbling = false;
    this.isJumping = false;
    this.isSliding = false;
  }

  public isCaught(): boolean {
    return this.isCaughtSequence;
  }

  public getCaughtProgress(): number {
    return this.caughtProgress;
  }


  /**
   * Cinematic Friendly Caught Sequence Update
   * Progress runs from 0.0 to 1.0. Tuku is scooped into the air, turns toward Lakhey,
   * kicks feet playfully, and camera sweeps around for a celebratory 3/4 hero view.
   */
  public updateCaught(dt: number, progress: number, guardianX: number): void {
    this.caughtProgress = progress;

    // 1. Decelerate forward momentum gently
    this.currentSpeed = Math.max(0, this.currentSpeed - dt * 25.0);
    this.currentZ += this.currentSpeed * dt;
    this.totalDistance += this.currentSpeed * dt;

    // 2. Lateral alignment with guardian
    this.currentX += (guardianX - this.currentX) * Math.min(1.0, dt * 8.0);

    // 3. Vertical Lift (carried aloft into Lakhey's arms!)
    // Phase 1 (0.0 -> 0.35): Lift from GROUND_Y (0.5m) to chest height (1.45m)
    // Phase 2 (0.35 -> 0.75): Hoisted high in celebratory arc (1.58m)
    // Phase 3 (0.75 -> 1.0): Settled securely into Lakhey's carry posture (1.46m)
    if (progress < 0.35) {
      const p1 = progress / 0.35;
      const easeLift = p1 * p1 * (3.0 - 2.0 * p1);
      this.currentY = PlayerController.GROUND_Y + easeLift * 0.95;
    } else if (progress < 0.75) {
      const p2 = (progress - 0.35) / 0.40;
      this.currentY = 1.45 + Math.sin(p2 * Math.PI) * 0.16;
    } else {
      this.currentY = 1.46;
    }

    // 4. Yaw Turn: Tuku spins smoothly ~135° to face Lakhey & camera during scoop
    const spinProgress = Math.min(1.0, progress / 0.35);
    const easeSpin = spinProgress * spinProgress * (3.0 - 2.0 * spinProgress);
    const currentYaw = 135.0 * easeSpin;
    this.entity.setEulerAngles(0, currentYaw, 0);
    this.entity.setPosition(this.currentX, this.currentY, this.currentZ);

    // 5. Ground shadow scales down as Tuku is lifted into the air
    const shadowScale = Math.max(0.35, 0.8 - (this.currentY - PlayerController.GROUND_Y) * 0.4);
    this.shadowEntity.setPosition(this.currentX, 0.01, this.currentZ);
    this.shadowEntity.setLocalScale(shadowScale, 1, shadowScale);

    // 6. Expressive Joint Articulation on Tuku's Procedural 3D Rig
    if (this.modelRoot) {
      // Head: Looks up playfully towards Lakhey's mask with a grin/nod
      this.headNode?.setLocalEulerAngles(-18.0, 0, 0);

      // Arms: Raised in playful surrender / celebration ("You got me!")
      this.leftArmNode?.setLocalEulerAngles(-52.0, 0, -32.0);
      this.leftElbowNode?.setLocalEulerAngles(55.0, 0, 0);

      this.rightArmNode?.setLocalEulerAngles(-52.0, 0, 32.0);
      this.rightElbowNode?.setLocalEulerAngles(55.0, 0, 0);

      // Legs: Dangle in mid-air and kick playfully with alternating rhythm (knees flexed backwards)
      const legKick = Math.sin(progress * 14.0) * 16.0;
      this.leftLegNode?.setLocalEulerAngles(22.0 + legKick, 0, 4);
      this.rightLegNode?.setLocalEulerAngles(22.0 - legKick, 0, -4);
      this.leftKneeNode?.setLocalEulerAngles(-(48.0 + Math.abs(legKick)), 0, 0);
      this.rightKneeNode?.setLocalEulerAngles(-(48.0 + Math.abs(-legKick)), 0, 0);

      // Satchel & scarf tail react to upward lift
      this.satchelNode?.setLocalEulerAngles(14.0, -10.0, 0);
      this.scarfTailNode?.setLocalEulerAngles(18.0 + Math.sin(progress * 8.0) * 8.0, 0, 0);
      this.torsoNode?.setLocalEulerAngles(-8.0, 0, 0);
    }

    // 7. Dynamic Cinematic Hero Camera Sweep
    // Sweeps from behind-back chase position around to front/side 3/4 low angle:
    const camP = Math.min(1.0, progress / 0.82);
    const camS = camP * camP * (3.0 - 2.0 * camP); // Smoothstep

    const startCamX = this.currentX * 0.35;
    const endCamX = this.currentX + 3.1;
    const camX = startCamX + (endCamX - startCamX) * camS;

    const startCamY = 4.2;
    const endCamY = 2.2;
    const camY = startCamY + (endCamY - startCamY) * camS;

    const startCamZ = this.currentZ + 6.6;
    const endCamZ = this.currentZ - 4.2;
    const camZ = startCamZ + (endCamZ - startCamZ) * camS;

    this.cameraEntity.setPosition(camX, camY, camZ);
    this.cameraEntity.lookAt(new Vec3(this.currentX, 1.25, this.currentZ));

    if (this.cameraEntity.camera) {
      this.cameraEntity.camera.fov = 54.0;
    }
  }

  public reset(): void {
    this.currentLane = 0;
    this.targetLane = 0;
    this.currentX = 0.45;
    this.currentY = PlayerController.GROUND_Y;
    this.currentZ = 0;
    this.currentSpeed = PlayerController.BASE_RUN_SPEED;
    this.lateralVelocity = 0;
    this.currentBankAngle = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.isStumbling = false;
    this.isCaughtSequence = false;
    this.caughtProgress = 0;
    this.jumpElapsedTime = 0;
    this.jumpBufferTimer = 0;
    this.slideElapsedTime = 0;
    this.totalDistance = 0;
    this.collisionFlashTimer = 0;
    this.cameraShakeTime = 0;
    this.cameraShakeMagnitude = 0;
    this.bodyMat.diffuse.set(0.184, 0.471, 0.459);
    this.bodyMat.update();

    this.isReadyStandoff = true;
    this.isIntroPanning = false;
    this.introPanTime = 0;
    this.idleTime = 0;
    this.landingCompressionTimer = 0;
    this.isTeasing = false;
    this.teaseTime = 0;
    this.teaseYaw = 160.0;

    this.entity.setPosition(this.currentX, PlayerController.GROUND_Y, 0);
    this.entity.setEulerAngles(0, this.teaseYaw, 0);
    this.shadowEntity.setPosition(this.currentX, 0.01, 0);
    this.shadowEntity.setLocalScale(0.8, 1, 0.8);

    // Expressive festival ready teasing standoff pose: Tuku faces Lakhey and playfully waves
    this.rightArmNode?.setLocalEulerAngles(-78.0, 0, 34.0);
    this.rightElbowNode?.setLocalEulerAngles(-85.0, 0, 0);
    this.leftArmNode?.setLocalEulerAngles(-16.0, 0, -26.0);
    this.leftElbowNode?.setLocalEulerAngles(-72.0, 0, 0);
    this.torsoNode?.setLocalEulerAngles(0, 0, -4.0);
    this.headNode?.setLocalEulerAngles(-4.0, -12.0, 8.0);
    this.leftLegNode?.setLocalEulerAngles(12.0, -4.0, 6.0);
    this.leftKneeNode?.setLocalEulerAngles(-18.0, 0, 0);
    this.rightLegNode?.setLocalEulerAngles(-8.0, 4.0, -6.0);
    this.rightKneeNode?.setLocalEulerAngles(-22.0, 0, 0);
    this.satchelNode?.setLocalEulerAngles(6.0, -10.0, 0);
    this.scarfTailNode?.setLocalEulerAngles(-14.0, 0, 0);

    this.cameraEntity.setPosition(1.25, 2.05, -2.75);
    this.cameraEntity.lookAt(new Vec3(0, 1.45, 3.4));
    if (this.cameraEntity.camera) this.cameraEntity.camera.fov = 54.0;
  }

  public getTelemetry(): PlayerTelemetry {
    const t = this.cachedTelemetry;
    t.lane = this.currentLane;
    t.targetLane = this.targetLane;
    t.x = this.currentX;
    t.y = this.currentY;
    t.z = this.currentZ;
    t.isJumping = this.isJumping;
    t.isSliding = this.isSliding;
    t.isTeasing = this.isTeasing;
    t.jumpVariant = this.jumpVariant;
    t.slideVariant = this.slideVariant;
    t.dodgeVariant = this.dodgeVariant;
    t.distance = this.totalDistance;
    const b = this.getBounds();
    t.bounds = b;
    return t;
  }

  public getX(): number {
    return this.currentX;
  }

  public getY(): number {
    return this.currentY;
  }

  public getZ(): number {
    return this.currentZ;
  }

  public teleportZ(z: number): void {
    this.currentZ = z;
    this.totalDistance = Math.max(0, -z);
    this.isIntroPanning = false;
    this.isReadyStandoff = false;
    this.entity.setPosition(this.currentX, this.currentY, this.currentZ);
    this.cameraEntity.setPosition(this.currentX * 0.45, 2.75, this.currentZ + 6.6);
  }
}
