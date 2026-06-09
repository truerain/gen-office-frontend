// packages/gen-datagrid/src/features/range-selection/rangeSelection.ts
// Provides range selection coordinate helpers for GenDataGrid.

export type GenDataGridCellCoord = {
  rowId: string;
  columnId: string;
};

export type GenDataGridRangeSelection = {
  anchor: GenDataGridCellCoord;
  focus: GenDataGridCellCoord;
};

export type GenDataGridRangeSelections = GenDataGridRangeSelection[];

export type GenDataGridRangeBounds = {
  rowMin: number;
  rowMax: number;
  columnMin: number;
  columnMax: number;
  rowIds: string[];
  columnIds: string[];
};

function toBounds(first: number, second: number) {
  return {
    min: Math.min(first, second),
    max: Math.max(first, second),
  };
}

export function resolveRangeSelectionBounds({
  rowIds,
  columnIds,
  selection,
}: {
  rowIds: readonly string[];
  columnIds: readonly string[];
  selection: GenDataGridRangeSelection | null;
}): GenDataGridRangeBounds | null {
  if (!selection) return null;

  const anchorRowIndex = rowIds.indexOf(selection.anchor.rowId);
  const focusRowIndex = rowIds.indexOf(selection.focus.rowId);
  const anchorColumnIndex = columnIds.indexOf(selection.anchor.columnId);
  const focusColumnIndex = columnIds.indexOf(selection.focus.columnId);

  if (
    anchorRowIndex < 0 ||
    focusRowIndex < 0 ||
    anchorColumnIndex < 0 ||
    focusColumnIndex < 0
  ) {
    return null;
  }

  const rowBounds = toBounds(anchorRowIndex, focusRowIndex);
  const columnBounds = toBounds(anchorColumnIndex, focusColumnIndex);

  return {
    rowMin: rowBounds.min,
    rowMax: rowBounds.max,
    columnMin: columnBounds.min,
    columnMax: columnBounds.max,
    rowIds: rowIds.slice(rowBounds.min, rowBounds.max + 1),
    columnIds: columnIds.slice(columnBounds.min, columnBounds.max + 1),
  };
}

export function isCellInRangeSelection({
  rowId,
  columnId,
  rowIds,
  columnIds,
  selection,
}: {
  rowId: string;
  columnId: string;
  rowIds: readonly string[];
  columnIds: readonly string[];
  selection: GenDataGridRangeSelection | null;
}) {
  const bounds = resolveRangeSelectionBounds({ rowIds, columnIds, selection });
  if (!bounds) return false;
  const rowIndex = rowIds.indexOf(rowId);
  const columnIndex = columnIds.indexOf(columnId);

  return (
    rowIndex >= bounds.rowMin &&
    rowIndex <= bounds.rowMax &&
    columnIndex >= bounds.columnMin &&
    columnIndex <= bounds.columnMax
  );
}

export function isCellInRangeSelections({
  rowId,
  columnId,
  rowIds,
  columnIds,
  selections,
}: {
  rowId: string;
  columnId: string;
  rowIds: readonly string[];
  columnIds: readonly string[];
  selections: readonly GenDataGridRangeSelection[];
}) {
  return selections.some((selection) =>
    isCellInRangeSelection({
      rowId,
      columnId,
      rowIds,
      columnIds,
      selection,
    })
  );
}

export function getLastRangeSelection(
  selections: readonly GenDataGridRangeSelection[]
) {
  return selections[selections.length - 1] ?? null;
}
