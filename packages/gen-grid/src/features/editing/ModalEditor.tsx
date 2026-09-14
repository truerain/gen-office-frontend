// packages/gen-grid/src/features/editing/ModalEditor.tsx
// Modal lookup editor that maps ModalInput selection into GenGrid cell commit values.

import * as React from 'react';
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
    'value' | 'row' | 'columnId' | 'onChange' | 'onCommit' | 'onCancel' | 'onTab' | 'commitValue'
  >;
  title?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  readOnly?: boolean;
  /** When items has no match, use this label instead of raw editor.value. */
  getDisplayLabel?: (args: { value: unknown; row: TRow }) => string | undefined;
  items?: ModalEditorSelection<TSelectionData>[];
  fetchItems?: (keyword: string) => Promise<ModalEditorSelection<TSelectionData>[]>;
  searchOnInputChange?: boolean;
  confirmOnDoubleClick?: boolean;
  autoFocusSearch?: boolean;
  modalHeight?: number | string;
  listColumns?: ModalInputListColumn<TSelectionData>[];
  clearable?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

/** When mapped commit value is a row patch, expose only the edited column for draft/display. */
function draftValueFromMapped(mapped: unknown, columnId: string): unknown {
  if (isPlainObject(mapped) && columnId in mapped) {
    return mapped[columnId];
  }
  return mapped;
}

function scalarFromEditorValue(value: unknown, columnId: string): string {
  if (isPlainObject(value) && columnId in value) {
    return String(value[columnId] ?? '').trim();
  }
  if (isPlainObject(value)) {
    return '';
  }
  return String(value ?? '').trim();
}

function resolveCurrentSelection<TRow, TSelectionData>(args: {
  value: unknown;
  row: TRow;
  columnId: string;
  items?: ModalEditorSelection<TSelectionData>[];
  getDisplayLabel?: (args: { value: unknown; row: TRow }) => string | undefined;
}): ModalEditorSelection<TSelectionData> | null {
  const resolvedValue = scalarFromEditorValue(args.value, args.columnId);
  if (!resolvedValue) return null;

  const matched =
    args.items?.find((item) => item.value === resolvedValue || item.label === resolvedValue) ?? null;
  if (matched) return matched;

  // PopupInput-style fallback: keep showing the current cell value when items has no match
  // (e.g. fetchItems-only, stale option list, or value not in local items).
  const labelSource = isPlainObject(args.value)
    ? scalarFromEditorValue(args.value, args.columnId)
    : args.value;
  const fallbackLabel = String(
    args.getDisplayLabel?.({ value: labelSource, row: args.row }) ?? ''
  ).trim();
  return {
    value: resolvedValue,
    label: fallbackLabel || resolvedValue,
  };
}

export function ModalEditor<TRow, TSelectionData = unknown>(
  props: ModalEditorProps<TRow, TSelectionData>
) {
  const {
    editor,
    mode = 'single',
    title,
    placeholder,
    searchPlaceholder,
    readOnly = true,
    getDisplayLabel,
    items,
    fetchItems,
    searchOnInputChange = false,
    confirmOnDoubleClick = true,
    autoFocusSearch = true,
    modalHeight,
    listColumns,
    clearable,
    confirmLabel,
    cancelLabel,
  } = props;
  const columnId = editor.columnId;
  const lastMappedRef = React.useRef<unknown>(undefined);

  const mapSingle = (selectedItem: ModalEditorSelection<TSelectionData> | null) => {
    if ('mapSelectedItemToValue' in props && props.mapSelectedItemToValue) {
      return props.mapSelectedItemToValue(selectedItem);
    }
    return selectedItem?.value ?? '';
  };

  const currentSelection = resolveCurrentSelection({
    value: editor.value,
    row: editor.row,
    columnId,
    items,
    getDisplayLabel,
  });
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
      // Prefer last Partial mapped from selection so sibling fields are not dropped.
      if (lastMappedRef.current !== undefined) {
        editor.commitValue(lastMappedRef.current);
      } else {
        editor.onCommit();
      }
      editor.onTab?.(event.shiftKey ? -1 : 1);
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      {mode === 'single' ? (
        <ModalInput<TSelectionData>
          mode="single"
          selectedItem={currentSelection}
          onSelectedItemChange={(selectedItem) => {
            const mappedValue = mapSingle(
              selectedItem as ModalEditorSelection<TSelectionData> | null
            );
            lastMappedRef.current = mappedValue;
            editor.onChange(draftValueFromMapped(mappedValue, columnId));
          }}
          onCommit={(selectedItem) => {
            const mappedValue = mapSingle(
              selectedItem as ModalEditorSelection<TSelectionData> | null
            );
            lastMappedRef.current = mappedValue;
            if (!selectedItem) {
              editor.onChange(draftValueFromMapped(mappedValue, columnId));
              return;
            }
            editor.commitValue(mappedValue);
          }}
          title={title}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          clearSearchOnOpen={true}
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
          clearable={clearable}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
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
            lastMappedRef.current = mappedValue;
            editor.commitValue(mappedValue);
          }}
          title={title}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          clearSearchOnOpen={true}
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
          clearable={clearable}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
        />
      )}
    </div>
  );
}
