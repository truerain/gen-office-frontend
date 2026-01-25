import type * as React from 'react';
import type { TreeId, TreeProps } from '../../core/Tree';

export type TreeViewProps<TItem> = TreeProps<TItem> & {
  title?: React.ReactNode;
  showControls?: boolean;
  className?: string;
  treeClassName?: string;
};

export type TreeViewId = TreeId;
