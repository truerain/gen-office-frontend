import type * as React from 'react';
import { PopupInput } from '@gen-office/ui';
import type { PopupInputSelection } from '@gen-office/ui';
import type { CellEditorRenderArgs } from './columnMeta';

export type PopupEditorSelection<TData = unknown> = {
  value: string;
  label: string;
  data?: TData;
};

type PopupEditorProps<TRow, TSelectionData = unknown> = {
  editor: Pick<
    CellEditorRenderArgs<TRow>,
    'value' | 'onChange' | 'onCommit' | 'onCancel' | 'onTab' | 'commitValue'
  >;
  placeholder?: string;
  readOnly?: boolean;
  contentClassName?: string;
  mapSelectionToValue?: (selection: PopupEditorSelection<TSelectionData> | null) => unknown;
  renderPopupContent: (args: {
    open: boolean;
    close: () => void;
    value: string;
    selection?: PopupEditorSelection<TSelectionData> | null;
    setSelection: (selection: PopupEditorSelection<TSelectionData> | null) => void;
  }) => React.ReactNode;
};

export function PopupEditor<TRow, TSelectionData = unknown>({
  editor,
  placeholder,
  readOnly = false,
  contentClassName,
  mapSelectionToValue,
  renderPopupContent,
}: PopupEditorProps<TRow, TSelectionData>) {
  const resolvedValue = String(editor.value ?? '');

  const handleCommitSelection = (selection: PopupEditorSelection<TSelectionData> | null) => {
    const mappedValue = mapSelectionToValue
      ? mapSelectionToValue(selection)
      : (selection?.value ?? '');
    editor.commitValue(mappedValue);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      editor.onCancel();
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      event.stopPropagation();
      editor.onCommit();
      editor.onTab?.(event.shiftKey ? -1 : 1);
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <PopupInput<TSelectionData>
        value={resolvedValue}
        onValueChange={(nextValue) => editor.onChange(nextValue)}
        onCommitValue={(committedValue, committedSelection) => {
          if (committedSelection) {
            handleCommitSelection(committedSelection as PopupEditorSelection<TSelectionData>);
            return;
          }
          editor.commitValue(committedValue);
        }}
        placeholder={placeholder}
        readOnly={readOnly}
        contentClassName={contentClassName}
        content={({ open, close, value, selection, setSelection }) =>
          renderPopupContent({
            open,
            close,
            value,
            selection: selection as PopupEditorSelection<TSelectionData> | null | undefined,
            setSelection: (nextSelection) =>
              setSelection(nextSelection as PopupInputSelection<TSelectionData> | null),
          })
        }
      />
    </div>
  );
}

