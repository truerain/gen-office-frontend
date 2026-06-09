// packages/gen-datagrid/src/features/range-selection/useClipboardActions.ts
// Provides clipboard actions for the current GenDataGrid range selection.

import * as React from 'react';
import type { Table } from '@tanstack/react-table';

import type { GenDataGridRangeSelection } from './rangeSelection';
import { buildClipboardMatrix, serializeClipboardMatrix } from './clipboard';

export function useClipboardActions<TData>({
  table,
  selection,
  enabled,
  includeHeader,
}: {
  table: Table<TData>;
  selection: GenDataGridRangeSelection | null;
  enabled: boolean;
  includeHeader?: boolean;
}) {
  const copySelection = React.useCallback(
    async (options?: { includeHeader?: boolean }) => {
      if (!enabled || !selection) return false;

      const matrix = buildClipboardMatrix({
        table,
        selection,
        includeHeader: options?.includeHeader ?? includeHeader,
      });
      if (matrix.length === 0) return false;

      const text = serializeClipboardMatrix(matrix);
      await navigator.clipboard.writeText(text);
      return true;
    },
    [enabled, includeHeader, selection, table]
  );

  return {
    canCopy: enabled && Boolean(selection),
    copySelection,
  };
}
