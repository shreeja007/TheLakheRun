import {
  Application,
  Color,
  Entity,
  StandardMaterial,
  Texture,
  Vec3,
} from 'playcanvas';
import { LaneIndex } from '../types';
import { RoadView } from './RoadView';
import { ActiveObstacle } from './ObstacleManager';

export interface ActiveCoin {
  id: number;
  lane: LaneIndex;
  x: number;
  y: number;
  z: number;
  baseY: number;
  entity: Entity;
  shadowEntity: Entity;
  active: boolean;
  isCollected: boolean;
  spinYaw: number;
  bobPhase: number;
  isBeingPulled: boolean;
}

export interface CoinUpdateResult {
  collectedCount: number;
  collectedPositions: Vec3[];
  comboCount: number;
  pulledCoins: Vec3[];
}

export class CollectibleManager {
  private app: Application;
  private rootEntity: Entity;

  // Pre-allocated object pool of 36 coins
  private pool: ActiveCoin[] = [];
  private activeCoins: ActiveCoin[] = [];

  // Musical Combo Streak System
  private comboCount = 0;
  private comboTimer = 0;
  public static readonly COMBO_WINDOW = 0.72; // Seconds before combo resets

  // Config & Spawning Parameters
  public static readonly MAGNETIC_RADIUS = 2.8; // Radius in meters for brass coin magnetic attraction
  public static readonly COLLECTION_RADIUS = 0.48; // Contact collection distance in meters

  private nextSpawnZ = -22.0;
  private spawnSpacing = 28.0;

  // PRNG
  private currentPrngState = 88;

  constructor(app: Application) {
    this.app = app;
    this.rootEntity = new Entity('CollectiblesRoot');
    this.app.root.addChild(this.rootEntity);

    this.createCoinPool();
  }

  private createCoinPool(): void {
    // 1. Shimmering Ceremonial Brass Material (Newar antique paisa)
    const brassMat = new StandardMaterial();
    brassMat.diffuse = new Color(0.96, 0.78, 0.22); // Warm rich brass
    brassMat.emissive = new Color(0.55, 0.4, 0.1); // Warm self-illumination
    brassMat.useMetalness = true;
    brassMat.metalness = 0.88;
    brassMat.gloss = 0.8;
    brassMat.update();

    this.app.assets.loadFromUrl('/models/textures/tex_bronze_wheel.png', 'texture', (err, asset) => {
      if (!err && asset && asset.resource) {
        brassMat.diffuseMap = asset.resource as Texture;
        brassMat.emissiveMap = asset.resource as Texture;
        brassMat.diffuse = new Color(1, 0.9, 0.45);
        brassMat.update();
      }
    });

    const rimMat = new StandardMaterial();
    rimMat.diffuse = new Color(1.0, 0.9, 0.45); // Brilliant rim edge highlight
    rimMat.emissive = new Color(0.75, 0.55, 0.15);
    rimMat.useMetalness = true;
    rimMat.metalness = 0.92;
    rimMat.gloss = 0.9;
    rimMat.update();

    // 2. Soft Pavement Drop Shadow Material
    const shadowMat = new StandardMaterial();
    shadowMat.diffuse = new Color(0.04, 0.03, 0.02);
    shadowMat.opacity = 0.45;
    shadowMat.blendType = 2; // pc.BLEND_NORMAL
    shadowMat.update();

    for (let i = 0; i < 36; i++) {
      const e = new Entity(`BrassCoin_${i}`);

      // Internal rotator node for high-speed continuous yaw rotation
      const rotator = new Entity('CoinRotator');

      // Disc shape (outer coin disc)
      const outerDisc = new Entity('OuterDisc');
      outerDisc.addComponent('render', { type: 'cylinder' });
      outerDisc.setLocalScale(0.42, 0.06, 0.42);
      outerDisc.setLocalEulerAngles(90, 0, 0); // Stood upright facing camera
      if (outerDisc.render) outerDisc.render.material = brassMat;
      rotator.addChild(outerDisc);

      // Raised outer rim ring
      const rim = new Entity('CoinRim');
      rim.addComponent('render', { type: 'cylinder' });
      rim.setLocalScale(0.44, 0.08, 0.44);
      rim.setLocalEulerAngles(90, 0, 0);
      if (rim.render) rim.render.material = rimMat;
      rotator.addChild(rim);

      // Distinctive traditional square central hole (chha-paisa style)
      const centerHole = new Entity('CenterCutout');
      centerHole.addComponent('render', { type: 'box' });
      centerHole.setLocalScale(0.12, 0.12, 0.09);
      const darkMat = new StandardMaterial();
      darkMat.diffuse = new Color(0.08, 0.06, 0.03);
      darkMat.update();
      if (centerHole.render) centerHole.render.material = darkMat;
      rotator.addChild(centerHole);

      e.addChild(rotator);
      e.enabled = false;
      this.rootEntity.addChild(e);

      // Pre-allocated Ground Drop Shadow Disk (anchors coin depth perception)
      const shadowEntity = new Entity(`CoinShadow_${i}`);
      shadowEntity.addComponent('render', { type: 'plane' });
      shadowEntity.setLocalScale(0.42, 1.0, 0.42);
      shadowEntity.setPosition(0, 0.015, 0);
      if (shadowEntity.render) shadowEntity.render.material = shadowMat;
      shadowEntity.enabled = false;
      this.rootEntity.addChild(shadowEntity);

      this.pool.push({
        id: i,
        lane: 0,
        x: 0,
        y: 0.55,
        z: 0,
        baseY: 0.55,
        entity: e,
        shadowEntity,
        active: false,
        isCollected: false,
        spinYaw: (i * 25) % 360,
        bobPhase: i * 0.4,
        isBeingPulled: false,
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

  public reset(seed = 88): void {
    this.currentPrngState = seed;
    this.comboCount = 0;
    this.comboTimer = 0;
    for (const coin of this.pool) {
      coin.active = false;
      coin.isCollected = false;
      coin.isBeingPulled = false;
      coin.entity.enabled = false;
      coin.shadowEntity.enabled = false;
    }
    this.activeCoins = [];
    this.nextSpawnZ = -22.0;
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    playerZ: number,
    activeObstacles: ActiveObstacle[] = []
  ): CoinUpdateResult {
    let collectedCount = 0;
    const collectedPositions: Vec3[] = [];
    const pulledCoins: Vec3[] = [];

    // Combo streak decay window
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // 1. Recycle passing coins & update animations & magnetic pull
    const recycleThreshold = playerZ + 8.0;
    for (let i = this.activeCoins.length - 1; i >= 0; i--) {
      const coin = this.activeCoins[i];

      if (coin.z > recycleThreshold || coin.isCollected) {
        coin.active = false;
        coin.entity.enabled = false;
        coin.shadowEntity.enabled = false;
        this.activeCoins.splice(i, 1);
        continue;
      }

      // Continuous Yaw Spin
      coin.spinYaw = (coin.spinYaw + 220 * dt) % 360;

      // Gentle vertical hover bobbing
      coin.bobPhase += dt * 3.8;
      const hoverY = coin.baseY + Math.sin(coin.bobPhase) * 0.08;

      // Vector distance from coin to Tuku's center
      const dx = playerX - coin.x;
      const dy = (playerY + 0.5) - coin.y; // Aim for Tuku's chest
      const dz = playerZ - coin.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      // STRICT LANE ISOLATION:
      // Adjacent lanes are spaced 2.0m apart. A coin must only be attracted or collected if the runner
      // is currently in the same lane (or actively dodging through it within 0.65m lateral threshold).
      const isWithinLane = Math.abs(dx) <= 0.65;
      const isInContactRange = Math.abs(dx) <= 0.48 && Math.abs(dz) <= 0.52 && Math.abs(dy) <= 1.25;

      if (isWithinLane && dist < CollectibleManager.MAGNETIC_RADIUS) {
        coin.isBeingPulled = true;
        pulledCoins.push(new Vec3(coin.x, coin.y, coin.z));

        // Smooth quadratic acceleration towards player
        const proximity = 1.0 - dist / CollectibleManager.MAGNETIC_RADIUS;
        const pullSpeed = 9.0 + proximity * proximity * 28.0;

        const invDist = 1.0 / (dist + 0.001);
        coin.x += dx * invDist * pullSpeed * dt;
        coin.y += dy * invDist * pullSpeed * dt;
        coin.z += dz * invDist * pullSpeed * dt;

        // Dynamic tilt toward Tuku when caught in magnetic vacuum
        const tiltPitch = (dy * invDist) * 32.0;
        const tiltYaw = -(dx * invDist) * 32.0;
        const rotator = coin.entity.findByName('CoinRotator');
        if (rotator) {
          rotator.setLocalEulerAngles(tiltPitch, coin.spinYaw + tiltYaw, 0);
        }

        // Check Collection Contact
        if (dist < CollectibleManager.COLLECTION_RADIUS || isInContactRange) {
          coin.isCollected = true;
          coin.active = false;
          coin.entity.enabled = false;
          coin.shadowEntity.enabled = false;

          this.comboCount++;
          this.comboTimer = CollectibleManager.COMBO_WINDOW;

          collectedCount++;
          collectedPositions.push(new Vec3(coin.x, coin.y, coin.z));
          this.activeCoins.splice(i, 1);
          continue;
        }
      } else if (isInContactRange) {
        // Direct physical contact collection
        coin.isCollected = true;
        coin.active = false;
        coin.entity.enabled = false;
        coin.shadowEntity.enabled = false;

        this.comboCount++;
        this.comboTimer = CollectibleManager.COMBO_WINDOW;

        collectedCount++;
        collectedPositions.push(new Vec3(coin.x, coin.y, coin.z));
        this.activeCoins.splice(i, 1);
        continue;
      } else {
        coin.isBeingPulled = false;
        coin.y = hoverY;

        // Restore coin to its natural lane center X if it had minor pull drift before runner dodged away
        const targetLaneX = RoadView.LANE_X[coin.lane];
        if (Math.abs(coin.x - targetLaneX) > 0.01) {
          coin.x += (targetLaneX - coin.x) * Math.min(1.0, dt * 10.0);
        }

        const rotator = coin.entity.findByName('CoinRotator');
        if (rotator) {
          rotator.setLocalEulerAngles(0, coin.spinYaw, 0);
        }
      }

      // Apply transform to coin mesh
      coin.entity.setPosition(coin.x, coin.y, coin.z);

      // Position and scale ground drop shadow
      coin.shadowEntity.setPosition(coin.x, 0.015, coin.z);
      const altitude = Math.max(0, coin.y - 0.55);
      const shadowScale = Math.max(0.18, 0.44 - altitude * 0.16);
      coin.shadowEntity.setLocalScale(shadowScale, 1.0, shadowScale);
      coin.shadowEntity.enabled = true;
    }

    // 2. Spawn upcoming formations ahead of runner
    const spawnLookaheadDistance = 65.0;
    while (this.nextSpawnZ > playerZ - spawnLookaheadDistance) {
      this.spawnCoinPattern(this.nextSpawnZ, activeObstacles);
      this.nextSpawnZ -= this.spawnSpacing;
    }

    return {
      collectedCount,
      collectedPositions,
      comboCount: this.comboCount,
      pulledCoins,
    };
  }

  private spawnCoinPattern(z: number, activeObstacles: ActiveObstacle[]): void {
    // Check if there is an obstacle near this Z to create an airborne parkour vault arc!
    const nearbyObstacle = activeObstacles.find(
      (obs) => Math.abs(obs.z - z) < 6.0 && (obs.type === 'LOW_BARRIER' || obs.type === 'ROLLING_MATKA')
    );

    if (nearbyObstacle) {
      // Spawn airborne vault arc directly over hurdle!
      this.spawnVaultArc(nearbyObstacle.lane, nearbyObstacle.z);
    } else {
      // Spawn ground trail in an open lane
      const lanes: LaneIndex[] = [-1, 0, 1];
      const laneIndex = Math.floor(this.random() * 3);
      const lane = lanes[laneIndex];
      this.spawnGroundTrail(lane, z, 4);
    }
  }

  /**
   * Spawns a line of brass coins along the ground
   */
  public spawnGroundTrail(lane: LaneIndex, startZ: number, count = 4): void {
    const posX = RoadView.LANE_X[lane];
    const spacing = 2.4;

    for (let i = 0; i < count; i++) {
      const coin = this.getFreeCoin();
      if (!coin) break;

      const coinZ = startZ - i * spacing;
      coin.active = true;
      coin.isCollected = false;
      coin.isBeingPulled = false;
      coin.lane = lane;
      coin.x = posX;
      coin.baseY = 0.55;
      coin.y = 0.55;
      coin.z = coinZ;

      coin.entity.setPosition(coin.x, coin.y, coin.z);
      coin.entity.enabled = true;
      coin.shadowEntity.setPosition(coin.x, 0.015, coin.z);
      coin.shadowEntity.setLocalScale(0.44, 1.0, 0.44);
      coin.shadowEntity.enabled = true;
      this.activeCoins.push(coin);
    }
  }

  /**
   * Spawns a smooth parabolic vault arc over a jumpable barrier:
   * Guides player into the jump and provides rhythmic satisfaction
   */
  public spawnVaultArc(lane: LaneIndex, obstacleZ: number): void {
    const posX = RoadView.LANE_X[lane];
    const offsets = [
      { dz: 3.2, y: 0.65 },
      { dz: 1.6, y: 1.25 },
      { dz: 0.0, y: 1.65 }, // Apex
      { dz: -1.6, y: 1.25 },
      { dz: -3.2, y: 0.65 },
    ];

    for (const pt of offsets) {
      const coin = this.getFreeCoin();
      if (!coin) break;

      coin.active = true;
      coin.isCollected = false;
      coin.isBeingPulled = false;
      coin.lane = lane;
      coin.x = posX;
      coin.baseY = pt.y;
      coin.y = pt.y;
      coin.z = obstacleZ + pt.dz;

      coin.entity.setPosition(coin.x, coin.y, coin.z);
      coin.entity.enabled = true;
      coin.shadowEntity.setPosition(coin.x, 0.015, coin.z);
      coin.shadowEntity.enabled = true;
      this.activeCoins.push(coin);
    }
  }

  private getFreeCoin(): ActiveCoin | null {
    for (const c of this.pool) {
      if (!c.active) {
        return c;
      }
    }
    return null;
  }

  public getComboCount(): number {
    return this.comboCount;
  }

  public getActiveCount(): number {
    return this.activeCoins.length;
  }

  public getPoolAvailableCount(): number {
    return this.pool.filter((c) => !c.active).length;
  }
}
