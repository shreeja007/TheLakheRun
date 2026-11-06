import {
  Application,
  Color,
  Entity,
  StandardMaterial,
} from 'playcanvas';
import { GuardianState } from '../types';
import { batchArticulatedModel } from '../game/Batching';

export class GuardianController {
  public static readonly DEFAULT_FOLLOW_DISTANCE = 4.2; // Meters behind runner
  public static readonly CATCH_DISTANCE = 1.2; // Final distance on nonviolent catch
  public static readonly LATERAL_LAG_SPEED = 5.5; // Majestic follower lag speed

  private entity: Entity;
  private shadowEntity: Entity;
  private leftArmEntity: Entity;
  private rightArmEntity: Entity;
  private eyeMat: StandardMaterial;

  private modelRoot?: Entity;
  private leftArmNode?: Entity;
  private rightArmNode?: Entity;
  private leftElbowNode?: Entity;
  private rightElbowNode?: Entity;
  private leftLegNode?: Entity;
  private rightLegNode?: Entity;
  private leftKneeNode?: Entity;
  private rightKneeNode?: Entity;
  private chamaraNode?: Entity;
  private maneNode?: Entity;
  private torsoNode?: Entity;
  private headNode?: Entity;

  private currentX = 0;
  private currentY = 0.9;
  private currentZ = 4.2;
  private followDistance = GuardianController.DEFAULT_FOLLOW_DISTANCE;
  private targetFollowDistance = GuardianController.DEFAULT_FOLLOW_DISTANCE;

  private state: GuardianState = 'TRACKING';
  private runCycleTime = 0;
  private idleTime = 0;
  private catchAnimProgress = 0;
  private lastSurgePhase = 0;
  private introStompTriggered = false;
  private onStompCb?: (volume: number, x: number, z: number) => void;

  public onStomp(cb: (volume: number, x: number, z: number) => void): void {
    this.onStompCb = cb;
  }

  public surgeCloser(targetDist = 2.2): void {
    if (this.state !== 'TRACKING') return;
    this.targetFollowDistance = Math.max(1.9, Math.min(this.targetFollowDistance, targetDist));
  }

  /** True once Lakhey has drifted back to (or beyond) his normal follow distance. */
  public hasRecoveredFollowDistance(): boolean {
    return this.state !== 'TRACKING' ||
      this.targetFollowDistance >= GuardianController.DEFAULT_FOLLOW_DISTANCE - 0.05;
  }

  public pushBack(amount = 0.8): void {
    if (this.state !== 'TRACKING') return;
    this.targetFollowDistance = Math.min(4.8, this.targetFollowDistance + amount);
  }

  constructor(app: Application) {
    // Root Guardian entity
    this.entity = new Entity('GuardianFollower');
    this.entity.setPosition(0, 0.9, 4.2);

    // 1. Torso / Robe (Festive Ceremonial Crimson #B91C1C)
    const robeMat = new StandardMaterial();
    robeMat.diffuse = new Color(0.725, 0.11, 0.11);
    robeMat.useMetalness = true;
    robeMat.metalness = 0.1;
    robeMat.gloss = 0.45;
    robeMat.update();

    const torso = new Entity('Torso');
    torso.addComponent('render', { type: 'box' });
    torso.setLocalScale(1.1, 1.4, 0.7);
    torso.setLocalPosition(0, 0, 0);
    if (torso.render) torso.render.material = robeMat;
    this.entity.addChild(torso);

    // 2. Mane / Shroud (Charcoal Slate #1F2429)
    const maneMat = new StandardMaterial();
    maneMat.diffuse = new Color(0.12, 0.14, 0.16);
    maneMat.gloss = 0.2;
    maneMat.update();

    const mane = new Entity('Mane');
    mane.addComponent('render', { type: 'box' });
    mane.setLocalScale(1.3, 0.9, 0.85);
    mane.setLocalPosition(0, 0.55, 0.05);
    if (mane.render) mane.render.material = maneMat;
    this.entity.addChild(mane);

    // 3. Golden Mask / Crest Placeholder (#DEA94B)
    const maskMat = new StandardMaterial();
    maskMat.diffuse = new Color(0.87, 0.66, 0.29);
    maskMat.useMetalness = true;
    maskMat.metalness = 0.3;
    maskMat.gloss = 0.65;
    maskMat.update();

    const mask = new Entity('MaskPlaceholder');
    mask.addComponent('render', { type: 'box' });
    mask.setLocalScale(0.65, 0.55, 0.3);
    mask.setLocalPosition(0, 0.5, -0.42);
    if (mask.render) mask.render.material = maskMat;
    this.entity.addChild(mask);

    // 4. Gold Sash & Belt Trim (#F59E0B)
    const trimMat = new StandardMaterial();
    trimMat.diffuse = new Color(0.96, 0.62, 0.04);
    trimMat.gloss = 0.5;
    trimMat.update();

    const belt = new Entity('BeltTrim');
    belt.addComponent('render', { type: 'box' });
    belt.setLocalScale(1.15, 0.16, 0.75);
    belt.setLocalPosition(0, -0.15, 0);
    if (belt.render) belt.render.material = trimMat;
    this.entity.addChild(belt);

    // 5. Guardian Arms (for walking stride & friendly nonviolent catch gesture)
    this.leftArmEntity = new Entity('LeftArm');
    this.leftArmEntity.addComponent('render', { type: 'box' });
    this.leftArmEntity.setLocalScale(0.25, 0.8, 0.3);
    this.leftArmEntity.setLocalPosition(-0.68, 0.05, 0);
    if (this.leftArmEntity.render) this.leftArmEntity.render.material = robeMat;
    this.entity.addChild(this.leftArmEntity);

    this.rightArmEntity = new Entity('RightArm');
    this.rightArmEntity.addComponent('render', { type: 'box' });
    this.rightArmEntity.setLocalScale(0.25, 0.8, 0.3);
    this.rightArmEntity.setLocalPosition(0.68, 0.05, 0);
    if (this.rightArmEntity.render) this.rightArmEntity.render.material = robeMat;
    this.entity.addChild(this.rightArmEntity);

    // 6. Fierce Glowing Eyes (Dramatic Festival Mask Presence)
    this.eyeMat = new StandardMaterial();
    this.eyeMat.diffuse = new Color(1.0, 0.2, 0.05); // Burning Crimson Amber
    this.eyeMat.emissive = new Color(1.0, 0.25, 0.02);
    this.eyeMat.gloss = 0.9;
    this.eyeMat.update();

    const leftEye = new Entity('LeftEye');
    leftEye.addComponent('render', { type: 'box' });
    leftEye.setLocalScale(0.12, 0.08, 0.08);
    leftEye.setLocalPosition(-0.16, 0.54, -0.58);
    if (leftEye.render) leftEye.render.material = this.eyeMat;
    this.entity.addChild(leftEye);

    const rightEye = new Entity('RightEye');
    rightEye.addComponent('render', { type: 'box' });
    rightEye.setLocalScale(0.12, 0.08, 0.08);
    rightEye.setLocalPosition(0.16, 0.54, -0.58);
    if (rightEye.render) rightEye.render.material = this.eyeMat;
    this.entity.addChild(rightEye);

    // 7. Load Lakhey Articulated 3D Model (v0.2 preferred, with v01 fallback)
    const glbUrl = '/models/lakhey_blockout_v02.glb';
    app.assets.loadFromUrl(glbUrl, 'container', (err, asset) => {
      const targetAsset = (!err && asset && asset.resource) ? asset : null;
      if (targetAsset) {
        this.initModelEntity(app, targetAsset, torso, mane, mask, belt, leftEye, rightEye);
      } else {
        // Fallback to v01 if v02 fails (network only: v01 is not in the offline snapshot)
        app.assets.loadFromUrl('/models/lakhey_blockout_v01.glb', 'container', (fallbackErr, fallbackAsset) => {
          if (!fallbackErr && fallbackAsset && fallbackAsset.resource) {
            this.initModelEntity(app, fallbackAsset, torso, mane, mask, belt, leftEye, rightEye);
          }
        });
      }
    });

    app.root.addChild(this.entity);

    // 8. Ground Projection Shadow (always grounded at Y = 0.01)
    const shadowMat = new StandardMaterial();
    shadowMat.diffuse = new Color(0.04, 0.04, 0.06);
    shadowMat.opacity = 0.6;
    shadowMat.blendType = 2; // pc.BLEND_NORMAL
    shadowMat.update();

    this.shadowEntity = new Entity('GuardianShadow');
    this.shadowEntity.addComponent('render', { type: 'plane' });
    this.shadowEntity.setLocalScale(1.8, 1, 1.8);
    this.shadowEntity.setPosition(0, 0.01, 4.2);
    if (this.shadowEntity.render) this.shadowEntity.render.material = shadowMat;
    app.root.addChild(this.shadowEntity);
  }

  private initModelEntity(
    app: Application,
    asset: any,
    torso: Entity,
    mane: Entity,
    mask: Entity,
    belt: Entity,
    leftEye: Entity,
    rightEye: Entity
  ): void {
    const modelEntity = asset.resource.instantiateRenderEntity();
    if (!modelEntity) return;

    modelEntity.name = 'Lakhey_3D_Articulated';
    // Ground feet at world Y = 0 (offset from entity origin at Y = 0.9)
    modelEntity.setLocalPosition(0, -0.9, 0);
    this.entity.addChild(modelEntity);
    this.modelRoot = modelEntity;

    // Wire articulated joint hierarchy
    this.leftArmNode = modelEntity.findByName('LeftArmRoot') as Entity;
    this.rightArmNode = modelEntity.findByName('RightArmRoot') as Entity;
    this.leftElbowNode = modelEntity.findByName('LeftElbowRoot') as Entity;
    this.rightElbowNode = modelEntity.findByName('RightElbowRoot') as Entity;
    this.leftLegNode = modelEntity.findByName('LeftLegRoot') as Entity;
    this.rightLegNode = modelEntity.findByName('RightLegRoot') as Entity;
    this.leftKneeNode = modelEntity.findByName('LeftKneeRoot') as Entity;
    this.rightKneeNode = modelEntity.findByName('RightKneeRoot') as Entity;
    this.chamaraNode = modelEntity.findByName('ChamaraRoot') as Entity;
    this.maneNode = modelEntity.findByName('ManeRoot') as Entity;
    this.torsoNode = modelEntity.findByName('TorsoRoot') as Entity;
    this.headNode = modelEntity.findByName('HeadRoot') as Entity;

    // Seamlessly hide primitive placeholder boxes
    torso.enabled = false;
    mane.enabled = false;
    mask.enabled = false;
    belt.enabled = false;
    this.leftArmEntity.enabled = false;
    this.rightArmEntity.enabled = false;
    leftEye.enabled = false;
    rightEye.enabled = false;

    batchArticulatedModel(app, 'LakheyBatch', modelEntity);
  }

  public triggerCatch(): void {
    this.state = 'CLOSING';
    this.targetFollowDistance = GuardianController.CATCH_DISTANCE;
    this.catchAnimProgress = 0;
  }

  public update(dt: number, playerX: number, playerZ: number, isRunning: boolean): void {
    // 1. Follow distance interpolation
    const distDiff = this.targetFollowDistance - this.followDistance;
    if (Math.abs(distDiff) > 0.02) {
      const closingSpeed = this.state === 'CLOSING' ? 9.5 : 4.0;
      this.followDistance += Math.sign(distDiff) * Math.min(Math.abs(distDiff), closingSpeed * dt);
      if (this.state === 'CLOSING' && this.followDistance <= GuardianController.CATCH_DISTANCE + 0.05) {
        this.state = 'CAUGHT';
      }
    } else {
      this.followDistance = this.targetFollowDistance;
      if (this.state === 'CLOSING') {
        this.state = 'CAUGHT';
      }
    }

    // Proximity tension ratio: 0.0 at far safety (4.5m) to 1.0 at intense danger (2.2m)
    const proximityRatio = Math.max(0, Math.min(1.0, (4.5 - this.followDistance) / 2.3));

    // Dynamic recovery drift back toward standard follow distance during clean running
    if (isRunning && this.state === 'TRACKING' && Math.abs(this.targetFollowDistance - GuardianController.DEFAULT_FOLLOW_DISTANCE) > 0.05) {
      const recoverySpeed = 0.22;
      const driftDir = Math.sign(GuardianController.DEFAULT_FOLLOW_DISTANCE - this.targetFollowDistance);
      this.targetFollowDistance += driftDir * Math.min(Math.abs(GuardianController.DEFAULT_FOLLOW_DISTANCE - this.targetFollowDistance), recoverySpeed * dt);
    }

    // Dynamic glowing eye flare intensity based on guardian proximity
    if (this.eyeMat) {
      const flare = 0.25 + proximityRatio * 1.6;
      this.eyeMat.emissive.set(1.0 * flare, 0.25 * flare * 0.45, 0.02);
      this.eyeMat.update();
    }

    // 2. Lateral follow with majestic inertia
    const dx = playerX - this.currentX;
    if (Math.abs(dx) > 0.01) {
      this.currentX += Math.sign(dx) * Math.min(Math.abs(dx), GuardianController.LATERAL_LAG_SPEED * dt);
    } else {
      this.currentX = playerX;
    }

    // 3. Stride and bobbing animation
    let verticalBob = 0;
    let armSwing = 0;
    let dynamicSurge = 0;

    if (isRunning && this.state === 'TRACKING') {
      // Stride cadence quickens as Lakhey charges closer
      const cadenceSpeed = 10.5 + proximityRatio * 3.2;
      this.runCycleTime += dt * cadenceSpeed;
      verticalBob = Math.abs(Math.sin(this.runCycleTime)) * 0.22; // Heavy majestic stride bob
      armSwing = Math.sin(this.runCycleTime) * 34; // Powerful arm swings

      // Dynamic forward charging surge on heavy drum downbeats (lunges ±0.36m)
      const surgePulse = Math.sin(this.runCycleTime * 2.0);
      dynamicSurge = surgePulse * 0.36;

      // Heavy footstep stomp audio & particle shockwave event on downward plant
      if (surgePulse < -0.85 && this.lastSurgePhase >= -0.85) {
        if (this.onStompCb) {
          const stompVol = Math.max(0.25, (4.5 - this.followDistance) / 3.5);
          this.onStompCb(stompVol, this.currentX, this.currentZ);
        }
      }
      // Provoked reaction stomp right at the start of chase when Tuku leaps
      if (!this.introStompTriggered && this.runCycleTime >= 0.18) {
        this.introStompTriggered = true;
        if (this.onStompCb) {
          this.onStompCb(0.85, this.currentX, this.currentZ);
        }
      }
      this.lastSurgePhase = surgePulse;
    } else if (this.state === 'CLOSING' || this.state === 'CAUGHT') {
      // Nonviolent challenge conclusion: gentle raising of guardian arms
      if (this.catchAnimProgress < 1.0) {
        this.catchAnimProgress = Math.min(1.0, this.catchAnimProgress + dt * 2.5);
      }
      armSwing = -this.catchAnimProgress * 35; // Arms raise gently forward
      verticalBob = (1 - this.catchAnimProgress) * 0.05;
      dynamicSurge = 0;
    }

    this.currentY = 0.9 + verticalBob;
    this.currentZ = playerZ + this.followDistance - dynamicSurge;

    // Apply positions
    this.entity.setPosition(this.currentX, this.currentY, this.currentZ);

    // Apply arm rotations to fallback boxes
    this.leftArmEntity.setEulerAngles(armSwing, 0, 0);
    this.rightArmEntity.setEulerAngles(-armSwing, 0, 0);

    // 4. Procedural Joint Articulation for Lakhey 3D Mesh
    if (this.modelRoot) {
      if (isRunning && this.state === 'TRACKING') {
        const legPhase = this.runCycleTime;
        const reachFactor = Math.max(0, Math.min(1.0, (3.5 - this.followDistance) / 1.6));

        // Forward charge lean pitches forward aggressively when close (5.0° -> 16.5°)
        const pitchX = 5.0 + reachFactor * 11.5;
        // Rhythmic lateral roll into each heavy ground strike (±4.2°)
        const rollZ = Math.sin(legPhase) * 4.2;
        this.modelRoot.setLocalEulerAngles(pitchX, 0, rollZ);

        // A. Heavy festival stride: legs swing from hip with knee recovery flexion
        const legSwing = Math.sin(legPhase) * 28.0;
        this.leftLegNode?.setLocalEulerAngles(legSwing, 0, 0);
        this.rightLegNode?.setLocalEulerAngles(-legSwing, 0, 0);

        // Knee recovery flexion: bend knee backward when swinging forward, lock firm on ground plant
        const leftRecovery = Math.max(0, Math.sin(legPhase));
        const leftKneeAngle = -Math.pow(leftRecovery, 0.8) * 52.0;
        this.leftKneeNode?.setLocalEulerAngles(leftKneeAngle, 0, 0);

        const rightRecovery = Math.max(0, -Math.sin(legPhase));
        const rightKneeAngle = -Math.pow(rightRecovery, 0.8) * 52.0;
        this.rightKneeNode?.setLocalEulerAngles(rightKneeAngle, 0, 0);

        // B. Left Arm: Powerful bent-elbow athletic drive with reach surge
        const leftShoulderPitch = -legSwing * 0.95 + 24.0 + reachFactor * 32.0;
        const leftShoulderRoll = -14.0 + reachFactor * 6.0;
        this.leftArmNode?.setLocalEulerAngles(leftShoulderPitch, 0, leftShoulderRoll);

        const leftElbowAngle = 58.0 + Math.sin(legPhase) * 20.0 + reachFactor * 18.0;
        this.leftElbowNode?.setLocalEulerAngles(leftElbowAngle, 0, 0);

        // C. Right Arm: Holds Chāmara (fly-whisk) aloft in authoritative ceremonial flourish
        const rightShoulderPitch = legSwing * 0.6 + 22.0 + reachFactor * 16.0;
        const rightShoulderRoll = 16.0 - reachFactor * 6.0;
        this.rightArmNode?.setLocalEulerAngles(rightShoulderPitch, 0, rightShoulderRoll);

        const rightElbowAngle = 66.0 + Math.cos(legPhase) * 16.0;
        this.rightElbowNode?.setLocalEulerAngles(rightElbowAngle, 0, 0);

        // Chamara fluid trailing wave arcs
        const chamaraWave = Math.sin(legPhase * 1.1);
        const chamaraSway = Math.cos(legPhase * 1.1);
        this.chamaraNode?.setLocalEulerAngles(-18.0 + chamaraWave * 16.0, chamaraSway * 14.0, chamaraWave * 10.0);

        // D. Cascading mane secondary inertia oscillation
        const maneWobble = Math.sin(legPhase * 1.5 - 0.4) * 8.0;
        this.maneNode?.setLocalEulerAngles(maneWobble, 0, 0);

        // E. Head nod synchronized with drum cadence
        const headNod = 3.0 + Math.sin(legPhase * 2.0) * 4.5 + reachFactor * 4.5;
        this.headNode?.setLocalEulerAngles(headNod, 0, 0);

        // F. Pelvic / torso counter-twist
        const torsoTwist = Math.sin(legPhase) * 4.2;
        this.torsoNode?.setLocalEulerAngles(0, torsoTwist, 0);

      } else if (this.state === 'CLOSING' || this.state === 'CAUGHT') {
        const progress = this.catchAnimProgress;
        this.modelRoot.setLocalEulerAngles(-5.0 * progress, 0, 0);

        // Friendly, nonviolent challenge conclusion: gentle guardian tag
        const catchPitch = progress * 42.0;
        this.leftArmNode?.setLocalEulerAngles(catchPitch, 0, -12);
        this.leftElbowNode?.setLocalEulerAngles(45.0 * progress, 0, 0);

        this.rightArmNode?.setLocalEulerAngles(catchPitch, 0, 12);
        this.rightElbowNode?.setLocalEulerAngles(52.0 * progress, 0, 0);

        // Chamara sweeps across in ceremonial salute
        this.chamaraNode?.setLocalEulerAngles(-35.0 * progress, -20.0 * progress, 0);

        // Legs settle to a stable, dignified standing halt with slight knee absorption
        this.leftLegNode?.setLocalEulerAngles(0, 0, 0);
        this.rightLegNode?.setLocalEulerAngles(0, 0, 0);
        this.leftKneeNode?.setLocalEulerAngles(-12.0 * progress, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles(-12.0 * progress, 0, 0);

        this.maneNode?.setLocalEulerAngles(0, 0, 0);
        this.headNode?.setLocalEulerAngles(4.0 * progress, 0, 0);
        this.torsoNode?.setLocalEulerAngles(0, 0, 0);

      } else {
        this.idleTime += dt;
        // Majestic festival guardian ready pose facing the cheeky runner
        const breath = Math.sin(this.idleTime * 1.8) * 1.8;
        this.modelRoot.setLocalEulerAngles(2.0, 0, breath);

        // Alert guardian pose: Left claw raised in challenge
        const leftArmWave = Math.sin(this.idleTime * 2.4) * 4.0;
        this.leftArmNode?.setLocalEulerAngles(28.0 + leftArmWave, 0, -18.0);
        this.leftElbowNode?.setLocalEulerAngles(54.0, 0, 0);

        // Right arm: Holds Chāmara (yak-tail whisk) aloft, flicking rhythmically in anticipation
        const whiskFlick = Math.sin(this.idleTime * 3.8) * 16.0;
        const whiskTilt = Math.cos(this.idleTime * 2.6) * 10.0;
        this.rightArmNode?.setLocalEulerAngles(32.0 + Math.cos(this.idleTime * 1.8) * 4.0, 0, 20.0);
        this.rightElbowNode?.setLocalEulerAngles(68.0, 0, 0);
        this.chamaraNode?.setLocalEulerAngles(-24.0 + whiskFlick, whiskTilt, 0);

        this.leftLegNode?.setLocalEulerAngles(4.0, 0, -3.0);
        this.rightLegNode?.setLocalEulerAngles(-4.0, 0, 3.0);
        this.leftKneeNode?.setLocalEulerAngles(-8.0, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles(-8.0, 0, 0);

        // Flowing mane and attentive head tilt focused on Tuku's antics
        this.maneNode?.setLocalEulerAngles(Math.sin(this.idleTime * 1.6) * 6.0, 0, 0);
        this.headNode?.setLocalEulerAngles(4.0 + Math.sin(this.idleTime * 2.2) * 2.5, -4.0, 0);
        this.torsoNode?.setLocalEulerAngles(0, 0, 0);
      }
    }

    // Apply ground shadow
    this.shadowEntity.setPosition(this.currentX, 0.01, this.currentZ);
  }

  /**
   * Dramatic Friendly Guardian Scoop & Hoist Choreography
   * Progress runs from 0.0 to 1.0 during the caught cinematic sequence.
   * Lakhey sweeps in right behind Tuku, scoops him aloft with protective arms,
   * performs a celebratory festival turn, and holds him proudly.
   */
  public updateCaught(dt: number, progress: number, playerX: number, playerZ: number): void {
    this.state = 'CAUGHT';
    this.catchAnimProgress = progress;

    // 1. Lateral smooth alignment to player lane
    const dx = playerX - this.currentX;
    this.currentX += dx * Math.min(1.0, dt * 10.0);

    // 2. Proximity: glide right up to Tuku to scoop under him (Z offset 0.38m)
    const targetZ = playerZ + 0.38;
    this.currentZ += (targetZ - this.currentZ) * Math.min(1.0, dt * 8.0);
    this.followDistance = this.currentZ - playerZ;

    // 3. Stature & Height based on sequence phase
    // Phase 1 (0.0 -> 0.35): Reaching/scooping down slightly
    // Phase 2 (0.35 -> 0.75): Hoisting high aloft with proud chest
    // Phase 3 (0.75 -> 1.0): Settle into stable dignified stance
    let verticalLift = 0;
    if (progress < 0.35) {
      const p1 = progress / 0.35;
      verticalLift = -0.06 * Math.sin(p1 * Math.PI); // slight crouch scoop
    } else if (progress < 0.75) {
      const p2 = (progress - 0.35) / 0.40;
      verticalLift = 0.16 * Math.sin(p2 * Math.PI); // majestic lift surge
    } else {
      verticalLift = 0.08;
    }
    this.currentY = 0.95 + verticalLift;

    // Glowing eyes with golden festival flare
    if (this.eyeMat) {
      this.eyeMat.emissive.set(2.2, 1.1, 0.08);
      this.eyeMat.update();
    }

    // 4. Procedural Joint Articulation for Lakhey 3D Mesh
    if (this.modelRoot) {
      if (progress < 0.35) {
        // Phase 1: The Gentle Scoop
        const p1 = progress / 0.35;
        const easeP1 = p1 * p1 * (3.0 - 2.0 * p1);

        // Body pitches forward slightly to reach under runner
        this.modelRoot.setLocalEulerAngles(6.0 * (1.0 - easeP1) - 4.0 * easeP1, 0, 0);

        // Left arm wraps under Tuku's chest
        this.leftArmNode?.setLocalEulerAngles(58.0 * easeP1, 14.0 * easeP1, -10.0);
        this.leftElbowNode?.setLocalEulerAngles(48.0 * easeP1, 0, 0);

        // Right arm scoops under Tuku's legs/waist
        this.rightArmNode?.setLocalEulerAngles(64.0 * easeP1, -14.0 * easeP1, 10.0);
        this.rightElbowNode?.setLocalEulerAngles(54.0 * easeP1, 0, 0);

        this.chamaraNode?.setLocalEulerAngles(-28.0 * easeP1, 0, 0);
        this.leftKneeNode?.setLocalEulerAngles(-18.0 * easeP1, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles(-18.0 * easeP1, 0, 0);
        this.leftLegNode?.setLocalEulerAngles(0, 0, 0);
        this.rightLegNode?.setLocalEulerAngles(0, 0, 0);
        this.maneNode?.setLocalEulerAngles(0, 0, 0);
        this.headNode?.setLocalEulerAngles(6.0 * easeP1, 0, 0);
      } else if (progress < 0.75) {
        // Phase 2: Majestic Hoist & Joyous Festival Twirl
        const p2 = (progress - 0.35) / 0.40;
        const twirlAngle = Math.sin(p2 * Math.PI * 2.0) * 16.0;
        const hoistLift = Math.sin(p2 * Math.PI) * 12.0;

        // Torso rolls into celebratory dance pivot
        this.modelRoot.setLocalEulerAngles(-4.0, twirlAngle, 0);

        // Arms hold Tuku securely hoisted high at chest/shoulder level
        this.leftArmNode?.setLocalEulerAngles(72.0 + hoistLift, 10.0, -8.0);
        this.leftElbowNode?.setLocalEulerAngles(62.0, 0, 0);

        this.rightArmNode?.setLocalEulerAngles(78.0 + hoistLift, -10.0, 8.0);
        this.rightElbowNode?.setLocalEulerAngles(68.0, 0, 0);

        // Chamara (fly-whisk) waves grandly overhead in celebratory salute!
        this.chamaraNode?.setLocalEulerAngles(-52.0 + Math.sin(progress * 16.0) * 18.0, 0, 0);

        // Mane flows with momentum
        this.maneNode?.setLocalEulerAngles(Math.sin(progress * 12.0) * 12.0, 0, 0);
        this.headNode?.setLocalEulerAngles(6.0 + Math.sin(progress * 8.0) * 4.0, 0, 0);

        this.leftKneeNode?.setLocalEulerAngles(-10.0, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles(-10.0, 0, 0);
        this.leftLegNode?.setLocalEulerAngles(0, 0, 0);
        this.rightLegNode?.setLocalEulerAngles(0, 0, 0);
      } else {
        // Phase 3: Grand Festival Guardian Tableau
        this.modelRoot.setLocalEulerAngles(-2.0, 0, 0);

        this.leftArmNode?.setLocalEulerAngles(70.0, 8.0, -8.0);
        this.leftElbowNode?.setLocalEulerAngles(58.0, 0, 0);

        this.rightArmNode?.setLocalEulerAngles(76.0, -8.0, 8.0);
        this.rightElbowNode?.setLocalEulerAngles(64.0, 0, 0);

        this.chamaraNode?.setLocalEulerAngles(-42.0, 0, 0);
        this.maneNode?.setLocalEulerAngles(0, 0, 0);
        this.headNode?.setLocalEulerAngles(4.0, 0, 0);

        this.leftKneeNode?.setLocalEulerAngles(-8.0, 0, 0);
        this.rightKneeNode?.setLocalEulerAngles(-8.0, 0, 0);
        this.leftLegNode?.setLocalEulerAngles(0, 0, 0);
        this.rightLegNode?.setLocalEulerAngles(0, 0, 0);
      }
    }

    // Apply entity position
    this.entity.setPosition(this.currentX, this.currentY, this.currentZ);
    this.shadowEntity.setPosition(this.currentX, 0.01, this.currentZ);

    // Update fallback boxes
    this.leftArmEntity.setEulerAngles(-60, 0, 0);
    this.rightArmEntity.setEulerAngles(-60, 0, 0);
  }

  public reset(playerZ = 0): void {
    this.currentX = 0;
    this.currentY = 0.9;
    this.currentZ = playerZ + 4.2;
    this.followDistance = 4.2;
    this.targetFollowDistance = GuardianController.DEFAULT_FOLLOW_DISTANCE;
    this.state = 'TRACKING';
    this.runCycleTime = 0;
    this.idleTime = 0;
    this.catchAnimProgress = 0;
    this.lastSurgePhase = 0;
    this.introStompTriggered = false;

    this.entity.setPosition(0, 0.9, this.currentZ);
    this.leftArmEntity.setEulerAngles(0, 0, 0);
    this.rightArmEntity.setEulerAngles(0, 0, 0);
    if (this.modelRoot) {
      this.modelRoot.setLocalEulerAngles(2.0, 0, 0);
      this.leftArmNode?.setLocalEulerAngles(-32.0, 0, -22.0);
      this.leftElbowNode?.setLocalEulerAngles(-48.0, 0, 0);
      this.rightArmNode?.setLocalEulerAngles(-36.0, 0, 24.0);
      this.rightElbowNode?.setLocalEulerAngles(-72.0, 0, 0);
      this.chamaraNode?.setLocalEulerAngles(32.0, 0, 0);
      this.leftLegNode?.setLocalEulerAngles(4.0, 0, -3.0);
      this.rightLegNode?.setLocalEulerAngles(-4.0, 0, 3.0);
      this.leftKneeNode?.setLocalEulerAngles(8.0, 0, 0);
      this.rightKneeNode?.setLocalEulerAngles(8.0, 0, 0);
      this.maneNode?.setLocalEulerAngles(0, 0, 0);
      this.headNode?.setLocalEulerAngles(4.0, -4.0, 0);
      this.torsoNode?.setLocalEulerAngles(0, 0, 0);
    }
    this.shadowEntity.setPosition(0, 0.01, this.currentZ);
  }

  public getFollowDistance(): number {
    return this.followDistance;
  }

  public getGuardianState(): GuardianState {
    return this.state;
  }

  public getX(): number {
    return this.currentX;
  }

  public getZ(): number {
    return this.currentZ;
  }
}
