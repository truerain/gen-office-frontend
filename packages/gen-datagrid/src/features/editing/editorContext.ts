// packages/gen-datagrid/src/features/editing/editorContext.ts
// Builds the shared editor context passed to custom and fallback editors.

import type {
  GenDataGridEditableContext,
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
  };
}
