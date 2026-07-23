import type * as React from 'react';

export type TreeId = string | number;

export type TreeExpansionMode = 'collapsible' | 'fixed-expanded';
export type TreeConnectorVariant = 'none' | 'line';

export type TreeProps<TItem> = {
  data: readonly TItem[];

  getId?: (item: TItem) => TreeId;
  getParentId?: (item: TItem) => TreeId | null | undefined;
  getLabel?: (item: TItem) => React.ReactNode;

  expandedIds?: readonly TreeId[];
  defaultExpandedIds?: readonly TreeId[];
  onExpandedIdsChange?: (next: TreeId[]) => void;
  expansionMode?: TreeExpansionMode;
  connectorVariant?: TreeConnectorVariant;

  selectedId?: TreeId;
  onSelect?: (item: TItem) => void;

  indent?: number;
  className?: string;
};
