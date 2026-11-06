import { Application, Color, Entity, StandardMaterial, Vec3 } from 'playcanvas';

/**
 * T039: a glowing line across the road at the player's best distance, with a small "Best" label,
 * so the goal is visible while running. Purely visual: it has no collision and gives no points.
 */
export class BestMarker {
  /** Same threshold as the in-run "new personal best" celebration. */
  public static readonly MIN_BEST = 10;
  private static readonly LABEL_RANGE = 110; // metres ahead at which the label appears
  private static readonly HALF_WIDTH = 3.75; // just outside the curbs

  private root: Entity;
  private marker: Entity;
  private label: HTMLElement;
  private camera: Entity;
  private worldPoint = new Vec3();
  private screenPoint = new Vec3();
  private labelText = '';
  private labelBest = 0; // > 0 while the label should be placed this frame

  constructor(app: Application, camera: Entity, overlay: HTMLElement | null) {
    this.camera = camera;
    // Pooled under its own root so the start-up shader warm-up can prepare it while hidden.
    this.root = new Entity('BestMarkerRoot');
    app.root.addChild(this.root);
    this.marker = new Entity('BestMarker');
    this.root.addChild(this.marker);

    const glow = new StandardMaterial();
    glow.diffuse = new Color(0.98, 0.75, 0.14);
    glow.emissive = new Color(0.98, 0.75, 0.14);
    glow.emissiveIntensity = 1.4;
    glow.update();

    const strip = new Entity('BestLine');
    strip.addComponent('render', { type: 'box', material: glow });
    strip.setLocalScale(BestMarker.HALF_WIDTH * 2, 0.03, 0.32);
    strip.setLocalPosition(0, 0.03, 0);
    this.marker.addChild(strip);

    for (const side of [-1, 1]) {
      const post = new Entity(`BestPost_${side}`);
      post.addComponent('render', { type: 'cylinder', material: glow });
      post.setLocalScale(0.09, 1.7, 0.09);
      post.setLocalPosition(side * BestMarker.HALF_WIDTH, 0.85, 0);
      this.marker.addChild(post);
    }
    this.marker.enabled = false;

    this.label = document.createElement('div');
    this.label.className = 'best-marker-label';
    this.label.hidden = true;
    this.label.setAttribute('aria-hidden', 'true'); // the HUD already announces the best distance
    overlay?.appendChild(this.label);
    // The camera's view matrix is refreshed on prerender, so place the label there for this frame.
    app.on('prerender', () => this.placeLabel());
  }

  /**
   * @param best best distance before this run (metres)
   * @param distance current run distance (metres); the road runs along -Z
   * @param visible false while caught, on results or when the marker should not show
   */
  public update(best: number, distance: number, visible: boolean): void {
    const show = visible && best >= BestMarker.MIN_BEST && distance < best + 30;
    if (this.marker.enabled !== show) this.marker.enabled = show;
    if (!show) {
      this.labelBest = 0;
      this.label.hidden = true;
      return;
    }
    this.marker.setPosition(0, 0, -best);

    const ahead = best - distance;
    this.labelBest = ahead >= 1 && ahead <= BestMarker.LABEL_RANGE ? best : 0;
    if (!this.labelBest) this.label.hidden = true;
  }

  private placeLabel(): void {
    const best = this.labelBest;
    const cameraComponent = this.camera.camera;
    if (!best || !this.marker.enabled || !cameraComponent) return;
    this.worldPoint.set(0, 2.1, -best);
    const cameraPosition = this.camera.getPosition();
    const forward = this.camera.forward;
    const inFront = (this.worldPoint.x - cameraPosition.x) * forward.x + (this.worldPoint.y - cameraPosition.y) * forward.y +
      (this.worldPoint.z - cameraPosition.z) * forward.z > 0;
    cameraComponent.worldToScreen(this.worldPoint, this.screenPoint);
    const onScreen = inFront && this.screenPoint.x >= 0 && this.screenPoint.x <= innerWidth &&
      this.screenPoint.y >= 0 && this.screenPoint.y <= innerHeight;
    if (!onScreen) {
      this.label.hidden = true;
      return;
    }
    const text = `Best ${Math.floor(best).toLocaleString()} m`;
    if (text !== this.labelText) {
      this.label.textContent = text;
      this.labelText = text;
    }
    this.label.style.transform = `translate(${Math.round(this.screenPoint.x)}px, ${Math.round(this.screenPoint.y)}px) translate(-50%, -100%)`;
    this.label.hidden = false;
  }
}
