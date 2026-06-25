// packages/gen-datagrid/src/features/tree/treeState.ts
// Normalizes and updates row-id keyed tree expansion state.

import type { Row } from '@tanstack/react-table';

import type { GenDataGridTreeExpandedState } from '../../GenDataGrid.types';

export type GenDataGridTreePath = readonly string[];

export type GenDataGridTreeDataAccessor<TData> = {
  row: TData;
  index: number;
  level: number;
  path: GenDataGridTreePath;
};

export type CollectTreeExpandedRowsArgs<TData> = {
  rows: readonly TData[];
  getRowId: (row: TData, index: number, path: GenDataGridTreePath) => string;
  getSubRows: (row: TData, index: number, path: GenDataGridTreePath) => readonly TData[] | undefined;
  maxVisibleDepth?: number;
  maxRootCount?: number;
};

export type CollapseTreeExpandedRowsFromDepthArgs<TData> = CollectTreeExpandedRowsArgs<TData> & {
  expandedRows: GenDataGridTreeExpandedState;
  collapseFromDepth: number;
};

export function normalizeTreeExpandedRows(
  expandedRows: GenDataGridTreeExpandedState | undefined
) {
  const next: GenDataGridTreeExpandedState = {};
  if (!expandedRows) return next;
  Object.entries(expandedRows).forEach(([rowId, expanded]) => {
    if (expanded) next[rowId] = true;
  });
  return next;
}

export function setTreeExpandedRow(
  expandedRows: GenDataGridTreeExpandedState,
  rowId: string,
  expanded: boolean
) {
  const next = { ...expandedRows };
  if (expanded) {
    next[rowId] = true;
  } else {
    delete next[rowId];
  }
  return next;
}

export function collectDescendantRowIds<TData>(row: Row<TData>) {
  const rowIds: string[] = [];
  const visit = (children: Row<TData>[] | undefined) => {
    children?.forEach((child) => {
      rowIds.push(child.id);
      visit(child.subRows);
    });
  };
  visit(row.subRows);
  return rowIds;
}

export function collectTreeExpandedRows<TData>({
  rows,
  getRowId,
  getSubRows,
  maxVisibleDepth,
  maxRootCount,
}: CollectTreeExpandedRowsArgs<TData>) {
  const expandedRows: GenDataGridTreeExpandedState = {};

  const visit = (items: readonly TData[], level: number, path: GenDataGridTreePath) => {
    items.forEach((row, index) => {
      if (level === 1 && maxRootCount !== undefined && index >= maxRootCount) return;

      const rowId = getRowId(row, index, path);
      const nextPath = [...path, rowId];
      const children = getSubRows(row, index, path) ?? [];
      if (children.length === 0) return;

      if (maxVisibleDepth === undefined || level < maxVisibleDepth) {
        expandedRows[rowId] = true;
        visit(children, level + 1, nextPath);
      }
    });
  };

  visit(rows, 1, []);
  return expandedRows;
}

export function collapseTreeExpandedRowsFromDepth<TData>({
  expandedRows,
  rows,
  getRowId,
  getSubRows,
  collapseFromDepth,
  maxRootCount,
}: CollapseTreeExpandedRowsFromDepthArgs<TData>) {
  const next = normalizeTreeExpandedRows(expandedRows);

  const visit = (items: readonly TData[], level: number, path: GenDataGridTreePath) => {
    items.forEach((row, index) => {
      if (level === 1 && maxRootCount !== undefined && index >= maxRootCount) return;

      const rowId = getRowId(row, index, path);
      const nextPath = [...path, rowId];
      const children = getSubRows(row, index, path) ?? [];
      if (children.length === 0) return;

      if (level >= collapseFromDepth) {
        delete next[rowId];
      }
      visit(children, level + 1, nextPath);
    });
  };

  visit(rows, 1, []);
  return next;
}
