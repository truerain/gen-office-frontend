// packages/datagrid/src/gen-grid/features/row-number/useRowNumberColumn.ts
import * as React from 'react';
import type { ColumnDef, Table } from '@tanstack/react-table';
import { SELECTION_COLUMN_ID } from './selection';

export const ROW_NUMBER_COLUMN_ID = '__rowNumber__';

// rowModel 객체 단위로 캐시 (rowModel이 바뀌면 새로 생성)
const rowModelIndexCache = new WeakMap<object, Map<string, number>>();

function getVisibleIndex<TData>(table: Table<TData>, rowId: string) {
  const rowModel = table.getRowModel();
  let map = rowModelIndexCache.get(rowModel as unknown as object);

  if (!map) {
    map = new Map<string, number>();
    for (let i = 0; i < rowModel.rows.length; i++) {
      map.set(rowModel.rows[i].id, i);
    }
    rowModelIndexCache.set(rowModel as unknown as object, map);
  }

  return map.get(rowId) ?? 0;
}


export function useRowNumberColumn<TData>(opts?: { header?: string; width?: number }): ColumnDef<TData> {
  const headerText = opts?.header ?? 'No.';
  const width = opts?.width ?? 56;

  return React.useMemo<ColumnDef<TData>>(
    () => ({
      id: ROW_NUMBER_COLUMN_ID,
      header: headerText,
      size: width,
      enableSorting: false,
      enableResizing: false,
      meta: {
        isSystem: true,
        role: 'row-number',
        pin: 'left',
        align: 'center',
      },
      cell: ({ table, row }) => {
        // 현재 “보이는 rowModel” 기준 index (정렬/필터/트리확장/페이지 반영)
        const idxInCurrentPage = getVisibleIndex(table, row.id);

        // pagination이 켜져있으면 global 번호로 보정
        const p = table.getState().pagination;
        const pageOffset =
          p && typeof p.pageIndex === 'number' && typeof p.pageSize === 'number'
            ? p.pageIndex * p.pageSize
            : 0;

        return pageOffset + idxInCurrentPage + 1;
      },
    }),
    [headerText, width]
  );
}

export function withRowNumberColumn<TData>(
  columns: ColumnDef<TData>[],
  rowNumberColumn: ColumnDef<TData>
) {
  const selectionIdx = columns.findIndex((c) => c.id === SELECTION_COLUMN_ID);

  // selection이 있으면 그 다음, 없으면 맨 앞
  if (selectionIdx >= 0) {
    return [
      ...columns.slice(0, selectionIdx + 1),
      rowNumberColumn,
      ...columns.slice(selectionIdx + 1),
    ];
  }

  return [rowNumberColumn, ...columns];
}