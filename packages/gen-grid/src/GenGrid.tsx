// packages/gen-grid/src/GenGrid.tsx
import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { GenGridProvider } from './core/context/GenGridProvider';
import type { GenGridProps } from './GenGrid.types';
import type { GenGridHandle } from './types/GenGridHandle';

import { useGridEditing } from './features/editing/useGridEditing';

import { GenGridBase } from './components/base/GenGridBase';
import { useGridData } from './features/data/useGridData';
import { useDirtyState } from './features/dirty/useDirtyState';

import { useGenGridTable } from './core/table/useGenGridTable';
import { useGridInstance } from './hooks/useGridInstance';

function getAccessorKeyFromColumnId<TData>(
  columns: ColumnDef<TData, any>[],
  columnId: string
): string | null {
  return columnId;
}

export const GenGrid = React.forwardRef(function GenGridInner<TData>(
  props: GenGridProps<TData>,
  ref: React.ForwardedRef<GenGridHandle<TData>>
) {
  // 1) Initialize base grid data
  const gridData = useGridData(props);
  const initialDefaultRef = React.useRef<TData[]>( // Capture defaultData at mount for hard reset in uncontrolled mode.
    'defaultData' in props ? props.defaultData ?? [] : []
  );

  // 2) Dirty-state tracking
  const dirty = useDirtyState<TData>({
    initialBaseline: gridData.data ?? [],
    getRowId: props.getRowId,
  });
  const { updateCell } = useGridEditing({ props, gridData, dirty });

  // 3) Expose imperative API
  useGridInstance({
    ref,
    props,
    gridData,
    dirty,
    initialDefaultData: initialDefaultRef.current
  });

  const actions = React.useMemo(() => {
    return {
      setData: gridData.setData,
      deleteRow: (rowId: string) => {
        // Delete a row by matching the provided row id.
        gridData.setData(prev => prev.filter((_, idx) => {
          // getRowId is required for reliable deletion by business row id.
          if (!props.getRowId) {
            // Without getRowId, row.id mapping is ambiguous in this path.
            return true;
          }
          return props.getRowId(prev[idx] as any) !== rowId;
        }));

        // Follow-up cleanup (dirty/selection/activeCell) can be handled in a dedicated action.
      },
    };
  }, [gridData.setData, props.getRowId]);

  // 4) Create TanStack table instance
  const table = useGenGridTable<TData>({
    ...props,
    data: gridData.data ?? [],
    isRowDirty: dirty.isRowDirty,
    actions,
  });

  // 5) Reset dirty state when dataVersion changes
  React.useEffect(() => {
    dirty.setBaselineFromData(gridData.data ?? []);
    dirty.clearAllDirty();
    props.onDirtyChange?.(false);
  }, [props.dataVersion]);

  const notifyDirty = React.useCallback(() => {
    props.onDirtyChange?.(dirty.isDirty());
  }, [dirty, props]);

 
  return (
    <GenGridProvider
      table={table}
      activeCell={props.activeCell}
      onActiveCellChange={props.onActiveCellChange}
      options={{
        editorFactory: props.editorFactory,
        keepEditingOnNavigate: props.keepEditingOnNavigate,
        enableRangeSelection: props.enableRangeSelection ?? true,
      }}
    >
      <GenGridBase<TData>
        {...props} // Pass-through options from parent
        table={table}
        onCellValueChange={updateCell}
        isRowDirty={dirty.isRowDirty}
        isCellDirty={dirty.isCellDirty}
      />
    </GenGridProvider>
  );
}) as <TData>(
  props: GenGridProps<TData> & { ref?: React.Ref<GenGridHandle<TData>> }
) => React.ReactElement;

