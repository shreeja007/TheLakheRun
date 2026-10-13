import {
  Application,
  Color,
  Entity,
  StandardMaterial,
  Texture,
  Vec2,
} from 'playcanvas';
import { BoundingBox3D, CollisionInfo, LaneIndex, ObstacleType, SkillCalloutType } from '../types';
import { RoadView } from './RoadView';

export interface ActiveObstacle {
  id: number;
  type: ObstacleType;
  lane: LaneIndex;
  z: number;
  entity: Entity;
  guideTrackEntity?: Entity; // Iron pavement runner rail for sliding gate
  bounds: BoundingBox3D;
  hasTriggeredCollision: boolean;
  hasTriggeredSkillCheck: boolean;

  // Dynamic kinematics for rolling matkas & sliding gates
  rollPitch: number;
  rollSpeedZ: number;
  slideX: number;
  slideCenter: number;
  slideSpeed: number;
  slidePhase: number;
  slideAmplitude: number;
  dustTimer: number;

  // Dynamic kinematics for Pulu Kisi (The White Elephant Crossroad Runner)
  puluDirection?: number; // +1: Left-to-Right (-7.5 to +7.5), -1: Right-to-Left (+7.5 to -7.5)
  puluIsDashing?: boolean;
  puluAnimTime?: number;
  puluBellTimer?: number;
  puluStepTimer?: number;
  puluJoints?: {
    bodyNode?: Entity;
    headNode?: Entity;
    trunkNode?: Entity;
    leftEarNode?: Entity;
    rightEarNode?: Entity;
    bellNode?: Entity;
    tailNode?: Entity;
    flLegNode?: Entity;
    frLegNode?: Entity;
    blLegNode?: Entity;
    brLegNode?: Entity;
  };
}

export class ObstacleManager {
  private app: Application;
  private rootEntity: Entity;

  // Pre-allocated object pools
  private lowBarrierPool: ActiveObstacle[] = [];
  private tallBlockPool: ActiveObstacle[] = [];
  private rollingMatkaPool: ActiveObstacle[] = [];
  private slidingGatePool: ActiveObstacle[] = [];
  private overheadBeamPool: ActiveObstacle[] = [];
  private ghatStepsPool: ActiveObstacle[] = [];
  private bridgeRopePool: ActiveObstacle[] = [];
  private prayerFlagGalePool: ActiveObstacle[] = [];
  private puluKisiPool: ActiveObstacle[] = [];
  private activeObstacles: ActiveObstacle[] = [];
  private animTime = 0;

  // Configurable parameters
  public spawnSpacing = 22.0; // Distance in meters between successive hazard rows
  private initialSpawnZ = -28.0; // Starting Z ahead of runner
  private nextSpawnZ = -28.0;

  // Callbacks for dynamic physical SFX and FX
  private onMatkaRollDustCb?: (x: number, y: number, z: number) => void;
  private onMatkaAudioRumbleCb?: (dist: number) => void;
  private onGateAudioSlideCb?: (dist: number) => void;
  private onWaterSplashCb?: (x: number, y: number, z: number) => void;
  private onWindGaleCb?: (x: number, y: number, z: number) => void;
  private onPuluKisiBellCb?: (dist: number) => void;
  private onPuluKisiGallopCb?: (dist: number) => void;

  public onPuluKisiBell(cb: (dist: number) => void): void {
    this.onPuluKisiBellCb = cb;
  }

  public onPuluKisiGallop(cb: (dist: number) => void): void {
    this.onPuluKisiGallopCb = cb;
  }

  public onWaterSplash(cb: (x: number, y: number, z: number) => void): void {
    this.onWaterSplashCb = cb;
  }

  public onWindGale(cb: (x: number, y: number, z: number) => void): void {
    this.onWindGaleCb = cb;
  }

  // Seeded Random State
  private seed = 42;
  private currentPrngState = 42;

  constructor(app: Application) {
    this.app = app;
    this.rootEntity = new Entity('ObstaclesRoot');
    this.app.root.addChild(this.rootEntity);

    this.createPools();
    this.reset(this.seed);
  }

  public onMatkaRollDust(cb: (x: number, y: number, z: number) => void): void {
    this.onMatkaRollDustCb = cb;
  }

  public onMatkaAudioRumble(cb: (dist: number) => void): void {
    this.onMatkaAudioRumbleCb = cb;
  }

  public onGateAudioSlide(cb: (dist: number) => void): void {
    this.onGateAudioSlideCb = cb;
  }

  private createPools(): void {
    // -------------------------------------------------------------------------
    // 1. LOW BARRIER (Warm Amber Timber Hurdle)
    // -------------------------------------------------------------------------
    const lowMat = new StandardMaterial();
    lowMat.diffuse = new Color(0.85, 0.47, 0.05);
    lowMat.gloss = 0.2;
    lowMat.update();

    const legMat = new StandardMaterial();
    legMat.diffuse = new Color(0.35, 0.2, 0.1);
    legMat.gloss = 0.1;
    legMat.update();

    for (let i = 0; i < 8; i++) {
      const e = new Entity(`LowBarrier_${i}`);
      const beam = new Entity('Beam');
      beam.addComponent('render', { type: 'box' });
      beam.setLocalScale(1.6, 0.28, 0.25);
      beam.setLocalPosition(0, 0.31, 0);
      if (beam.render) beam.render.material = lowMat;
      e.addChild(beam);

      const legL = new Entity('LegL');
      legL.addComponent('render', { type: 'box' });
      legL.setLocalScale(0.12, 0.45, 0.35);
      legL.setLocalPosition(-0.7, 0.225, 0);
      if (legL.render) legL.render.material = legMat;
      e.addChild(legL);

      const legR = new Entity('LegR');
      legR.addComponent('render', { type: 'box' });
      legR.setLocalScale(0.12, 0.45, 0.35);
      legR.setLocalPosition(0.7, 0.225, 0);
      if (legR.render) legR.render.material = legMat;
      e.addChild(legR);

      e.enabled = false;
      this.rootEntity.addChild(e);
      this.lowBarrierPool.push({
        id: i,
        type: 'LOW_BARRIER',
        lane: 0,
        z: 0,
        entity: e,
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
        hasTriggeredCollision: false,
        hasTriggeredSkillCheck: false,
        rollPitch: 0,
        rollSpeedZ: 0,
        slideX: 0,
        slideCenter: 0,
        slideSpeed: 0,
        slidePhase: 0,
        slideAmplitude: 0,
        dustTimer: 0,
      });
    }

    // -------------------------------------------------------------------------
    // 2. TALL BLOCK (Crimson Terracotta & Gold Street Shrines)
    // -------------------------------------------------------------------------
    const tallMat = new StandardMaterial();
    tallMat.diffuse = new Color(0.6, 0.11, 0.11);
    tallMat.useMetalness = true;
    tallMat.metalness = 0.1;
    tallMat.gloss = 0.3;
    tallMat.update();

    const trimMat = new StandardMaterial();
    trimMat.diffuse = new Color(0.85, 0.65, 0.25); // Gold trim
    trimMat.gloss = 0.4;
    trimMat.update();

    for (let i = 0; i < 8; i++) {
      const e = new Entity(`TallBlock_${i}`);
      const mainBox = new Entity('MainBox');
      mainBox.addComponent('render', { type: 'box' });
      mainBox.setLocalScale(1.6, 2.2, 0.8);
      mainBox.setLocalPosition(0, 1.1, 0);
      if (mainBox.render) mainBox.render.material = tallMat;
      e.addChild(mainBox);

      const roofTrim = new Entity('RoofTrim');
      roofTrim.addComponent('render', { type: 'box' });
      roofTrim.setLocalScale(1.7, 0.12, 0.9);
      roofTrim.setLocalPosition(0, 2.22, 0);
      if (roofTrim.render) roofTrim.render.material = trimMat;
      e.addChild(roofTrim);

      e.enabled = false;
      this.rootEntity.addChild(e);
      this.tallBlockPool.push({
        id: 100 + i,
        type: 'TALL_BLOCK',
        lane: 0,
        z: 0,
        entity: e,
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
        hasTriggeredCollision: false,
        hasTriggeredSkillCheck: false,
        rollPitch: 0,
        rollSpeedZ: 0,
        slideX: 0,
        slideCenter: 0,
        slideSpeed: 0,
        slidePhase: 0,
        slideAmplitude: 0,
        dustTimer: 0,
      });
    }

    // -------------------------------------------------------------------------
    // 3. ROLLING CLAY MATKA POT (Terracotta Clay Vessel Hazard)
    // -------------------------------------------------------------------------
    const potClayMat = new StandardMaterial();
    potClayMat.diffuse = new Color(0.78, 0.28, 0.08); // Kathmandu terracotta clay
    potClayMat.gloss = 0.35;
    potClayMat.update();

    const potBandMat = new StandardMaterial();
    potBandMat.diffuse = new Color(0.92, 0.82, 0.55); // Cream ritual painted stripe
    potBandMat.gloss = 0.4;
    potBandMat.update();

    const potRimMat = new StandardMaterial();
    potRimMat.diffuse = new Color(0.52, 0.18, 0.05); // Dark glazed ceramic rim
    potRimMat.gloss = 0.45;
    potRimMat.update();

    for (let i = 0; i < 8; i++) {
      const e = new Entity(`RollingMatka_${i}`);

      // Internal rotator node so pitch rotation and physical roll wobble operate cleanly
      const rotator = new Entity('PotRotator');
      rotator.setLocalPosition(0, 0.35, 0);

      // Bulbous round clay body (0.7m diameter sphere)
      const body = new Entity('PotBody');
      body.addComponent('render', { type: 'sphere' });
      body.setLocalScale(0.7, 0.68, 0.7);
      body.setLocalPosition(0, 0, 0);
      if (body.render) body.render.material = potClayMat;
      rotator.addChild(body);

      // Painted ritual decorative waist band
      const waistBand = new Entity('WaistBand');
      waistBand.addComponent('render', { type: 'cylinder' });
      waistBand.setLocalScale(0.72, 0.1, 0.72);
      waistBand.setLocalPosition(0, 0, 0);
      if (waistBand.render) waistBand.render.material = potBandMat;
      rotator.addChild(waistBand);

      // Flanged top opening rim / neck
      const neckRim = new Entity('NeckRim');
      neckRim.addComponent('render', { type: 'cylinder' });
      neckRim.setLocalScale(0.42, 0.12, 0.42);
      neckRim.setLocalPosition(0, 0.34, 0);
      if (neckRim.render) neckRim.render.material = potRimMat;
      rotator.addChild(neckRim);

      e.addChild(rotator);
      e.enabled = false;
      this.rootEntity.addChild(e);

      this.rollingMatkaPool.push({
        id: 200 + i,
        type: 'ROLLING_MATKA',
        lane: 0,
        z: 0,
        entity: e,
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
        hasTriggeredCollision: false,
        hasTriggeredSkillCheck: false,
        rollPitch: 0,
        rollSpeedZ: -2.2, // Rolls towards runner down alley
        slideX: 0,
        slideCenter: 0,
        slideSpeed: 0,
        slidePhase: 0,
        slideAmplitude: 0,
        dustTimer: 0,
      });
    }

    // -------------------------------------------------------------------------
    // 4. SLIDING STREET GATE BARRIER (Newar Courtyard Lattice Gate - Dha)
    // -------------------------------------------------------------------------
    const gateWoodMat = new StandardMaterial();
    gateWoodMat.diffuse = new Color(0.24, 0.14, 0.08); // Dark Newar Sal timber
    gateWoodMat.gloss = 0.25;
    gateWoodMat.update();

    const latticeMat = new StandardMaterial();
    latticeMat.diffuse = new Color(0.36, 0.22, 0.12);
    latticeMat.gloss = 0.2;
    latticeMat.update();

    const brassBossMat = new StandardMaterial();
    brassBossMat.diffuse = new Color(0.85, 0.7, 0.22); // Antique brass central latch
    brassBossMat.useMetalness = true;
    brassBossMat.metalness = 0.7;
    brassBossMat.gloss = 0.65;
    brassBossMat.update();

    const ironRailMat = new StandardMaterial();
    ironRailMat.diffuse = new Color(0.18, 0.18, 0.2); // Weathered dark iron runner track
    ironRailMat.useMetalness = true;
    ironRailMat.metalness = 0.6;
    ironRailMat.gloss = 0.4;
    ironRailMat.update();

    const lanternMat = new StandardMaterial();
    lanternMat.diffuse = new Color(0.95, 0.8, 0.3); // Warm brass hanging oil lamp
    lanternMat.emissive = new Color(0.5, 0.35, 0.1);
    lanternMat.useMetalness = true;
    lanternMat.metalness = 0.8;
    lanternMat.gloss = 0.7;
    lanternMat.update();

    for (let i = 0; i < 6; i++) {
      const e = new Entity(`SlidingGate_${i}`);

      // Heavy vertical timber posts (Left & Right)
      const postL = new Entity('PostL');
      postL.addComponent('render', { type: 'box' });
      postL.setLocalScale(0.18, 2.3, 0.24);
      postL.setLocalPosition(-0.66, 1.15, 0);
      if (postL.render) postL.render.material = gateWoodMat;
      e.addChild(postL);

      const postR = new Entity('PostR');
      postR.addComponent('render', { type: 'box' });
      postR.setLocalScale(0.18, 2.3, 0.24);
      postR.setLocalPosition(0.66, 1.15, 0);
      if (postR.render) postR.render.material = gateWoodMat;
      e.addChild(postR);

      // Carved top horizontal lintel beam
      const lintel = new Entity('Lintel');
      lintel.addComponent('render', { type: 'box' });
      lintel.setLocalScale(1.58, 0.26, 0.32);
      lintel.setLocalPosition(0, 2.22, 0);
      if (lintel.render) lintel.render.material = gateWoodMat;
      e.addChild(lintel);

      // Bottom threshold runner beam
      const threshold = new Entity('Threshold');
      threshold.addComponent('render', { type: 'box' });
      threshold.setLocalScale(1.5, 0.16, 0.28);
      threshold.setLocalPosition(0, 0.1, 0);
      if (threshold.render) threshold.render.material = gateWoodMat;
      e.addChild(threshold);

      // Decorative central wooden lattice panels
      for (let bar = -2; bar <= 2; bar++) {
        const vBar = new Entity(`VBar_${bar}`);
        vBar.addComponent('render', { type: 'box' });
        vBar.setLocalScale(0.08, 1.9, 0.1);
        vBar.setLocalPosition(bar * 0.22, 1.15, 0);
        if (vBar.render) vBar.render.material = latticeMat;
        e.addChild(vBar);
      }

      // 3 horizontal crossbars
      for (let h = 0; h < 3; h++) {
        const hBar = new Entity(`HBar_${h}`);
        hBar.addComponent('render', { type: 'box' });
        hBar.setLocalScale(1.35, 0.08, 0.1);
        hBar.setLocalPosition(0, 0.55 + h * 0.6, 0);
        if (hBar.render) hBar.render.material = latticeMat;
        e.addChild(hBar);
      }

      // Ornamental center brass medallion boss
      const brassBoss = new Entity('BrassBoss');
      brassBoss.addComponent('render', { type: 'cylinder' });
      brassBoss.setLocalScale(0.24, 0.12, 0.24);
      brassBoss.setLocalPosition(0, 1.15, 0);
      brassBoss.setLocalEulerAngles(90, 0, 0);
      if (brassBoss.render) brassBoss.render.material = brassBossMat;
      e.addChild(brassBoss);

      // Dynamic swinging brass oil lamps (hang from top lintel, swing with slide inertia)
      const lampL = new Entity('LampL');
      lampL.addComponent('render', { type: 'cylinder' });
      lampL.setLocalScale(0.12, 0.22, 0.12);
      lampL.setLocalPosition(-0.42, 2.05, 0);
      if (lampL.render) lampL.render.material = lanternMat;
      e.addChild(lampL);

      const lampR = new Entity('LampR');
      lampR.addComponent('render', { type: 'cylinder' });
      lampR.setLocalScale(0.12, 0.22, 0.12);
      lampR.setLocalPosition(0.42, 2.05, 0);
      if (lampR.render) lampR.render.material = lanternMat;
      e.addChild(lampR);

      e.enabled = false;
      this.rootEntity.addChild(e);

      // Separate Ground Runner Track Rail (Stationary on cobblestone, spans both lanes)
      const guideTrackEntity = new Entity(`GuideTrack_${i}`);
      const ironRail = new Entity('IronRail');
      ironRail.addComponent('render', { type: 'box' });
      ironRail.setLocalScale(2.5, 0.03, 0.22); // Spans 2.5m across sliding lane pair
      ironRail.setLocalPosition(0, 0.015, 0);
      if (ironRail.render) ironRail.render.material = ironRailMat;
      guideTrackEntity.addChild(ironRail);

      guideTrackEntity.enabled = false;
      this.rootEntity.addChild(guideTrackEntity);

      this.slidingGatePool.push({
        id: 300 + i,
        type: 'SLIDING_GATE',
        lane: 0,
        z: 0,
        entity: e,
        guideTrackEntity,
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
        hasTriggeredCollision: false,
        hasTriggeredSkillCheck: false,
        rollPitch: 0,
        rollSpeedZ: 0,
        slideX: 0,
        slideCenter: 0,
        slideSpeed: 2.4,
        slidePhase: 0,
        slideAmplitude: 1.05,
        dustTimer: 0,
      });
    }

    // -------------------------------------------------------------------------
    // 5. OVERHEAD BEAM (Carved Ancient Newari Timber Beam with Bells)
    // -------------------------------------------------------------------------
    const timberBeamMat = new StandardMaterial();
    timberBeamMat.diffuse = new Color(0.24, 0.15, 0.09); // Dark carved wood
    timberBeamMat.gloss = 0.25;
    timberBeamMat.update();

    const beamGarlandMat = new StandardMaterial();
    beamGarlandMat.diffuse = new Color(0.95, 0.58, 0.08); // Festive Marigold
    beamGarlandMat.gloss = 0.3;
    beamGarlandMat.update();

    const bellMat = new StandardMaterial();
    bellMat.diffuse = new Color(0.85, 0.68, 0.22); // Gilded Bronze Bell
    bellMat.useMetalness = true;
    bellMat.metalness = 0.6;
    bellMat.gloss = 0.7;
    bellMat.update();

    for (let i = 0; i < 8; i++) {
      const e = new Entity(`OverheadBeam_${i}`);

      // Left Pillar Post
      const pillarL = new Entity('PillarL');
      pillarL.addComponent('render', { type: 'box' });
      pillarL.setLocalScale(0.18, 2.3, 0.25);
      pillarL.setLocalPosition(-0.95, 1.15, 0);
      if (pillarL.render) pillarL.render.material = timberBeamMat;
      e.addChild(pillarL);

      // Right Pillar Post
      const pillarR = new Entity('PillarR');
      pillarR.addComponent('render', { type: 'box' });
      pillarR.setLocalScale(0.18, 2.3, 0.25);
      pillarR.setLocalPosition(0.95, 1.15, 0);
      if (pillarR.render) pillarR.render.material = timberBeamMat;
      e.addChild(pillarR);

      // Heavy Carved Horizontal Beam spanning lane at Y = 1.25m
      const crossbeam = new Entity('Crossbeam');
      crossbeam.addComponent('render', { type: 'box' });
      crossbeam.setLocalScale(2.0, 0.38, 0.32);
      crossbeam.setLocalPosition(0, 1.26, 0);
      if (crossbeam.render) crossbeam.render.material = timberBeamMat;
      e.addChild(crossbeam);

      // Hanging marigold garland festoon underneath
      const garland = new Entity('Garland');
      garland.addComponent('render', { type: 'box' });
      garland.setLocalScale(1.7, 0.12, 0.1);
      garland.setLocalPosition(0, 1.01, 0);
      if (garland.render) garland.render.material = beamGarlandMat;
      e.addChild(garland);

      // 3 Hanging Ceremonial Bells underneath (clearance under bell rim is 0.76m)
      const bellX = [-0.5, 0, 0.5];
      for (const bx of bellX) {
        const bell = new Entity(`Bell_${bx}`);
        bell.addComponent('render', { type: 'cylinder' });
        bell.setLocalScale(0.14, 0.18, 0.14);
        bell.setLocalPosition(bx, 0.86, 0);
        if (bell.render) bell.render.material = bellMat;
        e.addChild(bell);
      }

      e.enabled = false;
      this.rootEntity.addChild(e);
      this.overheadBeamPool.push({
        id: 400 + i,
        type: 'OVERHEAD_BEAM',
        lane: 0,
        z: 0,
        entity: e,
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
        hasTriggeredCollision: false,
        hasTriggeredSkillCheck: false,
        rollPitch: 0,
        rollSpeedZ: 0,
        slideX: 0,
        slideCenter: 0,
        slideSpeed: 0,
        slidePhase: 0,
        slideAmplitude: 0,
        dustTimer: 0,
      });
    }

    // -------------------------------------------------------------------------
    // 6. GHAT WOODEN STEPS (Sacred River Causeway - Stepped Timber Hurdle)
    // -------------------------------------------------------------------------
    const ghatWoodMat = new StandardMaterial();
    ghatWoodMat.diffuse = new Color(0.28, 0.18, 0.11); // Dark Sal timber
    ghatWoodMat.gloss = 0.22;
    ghatWoodMat.update();

    const ghatRiserMat = new StandardMaterial();
    ghatRiserMat.diffuse = new Color(0.38, 0.25, 0.15); // Lighter weathered plank
    ghatRiserMat.gloss = 0.18;
    ghatRiserMat.update();

    const ghatBrassMat = new StandardMaterial();
    ghatBrassMat.diffuse = new Color(0.85, 0.70, 0.22); // Antique brass corner rivets
    ghatBrassMat.useMetalness = true;
    ghatBrassMat.metalness = 0.65;
    ghatBrassMat.gloss = 0.6;
    ghatBrassMat.update();

    const riverFoamMat = new StandardMaterial();
    riverFoamMat.diffuse = new Color(0.80, 0.94, 1.0); // Shimmering water foam underneath
    riverFoamMat.emissive = new Color(0.25, 0.45, 0.60);
    riverFoamMat.opacity = 0.75;
    riverFoamMat.blendType = 2;
    riverFoamMat.update();

    for (let i = 0; i < 6; i++) {
      const e = new Entity(`GhatSteps_${i}`);

      // Stepped Timber Boardwalk Plinth
      const step1 = new Entity('StepBase');
      step1.addComponent('render', { type: 'box' });
      step1.setLocalScale(1.65, 0.22, 0.55);
      step1.setLocalPosition(0, 0.11, 0);
      if (step1.render) step1.render.material = ghatWoodMat;
      e.addChild(step1);

      // Upper Stepped Hurdle Plank (Total hurdle height reaches 0.44m)
      const step2 = new Entity('StepTop');
      step2.addComponent('render', { type: 'box' });
      step2.setLocalScale(1.72, 0.22, 0.32);
      step2.setLocalPosition(0, 0.33, -0.08);
      if (step2.render) step2.render.material = ghatRiserMat;
      e.addChild(step2);

      // Brass Corner Protector Brackets
      for (const bx of [-0.8, 0.8]) {
        const bracket = new Entity(`Bracket_${bx}`);
        bracket.addComponent('render', { type: 'box' });
        bracket.setLocalScale(0.12, 0.42, 0.34);
        bracket.setLocalPosition(bx, 0.22, -0.06);
        if (bracket.render) bracket.render.material = ghatBrassMat;
        e.addChild(bracket);
      }

      // River Water Foam Strip underneath the bridge plank gap
      const foam = new Entity('RiverFoamGap');
      foam.addComponent('render', { type: 'box' });
      foam.setLocalScale(1.58, 0.04, 0.22);
      foam.setLocalPosition(0, 0.02, 0.22);
      if (foam.render) foam.render.material = riverFoamMat;
      e.addChild(foam);

      e.enabled = false;
      this.rootEntity.addChild(e);
      this.ghatStepsPool.push({
        id: 500 + i,
        type: 'GHAT_STEPS',
        lane: 0,
        z: 0,
        entity: e,
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
        hasTriggeredCollision: false,
        hasTriggeredSkillCheck: false,
        rollPitch: 0,
        rollSpeedZ: 0,
        slideX: 0,
        slideCenter: 0,
        slideSpeed: 0,
        slidePhase: 0,
        slideAmplitude: 0,
        dustTimer: 0,
      });
    }

    // -------------------------------------------------------------------------
    // 7. SUSPENSION BRIDGE ROPE (Sacred River Causeway - Low Drooped Hemp Cables)
    // -------------------------------------------------------------------------
    const bridgePylonMat = new StandardMaterial();
    bridgePylonMat.diffuse = new Color(0.22, 0.14, 0.09); // Dark suspension tower timber
    bridgePylonMat.gloss = 0.25;
    bridgePylonMat.update();

    const hempCableMat = new StandardMaterial();
    hempCableMat.diffuse = new Color(0.58, 0.44, 0.26); // Braided hemp suspension rope
    hempCableMat.gloss = 0.15;
    hempCableMat.update();

    const lanternBronzeMat = new StandardMaterial();
    lanternBronzeMat.diffuse = new Color(0.92, 0.78, 0.28); // Hanging river brass lanterns
    lanternBronzeMat.emissive = new Color(0.55, 0.38, 0.10);
    lanternBronzeMat.useMetalness = true;
    lanternBronzeMat.metalness = 0.75;
    lanternBronzeMat.gloss = 0.7;
    lanternBronzeMat.update();

    for (let i = 0; i < 6; i++) {
      const e = new Entity(`BridgeRope_${i}`);

      // Left Suspension Pylon Post
      const pylonL = new Entity('PylonL');
      pylonL.addComponent('render', { type: 'box' });
      pylonL.setLocalScale(0.18, 2.4, 0.22);
      pylonL.setLocalPosition(-0.95, 1.2, 0);
      if (pylonL.render) pylonL.render.material = bridgePylonMat;
      e.addChild(pylonL);

      // Right Suspension Pylon Post
      const pylonR = new Entity('PylonR');
      pylonR.addComponent('render', { type: 'box' });
      pylonR.setLocalScale(0.18, 2.4, 0.22);
      pylonR.setLocalPosition(0.95, 1.2, 0);
      if (pylonR.render) pylonR.render.material = bridgePylonMat;
      e.addChild(pylonR);

      // Top Timber Stabilizer Strut
      const strut = new Entity('Strut');
      strut.addComponent('render', { type: 'box' });
      strut.setLocalScale(1.95, 0.12, 0.14);
      strut.setLocalPosition(0, 2.32, 0);
      if (strut.render) strut.render.material = bridgePylonMat;
      e.addChild(strut);

      // Low-Slung Sagging Braided Hemp Suspension Rope Cable (spanning lane at Y = 1.22m)
      const cable = new Entity('HempCable');
      cable.addComponent('render', { type: 'box' });
      cable.setLocalScale(1.9, 0.14, 0.16);
      cable.setLocalPosition(0, 1.22, 0);
      if (cable.render) cable.render.material = hempCableMat;
      e.addChild(cable);

      // 2 Hanging Fisherman Oil Lamps (Clearance underneath is 0.74m)
      for (const lx of [-0.45, 0.45]) {
        const lamp = new Entity(`RiverLamp_${lx}`);
        lamp.addComponent('render', { type: 'cylinder' });
        lamp.setLocalScale(0.14, 0.24, 0.14);
        lamp.setLocalPosition(lx, 0.92, 0);
        if (lamp.render) lamp.render.material = lanternBronzeMat;
        e.addChild(lamp);
      }

      e.enabled = false;
      this.rootEntity.addChild(e);
      this.bridgeRopePool.push({
        id: 600 + i,
        type: 'BRIDGE_ROPE',
        lane: 0,
        z: 0,
        entity: e,
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
        hasTriggeredCollision: false,
        hasTriggeredSkillCheck: false,
        rollPitch: 0,
        rollSpeedZ: 0,
        slideX: 0,
        slideCenter: 0,
        slideSpeed: 0,
        slidePhase: 0,
        slideAmplitude: 0,
        dustTimer: 0,
      });
    }

    // -------------------------------------------------------------------------
    // 8. PRAYER FLAG GALE (Himalayan Temple Hill - Fluttering Wind Pennants)
    // -------------------------------------------------------------------------
    const bambooPoleMat = new StandardMaterial();
    bambooPoleMat.diffuse = new Color(0.68, 0.54, 0.30); // Weathered golden bamboo
    bambooPoleMat.gloss = 0.25;
    bambooPoleMat.update();

    const prayerRopeMat = new StandardMaterial();
    prayerRopeMat.diffuse = new Color(0.52, 0.42, 0.26);
    prayerRopeMat.gloss = 0.15;
    prayerRopeMat.update();

    // 5 Traditional Tibetan Lung-ta Flag Colors
    const lungTaColors = [
      new Color(0.18, 0.45, 0.92), // Blue (Sky)
      new Color(0.92, 0.92, 0.92), // White (Air)
      new Color(0.88, 0.18, 0.15), // Red (Fire)
      new Color(0.15, 0.72, 0.28), // Green (Water)
      new Color(0.95, 0.82, 0.14), // Yellow (Earth)
    ];
    const flagMats: StandardMaterial[] = lungTaColors.map((c) => {
      const m = new StandardMaterial();
      m.diffuse = c;
      m.gloss = 0.3;
      m.update();
      return m;
    });

    const windStreamerMat = new StandardMaterial();
    windStreamerMat.diffuse = new Color(0.85, 0.94, 1.0); // Translucent mountain wind ribbon
    windStreamerMat.emissive = new Color(0.35, 0.60, 0.85);
    windStreamerMat.opacity = 0.48;
    windStreamerMat.blendType = 2; // pc.BLEND_NORMAL
    windStreamerMat.update();

    for (let i = 0; i < 6; i++) {
      const e = new Entity(`PrayerFlagGale_${i}`);

      // Left Bamboo Flagpole
      const poleL = new Entity('PoleL');
      poleL.addComponent('render', { type: 'cylinder' });
      poleL.setLocalScale(0.12, 2.6, 0.12);
      poleL.setLocalPosition(-0.95, 1.3, 0);
      if (poleL.render) poleL.render.material = bambooPoleMat;
      e.addChild(poleL);

      // Right Bamboo Flagpole
      const poleR = new Entity('PoleR');
      poleR.addComponent('render', { type: 'cylinder' });
      poleR.setLocalScale(0.12, 2.6, 0.12);
      poleR.setLocalPosition(0.95, 1.3, 0);
      if (poleR.render) poleR.render.material = bambooPoleMat;
      e.addChild(poleR);

      // Tension Cord spanning lane at Y = 1.3m
      const rope = new Entity('FlagCord');
      rope.addComponent('render', { type: 'box' });
      rope.setLocalScale(1.95, 0.04, 0.04);
      rope.setLocalPosition(0, 1.3, 0);
      if (rope.render) rope.render.material = prayerRopeMat;
      e.addChild(rope);

      // 5 Fluttering Tibetan Prayer Flags
      const flagX = [-0.64, -0.32, 0.0, 0.32, 0.64];
      for (let f = 0; f < 5; f++) {
        const flag = new Entity(`Flag_${f}`);
        flag.addComponent('render', { type: 'box' });
        flag.setLocalScale(0.24, 0.36, 0.02);
        flag.setLocalPosition(flagX[f], 1.08, 0);
        if (flag.render) flag.render.material = flagMats[f];
        e.addChild(flag);
      }

      // Mountain Crosswind Gust Shimmer Ribbon across flags
      const windRibbon = new Entity('WindRibbon');
      windRibbon.addComponent('render', { type: 'box' });
      windRibbon.setLocalScale(1.85, 0.42, 0.04);
      windRibbon.setLocalPosition(0, 1.12, 0);
      if (windRibbon.render) windRibbon.render.material = windStreamerMat;
      e.addChild(windRibbon);

      e.enabled = false;
      this.rootEntity.addChild(e);
      this.prayerFlagGalePool.push({
        id: 700 + i,
        type: 'PRAYER_FLAG_GALE',
        lane: 0,
        z: 0,
        entity: e,
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
        hasTriggeredCollision: false,
        hasTriggeredSkillCheck: false,
        rollPitch: 0,
        rollSpeedZ: 0,
        slideX: 0,
        slideCenter: 0,
        slideSpeed: 0,
        slidePhase: 0,
        slideAmplitude: 0,
        dustTimer: 0,
      });
    }

    // -------------------------------------------------------------------------
    // 9. PULU KISI — THE WHITE ELEPHANT (Dynamic Crossroad Runner Hazard)
    // -------------------------------------------------------------------------
    const pkClothMat = new StandardMaterial();
    pkClothMat.diffuse = new Color(0.95, 0.94, 0.91); // Woven white cloth frame
    pkClothMat.gloss = 0.2;
    pkClothMat.update();

    const pkCrimsonMat = new StandardMaterial();
    pkCrimsonMat.diffuse = new Color(0.82, 0.12, 0.18); // Ceremonial Jhula saddle blanket
    pkCrimsonMat.gloss = 0.45;
    pkCrimsonMat.update();

    const pkGoldMat = new StandardMaterial();
    pkGoldMat.diffuse = new Color(0.96, 0.78, 0.22); // Golden brocade border trim
    pkGoldMat.useMetalness = true;
    pkGoldMat.metalness = 0.65;
    pkGoldMat.gloss = 0.6;
    pkGoldMat.update();

    const pkBellMat = new StandardMaterial();
    pkBellMat.diffuse = new Color(0.92, 0.76, 0.16); // Resonant neck Ghangla bell
    pkBellMat.useMetalness = true;
    pkBellMat.metalness = 0.85;
    pkBellMat.gloss = 0.7;
    pkBellMat.update();

    for (let i = 0; i < 4; i++) {
      const e = new Entity(`PuluKisi_${i}`);

      // Stylized Procedural Fallback Elephant (Guarantees instant visibility while GLB parses)
      const fallback = new Entity('ProceduralFallback');

      // Wicker Barrel Torso
      const torso = new Entity('Torso');
      torso.addComponent('render', { type: 'cylinder' });
      torso.setLocalScale(1.08, 1.35, 1.08);
      torso.setLocalEulerAngles(90, 0, 0);
      torso.setLocalPosition(0, 0.85, 0);
      if (torso.render) torso.render.material = pkClothMat;
      fallback.addChild(torso);

      // Head Dome
      const head = new Entity('Head');
      head.addComponent('render', { type: 'sphere' });
      head.setLocalScale(0.92, 0.88, 0.88);
      head.setLocalPosition(0, 1.12, -0.72);
      if (head.render) head.render.material = pkClothMat;
      fallback.addChild(head);

      // Curved Trunk
      const trunk = new Entity('Trunk');
      trunk.addComponent('render', { type: 'cylinder' });
      trunk.setLocalScale(0.24, 0.62, 0.24);
      trunk.setLocalEulerAngles(-24, 0, 0);
      trunk.setLocalPosition(0, 0.68, -1.18);
      if (trunk.render) trunk.render.material = pkClothMat;
      fallback.addChild(trunk);

      // Crimson Saddle Blanket (Jhula)
      const saddle = new Entity('Saddle');
      saddle.addComponent('render', { type: 'box' });
      saddle.setLocalScale(1.16, 0.52, 1.15);
      saddle.setLocalPosition(0, 0.92, 0);
      if (saddle.render) saddle.render.material = pkCrimsonMat;
      fallback.addChild(saddle);

      // Golden Neck Bell
      const bell = new Entity('Bell');
      bell.addComponent('render', { type: 'sphere' });
      bell.setLocalScale(0.24, 0.28, 0.24);
      bell.setLocalPosition(0, 0.54, -0.74);
      if (bell.render) bell.render.material = pkBellMat;
      fallback.addChild(bell);

      // 4 Legs
      for (const lx of [-0.34, 0.34]) {
        for (const lz of [-0.48, 0.48]) {
          const leg = new Entity(`Leg_${lx}_${lz}`);
          leg.addComponent('render', { type: 'cylinder' });
          leg.setLocalScale(0.26, 0.58, 0.26);
          leg.setLocalPosition(lx, 0.29, lz);
          if (leg.render) leg.render.material = pkClothMat;
          fallback.addChild(leg);
        }
      }

      e.addChild(fallback);
      e.enabled = false;
      this.rootEntity.addChild(e);

      const obstacleRecord: ActiveObstacle = {
        id: 800 + i,
        type: 'PULU_KISI_CROSSING',
        lane: 0,
        z: 0,
        entity: e,
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
        hasTriggeredCollision: false,
        hasTriggeredSkillCheck: false,
        rollPitch: 0,
        rollSpeedZ: 0,
        slideX: 0,
        slideCenter: 0,
        slideSpeed: 5.4,
        slidePhase: 0,
        slideAmplitude: 0,
        dustTimer: 0,
        puluDirection: 1,
        puluIsDashing: false,
        puluAnimTime: 0,
        puluBellTimer: 0,
        puluStepTimer: 0,
      };

      // Asynchronously load the detailed stylized 3D rigged model
      this.app.assets.loadFromUrl('/models/pulu_kisi.glb', 'container', (err, asset) => {
        if (!err && asset && asset.resource) {
          const modelEntity = (asset.resource as any).instantiateRenderEntity();
          if (modelEntity) {
            modelEntity.name = 'PuluKisi_3D_Rig';
            e.addChild(modelEntity);
            fallback.enabled = false;

            obstacleRecord.puluJoints = {
              bodyNode: modelEntity.findByName('BodyRoot') as Entity,
              headNode: modelEntity.findByName('HeadRoot') as Entity,
              trunkNode: modelEntity.findByName('TrunkRoot') as Entity,
              leftEarNode: modelEntity.findByName('LeftEarRoot') as Entity,
              rightEarNode: modelEntity.findByName('RightEarRoot') as Entity,
              bellNode: modelEntity.findByName('BellRoot') as Entity,
              tailNode: modelEntity.findByName('TailRoot') as Entity,
              flLegNode: modelEntity.findByName('FrontLeftLegRoot') as Entity,
              frLegNode: modelEntity.findByName('FrontRightLegRoot') as Entity,
              blLegNode: modelEntity.findByName('BackLeftLegRoot') as Entity,
              brLegNode: modelEntity.findByName('BackRightLegRoot') as Entity,
            };
          }
        }
      });

      this.puluKisiPool.push(obstacleRecord);
    }

    this.loadObstacleTextures([
      { url: '/models/textures/tex_hazard_chevron.png', mat: lowMat, repeat: new Vec2(2, 1) },
      { url: '/models/textures/tex_timber_sal.png', mat: legMat, repeat: new Vec2(1, 2) },
      { url: '/models/textures/tex_brick_dachi.png', mat: tallMat, repeat: new Vec2(1, 2) },
      { url: '/models/textures/tex_bronze_wheel.png', mat: trimMat, repeat: new Vec2(1, 1), metalness: 0.7, gloss: 0.6 },
      { url: '/models/textures/tex_matka_pottery.png', mat: potClayMat, repeat: new Vec2(1, 1) },
      { url: '/models/textures/tex_bronze_wheel.png', mat: potBandMat, repeat: new Vec2(1, 1) },
      { url: '/models/textures/tex_timber_sal.png', mat: potRimMat, repeat: new Vec2(1, 1) },
      { url: '/models/textures/tex_timber_sal.png', mat: gateWoodMat, repeat: new Vec2(1, 3) },
      { url: '/models/textures/tex_window_akijhya.png', mat: latticeMat, repeat: new Vec2(1, 2) },
      { url: '/models/textures/tex_bronze_wheel.png', mat: brassBossMat, repeat: new Vec2(1, 1), metalness: 0.7, gloss: 0.65 },
      { url: '/models/textures/tex_stone_bridge.png', mat: ironRailMat, repeat: new Vec2(2, 1) },
      { url: '/models/textures/tex_lantern_amber.png', mat: lanternMat, repeat: new Vec2(1, 1), emissive: true, emissiveColor: new Color(0.9, 0.6, 0.15) },
      { url: '/models/textures/tex_timber_sal.png', mat: timberBeamMat, repeat: new Vec2(2, 1) },
      { url: '/models/textures/tex_bronze_wheel.png', mat: bellMat, repeat: new Vec2(1, 1), metalness: 0.6, gloss: 0.7 },
      { url: '/models/textures/tex_timber_sal.png', mat: ghatWoodMat, repeat: new Vec2(2, 1) },
      { url: '/models/textures/tex_timber_sal.png', mat: ghatRiserMat, repeat: new Vec2(2, 1) },
      { url: '/models/textures/tex_bronze_wheel.png', mat: ghatBrassMat, repeat: new Vec2(1, 1), metalness: 0.65, gloss: 0.6 },
      { url: '/models/textures/tex_timber_sal.png', mat: bridgePylonMat, repeat: new Vec2(1, 4) },
      { url: '/models/textures/tex_timber_sal.png', mat: hempCableMat, repeat: new Vec2(3, 1) },
      { url: '/models/textures/tex_lantern_amber.png', mat: lanternBronzeMat, repeat: new Vec2(1, 1), emissive: true, emissiveColor: new Color(0.9, 0.6, 0.15) },
      { url: '/models/textures/tex_timber_sal.png', mat: bambooPoleMat, repeat: new Vec2(1, 4) },
    ]);
  }

  private loadObstacleTextures(targets: {
    url: string;
    mat: StandardMaterial;
    repeat?: Vec2;
    emissive?: boolean;
    emissiveColor?: Color;
    metalness?: number;
    gloss?: number;
  }[]): void {
    for (const t of targets) {
      this.app.assets.loadFromUrl(t.url, 'texture', (err, asset) => {
        if (!err && asset && asset.resource) {
          const tex = asset.resource as Texture;
          t.mat.diffuseMap = tex;
          t.mat.diffuse = new Color(1, 1, 1);
          if (t.repeat) {
            t.mat.diffuseMapTiling = t.repeat;
          }
          if (t.emissive) {
            t.mat.emissiveMap = tex;
            if (t.repeat) t.mat.emissiveMapTiling = t.repeat;
            t.mat.emissive = t.emissiveColor || new Color(0.85, 0.55, 0.15);
          }
          if (t.metalness !== undefined) {
            t.mat.useMetalness = true;
            t.mat.metalness = t.metalness;
          }
          if (t.gloss !== undefined) {
            t.mat.gloss = t.gloss;
          }
          t.mat.update();
        }
      });
    }
  }

  // Mulberry32 deterministic PRNG
  private random(): number {
    let t = (this.currentPrngState += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public setSeed(newSeed: number): void {
    this.seed = newSeed;
    this.reset(newSeed);
  }

  public reset(seed = this.seed): void {
    this.seed = seed;
    this.currentPrngState = seed;
    this.animTime = 0;

    // Return all active obstacles to pool
    for (const obs of this.activeObstacles) {
      obs.entity.enabled = false;
      obs.hasTriggeredSkillCheck = false;
      if (obs.guideTrackEntity) {
        obs.guideTrackEntity.enabled = false;
      }
      if (obs.type === 'LOW_BARRIER') {
        this.lowBarrierPool.push(obs);
      } else if (obs.type === 'TALL_BLOCK') {
        this.tallBlockPool.push(obs);
      } else if (obs.type === 'ROLLING_MATKA') {
        this.rollingMatkaPool.push(obs);
      } else if (obs.type === 'SLIDING_GATE') {
        this.slidingGatePool.push(obs);
      } else if (obs.type === 'OVERHEAD_BEAM') {
        this.overheadBeamPool.push(obs);
      } else if (obs.type === 'GHAT_STEPS') {
        this.ghatStepsPool.push(obs);
      } else if (obs.type === 'BRIDGE_ROPE') {
        this.bridgeRopePool.push(obs);
      } else if (obs.type === 'PRAYER_FLAG_GALE') {
        this.prayerFlagGalePool.push(obs);
      } else if (obs.type === 'PULU_KISI_CROSSING') {
        this.puluKisiPool.push(obs);
      }
    }
    this.activeObstacles = [];

    this.nextSpawnZ = this.initialSpawnZ;
  }

  public update(dt: number, playerZ: number): void {
    this.animTime += dt;

    // 1. Update dynamic kinematics for all active obstacles
    for (const obs of this.activeObstacles) {
      const distToPlayer = Math.abs(obs.z - playerZ);

      if (obs.type === 'ROLLING_MATKA') {
        // Roll along Z down lane towards runner
        obs.z += obs.rollSpeedZ * dt;

        // Realistic pitch rotation: dTheta = (speed / radius) * dt
        // Radius is 0.35m
        const angularVelocity = (Math.abs(obs.rollSpeedZ) / 0.35) * (180 / Math.PI);
        obs.rollPitch = (obs.rollPitch + angularVelocity * dt) % 360;

        // Realistic roll wobble (earthen pots have organic asymmetries)
        const wobbleRoll = Math.sin(obs.rollPitch * (Math.PI / 180) * 2.0) * 4.2;
        const wobbleYaw = Math.cos(obs.rollPitch * (Math.PI / 180)) * 2.0;

        const posX = RoadView.LANE_X[obs.lane];
        obs.entity.setPosition(posX, 0, obs.z);

        const rotator = obs.entity.findByName('PotRotator');
        if (rotator) {
          rotator.setLocalEulerAngles(obs.rollPitch, wobbleYaw, wobbleRoll);
        }

        // Pavement rolling dust puff emission
        obs.dustTimer += dt;
        if (obs.dustTimer >= 0.14) {
          obs.dustTimer = 0;
          if (this.onMatkaRollDustCb) {
            this.onMatkaRollDustCb(posX, 0.04, obs.z);
          }
        }

        // Rolling audio rumble feedback
        if (distToPlayer <= 16.0 && obs.z < playerZ && this.onMatkaAudioRumbleCb) {
          this.onMatkaAudioRumbleCb(distToPlayer);
        }

        // Update bounds
        const b = obs.bounds;
        b.minX = posX - 0.45;
        b.maxX = posX + 0.45;
        b.minY = 0.0;
        b.maxY = 0.72; // Jumpable! Tuku vault reaches 1.6m easily clearing 0.72m
        b.minZ = obs.z - 0.38;
        b.maxZ = obs.z + 0.38;
      } else if (obs.type === 'SLIDING_GATE') {
        // Smooth sinusoidal lateral oscillation between adjacent lanes
        obs.slidePhase += obs.slideSpeed * dt;
        obs.slideX = obs.slideCenter + Math.sin(obs.slidePhase) * obs.slideAmplitude;

        obs.entity.setPosition(obs.slideX, 0, obs.z);

        // Dynamic lantern inertia sway (swings opposite to acceleration)
        const lateralVel = obs.slideSpeed * Math.cos(obs.slidePhase) * obs.slideAmplitude;
        const swingAngle = -lateralVel * 12.0;

        const lampL = obs.entity.findByName('LampL');
        const lampR = obs.entity.findByName('LampR');
        if (lampL) lampL.setLocalEulerAngles(0, 0, swingAngle);
        if (lampR) lampR.setLocalEulerAngles(0, 0, swingAngle);

        // Proximity friction sound cue
        if (distToPlayer <= 14.0 && obs.z < playerZ && Math.abs(lateralVel) > 1.8 && this.onGateAudioSlideCb) {
          this.onGateAudioSlideCb(distToPlayer);
        }

        // Update bounds
        const b = obs.bounds;
        b.minX = obs.slideX - 0.74;
        b.maxX = obs.slideX + 0.74;
        b.minY = 0.0;
        b.maxY = 2.3; // Full height! Cannot jump over; must time dodge
        b.minZ = obs.z - 0.25;
        b.maxZ = obs.z + 0.25;
      } else if (obs.type === 'BRIDGE_ROPE') {
        // Dynamic suspension cable & hanging river oil lamp sway
        const lamp0 = obs.entity.findByName('RiverLamp_-0.45');
        const lamp1 = obs.entity.findByName('RiverLamp_0.45');
        const ropeSway = Math.sin(this.animTime * 2.8 + obs.id) * 14.0;
        if (lamp0) lamp0.setLocalEulerAngles(0, 0, ropeSway);
        if (lamp1) lamp1.setLocalEulerAngles(0, 0, -ropeSway);
      } else if (obs.type === 'PRAYER_FLAG_GALE') {
        // Dynamic fluttering Tibetan Lung-ta prayer flags in mountain crosswind
        for (let f = 0; f < 5; f++) {
          const flag = obs.entity.findByName(`Flag_${f}`);
          if (flag) {
            const flutter = Math.sin(this.animTime * 8.5 + f * 1.3 + obs.id) * 22.0;
            const wave = Math.cos(this.animTime * 6.0 + f * 0.9) * 12.0;
            flag.setLocalEulerAngles(flutter, wave, 0);
          }
        }
        const ribbon = obs.entity.findByName('WindRibbon');
        if (ribbon) {
          const ribbonRoll = Math.sin(this.animTime * 7.0 + obs.id) * 8.0;
          ribbon.setLocalEulerAngles(0, 0, ribbonRoll);
        }

        // Crosswind gust ribbon particle timer
        obs.dustTimer += dt;
        if (obs.dustTimer >= 0.25 && distToPlayer <= 30.0) {
          obs.dustTimer = 0;
          if (this.onWindGaleCb) {
            const posX = RoadView.LANE_X[obs.lane];
            this.onWindGaleCb(posX, 1.15, obs.z);
          }
        }
      } else if (obs.type === 'PULU_KISI_CROSSING') {
        // Dynamic Crossroad Runner Kinematics
        const distToPlayer = playerZ - obs.z; // Positive when runner is approaching ahead of crossing

        // Trigger energetic dash when runner approaches within 42m of crossroad
        if (distToPlayer <= 42.0 && !obs.puluIsDashing) {
          obs.puluIsDashing = true;
        }

        if (obs.puluIsDashing) {
          const dir = obs.puluDirection || 1;
          obs.slideX += dir * obs.slideSpeed * dt;
          obs.puluAnimTime = (obs.puluAnimTime || 0) + dt;

          obs.entity.setPosition(obs.slideX, 0, obs.z);

          // Update 3D AABB bounds dynamically with moving lateral position
          const b = obs.bounds;
          b.minX = obs.slideX - 1.05;
          b.maxX = obs.slideX + 1.05;
          b.minY = 0.0;
          b.maxY = 1.85;
          b.minZ = obs.z - 0.65;
          b.maxZ = obs.z + 0.65;

          // Articulate 3D Rig Skeleton (Authentic 2-dancer elephant gallop & swinging trunk)
          if (obs.puluJoints) {
            const j = obs.puluJoints;
            const t = (obs.puluAnimTime || 0) * 8.5; // High-tempo festival gallop cadence

            // Energetic body bobbing & pitching
            const bodyBob = Math.sin(t * 2.0) * 0.055;
            const bodyPitch = Math.sin(t) * 4.5;
            const bodyRoll = Math.cos(t * 0.5) * 3.5;
            j.bodyNode?.setLocalPosition(0, 0.85 + bodyBob, 0);
            j.bodyNode?.setLocalEulerAngles(bodyPitch, 0, bodyRoll);

            // Head bounce
            j.headNode?.setLocalEulerAngles(-bodyPitch * 0.8, Math.sin(t * 0.5) * 6.0, 0);

            // Dynamic 4-Leg Gallop Gait (representing two human runners inside)
            const legSwing = Math.sin(t) * 28.0;
            j.flLegNode?.setLocalEulerAngles(legSwing, 0, 0);
            j.brLegNode?.setLocalEulerAngles(legSwing * 0.9, 0, 0);
            j.frLegNode?.setLocalEulerAngles(-legSwing, 0, 0);
            j.blLegNode?.setLocalEulerAngles(-legSwing * 0.9, 0, 0);

            // Trunk swinging playfully
            const trunkSwing = Math.sin(t * 1.2) * 26.0;
            const trunkPitch = -Math.abs(Math.sin(t * 1.2)) * 12.0;
            j.trunkNode?.setLocalEulerAngles(trunkPitch, trunkSwing, 0);

            // Flapping fan ears
            const earFlap = Math.abs(Math.sin(t * 1.5)) * 18.0;
            j.leftEarNode?.setLocalEulerAngles(0, -earFlap, 0);
            j.rightEarNode?.setLocalEulerAngles(0, earFlap, 0);

            // Bell swing
            const bellSwing = Math.sin(t * 2.4) * 20.0;
            j.bellNode?.setLocalEulerAngles(bellSwing, 0, 0);

            // Wagging tail
            j.tailNode?.setLocalEulerAngles(0, Math.sin(t * 1.8) * 22.0, 0);
          }

          // Audio Trigger 1: Neck Ghangla Brass Bell Jingle Chime
          obs.puluBellTimer = (obs.puluBellTimer || 0) + dt;
          if (obs.puluBellTimer >= 0.36) {
            obs.puluBellTimer = 0;
            if (this.onPuluKisiBellCb && distToPlayer >= -8.0 && distToPlayer <= 42.0) {
              this.onPuluKisiBellCb(Math.abs(distToPlayer));
            }
          }

          // Audio Trigger 2: Rhythmic Gallop Footfall Patter
          obs.puluStepTimer = (obs.puluStepTimer || 0) + dt;
          if (obs.puluStepTimer >= 0.37) {
            obs.puluStepTimer = 0;
            if (this.onPuluKisiGallopCb && distToPlayer >= -8.0 && distToPlayer <= 38.0) {
              this.onPuluKisiGallopCb(Math.abs(distToPlayer));
            }
          }

          // Pavement gallop dust puffs
          obs.dustTimer += dt;
          if (obs.dustTimer >= 0.16) {
            obs.dustTimer = 0;
            if (this.onMatkaRollDustCb) {
              this.onMatkaRollDustCb(obs.slideX, 0.05, obs.z);
            }
          }
        }
      }
    }

    // 2. Recycle obstacles that have passed behind the camera
    const recycleThreshold = playerZ + 12.0;
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];
      if (obs.z > recycleThreshold) {
        obs.entity.enabled = false;
        if (obs.guideTrackEntity) {
          obs.guideTrackEntity.enabled = false;
        }
        if (obs.type === 'LOW_BARRIER') {
          this.lowBarrierPool.push(obs);
        } else if (obs.type === 'TALL_BLOCK') {
          this.tallBlockPool.push(obs);
        } else if (obs.type === 'ROLLING_MATKA') {
          this.rollingMatkaPool.push(obs);
        } else if (obs.type === 'SLIDING_GATE') {
          this.slidingGatePool.push(obs);
        } else if (obs.type === 'OVERHEAD_BEAM') {
          this.overheadBeamPool.push(obs);
        } else if (obs.type === 'GHAT_STEPS') {
          this.ghatStepsPool.push(obs);
        } else if (obs.type === 'BRIDGE_ROPE') {
          this.bridgeRopePool.push(obs);
        } else if (obs.type === 'PRAYER_FLAG_GALE') {
          this.prayerFlagGalePool.push(obs);
        } else if (obs.type === 'PULU_KISI_CROSSING') {
          this.puluKisiPool.push(obs);
        }
        this.activeObstacles.splice(i, 1);
      }
    }

    // 3. Spawn next hazard row if runner is approaching
    const spawnLookaheadDistance = 75.0; // Keep track populated 75m ahead
    while (this.nextSpawnZ > playerZ - spawnLookaheadDistance) {
      this.spawnHazardRow(this.nextSpawnZ);
      this.nextSpawnZ -= this.spawnSpacing;
    }
  }

  private spawnHazardRow(z: number): void {
    // Guaranteed fairness rules:
    // - Never block all 3 lanes.
    // - At least 1 lane is guaranteed open, or accessible via jump/slide.
    const roll = this.random();
    const lanes: LaneIndex[] = [-1, 0, 1];

    // Determine current biome index from road coordinate Z (420m total loop)
    const dist = Math.max(0, -z);
    const cycleDist = ((dist % RoadView.TOTAL_CYCLE_LENGTH) + RoadView.TOTAL_CYCLE_LENGTH) % RoadView.TOTAL_CYCLE_LENGTH;
    const biomeIdx = Math.floor(cycleDist / RoadView.BIOME_LENGTH); // 0 = Durbar, 1 = Causeway, 2 = Temple Hill

    // Option 1: Pulu Kisi Dynamic Crossroad Runner Hazard (18% chance at intersections/courtyards)
    if (roll < 0.18 && this.puluKisiPool.length > 0) {
      const dir = this.random() < 0.5 ? 1 : -1;
      this.activatePuluKisi(z, dir);
      return;
    }

    const subRoll = this.random();
    if (subRoll < 0.25) {
      // Pattern 1: Dynamic Sliding Gate (Oscillates between lane -1 & 0 or lane 0 & 1)
      const isRightPair = this.random() < 0.5;
      const slideCenter = isRightPair
        ? (RoadView.LANE_X[0] + RoadView.LANE_X[1]) / 2
        : (RoadView.LANE_X[-1] + RoadView.LANE_X[0]) / 2;
      const primaryLane: LaneIndex = isRightPair ? 0 : -1;

      this.activateSlidingGate(primaryLane, z, slideCenter);

      // On the far safe lane, optionally spawn a biome-thematic hurdle or pot (30% chance)
      const oppositeLane: LaneIndex = isRightPair ? -1 : 1;
      if (this.random() < 0.3) {
        let type: ObstacleType;
        if (biomeIdx === 1) {
          type = this.random() < 0.6 ? 'GHAT_STEPS' : 'BRIDGE_ROPE';
        } else if (biomeIdx === 2) {
          type = this.random() < 0.6 ? 'PRAYER_FLAG_GALE' : 'ROLLING_MATKA';
        } else {
          type = this.random() < 0.6 ? 'ROLLING_MATKA' : 'LOW_BARRIER';
        }
        this.activateStandardObstacle(type, oppositeLane, z);
      }
    } else if (roll < 0.6) {
      // Pattern 2: Single hazard (1 lane blocked, 2 lanes completely open)
      const laneIndex = Math.floor(this.random() * 3);
      const lane = lanes[laneIndex];
      const type = this.pickThematicHazard(biomeIdx);
      this.activateStandardObstacle(type, lane, z);
    } else {
      // Pattern 3: Double hazard (1 lane guaranteed completely open, 2 lanes obstructed)
      // Pick the open lane first
      const openLaneIndex = Math.floor(this.random() * 3);
      const openLane = lanes[openLaneIndex];
      const blockedLanes = lanes.filter((l) => l !== openLane);

      for (const lane of blockedLanes) {
        const type = this.pickThematicHazard(biomeIdx);
        this.activateStandardObstacle(type, lane, z);
      }
    }
  }

  private pickThematicHazard(biomeIdx: number): ObstacleType {
    const r = this.random();
    if (biomeIdx === 1) {
      // Biome 1: Sacred River Causeway (Boardwalk Ghat Steps, Suspension Bridge Ropes, Low Hurdles)
      if (r < 0.35) return 'GHAT_STEPS';
      if (r < 0.65) return 'BRIDGE_ROPE';
      if (r < 0.85) return 'LOW_BARRIER';
      return 'TALL_BLOCK';
    } else if (biomeIdx === 2) {
      // Biome 2: Himalayan Temple Hill (Lung-ta Prayer Flag Gale, Mountain Boulders, Timber Hurdles)
      if (r < 0.38) return 'PRAYER_FLAG_GALE';
      if (r < 0.65) return 'ROLLING_MATKA';
      if (r < 0.85) return 'OVERHEAD_BEAM';
      return 'TALL_BLOCK';
    } else {
      // Biome 0: Durbar Royal Alley (Rolling Matkas, Street Hurdles, Overhead Beams, Tall Blocks)
      if (r < 0.30) return 'ROLLING_MATKA';
      if (r < 0.55) return 'LOW_BARRIER';
      if (r < 0.78) return 'OVERHEAD_BEAM';
      return 'TALL_BLOCK';
    }
  }

  public activateStandardObstacle(type: ObstacleType, lane: LaneIndex, z: number): void {
    let pool: ActiveObstacle[];
    if (type === 'LOW_BARRIER') pool = this.lowBarrierPool;
    else if (type === 'TALL_BLOCK') pool = this.tallBlockPool;
    else if (type === 'ROLLING_MATKA') pool = this.rollingMatkaPool;
    else if (type === 'OVERHEAD_BEAM') pool = this.overheadBeamPool;
    else if (type === 'GHAT_STEPS') pool = this.ghatStepsPool;
    else if (type === 'BRIDGE_ROPE') pool = this.bridgeRopePool;
    else if (type === 'PRAYER_FLAG_GALE') pool = this.prayerFlagGalePool;
    else return;

    if (pool.length === 0) return;

    const obs = pool.pop()!;
    const posX = RoadView.LANE_X[lane];
    obs.entity.setPosition(posX, 0, z);
    obs.entity.enabled = true;
    obs.lane = lane;
    obs.z = z;
    obs.hasTriggeredCollision = false;
    obs.hasTriggeredSkillCheck = false;
    obs.rollPitch = 0;
    obs.rollSpeedZ = type === 'ROLLING_MATKA' ? -(1.8 + this.random() * 1.0) : 0;
    obs.dustTimer = 0;

    // Mutate pre-allocated AABB bounds in-place
    const b = obs.bounds;
    if (type === 'OVERHEAD_BEAM') {
      b.minX = posX - 0.95;
      b.maxX = posX + 0.95;
      b.minY = 0.72; // Player standing is 0..1.0 (hits!). Sliding player is 0..0.38 (clears!).
      b.maxY = 1.65;
      b.minZ = z - 0.35;
      b.maxZ = z + 0.35;
    } else if (type === 'BRIDGE_ROPE') {
      b.minX = posX - 0.95;
      b.maxX = posX + 0.95;
      b.minY = 0.72; // Suspension bridge cable hanging down to 0.72m; sliding clears!
      b.maxY = 1.65;
      b.minZ = z - 0.35;
      b.maxZ = z + 0.35;
    } else if (type === 'PRAYER_FLAG_GALE') {
      b.minX = posX - 0.95;
      b.maxX = posX + 0.95;
      b.minY = 0.70; // Fluttering pennants down to 0.70m; sliding clears!
      b.maxY = 1.65;
      b.minZ = z - 0.35;
      b.maxZ = z + 0.35;
    } else if (type === 'GHAT_STEPS') {
      b.minX = posX - 0.85;
      b.maxX = posX + 0.85;
      b.minY = 0.0;
      b.maxY = 0.44; // Stepped boardwalk timber hurdle; jump reaches 1.6m clearing easily
      b.minZ = z - 0.35;
      b.maxZ = z + 0.35;
    } else {
      b.minX = posX - (type === 'ROLLING_MATKA' ? 0.45 : 0.75);
      b.maxX = posX + (type === 'ROLLING_MATKA' ? 0.45 : 0.75);
      b.minY = 0.0;
      b.maxY = type === 'LOW_BARRIER' ? 0.45 : type === 'ROLLING_MATKA' ? 0.72 : 2.2;
      b.minZ = z - (type === 'LOW_BARRIER' ? 0.2 : type === 'ROLLING_MATKA' ? 0.38 : 0.4);
      b.maxZ = z + (type === 'LOW_BARRIER' ? 0.2 : type === 'ROLLING_MATKA' ? 0.38 : 0.4);
    }

    this.activeObstacles.push(obs);
  }

  public activateSlidingGate(lane: LaneIndex, z: number, slideCenter: number): void {
    if (this.slidingGatePool.length === 0) return;

    const obs = this.slidingGatePool.pop()!;
    obs.entity.setPosition(slideCenter, 0, z);
    obs.entity.enabled = true;
    obs.lane = lane;
    obs.z = z;
    obs.hasTriggeredCollision = false;
    obs.hasTriggeredSkillCheck = false;
    obs.slideCenter = slideCenter;
    obs.slideX = slideCenter;
    obs.slidePhase = this.random() * Math.PI * 2;
    obs.slideSpeed = 2.0 + this.random() * 0.8;
    obs.slideAmplitude = 1.05;

    // Enable ground guide runner rail
    if (obs.guideTrackEntity) {
      obs.guideTrackEntity.setPosition(slideCenter, 0.015, z);
      obs.guideTrackEntity.enabled = true;
    }

    const b = obs.bounds;
    b.minX = slideCenter - 0.74;
    b.maxX = slideCenter + 0.74;
    b.minY = 0.0;
    b.maxY = 2.3;
    b.minZ = z - 0.25;
    b.maxZ = z + 0.25;

    this.activeObstacles.push(obs);
  }

  public activatePuluKisi(z: number, dir: number): void {
    if (this.puluKisiPool.length === 0) return;

    const obs = this.puluKisiPool.pop()!;
    const startX = dir > 0 ? -7.5 : 7.5;
    obs.entity.setPosition(startX, 0, z);
    // Face direction of travel:
    // Left-to-right (dir = +1) faces +X (Euler angles [0, -90, 0])
    // Right-to-left (dir = -1) faces -X (Euler angles [0, 90, 0])
    obs.entity.setLocalEulerAngles(0, dir > 0 ? -90 : 90, 0);
    obs.entity.enabled = true;
    obs.lane = 0; // Crossroad hazard sweeps across all three lanes
    obs.z = z;
    obs.hasTriggeredCollision = false;
    obs.hasTriggeredSkillCheck = false;
    obs.slideX = startX;
    obs.slideSpeed = 5.4;
    obs.puluDirection = dir;
    obs.puluIsDashing = false;
    obs.puluAnimTime = 0;
    obs.puluBellTimer = 0;
    obs.puluStepTimer = 0;
    obs.dustTimer = 0;

    const b = obs.bounds;
    b.minX = startX - 1.05;
    b.maxX = startX + 1.05;
    b.minY = 0.0;
    b.maxY = 1.85;
    b.minZ = z - 0.65;
    b.maxZ = z + 0.65;

    this.activeObstacles.push(obs);
  }

  // Check 3D AABB intersection with player
  public checkCollisions(playerBounds: BoundingBox3D, distance: number): CollisionInfo | null {
    for (const obs of this.activeObstacles) {
      if (obs.hasTriggeredCollision) continue;

      const ob = obs.bounds;
      const overlaps =
        playerBounds.minX <= ob.maxX &&
        playerBounds.maxX >= ob.minX &&
        playerBounds.minY <= ob.maxY &&
        playerBounds.maxY >= ob.minY &&
        playerBounds.minZ <= ob.maxZ &&
        playerBounds.maxZ >= ob.minZ;

      if (overlaps) {
        obs.hasTriggeredCollision = true;
        return {
          collided: true,
          obstacleType: obs.type,
          lane: obs.lane,
          distance,
        };
      }
    }
    return null;
  }

  /**
   * Check skill events: Clean vaults, clean slides, wind gust evasion, near-miss brush dodges, sliding gate slips
   */
  public checkSkills(
    playerX: number,
    playerY: number,
    playerZ: number,
    isJumping: boolean,
    isSliding = false
  ): { type: SkillCalloutType; obstacleType: ObstacleType; lateralDir: number } | null {
    for (const obs of this.activeObstacles) {
      if (obs.hasTriggeredCollision || obs.hasTriggeredSkillCheck) continue;

      const dz = playerZ - obs.z;
      // Evaluate only within tight crossing threshold: player right next to or just past obstacle
      if (Math.abs(dz) > 0.65) continue;

      // 1. CLEAN VAULT: Vault cleanly over Low Hurdle, Rolling Pot, or Ghat Boardwalk Steps
      if (obs.type === 'LOW_BARRIER' || obs.type === 'ROLLING_MATKA' || obs.type === 'GHAT_STEPS') {
        const obsX = RoadView.LANE_X[obs.lane];
        const dx = Math.abs(playerX - obsX);
        if (dx <= 0.45 && isJumping && playerY >= 0.92) {
          obs.hasTriggeredSkillCheck = true;
          if (obs.type === 'GHAT_STEPS' && this.onWaterSplashCb) {
            this.onWaterSplashCb(obsX, 0.05, obs.z);
          }
          return { type: 'CLEAN_VAULT', obstacleType: obs.type, lateralDir: 0 };
        }
      }

      // 2. CLEAN SLIDE: Slid cleanly under Overhead Timber Beam or Suspension Bridge Cable
      if (obs.type === 'OVERHEAD_BEAM' || obs.type === 'BRIDGE_ROPE') {
        const obsX = RoadView.LANE_X[obs.lane];
        const dx = Math.abs(playerX - obsX);
        if (dx <= 0.45 && isSliding) {
          obs.hasTriggeredSkillCheck = true;
          return { type: 'CLEAN_SLIDE', obstacleType: obs.type, lateralDir: 0 };
        }
      }

      // 3. WIND GUST EVADED: Ducked beneath mountain pass Lung-ta prayer flags in Himalayan gale
      if (obs.type === 'PRAYER_FLAG_GALE') {
        const obsX = RoadView.LANE_X[obs.lane];
        const dx = Math.abs(playerX - obsX);
        if (dx <= 0.45 && isSliding) {
          obs.hasTriggeredSkillCheck = true;
          if (this.onWindGaleCb) {
            this.onWindGaleCb(obsX, 1.1, obs.z);
          }
          return { type: 'WIND_GUST_EVADED', obstacleType: obs.type, lateralDir: 0 };
        }
      }

      // 4. GATE EVADED: Slipping closely past a dynamic sliding gate
      if (obs.type === 'SLIDING_GATE') {
        const dxGate = Math.abs(playerX - obs.slideX);
        if (dxGate >= 0.74 && dxGate <= 1.45) {
          obs.hasTriggeredSkillCheck = true;
          const lateralDir = Math.sign(playerX - obs.slideX) || 1;
          return { type: 'GATE_EVADED', obstacleType: obs.type, lateralDir };
        }
      }

      // 5. CLOSE CALL: Brushing adjacent hazard lane within close lateral proximity
      if (
        obs.type === 'TALL_BLOCK' ||
        obs.type === 'LOW_BARRIER' ||
        obs.type === 'ROLLING_MATKA' ||
        obs.type === 'OVERHEAD_BEAM' ||
        obs.type === 'GHAT_STEPS' ||
        obs.type === 'BRIDGE_ROPE' ||
        obs.type === 'PRAYER_FLAG_GALE'
      ) {
        const obsX = RoadView.LANE_X[obs.lane];
        const dx = Math.abs(playerX - obsX);
        if (dx >= 0.70 && dx <= 1.38 && (!isJumping || playerY < 0.92)) {
          obs.hasTriggeredSkillCheck = true;
          const lateralDir = Math.sign(playerX - obsX) || 1;
          return { type: 'CLOSE_CALL', obstacleType: obs.type, lateralDir };
        }
      }

      // 6. PULU KISI EVADED: Weaving closely past the lively festival white elephant
      if (obs.type === 'PULU_KISI_CROSSING') {
        const dx = Math.abs(playerX - obs.slideX);
        if (dx >= 0.85 && dx <= 1.95) {
          obs.hasTriggeredSkillCheck = true;
          const lateralDir = Math.sign(playerX - obs.slideX) || 1;
          return { type: 'PULU_KISI_EVADED', obstacleType: obs.type, lateralDir };
        }
      }
    }
    return null;
  }

  public getActiveObstacles(): ActiveObstacle[] {
    return this.activeObstacles;
  }

  public getActiveCount(): number {
    return this.activeObstacles.length;
  }

  public getPoolCounts(): {
    lowAvailable: number;
    tallAvailable: number;
    matkaAvailable: number;
    gateAvailable: number;
    beamAvailable: number;
    ghatAvailable: number;
    ropeAvailable: number;
    flagAvailable: number;
    puluKisiAvailable: number;
    active: number;
  } {
    return {
      lowAvailable: this.lowBarrierPool.length,
      tallAvailable: this.tallBlockPool.length,
      matkaAvailable: this.rollingMatkaPool.length,
      gateAvailable: this.slidingGatePool.length,
      beamAvailable: this.overheadBeamPool.length,
      ghatAvailable: this.ghatStepsPool.length,
      ropeAvailable: this.bridgeRopePool.length,
      flagAvailable: this.prayerFlagGalePool.length,
      puluKisiAvailable: this.puluKisiPool.length,
      active: this.activeObstacles.length,
    };
  }

  public getSeed(): number {
    return this.seed;
  }
}
