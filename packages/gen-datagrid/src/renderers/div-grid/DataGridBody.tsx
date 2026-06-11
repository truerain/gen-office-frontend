// packages/gen-datagrid/src/renderers/div-grid/DataGridBody.tsx
// Renders baseline body rows for the div-based DataGrid renderer.

import * as React from 'react';
import { flexRender, type Row } from '@tanstack/react-table';

import type {
  GenDataGridActiveCell,
  GenDataGridCellValueChange,
  GenDataGridEditableContext,
  GenDataGridEditorContext,
  GenDataGridEditorFactory,
} from '../../GenDataGrid.types';
import { createEditableContext, resolveEditableCell } from '../../features/editing/editableCell';
import type { GenDataGridEditingCell } from '../../features/editing/useCellEditing';
import {
  isCellInRangeSelections,
  type GenDataGridRangeSelections,
} from '../../features/range-selection/rangeSelection';
import { DataGridCell } from './DataGridCell';
import { formatCellValue } from './cellValue';

type DataGridBodyProps<TData> = {
  rows: Row<TData>[];
  gridTemplateColumns: string;
  rowHeight: number;
  rowIds: readonly string[];
  columnIds: readonly string[];
  rangeSelections: GenDataGridRangeSelections;
  readOnly?: boolean;
  isCellEditable?: (ctx: GenDataGridEditableContext<TData>) => boolean;
  editSelectOnFocus?: boolean;
  editorFactory?: GenDataGridEditorFactory<TData>;
  onCellValueChange?: (args: GenDataGridCellValueChange<TData>) => void;
  getRowHeight?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
  }) => number | undefined;
  activeCell: GenDataGridActiveCell;
  onActiveCellChange: (next: Exclude<GenDataGridActiveCell, null>) => void;
  editingCell: GenDataGridEditingCell | null;
  draftValue: unknown;
  setDraftValue: (nextValue: unknown) => void;
  onEditStart: (args: GenDataGridEditingCell & { value: unknown }) => void;
  onEditCancel: () => void;
};

function normalizeEditorValue(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  return String(value);
}

function DefaultCellEditor<TData>({
  ctx,
  editType,
  editOptions,
  placeholder,
  selectOnFocus,
}: {
  ctx: GenDataGridEditorContext<TData>;
  editType?: string;
  editOptions?: readonly { label: string; value: string | number | boolean }[];
  placeholder?: string;
  selectOnFocus?: boolean;
}) {
  if (editType === 'textarea') {
    return (
      <textarea
        aria-label={`${ctx.columnId} editor`}
        autoFocus
        className="gen-datagrid__editor gen-datagrid__editor--textarea"
        placeholder={placeholder}
        value={String(normalizeEditorValue(ctx.draftValue))}
        onChange={(event) => ctx.setDraftValue(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            ctx.cancel();
          }
        }}
      />
    );
  }

  if (editType === 'select') {
    return (
      <select
        aria-label={`${ctx.columnId} editor`}
        autoFocus
        className="gen-datagrid__editor"
        value={String(normalizeEditorValue(ctx.draftValue))}
        onChange={(event) => ctx.setDraftValue(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            ctx.commit();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            ctx.cancel();
          }
        }}
      >
        {editOptions?.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (editType === 'checkbox') {
    return (
      <input
        aria-label={`${ctx.columnId} editor`}
        autoFocus
        className="gen-datagrid__editor"
        type="checkbox"
        checked={Boolean(ctx.draftValue)}
        onChange={(event) => ctx.setDraftValue(event.currentTarget.checked)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            ctx.commit();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            ctx.cancel();
          }
        }}
      />
    );
  }

  return (
    <input
      aria-label={`${ctx.columnId} editor`}
      autoFocus
      className="gen-datagrid__editor"
      placeholder={placeholder}
      type={editType === 'number' || editType === 'date' ? editType : 'text'}
      value={String(normalizeEditorValue(ctx.draftValue))}
      onFocus={(event) => {
        if (!selectOnFocus) return;
        event.currentTarget.select();
      }}
      onChange={(event) => ctx.setDraftValue(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          ctx.commit();
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          ctx.cancel();
        }
      }}
    />
  );
}

export function DataGridBody<TData>({
  rows,
  gridTemplateColumns,
  rowHeight,
  rowIds,
  columnIds,
  rangeSelections,
  readOnly,
  isCellEditable,
  editSelectOnFocus,
  editorFactory,
  onCellValueChange,
  getRowHeight,
  activeCell,
  onActiveCellChange,
  editingCell,
  draftValue,
  setDraftValue,
  onEditStart,
  onEditCancel,
}: DataGridBodyProps<TData>) {
  return (
    <div role="rowgroup" data-gen-datagrid-body="true" className="gen-datagrid__body">
      {rows.map((row) => {
        const rowId = row.id;
        const rowIndex = row.index;
        const resolvedRowHeight =
          getRowHeight?.({ row: row.original, rowId, rowIndex }) ?? rowHeight;
        return (
          <div
            key={rowId}
            role="row"
            data-rowid={rowId}
            data-row-index={rowIndex}
            className="gen-datagrid__row"
            style={{
              gridTemplateColumns,
              ['--gen-datagrid-current-row-height' as string]: `${resolvedRowHeight}px`,
            }}
          >
            {row.getVisibleCells().map((cell) => {
              const columnId = cell.column.id;
              const editableContext = createEditableContext({ row, column: cell.column });
              const isEditable = resolveEditableCell({
                row,
                column: cell.column,
                readOnly,
                isCellEditable,
              });
              const isEditing =
                editingCell?.rowId === rowId && editingCell.columnId === columnId;
              const commit = (nextValue = draftValue) => {
                onCellValueChange?.({
                  row: row.original,
                  rowId,
                  rowIndex,
                  columnId,
                  previousValue: editableContext.value,
                  value: nextValue,
                });
                onEditCancel();
              };
              const editorContext: GenDataGridEditorContext<TData> = {
                ...editableContext,
                draftValue,
                setDraftValue,
                commit,
                cancel: onEditCancel,
                applyValue: (nextValue) => {
                  setDraftValue(nextValue);
                  commit(nextValue);
                },
              };
              const meta = cell.column.columnDef.meta;
              const editOptions =
                meta?.getEditOptions?.(editableContext) ?? meta?.editOptions;
              const selectOnFocus = meta?.editSelectOnFocus ?? editSelectOnFocus ?? false;
              const content = isEditing
                ? meta?.renderEditor?.(editorContext) ??
                  editorFactory?.({
                    ...editorContext,
                    editType: meta?.editType,
                    editOptions,
                    placeholder: meta?.editPlaceholder,
                    selectOnFocus,
                  }) ?? (
                    <DefaultCellEditor
                      ctx={editorContext}
                      editType={meta?.editType}
                      editOptions={editOptions}
                      placeholder={meta?.editPlaceholder}
                      selectOnFocus={selectOnFocus}
                    />
                  )
                : cell.column.columnDef.cell
                  ? flexRender(cell.column.columnDef.cell, cell.getContext())
                  : formatCellValue(cell.getValue());
              return (
                <DataGridCell
                  key={cell.id}
                  rowId={rowId}
                  columnId={columnId}
                  isActive={Boolean(
                    activeCell &&
                      activeCell.rowId === rowId &&
                      activeCell.columnId === columnId
                  )}
                  isSelected={isCellInRangeSelections({
                    rowId,
                    columnId,
                    rowIds,
                    columnIds,
                    selections: rangeSelections,
                  })}
                  isEditable={isEditable}
                  isEditing={isEditing}
                  onActivate={onActiveCellChange}
                  onEditStart={() => {
                    if (!isEditable) return;
                    onEditStart({ rowId, columnId, value: editableContext.value });
                  }}
                >
                  {content}
                </DataGridCell>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
