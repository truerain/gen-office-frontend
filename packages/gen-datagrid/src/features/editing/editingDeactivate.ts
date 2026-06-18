// packages/gen-datagrid/src/features/editing/editingDeactivate.ts
// Ends the current editing session through commit or cancel.

import { resolveEditingDeactivateAction } from './blurPolicy';

import type { GenDataGridEditBlurOwnership } from '../../GenDataGrid.types';

type FinishEditingOnDeactivateArgs = {
  commitOnBlur: boolean;
  blurOwnership: GenDataGridEditBlurOwnership;
  continueClick?: boolean;
  commit: () => void;
  cancel: () => void;
};

export function finishEditingOnDeactivate({
  commitOnBlur,
  blurOwnership,
  continueClick = false,
  commit,
  cancel,
}: FinishEditingOnDeactivateArgs) {
  const action = resolveEditingDeactivateAction({ commitOnBlur, blurOwnership, continueClick });
  if (action === 'commit') {
    commit();
    return;
  }
  cancel();
}
