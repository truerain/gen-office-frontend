// packages/gen-datagrid/src/features/range-selection/paste.ts
// Resolves and applies plain-text clipboard paste data to editable grid cells.

import type { Column, Row } from '@tanstack/react-table';

import type {
  GenDataGridCellValueChange,
  GenDataGridEditableContext,
  GenDataGridPasteError,
  GenDataGridPasteOptions,
} from '../../GenDataGrid.types';
import { createEditableContext, resolveEditableCell } from '../editing/editableCell';

export type GenDataGridPasteTargetRange = {
  anchor: { rowId: string; columnId: string };
  focus: { rowId: string; columnId: string };
};

export type GenDataGridPasteApplyResult = {
  appliedCellCount: number;
  skippedCellCount: number;
  targetRange: GenDataGridPasteTargetRange | null;
};

type PasteCandidate<TData> = {
  row: Row<TData>;
  column: Column<TData, unknown>;
  rowIndex: number;
  columnIndex: number;
  value: string;
  editableContext: GenDataGridEditableContext<TData>;
};

export type ApplyClipboardPasteArgs<TData> = {
  matrix: string[][];
  rows: Row<TData>[];
  columns: Column<TData, unknown>[];
  activeCell: { rowId: string; columnId: string } | null;
  readOnly?: boolean;
  isCellEditable?: (ctx: GenDataGridEditableContext<TData>) => boolean;
  pasteOptions?: GenDataGridPasteOptions;
  onCellValueChange?: (args: GenDataGridCellValueChange<TData>) => void;
  onActiveCellChange?: (next: { rowId: string; columnId: string }) => void;
  setTargetRange?: (next: GenDataGridPasteTargetRange) => void;
};

function getPasteOptionDefaults(pasteOptions?: GenDataGridPasteOptions) {
  return {
    errorMode: pasteOptions?.errorMode ?? 'silent',
    failureBehavior: pasteOptions?.failureBehavior ?? 'skipCell',
  };
}

function getPasteTargetRange<TData>({
  candidates,
  rowIds,
  columnIds,
}: {
  candidates: PasteCandidate<TData>[];
  rowIds: string[];
  columnIds: string[];
}): GenDataGridPasteTargetRange | null {
  if (candidates.length === 0) return null;

  const rowIndexes = candidates.map((candidate) => rowIds.indexOf(candidate.row.id));
  const columnIndexes = candidates.map((candidate) => columnIds.indexOf(candidate.column.id));
  const rowMin = Math.min(...rowIndexes);
  const rowMax = Math.max(...rowIndexes);
  const columnMin = Math.min(...columnIndexes);
  const columnMax = Math.max(...columnIndexes);

  return {
    anchor: {
      rowId: rowIds[rowMin]!,
      columnId: columnIds[columnMin]!,
    },
    focus: {
      rowId: rowIds[rowMax]!,
      columnId: columnIds[columnMax]!,
    },
  };
}

export function applyClipboardPaste<TData>({
  matrix,
  rows,
  columns,
  activeCell,
  readOnly,
  isCellEditable,
  pasteOptions,
  onCellValueChange,
  onActiveCellChange,
  setTargetRange,
}: ApplyClipboardPasteArgs<TData>): GenDataGridPasteApplyResult {
  const { errorMode, failureBehavior } = getPasteOptionDefaults(pasteOptions);
  const errors: GenDataGridPasteError[] = [];
  const candidates: PasteCandidate<TData>[] = [];
  const rowIds = rows.map((row) => row.id);
  const columnIds = columns.map((column) => column.id);
  const startRowIndex = activeCell ? rowIds.indexOf(activeCell.rowId) : -1;
  const startColumnIndex = activeCell ? columnIds.indexOf(activeCell.columnId) : -1;

  if (!activeCell || startRowIndex < 0 || startColumnIndex < 0) {
    errors.push({ reason: 'outOfBounds' });
  }

  if (matrix.length === 0 || matrix.every((row) => row.length === 0)) {
    errors.push({ reason: 'parseError' });
  }

  if (errors.length === 0) {
    for (let matrixRowIndex = 0; matrixRowIndex < matrix.length; matrixRowIndex++) {
      const matrixRow = matrix[matrixRowIndex] ?? [];
      for (let matrixColumnIndex = 0; matrixColumnIndex < matrixRow.length; matrixColumnIndex++) {
        const value = matrixRow[matrixColumnIndex] ?? '';
        const rowIndex = startRowIndex + matrixRowIndex;
        const columnIndex = startColumnIndex + matrixColumnIndex;
        const row = rows[rowIndex];
        const column = columns[columnIndex];

        if (!row || !column) {
          errors.push({
            reason: 'outOfBounds',
            rowIndex,
            columnIndex,
            value,
          });
          continue;
        }

        if (readOnly) {
          errors.push({
            reason: 'readOnly',
            rowId: row.id,
            columnId: column.id,
            rowIndex,
            columnIndex,
            value,
          });
          continue;
        }

        const editableContext = createEditableContext({ row, column });
        const isEditable = resolveEditableCell({
          row,
          column,
          readOnly,
          isCellEditable,
        });

        if (!isEditable) {
          errors.push({
            reason: 'nonEditableCell',
            rowId: row.id,
            columnId: column.id,
            rowIndex,
            columnIndex,
            value,
          });
          continue;
        }

        candidates.push({
          row,
          column,
          rowIndex,
          columnIndex,
          value,
          editableContext,
        });
      }
    }
  }

  const shouldCancel = failureBehavior === 'cancelPaste' && errors.length > 0;
  const acceptedCandidates = shouldCancel ? [] : candidates;
  const targetRange = getPasteTargetRange({
    candidates: acceptedCandidates,
    rowIds,
    columnIds,
  });

  if (errorMode === 'report' && errors.length > 0) {
    pasteOptions?.onError?.(errors);
  }

  if (!shouldCancel) {
    for (const candidate of acceptedCandidates) {
      onCellValueChange?.({
        row: candidate.row.original,
        rowId: candidate.row.id,
        rowIndex: candidate.row.index,
        columnId: candidate.column.id,
        previousValue: candidate.editableContext.value,
        value: candidate.value,
      });
    }
  }

  const lastCandidate = acceptedCandidates[acceptedCandidates.length - 1];
  if (lastCandidate) {
    onActiveCellChange?.({
      rowId: lastCandidate.row.id,
      columnId: lastCandidate.column.id,
    });
  }
  if (targetRange) {
    setTargetRange?.(targetRange);
  }

  return {
    appliedCellCount: acceptedCandidates.length,
    skippedCellCount: errors.length + (shouldCancel ? candidates.length : 0),
    targetRange,
  };
}
