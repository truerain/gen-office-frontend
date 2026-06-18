// packages/gen-datagrid/src/features/editing/editorContext.ts
// Builds the shared editor context passed to custom and fallback editors.

import type {
  GenDataGridEditableContext,
  GenDataGridEditBlurOwnership,
  GenDataGridEditEntryReason,
  GenDataGridEditOption,
  GenDataGridEditorContext,
  GenDataGridEditType,
} from '../../GenDataGrid.types';

type CreateEditorContextArgs<TData> = {
  editableContext: GenDataGridEditableContext<TData>;
  draftValue: unknown;
  setDraftValue: (nextValue: unknown) => void;
  commit: (nextValue?: unknown) => void;
  cancel: () => void;
  editType?: GenDataGridEditType;
  editOptions?: readonly GenDataGridEditOption[];
  placeholder?: string;
  selectOnFocus?: boolean;
  commitOnBlur?: boolean;
  tabNavigate?: (direction: 1 | -1) => void;
  arrowNavigate?: (key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') => void;
  openOnEditStart?: boolean;
  editEntryReason?: GenDataGridEditEntryReason;
  blurOwnership?: GenDataGridEditBlurOwnership;
  registerEditorSurface?: (element: HTMLElement) => void;
  unregisterEditorSurface?: (element: HTMLElement) => void;
  getGridRoot?: () => HTMLElement | null;
  getEditorSurfaces?: () => Iterable<HTMLElement>;
};

export function createEditorContext<TData>({
  editableContext,
  draftValue,
  setDraftValue,
  commit,
  cancel,
  editType,
  editOptions,
  placeholder,
  selectOnFocus,
  commitOnBlur,
  tabNavigate,
  arrowNavigate,
  openOnEditStart,
  editEntryReason,
  blurOwnership,
  registerEditorSurface,
  unregisterEditorSurface,
  getGridRoot,
  getEditorSurfaces,
}: CreateEditorContextArgs<TData>): GenDataGridEditorContext<TData> {
  return {
    ...editableContext,
    draftValue,
    setDraftValue,
    commit,
    cancel,
    applyValue: (nextValue) => {
      setDraftValue(nextValue);
      commit(nextValue);
    },
    editType,
    editOptions,
    placeholder,
    selectOnFocus,
    commitOnBlur,
    tabNavigate,
    arrowNavigate,
    openOnEditStart,
    editEntryReason,
    blurOwnership,
    registerEditorSurface,
    unregisterEditorSurface,
    getGridRoot,
    getEditorSurfaces,
  };
}
