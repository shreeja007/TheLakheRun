import {
  Application,
  Color,
  Entity,
  GraphNode,
  StandardMaterial,
  Texture,
  Vec2,
} from 'playcanvas';
import { batchArticulatedModel } from '../game/Batching';
import { StreetArt } from './StreetArt';
import { BiomeType, BiomeConfig } from '../types';

export const BIOME_CONFIGS: Record<BiomeType, BiomeConfig> = {
  DURBAR_ALLEY: {
    type: 'DURBAR_ALLEY',
    name: 'Durbar Royal Alley',
    tagline: 'Ancient Red Brick Sanctuary',
    fogColor: { r: 0.08, g: 0.10, b: 0.18 },
    clearColor: { r: 0.08, g: 0.10, b: 0.18 },
    sunColor: { r: 1.0, g: 0.88, b: 0.72 },
    sunIntensity: 1.45,
    ambientColor: { r: 0.38, g: 0.38, b: 0.58 },
    fogStart: 40,
    fogEnd: 140,
  },
  RIVER_CAUSEWAY: {
    type: 'RIVER_CAUSEWAY',
    name: 'Sacred River Causeway',
    tagline: 'Ghat Bridge & Prayer Flags',
    fogColor: { r: 0.06, g: 0.15, b: 0.20 },
    clearColor: { r: 0.07, g: 0.16, b: 0.22 },
    sunColor: { r: 0.92, g: 0.96, b: 1.0 },
    sunIntensity: 1.55,
    ambientColor: { r: 0.28, g: 0.44, b: 0.52 },
    fogStart: 45,
    fogEnd: 155,
  },
  TEMPLE_HILL: {
    type: 'TEMPLE_HILL',
    name: 'Himalayan Temple Hill',
    tagline: 'Mountain Pass & Bronze Wheels',
    fogColor: { r: 0.18, g: 0.11, b: 0.09 },
    clearColor: { r: 0.18, g: 0.11, b: 0.09 },
    sunColor: { r: 1.0, g: 0.78, b: 0.55 },
    sunIntensity: 1.50,
    ambientColor: { r: 0.45, g: 0.30, b: 0.25 },
    fogStart: 38,
    fogEnd: 145,
  },
};

interface RoadTileData {
  root: Entity;
  durbarRoot: Entity;
  riverRoot: Entity;
  hillRoot: Entity;
  gatewayRoot: Entity;
  prayerWheels: Entity[];
  waterPlane?: Entity;
}

export class RoadView {
  public static readonly LANE_WIDTH = 2.0;
  public static readonly LANE_X: Record<number, number> = {
    [-1]: -2.0,
    [0]: 0.0,
    [1]: 2.0,
  };

  public static readonly BIOME_LENGTH = 140; // 140m per biome
  public static readonly TOTAL_CYCLE_LENGTH = 420; // 420m full 3-biome loop

  private tiles: RoadTileData[] = [];
  private readonly TILE_LENGTH = 30;
  // T038: 14 recycling tiles = 420 m = exactly one Durbar/River/Hill cycle (TOTAL_CYCLE_LENGTH).
  // A recycled tile jumps 420 m ahead, so it keeps the same biome and gateway and nothing is enabled
  // or disabled mid-run. Toggling batched scenery forces a full road re-batch (a frame hitch); with
  // 9 tiles (270 m) almost every recycle did that. Tiles past the 160 m far clip are not drawn.
  private readonly TILE_COUNT = 14;
  // The two tiles behind the start line (z = 60 and 30) always show Durbar for the intro camera.
  // They never recycle, so they never switch scenery either.
  private readonly INTRO_TILE_COUNT = 2;
  private streetArt!: StreetArt;
  private promenadeFigures: Entity[] = [];
  private rootEntity: Entity;
  private backdropRoot!: Entity;
  private app: Application;
  private animTime = 0;
  private bellSwingTime = 0;
  private bellSwingAmplitude = 0;

  // Cached materials for zero-allocation reuse
  private roadMat!: StandardMaterial;
  private roadMatSandstone!: StandardMaterial;
  private roadMatMoss!: StandardMaterial;
  private stoneJointMat!: StandardMaterial;
  private curbMat!: StandardMaterial;
  private curbLipMat!: StandardMaterial;
  private brickMat1!: StandardMaterial;
  private brickMat2!: StandardMaterial;
  private timberMat!: StandardMaterial;
  private windowMat!: StandardMaterial;
  private roofMat!: StandardMaterial;
  private lanternMat!: StandardMaterial;
  private ropeMat!: StandardMaterial;
  private pennantMats: StandardMaterial[] = [];

  // Biome 2: River Causeway materials
  private stoneBalustradeMat!: StandardMaterial;
  private stoneLionMat!: StandardMaterial;
  private waterMat!: StandardMaterial;
  private waterFoamMat!: StandardMaterial;
  private bridgePierMat!: StandardMaterial;
  private distantRidgeMat!: StandardMaterial;
  private prayerFlagMats: StandardMaterial[] = [];

  // Biome 3: Temple Hill materials
  private mossStoneMat!: StandardMaterial;
  private pineTrunkMat!: StandardMaterial;
  private pineNeedleMat1!: StandardMaterial;
  private pineNeedleMat2!: StandardMaterial;
  private bronzeWheelMat!: StandardMaterial;
  private incenseEmbersMat!: StandardMaterial;
  private goldGajurMat!: StandardMaterial;
  private boulderMat!: StandardMaterial;

  // Arch Lantern & Details
  private archLanternMat!: StandardMaterial;
  private archCrestMat!: StandardMaterial;
  private batchGroupId?: number;

  // --- T020: Background Procession Spectacle (The Raths of Kumari, Bhairab & Ganesh) ---
  private processionRoot!: Entity;
  private rathKumariRoot!: Entity;
  private rathBhairabRoot!: Entity;
  private rathGaneshRoot!: Entity;
  private rathKumariWheels: Entity[] = [];
  private rathBhairabWheels: Entity[] = [];
  private rathGaneshWheels: Entity[] = [];
  private processionZ = -35.0;
  private readonly PROCESSION_SPEED = 3.5; // 3.5 m/s ceremonial procession pace
  private processionWheelPitch = 0;
  private processionAudioTimer = 0;
  private onDistantProcessionAudioCb?: (distance: number) => void;

  constructor(app: Application) {
    this.app = app;
    this.rootEntity = new Entity('RoadRoot');
    app.root.addChild(this.rootEntity);

    this.initMaterials();
    this.createRoadTiles();
    this.buildDurbarBackdrop();
    this.buildProcessionBoulevard();
    this.initBatching();

    // T040–T044: everyday street models on the recycling Durbar tiles (never the fixed intro tiles,
    // whose look the home screen depends on).
    const durbarTiles = this.tiles
      .map((tile, index) => ({ index, durbarRoot: tile.durbarRoot }))
      .filter(({ index, durbarRoot }) => index >= this.INTRO_TILE_COUNT && durbarRoot.enabled);
    this.streetArt = new StreetArt(app, durbarTiles, this.promenadeFigures);
  }

  private initMaterials(): void {
    // 1. Weathered Flagstone Causeway Palettes (3-Tone Stone Texture Variation)
    this.roadMat = new StandardMaterial();
    this.roadMat.diffuse = new Color(0.20, 0.21, 0.24); // Weathered slate granite
    this.roadMat.gloss = 0.22;
    this.roadMat.update();

    this.roadMatSandstone = new StandardMaterial();
    this.roadMatSandstone.diffuse = new Color(0.26, 0.21, 0.19); // Terracotta sandstone pavers
    this.roadMatSandstone.gloss = 0.20;
    this.roadMatSandstone.update();

    this.roadMatMoss = new StandardMaterial();
    this.roadMatMoss.diffuse = new Color(0.20, 0.24, 0.20); // Moss-tinted alpine pavers
    this.roadMatMoss.gloss = 0.18;
    this.roadMatMoss.update();

    // Dark flagstone joints (chiseled mortar lines between paving slabs)
    this.stoneJointMat = new StandardMaterial();
    this.stoneJointMat.diffuse = new Color(0.11, 0.12, 0.14);
    this.stoneJointMat.gloss = 0.1;
    this.stoneJointMat.update();

    // Carved stone curb
    this.curbMat = new StandardMaterial();
    this.curbMat.diffuse = new Color(0.32, 0.22, 0.18); // Terracotta stone border
    this.curbMat.gloss = 0.2;
    this.curbMat.update();

    this.curbLipMat = new StandardMaterial();
    this.curbLipMat.diffuse = new Color(0.24, 0.16, 0.12);
    this.curbLipMat.gloss = 0.15;
    this.curbLipMat.update();

    // 2. Durbar Alley Architecture
    this.brickMat1 = new StandardMaterial();
    this.brickMat1.diffuse = new Color(0.52, 0.22, 0.13); // Terracotta Red
    this.brickMat1.gloss = 0.2;
    this.brickMat1.update();

    this.brickMat2 = new StandardMaterial();
    this.brickMat2.diffuse = new Color(0.43, 0.18, 0.11); // Aged Red Clay
    this.brickMat2.gloss = 0.2;
    this.brickMat2.update();

    this.timberMat = new StandardMaterial();
    this.timberMat.diffuse = new Color(0.18, 0.11, 0.08); // Carved dark Sal wood
    this.timberMat.gloss = 0.25;
    this.timberMat.update();

    this.windowMat = new StandardMaterial();
    this.windowMat.diffuse = new Color(0.85, 0.48, 0.08); // Candlelit interior glow
    this.windowMat.emissive = new Color(0.48, 0.24, 0.04);
    this.windowMat.gloss = 0.4;
    this.windowMat.update();

    this.roofMat = new StandardMaterial();
    this.roofMat.diffuse = new Color(0.36, 0.14, 0.09); // Nepalese clay tile
    this.roofMat.gloss = 0.15;
    this.roofMat.update();

    this.lanternMat = new StandardMaterial();
    this.lanternMat.diffuse = new Color(0.96, 0.68, 0.15);
    this.lanternMat.emissive = new Color(0.7, 0.45, 0.1);
    this.lanternMat.gloss = 0.5;
    this.lanternMat.update();

    this.ropeMat = new StandardMaterial();
    this.ropeMat.diffuse = new Color(0.35, 0.25, 0.16);
    this.ropeMat.gloss = 0.1;
    this.ropeMat.update();

    const pennantMatSaffron = new StandardMaterial();
    pennantMatSaffron.diffuse = new Color(0.96, 0.62, 0.08);
    pennantMatSaffron.gloss = 0.2;
    pennantMatSaffron.update();

    const pennantMatCrimson = new StandardMaterial();
    pennantMatCrimson.diffuse = new Color(0.82, 0.12, 0.12);
    pennantMatCrimson.gloss = 0.2;
    pennantMatCrimson.update();

    const pennantMatTeal = new StandardMaterial();
    pennantMatTeal.diffuse = new Color(0.08, 0.55, 0.52);
    pennantMatTeal.gloss = 0.2;
    pennantMatTeal.update();

    const pennantMatCream = new StandardMaterial();
    pennantMatCream.diffuse = new Color(0.94, 0.92, 0.86);
    pennantMatCream.gloss = 0.2;
    pennantMatCream.update();

    this.pennantMats = [pennantMatSaffron, pennantMatCrimson, pennantMatTeal, pennantMatCream];

    // 3. Biome 2: River Causeway & Bridge
    this.stoneBalustradeMat = new StandardMaterial();
    this.stoneBalustradeMat.diffuse = new Color(0.32, 0.33, 0.36); // Weathered bridge parapet
    this.stoneBalustradeMat.gloss = 0.2;
    this.stoneBalustradeMat.update();

    this.stoneLionMat = new StandardMaterial();
    this.stoneLionMat.diffuse = new Color(0.40, 0.41, 0.44); // Carved Chhepu / Singha lion
    this.stoneLionMat.gloss = 0.22;
    this.stoneLionMat.update();

    this.waterMat = new StandardMaterial();
    this.waterMat.diffuse = new Color(0.05, 0.17, 0.22); // River valley water
    this.waterMat.gloss = 0.88;
    this.waterMat.update();

    this.waterFoamMat = new StandardMaterial();
    this.waterFoamMat.diffuse = new Color(0.70, 0.88, 0.95);
    this.waterFoamMat.emissive = new Color(0.20, 0.35, 0.40);
    this.waterFoamMat.gloss = 0.4;
    this.waterFoamMat.update();

    this.bridgePierMat = new StandardMaterial();
    this.bridgePierMat.diffuse = new Color(0.18, 0.19, 0.21);
    this.bridgePierMat.gloss = 0.15;
    this.bridgePierMat.update();

    this.distantRidgeMat = new StandardMaterial();
    this.distantRidgeMat.diffuse = new Color(0.12, 0.18, 0.22);
    this.distantRidgeMat.gloss = 0.1;
    this.distantRidgeMat.update();

    // 5-Color Tibetan Prayer Flags (Lung-ta: Blue, White, Red, Green, Yellow)
    const pfColors = [
      new Color(0.12, 0.45, 0.85), // Blue (Sky)
      new Color(0.92, 0.92, 0.90), // White (Air)
      new Color(0.85, 0.18, 0.15), // Red (Fire)
      new Color(0.12, 0.62, 0.28), // Green (Water)
      new Color(0.92, 0.75, 0.12), // Yellow (Earth)
    ];
    this.prayerFlagMats = pfColors.map((col) => {
      const m = new StandardMaterial();
      m.diffuse = col;
      m.gloss = 0.15;
      m.update();
      return m;
    });

    // 4. Biome 3: Himalayan Temple Hill
    this.mossStoneMat = new StandardMaterial();
    this.mossStoneMat.diffuse = new Color(0.24, 0.28, 0.20); // Mossy stone retaining walls
    this.mossStoneMat.gloss = 0.18;
    this.mossStoneMat.update();

    this.pineTrunkMat = new StandardMaterial();
    this.pineTrunkMat.diffuse = new Color(0.20, 0.13, 0.08); // Deodar pine bark
    this.pineTrunkMat.gloss = 0.15;
    this.pineTrunkMat.update();

    this.pineNeedleMat1 = new StandardMaterial();
    this.pineNeedleMat1.diffuse = new Color(0.11, 0.24, 0.14); // Deep evergreen needle
    this.pineNeedleMat1.gloss = 0.2;
    this.pineNeedleMat1.update();

    this.pineNeedleMat2 = new StandardMaterial();
    this.pineNeedleMat2.diffuse = new Color(0.15, 0.30, 0.18); // Alpine pine needle
    this.pineNeedleMat2.gloss = 0.2;
    this.pineNeedleMat2.update();

    this.bronzeWheelMat = new StandardMaterial();
    this.bronzeWheelMat.diffuse = new Color(0.82, 0.62, 0.18); // Gilded bronze prayer wheel
    this.bronzeWheelMat.gloss = 0.68;
    this.bronzeWheelMat.update();

    this.incenseEmbersMat = new StandardMaterial();
    this.incenseEmbersMat.diffuse = new Color(1.0, 0.45, 0.05);
    this.incenseEmbersMat.emissive = new Color(0.7, 0.25, 0.02);
    this.incenseEmbersMat.gloss = 0.4;
    this.incenseEmbersMat.update();

    this.boulderMat = new StandardMaterial();
    this.boulderMat.diffuse = new Color(0.28, 0.29, 0.27);
    this.boulderMat.gloss = 0.15;
    this.boulderMat.update();

    // 5. Ceremonial Torana Arch Golden Gajur & Lanterns
    this.goldGajurMat = new StandardMaterial();
    this.goldGajurMat.diffuse = new Color(0.96, 0.78, 0.22);
    this.goldGajurMat.emissive = new Color(0.35, 0.25, 0.05);
    this.goldGajurMat.gloss = 0.7;
    this.goldGajurMat.update();

    this.archLanternMat = new StandardMaterial();
    this.archLanternMat.diffuse = new Color(1.0, 0.74, 0.18);
    this.archLanternMat.emissive = new Color(0.85, 0.52, 0.1);
    this.archLanternMat.gloss = 0.6;
    this.archLanternMat.update();

    this.archCrestMat = new StandardMaterial();
    this.archCrestMat.diffuse = new Color(0.85, 0.65, 0.25);
    this.archCrestMat.gloss = 0.4;
    this.archCrestMat.update();

    this.loadCartoonTextures();
  }

  private initBatching(): void {
    if (this.app.batcher) {
      const group = this.app.batcher.addGroup('RoadBatchGroup', true, 1000); // > 420 m runway: one batch per material
      if (group) {
        this.batchGroupId = group.id;
        this.applyBatchGroup(this.rootEntity, group.id);
        this.app.batcher.generate([group.id]);
      }
    }
  }

  private applyBatchGroup(node: GraphNode, groupId: number): void {
    const entity = node as Entity;
    if (entity.render) {
      entity.render.batchGroupId = groupId;
    }
    for (const child of node.children) {
      this.applyBatchGroup(child, groupId);
    }
  }

  private createRoadTiles(): void {
    const roadWidth = RoadView.LANE_WIDTH * 3 + 0.8; // 6.8 units wide

    for (let i = 0; i < this.INTRO_TILE_COUNT + this.TILE_COUNT; i++) {
      const tile = new Entity(`RoadTile_${i}`);
      const zPos = (2 - i) * this.TILE_LENGTH;
      tile.setPosition(0, 0, zPos);

      // --- BASE FLAGSTONE CAUSEWAY (3-Tone Stone Slab Paving) ---
      // Center Lane Flagstone (Charcoal Granite)
      const centerSlab = new Entity('CenterSlab');
      centerSlab.addComponent('render', { type: 'plane' });
      centerSlab.setLocalScale(RoadView.LANE_WIDTH, 1, this.TILE_LENGTH);
      centerSlab.setLocalPosition(0, 0, -this.TILE_LENGTH / 2);
      if (centerSlab.render) centerSlab.render.material = this.roadMat;
      tile.addChild(centerSlab);

      // Left Lane Flagstone (Warm Terracotta Sandstone)
      const leftSlab = new Entity('LeftSlab');
      leftSlab.addComponent('render', { type: 'plane' });
      leftSlab.setLocalScale(RoadView.LANE_WIDTH + 0.4, 1, this.TILE_LENGTH);
      leftSlab.setLocalPosition(-RoadView.LANE_WIDTH - 0.2, 0, -this.TILE_LENGTH / 2);
      if (leftSlab.render) leftSlab.render.material = this.roadMatSandstone;
      tile.addChild(leftSlab);

      // Right Lane Flagstone (Warm Terracotta Sandstone)
      const rightSlab = new Entity('RightSlab');
      rightSlab.addComponent('render', { type: 'plane' });
      rightSlab.setLocalScale(RoadView.LANE_WIDTH + 0.4, 1, this.TILE_LENGTH);
      rightSlab.setLocalPosition(RoadView.LANE_WIDTH + 0.2, 0, -this.TILE_LENGTH / 2);
      if (rightSlab.render) rightSlab.render.material = this.roadMatSandstone;
      tile.addChild(rightSlab);

      // Longitudinal carved stone joint strips dividing lanes (X = -1.0 and X = +1.0)
      const jointLeft = new Entity('JointL');
      jointLeft.addComponent('render', { type: 'plane' });
      jointLeft.setLocalScale(0.06, 1, this.TILE_LENGTH);
      jointLeft.setLocalPosition(-RoadView.LANE_WIDTH / 2, 0.003, -this.TILE_LENGTH / 2);
      if (jointLeft.render) jointLeft.render.material = this.stoneJointMat;
      tile.addChild(jointLeft);

      const jointRight = new Entity('JointR');
      jointRight.addComponent('render', { type: 'plane' });
      jointRight.setLocalScale(0.06, 1, this.TILE_LENGTH);
      jointRight.setLocalPosition(RoadView.LANE_WIDTH / 2, 0.003, -this.TILE_LENGTH / 2);
      if (jointRight.render) jointRight.render.material = this.stoneJointMat;
      tile.addChild(jointRight);

      // Transverse stone paving slab joints every 3m
      const numTransverse = Math.floor(this.TILE_LENGTH / 3.0);
      for (let t = 0; t < numTransverse; t++) {
        const tj = new Entity(`StoneTrans_${t}`);
        tj.addComponent('render', { type: 'plane' });
        tj.setLocalScale(roadWidth, 1, 0.05);
        tj.setLocalPosition(0, 0.004, -t * 3.0 - 1.5);
        if (tj.render) tj.render.material = this.stoneJointMat;
        tile.addChild(tj);
      }

      // Left curb (carved tiered stone blocks with decorative curb blocks)
      const leftCurb = new Entity('LeftCurb');
      leftCurb.addComponent('render', { type: 'box' });
      leftCurb.setLocalScale(0.35, 0.18, this.TILE_LENGTH);
      leftCurb.setLocalPosition(-(roadWidth / 2 + 0.175), 0.09, -this.TILE_LENGTH / 2);
      if (leftCurb.render) leftCurb.render.material = this.curbMat;
      tile.addChild(leftCurb);

      const leftCurbLip = new Entity('LeftCurbLip');
      leftCurbLip.addComponent('render', { type: 'box' });
      leftCurbLip.setLocalScale(0.12, 0.06, this.TILE_LENGTH);
      leftCurbLip.setLocalPosition(-(roadWidth / 2 + 0.06), 0.19, -this.TILE_LENGTH / 2);
      if (leftCurbLip.render) leftCurbLip.render.material = this.curbLipMat;
      tile.addChild(leftCurbLip);

      // Right curb
      const rightCurb = new Entity('RightCurb');
      rightCurb.addComponent('render', { type: 'box' });
      rightCurb.setLocalScale(0.35, 0.18, this.TILE_LENGTH);
      rightCurb.setLocalPosition(roadWidth / 2 + 0.175, 0.09, -this.TILE_LENGTH / 2);
      if (rightCurb.render) rightCurb.render.material = this.curbMat;
      tile.addChild(rightCurb);

      const rightCurbLip = new Entity('RightCurbLip');
      rightCurbLip.addComponent('render', { type: 'box' });
      rightCurbLip.setLocalScale(0.12, 0.06, this.TILE_LENGTH);
      rightCurbLip.setLocalPosition(roadWidth / 2 + 0.06, 0.19, -this.TILE_LENGTH / 2);
      if (rightCurbLip.render) rightCurbLip.render.material = this.curbLipMat;
      tile.addChild(rightCurbLip);

      // --- 1. BIOME 1 ROOT: DURBAR SQUARE ROYAL ALLEY ---
      const durbarRoot = new Entity(`DurbarRoot_${i}`);
      tile.addChild(durbarRoot);
      this.buildDurbarScenery(durbarRoot, i, roadWidth);

      // --- 2. BIOME 2 ROOT: SACRED RIVERBANK GHAT & STONE BRIDGE ---
      const riverRoot = new Entity(`RiverRoot_${i}`);
      tile.addChild(riverRoot);
      const waterEntity = this.buildRiverScenery(riverRoot, i, roadWidth);

      // --- 3. BIOME 3 ROOT: HIMALAYAN PINE & TEMPLE HILL PASS ---
      const hillRoot = new Entity(`HillRoot_${i}`);
      tile.addChild(hillRoot);
      const prayerWheels = this.buildHillScenery(hillRoot, i, roadWidth);

      // --- 4. CEREMONIAL TORANA GATEWAY ARCH ROOT ---
      const gatewayRoot = new Entity(`GatewayRoot_${i}`);
      tile.addChild(gatewayRoot);
      this.buildGatewayArch(gatewayRoot, i, roadWidth);

      this.rootEntity.addChild(tile);

      const tileData: RoadTileData = {
        root: tile,
        durbarRoot,
        riverRoot,
        hillRoot,
        gatewayRoot,
        prayerWheels,
        waterPlane: waterEntity,
      };

      this.tiles.push(tileData);
      this.refreshTileScenery(tileData, zPos);
    }
  }

  // --- BUILD BIOME 1: DURBAR SQUARE ROYAL ALLEY ---
  private buildDurbarScenery(root: Entity, tileIdx: number, roadWidth: number): void {
    const bldgDepth = 15.2; // Seamless continuous coverage across 30m tiles (2 x 15m + 0.2m overlap)
    const bldgWidth = 4.5;
    const wallDist = roadWidth / 2 + bldgWidth / 2 + 0.3;

    const buildFacade = (
      name: string,
      x: number,
      z: number,
      height: number,
      brickMat: StandardMaterial,
      facingLeft: boolean
    ) => {
      const bldg = new Entity(name);
      bldg.addComponent('render', { type: 'box' });
      bldg.setLocalScale(bldgWidth, height, bldgDepth);
      bldg.setLocalPosition(x, height / 2, z);
      if (bldg.render) bldg.render.material = brickMat;
      root.addChild(bldg);

      // Overhanging roof eave (Chhajja)
      const eave = new Entity(`${name}_Eave`);
      eave.addComponent('render', { type: 'box' });
      eave.setLocalScale(bldgWidth + 0.8, 0.35, bldgDepth + 0.4);
      eave.setLocalPosition(x, height + 0.175, z);
      if (eave.render) eave.render.material = this.roofMat;
      root.addChild(eave);

      // Upper floor carved wooden lattice windows (San Jhyā)
      const frontFacingX = facingLeft ? x + bldgWidth / 2 - 0.02 : x - bldgWidth / 2 + 0.02;
      const windowZOffsets = [-3.5, 3.5];
      for (const wz of windowZOffsets) {
        const winFrame = new Entity(`${name}_WinFrame_${wz}`);
        winFrame.addComponent('render', { type: 'box' });
        winFrame.setLocalScale(0.12, 1.4, 1.8);
        winFrame.setLocalPosition(frontFacingX, height * 0.65, z + wz);
        if (winFrame.render) winFrame.render.material = this.timberMat;
        root.addChild(winFrame);

        const winPane = new Entity(`${name}_WinPane_${wz}`);
        winPane.addComponent('render', { type: 'box' });
        winPane.setLocalScale(0.14, 1.1, 1.4);
        winPane.setLocalPosition(frontFacingX, height * 0.65, z + wz);
        if (winPane.render) winPane.render.material = this.windowMat;
        root.addChild(winPane);
      }

      // Street lantern post
      const postX = facingLeft ? x + bldgWidth / 2 - 0.25 : x - bldgWidth / 2 + 0.25;
      const post = new Entity(`${name}_Post`);
      post.addComponent('render', { type: 'box' });
      post.setLocalScale(0.12, 2.8, 0.12);
      post.setLocalPosition(postX, 1.4, z);
      if (post.render) post.render.material = this.timberMat;
      root.addChild(post);

      const lantern = new Entity(`${name}_Lantern`);
      lantern.addComponent('render', { type: 'box' });
      lantern.setLocalScale(0.32, 0.38, 0.32);
      lantern.setLocalPosition(postX, 2.7, z);
      if (lantern.render) lantern.render.material = this.lanternMat;
      root.addChild(lantern);
    };

    buildFacade(`BldgL1_${tileIdx}`, -wallDist, -7.5, 7.2, this.brickMat1, true);
    if (tileIdx % 2 !== 0) {
      this.buildFalchaPavilion(root, tileIdx, -wallDist, -22.5);
    } else {
      buildFacade(`BldgL2_${tileIdx}`, -wallDist, -22.5, 8.4, this.brickMat2, true);
    }

    // Right Side: Grand Open Durbar Plaza Terrace overlooking the Procession Boulevard
    this.buildRightPlazaTerrace(root, tileIdx, roadWidth);

    // Overhead Festive Torana Garlands
    this.buildToranaGarland(root, tileIdx, 0, -7.5);
    this.buildToranaGarland(root, tileIdx, 1, -22.5);

    // Distant Multi-Tiered Pagoda Temple Silhouette (Horizon Landmark towering over rooftops)
    this.buildDistantPagoda(root, tileIdx, -28.0);
  }

  private buildFalchaPavilion(root: Entity, tileIdx: number, x: number, z: number): void {
    const falchaRoot = new Entity(`Falcha_${tileIdx}`);
    falchaRoot.setLocalPosition(x, 0, z);
    root.addChild(falchaRoot);

    // Raised brick plinth
    const plinth = new Entity('FalchaPlinth');
    plinth.addComponent('render', { type: 'box' });
    plinth.setLocalScale(4.6, 0.45, 15.0);
    plinth.setLocalPosition(0, 0.225, 0);
    if (plinth.render) plinth.render.material = this.brickMat1;
    falchaRoot.addChild(plinth);

    // Back brick wall
    const backWall = new Entity('FalchaBackWall');
    backWall.addComponent('render', { type: 'box' });
    backWall.setLocalScale(0.5, 3.2, 15.0);
    backWall.setLocalPosition(2.0, 1.8, 0);
    if (backWall.render) backWall.render.material = this.brickMat2;
    falchaRoot.addChild(backWall);

    // Timber bench seating along rear wall
    const bench = new Entity('FalchaBench');
    bench.addComponent('render', { type: 'box' });
    bench.setLocalScale(0.8, 0.35, 14.6);
    bench.setLocalPosition(1.4, 0.62, 0);
    if (bench.render) bench.render.material = this.timberMat;
    falchaRoot.addChild(bench);

    // 5 Front Carved Timber Pillars supporting the roof
    const pillarZ = [-6.0, -3.0, 0, 3.0, 6.0];
    for (const pz of pillarZ) {
      const col = new Entity(`FalchaCol_${pz}`);
      col.addComponent('render', { type: 'box' });
      col.setLocalScale(0.18, 2.8, 0.18);
      col.setLocalPosition(-1.6, 1.85, pz);
      if (col.render) col.render.material = this.timberMat;
      falchaRoot.addChild(col);

      // Capital bracket
      const cap = new Entity(`FalchaCap_${pz}`);
      cap.addComponent('render', { type: 'box' });
      cap.setLocalScale(0.32, 0.15, 0.32);
      cap.setLocalPosition(-1.6, 3.25, pz);
      if (cap.render) cap.render.material = this.curbMat;
      falchaRoot.addChild(cap);
    }

    // Heavy roof lintel beam
    const lintel = new Entity('FalchaLintel');
    lintel.addComponent('render', { type: 'box' });
    lintel.setLocalScale(0.24, 0.24, 15.2);
    lintel.setLocalPosition(-1.6, 3.42, 0);
    if (lintel.render) lintel.render.material = this.timberMat;
    falchaRoot.addChild(lintel);

    // Sloped clay tile overhanging roof (Chhajja)
    const roof = new Entity('FalchaRoof');
    roof.addComponent('render', { type: 'box' });
    roof.setLocalScale(5.4, 0.38, 15.4);
    roof.setLocalPosition(0, 3.75, 0);
    roof.setLocalEulerAngles(0, 0, -8);
    if (roof.render) roof.render.material = this.roofMat;
    falchaRoot.addChild(roof);

    // Hanging warm bronze butter lamp inside
    const lamp = new Entity('FalchaLamp');
    lamp.addComponent('render', { type: 'box' });
    lamp.setLocalScale(0.3, 0.35, 0.3);
    lamp.setLocalPosition(0.2, 2.7, 0);
    if (lamp.render) lamp.render.material = this.lanternMat;
    falchaRoot.addChild(lamp);
  }

  private buildDistantPagoda(root: Entity, tileIdx: number, zOffset: number): void {
    const pagodaRoot = new Entity(`DistantPagoda_${tileIdx}`);
    // Flank placement behind alley rooftops (never blocks track or camera)
    const flankX = (tileIdx % 2 === 0) ? -19.5 : 19.5;
    pagodaRoot.setLocalPosition(flankX, 0, zOffset);
    root.addChild(pagodaRoot);

    // 3 Stepped Plinth Platforms (Nyatapola Temple style stepped terraces)
    const plinths = [
      { y: 0.35, scale: 12.0, h: 0.7 },
      { y: 1.05, scale: 10.0, h: 0.7 },
      { y: 1.75, scale: 8.2, h: 0.7 },
    ];
    for (let p = 0; p < plinths.length; p++) {
      const pl = new Entity(`PlinthStep_${p}`);
      pl.addComponent('render', { type: 'box' });
      pl.setLocalScale(plinths[p].scale, plinths[p].h, plinths[p].scale);
      pl.setLocalPosition(0, plinths[p].y, 0);
      if (pl.render) pl.render.material = this.curbMat;
      pagodaRoot.addChild(pl);
    }

    // 5 Tiered Overhanging Roofs (Nyatapola Temple Style)
    const tiers = [
      { y: 4.2, w: 8.6, h: 0.4 },
      { y: 6.8, w: 7.0, h: 0.4 },
      { y: 9.4, w: 5.6, h: 0.4 },
      { y: 12.0, w: 4.2, h: 0.4 },
      { y: 14.6, w: 2.8, h: 0.4 },
    ];

    for (let t = 0; t < tiers.length; t++) {
      const tier = tiers[t];
      const roof = new Entity(`RoofTier_${t}`);
      roof.addComponent('render', { type: 'box' });
      roof.setLocalScale(tier.w, tier.h, tier.w);
      roof.setLocalPosition(0, tier.y, 0);
      if (roof.render) roof.render.material = this.roofMat;
      pagodaRoot.addChild(roof);

      // Core masonry wall block between roofs
      const core = new Entity(`CoreTier_${t}`);
      core.addComponent('render', { type: 'box' });
      core.setLocalScale(tier.w * 0.65, 2.2, tier.w * 0.65);
      core.setLocalPosition(0, tier.y - 1.1, 0);
      if (core.render) core.render.material = this.brickMat1;
      pagodaRoot.addChild(core);
    }

    // Golden Gajur Pinnacle Spire atop 5th roof (reaching Y = 16.5m)
    const apex = new Entity('PagodaApex');
    apex.addComponent('render', { type: 'cone' });
    apex.setLocalScale(0.75, 2.0, 0.75);
    apex.setLocalPosition(0, 16.5, 0);
    if (apex.render) apex.render.material = this.goldGajurMat;
    pagodaRoot.addChild(apex);
  }

  private buildToranaGarland(root: Entity, tileIdx: number, garlandIdx: number, zOffset: number): void {
    const garlandRoot = new Entity(`Torana_${tileIdx}_${garlandIdx}`);
    garlandRoot.setLocalPosition(0, 0, zOffset);
    root.addChild(garlandRoot);

    const ropePoints = [
      { x: -3.45, y: 5.20 },
      { x: -1.72, y: 4.95 },
      { x:  0.00, y: 4.82 },
      { x:  1.72, y: 4.95 },
      { x:  3.45, y: 5.20 }
    ];

    for (let s = 0; s < ropePoints.length - 1; s++) {
      const p1 = ropePoints[s];
      const p2 = ropePoints[s + 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angleZ = Math.atan2(dy, dx) * (180 / Math.PI);

      const seg = new Entity(`RopeSeg_${s}`);
      seg.addComponent('render', { type: 'box' });
      seg.setLocalScale(len, 0.035, 0.035);
      seg.setLocalPosition(midX, midY, 0);
      seg.setLocalEulerAngles(0, 0, angleZ);
      if (seg.render) seg.render.material = this.ropeMat;
      garlandRoot.addChild(seg);
    }

    const pennantXCoords = [-2.8, -2.1, -1.4, -0.7, 0.0, 0.7, 1.4, 2.1, 2.8];
    for (let pIdx = 0; pIdx < pennantXCoords.length; pIdx++) {
      const px = pennantXCoords[pIdx];
      const py = 4.82 + 0.38 * Math.pow(px / 3.45, 2);
      const pennantMat = this.pennantMats[(pIdx + garlandIdx * 2 + tileIdx) % this.pennantMats.length];

      const pennant = new Entity(`Pennant_${pIdx}`);
      pennant.addComponent('render', { type: 'box' });
      pennant.setLocalScale(0.22, 0.36, 0.02);
      pennant.setLocalPosition(px, py - 0.18, 0);
      const tiltZ = (pIdx % 2 === 0 ? 3.5 : -3.5);
      pennant.setLocalEulerAngles(0, 0, tiltZ);
      if (pennant.render) pennant.render.material = pennantMat;
      garlandRoot.addChild(pennant);
    }
  }

  // --- BUILD BIOME 2: SACRED RIVERBANK GHAT & STONE BRIDGE ---
  private buildRiverScenery(root: Entity, tileIdx: number, roadWidth: number): Entity {
    const balustradeDist = roadWidth / 2 + 0.25; // X = ~3.65

    // 1. Wide shimmering river water plane below bridge
    const water = new Entity(`RiverWater_${tileIdx}`);
    water.addComponent('render', { type: 'plane' });
    water.setLocalScale(76.0, 1, this.TILE_LENGTH);
    water.setLocalPosition(0, -2.2, -this.TILE_LENGTH / 2);
    if (water.render) water.render.material = this.waterMat;
    root.addChild(water);

    // River Foam Strips along pier bases
    const foamL = new Entity('FoamL');
    foamL.addComponent('render', { type: 'plane' });
    foamL.setLocalScale(1.4, 1, this.TILE_LENGTH);
    foamL.setLocalPosition(-balustradeDist + 0.2, -2.18, -this.TILE_LENGTH / 2);
    if (foamL.render) foamL.render.material = this.waterFoamMat;
    root.addChild(foamL);

    const foamR = new Entity('FoamR');
    foamR.addComponent('render', { type: 'plane' });
    foamR.setLocalScale(1.4, 1, this.TILE_LENGTH);
    foamR.setLocalPosition(balustradeDist - 0.2, -2.18, -this.TILE_LENGTH / 2);
    if (foamR.render) foamR.render.material = this.waterFoamMat;
    root.addChild(foamR);

    // 2. Thick stone bridge piers descending into the water
    const pierL = new Entity(`BridgePierL_${tileIdx}`);
    pierL.addComponent('render', { type: 'box' });
    pierL.setLocalScale(0.85, 2.4, this.TILE_LENGTH);
    pierL.setLocalPosition(-balustradeDist + 0.2, -1.2, -this.TILE_LENGTH / 2);
    if (pierL.render) pierL.render.material = this.bridgePierMat;
    root.addChild(pierL);

    const pierR = new Entity(`BridgePierR_${tileIdx}`);
    pierR.addComponent('render', { type: 'box' });
    pierR.setLocalScale(0.85, 2.4, this.TILE_LENGTH);
    pierR.setLocalPosition(balustradeDist - 0.2, -1.2, -this.TILE_LENGTH / 2);
    if (pierR.render) pierR.render.material = this.bridgePierMat;
    root.addChild(pierR);

    // 3. Stepped Stone Ghat Landing Stairs descending into the river
    for (let st = 0; st < 3; st++) {
      const stepY = -0.6 - st * 0.5;
      const stepW = 0.45;

      const stepL = new Entity(`GhatStepL_${st}`);
      stepL.addComponent('render', { type: 'box' });
      stepL.setLocalScale(stepW, 0.2, this.TILE_LENGTH);
      stepL.setLocalPosition(-balustradeDist - 0.3 - st * stepW, stepY, -this.TILE_LENGTH / 2);
      if (stepL.render) stepL.render.material = this.curbMat;
      root.addChild(stepL);

      const stepR = new Entity(`GhatStepR_${st}`);
      stepR.addComponent('render', { type: 'box' });
      stepR.setLocalScale(stepW, 0.2, this.TILE_LENGTH);
      stepR.setLocalPosition(balustradeDist + 0.3 + st * stepW, stepY, -this.TILE_LENGTH / 2);
      if (stepR.render) stepR.render.material = this.curbMat;
      root.addChild(stepR);
    }

    // Glowing brass butter lamps (Diyo) on bottom Ghat stone steps
    for (const lampZ of [-10.0, -20.0]) {
      const lampL = new Entity(`GhatLampL_${lampZ}`);
      lampL.addComponent('render', { type: 'cylinder' });
      lampL.setLocalScale(0.25, 0.12, 0.25);
      lampL.setLocalPosition(-balustradeDist - 1.2, -1.54, lampZ);
      if (lampL.render) lampL.render.material = this.incenseEmbersMat;
      root.addChild(lampL);

      const lampR = new Entity(`GhatLampR_${lampZ}`);
      lampR.addComponent('render', { type: 'cylinder' });
      lampR.setLocalScale(0.25, 0.12, 0.25);
      lampR.setLocalPosition(balustradeDist + 1.2, -1.54, lampZ);
      if (lampR.render) lampR.render.material = this.incenseEmbersMat;
      root.addChild(lampR);
    }

    // 4. Low carved stone parapets / balustrades along both sides
    const parapetL = new Entity(`ParapetL_${tileIdx}`);
    parapetL.addComponent('render', { type: 'box' });
    parapetL.setLocalScale(0.28, 0.48, this.TILE_LENGTH);
    parapetL.setLocalPosition(-balustradeDist, 0.24, -this.TILE_LENGTH / 2);
    if (parapetL.render) parapetL.render.material = this.stoneBalustradeMat;
    root.addChild(parapetL);

    const parapetR = new Entity(`ParapetR_${tileIdx}`);
    parapetR.addComponent('render', { type: 'box' });
    parapetR.setLocalScale(0.28, 0.48, this.TILE_LENGTH);
    parapetR.setLocalPosition(balustradeDist, 0.24, -this.TILE_LENGTH / 2);
    if (parapetR.render) parapetR.render.material = this.stoneBalustradeMat;
    root.addChild(parapetR);

    // Balustrade square pillar posts every 6m with decorative lotus flower caps
    for (let p = 0; p < 5; p++) {
      const pZ = -p * 6.0 - 3.0;

      const postL = new Entity(`ParapetPostL_${p}`);
      postL.addComponent('render', { type: 'box' });
      postL.setLocalScale(0.36, 0.62, 0.36);
      postL.setLocalPosition(-balustradeDist, 0.31, pZ);
      if (postL.render) postL.render.material = this.stoneBalustradeMat;
      root.addChild(postL);

      const capL = new Entity(`PostCapL_${p}`);
      capL.addComponent('render', { type: 'cone' });
      capL.setLocalScale(0.28, 0.25, 0.28);
      capL.setLocalPosition(-balustradeDist, 0.74, pZ);
      if (capL.render) capL.render.material = this.curbMat;
      root.addChild(capL);

      const postR = new Entity(`ParapetPostR_${p}`);
      postR.addComponent('render', { type: 'box' });
      postR.setLocalScale(0.36, 0.62, 0.36);
      postR.setLocalPosition(balustradeDist, 0.31, pZ);
      if (postR.render) postR.render.material = this.stoneBalustradeMat;
      root.addChild(postR);

      const capR = new Entity(`PostCapR_${p}`);
      capR.addComponent('render', { type: 'cone' });
      capR.setLocalScale(0.28, 0.25, 0.28);
      capR.setLocalPosition(balustradeDist, 0.74, pZ);
      if (capR.render) capR.render.material = this.curbMat;
      root.addChild(capR);
    }

    // 5. Carved Stone Lion Guardians (Singha / Chhepu) on stepped plinths at Z = -7.5
    const buildStoneLion = (name: string, x: number, z: number, facingAngle: number) => {
      const lionRoot = new Entity(name);
      lionRoot.setLocalPosition(x, 0, z);
      lionRoot.setLocalEulerAngles(0, facingAngle, 0);

      // Tiered plinth
      const plinth = new Entity('Plinth');
      plinth.addComponent('render', { type: 'box' });
      plinth.setLocalScale(0.7, 0.45, 0.7);
      plinth.setLocalPosition(0, 0.225, 0);
      if (plinth.render) plinth.render.material = this.stoneBalustradeMat;
      lionRoot.addChild(plinth);

      // Lion torso
      const body = new Entity('Body');
      body.addComponent('render', { type: 'box' });
      body.setLocalScale(0.45, 0.55, 0.5);
      body.setLocalPosition(0, 0.7, 0);
      if (body.render) body.render.material = this.stoneLionMat;
      lionRoot.addChild(body);

      // Lion head with mane
      const head = new Entity('Head');
      head.addComponent('render', { type: 'box' });
      head.setLocalScale(0.38, 0.38, 0.38);
      head.setLocalPosition(0, 1.1, 0.08);
      if (head.render) head.render.material = this.stoneLionMat;
      lionRoot.addChild(head);

      root.addChild(lionRoot);
    };

    buildStoneLion(`LionL_${tileIdx}`, -balustradeDist - 0.25, -7.5, 90);
    buildStoneLion(`LionR_${tileIdx}`, balustradeDist + 0.25, -7.5, -90);

    // 6. Miniature Stone Chaityas (Ancient Stupas) at Z = -22.5
    const buildChaitya = (name: string, x: number, z: number) => {
      const chaityaRoot = new Entity(name);
      chaityaRoot.setLocalPosition(x, 0, z);

      // Base plinth
      const base = new Entity('Base');
      base.addComponent('render', { type: 'box' });
      base.setLocalScale(0.8, 0.35, 0.8);
      base.setLocalPosition(0, 0.175, 0);
      if (base.render) base.render.material = this.stoneBalustradeMat;
      chaityaRoot.addChild(base);

      // Stupa Garbha (cylinder dome)
      const dome = new Entity('Dome');
      dome.addComponent('render', { type: 'cylinder' });
      dome.setLocalScale(0.55, 0.45, 0.55);
      dome.setLocalPosition(0, 0.55, 0);
      if (dome.render) dome.render.material = this.stoneLionMat;
      chaityaRoot.addChild(dome);

      // Harmika (square top)
      const harmika = new Entity('Harmika');
      harmika.addComponent('render', { type: 'box' });
      harmika.setLocalScale(0.32, 0.22, 0.32);
      harmika.setLocalPosition(0, 0.88, 0);
      if (harmika.render) harmika.render.material = this.stoneBalustradeMat;
      chaityaRoot.addChild(harmika);

      // Spire cone (Chhatravali)
      const spire = new Entity('Spire');
      spire.addComponent('render', { type: 'cone' });
      spire.setLocalScale(0.24, 0.65, 0.24);
      spire.setLocalPosition(0, 1.25, 0);
      if (spire.render) spire.render.material = this.goldGajurMat;
      chaityaRoot.addChild(spire);

      root.addChild(chaityaRoot);
    };

    buildChaitya(`ChaityaL_${tileIdx}`, -balustradeDist - 0.25, -22.5);
    buildChaitya(`ChaityaR_${tileIdx}`, balustradeDist + 0.25, -22.5);

    // 7. Fluttering 5-Color Tibetan Prayer Flags (Lung-ta) diagonally across river
    this.buildPrayerFlagSpan(root, tileIdx, -15.0);

    // 8. Distant Himalayan Mountain Ridges (Parallax Framing)
    const ridgeL = new Entity(`RidgeL_${tileIdx}`);
    ridgeL.addComponent('render', { type: 'box' });
    ridgeL.setLocalScale(38.0, 18.0, this.TILE_LENGTH);
    ridgeL.setLocalPosition(-38.0, 7.0, -this.TILE_LENGTH / 2);
    ridgeL.setLocalEulerAngles(0, 0, -12);
    if (ridgeL.render) ridgeL.render.material = this.distantRidgeMat;
    root.addChild(ridgeL);

    const ridgeR = new Entity(`RidgeR_${tileIdx}`);
    ridgeR.addComponent('render', { type: 'box' });
    ridgeR.setLocalScale(38.0, 18.0, this.TILE_LENGTH);
    ridgeR.setLocalPosition(38.0, 7.0, -this.TILE_LENGTH / 2);
    ridgeR.setLocalEulerAngles(0, 0, 12);
    if (ridgeR.render) ridgeR.render.material = this.distantRidgeMat;
    root.addChild(ridgeR);

    return water;
  }

  private buildPrayerFlagSpan(root: Entity, tileIdx: number, zOffset: number): void {
    const flagRoot = new Entity(`PrayerFlags_${tileIdx}`);
    flagRoot.setLocalPosition(0, 0, zOffset);
    root.addChild(flagRoot);

    const poleL = new Entity('PoleL');
    poleL.addComponent('render', { type: 'cylinder' });
    poleL.setLocalScale(0.12, 6.2, 0.12);
    poleL.setLocalPosition(-4.2, 3.1, 0);
    if (poleL.render) poleL.render.material = this.timberMat;
    flagRoot.addChild(poleL);

    const poleR = new Entity('PoleR');
    poleR.addComponent('render', { type: 'cylinder' });
    poleR.setLocalScale(0.12, 6.2, 0.12);
    poleR.setLocalPosition(4.2, 3.1, 0);
    if (poleR.render) poleR.render.material = this.timberMat;
    flagRoot.addChild(poleR);

    const spanWidth = 8.4;
    const ropeSegments = 5;
    for (let s = 0; s < ropeSegments; s++) {
      const t1 = s / ropeSegments;
      const t2 = (s + 1) / ropeSegments;
      const x1 = -4.2 + t1 * spanWidth;
      const x2 = -4.2 + t2 * spanWidth;
      const y1 = 5.6 - 0.7 * Math.sin(t1 * Math.PI);
      const y2 = 5.6 - 0.7 * Math.sin(t2 * Math.PI);

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angleZ = Math.atan2(dy, dx) * (180 / Math.PI);

      const ropeSeg = new Entity(`FlagRope_${s}`);
      ropeSeg.addComponent('render', { type: 'box' });
      ropeSeg.setLocalScale(len, 0.03, 0.03);
      ropeSeg.setLocalPosition(midX, midY, 0);
      ropeSeg.setLocalEulerAngles(0, 0, angleZ);
      if (ropeSeg.render) ropeSeg.render.material = this.ropeMat;
      flagRoot.addChild(ropeSeg);

      const flagMat = this.prayerFlagMats[s % this.prayerFlagMats.length];
      const flagPennant = new Entity(`LungTaFlag_${s}`);
      flagPennant.addComponent('render', { type: 'box' });
      flagPennant.setLocalScale(0.25, 0.38, 0.02);
      flagPennant.setLocalPosition(midX, midY - 0.19, 0);
      const flutterZ = (s % 2 === 0 ? 5.0 : -5.0);
      flagPennant.setLocalEulerAngles(0, 0, flutterZ);
      if (flagPennant.render) flagPennant.render.material = flagMat;
      flagRoot.addChild(flagPennant);
    }
  }

  // --- BUILD BIOME 3: HIMALAYAN PINE & TEMPLE HILL PASS ---
  private buildHillScenery(root: Entity, tileIdx: number, roadWidth: number): Entity[] {
    const terraceDist = roadWidth / 2 + 0.8; // X = ~4.2
    const wheels: Entity[] = [];

    // 1. Mossy mountain stone retaining walls
    const wallL = new Entity(`HillWallL_${tileIdx}`);
    wallL.addComponent('render', { type: 'box' });
    wallL.setLocalScale(1.4, 2.2, this.TILE_LENGTH);
    wallL.setLocalPosition(-terraceDist - 0.7, 1.1, -this.TILE_LENGTH / 2);
    if (wallL.render) wallL.render.material = this.mossStoneMat;
    root.addChild(wallL);

    const wallR = new Entity(`HillWallR_${tileIdx}`);
    wallR.addComponent('render', { type: 'box' });
    wallR.setLocalScale(1.4, 2.6, this.TILE_LENGTH);
    wallR.setLocalPosition(terraceDist + 0.7, 1.3, -this.TILE_LENGTH / 2);
    if (wallR.render) wallR.render.material = this.mossStoneMat;
    root.addChild(wallR);

    // Upper hill terrace slopes
    const slopeL = new Entity(`HillSlopeL_${tileIdx}`);
    slopeL.addComponent('render', { type: 'box' });
    slopeL.setLocalScale(5.5, 4.5, this.TILE_LENGTH);
    slopeL.setLocalPosition(-terraceDist - 3.7, 2.25, -this.TILE_LENGTH / 2);
    if (slopeL.render) slopeL.render.material = this.mossStoneMat;
    root.addChild(slopeL);

    const slopeR = new Entity(`HillSlopeR_${tileIdx}`);
    slopeR.addComponent('render', { type: 'box' });
    slopeR.setLocalScale(5.5, 4.8, this.TILE_LENGTH);
    slopeR.setLocalPosition(terraceDist + 3.7, 2.4, -this.TILE_LENGTH / 2);
    if (slopeR.render) slopeR.render.material = this.mossStoneMat;
    root.addChild(slopeR);

    // Mountain Boulders / Rock Outcroppings
    const boulderCoords = [
      { x: -terraceDist - 1.8, z: -4.0, s: 1.2 },
      { x: -terraceDist - 2.2, z: -17.0, s: 1.5 },
      { x: terraceDist + 1.9, z: -8.0, s: 1.3 },
      { x: terraceDist + 2.4, z: -22.0, s: 1.4 },
    ];
    for (let bIdx = 0; bIdx < boulderCoords.length; bIdx++) {
      const bc = boulderCoords[bIdx];
      const boulder = new Entity(`Boulder_${bIdx}`);
      boulder.addComponent('render', { type: 'box' });
      boulder.setLocalScale(bc.s, bc.s * 0.8, bc.s);
      boulder.setLocalPosition(bc.x, bc.s * 0.4, bc.z);
      boulder.setLocalEulerAngles(25, 35 * bIdx, 15);
      if (boulder.render) boulder.render.material = this.boulderMat;
      root.addChild(boulder);
    }

    // 2. Towering Staggered Himalayan Deodar / Pine Trees (Varied scales & rotations)
    const buildPineTree = (name: string, x: number, z: number, scaleMult: number, rotY: number) => {
      const treeRoot = new Entity(name);
      treeRoot.setLocalPosition(x, 0, z);
      treeRoot.setLocalEulerAngles(0, rotY, 0);

      // Trunk
      const trunk = new Entity('Trunk');
      trunk.addComponent('render', { type: 'cylinder' });
      trunk.setLocalScale(0.38 * scaleMult, 6.8 * scaleMult, 0.38 * scaleMult);
      trunk.setLocalPosition(0, 3.4 * scaleMult, 0);
      if (trunk.render) trunk.render.material = this.pineTrunkMat;
      treeRoot.addChild(trunk);

      // 3-Tier Foliage Cones
      const cone1 = new Entity('Cone1');
      cone1.addComponent('render', { type: 'cone' });
      cone1.setLocalScale(3.4 * scaleMult, 2.5 * scaleMult, 3.4 * scaleMult);
      cone1.setLocalPosition(0, 4.3 * scaleMult, 0);
      if (cone1.render) cone1.render.material = this.pineNeedleMat1;
      treeRoot.addChild(cone1);

      const cone2 = new Entity('Cone2');
      cone2.addComponent('render', { type: 'cone' });
      cone2.setLocalScale(2.6 * scaleMult, 2.3 * scaleMult, 2.6 * scaleMult);
      cone2.setLocalPosition(0, 5.7 * scaleMult, 0);
      if (cone2.render) cone2.render.material = this.pineNeedleMat2;
      treeRoot.addChild(cone2);

      const cone3 = new Entity('Cone3');
      cone3.addComponent('render', { type: 'cone' });
      cone3.setLocalScale(1.8 * scaleMult, 2.1 * scaleMult, 1.8 * scaleMult);
      cone3.setLocalPosition(0, 7.1 * scaleMult, 0);
      if (cone3.render) cone3.render.material = this.pineNeedleMat1;
      treeRoot.addChild(cone3);

      root.addChild(treeRoot);
    };

    buildPineTree(`PineL1_${tileIdx}`, -terraceDist - 2.8, -5.0, 1.15, 15);
    buildPineTree(`PineL2_${tileIdx}`, -terraceDist - 3.4, -14.0, 1.30, 45);
    buildPineTree(`PineL3_${tileIdx}`, -terraceDist - 3.0, -23.0, 1.05, 75);
    buildPineTree(`PineR1_${tileIdx}`, terraceDist + 2.8, -8.0, 1.25, 30);
    buildPineTree(`PineR2_${tileIdx}`, terraceDist + 3.6, -18.0, 1.35, 60);
    buildPineTree(`PineR3_${tileIdx}`, terraceDist + 3.1, -26.0, 1.10, 90);

    // 3. Rows of Gilded Bronze Prayer Wheels (Mani Khorlo)
    const wheelBeamL = new Entity(`WheelBeamL_${tileIdx}`);
    wheelBeamL.addComponent('render', { type: 'box' });
    wheelBeamL.setLocalScale(0.14, 0.14, this.TILE_LENGTH);
    wheelBeamL.setLocalPosition(-terraceDist + 0.35, 1.15, -this.TILE_LENGTH / 2);
    if (wheelBeamL.render) wheelBeamL.render.material = this.timberMat;
    root.addChild(wheelBeamL);

    const wheelBeamR = new Entity(`WheelBeamR_${tileIdx}`);
    wheelBeamR.addComponent('render', { type: 'box' });
    wheelBeamR.setLocalScale(0.14, 0.14, this.TILE_LENGTH);
    wheelBeamR.setLocalPosition(terraceDist - 0.35, 1.15, -this.TILE_LENGTH / 2);
    if (wheelBeamR.render) wheelBeamR.render.material = this.timberMat;
    root.addChild(wheelBeamR);

    const wheelZOffsets = [-4.5, -11.5, -18.5, -25.5];
    for (const wz of wheelZOffsets) {
      const wheelL = new Entity(`WheelL_${wz}`);
      wheelL.addComponent('render', { type: 'cylinder' });
      wheelL.setLocalScale(0.26, 0.65, 0.26);
      wheelL.setLocalPosition(-terraceDist + 0.35, 1.15, wz);
      if (wheelL.render) wheelL.render.material = this.bronzeWheelMat;
      root.addChild(wheelL);
      wheels.push(wheelL);

      const wheelR = new Entity(`WheelR_${wz}`);
      wheelR.addComponent('render', { type: 'cylinder' });
      wheelR.setLocalScale(0.26, 0.65, 0.26);
      wheelR.setLocalPosition(terraceDist - 0.35, 1.15, wz);
      if (wheelR.render) wheelR.render.material = this.bronzeWheelMat;
      root.addChild(wheelR);
      wheels.push(wheelR);
    }

    // 4. Sacred Incense Braziers (Dhup-dani) at Z = -15
    const buildBrazier = (name: string, x: number, z: number) => {
      const bRoot = new Entity(name);
      bRoot.setLocalPosition(x, 0, z);

      const plinth = new Entity('Plinth');
      plinth.addComponent('render', { type: 'box' });
      plinth.setLocalScale(0.48, 0.65, 0.48);
      plinth.setLocalPosition(0, 0.325, 0);
      if (plinth.render) plinth.render.material = this.mossStoneMat;
      bRoot.addChild(plinth);

      const urn = new Entity('Urn');
      urn.addComponent('render', { type: 'cylinder' });
      urn.setLocalScale(0.42, 0.35, 0.42);
      urn.setLocalPosition(0, 0.825, 0);
      if (urn.render) urn.render.material = this.bronzeWheelMat;
      bRoot.addChild(urn);

      const embers = new Entity('Embers');
      embers.addComponent('render', { type: 'cylinder' });
      embers.setLocalScale(0.32, 0.12, 0.32);
      embers.setLocalPosition(0, 1.02, 0);
      if (embers.render) embers.render.material = this.incenseEmbersMat;
      bRoot.addChild(embers);

      root.addChild(bRoot);
    };

    buildBrazier(`BrazierL_${tileIdx}`, -terraceDist + 0.35, -15.0);
    buildBrazier(`BrazierR_${tileIdx}`, terraceDist - 0.35, -15.0);

    // 5. Distant Golden Mountain Stupa Silhouette (Swayambhu / Boudhanath Style Horizon)
    this.buildDistantMountainStupa(root, tileIdx, -28.0);

    return wheels;
  }

  private buildDistantMountainStupa(root: Entity, tileIdx: number, zOffset: number): void {
    const stupaRoot = new Entity(`DistantStupa_${tileIdx}`);
    // Flank placement crowning the high mountain ridge
    const flankX = (tileIdx % 2 === 0) ? 24.0 : -24.0;
    stupaRoot.setLocalPosition(flankX, 10.0, zOffset);
    root.addChild(stupaRoot);

    // Stepped Square Base Plinth
    const base = new Entity('StupaBase');
    base.addComponent('render', { type: 'box' });
    base.setLocalScale(8.0, 2.0, 8.0);
    base.setLocalPosition(0, 1.0, 0);
    if (base.render) base.render.material = this.mossStoneMat;
    stupaRoot.addChild(base);

    // Massive Hemispherical Stupa Dome (Garbha)
    const dome = new Entity('StupaDome');
    dome.addComponent('render', { type: 'cylinder' });
    dome.setLocalScale(6.5, 3.5, 6.5);
    dome.setLocalPosition(0, 3.75, 0);
    if (dome.render) dome.render.material = this.curbLipMat;
    stupaRoot.addChild(dome);

    // Harmika Cube (All-Seeing Wisdom Eyes)
    const harmika = new Entity('Harmika');
    harmika.addComponent('render', { type: 'box' });
    harmika.setLocalScale(3.2, 1.8, 3.2);
    harmika.setLocalPosition(0, 6.4, 0);
    if (harmika.render) harmika.render.material = this.goldGajurMat;
    stupaRoot.addChild(harmika);

    // Conical Tiered Golden Spire (13 Bhumis to Nirvana)
    const spire = new Entity('Spire');
    spire.addComponent('render', { type: 'cone' });
    spire.setLocalScale(2.6, 5.5, 2.6);
    spire.setLocalPosition(0, 10.0, 0);
    if (spire.render) spire.render.material = this.goldGajurMat;
    stupaRoot.addChild(spire);
  }

  // --- BUILD CEREMONIAL TORANA GATEWAY ARCH ---
  private buildGatewayArch(root: Entity, tileIdx: number, roadWidth: number): void {
    const archSpan = roadWidth + 0.6; // ~7.4 span
    const pillarX = archSpan / 2;

    // Stepped Carved Stone Pedestal Plinths at Column Bases
    const plinthL = new Entity(`PlinthL_${tileIdx}`);
    plinthL.addComponent('render', { type: 'box' });
    plinthL.setLocalScale(0.9, 0.6, 0.9);
    plinthL.setLocalPosition(-pillarX, 0.3, 0);
    if (plinthL.render) plinthL.render.material = this.stoneBalustradeMat;
    root.addChild(plinthL);

    const plinthR = new Entity(`PlinthR_${tileIdx}`);
    plinthR.addComponent('render', { type: 'box' });
    plinthR.setLocalScale(0.9, 0.6, 0.9);
    plinthR.setLocalPosition(pillarX, 0.3, 0);
    if (plinthR.render) plinthR.render.material = this.stoneBalustradeMat;
    root.addChild(plinthR);

    // Massive carved stone pillar columns
    const colL = new Entity(`ArchColL_${tileIdx}`);
    colL.addComponent('render', { type: 'box' });
    colL.setLocalScale(0.65, 5.2, 0.65);
    colL.setLocalPosition(-pillarX, 3.2, 0);
    if (colL.render) colL.render.material = this.stoneBalustradeMat;
    root.addChild(colL);

    const colR = new Entity(`ArchColR_${tileIdx}`);
    colR.addComponent('render', { type: 'box' });
    colR.setLocalScale(0.65, 5.2, 0.65);
    colR.setLocalPosition(pillarX, 3.2, 0);
    if (colR.render) colR.render.material = this.stoneBalustradeMat;
    root.addChild(colR);

    // Stepped capital headers
    const capL = new Entity(`ArchCapL_${tileIdx}`);
    capL.addComponent('render', { type: 'box' });
    capL.setLocalScale(0.85, 0.35, 0.85);
    capL.setLocalPosition(-pillarX, 5.9, 0);
    if (capL.render) capL.render.material = this.curbMat;
    root.addChild(capL);

    const capR = new Entity(`ArchCapR_${tileIdx}`);
    capR.addComponent('render', { type: 'box' });
    capR.setLocalScale(0.85, 0.35, 0.85);
    capR.setLocalPosition(pillarX, 5.9, 0);
    if (capR.render) capR.render.material = this.curbMat;
    root.addChild(capR);

    // Hanging Bronze Oil Lanterns on Arch Columns
    const lanternL = new Entity(`ArchLanternL_${tileIdx}`);
    lanternL.addComponent('render', { type: 'box' });
    lanternL.setLocalScale(0.35, 0.45, 0.35);
    lanternL.setLocalPosition(-pillarX + 0.38, 5.2, 0);
    if (lanternL.render) lanternL.render.material = this.archLanternMat;
    root.addChild(lanternL);

    const lanternR = new Entity(`ArchLanternR_${tileIdx}`);
    lanternR.addComponent('render', { type: 'box' });
    lanternR.setLocalScale(0.35, 0.45, 0.35);
    lanternR.setLocalPosition(pillarX - 0.38, 5.2, 0);
    if (lanternR.render) lanternR.render.material = this.archLanternMat;
    root.addChild(lanternR);

    // Heavy carved horizontal lintel beam spanning the causeway
    const lintel = new Entity(`ArchLintel_${tileIdx}`);
    lintel.addComponent('render', { type: 'box' });
    lintel.setLocalScale(archSpan + 1.2, 0.48, 0.75);
    lintel.setLocalPosition(0, 6.1, 0);
    if (lintel.render) lintel.render.material = this.timberMat;
    root.addChild(lintel);

    // Carved Torana Pediment Crest
    const crest = new Entity(`ArchCrest_${tileIdx}`);
    crest.addComponent('render', { type: 'box' });
    crest.setLocalScale(3.8, 0.95, 0.38);
    crest.setLocalPosition(0, 6.7, 0);
    if (crest.render) crest.render.material = this.archCrestMat;
    root.addChild(crest);

    // Milestone Distance Plate at center of lintel
    const milestonePlate = new Entity(`MilestonePlate_${tileIdx}`);
    milestonePlate.addComponent('render', { type: 'box' });
    milestonePlate.setLocalScale(1.8, 0.32, 0.85);
    milestonePlate.setLocalPosition(0, 6.1, 0);
    if (milestonePlate.render) milestonePlate.render.material = this.goldGajurMat;
    root.addChild(milestonePlate);

    // Three-Tiered Golden Gajur Pinnacle Finial
    const gajurBase = new Entity(`GajurBase_${tileIdx}`);
    gajurBase.addComponent('render', { type: 'box' });
    gajurBase.setLocalScale(0.7, 0.25, 0.7);
    gajurBase.setLocalPosition(0, 7.25, 0);
    if (gajurBase.render) gajurBase.render.material = this.curbMat;
    root.addChild(gajurBase);

    const gajurSpire = new Entity(`GajurSpire_${tileIdx}`);
    gajurSpire.addComponent('render', { type: 'cone' });
    gajurSpire.setLocalScale(0.48, 0.85, 0.48);
    gajurSpire.setLocalPosition(0, 7.75, 0);
    if (gajurSpire.render) gajurSpire.render.material = this.goldGajurMat;
    root.addChild(gajurSpire);

    // Hanging marigold festoon garland beneath the lintel
    const garland = new Entity(`ArchGarland_${tileIdx}`);
    garland.addComponent('render', { type: 'box' });
    garland.setLocalScale(archSpan * 0.85, 0.08, 0.08);
    garland.setLocalPosition(0, 5.78, 0);
    if (garland.render) garland.render.material = this.pennantMats[0];
    root.addChild(garland);

    // Ceremonial Suspended Bronze Temple Bell (Ghanti) beneath center lintel
    const bellPivot = new Entity(`ArchBellPivot_${tileIdx}`);
    bellPivot.setLocalPosition(0, 5.85, 0);
    root.addChild(bellPivot);

    const bellChain = new Entity(`ArchBellChain_${tileIdx}`);
    bellChain.addComponent('render', { type: 'cylinder' });
    bellChain.setLocalScale(0.04, 0.45, 0.04);
    bellChain.setLocalPosition(0, -0.23, 0);
    if (bellChain.render) bellChain.render.material = this.ropeMat;
    bellPivot.addChild(bellChain);

    const bellBody = new Entity(`ArchBell_${tileIdx}`);
    bellBody.addComponent('render', { type: 'cylinder' });
    bellBody.setLocalScale(0.38, 0.38, 0.38);
    bellBody.setLocalPosition(0, -0.53, 0);
    if (bellBody.render) bellBody.render.material = this.bronzeWheelMat;
    bellPivot.addChild(bellBody);

    const bellRim = new Entity(`ArchBellRim_${tileIdx}`);
    bellRim.addComponent('render', { type: 'cylinder' });
    bellRim.setLocalScale(0.48, 0.08, 0.48);
    bellRim.setLocalPosition(0, -0.71, 0);
    if (bellRim.render) bellRim.render.material = this.goldGajurMat;
    bellPivot.addChild(bellRim);
  }

  // --- DYNAMIC SCENERY TOGGLING ON TILE RECYCLING ---
  private refreshTileScenery(tile: RoadTileData, tileZ: number): void {
    const tileDistance = -tileZ;
    // Clamp distance to >= 0 so the starting area is Durbar Royal Alley
    const effectiveCenterDist = Math.max(0, tileDistance + this.TILE_LENGTH / 2);
    // 3 Biomes cycling every 140m (0-140m Durbar, 140-280m River, 280-420m Hill)
    const cycleDist = effectiveCenterDist % RoadView.TOTAL_CYCLE_LENGTH;
    const biomeIdx = Math.floor(cycleDist / RoadView.BIOME_LENGTH);

    tile.durbarRoot.enabled = (biomeIdx === 0);
    tile.riverRoot.enabled = (biomeIdx === 1);
    tile.hillRoot.enabled = (biomeIdx === 2);

    // Check if a 140m milestone falls within (tileStartDist, tileEndDist]
    const tileStartDist = tileDistance;
    const tileEndDist = tileDistance + this.TILE_LENGTH;
    const nextMilestone = Math.ceil(tileStartDist / RoadView.BIOME_LENGTH) * RoadView.BIOME_LENGTH;
    if (nextMilestone > 0 && nextMilestone > tileStartDist && nextMilestone <= tileEndDist) {
      tile.gatewayRoot.enabled = true;
      const relZ = -(nextMilestone - tileStartDist);
      tile.gatewayRoot.setLocalPosition(0, 0, relZ);
    } else {
      tile.gatewayRoot.enabled = false;
    }
  }

  public getCurrentBiome(playerDistance: number): {
    type: BiomeType;
    name: string;
    tagline: string;
    progress: number;
  } {
    const cycleDist = ((playerDistance % RoadView.TOTAL_CYCLE_LENGTH) + RoadView.TOTAL_CYCLE_LENGTH) % RoadView.TOTAL_CYCLE_LENGTH;
    const biomeIdx = Math.floor(cycleDist / RoadView.BIOME_LENGTH);
    const biomeProgress = (cycleDist % RoadView.BIOME_LENGTH) / RoadView.BIOME_LENGTH;

    if (biomeIdx === 0) {
      return {
        type: 'DURBAR_ALLEY',
        name: 'Durbar Royal Alley',
        tagline: 'Ancient Red Brick Sanctuary',
        progress: biomeProgress,
      };
    } else if (biomeIdx === 1) {
      return {
        type: 'RIVER_CAUSEWAY',
        name: 'Sacred River Causeway',
        tagline: 'Ghat Bridge & Prayer Flags',
        progress: biomeProgress,
      };
    } else {
      return {
        type: 'TEMPLE_HILL',
        name: 'Himalayan Temple Hill',
        tagline: 'Mountain Pass & Bronze Wheels',
        progress: biomeProgress,
      };
    }
  }

  /** Swap in the street models once loaded. Rebuilds the road batch, so call outside a run only. */
  public attachStreetArt(): void {
    this.streetArt.attach();
  }

  public update(playerZ: number, dt = 0.016): void {
    this.animTime += dt;
    this.streetArt.update(this.animTime);

    // Loop tiles infinitely ahead of the player
    for (let tileIndex = 0; tileIndex < this.tiles.length; tileIndex++) {
      const tile = this.tiles[tileIndex];
      const tileZ = tile.root.getPosition().z;

      // Spin bronze prayer wheels if within 35m of player
      if (tile.hillRoot.enabled && Math.abs(tileZ - playerZ) < 35) {
        for (const wheel of tile.prayerWheels) {
          wheel.rotate(0, dt * 160, 0);
        }
      }

      // Subtle sacred river ripple and water current motion
      if (tile.riverRoot.enabled && tile.waterPlane) {
        const rippleY = -2.2 + Math.sin(this.animTime * 1.5 + tileZ * 0.06) * 0.04;
        tile.waterPlane.setLocalPosition(0, rippleY, -this.TILE_LENGTH / 2);
      }

      // If tile is more than two tile lengths behind the player, recycle it ahead
      if (tileIndex >= this.INTRO_TILE_COUNT && tileZ - playerZ > this.TILE_LENGTH * 2.2) {
        let frontZ = 0;
        for (const other of this.tiles) {
          const oz = other.root.getPosition().z;
          if (oz < frontZ) frontZ = oz;
        }
        const newZ = frontZ - this.TILE_LENGTH;
        tile.root.setPosition(0, 0, newZ);
        this.refreshTileScenery(tile, newZ);
      }
    }

    // Torana milestone bell ringing pendulum swing
    if (this.bellSwingAmplitude > 0.05) {
      this.bellSwingTime += dt;
      const swingAngle = Math.sin(this.bellSwingTime * 9.2) * this.bellSwingAmplitude;
      this.bellSwingAmplitude = Math.max(0, this.bellSwingAmplitude - dt * 16.0);

      for (let i = 0; i < this.tiles.length; i++) {
        const tile = this.tiles[i];
        if (tile.gatewayRoot.enabled) {
          const pivot = tile.gatewayRoot.findByName(`ArchBellPivot_${i}`);
          if (pivot) {
            pivot.setLocalEulerAngles(swingAngle, 0, 0);
          }
        }
      }
    }

    // --- T020: Background Procession Kinematics ---
    if (this.processionRoot) {
      // Advance procession at ceremonial pace (3.5 m/s along -Z)
      this.processionZ -= this.PROCESSION_SPEED * dt;
      this.processionRoot.setPosition(0, 0, this.processionZ);

      // Chariot Wheel Rolling Kinematics
      this.processionWheelPitch = (this.processionWheelPitch + 220 * dt) % 360;
      const allWheels = [
        ...this.rathKumariWheels,
        ...this.rathBhairabWheels,
        ...this.rathGaneshWheels,
      ];
      for (let i = 0; i < allWheels.length; i++) {
        allWheels[i].setLocalEulerAngles(this.processionWheelPitch, 0, 0);
      }

      // Gentle Procession Sway (majestic ceremonial weight transfer)
      const sway = Math.sin(this.animTime * 2.4) * 1.4;
      if (this.rathKumariRoot) {
        this.rathKumariRoot.setLocalEulerAngles(0, 180, sway);
      }
      if (this.rathBhairabRoot) {
        this.rathBhairabRoot.setLocalEulerAngles(0, 180, -sway * 0.85);
      }
      if (this.rathGaneshRoot) {
        this.rathGaneshRoot.setLocalEulerAngles(0, 180, sway * 0.7);
      }

      // Leapfrog Repositioning: when player runs past the spectacle by > 140m
      if (playerZ < this.processionZ - 140.0) {
        this.processionZ = playerZ - 200.0;
        this.processionRoot.setPosition(0, 0, this.processionZ);
      }

      // Distant Procession Spectacle Audio Ambience
      this.processionAudioTimer += dt;
      if (this.processionAudioTimer >= 0.85) {
        this.processionAudioTimer = 0;
        const relZ = playerZ - (this.processionZ - 22.0);
        const dist = Math.sqrt(10.5 * 10.5 + 2.0 * 2.0 + relZ * relZ);
        if (dist <= 65.0 && this.onDistantProcessionAudioCb) {
          this.onDistantProcessionAudioCb(dist);
        }
      }
    }
  }

  private loadCartoonTextures(): void {
    interface TexTarget {
      url: string;
      mat: StandardMaterial;
      repeat?: Vec2;
      emissive?: boolean;
      emissiveColor?: Color;
      metalness?: number;
      gloss?: number;
    }

    const targets: TexTarget[] = [
      // 1. Durbar Alley & Causeway Road Paving
      { url: '/models/textures/tex_road_flagstone.webp', mat: this.roadMat, repeat: new Vec2(1, 6) },
      { url: '/models/textures/tex_road_sandstone.webp', mat: this.roadMatSandstone, repeat: new Vec2(1, 6) },
      { url: '/models/textures/tex_stone_mossy.webp', mat: this.roadMatMoss, repeat: new Vec2(1, 6) },
      { url: '/models/textures/tex_brick_dachi.webp', mat: this.curbMat, repeat: new Vec2(1, 8) },
      { url: '/models/textures/tex_brick_aged.webp', mat: this.curbLipMat, repeat: new Vec2(1, 8) },

      // 2. Durbar Alley Architecture & Facades
      { url: '/models/textures/tex_brick_dachi.webp', mat: this.brickMat1, repeat: new Vec2(2, 4) },
      { url: '/models/textures/tex_brick_aged.webp', mat: this.brickMat2, repeat: new Vec2(2, 4) },
      { url: '/models/textures/tex_timber_sal.webp', mat: this.timberMat, repeat: new Vec2(1, 4) },
      { url: '/models/textures/tex_window_sanjhya.webp', mat: this.windowMat, repeat: new Vec2(1, 1), emissive: true, emissiveColor: new Color(0.85, 0.55, 0.15) },
      { url: '/models/textures/tex_roof_tiles.webp', mat: this.roofMat, repeat: new Vec2(3, 2) },
      { url: '/models/textures/tex_lantern_amber.webp', mat: this.lanternMat, repeat: new Vec2(1, 1), emissive: true, emissiveColor: new Color(0.95, 0.7, 0.2) },

      // 3. River Causeway & Bridge
      { url: '/models/textures/tex_stone_bridge.webp', mat: this.stoneBalustradeMat, repeat: new Vec2(2, 6) },
      { url: '/models/textures/tex_stone_bridge.webp', mat: this.stoneLionMat, repeat: new Vec2(1, 1) },
      { url: '/models/textures/tex_stone_bridge.webp', mat: this.bridgePierMat, repeat: new Vec2(1, 4) },

      // 4. Temple Hill & Mountain Pass
      { url: '/models/textures/tex_stone_mossy.webp', mat: this.mossStoneMat, repeat: new Vec2(2, 6) },
      { url: '/models/textures/tex_stone_mossy.webp', mat: this.boulderMat, repeat: new Vec2(1, 1) },
      { url: '/models/textures/tex_timber_sal.webp', mat: this.pineTrunkMat, repeat: new Vec2(1, 3) },
      { url: '/models/textures/tex_bronze_wheel.webp', mat: this.bronzeWheelMat, repeat: new Vec2(1, 1), metalness: 0.65, gloss: 0.7 },
      { url: '/models/textures/tex_bronze_wheel.webp', mat: this.goldGajurMat, repeat: new Vec2(1, 1), metalness: 0.75, gloss: 0.8 },

      // 5. Gateway Arch & Torana Crest
      { url: '/models/textures/tex_lantern_amber.webp', mat: this.archLanternMat, repeat: new Vec2(1, 1), emissive: true, emissiveColor: new Color(0.95, 0.7, 0.2) },
      { url: '/models/textures/tex_torana_crest.webp', mat: this.archCrestMat, repeat: new Vec2(1, 1) },
    ];

    let pending = targets.length;
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
            t.mat.emissive = t.emissiveColor || new Color(0.8, 0.5, 0.15);
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
        pending--;
        if (pending === 0 && this.batchGroupId !== undefined && this.app.batcher) {
          this.app.batcher.generate([this.batchGroupId]);
        }
      });
    }
  }

  public triggerToranaBellSwing(_milestoneMeters?: number): void {
    this.bellSwingTime = 0;
    this.bellSwingAmplitude = 36.0; // 36° peak swing when milestone is struck
  }

  private buildDurbarBackdrop(): void {
    this.backdropRoot = new Entity('DurbarBackdrop');
    this.backdropRoot.setPosition(0, 0, 60.0);
    this.rootEntity.addChild(this.backdropRoot);

    // 1. Massive Courtyard Plaza Flagstone Floor
    const plaza = new Entity('Backdrop_Plaza');
    plaza.addComponent('render', { type: 'plane' });
    plaza.setLocalScale(80.0, 1, 38.0);
    plaza.setLocalPosition(0, -0.01, 16.0);
    if (plaza.render) plaza.render.material = this.roadMatSandstone;
    this.backdropRoot.addChild(plaza);

    // 2. Main Durbar Royal Gatehouse (Malla-era Red Brick Portal)
    const gatehouse = new Entity('Backdrop_Gatehouse');
    gatehouse.addComponent('render', { type: 'box' });
    gatehouse.setLocalScale(13.0, 9.8, 5.4);
    gatehouse.setLocalPosition(0, 4.9, 2.7);
    if (gatehouse.render) gatehouse.render.material = this.brickMat1;
    this.backdropRoot.addChild(gatehouse);

    // Archway portal opening (Sal timber frame)
    const portalBeamL = new Entity('Backdrop_PortalBeamL');
    portalBeamL.addComponent('render', { type: 'box' });
    portalBeamL.setLocalScale(0.65, 5.2, 5.6);
    portalBeamL.setLocalPosition(-2.5, 2.6, 2.7);
    if (portalBeamL.render) portalBeamL.render.material = this.timberMat;
    this.backdropRoot.addChild(portalBeamL);

    const portalBeamR = new Entity('Backdrop_PortalBeamR');
    portalBeamR.addComponent('render', { type: 'box' });
    portalBeamR.setLocalScale(0.65, 5.2, 5.6);
    portalBeamR.setLocalPosition(2.5, 2.6, 2.7);
    if (portalBeamR.render) portalBeamR.render.material = this.timberMat;
    this.backdropRoot.addChild(portalBeamR);

    const portalLintel = new Entity('Backdrop_PortalLintel');
    portalLintel.addComponent('render', { type: 'box' });
    portalLintel.setLocalScale(5.8, 0.75, 5.6);
    portalLintel.setLocalPosition(0, 5.2, 2.7);
    if (portalLintel.render) portalLintel.render.material = this.timberMat;
    this.backdropRoot.addChild(portalLintel);

    // Heavy wooden studded palace double-doors set inside
    const doorL = new Entity('Backdrop_DoorL');
    doorL.addComponent('render', { type: 'box' });
    doorL.setLocalScale(2.35, 4.7, 0.3);
    doorL.setLocalPosition(-1.2, 2.35, 2.7);
    if (doorL.render) doorL.render.material = this.timberMat;
    this.backdropRoot.addChild(doorL);

    const doorR = new Entity('Backdrop_DoorR');
    doorR.addComponent('render', { type: 'box' });
    doorR.setLocalScale(2.35, 4.7, 0.3);
    doorR.setLocalPosition(1.2, 2.35, 2.7);
    if (doorR.render) doorR.render.material = this.timberMat;
    this.backdropRoot.addChild(doorR);

    // Mid-tier overhanging tiled roof (Chhajja)
    const midEave = new Entity('Backdrop_MidEave');
    midEave.addComponent('render', { type: 'box' });
    midEave.setLocalScale(14.8, 0.45, 6.6);
    midEave.setLocalPosition(0, 5.65, 2.7);
    if (midEave.render) midEave.render.material = this.roofMat;
    this.backdropRoot.addChild(midEave);

    // Upper level San Jhyā windows on gatehouse
    const gateWinZ = [-2.8, 0, 2.8];
    for (const gx of gateWinZ) {
      const win = new Entity(`Backdrop_GateWin_${gx}`);
      win.addComponent('render', { type: 'box' });
      win.setLocalScale(1.8, 2.0, 0.2);
      win.setLocalPosition(gx, 7.8, -0.05);
      if (win.render) win.render.material = this.windowMat;
      this.backdropRoot.addChild(win);
    }

    // Top overhanging tiled roof
    const topEave = new Entity('Backdrop_TopEave');
    topEave.addComponent('render', { type: 'box' });
    topEave.setLocalScale(15.6, 0.5, 7.2);
    topEave.setLocalPosition(0, 9.95, 2.7);
    if (topEave.render) topEave.render.material = this.roofMat;
    this.backdropRoot.addChild(topEave);

    // Gilded Golden Gajur on Gatehouse
    const gateGajur = new Entity('Backdrop_GateGajur');
    gateGajur.addComponent('render', { type: 'cylinder' });
    gateGajur.setLocalScale(0.35, 1.4, 0.35);
    gateGajur.setLocalPosition(0, 10.85, 2.7);
    if (gateGajur.render) gateGajur.render.material = this.goldGajurMat;
    this.backdropRoot.addChild(gateGajur);

    // 3. Grand 3-Tier Nyatapola-Style Pagoda Temple Towering Behind Gatehouse
    const templeZ = 13.5;
    // Tier 1 Sanctum & Plinth
    const t1Sanctum = new Entity('Backdrop_T1Sanctum');
    t1Sanctum.addComponent('render', { type: 'box' });
    t1Sanctum.setLocalScale(10.0, 5.2, 10.0);
    t1Sanctum.setLocalPosition(0, 2.6, templeZ);
    if (t1Sanctum.render) t1Sanctum.render.material = this.brickMat2;
    this.backdropRoot.addChild(t1Sanctum);

    const t1Roof = new Entity('Backdrop_T1Roof');
    t1Roof.addComponent('render', { type: 'box' });
    t1Roof.setLocalScale(13.6, 0.8, 13.6);
    t1Roof.setLocalPosition(0, 5.4, templeZ);
    if (t1Roof.render) t1Roof.render.material = this.roofMat;
    this.backdropRoot.addChild(t1Roof);

    // Tier 2 Sanctum
    const t2Sanctum = new Entity('Backdrop_T2Sanctum');
    t2Sanctum.addComponent('render', { type: 'box' });
    t2Sanctum.setLocalScale(7.2, 4.0, 7.2);
    t2Sanctum.setLocalPosition(0, 7.6, templeZ);
    if (t2Sanctum.render) t2Sanctum.render.material = this.brickMat1;
    this.backdropRoot.addChild(t2Sanctum);

    const t2Roof = new Entity('Backdrop_T2Roof');
    t2Roof.addComponent('render', { type: 'box' });
    t2Roof.setLocalScale(10.2, 0.7, 10.2);
    t2Roof.setLocalPosition(0, 9.85, templeZ);
    if (t2Roof.render) t2Roof.render.material = this.roofMat;
    this.backdropRoot.addChild(t2Roof);

    // Tier 3 Upper Sanctum
    const t3Sanctum = new Entity('Backdrop_T3Sanctum');
    t3Sanctum.addComponent('render', { type: 'box' });
    t3Sanctum.setLocalScale(4.6, 3.4, 4.6);
    t3Sanctum.setLocalPosition(0, 11.75, templeZ);
    if (t3Sanctum.render) t3Sanctum.render.material = this.timberMat;
    this.backdropRoot.addChild(t3Sanctum);

    const t3Roof = new Entity('Backdrop_T3Roof');
    t3Roof.addComponent('render', { type: 'box' });
    t3Roof.setLocalScale(7.0, 0.65, 7.0);
    t3Roof.setLocalPosition(0, 13.65, templeZ);
    if (t3Roof.render) t3Roof.render.material = this.roofMat;
    this.backdropRoot.addChild(t3Roof);

    // Temple Golden Gajur Pinnacle (Soaring Landmark Spire)
    const templeGajur = new Entity('Backdrop_TempleGajur');
    templeGajur.addComponent('render', { type: 'cylinder' });
    templeGajur.setLocalScale(0.48, 2.6, 0.48);
    templeGajur.setLocalPosition(0, 15.2, templeZ);
    if (templeGajur.render) templeGajur.render.material = this.goldGajurMat;
    this.backdropRoot.addChild(templeGajur);

    const templeCrescent = new Entity('Backdrop_TempleCrescent');
    templeCrescent.addComponent('render', { type: 'sphere' });
    templeCrescent.setLocalScale(0.7, 0.7, 0.7);
    templeCrescent.setLocalPosition(0, 16.6, templeZ);
    if (templeCrescent.render) templeCrescent.render.material = this.goldGajurMat;
    this.backdropRoot.addChild(templeCrescent);

    // 4. Flanking Palace Wings (Durbar Square Quadrangle)
    // Left Wing (X = -6 to -38)
    const leftWing = new Entity('Backdrop_LeftWing');
    leftWing.addComponent('render', { type: 'box' });
    leftWing.setLocalScale(32.0, 8.8, 10.0);
    leftWing.setLocalPosition(-22.5, 4.4, 5.0);
    if (leftWing.render) leftWing.render.material = this.brickMat1;
    this.backdropRoot.addChild(leftWing);

    const leftWingRoof = new Entity('Backdrop_LeftWingRoof');
    leftWingRoof.addComponent('render', { type: 'box' });
    leftWingRoof.setLocalScale(33.0, 0.45, 11.2);
    leftWingRoof.setLocalPosition(-22.5, 9.0, 5.0);
    if (leftWingRoof.render) leftWingRoof.render.material = this.roofMat;
    this.backdropRoot.addChild(leftWingRoof);

    // Right Wing (X = +6 to +38)
    const rightWing = new Entity('Backdrop_RightWing');
    rightWing.addComponent('render', { type: 'box' });
    rightWing.setLocalScale(32.0, 8.8, 10.0);
    rightWing.setLocalPosition(22.5, 4.4, 5.0);
    if (rightWing.render) rightWing.render.material = this.brickMat2;
    this.backdropRoot.addChild(rightWing);

    const rightWingRoof = new Entity('Backdrop_RightWingRoof');
    rightWingRoof.addComponent('render', { type: 'box' });
    rightWingRoof.setLocalScale(33.0, 0.45, 11.2);
    rightWingRoof.setLocalPosition(22.5, 9.0, 5.0);
    if (rightWingRoof.render) rightWingRoof.render.material = this.roofMat;
    this.backdropRoot.addChild(rightWingRoof);

    // Glowing San Jhyā windows across left & right palace wings
    const wingWinXOffsets = [-10, -16, -22, -28, 10, 16, 22, 28];
    for (const wx of wingWinXOffsets) {
      const win = new Entity(`Backdrop_WingWin_${wx}`);
      win.addComponent('render', { type: 'box' });
      win.setLocalScale(1.8, 2.0, 0.2);
      win.setLocalPosition(wx, 5.8, -0.05);
      if (win.render) win.render.material = this.windowMat;
      this.backdropRoot.addChild(win);
    }

    // 5. Guardian Singha Lions on Carved Plinths flanking the royal entrance
    const lionPositions = [-4.6, 4.6];
    for (const lx of lionPositions) {
      const plinth = new Entity(`Backdrop_LionPlinth_${lx}`);
      plinth.addComponent('render', { type: 'box' });
      plinth.setLocalScale(1.1, 0.7, 1.1);
      plinth.setLocalPosition(lx, 0.35, 1.5);
      if (plinth.render) plinth.render.material = this.stoneBalustradeMat;
      this.backdropRoot.addChild(plinth);

      const lion = new Entity(`Backdrop_Lion_${lx}`);
      lion.addComponent('render', { type: 'box' });
      lion.setLocalScale(0.7, 1.0, 0.8);
      lion.setLocalPosition(lx, 1.15, 1.5);
      if (lion.render) lion.render.material = this.stoneLionMat;
      this.backdropRoot.addChild(lion);
    }

    // 6. Perimeter Enclosure Walls
    const wallL = new Entity('Backdrop_WallL');
    wallL.addComponent('render', { type: 'box' });
    wallL.setLocalScale(1.2, 8.4, 24.0);
    wallL.setLocalPosition(-38.0, 4.2, 12.0);
    if (wallL.render) wallL.render.material = this.brickMat1;
    this.backdropRoot.addChild(wallL);

    const wallR = new Entity('Backdrop_WallR');
    wallR.addComponent('render', { type: 'box' });
    wallR.setLocalScale(1.2, 8.4, 24.0);
    wallR.setLocalPosition(38.0, 4.2, 12.0);
    if (wallR.render) wallR.render.material = this.brickMat2;
    this.backdropRoot.addChild(wallR);

    // 7. Hanging Brass Festival Lanterns on Portal
    const lanternX = [-3.8, 3.8, -8.0, 8.0];
    for (const lx of lanternX) {
      const lantern = new Entity(`Backdrop_Lantern_${lx}`);
      lantern.addComponent('render', { type: 'box' });
      lantern.setLocalScale(0.38, 0.48, 0.38);
      lantern.setLocalPosition(lx, 3.8, 0.2);
      if (lantern.render) lantern.render.material = this.archLanternMat;
      this.backdropRoot.addChild(lantern);
    }
  }

  public reset(): void {
    this.animTime = 0;
    this.bellSwingTime = 0;
    this.bellSwingAmplitude = 0;
    this.processionZ = -35.0;
    this.processionWheelPitch = 0;
    this.processionAudioTimer = 0;
    if (this.processionRoot) {
      this.processionRoot.setPosition(0, 0, this.processionZ);
    }
    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      const newZ = (2 - i) * this.TILE_LENGTH;
      tile.root.setPosition(0, 0, newZ);
      this.refreshTileScenery(tile, newZ);
    }
  }

  public onDistantProcessionAudio(cb: (distance: number) => void): void {
    this.onDistantProcessionAudioCb = cb;
  }

  private buildRightPlazaTerrace(root: Entity, tileIdx: number, roadWidth: number): void {
    const terraceRoot = new Entity(`PlazaTerrace_${tileIdx}`);
    root.addChild(terraceRoot);

    const roadEdgeX = roadWidth / 2 + 0.35; // ~3.75m
    const terraceW = 3.8; // extends from X = 3.75 to 7.55
    const midX = roadEdgeX + terraceW / 2;

    // 1. Street-level Plaza Flagstone Paver Floor (warm terracotta sandstone)
    const floor = new Entity('PlazaFloor');
    floor.addComponent('render', { type: 'plane' });
    floor.setLocalScale(terraceW, 1, this.TILE_LENGTH);
    floor.setLocalPosition(midX, 0.005, -this.TILE_LENGTH / 2);
    if (floor.render) floor.render.material = this.roadMatSandstone;
    terraceRoot.addChild(floor);

    // 2. Low Carved Stone Balustrade along street curb (X = roadEdgeX + 0.15, height 0.75m)
    const balustradeX = roadEdgeX + 0.2;
    const numPosts = 5;
    for (let p = 0; p < numPosts; p++) {
      const pz = -p * 6.0 - 3.0;

      // Stone post with lotus cap
      const post = new Entity(`BalPost_${p}`);
      post.addComponent('render', { type: 'box' });
      post.setLocalScale(0.32, 0.75, 0.32);
      post.setLocalPosition(balustradeX, 0.375, pz);
      if (post.render) post.render.material = this.stoneBalustradeMat;
      terraceRoot.addChild(post);

      const cap = new Entity(`BalCap_${p}`);
      cap.addComponent('render', { type: 'sphere' });
      cap.setLocalScale(0.36, 0.22, 0.36);
      cap.setLocalPosition(balustradeX, 0.8, pz);
      if (cap.render) cap.render.material = this.stoneBalustradeMat;
      terraceRoot.addChild(cap);

      // Connecting rail
      if (p < numPosts - 1) {
        const rail = new Entity(`BalRail_${p}`);
        rail.addComponent('render', { type: 'box' });
        rail.setLocalScale(0.18, 0.14, 5.68);
        rail.setLocalPosition(balustradeX, 0.65, pz - 3.0);
        if (rail.render) rail.render.material = this.stoneBalustradeMat;
        terraceRoot.addChild(rail);
      }

      // Guardian Singha Lions flanking temple steps at post #1 & #3
      if (p === 1 || p === 3) {
        const lionPlinth = new Entity(`LionPlinth_${p}`);
        lionPlinth.addComponent('render', { type: 'box' });
        lionPlinth.setLocalScale(0.85, 0.45, 0.85);
        lionPlinth.setLocalPosition(balustradeX + 0.85, 0.225, pz);
        if (lionPlinth.render) lionPlinth.render.material = this.stoneBalustradeMat;
        terraceRoot.addChild(lionPlinth);

        const lion = new Entity(`Lion_${p}`);
        lion.addComponent('render', { type: 'box' });
        lion.setLocalScale(0.55, 0.8, 0.65);
        lion.setLocalPosition(balustradeX + 0.85, 0.85, pz);
        if (lion.render) lion.render.material = this.stoneLionMat;
        terraceRoot.addChild(lion);
      }
    }

    // 3. Brass festival lantern posts along the terrace
    const lamp = new Entity('TerraceLamp');
    lamp.addComponent('render', { type: 'box' });
    lamp.setLocalScale(0.28, 0.38, 0.28);
    lamp.setLocalPosition(midX + 0.8, 2.2, -15.0);
    if (lamp.render) lamp.render.material = this.archLanternMat;
    terraceRoot.addChild(lamp);

    const lampPole = new Entity('TerraceLampPole');
    lampPole.addComponent('render', { type: 'cylinder' });
    lampPole.setLocalScale(0.08, 2.2, 0.08);
    lampPole.setLocalPosition(midX + 0.8, 1.1, -15.0);
    if (lampPole.render) lampPole.render.material = this.timberMat;
    terraceRoot.addChild(lampPole);
  }

  // --- T020: BACKGROUND PROCESSION SPECTACLE (THE RATHS OF INDRA JATRA) ---
  private buildProcessionBoulevard(): void {
    this.processionRoot = new Entity('ProcessionRoot');
    this.processionRoot.setPosition(0, 0, this.processionZ);
    this.rootEntity.addChild(this.processionRoot);

    const boulevardX = 10.5;
    const terraceY = 2.0;
    const terraceLength = 160.0;

    // 1. Elevated Stone Promenade Slab (X = 10.5, Y = 2.0, covers X = 7.4 to 13.6)
    const promenade = new Entity('Procession_PromenadeSlab');
    promenade.addComponent('render', { type: 'box' });
    promenade.setLocalScale(6.2, 0.4, terraceLength);
    promenade.setLocalPosition(boulevardX, terraceY - 0.2, -40.0);
    if (promenade.render) promenade.render.material = this.roadMatSandstone;
    this.processionRoot.addChild(promenade);

    // 2. High Terracotta Brick Retaining Wall facing the runner road (X = 7.4)
    const retainingWall = new Entity('Procession_RetainingWall');
    retainingWall.addComponent('render', { type: 'box' });
    retainingWall.setLocalScale(0.8, terraceY, terraceLength);
    retainingWall.setLocalPosition(boulevardX - 3.1, terraceY / 2, -40.0);
    if (retainingWall.render) retainingWall.render.material = this.brickMat1;
    this.processionRoot.addChild(retainingWall);

    // Stone Coping along the top edge of retaining wall
    const coping = new Entity('Procession_Coping');
    coping.addComponent('render', { type: 'box' });
    coping.setLocalScale(0.95, 0.18, terraceLength);
    coping.setLocalPosition(boulevardX - 3.1, terraceY + 0.05, -40.0);
    if (coping.render) coping.render.material = this.stoneBalustradeMat;
    this.processionRoot.addChild(coping);

    // 3. Decorative Stone Balustrade & Carved Posts along road-facing terrace lip
    const numPosts = Math.floor(terraceLength / 6.0);
    for (let p = 0; p < numPosts; p++) {
      const pz = 40.0 - p * 6.0;
      // Post
      const post = new Entity(`Procession_Post_${p}`);
      post.addComponent('render', { type: 'box' });
      post.setLocalScale(0.38, 0.75, 0.38);
      post.setLocalPosition(boulevardX - 2.95, terraceY + 0.375, pz);
      if (post.render) post.render.material = this.stoneBalustradeMat;
      this.processionRoot.addChild(post);

      // Post lotus cap
      const postCap = new Entity(`Procession_PostCap_${p}`);
      postCap.addComponent('render', { type: 'sphere' });
      postCap.setLocalScale(0.42, 0.25, 0.42);
      postCap.setLocalPosition(boulevardX - 2.95, terraceY + 0.8, pz);
      if (postCap.render) postCap.render.material = this.stoneBalustradeMat;
      this.processionRoot.addChild(postCap);

      // Handrail segment between posts
      if (p < numPosts - 1) {
        const rail = new Entity(`Procession_Rail_${p}`);
        rail.addComponent('render', { type: 'box' });
        rail.setLocalScale(0.20, 0.14, 5.6);
        rail.setLocalPosition(boulevardX - 2.95, terraceY + 0.65, pz - 3.0);
        if (rail.render) rail.render.material = this.stoneBalustradeMat;
        this.processionRoot.addChild(rail);
      }

      // Tall ceremonial banner pole every 3rd post
      if (p % 3 === 0) {
        const bannerPole = new Entity(`Procession_BannerPole_${p}`);
        bannerPole.addComponent('render', { type: 'cylinder' });
        bannerPole.setLocalScale(0.12, 4.8, 0.12);
        bannerPole.setLocalPosition(boulevardX - 2.95, terraceY + 2.4, pz);
        if (bannerPole.render) bannerPole.render.material = this.timberMat;
        this.processionRoot.addChild(bannerPole);

        const bannerTop = new Entity(`Procession_BannerTop_${p}`);
        bannerTop.addComponent('render', { type: 'sphere' });
        bannerTop.setLocalScale(0.35, 0.35, 0.35);
        bannerTop.setLocalPosition(boulevardX - 2.95, terraceY + 4.9, pz);
        if (bannerTop.render) bannerTop.render.material = this.goldGajurMat;
        this.processionRoot.addChild(bannerTop);

        // Hanging festival pennants
        const flag = new Entity(`Procession_Flag_${p}`);
        flag.addComponent('render', { type: 'box' });
        flag.setLocalScale(0.06, 1.4, 0.85);
        flag.setLocalPosition(boulevardX - 2.95, terraceY + 3.8, pz - 0.45);
        const matIdx = (p / 3) % this.pennantMats.length;
        if (flag.render) flag.render.material = this.pennantMats[matIdx];
        this.processionRoot.addChild(flag);
      }
    }

    // 4. Instantiate Sacred Raths: Ganesh (lead), Bhairab (middle), Kumari (rear)
    this.rathGaneshRoot = this.setupChariot(
      'GaneshRath',
      boulevardX,
      terraceY,
      -44.0,
      '/models/ganesh_rath.glb',
      this.rathGaneshWheels,
      'GANESH'
    );

    this.rathBhairabRoot = this.setupChariot(
      'BhairabRath',
      boulevardX,
      terraceY,
      -22.0,
      '/models/bhairab_rath.glb',
      this.rathBhairabWheels,
      'BHAIRAB'
    );

    this.rathKumariRoot = this.setupChariot(
      'KumariRath',
      boulevardX,
      terraceY,
      0.0,
      '/models/kumari_rath.glb',
      this.rathKumariWheels,
      'KUMARI'
    );

    // 5. Ceremonial Haul Ropes & Crowd Silhouette Haulers
    this.buildHaulCrew(boulevardX, terraceY, -44.0, -18.0); // Ahead of Ganesh
    this.buildHaulCrew(boulevardX, terraceY, -22.0, -16.0); // Ahead of Bhairab
    this.buildHaulCrew(boulevardX, terraceY, 0.0, -16.0);   // Ahead of Kumari

    // 6. Terrace Crowd Devotees & Dhime Drummers lining the balustrades
    this.buildPromenadeCrowd(boulevardX - 2.6, terraceY, terraceLength);
  }

  private setupChariot(
    name: string,
    x: number,
    y: number,
    z: number,
    glbUrl: string,
    wheelArray: Entity[],
    variant: 'GANESH' | 'BHAIRAB' | 'KUMARI'
  ): Entity {
    const root = new Entity(name);
    root.setPosition(x, y, z);
    root.setLocalEulerAngles(0, 180, 0); // Face towards -Z (direction of run)
    this.processionRoot.addChild(root);

    // 1. Procedural fallback shell (guarantees instantaneous rendering)
    const fallback = this.createRathFallback(variant);
    root.addChild(fallback);

    // 2. Load high-fidelity 3D model
    this.app.assets.loadFromUrl(glbUrl, 'container', (err, asset) => {
      if (!err && asset && asset.resource) {
        const modelEntity = (asset.resource as any).instantiateRenderEntity();
        if (modelEntity) {
          modelEntity.name = `${name}_Mesh`;
          root.addChild(modelEntity);
          fallback.enabled = false;
          // T038: batch the chariot's 23 parts by material. The chariots get their own group so they
          // are still culled while off-screen; the group is rebuilt once per chariot load, never mid-run.
          batchArticulatedModel(this.app, `${name}Batch`, modelEntity);

          // Collect all wheel nodes for realistic rolling kinematics
          modelEntity.forEach((node: GraphNode) => {
            if (node.name && node.name.startsWith('Wheel_')) {
              wheelArray.push(node as Entity);
            }
          });
        }
      }
    });

    return root;
  }

  private createRathFallback(variant: 'GANESH' | 'BHAIRAB' | 'KUMARI'): Entity {
    const fb = new Entity('RathFallback');

    // Chariot base carriage plinth
    const base = new Entity('BasePlinth');
    base.addComponent('render', { type: 'box' });
    base.setLocalScale(2.6, 0.5, 3.2);
    base.setLocalPosition(0, 0.9, 0);
    if (base.render) base.render.material = this.timberMat;
    fb.addChild(base);

    // 4 Chariot Wheels
    const wheelOffsets = [
      { x: -1.35, z: 1.1 },
      { x: 1.35, z: 1.1 },
      { x: -1.35, z: -1.1 },
      { x: 1.35, z: -1.1 },
    ];
    for (let i = 0; i < wheelOffsets.length; i++) {
      const wo = wheelOffsets[i];
      const w = new Entity(`FB_Wheel_${i}`);
      w.addComponent('render', { type: 'cylinder' });
      w.setLocalScale(1.8, 0.22, 1.8);
      w.setLocalEulerAngles(0, 0, 90);
      w.setLocalPosition(wo.x, 0.9, wo.z);
      if (w.render) w.render.material = this.timberMat;
      fb.addChild(w);
    }

    // Drawbeam stretching forward
    const beam = new Entity('FB_Drawbeam');
    beam.addComponent('render', { type: 'box' });
    beam.setLocalScale(0.24, 0.24, 4.0);
    beam.setLocalPosition(0, 0.75, 2.8);
    if (beam.render) beam.render.material = this.timberMat;
    fb.addChild(beam);

    if (variant === 'GANESH') {
      // 1-Tier Compact Pagoda
      const sanctum = new Entity('FB_Sanctum');
      sanctum.addComponent('render', { type: 'box' });
      sanctum.setLocalScale(1.8, 1.6, 1.8);
      sanctum.setLocalPosition(0, 1.95, 0);
      if (sanctum.render) sanctum.render.material = this.brickMat1;
      fb.addChild(sanctum);

      const roof = new Entity('FB_Roof');
      roof.addComponent('render', { type: 'box' });
      roof.setLocalScale(3.0, 0.35, 3.0);
      roof.setLocalPosition(0, 2.9, 0);
      if (roof.render) roof.render.material = this.roofMat;
      fb.addChild(roof);

      const gajur = new Entity('FB_Gajur');
      gajur.addComponent('render', { type: 'cylinder' });
      gajur.setLocalScale(0.22, 1.1, 0.22);
      gajur.setLocalPosition(0, 3.6, 0);
      if (gajur.render) gajur.render.material = this.goldGajurMat;
      fb.addChild(gajur);
    } else if (variant === 'BHAIRAB') {
      // Intermediate Pagoda
      const sanctum = new Entity('FB_Sanctum');
      sanctum.addComponent('render', { type: 'box' });
      sanctum.setLocalScale(2.1, 1.9, 2.1);
      sanctum.setLocalPosition(0, 2.1, 0);
      if (sanctum.render) sanctum.render.material = this.brickMat2;
      fb.addChild(sanctum);

      const roof = new Entity('FB_Roof');
      roof.addComponent('render', { type: 'box' });
      roof.setLocalScale(3.6, 0.4, 3.6);
      roof.setLocalPosition(0, 3.25, 0);
      if (roof.render) roof.render.material = this.roofMat;
      fb.addChild(roof);

      const gajur = new Entity('FB_Gajur');
      gajur.addComponent('render', { type: 'cylinder' });
      gajur.setLocalScale(0.26, 1.4, 0.26);
      gajur.setLocalPosition(0, 4.1, 0);
      if (gajur.render) gajur.render.material = this.goldGajurMat;
      fb.addChild(gajur);
    } else {
      // KUMARI: Soaring 3-Tier Grand Pagoda
      const s1 = new Entity('FB_S1');
      s1.addComponent('render', { type: 'box' });
      s1.setLocalScale(2.3, 1.8, 2.3);
      s1.setLocalPosition(0, 2.05, 0);
      if (s1.render) s1.render.material = this.brickMat1;
      fb.addChild(s1);

      const r1 = new Entity('FB_R1');
      r1.addComponent('render', { type: 'box' });
      r1.setLocalScale(3.9, 0.38, 3.9);
      r1.setLocalPosition(0, 3.1, 0);
      if (r1.render) r1.render.material = this.roofMat;
      fb.addChild(r1);

      const s2 = new Entity('FB_S2');
      s2.addComponent('render', { type: 'box' });
      s2.setLocalScale(1.8, 1.4, 1.8);
      s2.setLocalPosition(0, 3.95, 0);
      if (s2.render) s2.render.material = this.timberMat;
      fb.addChild(s2);

      const r2 = new Entity('FB_R2');
      r2.addComponent('render', { type: 'box' });
      r2.setLocalScale(3.1, 0.35, 3.1);
      r2.setLocalPosition(0, 4.8, 0);
      if (r2.render) r2.render.material = this.roofMat;
      fb.addChild(r2);

      const s3 = new Entity('FB_S3');
      s3.addComponent('render', { type: 'box' });
      s3.setLocalScale(1.3, 1.1, 1.3);
      s3.setLocalPosition(0, 5.5, 0);
      if (s3.render) s3.render.material = this.brickMat2;
      fb.addChild(s3);

      const r3 = new Entity('FB_R3');
      r3.addComponent('render', { type: 'box' });
      r3.setLocalScale(2.3, 0.3, 2.3);
      r3.setLocalPosition(0, 6.2, 0);
      if (r3.render) r3.render.material = this.roofMat;
      fb.addChild(r3);

      const gajur = new Entity('FB_Gajur');
      gajur.addComponent('render', { type: 'cylinder' });
      gajur.setLocalScale(0.3, 1.9, 0.3);
      gajur.setLocalPosition(0, 7.3, 0);
      if (gajur.render) gajur.render.material = this.goldGajurMat;
      fb.addChild(gajur);
    }

    return fb;
  }

  private buildHaulCrew(bx: number, by: number, rathZ: number, ropeLength: number): void {
    // Left & Right Sal fiber haul ropes extending forward along -Z
    const ropeL = new Entity(`RopeL_${rathZ}`);
    ropeL.addComponent('render', { type: 'cylinder' });
    ropeL.setLocalScale(0.08, Math.abs(ropeLength), 0.08);
    ropeL.setLocalEulerAngles(90, 0, 0);
    ropeL.setLocalPosition(bx - 0.65, by + 0.65, rathZ + ropeLength / 2 - 3.0);
    if (ropeL.render) ropeL.render.material = this.ropeMat;
    this.processionRoot.addChild(ropeL);

    const ropeR = new Entity(`RopeR_${rathZ}`);
    ropeR.addComponent('render', { type: 'cylinder' });
    ropeR.setLocalScale(0.08, Math.abs(ropeLength), 0.08);
    ropeR.setLocalEulerAngles(90, 0, 0);
    ropeR.setLocalPosition(bx + 0.65, by + 0.65, rathZ + ropeLength / 2 - 3.0);
    if (ropeR.render) ropeR.render.material = this.ropeMat;
    this.processionRoot.addChild(ropeR);

    // Hauler silhouettes pulling ropes in cadence
    const numHaulers = 5;
    for (let h = 0; h < numHaulers; h++) {
      const hz = rathZ - 4.0 - h * 2.6;

      // Left hauler
      this.createHaulerFigure(bx - 0.95, by, hz, h % 2 === 0);
      // Right hauler
      this.createHaulerFigure(bx + 0.95, by, hz, h % 2 === 1);
    }
  }

  private createHaulerFigure(x: number, y: number, z: number, altPose: boolean): void {
    const hauler = new Entity('Hauler');
    hauler.setPosition(x, y, z);
    hauler.setLocalEulerAngles(altPose ? 8 : 4, 180, 0); // Leaning forward pulling

    // Dhoti / legs
    const legs = new Entity('Legs');
    legs.addComponent('render', { type: 'box' });
    legs.setLocalScale(0.38, 0.72, 0.28);
    legs.setLocalPosition(0, 0.36, 0);
    if (legs.render) legs.render.material = this.pennantMats[3]; // Cream dhoti
    hauler.addChild(legs);

    // Torso in white tunic with red patuki sash
    const torso = new Entity('Torso');
    torso.addComponent('render', { type: 'box' });
    torso.setLocalScale(0.44, 0.65, 0.28);
    torso.setLocalPosition(0, 1.0, 0);
    if (torso.render) torso.render.material = this.pennantMats[1]; // Crimson sash / tunic
    hauler.addChild(torso);

    // Head with Nepali topi
    const head = new Entity('Head');
    head.addComponent('render', { type: 'sphere' });
    head.setLocalScale(0.26, 0.28, 0.26);
    head.setLocalPosition(0, 1.45, 0);
    if (head.render) head.render.material = this.pennantMats[0]; // Saffron topi
    hauler.addChild(head);

    this.processionRoot.addChild(hauler);
  }

  private buildPromenadeCrowd(edgeX: number, by: number, length: number): void {
    const crowdSpacing = 5.5;
    const count = Math.floor(length / crowdSpacing);
    for (let c = 0; c < count; c++) {
      const cz = 35.0 - c * crowdSpacing;
      // Devotee figure along balustrade watching & cheering
      const devotee = new Entity(`Devotee_${c}`);
      devotee.setPosition(edgeX, by, cz);
      devotee.setLocalEulerAngles(0, -90, 0); // Facing the road / runner

      // Body
      const body = new Entity('Body');
      body.addComponent('render', { type: 'box' });
      body.setLocalScale(0.38, 1.25, 0.28);
      body.setLocalPosition(0, 0.625, 0);
      const mat = this.pennantMats[c % this.pennantMats.length];
      if (body.render) body.render.material = mat;
      devotee.addChild(body);

      // Head
      const head = new Entity('Head');
      head.addComponent('render', { type: 'sphere' });
      head.setLocalScale(0.24, 0.26, 0.24);
      head.setLocalPosition(0, 1.38, 0);
      if (head.render) head.render.material = this.pennantMats[(c + 1) % this.pennantMats.length];
      devotee.addChild(head);

      // Every 4th figure is a Dhime drummer!
      if (c % 4 === 1) {
        const drum = new Entity('DhimeDrum');
        drum.addComponent('render', { type: 'cylinder' });
        drum.setLocalScale(0.42, 0.48, 0.42);
        drum.setLocalEulerAngles(90, 0, 0);
        drum.setLocalPosition(0.2, 0.75, 0);
        if (drum.render) drum.render.material = this.timberMat;
        devotee.addChild(drum);
      }

      this.processionRoot.addChild(devotee);
      this.promenadeFigures.push(devotee);
    }
  }
}
