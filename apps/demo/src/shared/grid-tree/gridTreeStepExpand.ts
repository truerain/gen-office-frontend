export type GridTreeRowAccessors<T> = {
  getNodeId: (row: T) => string;
  getParentId: (row: T) => string | null;
};

export type GridTreeStepExpandIndex = {
  defaultExpandedRowIds: Record<string, boolean>;
  depthByNodeId: Map<string, number>;
  rootByNodeId: Map<string, string>;
  expandableIdsByRoot: Map<string, string[]>;
};

export function collectGridTreeExpandableNodeIds<T>(
  data: T[],
  getParentId: (row: T) => string | null
): Set<string> {
  const parentIds = new Set<string>();
  for (const row of data) {
    const parentId = getParentId(row);
    if (parentId) parentIds.add(parentId);
  }
  return parentIds;
}

export function buildDefaultGridTreeExpandedRowIds(expandableNodeIds: Iterable<string>): Record<string, boolean> {
  const next: Record<string, boolean> = {};
  for (const nodeId of expandableNodeIds) next[nodeId] = true;
  return next;
}

/** 1-based depth from tree root (root = 1, child = parent depth + 1). */
export function buildGridTreeDepthByNodeId<T>(
  data: T[],
  accessors: GridTreeRowAccessors<T>
): Map<string, number> {
  const { getNodeId, getParentId } = accessors;

  const parentByNodeId = new Map<string, string | null>();
  for (const row of data) {
    parentByNodeId.set(getNodeId(row), getParentId(row));
  }

  const depthByNodeId = new Map<string, number>();
  const resolveDepth = (nodeId: string): number => {
    const cached = depthByNodeId.get(nodeId);
    if (cached != null) return cached;
    const parent = parentByNodeId.get(nodeId) ?? null;
    const depth = parent ? resolveDepth(parent) + 1 : 1;
    depthByNodeId.set(nodeId, depth);
    return depth;
  };

  for (const row of data) resolveDepth(getNodeId(row));
  return depthByNodeId;
}

export function buildGridTreeStepExpandIndex<T>(
  data: T[],
  accessors: GridTreeRowAccessors<T>
): GridTreeStepExpandIndex {
  const { getNodeId, getParentId } = accessors;

  const expandableNodeIds = collectGridTreeExpandableNodeIds(data, getParentId);
  const defaultExpandedRowIds = buildDefaultGridTreeExpandedRowIds(expandableNodeIds);
  const depthByNodeId = buildGridTreeDepthByNodeId(data, accessors);

  const parentByNodeId = new Map<string, string | null>();
  for (const row of data) {
    parentByNodeId.set(getNodeId(row), getParentId(row));
  }

  const rootByNodeId = new Map<string, string>();
  const resolveRoot = (nodeId: string): string => {
    const cached = rootByNodeId.get(nodeId);
    if (cached) return cached;
    let current = nodeId;
    let parent = parentByNodeId.get(current) ?? null;
    while (parent) {
      current = parent;
      parent = parentByNodeId.get(current) ?? null;
    }
    rootByNodeId.set(nodeId, current);
    return current;
  };
  for (const row of data) resolveRoot(getNodeId(row));

  const expandableIdsByRoot = new Map<string, string[]>();
  for (const rowId of expandableNodeIds) {
    const rootId = rootByNodeId.get(rowId);
    if (!rootId) continue;
    const list = expandableIdsByRoot.get(rootId);
    if (list) list.push(rowId);
    else expandableIdsByRoot.set(rootId, [rowId]);
  }

  return {
    defaultExpandedRowIds,
    depthByNodeId,
    rootByNodeId,
    expandableIdsByRoot,
  };
}

export function applyGridTreeExpandDeltaByRoot(
  index: Pick<GridTreeStepExpandIndex, 'depthByNodeId' | 'rootByNodeId' | 'expandableIdsByRoot'>,
  state: Record<string, boolean>,
  delta: 1 | -1
): Record<string, boolean> {
  const { depthByNodeId, rootByNodeId, expandableIdsByRoot } = index;

  const currentByRoot = new Map<string, number>();
  for (const [rowId, expanded] of Object.entries(state)) {
    if (!expanded) continue;
    const rootId = rootByNodeId.get(rowId);
    if (!rootId) continue;
    const depth = depthByNodeId.get(rowId) ?? 0;
    const prev = currentByRoot.get(rootId) ?? 0;
    if (depth > prev) currentByRoot.set(rootId, depth);
  }

  const roots = Array.from(expandableIdsByRoot.keys());
  const currentDepths = roots.map((rootId) => currentByRoot.get(rootId) ?? 0);
  const minCurrent = currentDepths.length > 0 ? Math.min(...currentDepths) : 0;
  const maxCurrent = currentDepths.length > 0 ? Math.max(...currentDepths) : 0;

  const next: Record<string, boolean> = {};
  for (const [rootId, rowIds] of expandableIdsByRoot.entries()) {
    let maxDepth = 0;
    for (const rowId of rowIds) {
      const depth = depthByNodeId.get(rowId) ?? 0;
      if (depth > maxDepth) maxDepth = depth;
    }
    const current = currentByRoot.get(rootId) ?? 0;
    // Keep roots aligned by step:
    // expand: raise lagging roots first without pushing already-deeper roots further.
    // collapse: lower deeper roots first without collapsing shallower roots further.
    const target =
      delta > 0
        ? Math.min(maxDepth, Math.max(current, minCurrent + 1))
        : Math.max(0, Math.min(current, maxCurrent - 1));
    if (target <= 0) continue;
    for (const rowId of rowIds) {
      const depth = depthByNodeId.get(rowId) ?? 0;
      if (depth <= target) next[rowId] = true;
    }
  }
  return next;
}
