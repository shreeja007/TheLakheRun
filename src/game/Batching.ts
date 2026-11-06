import { Application, Entity, GraphNode } from 'playcanvas';

/**
 * Puts every render component under `root` into a batch group. PlayCanvas rebuilds a group whenever
 * a member is enabled or disabled, so only batch hierarchies that stay enabled while the game runs.
 */
export function assignBatchGroup(root: GraphNode, groupId: number): void {
  root.forEach((node) => {
    const render = (node as Entity).render;
    if (render) render.batchGroupId = groupId;
  });
}

/**
 * Dynamic batch for one articulated model: parts that share a material are drawn together while each
 * part keeps its own animated transform. Tuku goes from 29 draw calls to a few. Returns the group id.
 */
export function batchArticulatedModel(app: Application, name: string, root: GraphNode): number | undefined {
  if (!app.batcher) return undefined;
  const group = app.batcher.addGroup(name, true, 50);
  if (group) assignBatchGroup(root, group.id);
  return group?.id;
}
