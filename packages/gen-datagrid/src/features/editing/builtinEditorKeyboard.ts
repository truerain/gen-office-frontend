// packages/gen-datagrid/src/features/editing/builtinEditorKeyboard.ts
// Resolves Gate 4.1-c built-in editor keyboard ownership for default editors.

import type * as React from 'react';

import type { GenDataGridEditType, GenDataGridEditorContext } from '../../GenDataGrid.types';

export function delegatesArrowKeysToGrid(editType?: GenDataGridEditType) {
  return editType !== 'textarea' && editType !== 'select';
}

export function handleBuiltinEditorArrowNavigation<TData>(
  event: React.KeyboardEvent<HTMLElement>,
  ctx: GenDataGridEditorContext<TData>
) {
  if (
    event.key !== 'ArrowUp' &&
    event.key !== 'ArrowDown' &&
    event.key !== 'ArrowLeft' &&
    event.key !== 'ArrowRight'
  ) {
    return false;
  }

  if (!delegatesArrowKeysToGrid(ctx.editType) || !ctx.arrowNavigate) {
    return false;
  }

  event.preventDefault();
  ctx.arrowNavigate(event.key);
  return true;
}

export function handleBuiltinEditorKeyDown<TData>(
  event: React.KeyboardEvent<HTMLElement>,
  ctx: GenDataGridEditorContext<TData>
) {
  if (event.key === 'Tab') {
    event.preventDefault();
    ctx.tabNavigate?.(event.shiftKey ? -1 : 1);
    return;
  }

  if (handleBuiltinEditorArrowNavigation(event, ctx)) {
    return;
  }

  if (event.key === 'Enter' && ctx.editType !== 'textarea') {
    event.preventDefault();
    ctx.commit();
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    ctx.cancel();
  }
}
