import type * as React from 'react';
import { ModalInput } from '@gen-office/ui';
import type { ModalInputSelection } from '@gen-office/ui';
import type { ModalInputListColumn } from '@gen-office/ui';
import type { CellEditorRenderArgs } from './columnMeta';

export type ModalEditorSelection<TData = unknown> = {
  value: string;
  label: string;
  description?: string;
  data?: TData;
  disabled?: boolean;
  keywords?: string[];
};

type ModalEditorProps<TRow, TSelectionData = unknown> = {
  editor: Pick<
    CellEditorRenderArgs<TRow>,
    'value' | 'onChange' | 'onCommit' | 'onCancel' | 'onTab' | 'commitValue'
  >;
  title?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  readOnly?: boolean;
  items?: ModalEditorSelection<TSelectionData>[];
  fetchItems?: (keyword: string) => Promise<ModalEditorSelection<TSelectionData>[]>;
  mapSelectionToValue?: (selection: ModalEditorSelection<TSelectionData> | null) => unknown;
  confirmOnDoubleClick?: boolean;
  autoFocusSearch?: boolean;
  modalHeight?: number | string;
  listColumns?: ModalInputListColumn<TSelectionData>[];
};

export function ModalEditor<TRow, TSelectionData = unknown>({
  editor,
  title,
  placeholder,
  searchPlaceholder,
  readOnly = false,
  items,
  fetchItems,
  mapSelectionToValue,
  confirmOnDoubleClick = true,
  autoFocusSearch = true,
  modalHeight,
  listColumns,
}: ModalEditorProps<TRow, TSelectionData>) {
  const resolvedValue = String(editor.value ?? '');

  const handleCommitSelection = (selection: ModalEditorSelection<TSelectionData> | null) => {
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
      <ModalInput<TSelectionData>
        value={resolvedValue}
        onValueChange={(nextValue) => editor.onChange(nextValue)}
        onCommitValue={(committedValue, committedSelection) => {
          if (committedSelection) {
            handleCommitSelection(committedSelection as ModalEditorSelection<TSelectionData>);
            return;
          }
          editor.commitValue(committedValue);
        }}
        title={title}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        readOnly={readOnly}
        items={items as ModalInputSelection<TSelectionData>[] | undefined}
        fetchItems={fetchItems as ((keyword: string) => Promise<ModalInputSelection<TSelectionData>[]>) | undefined}
        confirmOnDoubleClick={confirmOnDoubleClick}
        autoFocusSearch={autoFocusSearch}
        modalHeight={modalHeight}
        listColumns={listColumns}
      />
    </div>
  );
}
