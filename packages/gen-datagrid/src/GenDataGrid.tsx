// packages/gen-datagrid/src/GenDataGrid.tsx
// Provides the public GenDataGrid React component baseline.

import * as React from 'react';

import type { GenDataGridHandle, GenDataGridProps } from './GenDataGrid.types';
import { DataGridRoot } from './renderers/div-grid/DataGridRoot';

const warnedReservedEditingProps = new Set<string>();

function warnReservedEditingProp(propName: string) {
  if (warnedReservedEditingProps.has(propName)) return;
  warnedReservedEditingProps.add(propName);
  console.warn(
    `GenDataGrid: ${propName} is reserved for a later editing policy slice and is not implemented yet.`
  );
}

export const GenDataGrid = React.forwardRef(function GenDataGridInner<TData>(
  props: GenDataGridProps<TData>,
  ref: React.ForwardedRef<GenDataGridHandle<TData>>
) {
  React.useEffect(() => {
    if (props.editOnActiveCell) warnReservedEditingProp('editOnActiveCell');
    if (props.keepEditingOnNavigate) warnReservedEditingProp('keepEditingOnNavigate');
  }, [props.editOnActiveCell, props.keepEditingOnNavigate]);

  return <DataGridRoot {...props} rootRef={ref} />;
}) as <TData>(
  props: GenDataGridProps<TData> & {
    ref?: React.Ref<GenDataGridHandle<TData>> | React.Ref<GenDataGridHandle>;
  }
) => React.ReactElement;
