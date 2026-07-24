import type * as React from 'react';
import type { TreeId, TreeProps } from '../../core/Tree';

export type TreeViewProps<TItem> = TreeProps<TItem> & {
  title?: React.ReactNode;
  showControls?: boolean;
  /** When true and `onRefresh` is provided, shows a refresh button in the header. Default: false. */
  showRefresh?: boolean;
  /** Called when the header refresh button is clicked. */
  onRefresh?: () => void;
  className?: string;
  treeClassName?: string;
};

export type TreeViewId = TreeId;
