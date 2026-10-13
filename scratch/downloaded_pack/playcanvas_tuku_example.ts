/**
 * Lakhey Run — Tuku v03 loading example for PlayCanvas Engine / TypeScript.
 * If your current loader already works, update only its GLB URL.
 * The GLB contains geometry and materials; your existing scripts animate pivots.
 */
import * as pc from 'playcanvas';

export function loadRefinedTuku(
    app: pc.Application,
    url = '/assets/tuku_refined_v03.glb'
): Promise<pc.Entity> {
    return new Promise((resolve, reject) => {
        app.assets.loadFromUrl(url, 'container', (err, asset) => {
            if (err || !asset?.resource) {
                reject(new Error(`Failed to load ${url}: ${String(err)}`));
                return;
            }

            const tuku = asset.resource.instantiateRenderEntity({
                castShadows: true,
                receiveShadows: true
            });
            tuku.name = 'Tuku';
            tuku.setLocalScale(1, 1, 1);
            app.root.addChild(tuku);

            // The procedural animation pivots use the same names and rest
            // transformations as the previous GLB. Do not recreate them.
            const expected = [
                'TorsoRoot', 'HeadRoot', 'ScarfTailRoot',
                'LeftArmRoot', 'LeftElbowRoot',
                'RightArmRoot', 'RightElbowRoot',
                'LeftLegRoot', 'LeftKneeRoot',
                'RightLegRoot', 'RightKneeRoot',
                'SatchelRoot'
            ];
            for (const name of expected) {
                if (!tuku.findByName(name)) {
                    console.warn(`Tuku refinement missing pivot: ${name}`);
                }
            }

            // Attach the existing run / dodge / jump / slide controller here.
            resolve(tuku);
        });
    });
}
