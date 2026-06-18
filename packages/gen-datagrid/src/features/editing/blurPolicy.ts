// packages/gen-datagrid/src/features/editing/blurPolicy.ts
// Resolves Gate 4.1-d blur ownership and editor-surface blur guards.

import type * as React from 'react';

import type {
  GenDataGridEditBlurOwnership,
  GenDataGridEditPolicy,
  GenDataGridEditType,
} from '../../GenDataGrid.types';

export const GEN_DATAGRID_EDITOR_SURFACE_ATTR = 'data-gen-datagrid-editor-surface';

export type EditingDeactivateAction = 'commit' | 'cancel';

export function defaultBlurOwnershipForEditType(
  editType?: GenDataGridEditType
): GenDataGridEditBlurOwnership {
  if (editType === 'select') {
    return 'portal';
  }
  return 'inline';
}

export function resolveBlurOwnership({
  editType,
  gridPolicy,
  columnPolicy,
  columnBlurOwnership,
}: {
  editType?: GenDataGridEditType;
  gridPolicy?: GenDataGridEditPolicy;
  columnPolicy?: GenDataGridEditPolicy;
  columnBlurOwnership?: GenDataGridEditBlurOwnership;
}): GenDataGridEditBlurOwnership {
  return (
    columnBlurOwnership ??
    columnPolicy?.blurOwnership ??
    gridPolicy?.blurOwnership ??
    defaultBlurOwnershipForEditType(editType)
  );
}

export function resolveEditingDeactivateAction({
  commitOnBlur,
  blurOwnership,
  continueClick = false,
}: {
  commitOnBlur: boolean;
  blurOwnership: GenDataGridEditBlurOwnership;
  continueClick?: boolean;
}): EditingDeactivateAction {
  if (blurOwnership === 'modal') {
    return 'cancel';
  }
  if (continueClick) {
    return 'commit';
  }
  return commitOnBlur ? 'commit' : 'cancel';
}

export function isInsideEditorSurface(
  node: Node | null | undefined,
  options: {
    gridRoot: HTMLElement | null;
    editorSurfaces: Iterable<HTMLElement>;
  }
): boolean {
  if (!node) {
    return false;
  }

  const element =
    node instanceof HTMLElement ? node : node.parentElement instanceof HTMLElement ? node.parentElement : null;
  if (!element) {
    return false;
  }

  const markedSurface = element.closest(
    `[${GEN_DATAGRID_EDITOR_SURFACE_ATTR}="true"]`
  ) as HTMLElement | null;
  if (markedSurface) {
    if (options.gridRoot?.contains(markedSurface)) {
      return true;
    }
    for (const registeredSurface of options.editorSurfaces) {
      if (registeredSurface === markedSurface || registeredSurface.contains(markedSurface)) {
        return true;
      }
    }
  }

  for (const registeredSurface of options.editorSurfaces) {
    if (registeredSurface.contains(element)) {
      return true;
    }
  }

  return false;
}

export function shouldIgnoreEditorBlur(
  event: React.FocusEvent<HTMLElement>,
  options: {
    blurOwnership: GenDataGridEditBlurOwnership;
    gridRoot: HTMLElement | null;
    editorSurfaces: Iterable<HTMLElement>;
  }
): boolean {
  if (options.blurOwnership === 'modal') {
    return true;
  }

  return isInsideEditorSurface(event.relatedTarget, options);
}

export function createEditorBlurHandler<TData>({
  blurOwnership,
  commitOnBlur,
  gridRoot,
  getEditorSurfaces,
  commit,
}: {
  blurOwnership: GenDataGridEditBlurOwnership;
  commitOnBlur?: boolean;
  gridRoot: HTMLElement | null;
  getEditorSurfaces: () => Iterable<HTMLElement>;
  commit: () => void;
}) {
  return (event: React.FocusEvent<HTMLElement>) => {
    if (
      shouldIgnoreEditorBlur(event, {
        blurOwnership,
        gridRoot,
        editorSurfaces: getEditorSurfaces(),
      })
    ) {
      return;
    }

    if (!commitOnBlur) {
      return;
    }

    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    commit();
  };
}
