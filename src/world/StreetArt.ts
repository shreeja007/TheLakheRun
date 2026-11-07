import {
  Application,
  Color,
  createSphere,
  Entity,
  FILTER_LINEAR,
  GraphNode,
  MeshInstance,
  StandardMaterial,
  Texture,
  Vec2,
} from 'playcanvas';
import { assignBatchGroup } from '../game/Batching';

/** A Durbar tile that recycles in place, with the box buildings its new models replace. */
export interface StreetTile {
  index: number;
  durbarRoot: Entity;
}

const KIT_URL = '/models/street_kit.glb';
const TILE_LENGTH = 30;
const ROAD_FRONT_X = -3.72; // street-side edge of the left building row, just past the curb
const ALLEY_BACK_X = -8.3;

// Everyday buildings, gateway, cart and spectators replacing box facades along the Durbar street.
// Offsets are metres along the tile (road runs toward -Z); widths keep every model inside its slot.
type Placement = { model: 'Building01' | 'Building02' | 'Gateway'; z: number };
const FIRST_SLOT: Placement[][] = [
  [{ model: 'Building01', z: -3.7 }, { model: 'Building02', z: -10.7 }],
  [{ model: 'Building02', z: -4.1 }, { model: 'Building01', z: -11.1 }],
];
// Second slot of even tiles (odd tiles keep their Falcha pavilion). Keyed by tile index.
const SECOND_SLOT: Record<number, Placement[]> = {
  2: [{ model: 'Gateway', z: -18.6 }, { model: 'Building01', z: -25.4 }],
  4: [{ model: 'Building02', z: -19.1 }, { model: 'Building01', z: -26.1 }],
  // The first milestone arch stands at z = -20 on tile 6, so its gateway-free slot leaves that space open.
  6: [{ model: 'Building02', z: -26 }],
};
const FRONT_DEPTH: Record<Placement['model'], number> = { Building01: 2.11, Building02: 2.15, Gateway: 0.5 };

// Spectators stand behind the right balustrade; z values avoid the lions at -9 and -21 and the lamp at -15.
const SPECTATOR_SPOTS: { x: number; z: number; yaw: number }[] = [
  { x: 4.75, z: -3.4, yaw: 8 }, { x: 5.3, z: -5.0, yaw: -12 }, { x: 4.8, z: -12.2, yaw: 14 },
  { x: 5.4, z: -17.6, yaw: -6 }, { x: 4.75, z: -24.2, yaw: 10 }, { x: 5.2, z: -26.4, yaw: -14 },
];

/**
 * T042–T044: places the optimized street kit and the hanging lights on the Durbar tiles.
 *
 * Nothing here is ever enabled or disabled during a run. Attaching does switch off the old box
 * facades, which rebuilds the road batch once, so RoadView only calls attach() outside a run; a
 * player who starts before the kit has loaded keeps the old facades until their next retry. If the
 * kit cannot load, the old facades simply stay.
 */
export class StreetArt {
  private app: Application;
  private tiles: StreetTile[];
  private promenadeFigures: Entity[];
  private template: Entity | null = null;
  private attached = false;
  private texturesPending = 4;
  private groupId?: number;
  private crowdGroupId?: number;
  private cheering: { node: GraphNode; phase: number; baseY: number }[] = [];
  private readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  private brick = this.flat(new Color(0.52, 0.22, 0.13), 0.2);
  private roof = this.flat(new Color(0.4, 0.16, 0.11), 0.2);
  private alleyWall = this.flat(new Color(0.43, 0.18, 0.11), 0.2);
  private alleyFloor = this.flat(new Color(0.24, 0.17, 0.14), 0.15);
  private timber = this.flat(new Color(0.2, 0.12, 0.07), 0.25);
  private stone = this.flat(new Color(0.36, 0.33, 0.29), 0.15);
  private window = this.flat(new Color(0.08, 0.05, 0.03), 0.3);
  private palette = this.flat(new Color(0.6, 0.55, 0.5), 0.2);
  private cable = this.flat(new Color(0.05, 0.05, 0.06), 0.2);
  private bulb = this.flat(new Color(1, 0.86, 0.6), 0.5);

  constructor(app: Application, tiles: StreetTile[], promenadeFigures: Entity[]) {
    this.app = app;
    this.tiles = tiles;
    this.promenadeFigures = promenadeFigures;

    this.window.emissive = new Color(0.55, 0.32, 0.09); // dusk: lamps on inside, matching the street's lanterns
    this.window.update();
    this.bulb.emissive = new Color(1.0, 0.82, 0.5);
    this.bulb.update();

    this.loadTexture('/models/textures/tex_brick_dachi.webp', this.brick, new Vec2(1.5, 2.2));
    this.loadTexture('/models/textures/tex_roof_tiles.webp', this.roof, new Vec2(1.2, 1.2));
    this.loadTexture('/models/textures/tex_brick_aged.webp', this.alleyWall);
    this.loadTexture('/models/textures/tex_street_palette.webp', this.palette, undefined, true);

    app.assets.loadFromUrl(KIT_URL, 'container', (err, asset) => {
      if (err || !asset?.resource) {
        console.warn('Street kit unavailable; keeping the procedural Durbar facades.', err);
        return;
      }
      const root = (asset.resource as { instantiateRenderEntity(): Entity }).instantiateRenderEntity();
      this.applyKitMaterials(root);
      this.template = root;
    });
  }

  /** Swap in the models once the kit is ready. Call outside a run only (see class comment). */
  public attach(): void {
    // A batch built before its textures arrive keeps an untextured shader, so wait for them.
    if (this.attached || !this.template || this.texturesPending > 0 || !this.app.batcher) return;
    this.attached = true;

    const group = this.app.batcher.addGroup('StreetArtBatch', true, 1000);
    const crowdGroup = this.app.batcher.addGroup('ProcessionCrowdBatch', true, 400);
    this.groupId = group?.id;
    this.crowdGroupId = crowdGroup?.id;

    for (const tile of this.tiles) this.dressTile(tile);
    this.dressPromenade();
  }

  /** Spectators rise on their toes now and then; a batch keeps this to one small transform per figure. */
  public update(time: number): void {
    if (!this.cheering.length || this.reducedMotion.matches) return;
    for (const figure of this.cheering) {
      const lift = Math.max(0, Math.sin(time * 3.1 + figure.phase));
      const position = figure.node.getLocalPosition();
      figure.node.setLocalPosition(position.x, figure.baseY + lift * lift * 0.07, position.z);
    }
  }

  private flat(color: Color, gloss: number): StandardMaterial {
    const material = new StandardMaterial();
    material.diffuse = color;
    material.gloss = gloss;
    material.update();
    return material;
  }

  private loadTexture(url: string, material: StandardMaterial, tiling?: Vec2, flatColors = false): void {
    this.app.assets.loadFromUrl(url, 'texture', (err, asset) => {
      this.texturesPending--;
      if (err || !asset?.resource) return; // the material keeps its flat fallback colour
      const texture = asset.resource as Texture;
      if (flatColors) {
        // Palette cells would blur into their neighbours in distant mip levels.
        texture.mipmaps = false;
        texture.minFilter = FILTER_LINEAR;
        texture.magFilter = FILTER_LINEAR;
      }
      material.diffuseMap = texture;
      material.diffuse = new Color(1, 1, 1);
      // The alley wall box spans whole tiles, so repeat its bricks by metres rather than once per face.
      material.diffuseMapTiling = tiling ?? (material === this.alleyWall ? new Vec2(10, 3) : new Vec2(1, 1));
      material.update();
    });
  }

  private applyKitMaterials(root: Entity): void {
    const byName: Record<string, StandardMaterial> = {
      Street_Brick: this.brick, Street_Roof: this.roof, Street_Timber: this.timber,
      Street_Stone: this.stone, Street_Window: this.window, Street_Palette: this.palette,
    };
    root.forEach((node) => {
      const render = (node as Entity).render;
      if (!render) return;
      for (const instance of render.meshInstances) {
        const material = instance.material && byName[instance.material.name];
        if (material) instance.material = material;
      }
    });
  }

  private spawn(model: string, parent: Entity, groupId?: number): Entity {
    const source = this.template!.findByName(model) as Entity;
    const clone = source.clone() as Entity;
    parent.addChild(clone);
    if (groupId !== undefined) assignBatchGroup(clone, groupId);
    return clone;
  }

  private dressTile(tile: StreetTile): void {
    const { index, durbarRoot } = tile;
    const placements = [...FIRST_SLOT[(index / 2 | 0) % FIRST_SLOT.length]];
    const second = SECOND_SLOT[index];
    if (second) placements.push(...second);

    // Hide what the models replace; street lamps and the pavilion stay.
    const hide = (prefix: string) => {
      for (const child of durbarRoot.children as Entity[]) {
        if (child.name.startsWith(prefix) && !child.name.endsWith('_Post') && !child.name.endsWith('_Lantern')) child.enabled = false;
      }
    };
    hide(`BldgL1_${index}`);
    if (second) hide(`BldgL2_${index}`);

    const dressed = new Entity(`StreetArt_${index}`);
    durbarRoot.addChild(dressed);

    // Back wall and ground, so the gaps between buildings and the gateway's opening show an alley.
    const lengthDressed = second ? TILE_LENGTH : TILE_LENGTH / 2;
    const backdrop = new Entity('AlleyBack');
    backdrop.addComponent('render', { type: 'box', material: this.alleyWall });
    backdrop.setLocalScale(0.4, 5.6, lengthDressed);
    backdrop.setLocalPosition(ALLEY_BACK_X, 2.8, -lengthDressed / 2);
    dressed.addChild(backdrop);
    const floor = new Entity('AlleyFloor');
    floor.addComponent('render', { type: 'plane', material: this.alleyFloor });
    floor.setLocalScale(ROAD_FRONT_X - ALLEY_BACK_X, 1, lengthDressed);
    floor.setLocalPosition((ROAD_FRONT_X + ALLEY_BACK_X) / 2, 0.01, -lengthDressed / 2);
    dressed.addChild(floor);

    for (const { model, z } of placements) {
      const clone = this.spawn(model, dressed);
      clone.setLocalPosition(ROAD_FRONT_X - FRONT_DEPTH[model], 0, z);
      clone.setLocalEulerAngles(0, 90, 0); // local +Z front faces the road
    }

    // Right plaza: the market cart on alternate tiles and a few spectators.
    if (index % 2 === 0) {
      const cart = this.spawn('MarketCart', dressed);
      cart.setLocalPosition(6.05, 0, -6.6);
      cart.setLocalEulerAngles(0, -90, 0);
    }
    SPECTATOR_SPOTS.forEach((spot, i) => {
      if ((i + index) % 2 === 1) return;
      const figure = this.spawn(`Spectator0${(i + index) % 3 + 1}`, dressed);
      figure.setLocalPosition(spot.x, 0, spot.z);
      figure.setLocalEulerAngles(0, -90 + spot.yaw, 0); // local +Z faces the road
      this.cheering.push({ node: figure, phase: (i + 1) * 1.7 + index, baseY: 0 });
    });

    this.buildLights(dressed, -15, index);

    if (this.groupId !== undefined) assignBatchGroup(dressed, this.groupId);
  }

  /** One six-bulb string on slim poles, from the T024 hanging-light concept. */
  private buildLights(parent: Entity, z: number, seed: number): void {
    const root = new Entity(`HangingLights_${seed}`);
    root.setLocalPosition(0, 0, z);
    parent.addChild(root);

    const box = (name: string, scale: number[], position: number[], rotationZ = 0) => {
      const part = new Entity(name);
      part.addComponent('render', { type: 'box', material: this.cable });
      part.setLocalScale(scale[0], scale[1], scale[2]);
      part.setLocalPosition(position[0], position[1], position[2]);
      part.setLocalEulerAngles(0, 0, rotationZ);
      root.addChild(part);
    };
    const edge = 3.95;
    const topY = 6.1; // bulbs stay well above the 4.2 m chase camera and clear of the garlands
    const sag = 0.45;
    const curve = (x: number) => topY - sag * (1 - (x / edge) * (x / edge));
    box('PoleL', [0.07, topY, 0.07], [-edge, topY / 2, 0]);
    box('PoleR', [0.07, topY, 0.07], [edge, topY / 2, 0]);

    const segments = 6;
    for (let s = 0; s < segments; s++) {
      const x1 = -edge + (2 * edge * s) / segments;
      const x2 = -edge + (2 * edge * (s + 1)) / segments;
      const y1 = curve(x1);
      const y2 = curve(x2);
      const length = Math.hypot(x2 - x1, y2 - y1);
      box(`Cable_${s}`, [length, 0.025, 0.025], [(x1 + x2) / 2, (y1 + y2) / 2, 0], (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI);
    }

    const bulbMesh = this.bulbMesh();
    for (let b = 0; b < 6; b++) {
      const x = -edge + (2 * edge * (b + 0.5)) / 6;
      const y = curve(x) - 0.14;
      const entity = new Entity(`Bulb_${b}`);
      entity.addComponent('render', { meshInstances: [new MeshInstance(bulbMesh, this.bulb)] });
      entity.setLocalScale(0.13, 0.13, 0.13);
      entity.setLocalPosition(x, y, 0);
      root.addChild(entity);
    }
  }

  private cachedBulbMesh?: ReturnType<typeof createSphere>;
  private bulbMesh() {
    this.cachedBulbMesh ??= createSphere(this.app.graphicsDevice, { radius: 0.5, latitudeBands: 5, longitudeBands: 8 });
    return this.cachedBulbMesh;
  }

  /** The terrace crowd watching the procession: spectators replace the box-and-ball figures. */
  private dressPromenade(): void {
    this.promenadeFigures.forEach((figure, i) => {
      for (const name of ['Body', 'Head']) (figure.findByName(name) as Entity | null)?.destroy();
      const person = this.spawn(`Spectator0${i % 3 + 1}Far`, figure, this.crowdGroupId);
      person.setLocalPosition(0, 0, 0);
    });
  }
}
