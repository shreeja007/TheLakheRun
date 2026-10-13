import {
  Application,
  Color,
  Entity,
  StandardMaterial,
  Vec3,
} from 'playcanvas';
import { LaneIndex, PlayerTelemetry, BoundingBox3D } from '../types';
import { RoadView } from '../world/RoadView';

export class PlayerController {
  public static readonly GROUND_Y = 0.5; // Base center Y for 1.0m tall runner
  public static readonly JUMP_HEIGHT = 1.6;
  public static readonly JUMP_DURATION = 0.65; // Seconds
  public static readonly BASE_RUN_SPEED = 10.5; // Units/second base forward speed
  public static readonly LANE_SWITCH_SPEED = 18.0; // Units/second lateral transition
  public static readonly INTRO_PAN_DURATION = 1.35; // Cinematic opening swoop duration in seconds
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

  private currentLane: LaneIndex = 0;
  private targetLane: LaneIndex = 0;
  private currentX = 0;
  private currentY = PlayerController.GROUND_Y;
  private currentZ = 0;
  private currentSpeed = PlayerController.BASE_RUN_SPEED;

  // Natural Lateral Kinetics & Skater Banking
  private lateralVelocity = 0;
  private currentBankAngle = 0;

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
  private onDodgeCb?: (dir: number) => void;
  private onSlideCb?: (x: number, y: number, z: number) => void;

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
    this.shadowEntity.setPosition(0, 0.01, 0);
    if (this.shadowEntity.render) this.shadowEntity.render.material = shadowMat;
    app.root.addChild(this.shadowEntity);

    // Initialize camera into 3/4 front cinematic standoff framing
    this.cameraEntity.setPosition(2.2, 1.7, -3.2);
    this.cameraEntity.lookAt(new Vec3(0, 1.25, 1.8));
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

  public moveLeft(): boolean {
    if (this.targetLane > -1) {
      this.targetLane = (this.targetLane - 1) as LaneIndex;
      if (this.onDodgeCb) this.onDodgeCb(-1);
      return true;
    }
    return false;
  }

  public moveRight(): boolean {
    if (this.targetLane < 1) {
      this.targetLane = (this.targetLane + 1) as LaneIndex;
      if (this.onDodgeCb) this.onDodgeCb(1);
      return true;
    }
    return false;
  }

  public onSlide(cb: (x: number, y: number, z: number) => void): void {
    this.onSlideCb = cb;
  }

  public jump(): boolean {
    if (this.isSliding) {
      // Slide-cancel into jump immediately
      this.isSliding = false;
      this.slideElapsedTime = 0;
    }

    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpElapsedTime = 0;
      this.jumpBufferTimer = 0;
      return true;
    } else {
      // Buffer jump if tapped within landing window
      this.jumpBufferTimer = 0.16;
      return false;
    }
  }

  public slide(): boolean {
    if (this.isSliding) return false;

    // If mid-air, dive straight into a ground slide
    if (this.isJumping) {
      this.isJumping = false;
      this.jumpElapsedTime = 0;
      this.currentY = PlayerController.GROUND_Y;
    }

    this.isSliding = true;
    this.slideElapsedTime = 0;
    if (this.onSlideCb) this.onSlideCb(this.currentX, 0.05, this.currentZ);
    return true;
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
    if (this.isIntroPanning) {
      this.introPanTime += dt;
      const panProgress = Math.min(1.0, this.introPanTime / PlayerController.INTRO_PAN_DURATION);
      // Smoothstep acceleration curve
      speedFactor = panProgress * panProgress * (3.0 - 2.0 * panProgress);
      if (panProgress >= 1.0) {
        this.isIntroPanning = false;
      }
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
        // Smooth slide entry and push-off recovery
        const slideProg = Math.min(1.0, this.slideElapsedTime / PlayerController.SLIDE_DURATION);
        const slideDrop = slideProg > 0.8 ? -0.16 * (1.0 - (slideProg - 0.8) / 0.2) : -0.16;
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
        this.currentY = PlayerController.GROUND_Y + strideBob - landingSquash;

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
        this.leftKneeNode?.setLocalEulerAngles(28, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles(15, 0, 0);
        this.leftArmNode?.setLocalEulerAngles(-32, 0, -38);
        this.rightArmNode?.setLocalEulerAngles(-32, 0, 38);
        this.leftElbowNode?.setLocalEulerAngles(-40, 0, 0);
        this.rightElbowNode?.setLocalEulerAngles(-40, 0, 0);
        this.satchelNode?.setLocalEulerAngles(28.0, -18, 0);
        this.scarfTailNode?.setLocalEulerAngles(-45.0, 15, 0);
        this.headNode?.setLocalEulerAngles(-12.0, 0, 0);
        this.torsoNode?.setLocalEulerAngles(-16.0, 0, 0);
      } else if (this.isJumping) {
        // Multi-phase parkour vault articulation:
        // Phase 1 (0.0 to 0.35): explosive liftoff drive
        // Phase 2 (0.35 to 0.72): buoyant apex tuck & hangtime
        // Phase 3 (0.72 to 1.0): landing preparation & extension
        const jumpProgress = Math.min(1.0, this.jumpElapsedTime / PlayerController.JUMP_DURATION);
        const tuckCurve = Math.sin(jumpProgress * Math.PI);
        const airBankZ = -(this.lateralVelocity / 16.0) * 12.0;

        if (jumpProgress < 0.35) {
          // Liftoff phase: lead knee driving up, push-off trailing leg, arms driving skyward
          const p = jumpProgress / 0.35;
          this.leftLegNode?.setLocalEulerAngles(-15.0 + p * 35.0, 0, 4 + airBankZ);
          this.rightLegNode?.setLocalEulerAngles(25.0 - p * 45.0, 0, -4 + airBankZ);
          this.leftKneeNode?.setLocalEulerAngles(20.0 + p * 60.0, 0, 0);
          this.rightKneeNode?.setLocalEulerAngles(40.0 + p * 30.0, 0, 0);

          // Arms drive up for lift
          this.leftArmNode?.setLocalEulerAngles(-25.0 + p * 60.0, 0, -22.0);
          this.rightArmNode?.setLocalEulerAngles(30.0 - p * 30.0, 0, 22.0);
          this.leftElbowNode?.setLocalEulerAngles(-70.0 + p * 25.0, 0, 0);
          this.rightElbowNode?.setLocalEulerAngles(-50.0 + p * 15.0, 0, 0);

          this.torsoNode?.setLocalEulerAngles(8.0 - p * 4.0, cutYaw, airBankZ);
          this.headNode?.setLocalEulerAngles(-5.0, 0, 0);
        } else if (jumpProgress < 0.75) {
          // Apex hurdle vault: high tuck, balanced arms, satchel floating
          const apexTuck = Math.sin(((jumpProgress - 0.35) / 0.40) * Math.PI);
          this.leftLegNode?.setLocalEulerAngles(22.0 + apexTuck * 10.0, 0, 4 + airBankZ);
          this.rightLegNode?.setLocalEulerAngles(-22.0 - apexTuck * 10.0, 0, -4 + airBankZ);
          this.leftKneeNode?.setLocalEulerAngles(75.0 + apexTuck * 15.0, 0, 0);
          this.rightKneeNode?.setLocalEulerAngles(85.0 + apexTuck * 10.0, 0, 0);

          // Arms spread wide for aerodynamic balance
          this.leftArmNode?.setLocalEulerAngles(32.0, 0, -32.0);
          this.rightArmNode?.setLocalEulerAngles(32.0, 0, 32.0);
          this.leftElbowNode?.setLocalEulerAngles(-35.0, 0, 0);
          this.rightElbowNode?.setLocalEulerAngles(-35.0, 0, 0);

          this.torsoNode?.setLocalEulerAngles(12.0, cutYaw, airBankZ);
          this.headNode?.setLocalEulerAngles(-4.0, 0, 0);
        } else {
          // Descent & touchdown prep: legs uncoil towards stone pavement
          const p = (jumpProgress - 0.75) / 0.25;
          this.leftLegNode?.setLocalEulerAngles(22.0 * (1.0 - p), 0, 4 + airBankZ);
          this.rightLegNode?.setLocalEulerAngles(-20.0 * (1.0 - p), 0, -4 + airBankZ);
          this.leftKneeNode?.setLocalEulerAngles(85.0 * (1.0 - p) + 15.0, 0, 0);
          this.rightKneeNode?.setLocalEulerAngles(90.0 * (1.0 - p) + 15.0, 0, 0);

          this.leftArmNode?.setLocalEulerAngles(32.0 * (1.0 - p) - 10.0 * p, 0, -22.0);
          this.rightArmNode?.setLocalEulerAngles(32.0 * (1.0 - p) + 10.0 * p, 0, 22.0);
          this.leftElbowNode?.setLocalEulerAngles(-35.0 - p * 20.0, 0, 0);
          this.rightElbowNode?.setLocalEulerAngles(-35.0 - p * 20.0, 0, 0);

          this.torsoNode?.setLocalEulerAngles(12.0 * (1.0 - p), cutYaw, airBankZ);
          this.headNode?.setLocalEulerAngles(0, 0, 0);
        }

        // Satchel weightlessness float & scarf updraft
        this.satchelNode?.setLocalEulerAngles(tuckCurve * 24.0, -8, 0);
        this.scarfTailNode?.setLocalEulerAngles(-18.0 - tuckCurve * 26.0, 0, 0);
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
        // Full athletic low baseball slide pose on flagstone pavement with push-off recovery
        const slideProg = Math.min(1.0, this.slideElapsedTime / PlayerController.SLIDE_DURATION);
        const tuckAngle = Math.sin(slideProg * Math.PI) * 16.0;

        let slidePitch = -68.0;
        let legExtend = 1.0;
        if (slideProg > 0.80) {
          const recov = (slideProg - 0.80) / 0.20;
          slidePitch = -68.0 * (1.0 - recov);
          legExtend = 1.0 - recov;
        }

        // Torso pitches forward aggressively into slide
        this.torsoNode?.setLocalEulerAngles(slidePitch, cutYaw * 0.5, bankAngle * 0.5);

        // Lead leg stretched straight out along ground
        this.leftLegNode?.setLocalEulerAngles(80.0 * legExtend, 0, 4);
        this.leftKneeNode?.setLocalEulerAngles(12.0, 0, 0);

        // Trailing leg folded tightly beneath hip
        this.rightLegNode?.setLocalEulerAngles(-40.0 * legExtend, 0, -6);
        this.rightKneeNode?.setLocalEulerAngles(92.0 * legExtend, 0, 0);

        // Arms brace for low friction glide
        this.leftArmNode?.setLocalEulerAngles(-48.0 * legExtend, 0, -32.0);
        this.leftElbowNode?.setLocalEulerAngles(-22.0, 0, 0);
        this.rightArmNode?.setLocalEulerAngles(35.0 * legExtend, 0, 26.0);
        this.rightElbowNode?.setLocalEulerAngles(-38.0, 0, 0);

        // Head raised looking forward under low obstacle beams
        this.headNode?.setLocalEulerAngles(52.0 * legExtend, 0, 0);
        this.satchelNode?.setLocalEulerAngles(22.0, -12, 0);
        this.scarfTailNode?.setLocalEulerAngles(-52.0 + tuckAngle, 0, 0);
      } else if (isRunning) {
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
        // When leg swings back (legSwing < 0), heel kicks up towards hip (flex up to 82°)
        // When swinging forward, knee drives high (flex 35°), then extends for footstrike
        const leftKneeFlex = legSwing < 0 ? Math.pow(Math.abs(legSwing) / 34.0, 1.2) * 82.0 : Math.sin(Math.max(0, legSwing) / 34.0 * Math.PI) * 38.0;
        const rightKneeFlex = legSwing > 0 ? Math.pow(Math.abs(legSwing) / 34.0, 1.2) * 82.0 : Math.sin(Math.max(0, -legSwing) / 34.0 * Math.PI) * 38.0;

        // Landing impact compression
        const compFlex = this.landingCompressionTimer > 0 ? (this.landingCompressionTimer / 0.14) * 28.0 : 0;

        // Lateral dodge skater weight shift on knees
        const dodgeKneeLeft = this.lateralVelocity < -1.0 ? 14.0 : 0;
        const dodgeKneeRight = this.lateralVelocity > 1.0 ? 14.0 : 0;
        this.leftKneeNode?.setLocalEulerAngles(leftKneeFlex + compFlex + dodgeKneeLeft, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles(rightKneeFlex + compFlex + dodgeKneeRight, 0, 0);

        // Athletic sprint bent-elbow arm drive:
        // Elbow angle flexes to ~85° on forward punch, opens to ~55° on backswing
        const leftElbowBend = -70.0 + Math.sin(strideAngle) * 22.0;
        const rightElbowBend = -70.0 - Math.sin(strideAngle) * 22.0;
        this.leftArmNode?.setLocalEulerAngles(armSwing, 0, -18.0);
        this.rightArmNode?.setLocalEulerAngles(-armSwing, 0, 18.0);
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
        // Expressive festival ready standoff pose: Tuku looks back over shoulder at Lakhey
        this.idleTime += dt;
        const breath = Math.sin(this.idleTime * 2.2) * 2.0;
        this.torsoNode?.setLocalEulerAngles(0, -18, 0);
        this.headNode?.setLocalEulerAngles(-4, -36 + Math.sin(this.idleTime * 1.6) * 4.0, 0);
        this.leftArmNode?.setLocalEulerAngles(-18 + breath, 0, -14);
        this.leftElbowNode?.setLocalEulerAngles(-35.0, 0, 0);
        this.rightArmNode?.setLocalEulerAngles(14 - breath, 0, 16);
        this.rightElbowNode?.setLocalEulerAngles(-20.0, 0, 0);
        this.leftLegNode?.setLocalEulerAngles(12, 0, 4);
        this.leftKneeNode?.setLocalEulerAngles(10, 0, 0);
        this.rightLegNode?.setLocalEulerAngles(-8, 0, -4);
        this.rightKneeNode?.setLocalEulerAngles(16, 0, 0);
        this.satchelNode?.setLocalEulerAngles(4, -8, 0);
        this.scarfTailNode?.setLocalEulerAngles(-10 + Math.sin(this.idleTime * 1.8) * 8.0, 0, 0);
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

    // Apply transform to player mesh (with dynamic forward sprint lean & sharp skater bank)
    const leanProgress = this.isIntroPanning ? Math.min(1.0, this.introPanTime / PlayerController.INTRO_PAN_DURATION) : (isRunning ? 1.0 : 0);
    const speedLean = 7.0 + (this.currentSpeed - 10.5) * 0.85; // Athletic 7° to 15° forward lean
    const forwardLean = isRunning && !this.isJumping && !this.isSliding && !this.isStumbling ? speedLean * leanProgress : (this.isStumbling ? -10.0 : 0);
    this.entity.setPosition(this.currentX, this.currentY, this.currentZ);
    this.entity.setEulerAngles(forwardLean, cutYaw * 0.4, bankAngle);

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
      // Cinematic 3/4 standoff tableau framing runner and guardian together in ancient street
      this.cameraEntity.setPosition(2.2, 1.7, this.currentZ - 3.2);
      this.cameraEntity.lookAt(new Vec3(0, 1.25, this.currentZ + 1.8));
      if (this.cameraEntity.camera) {
        this.cameraEntity.camera.fov = 54.0;
      }
    } else if (this.isIntroPanning) {
      // Subway Surfers / Temple Run dynamic camera sweep arc from front 3/4 to behind-back chase
      const panProgress = Math.min(1.0, this.introPanTime / PlayerController.INTRO_PAN_DURATION);
      const s = panProgress * panProgress * (3.0 - 2.0 * panProgress);

      const arcBulgeX = Math.sin(s * Math.PI) * 0.85;
      const arcBulgeY = Math.sin(s * Math.PI) * 0.35;

      const startCamX = 2.2;
      const endCamX = this.currentX * 0.35 + shakeOffsetX;
      const camX = (startCamX + (endCamX - startCamX) * s) + arcBulgeX;

      const startCamY = 1.7;
      const endCamY = 4.2 + shakeOffsetY;
      const camY = (startCamY + (endCamY - startCamY) * s) + arcBulgeY;

      const startCamRelZ = -3.2;
      const endCamRelZ = 6.6;
      const camZ = this.currentZ + (startCamRelZ + (endCamRelZ - startCamRelZ) * s);

      this.cameraEntity.setPosition(camX, camY, camZ);

      const startLookX = 0.0;
      const endLookX = this.currentX * 0.2;
      const lookX = startLookX + (endLookX - startLookX) * s;

      const startLookY = 1.25;
      const endLookY = 0.8;
      const lookY = startLookY + (endLookY - startLookY) * s;

      const startLookRelZ = 1.8;
      const endLookRelZ = -4.5;
      const lookZ = this.currentZ + (startLookRelZ + (endLookRelZ - startLookRelZ) * s);

      this.cameraEntity.lookAt(new Vec3(lookX, lookY, lookZ));

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

  public onDodge(cb: (dir: number) => void): void {
    this.onDodgeCb = cb;
  }

  public flashCollision(): void {
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
      this.leftElbowNode?.setLocalEulerAngles(-55.0, 0, 0);

      this.rightArmNode?.setLocalEulerAngles(-52.0, 0, 32.0);
      this.rightElbowNode?.setLocalEulerAngles(-55.0, 0, 0);

      // Legs: Dangle in mid-air and kick playfully with alternating rhythm
      const legKick = Math.sin(progress * 14.0) * 16.0;
      this.leftLegNode?.setLocalEulerAngles(22.0 + legKick, 0, 4);
      this.rightLegNode?.setLocalEulerAngles(22.0 - legKick, 0, -4);
      this.leftKneeNode?.setLocalEulerAngles(48.0 + Math.abs(legKick), 0, 0);
      this.rightKneeNode?.setLocalEulerAngles(48.0 + Math.abs(-legKick), 0, 0);

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
    this.currentX = 0;
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

    this.entity.setPosition(0, PlayerController.GROUND_Y, 0);
    this.entity.setEulerAngles(0, 0, 0);
    this.shadowEntity.setPosition(0, 0.01, 0);
    this.shadowEntity.setLocalScale(0.8, 1, 0.8);

    // Expressive ready standoff pose: Tuku glances back over shoulder towards Lakhey
    this.torsoNode?.setLocalEulerAngles(0, -18, 0);
    this.headNode?.setLocalEulerAngles(-4, -36, 0);
    this.leftArmNode?.setLocalEulerAngles(-18, 0, -14);
    this.leftElbowNode?.setLocalEulerAngles(-35.0, 0, 0);
    this.rightArmNode?.setLocalEulerAngles(14, 0, 16);
    this.rightElbowNode?.setLocalEulerAngles(-20.0, 0, 0);
    this.leftLegNode?.setLocalEulerAngles(12, 0, 4);
    this.leftKneeNode?.setLocalEulerAngles(10, 0, 0);
    this.rightLegNode?.setLocalEulerAngles(-8, 0, -4);
    this.rightKneeNode?.setLocalEulerAngles(16, 0, 0);
    this.satchelNode?.setLocalEulerAngles(4, -8, 0);
    this.scarfTailNode?.setLocalEulerAngles(-10, 0, 0);

    this.cameraEntity.setPosition(2.2, 1.7, -3.2);
    this.cameraEntity.lookAt(new Vec3(0, 1.25, 1.8));
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
