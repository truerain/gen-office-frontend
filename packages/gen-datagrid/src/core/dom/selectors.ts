// packages/gen-datagrid/src/core/dom/selectors.ts
// Defines root-scoped DOM selectors for GenDataGrid.

export const gridRootSelector = '[data-gen-datagrid-root="true"]';
export const gridViewportSelector = '[data-gen-datagrid-viewport="true"]';
export const gridCellSelector = '[data-gen-datagrid-cell="true"]';
export const bodyCellSelector =
  '[data-gen-datagrid-cell="true"][data-cell-kind="body"][data-rowid][data-colid]';

export function getCellSelector(rowId: string, columnId: string) {
  const escapedRowId = cssEscape(rowId);
  const escapedColumnId = cssEscape(columnId);
  return `${bodyCellSelector}[data-rowid="${escapedRowId}"][data-colid="${escapedColumnId}"]`;
}

function cssEscape(value: string) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }

  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
