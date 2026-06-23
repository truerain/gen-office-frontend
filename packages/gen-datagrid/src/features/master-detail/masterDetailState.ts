// packages/gen-datagrid/src/features/master-detail/masterDetailState.ts
// Normalizes and updates row-id keyed master-detail expansion state.

import type { GenDataGridExpandedRowState } from '../../GenDataGrid.types';

export function normalizeExpandedRows(
  expandedRows: GenDataGridExpandedRowState | undefined
) {
  const next: GenDataGridExpandedRowState = {};
  if (!expandedRows) return next;
  Object.entries(expandedRows).forEach(([rowId, expanded]) => {
    if (expanded) next[rowId] = true;
  });
  return next;
}

export function setExpandedRow(
  expandedRows: GenDataGridExpandedRowState,
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
