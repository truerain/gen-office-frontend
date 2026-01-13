// packages/datagrid/src/gen-grid/features/selection.tsx
import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

  // Step4: 선택 컬럼을 columns 앞에 자동으로 붙임
 export function useSelectionColumn<TData>() {
  return React.useMemo<ColumnDef<TData>>(
    () => ({
      id: '__select__',
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all rows"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (!el) return;
            el.indeterminate = table.getIsSomePageRowsSelected();
          }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label="Select row"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
      meta: { align: 'center' },
      enablePinning: false
    }),
    []
  );
}

export function withSelectionColumn<TData>(
  columns: ColumnDef<TData, any>[],
  selectionColumn: ColumnDef<TData, any>
) {
  return [selectionColumn, ...columns];
}
