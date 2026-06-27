// packages/gen-datagrid/src/features/visual-row-merge/visualRowMerge.ts
// Calculates visual row merge metadata from the current row model order.

import type { Row } from '@tanstack/react-table';

import type {
  GenDataGridVisualRowMergeDisplayState,
  GenDataGridVisualRowMergeOption,
  GenDataGridVisualRowMergeState,
} from '../../GenDataGrid.types';
import { isGenDataGridSystemColumnId } from '../system-columns/systemColumns';

type VisualRowMergeRow<TData> = Pick<Row<TData>, 'id' | 'index' | 'original' | 'getValue'>;

export type GenDataGridVisualRowMergeModel = Record<
  string,
  GenDataGridVisualRowMergeState
>;

export type GenDataGridVisualRowMergeDisplayModel = Record<
  string,
  GenDataGridVisualRowMergeDisplayState
>;

export type BuildVisualRowMergeModelArgs<TData> = {
  rows: readonly VisualRowMergeRow<TData>[];
  columnIds: readonly string[];
  isColumnMergeEnabled: (columnId: string) => boolean;
};

export type BuildVisibleStartVisualRowMergeDisplayModelArgs<TData> = {
  rows: readonly VisualRowMergeRow<TData>[];
  columnIds: readonly string[];
  mergeModel: GenDataGridVisualRowMergeModel | undefined;
  visibleRowStartIndex: number | undefined;
};

export type ResolvedGenDataGridVisualRowMergeOption = {
  enabled: boolean;
  showContinuationValue: boolean;
  stickyLabel: boolean;
};

export function createVisualRowMergeKey(rowId: string, columnId: string) {
  return `${rowId}::${columnId}`;
}

export function resolveVisualRowMergeOption(
  option: GenDataGridVisualRowMergeOption | undefined
): ResolvedGenDataGridVisualRowMergeOption {
  if (option === true) {
    return {
      enabled: true,
      showContinuationValue: true,
      stickyLabel: true,
    };
  }

  if (!option) {
    return {
      enabled: false,
      showContinuationValue: false,
      stickyLabel: false,
    };
  }

  const enabled = option.enabled ?? true;
  return {
    enabled,
    showContinuationValue: enabled && (option.showContinuationValue ?? true),
    stickyLabel: enabled && (option.stickyLabel ?? true),
  };
}

export function getVisualRowMergeState(
  model: GenDataGridVisualRowMergeModel | undefined,
  rowId: string,
  columnId: string
) {
  return model?.[createVisualRowMergeKey(rowId, columnId)] ?? 'single';
}

export function buildVisualRowMergeModel<TData>({
  rows,
  columnIds,
  isColumnMergeEnabled,
}: BuildVisualRowMergeModelArgs<TData>): GenDataGridVisualRowMergeModel {
  const model: GenDataGridVisualRowMergeModel = {};

  for (const columnId of columnIds) {
    if (isGenDataGridSystemColumnId(columnId) || !isColumnMergeEnabled(columnId)) {
      continue;
    }

    let runStartIndex = 0;
    while (runStartIndex < rows.length) {
      const runValue = rows[runStartIndex]?.getValue(columnId);
      let runEndIndex = runStartIndex + 1;

      while (
        runEndIndex < rows.length &&
        Object.is(rows[runEndIndex]?.getValue(columnId), runValue)
      ) {
        runEndIndex += 1;
      }

      const runLength = runEndIndex - runStartIndex;
      for (let rowIndex = runStartIndex; rowIndex < runEndIndex; rowIndex += 1) {
        const row = rows[rowIndex];
        if (!row) continue;

        let state: GenDataGridVisualRowMergeState = 'single';
        if (runLength > 1) {
          if (rowIndex === runStartIndex) {
            state = 'start';
          } else if (rowIndex === runEndIndex - 1) {
            state = 'end';
          } else {
            state = 'middle';
          }
        }

        model[createVisualRowMergeKey(row.id, columnId)] = state;
      }

      runStartIndex = runEndIndex;
    }
  }

  return model;
}

export function buildVisibleStartVisualRowMergeDisplayModel<TData>({
  rows,
  columnIds,
  mergeModel,
  visibleRowStartIndex,
}: BuildVisibleStartVisualRowMergeDisplayModelArgs<TData>): GenDataGridVisualRowMergeDisplayModel {
  const displayModel: GenDataGridVisualRowMergeDisplayModel = {};
  if (!mergeModel || visibleRowStartIndex === undefined || visibleRowStartIndex < 0) {
    return displayModel;
  }

  const row = rows[visibleRowStartIndex];
  if (!row) return displayModel;

  for (const columnId of columnIds) {
    if (isGenDataGridSystemColumnId(columnId)) continue;

    const key = createVisualRowMergeKey(row.id, columnId);
    const state = mergeModel[key];
    if (state === 'middle' || state === 'end') {
      displayModel[key] = 'visible-start';
    }
  }

  return displayModel;
}
