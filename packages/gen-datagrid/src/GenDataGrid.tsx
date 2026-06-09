// packages/gen-datagrid/src/GenDataGrid.tsx
// Provides the public GenDataGrid React component baseline.

import * as React from 'react';

import type { GenDataGridHandle, GenDataGridProps } from './GenDataGrid.types';
import { DataGridRoot } from './renderers/div-grid/DataGridRoot';

export const GenDataGrid = React.forwardRef(function GenDataGridInner<TData>(
  props: GenDataGridProps<TData>,
  ref: React.ForwardedRef<GenDataGridHandle>
) {
  return <DataGridRoot {...props} rootRef={ref} />;
}) as <TData>(
  props: GenDataGridProps<TData> & { ref?: React.Ref<GenDataGridHandle> }
) => React.ReactElement;
