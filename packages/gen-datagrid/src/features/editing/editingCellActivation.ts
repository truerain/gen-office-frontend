// packages/gen-datagrid/src/features/editing/editingCellActivation.ts
// Deactivates the current editing cell when another cell is activated.

import type {
  GenDataGridCellValueChange,
  GenDataGridEditBlurOwnership,
} from '../../GenDataGrid.types';
import { finishEditingOnDeactivate } from './editingDeactivate';

type DeactivateEditingForCellActivationArgs<TData> = {
  row: TData;
  rowId: string;
  rowIndex: number;
  columnId: string;
  previousValue: unknown;
  draftValue: unknown;
  commitOnBlur: boolean;
  blurOwnership: GenDataGridEditBlurOwnership;
  continueClick?: boolean;
  onCellValueChange?: (args: GenDataGridCellValueChange<TData>) => void;
  onEditCancel: () => void;
};

export function deactivateEditingForCellActivation<TData>({
  row,
  rowId,
  rowIndex,
  columnId,
  previousValue,
  draftValue,
  commitOnBlur,
  blurOwnership,
  continueClick = false,
  onCellValueChange,
  onEditCancel,
}: DeactivateEditingForCellActivationArgs<TData>) {
  finishEditingOnDeactivate({
    commitOnBlur,
    blurOwnership,
    continueClick,
    commit: () => {
      onCellValueChange?.({
        row,
        rowId,
        rowIndex,
        columnId,
        previousValue,
        value: draftValue,
      });
      onEditCancel();
    },
    cancel: onEditCancel,
  });
}
