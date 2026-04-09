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

type ModalEditorBaseProps<TRow, TSelectionData = unknown> = {
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
  searchOnInputChange?: boolean;
  confirmOnDoubleClick?: boolean;
  autoFocusSearch?: boolean;
  modalHeight?: number | string;
  listColumns?: ModalInputListColumn<TSelectionData>[];
};

type SingleModalEditorProps<TRow, TSelectionData = unknown> = ModalEditorBaseProps<
  TRow,
  TSelectionData
> & {
  mode?: 'single';
  mapSelectedItemToValue?: (selectedItem: ModalEditorSelection<TSelectionData> | null) => unknown;
};

type MultiModalEditorProps<TRow, TSelectionData = unknown> = ModalEditorBaseProps<
  TRow,
  TSelectionData
> & {
  mode: 'multi';
  mapSelectedItemsToValue?: (selectedItems: ModalEditorSelection<TSelectionData>[]) => unknown;
};

type ModalEditorProps<TRow, TSelectionData = unknown> =
  | SingleModalEditorProps<TRow, TSelectionData>
  | MultiModalEditorProps<TRow, TSelectionData>;

export function ModalEditor<TRow, TSelectionData = unknown>(
  props: ModalEditorProps<TRow, TSelectionData>
) {
  const {
    editor,
    mode = 'single',
    title,
    placeholder,
    searchPlaceholder,
    readOnly = false,
    items,
    fetchItems,
    searchOnInputChange = false,
    confirmOnDoubleClick = true,
    autoFocusSearch = true,
    modalHeight,
    listColumns,
  } = props;
  const resolvedValue = String(editor.value ?? '').trim();
  const currentSelection =
    items?.find((item) => item.value === resolvedValue || item.label === resolvedValue) ?? null;
  const currentSelections = currentSelection ? [currentSelection] : [];

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
      {mode === 'single' ? (
        <ModalInput<TSelectionData>
          mode="single"
          selectedItem={currentSelection}
          onCommit={(selectedItem) => {
            const mappedValue =
              'mapSelectedItemToValue' in props && props.mapSelectedItemToValue
                ? props.mapSelectedItemToValue(
                    selectedItem as ModalEditorSelection<TSelectionData> | null
                  )
                : (selectedItem?.value ?? '');
            editor.commitValue(mappedValue);
          }}
          title={title}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          readOnly={readOnly}
          items={items as ModalInputSelection<TSelectionData>[] | undefined}
          fetchItems={
            fetchItems as ((keyword: string) => Promise<ModalInputSelection<TSelectionData>[]>) | undefined
          }
          searchOnInputChange={searchOnInputChange}
          confirmOnDoubleClick={confirmOnDoubleClick}
          autoFocusSearch={autoFocusSearch}
          modalHeight={modalHeight}
          listColumns={listColumns}
        />
      ) : (
        <ModalInput<TSelectionData>
          mode="multi"
          selectedItems={currentSelections}
          onCommit={(selectedItems) => {
            const nextItems = selectedItems as ModalEditorSelection<TSelectionData>[];
            const mappedValue =
              'mapSelectedItemsToValue' in props && props.mapSelectedItemsToValue
                ? props.mapSelectedItemsToValue(nextItems)
                : nextItems.map((item) => item.value);
            editor.commitValue(mappedValue);
          }}
          title={title}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          readOnly={readOnly}
          items={items as ModalInputSelection<TSelectionData>[] | undefined}
          fetchItems={
            fetchItems as ((keyword: string) => Promise<ModalInputSelection<TSelectionData>[]>) | undefined
          }
          searchOnInputChange={searchOnInputChange}
          confirmOnDoubleClick={confirmOnDoubleClick}
          autoFocusSearch={autoFocusSearch}
          modalHeight={modalHeight}
          listColumns={listColumns}
        />
      )}
    </div>
  );
}
