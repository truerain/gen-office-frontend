// packages/gen-datagrid/src/features/tree/treeState.ts
// Normalizes and updates row-id keyed tree expansion state.

import type { Row } from '@tanstack/react-table';

import type { GenDataGridTreeExpandedState } from '../../GenDataGrid.types';

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
