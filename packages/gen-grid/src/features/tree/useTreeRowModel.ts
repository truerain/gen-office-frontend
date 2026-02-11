import * as React from 'react';
import type { GenGridTreeOptions } from '../../GenGrid.types';

type TreeNodeMeta<TData> = {
  id: string;
  parentId: string | null;
  row: TData;
  index: number;
};

type TreeModel<TData> = {
  nodesById: Map<string, TreeNodeMeta<TData>>;
  childrenById: Map<string, string[]>;
  rootIds: string[];
  orphanIds: string[];
  expandableIds: string[];
};

export type TreeRowModelResult<TData> = {
  visibleRows: TData[];
  visibleRowIds: string[];
  depthByRowId: Record<string, number>;
  hasChildrenByRowId: Record<string, boolean>;
  orphanRowIds: string[];
  expandedRowIds: Record<string, boolean>;
  setExpandedRowIds: (next: Record<string, boolean>) => void;
  toggleRow: (rowId: string) => void;
  isExpanded: (rowId: string) => boolean;
};

export type UseTreeRowModelArgs<TData> = {
  data: TData[];
  tree?: GenGridTreeOptions<TData>;
};

function getValueByKey<TData>(row: TData, key: keyof TData | string): unknown {
  return (row as Record<string, unknown>)[String(key)];
}

function isRootParent(parentValue: unknown, rootParentValue: unknown): boolean {
  if (rootParentValue !== undefined) return Object.is(parentValue, rootParentValue);
  return parentValue == null || parentValue === 0;
}

function buildTreeModel<TData>(data: TData[], tree: GenGridTreeOptions<TData>): TreeModel<TData> {
  const nodesById = new Map<string, TreeNodeMeta<TData>>();
  const childrenById = new Map<string, string[]>();

  for (let i = 0; i < data.length; i++) {
    const row = data[i]!;
    const id = String(getValueByKey(row, tree.idKey));
    const parentRaw = getValueByKey(row, tree.parentIdKey);
    const parentId = isRootParent(parentRaw, tree.rootParentValue) ? null : String(parentRaw);

    nodesById.set(id, { id, parentId, row, index: i });
  }

  for (const node of nodesById.values()) {
    if (!node.parentId) continue;
    const list = childrenById.get(node.parentId) ?? [];
    list.push(node.id);
    childrenById.set(node.parentId, list);
  }

  const orphanIds: string[] = [];
  const rootCandidates: Array<{ id: string; index: number }> = [];

  for (const node of nodesById.values()) {
    const isOrphan = !!node.parentId && !nodesById.has(node.parentId);
    if (isOrphan) orphanIds.push(node.id);
    if (!node.parentId || isOrphan) {
      rootCandidates.push({ id: node.id, index: node.index });
    }
  }

  rootCandidates.sort((a, b) => a.index - b.index);
  const rootIds = rootCandidates.map((x) => x.id);

  const expandableIds: string[] = [];
  for (const [id, children] of childrenById.entries()) {
    if (children.length > 0 && nodesById.has(id)) expandableIds.push(id);
  }

  return {
    nodesById,
    childrenById,
    rootIds,
    orphanIds,
    expandableIds,
  };
}

export function useTreeRowModel<TData>(args: UseTreeRowModelArgs<TData>): TreeRowModelResult<TData> {
  const { data, tree } = args;
  const treeEnabled = Boolean(tree?.enabled);

  const model = React.useMemo(() => {
    if (!treeEnabled || !tree) return null;
    return buildTreeModel(data, tree);
  }, [data, tree, treeEnabled]);

  const [innerExpandedRowIds, setInnerExpandedRowIds] = React.useState<Record<string, boolean>>(
    () => {
      if (!treeEnabled || !tree?.defaultExpanded || !model) return {};
      const next: Record<string, boolean> = {};
      for (const id of model.expandableIds) next[id] = true;
      return next;
    }
  );

  const didInitTreeRef = React.useRef(false);

  React.useEffect(() => {
    if (!treeEnabled || !tree) {
      didInitTreeRef.current = false;
      return;
    }
    if (tree.expandedRowIds != null) return;
    if (didInitTreeRef.current) return;

    if (!tree.defaultExpanded || !model) {
      setInnerExpandedRowIds({});
      didInitTreeRef.current = true;
      return;
    }

    const next: Record<string, boolean> = {};
    for (const id of model.expandableIds) next[id] = true;
    setInnerExpandedRowIds(next);
    didInitTreeRef.current = true;
  }, [model, tree, treeEnabled]);

  const expandedRowIds = tree?.expandedRowIds ?? innerExpandedRowIds;

  const setExpandedRowIds = React.useCallback(
    (next: Record<string, boolean>) => {
      if (tree?.expandedRowIds == null) {
        setInnerExpandedRowIds(next);
      }
      tree?.onExpandedRowIdsChange?.(next);
    },
    [tree]
  );

  const isExpanded = React.useCallback(
    (rowId: string) => Boolean(expandedRowIds[rowId]),
    [expandedRowIds]
  );

  const toggleRow = React.useCallback(
    (rowId: string) => {
      const next: Record<string, boolean> = { ...expandedRowIds };
      if (next[rowId]) delete next[rowId];
      else next[rowId] = true;
      setExpandedRowIds(next);
    },
    [expandedRowIds, setExpandedRowIds]
  );

  const visible = React.useMemo(() => {
    if (!treeEnabled || !model) {
      return {
        visibleRows: data,
        visibleRowIds: data.map((_, i) => String(i)),
        depthByRowId: {} as Record<string, number>,
        hasChildrenByRowId: {} as Record<string, boolean>,
      };
    }

    const visibleRows: TData[] = [];
    const visibleRowIds: string[] = [];
    const depthByRowId: Record<string, number> = {};
    const hasChildrenByRowId: Record<string, boolean> = {};

    const visit = (rowId: string, depth: number) => {
      const node = model.nodesById.get(rowId);
      if (!node) return;

      visibleRows.push(node.row);
      visibleRowIds.push(rowId);
      depthByRowId[rowId] = depth;

      const children = model.childrenById.get(rowId) ?? [];
      hasChildrenByRowId[rowId] = children.length > 0;

      if (!expandedRowIds[rowId]) return;
      for (const childId of children) {
        visit(childId, depth + 1);
      }
    };

    for (const rootId of model.rootIds) visit(rootId, 0);

    return { visibleRows, visibleRowIds, depthByRowId, hasChildrenByRowId };
  }, [data, expandedRowIds, model, treeEnabled]);

  React.useEffect(() => {
    if (!treeEnabled || !tree?.onOrphanRowsChange) return;
    tree.onOrphanRowsChange(model?.orphanIds ?? []);
  }, [model?.orphanIds, tree, treeEnabled]);

  return {
    visibleRows: visible.visibleRows,
    visibleRowIds: visible.visibleRowIds,
    depthByRowId: visible.depthByRowId,
    hasChildrenByRowId: visible.hasChildrenByRowId,
    orphanRowIds: model?.orphanIds ?? [],
    expandedRowIds,
    setExpandedRowIds,
    toggleRow,
    isExpanded,
  };
}
