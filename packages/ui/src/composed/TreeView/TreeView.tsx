import * as React from 'react';
import { cn } from '@gen-office/utils';
import { Button } from '../../core/Button';
import { Tree } from '../../core/Tree';
import type { TreeId } from '../../core/Tree';
import type { TreeViewProps } from './TreeView.types';
import styles from './TreeView.module.css';

function collectExpandableIds<TItem>(
  data: readonly TItem[],
  getId: (item: TItem) => TreeId,
  getParentId: (item: TItem) => TreeId | null | undefined
) {
  const childrenById = new Map<TreeId, number>();
  const nodesById = new Set<TreeId>();

  for (const item of data) {
    const id = getId(item);
    nodesById.add(id);
  }

  for (const item of data) {
    const parentId = getParentId(item);
    if (parentId == null || !nodesById.has(parentId)) continue;
    childrenById.set(parentId, (childrenById.get(parentId) ?? 0) + 1);
  }

  return Array.from(childrenById.keys());
}

export function TreeView<TItem>(props: TreeViewProps<TItem>) {
  const {
    data,
    title = 'Tree',
    showControls = true,
    expandedIds: expandedIdsProp,
    selectedId: selectedIdProp,
    onSelect: onSelectProp,
    defaultExpandedIds,
    onExpandedIdsChange,
    className,
    treeClassName,
    getId = (item: any) => item.id,
    getParentId = (item: any) => item.parent_id,
    ...rest
  } = props;

  const isControlled = expandedIdsProp !== undefined;
  const [expandedIdsState, setExpandedIdsState] = React.useState<TreeId[]>(
    () => (defaultExpandedIds ? Array.from(defaultExpandedIds) : [])
  );
  const expandedIds = isControlled ? expandedIdsProp! : expandedIdsState;

  const setExpanded = React.useCallback(
    (next: TreeId[]) => {
      if (!isControlled) setExpandedIdsState(next);
      onExpandedIdsChange?.(next);
    },
    [isControlled, onExpandedIdsChange]
  );

  const expandableIds = React.useMemo(
    () => collectExpandableIds(data, getId, getParentId),
    [data, getId, getParentId]
  );

  const isSelectedControlled = selectedIdProp !== undefined;
  const [selectedIdState, setSelectedIdState] = React.useState<TreeId | undefined>(
    () => selectedIdProp
  );
  const selectedId = isSelectedControlled ? selectedIdProp : selectedIdState;

  const handleSelect = React.useCallback(
    (item: TItem) => {
      if (!isSelectedControlled) setSelectedIdState(getId(item));
      onSelectProp?.(item);
    },
    [getId, isSelectedControlled, onSelectProp]
  );

  const handleExpandAll = React.useCallback(() => {
    setExpanded(expandableIds);
  }, [expandableIds, setExpanded]);

  const handleCollapseAll = React.useCallback(() => {
    setExpanded([]);
  }, [setExpanded]);

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        {showControls ? (
          <div className={styles.actions}>
            <Button size="sm" variant="ghost" onClick={handleExpandAll}>
              Expand
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCollapseAll}>
              Collapse
            </Button>
          </div>
        ) : null}
      </div>
      <div className={styles.body}>
        <Tree
          {...rest}
          data={data}
          className={cn(styles.tree, treeClassName)}
          expandedIds={expandedIds}
          onExpandedIdsChange={setExpanded}
          selectedId={selectedId}
          onSelect={handleSelect}
          getId={getId}
          getParentId={getParentId}
        />
      </div>
    </div>
  );
}
