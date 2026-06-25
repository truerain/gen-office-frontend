// packages/gen-datagrid/src/features/system-columns/systemColumns.tsx
// Builds GenDataGrid system columns for row status, row selection, and row number.

import * as React from 'react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';

import type {
  GenDataGridRowStatus,
  GenDataGridRowStatusContext,
  GenDataGridSystemColumnKind,
} from '../../GenDataGrid.types';

export const GEN_DATAGRID_ROW_STATUS_COLUMN_ID = '__gen_row_status';
export const GEN_DATAGRID_ROW_SELECTION_COLUMN_ID = '__gen_row_selection';
export const GEN_DATAGRID_ROW_NUMBER_COLUMN_ID = '__gen_row_number';

export const GEN_DATAGRID_SYSTEM_COLUMN_IDS = [
  GEN_DATAGRID_ROW_STATUS_COLUMN_ID,
  GEN_DATAGRID_ROW_SELECTION_COLUMN_ID,
  GEN_DATAGRID_ROW_NUMBER_COLUMN_ID,
] as const;

type BuildSystemColumnsArgs<TData> = {
  enableRowStatus?: boolean;
  enableRowSelection?: boolean;
  enableRowNumber?: boolean;
  resolveRowStatus: (ctx: GenDataGridRowStatusContext<TData>) => GenDataGridRowStatus;
};

type IndeterminateCheckboxProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  indeterminate?: boolean;
};

function IndeterminateCheckbox({
  indeterminate,
  ...props
}: IndeterminateCheckboxProps) {
  const ref = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    ref.current.indeterminate = Boolean(indeterminate) && !props.checked;
  }, [indeterminate, props.checked]);

  return <input ref={ref} type="checkbox" {...props} />;
}

export function isGenDataGridSystemColumnId(columnId: string) {
  return GEN_DATAGRID_SYSTEM_COLUMN_IDS.some((id) => id === columnId);
}

export function getEnabledSystemColumnIds({
  enableRowStatus,
  enableRowSelection,
  enableRowNumber,
}: {
  enableRowStatus?: boolean;
  enableRowSelection?: boolean;
  enableRowNumber?: boolean;
}) {
  const ids: string[] = [];
  if (enableRowStatus) ids.push(GEN_DATAGRID_ROW_STATUS_COLUMN_ID);
  if (enableRowSelection) ids.push(GEN_DATAGRID_ROW_SELECTION_COLUMN_ID);
  if (enableRowNumber) ids.push(GEN_DATAGRID_ROW_NUMBER_COLUMN_ID);
  return ids;
}

export function normalizeColumnOrderForSystemColumns(
  columnOrder: readonly string[] | undefined,
  systemColumnIds: readonly string[]
) {
  if (!columnOrder) return undefined;
  if (systemColumnIds.length === 0) return [...columnOrder];
  const systemColumnIdSet = new Set(systemColumnIds);
  return [
    ...systemColumnIds,
    ...columnOrder.filter((columnId) => !systemColumnIdSet.has(columnId)),
  ];
}

export function normalizeColumnPinningForSystemColumns(
  columnPinning: { left?: string[]; right?: string[] } | undefined,
  systemColumnIds: readonly string[]
) {
  if (systemColumnIds.length === 0) return columnPinning;
  const systemColumnIdSet = new Set(systemColumnIds);
  const left = [
    ...systemColumnIds,
    ...(columnPinning?.left ?? []).filter((columnId) => !systemColumnIdSet.has(columnId)),
  ];
  const right = (columnPinning?.right ?? []).filter(
    (columnId) => !systemColumnIdSet.has(columnId)
  );
  return { ...columnPinning, left, right };
}

function getStatusLabel(status: GenDataGridRowStatus) {
  if (status === 'created') return 'Created row';
  if (status === 'updated') return 'Updated row';
  if (status === 'deleted') return 'Deleted row';
  return 'Clean row';
}

export function buildSystemColumns<TData>({
  enableRowStatus,
  enableRowSelection,
  enableRowNumber,
  resolveRowStatus,
}: BuildSystemColumnsArgs<TData>): ColumnDef<TData, unknown>[] {
  const columns: ColumnDef<TData, unknown>[] = [];

  if (enableRowStatus) {
    columns.push({
      id: GEN_DATAGRID_ROW_STATUS_COLUMN_ID,
      header: '',
      size: 32,
      minSize: 32,
      maxSize: 32,
      enableResizing: false,
      enableSorting: false,
      enableColumnFilter: false,
      meta: { systemColumn: 'rowStatus' satisfies GenDataGridSystemColumnKind },
      cell: ({ row }) => {
        const status = resolveRowStatus({
          row: row.original,
          rowId: row.id,
          rowIndex: row.index,
          dirty: false,
          deleted: false,
        });
        return (
          <span
            className="gen-datagrid__row-status"
            data-row-status={status}
            data-gen-datagrid-row-status={status}
            aria-label={getStatusLabel(status)}
            title={getStatusLabel(status)}
          />
        );
      },
    });
  }

  if (enableRowSelection) {
    columns.push({
      id: GEN_DATAGRID_ROW_SELECTION_COLUMN_ID,
      header: ({ table }) => {
        const selectableRows = table.getRowModel().rows.filter((row) => row.getCanSelect());
        const selectedRows = selectableRows.filter((row) => row.getIsSelected());
        const checked = selectableRows.length > 0 && selectedRows.length === selectableRows.length;
        const indeterminate = selectedRows.length > 0 && !checked;

        return (
          <IndeterminateCheckbox
            aria-label="Select all rows"
            className="gen-datagrid__row-selection-checkbox"
            data-gen-datagrid-row-selection-checkbox="true"
            data-row-selectable={selectableRows.length > 0 ? 'true' : undefined}
            checked={checked}
            disabled={selectableRows.length === 0}
            indeterminate={indeterminate}
            onChange={(event) => {
              const nextChecked = event.currentTarget.checked;
              table.setRowSelection((current: RowSelectionState) => {
                const next = { ...current };
                selectableRows.forEach((row) => {
                  if (nextChecked) {
                    next[row.id] = true;
                  } else {
                    delete next[row.id];
                  }
                });
                return next;
              });
            }}
          />
        );
      },
      size: 36,
      minSize: 36,
      maxSize: 36,
      enableResizing: false,
      enableSorting: false,
      enableColumnFilter: false,
      meta: { systemColumn: 'rowSelection' satisfies GenDataGridSystemColumnKind },
      cell: ({ row }) => (
        <IndeterminateCheckbox
          aria-label={'Select row ' + row.id}
          className="gen-datagrid__row-selection-checkbox"
          data-gen-datagrid-row-selection-checkbox="true"
          data-row-selected={row.getIsSelected() ? 'true' : undefined}
          data-row-selectable={row.getCanSelect() ? 'true' : undefined}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        />
      ),
    });
  }

  if (enableRowNumber) {
    columns.push({
      id: GEN_DATAGRID_ROW_NUMBER_COLUMN_ID,
      header: '#',
      size: 48,
      minSize: 48,
      maxSize: 48,
      enableResizing: false,
      enableSorting: false,
      enableColumnFilter: false,
      meta: { systemColumn: 'rowNumber' satisfies GenDataGridSystemColumnKind },
      cell: ({ row, table }) => {
        const visibleRowIndex = table.getRowModel().rows.findIndex((item) => item.id === row.id);
        return (
          <span className="gen-datagrid__row-number" data-row-number="true">
            {visibleRowIndex >= 0 ? visibleRowIndex + 1 : row.index + 1}
          </span>
        );
      },
    });
  }

  return columns;
}
