import {
  Application,
  Color,
  Entity,
  PIXELFORMAT_RGBA8,
  StandardMaterial,
  Texture,
  BLEND_ADDITIVE,
  CULLFACE_NONE,
} from 'playcanvas';

type ParticleCategory = 'DUST' | 'RING' | 'SPARKLE' | 'SHARD' | 'MOTE';

interface ActiveParticle {
  entity: Entity;
  category: ParticleCategory;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  gravity: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  scaleStart: number;
  scaleEnd: number;
  currentScale: number;
  life: number;
  maxLife: number;
  active: boolean;
  material: StandardMaterial;
  baseColor: Color;
  startOpacity: number;
}

export class ParticleFxManager {
  private rootEntity: Entity;
  private pool: ActiveParticle[] = [];

  // Shared Materials
  private dustMat: StandardMaterial;
  private shockwaveMat: StandardMaterial;
  private goldSparkleMat: StandardMaterial;
  private potShardMat: StandardMaterial;
  private moteMat: StandardMaterial;

  constructor(app: Application) {
    this.rootEntity = new Entity('ParticleFxRoot');
    app.root.addChild(this.rootEntity);

    // 1. Dust Puff Material (Warm Kathmandu brick dust / limestone clay)
    this.dustMat = new StandardMaterial();
    this.dustMat.diffuse = new Color(0.96, 0.88, 0.74);
    this.dustMat.emissive = new Color(0.65, 0.52, 0.32);
    this.dustMat.blendType = 2; // pc.BLEND_NORMAL
    this.dustMat.opacity = 0.88;
    this.dustMat.update();

    // Generate circular ring procedural emissive glow mask
    const ringCanvas = document.createElement('canvas');
    ringCanvas.width = 128;
    ringCanvas.height = 128;
    const ctx = ringCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 128, 128);

      // Soft outer glow aura
      ctx.beginPath();
      ctx.arc(64, 64, 46, 0, Math.PI * 2);
      ctx.lineWidth = 22;
      ctx.strokeStyle = 'rgba(255, 175, 35, 0.5)';
      ctx.stroke();

      // Sharp bright core ring
      ctx.beginPath();
      ctx.arc(64, 64, 46, 0, Math.PI * 2);
      ctx.lineWidth = 10;
      ctx.strokeStyle = 'rgba(255, 235, 130, 1.0)';
      ctx.stroke();
    }

    const ringTex = new Texture(app.graphicsDevice, {
      width: 128,
      height: 128,
      format: PIXELFORMAT_RGBA8,
      mipmaps: false,
    });
    ringTex.setSource(ringCanvas);
    ringTex.upload();

    // 2. Shockwave Ring Material (Subtle Warm Amber Ground Ripple)
    this.shockwaveMat = new StandardMaterial();
    this.shockwaveMat.diffuse = new Color(0, 0, 0);
    this.shockwaveMat.emissive = new Color(0.85, 0.58, 0.16); // Soft warm festival amber glow
    this.shockwaveMat.emissiveMap = ringTex;
    this.shockwaveMat.blendType = BLEND_ADDITIVE;
    this.shockwaveMat.cull = CULLFACE_NONE;
    this.shockwaveMat.useLighting = false;
    this.shockwaveMat.update();

    // 3. Golden Coin Sparkle Material (Vibrant additive brass/gold gleam)
    this.goldSparkleMat = new StandardMaterial();
    this.goldSparkleMat.diffuse = new Color(1.0, 0.9, 0.35);
    this.goldSparkleMat.emissive = new Color(1.0, 0.85, 0.25);
    this.goldSparkleMat.blendType = BLEND_ADDITIVE;
    this.goldSparkleMat.cull = CULLFACE_NONE;
    this.goldSparkleMat.useLighting = false;
    this.goldSparkleMat.update();

    // 4. Terracotta Pot Ceramic Shard Material
    this.potShardMat = new StandardMaterial();
    this.potShardMat.diffuse = new Color(0.82, 0.36, 0.12);
    this.potShardMat.emissive = new Color(0.2, 0.08, 0.02);
    this.potShardMat.useMetalness = false;
    this.potShardMat.gloss = 0.25;
    this.potShardMat.update();

    // 5. Ambient Atmospheric Biome Mote Material
    this.moteMat = new StandardMaterial();
    this.moteMat.diffuse = new Color(0.96, 0.85, 0.45);
    this.moteMat.emissive = new Color(0.85, 0.65, 0.25);
    this.moteMat.blendType = BLEND_ADDITIVE;
    this.moteMat.cull = CULLFACE_NONE;
    this.moteMat.useLighting = false;
    this.moteMat.update();

    this.initPool();
  }

  private initPool(): void {
    // 32 Dust Puff Cubes
    for (let i = 0; i < 32; i++) {
      const entity = new Entity(`DustParticle_${i}`);
      entity.addComponent('render', { type: 'box' });
      entity.setLocalScale(0.1, 0.1, 0.1);
      entity.enabled = false;
      if (entity.render) entity.render.material = this.dustMat;
      this.rootEntity.addChild(entity);

      this.pool.push({
        entity,
        category: 'DUST',
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        gravity: -1.2,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        rotSpeedX: 0,
        rotSpeedY: 0,
        rotSpeedZ: 0,
        scaleStart: 0.16,
        scaleEnd: 0.44,
        currentScale: 0.16,
        life: 0,
        maxLife: 0.42,
        active: false,
        material: this.dustMat,
        baseColor: new Color(0.94, 0.86, 0.72),
        startOpacity: 0.85,
      });
    }

    // 16 Shockwave Rings (Expanding flat ground planes)
    for (let i = 0; i < 16; i++) {
      const entity = new Entity(`ShockwaveRing_${i}`);
      entity.addComponent('render', { type: 'plane' });
      entity.setLocalScale(0.8, 1.0, 0.8);
      entity.enabled = false;
      if (entity.render) entity.render.material = this.shockwaveMat;
      this.rootEntity.addChild(entity);

      this.pool.push({
        entity,
        category: 'RING',
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        gravity: 0,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        rotSpeedX: 0,
        rotSpeedY: 0,
        rotSpeedZ: 0,
        scaleStart: 0.4,
        scaleEnd: 1.3,
        currentScale: 0.4,
        life: 0,
        maxLife: 0.22,
        active: false,
        material: this.shockwaveMat,
        baseColor: new Color(1.0, 0.72, 0.18),
        startOpacity: 0.95,
      });
    }

    // 24 Coin Sparkle Stars/Diamonds
    for (let i = 0; i < 24; i++) {
      const entity = new Entity(`CoinSparkle_${i}`);
      entity.addComponent('render', { type: 'box' });
      entity.setLocalScale(0.08, 0.08, 0.08);
      entity.enabled = false;
      if (entity.render) entity.render.material = this.goldSparkleMat;
      this.rootEntity.addChild(entity);

      this.pool.push({
        entity,
        category: 'SPARKLE',
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        gravity: -2.8,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        rotSpeedX: 0,
        rotSpeedY: 0,
        rotSpeedZ: 0,
        scaleStart: 0.18,
        scaleEnd: 0.02,
        currentScale: 0.18,
        life: 0,
        maxLife: 0.36,
        active: false,
        material: this.goldSparkleMat,
        baseColor: new Color(1.0, 0.88, 0.2),
        startOpacity: 1.0,
      });
    }

    // 24 Terracotta Pot Shards
    for (let i = 0; i < 24; i++) {
      const entity = new Entity(`PotShard_${i}`);
      entity.addComponent('render', { type: 'box' });
      entity.setLocalScale(0.12, 0.12, 0.12);
      entity.enabled = false;
      if (entity.render) entity.render.material = this.potShardMat;
      this.rootEntity.addChild(entity);

      this.pool.push({
        entity,
        category: 'SHARD',
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        gravity: -9.8,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        rotSpeedX: 0,
        rotSpeedY: 0,
        rotSpeedZ: 0,
        scaleStart: 0.16,
        scaleEnd: 0.08,
        currentScale: 0.16,
        life: 0,
        maxLife: 0.52,
        active: false,
        material: this.potShardMat,
        baseColor: new Color(0.82, 0.36, 0.12),
        startOpacity: 1.0,
      });
    }

    // 24 Ambient Atmospheric Biome Motes
    for (let i = 0; i < 24; i++) {
      const entity = new Entity(`BiomeMote_${i}`);
      entity.addComponent('render', { type: 'box' });
      entity.setLocalScale(0.08, 0.08, 0.08);
      entity.enabled = false;
      if (entity.render) entity.render.material = this.moteMat;
      this.rootEntity.addChild(entity);

      this.pool.push({
        entity,
        category: 'MOTE',
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        gravity: -0.05,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        rotSpeedX: 0,
        rotSpeedY: 0,
        rotSpeedZ: 0,
        scaleStart: 0.1,
        scaleEnd: 0.02,
        currentScale: 0.1,
        life: 0,
        maxLife: 1.8,
        active: false,
        material: this.moteMat,
        baseColor: new Color(0.96, 0.85, 0.45),
        startOpacity: 0.8,
      });
    }
  }

  private getFreeParticle(category: ParticleCategory): ActiveParticle | null {
    for (const p of this.pool) {
      if (!p.active && p.category === category) {
        return p;
      }
    }
    return null;
  }

  /**
   * Spawns a radial cluster of dust puffs when Tuku lands from a hurdle vault.
   */
  public emitLandingDust(x: number, _y: number, z: number): void {
    const puffCount = 8;
    for (let i = 0; i < puffCount; i++) {
      const p = this.getFreeParticle('DUST');
      if (!p) break;

      const angle = (i / puffCount) * Math.PI * 2.0 + (Math.random() * 0.4 - 0.2);
      const speed = 1.8 + Math.random() * 1.2;

      p.active = true;
      p.x = x + Math.cos(angle) * 0.16;
      p.y = 0.04;
      p.z = z + Math.sin(angle) * 0.16;
      p.vx = Math.cos(angle) * speed;
      p.vy = 0.65 + Math.random() * 0.45;
      p.vz = Math.sin(angle) * speed;
      p.gravity = -1.2;
      p.scaleStart = 0.16;
      p.scaleEnd = 0.44 + Math.random() * 0.12;
      p.currentScale = p.scaleStart;
      p.life = 0;
      p.maxLife = 0.42 + Math.random() * 0.1;
      p.startOpacity = 0.85;

      p.rotX = Math.random() * 360;
      p.rotY = Math.random() * 360;
      p.rotZ = Math.random() * 360;
      p.rotSpeedX = (Math.random() - 0.5) * 360;
      p.rotSpeedY = (Math.random() - 0.5) * 360;
      p.rotSpeedZ = (Math.random() - 0.5) * 360;

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
      p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
    }
  }

  /**
   * Spawns dust skid puffs when Tuku executes a snappy skater lane dodge bank.
   */
  public emitDodgeSkid(x: number, _y: number, z: number, direction: number): void {
    const skidCount = 5;
    for (let i = 0; i < skidCount; i++) {
      const p = this.getFreeParticle('DUST');
      if (!p) break;

      const sprayDirX = -Math.sign(direction);
      p.active = true;
      p.x = x + (Math.random() * 0.25 - 0.125);
      p.y = 0.03;
      p.z = z + (Math.random() * 0.3 - 0.15);
      p.vx = sprayDirX * (1.6 + Math.random() * 1.4);
      p.vy = 0.45 + Math.random() * 0.35;
      p.vz = 1.2 + Math.random() * 1.0;
      p.gravity = -1.2;
      p.scaleStart = 0.14;
      p.scaleEnd = 0.36 + Math.random() * 0.08;
      p.currentScale = p.scaleStart;
      p.life = 0;
      p.maxLife = 0.38;
      p.startOpacity = 0.8;

      p.rotX = Math.random() * 360;
      p.rotY = Math.random() * 360;
      p.rotZ = Math.random() * 360;
      p.rotSpeedX = (Math.random() - 0.5) * 450;
      p.rotSpeedY = (Math.random() - 0.5) * 450;
      p.rotSpeedZ = (Math.random() - 0.5) * 450;

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
      p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
    }
  }

  /**
   * Spawns a subtle stationary ground ripple ring and outward brick dust puffs where Lakhey plants his boots.
   */
  public emitStompShockwave(x: number, _y: number, z: number, volume = 1.0): void {
    // 1. Subtle, stationary ground ripple staying on the pavement where the boot planted
    const ring = this.getFreeParticle('RING');
    if (ring) {
      ring.active = true;
      ring.x = x;
      ring.y = 0.02;
      ring.z = z;
      ring.vx = 0;
      ring.vy = 0;
      ring.vz = 0;
      ring.gravity = 0;
      ring.scaleStart = 0.4;
      ring.scaleEnd = 1.3 + Math.min(1.0, volume) * 0.3;
      ring.currentScale = ring.scaleStart;
      ring.life = 0;
      ring.maxLife = 0.22;
      ring.startOpacity = 0.85;

      ring.entity.enabled = true;
      ring.entity.setPosition(ring.x, ring.y, ring.z);
      ring.entity.setLocalScale(ring.scaleStart, 1.0, ring.scaleStart);
    }

    // 2. Heavy Outward Dust Puffs around Lakhey's foot plant
    const puffCount = 6;
    for (let i = 0; i < puffCount; i++) {
      const p = this.getFreeParticle('DUST');
      if (!p) break;

      const angle = (i / puffCount) * Math.PI * 2.0;
      const speed = (1.2 + Math.random() * 0.8) * Math.min(1.2, volume);

      p.active = true;
      p.x = x + Math.cos(angle) * 0.25;
      p.y = 0.04;
      p.z = z + Math.sin(angle) * 0.25;
      p.vx = Math.cos(angle) * speed;
      p.vy = 0.45 + Math.random() * 0.3;
      p.vz = Math.sin(angle) * speed;
      p.gravity = -1.2;
      p.scaleStart = 0.16;
      p.scaleEnd = 0.36 + Math.random() * 0.1;
      p.currentScale = p.scaleStart;
      p.life = 0;
      p.maxLife = 0.3;
      p.startOpacity = 0.85;

      p.rotX = Math.random() * 360;
      p.rotY = Math.random() * 360;
      p.rotZ = Math.random() * 360;
      p.rotSpeedX = (Math.random() - 0.5) * 360;
      p.rotSpeedY = (Math.random() - 0.5) * 360;
      p.rotSpeedZ = (Math.random() - 0.5) * 360;

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
      p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
    }
  }

  /**
   * Spawns radiant gold sparkles when Tuku collects a ceremonial brass coin.
   */
  public emitCoinSparkle(x: number, y: number, z: number): void {
    const sparkleCount = 10;
    for (let i = 0; i < sparkleCount; i++) {
      const p = this.getFreeParticle('SPARKLE');
      if (!p) break;

      const angle = (i / sparkleCount) * Math.PI * 2.0 + (Math.random() * 0.5 - 0.25);
      const speed = 1.4 + Math.random() * 1.6;

      p.active = true;
      p.x = x + (Math.random() * 0.1 - 0.05);
      p.y = y + (Math.random() * 0.1 - 0.05);
      p.z = z + (Math.random() * 0.1 - 0.05);
      p.vx = Math.cos(angle) * speed;
      p.vy = 2.2 + Math.random() * 1.5; // Upward radiant fountain pop
      p.vz = Math.sin(angle) * speed;
      p.gravity = -3.8;
      p.scaleStart = 0.18;
      p.scaleEnd = 0.02;
      p.currentScale = p.scaleStart;
      p.life = 0;
      p.maxLife = 0.38 + Math.random() * 0.12;
      p.startOpacity = 1.0;

      p.rotX = Math.random() * 360;
      p.rotY = Math.random() * 360;
      p.rotZ = Math.random() * 360;
      p.rotSpeedX = (Math.random() - 0.5) * 720;
      p.rotSpeedY = (Math.random() - 0.5) * 720;
      p.rotSpeedZ = (Math.random() - 0.5) * 720;

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
      p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
    }
  }

  /**
   * Spawns a subtle gold ember trailing behind a coin being magnetically attracted to Tuku
   */
  public emitCoinMagneticTrail(x: number, y: number, z: number): void {
    const p = this.getFreeParticle('SPARKLE');
    if (!p) return;

    p.active = true;
    p.x = x + (Math.random() * 0.08 - 0.04);
    p.y = y + (Math.random() * 0.08 - 0.04);
    p.z = z + 0.1;
    p.vx = (Math.random() - 0.5) * 0.5;
    p.vy = (Math.random() - 0.5) * 0.5;
    p.vz = 0.8 + Math.random() * 0.6; // Soft trailing drift backwards
    p.gravity = 0;
    p.scaleStart = 0.1;
    p.scaleEnd = 0.01;
    p.currentScale = p.scaleStart;
    p.life = 0;
    p.maxLife = 0.22;
    p.startOpacity = 0.85;

    p.rotX = Math.random() * 360;
    p.rotY = Math.random() * 360;
    p.rotZ = Math.random() * 360;
    p.rotSpeedX = (Math.random() - 0.5) * 360;
    p.rotSpeedY = (Math.random() - 0.5) * 360;
    p.rotSpeedZ = (Math.random() - 0.5) * 360;

    p.entity.enabled = true;
    p.entity.setPosition(p.x, p.y, p.z);
    p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
    p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
  }

  /**
   * Spawns a subtle cobblestone clay dust puff trailing behind a rolling matka pot
   */
  public emitMatkaRollDust(x: number, _y: number, z: number): void {
    const p = this.getFreeParticle('DUST');
    if (!p) return;

    p.active = true;
    p.x = x + (Math.random() * 0.2 - 0.1);
    p.y = 0.04;
    p.z = z + 0.25; // Directly behind rolling pot
    p.vx = (Math.random() - 0.5) * 0.6;
    p.vy = 0.2 + Math.random() * 0.2;
    p.vz = 1.0 + Math.random() * 0.8;
    p.gravity = -0.5;
    p.scaleStart = 0.12;
    p.scaleEnd = 0.28;
    p.currentScale = p.scaleStart;
    p.life = 0;
    p.maxLife = 0.25;
    p.startOpacity = 0.6;

    p.rotX = Math.random() * 360;
    p.rotY = Math.random() * 360;
    p.rotZ = Math.random() * 360;
    p.rotSpeedX = (Math.random() - 0.5) * 200;
    p.rotSpeedY = (Math.random() - 0.5) * 200;
    p.rotSpeedZ = (Math.random() - 0.5) * 200;

    p.entity.enabled = true;
    p.entity.setPosition(p.x, p.y, p.z);
    p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
    p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
  }

  /**
   * Spawns vibrant friction sparks spraying diagonally away from a close-call hazard brush
   */
  public emitNearMissFriction(x: number, y: number, z: number, lateralDir: number): void {
    const sparkCount = 8;
    for (let i = 0; i < sparkCount; i++) {
      const p = this.getFreeParticle('SPARKLE');
      if (!p) break;

      p.active = true;
      p.x = x - lateralDir * 0.35 + (Math.random() * 0.1 - 0.05);
      p.y = y + 0.3 + Math.random() * 0.4;
      p.z = z + (Math.random() * 0.2 - 0.1);
      // Spray away from barrier and back along Z
      p.vx = -lateralDir * (1.8 + Math.random() * 2.2);
      p.vy = 1.2 + Math.random() * 1.6;
      p.vz = 2.5 + Math.random() * 2.0;
      p.gravity = -4.5;
      p.scaleStart = 0.22;
      p.scaleEnd = 0.02;
      p.currentScale = p.scaleStart;
      p.life = 0;
      p.maxLife = 0.24 + Math.random() * 0.1;
      p.startOpacity = 1.0;

      p.rotX = Math.random() * 360;
      p.rotY = Math.random() * 360;
      p.rotZ = Math.random() * 360;
      p.rotSpeedX = (Math.random() - 0.5) * 800;
      p.rotSpeedY = (Math.random() - 0.5) * 800;
      p.rotSpeedZ = (Math.random() - 0.5) * 800;

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
      p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
    }
  }

  /**
   * Spawns streamlined aerodynamic wind streaks behind Tuku when performing a Clean Vault
   */
  public emitVaultSpeedStreaks(x: number, y: number, z: number): void {
    const streakCount = 6;
    for (let i = 0; i < streakCount; i++) {
      const p = this.getFreeParticle('SPARKLE');
      if (!p) break;

      p.active = true;
      p.x = x + (Math.random() * 0.6 - 0.3);
      p.y = y + 0.1 + Math.random() * 0.3;
      p.z = z + 0.3 + Math.random() * 0.2;
      p.vx = (Math.random() - 0.5) * 0.6;
      p.vy = (Math.random() - 0.5) * 0.3;
      p.vz = 4.2 + Math.random() * 2.2; // Rapid stream backward
      p.gravity = 0;
      p.scaleStart = 0.24;
      p.scaleEnd = 0.04;
      p.currentScale = p.scaleStart;
      p.life = 0;
      p.maxLife = 0.22;
      p.startOpacity = 0.9;

      p.rotX = Math.random() * 360;
      p.rotY = Math.random() * 360;
      p.rotZ = Math.random() * 360;
      p.rotSpeedX = (Math.random() - 0.5) * 360;
      p.rotSpeedY = (Math.random() - 0.5) * 360;
      p.rotSpeedZ = (Math.random() - 0.5) * 360;

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
      p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
    }
  }

  /**
   * Spawns ground friction dust and golden stone abrasion sparks spraying behind Tuku during a slide
   */
  public emitSlideFriction(x: number, y: number, z: number): void {
    // 1. Pavement friction dust
    const dust = this.getFreeParticle('DUST');
    if (dust) {
      dust.active = true;
      dust.x = x + (Math.random() * 0.25 - 0.125);
      dust.y = Math.max(0.02, y);
      dust.z = z + 0.3; // Spraying backward behind sliding boots
      dust.vx = (Math.random() - 0.5) * 0.8;
      dust.vy = 0.25 + Math.random() * 0.25;
      dust.vz = 2.8 + Math.random() * 1.6;
      dust.gravity = -0.8;
      dust.scaleStart = 0.16;
      dust.scaleEnd = 0.38;
      dust.currentScale = dust.scaleStart;
      dust.life = 0;
      dust.maxLife = 0.26;
      dust.startOpacity = 0.75;
      dust.entity.enabled = true;
      dust.entity.setPosition(dust.x, dust.y, dust.z);
      dust.entity.setLocalScale(dust.currentScale, dust.currentScale, dust.currentScale);
    }

    // 2. Gritty golden stone friction sparks
    const spark = this.getFreeParticle('SPARKLE');
    if (spark) {
      spark.active = true;
      spark.x = x + (Math.random() * 0.2 - 0.1);
      spark.y = Math.max(0.04, y);
      spark.z = z + 0.2;
      spark.vx = (Math.random() - 0.5) * 1.8;
      spark.vy = 0.6 + Math.random() * 0.8;
      spark.vz = 2.4 + Math.random() * 2.0;
      spark.gravity = -5.0;
      spark.scaleStart = 0.18;
      spark.scaleEnd = 0.02;
      spark.currentScale = spark.scaleStart;
      spark.life = 0;
      spark.maxLife = 0.2;
      spark.startOpacity = 1.0;
      spark.entity.enabled = true;
      spark.entity.setPosition(spark.x, spark.y, spark.z);
      spark.entity.setLocalScale(spark.currentScale, spark.currentScale, spark.currentScale);
    }
  }

  /**
   * Spawns swirling festival embers and fiery red-gold energy motes around Lakhey
   */
  public emitGuardianAura(x: number, y: number, z: number, intensity = 1.0): void {
    const p = this.getFreeParticle('MOTE');
    if (!p) return;

    p.active = true;
    p.life = 0;
    p.maxLife = 0.6 + Math.random() * 0.4;
    p.x = x + (Math.random() - 0.5) * 1.4;
    p.y = y + 0.4 + Math.random() * 1.2;
    p.z = z + (Math.random() - 0.5) * 0.8;

    p.vx = (Math.random() - 0.5) * 0.8 * intensity;
    p.vy = (0.6 + Math.random() * 0.8) * intensity; // High upward fiery draft
    p.vz = (Math.random() - 0.5) * 0.8 * intensity;
    p.gravity = -0.05;

    p.scaleStart = 0.12 * intensity;
    p.scaleEnd = 0.02;
    p.currentScale = p.scaleStart;

    p.material.diffuse.set(1.0, 0.25, 0.05); // Fiery festival red-amber
    p.material.emissive.set(1.0, 0.45, 0.1);
    p.material.update();

    p.entity.enabled = true;
    p.entity.setPosition(p.x, p.y, p.z);
    p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
  }

  /**
   * Spawns heavy festival ground shockwave ring and fiery embers when Lakhey stomps
   */
  public emitGuardianFootstep(x: number, y: number, z: number): void {
    // 1. Expanding ground shockwave ring
    this.emitStompShockwave(x, y, z, 1.2);

    // 2. Fiery golden festival sparks bursting outward
    for (let i = 0; i < 3; i++) {
      const spark = this.getFreeParticle('SPARKLE');
      if (!spark) break;

      spark.active = true;
      spark.x = x + (Math.random() * 0.4 - 0.2);
      spark.y = 0.06;
      spark.z = z + (Math.random() * 0.4 - 0.2);
      spark.vx = (Math.random() - 0.5) * 2.2;
      spark.vy = 1.0 + Math.random() * 1.2;
      spark.vz = (Math.random() - 0.5) * 2.2;
      spark.gravity = -6.5;
      spark.scaleStart = 0.22;
      spark.scaleEnd = 0.03;
      spark.currentScale = spark.scaleStart;
      spark.life = 0;
      spark.maxLife = 0.28;
      spark.startOpacity = 1.0;
      spark.entity.enabled = true;
      spark.entity.setPosition(spark.x, spark.y, spark.z);
      spark.entity.setLocalScale(spark.currentScale, spark.currentScale, spark.currentScale);
    }
  }

  /**
   * Spawns terracotta pot ceramic shards and clay dust puff when a matka pot fractures.
   */
  public emitPotShatter(x: number, y: number, z: number): void {
    // 1. Shattered ceramic shards flying in 3D arc
    const shardCount = 14;
    for (let i = 0; i < shardCount; i++) {
      const p = this.getFreeParticle('SHARD');
      if (!p) break;

      const angle = (i / shardCount) * Math.PI * 2.0 + (Math.random() * 0.4 - 0.2);
      const speed = 2.2 + Math.random() * 2.4;

      p.active = true;
      p.x = x + Math.cos(angle) * 0.2;
      p.y = y + 0.25;
      p.z = z + Math.sin(angle) * 0.2;
      p.vx = Math.cos(angle) * speed;
      p.vy = 2.8 + Math.random() * 2.2; // High ballistic pop
      p.vz = Math.sin(angle) * speed;
      p.gravity = -12.5; // Heavy realistic ceramic gravity
      p.scaleStart = 0.18;
      p.scaleEnd = 0.08;
      p.currentScale = p.scaleStart;
      p.life = 0;
      p.maxLife = 0.55;
      p.startOpacity = 1.0;

      p.rotX = Math.random() * 360;
      p.rotY = Math.random() * 360;
      p.rotZ = Math.random() * 360;
      p.rotSpeedX = (Math.random() - 0.5) * 900;
      p.rotSpeedY = (Math.random() - 0.5) * 900;
      p.rotSpeedZ = (Math.random() - 0.5) * 900;

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
      p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
    }

    // 2. Expanding terracotta dust cloud
    const puffCount = 6;
    for (let i = 0; i < puffCount; i++) {
      const p = this.getFreeParticle('DUST');
      if (!p) break;

      const angle = (i / puffCount) * Math.PI * 2.0;
      const speed = 1.2 + Math.random() * 1.0;

      p.active = true;
      p.x = x + Math.cos(angle) * 0.15;
      p.y = y + 0.1;
      p.z = z + Math.sin(angle) * 0.15;
      p.vx = Math.cos(angle) * speed;
      p.vy = 0.8 + Math.random() * 0.4;
      p.vz = Math.sin(angle) * speed;
      p.gravity = -0.8;
      p.scaleStart = 0.2;
      p.scaleEnd = 0.55;
      p.currentScale = p.scaleStart;
      p.life = 0;
      p.maxLife = 0.45;
      p.startOpacity = 0.85;

      p.rotX = Math.random() * 360;
      p.rotY = Math.random() * 360;
      p.rotZ = Math.random() * 360;
      p.rotSpeedX = (Math.random() - 0.5) * 360;
      p.rotSpeedY = (Math.random() - 0.5) * 360;
      p.rotSpeedZ = (Math.random() - 0.5) * 360;

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
      p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
    }
  }

  /**
   * Spawns atmospheric floating motes / embers / mist wisps tailored to the current biome
   */
  public emitAmbientBiomeMote(playerX: number, playerY: number, playerZ: number, biome: string): void {
    const p = this.getFreeParticle('MOTE');
    if (!p) return;

    p.active = true;
    p.life = 0;
    p.maxLife = 1.6 + Math.random() * 0.8;

    p.x = playerX + (Math.random() - 0.5) * 6.5;
    p.y = playerY + 0.5 + Math.random() * 2.5;
    p.z = playerZ - (8 + Math.random() * 16);

    if (biome === 'DURBAR_ALLEY') {
      p.vx = (Math.random() - 0.5) * 0.6;
      p.vy = 0.25 + Math.random() * 0.4;
      p.vz = (Math.random() - 0.5) * 0.4;
      p.gravity = -0.04;
      p.scaleStart = 0.08;
      p.scaleEnd = 0.02;
      p.material.diffuse.set(0.96, 0.68, 0.18);
      p.material.emissive.set(0.85, 0.55, 0.12);
    } else if (biome === 'RIVER_CAUSEWAY') {
      p.vx = (Math.random() - 0.5) * 1.2;
      p.vy = 0.18 + Math.random() * 0.25;
      p.vz = (Math.random() - 0.5) * 0.6;
      p.gravity = -0.06;
      p.scaleStart = 0.12;
      p.scaleEnd = 0.03;
      p.material.diffuse.set(0.72, 0.90, 0.98);
      p.material.emissive.set(0.45, 0.75, 0.92);
    } else {
      p.vx = (Math.random() - 0.5) * 0.8;
      p.vy = 0.35 + Math.random() * 0.35;
      p.vz = (Math.random() - 0.5) * 0.5;
      p.gravity = -0.02;
      p.scaleStart = 0.09;
      p.scaleEnd = 0.02;
      p.material.diffuse.set(0.95, 0.88, 0.65);
      p.material.emissive.set(0.75, 0.65, 0.35);
    }
    p.material.update();
    p.currentScale = p.scaleStart;

    p.rotX = Math.random() * 360;
    p.rotY = Math.random() * 360;
    p.rotZ = Math.random() * 360;
    p.rotSpeedX = (Math.random() - 0.5) * 60;
    p.rotSpeedY = (Math.random() - 0.5) * 60;
    p.rotSpeedZ = (Math.random() - 0.5) * 60;

    p.entity.enabled = true;
    p.entity.setPosition(p.x, p.y, p.z);
    p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
    p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
  }

  public update(dt: number): void {
    for (const p of this.pool) {
      if (!p.active) continue;

      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        p.entity.enabled = false;
        continue;
      }

      const progress = p.life / p.maxLife;

      // Apply gravity and update position
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y = Math.max(0.01, p.y + p.vy * dt);
      p.z += p.vz * dt;

      // Scale transition
      if (p.category === 'RING') {
        const ringEase = 1.0 - Math.pow(1.0 - progress, 2);
        p.currentScale = p.scaleStart + (p.scaleEnd - p.scaleStart) * ringEase;
        p.entity.setPosition(p.x, p.y, p.z);
        p.entity.setLocalScale(p.currentScale, 1.0, p.currentScale);
      } else {
        const scaleEase = 1.0 - Math.pow(1.0 - progress, 2);
        p.currentScale = p.scaleStart + (p.scaleEnd - p.scaleStart) * scaleEase;

        p.rotX += p.rotSpeedX * dt;
        p.rotY += p.rotSpeedY * dt;
        p.rotZ += p.rotSpeedZ * dt;
        p.entity.setPosition(p.x, p.y, p.z);
        p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
        p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
      }
    }
  }

  /**
   * Biome 2: Water splash fountain when vaulting over Ghat Wooden Steps
   */
  public emitWaterSplash(x: number, y: number, z: number): void {
    const splashCount = 10;
    for (let i = 0; i < splashCount; i++) {
      const p = this.getFreeParticle('SPARKLE');
      if (!p) break;

      const angle = (i / splashCount) * Math.PI * 2.0;
      const spread = 0.8 + Math.random() * 0.9;

      p.active = true;
      p.x = x + Math.cos(angle) * 0.2;
      p.y = y + 0.05;
      p.z = z + Math.sin(angle) * 0.2;
      p.vx = Math.cos(angle) * spread;
      p.vy = 2.2 + Math.random() * 1.4; // Upward fountain arc
      p.vz = Math.sin(angle) * spread;
      p.gravity = -5.8;
      p.scaleStart = 0.18;
      p.scaleEnd = 0.04;
      p.currentScale = p.scaleStart;
      p.life = 0;
      p.maxLife = 0.45;
      p.startOpacity = 0.92;

      p.material.diffuse.set(0.65, 0.90, 1.0);
      p.material.emissive.set(0.40, 0.75, 0.95);
      p.material.update();

      p.rotX = Math.random() * 360;
      p.rotY = Math.random() * 360;
      p.rotZ = Math.random() * 360;
      p.rotSpeedX = (Math.random() - 0.5) * 400;
      p.rotSpeedY = (Math.random() - 0.5) * 400;
      p.rotSpeedZ = (Math.random() - 0.5) * 400;

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
      p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
    }
  }

  /**
   * Biome 3: Mountain pass crosswind gale streaks when dodging through Prayer Flag Gale
   */
  public emitWindGaleStreaks(x: number, y: number, z: number): void {
    const streakCount = 8;
    for (let i = 0; i < streakCount; i++) {
      const p = this.getFreeParticle('MOTE');
      if (!p) break;

      p.active = true;
      p.life = 0;
      p.maxLife = 0.52 + Math.random() * 0.25;

      p.x = x - 1.2 + Math.random() * 0.4;
      p.y = y + 0.3 + (i * 0.14);
      p.z = z + (Math.random() - 0.5) * 0.6;

      // Swift horizontal lateral wind rush across pass
      p.vx = 4.5 + Math.random() * 2.2;
      p.vy = (Math.random() - 0.5) * 0.4;
      p.vz = 0.8 + Math.random() * 0.5;
      p.gravity = 0;
      p.scaleStart = 0.22;
      p.scaleEnd = 0.02;
      p.currentScale = p.scaleStart;

      // Multi-colored Tibetan prayer flag aura ribbons
      const colors = [
        { r: 0.2, g: 0.5, b: 0.95 },  // Blue (Sky)
        { r: 0.95, g: 0.95, b: 0.95 },// White (Air)
        { r: 0.95, g: 0.25, b: 0.2 }, // Red (Fire)
        { r: 0.2, g: 0.85, b: 0.3 },  // Green (Water)
        { r: 0.95, g: 0.85, b: 0.15 },// Yellow (Earth)
      ];
      const c = colors[i % colors.length];
      p.material.diffuse.set(c.r, c.g, c.b);
      p.material.emissive.set(c.r * 0.8, c.g * 0.8, c.b * 0.8);
      p.material.update();

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(0, 0, 0);
      p.entity.setLocalScale(p.currentScale * 2.5, p.currentScale * 0.5, p.currentScale);
    }
  }

  /**
   * Phase 4: Torana Gateway Arch Milestone Celebration
   * Erupts a celebratory cascade of Kathmandu sayapatri marigold petals and golden sparkles
   * showering down from the ceremonial Torana arch when crossing 140m / 280m / 420m thresholds.
   */
  public emitToranaMilestoneCelebration(x: number, y: number, z: number): void {
    // 1. Swirling Sayapatri Marigold Petal Cascade (Golden Yellow & Saffron Orange)
    const petalCount = 26;
    for (let i = 0; i < petalCount; i++) {
      const p = this.getFreeParticle('MOTE');
      if (!p) break;

      p.active = true;
      p.life = 0;
      p.maxLife = 1.6 + Math.random() * 0.7;

      // Distribute across the Torana arch span (5.6m span)
      const spanX = (Math.random() - 0.5) * 5.6;
      p.x = x + spanX;
      p.y = y - Math.random() * 0.8; // Falling from lintel height (4.6m - 5.4m)
      p.z = z + (Math.random() - 0.5) * 1.6;

      // Gentle tumbling air drift
      p.vx = (Math.random() - 0.5) * 1.6;
      p.vy = -1.2 - Math.random() * 1.6;
      p.vz = 0.4 + Math.random() * 0.9;
      p.gravity = -2.2;
      p.scaleStart = 0.24 + Math.random() * 0.08;
      p.scaleEnd = 0.10;
      p.currentScale = p.scaleStart;

      // Alternating festival marigold yellow and deep saffron hues
      const isSaffron = i % 2 === 0;
      if (isSaffron) {
        p.material.diffuse.set(0.96, 0.42, 0.08); // Deep Saffron
        p.material.emissive.set(0.65, 0.25, 0.05);
      } else {
        p.material.diffuse.set(0.98, 0.78, 0.12); // Golden Marigold (Sayapatri)
        p.material.emissive.set(0.70, 0.52, 0.08);
      }
      p.material.update();

      p.rotX = Math.random() * 360;
      p.rotY = Math.random() * 360;
      p.rotZ = Math.random() * 360;
      p.rotSpeedX = (Math.random() - 0.5) * 280;
      p.rotSpeedY = (Math.random() - 0.5) * 320;
      p.rotSpeedZ = (Math.random() - 0.5) * 240;

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
      p.entity.setLocalScale(p.currentScale * 1.4, p.currentScale * 0.8, p.currentScale);
    }

    // 2. Radiant Golden Milestone Sparkle Eruption
    const sparkleCount = 16;
    for (let i = 0; i < sparkleCount; i++) {
      const p = this.getFreeParticle('SPARKLE');
      if (!p) break;

      const angle = (i / sparkleCount) * Math.PI * 2.0;
      const speed = 1.8 + Math.random() * 2.2;

      p.active = true;
      p.life = 0;
      p.maxLife = 0.65;
      p.x = x + Math.cos(angle) * 1.8;
      p.y = y - 0.4 + Math.sin(angle) * 0.8;
      p.z = z;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed * 0.6;
      p.vz = 0.8 + Math.random() * 0.6;
      p.gravity = -1.5;
      p.scaleStart = 0.26;
      p.scaleEnd = 0.02;
      p.currentScale = p.scaleStart;

      p.material.diffuse.set(1.0, 0.92, 0.45);
      p.material.emissive.set(0.95, 0.80, 0.30);
      p.material.update();

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(0, 0, 0);
      p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
    }
  }

  /**
   * Festive Guardian Friendly Catch Celebration Shower
   * Swirls golden sparks and sacred Sayapatri marigold petals as Lakhey scoops Tuku
   */
  public emitCaughtCelebration(x: number, y: number, z: number): void {
    // 1. Expanding Golden Amber Ground Shockwave Ring
    this.emitStompShockwave(x, 0.02, z, 1.4);

    // 2. Swirling Sayapatri Marigold Petal Burst
    const petalCount = 28;
    for (let i = 0; i < petalCount; i++) {
      const p = this.getFreeParticle('MOTE');
      if (!p) break;

      const angle = (i / petalCount) * Math.PI * 2.0;
      const radius = 0.4 + Math.random() * 0.8;
      const speed = 1.2 + Math.random() * 1.8;

      p.active = true;
      p.life = 0;
      p.maxLife = 2.2 + Math.random() * 0.6;
      p.x = x + Math.cos(angle) * radius;
      p.y = y + 0.2 + Math.random() * 0.6;
      p.z = z + Math.sin(angle) * radius;

      // Upward swirling vortex
      p.vx = Math.cos(angle) * speed * 0.7 + (Math.random() - 0.5) * 0.8;
      p.vy = 1.6 + Math.random() * 1.8;
      p.vz = Math.sin(angle) * speed * 0.7 + (Math.random() - 0.5) * 0.8;
      p.gravity = -1.2;
      p.scaleStart = 0.26 + Math.random() * 0.08;
      p.scaleEnd = 0.08;
      p.currentScale = p.scaleStart;

      const isSaffron = i % 2 === 0;
      if (isSaffron) {
        p.material.diffuse.set(0.96, 0.42, 0.08); // Deep Saffron
        p.material.emissive.set(0.65, 0.25, 0.05);
      } else {
        p.material.diffuse.set(0.98, 0.78, 0.12); // Golden Marigold
        p.material.emissive.set(0.70, 0.52, 0.08);
      }
      p.material.update();

      p.rotX = Math.random() * 360;
      p.rotY = Math.random() * 360;
      p.rotZ = Math.random() * 360;
      p.rotSpeedX = (Math.random() - 0.5) * 320;
      p.rotSpeedY = (Math.random() - 0.5) * 360;
      p.rotSpeedZ = (Math.random() - 0.5) * 280;

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(p.rotX, p.rotY, p.rotZ);
      p.entity.setLocalScale(p.currentScale * 1.3, p.currentScale * 0.75, p.currentScale);
    }

    // 3. Radiant Golden Sparks Eruption
    const sparkleCount = 20;
    for (let i = 0; i < sparkleCount; i++) {
      const p = this.getFreeParticle('SPARKLE');
      if (!p) break;

      const angle = (i / sparkleCount) * Math.PI * 2.0;
      const speed = 2.0 + Math.random() * 2.5;

      p.active = true;
      p.life = 0;
      p.maxLife = 1.1;
      p.x = x + Math.cos(angle) * 0.4;
      p.y = y + 0.4 + (Math.random() - 0.5) * 0.5;
      p.z = z + Math.sin(angle) * 0.4;
      p.vx = Math.cos(angle) * speed;
      p.vy = 2.2 + Math.random() * 1.8;
      p.vz = Math.sin(angle) * speed;
      p.gravity = -2.8;
      p.scaleStart = 0.28;
      p.scaleEnd = 0.02;
      p.currentScale = p.scaleStart;

      p.material.diffuse.set(1.0, 0.95, 0.5);
      p.material.emissive.set(0.98, 0.85, 0.35);
      p.material.update();

      p.entity.enabled = true;
      p.entity.setPosition(p.x, p.y, p.z);
      p.entity.setEulerAngles(0, 0, 0);
      p.entity.setLocalScale(p.currentScale, p.currentScale, p.currentScale);
    }
  }

  public getActiveCount(): number {
    return this.pool.filter(p => p.active).length;
  }

  public reset(): void {
    for (const p of this.pool) {
      p.active = false;
      p.entity.enabled = false;
      p.life = 0;
    }
  }
}
