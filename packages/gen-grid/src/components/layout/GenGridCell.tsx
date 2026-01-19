// packages/gen-grid/src/components/layout/GenGridCell.tsx

import * as React from 'react';
import { flexRender, type Cell } from '@tanstack/react-table';

import bodyStyles from './GenGridBody.module.css';
import pinningStyles from './GenGridPinning.module.css';

import { getCellStyle } from './cellStyles';
import { getMeta } from './utils';
import { SELECTION_COLUMN_ID } from '../../features/selection/selection';
import { ROW_NUMBER_COLUMN_ID } from '../../features/row-number/useRowNumberColumn';

export type GenGridCellProps<TData> = {
  cell: Cell<TData, unknown>;
  rowId: string;

  isActive: boolean;
  isEditing: boolean;

  /** ✅ Step11: dirty 표시 */
  isDirty?: boolean;

  enablePinning?: boolean;
  enableColumnSizing?: boolean;

  cellProps: React.HTMLAttributes<HTMLTableCellElement>;

  onCommitValue: (nextValue: unknown) => void;
  onCancelEdit: () => void;

  /** ✅ Tab / Shift+Tab 편집 이동 */
  onTab?: (dir: 1 | -1) => void;
};

export function GenGridCell<TData>(props: GenGridCellProps<TData>) {
  const {
    cell,
    rowId,
    isActive,
    isEditing,
    isDirty,
    enablePinning,
    enableColumnSizing,
    cellProps,
    onCommitValue,
    onCancelEdit,
    onTab,
  } = props;

  const colId = cell.column.id;
  const pinned = cell.column.getIsPinned();
  const meta = getMeta(cell.column.columnDef) as any;

  const isSystemCol = colId === SELECTION_COLUMN_ID || colId === ROW_NUMBER_COLUMN_ID;

  const alignClass =
    meta?.align === 'right'
      ? bodyStyles.alignRight
      : meta?.align === 'center'
        ? bodyStyles.alignCenter
        : bodyStyles.alignLeft;

  const [draft, setDraft] = React.useState<unknown>(cell.getValue());

  React.useEffect(() => {
    if (isEditing) setDraft(cell.getValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, rowId, colId]);

  const commit = React.useCallback(() => {
    onCommitValue(draft);
  }, [draft, onCommitValue]);

  const cancel = React.useCallback(() => {
    onCancelEdit();
  }, [onCancelEdit]);

  const renderDefaultEditor = () => (
    <input
      autoFocus
      value={(draft ?? '') as any}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => commit()}
      onKeyDown={(e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          e.stopPropagation();
          commit();
          onTab?.(e.shiftKey ? -1 : 1);
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          commit();
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          cancel();
          return;
        }
      }}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        font: 'inherit',
        color: 'inherit',
      }}
    />
  );

  const editor =
    meta?.renderEditor?.({
      value: draft,
      onChange: setDraft,
      onCommit: commit,
      onCancel: cancel,
      onTab,
    }) ?? renderDefaultEditor();

  return (
    <td
      className={[
        bodyStyles.td,
        alignClass,
        isSystemCol ? bodyStyles.selectCol : '',
        meta?.mono ? bodyStyles.mono : '',
        pinned ? pinningStyles.pinned : '',
        pinned === 'left' ? pinningStyles.pinnedLeft : '',
        pinned === 'right' ? pinningStyles.pinnedRight : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={getCellStyle(cell.column, {
        enablePinning,
        enableColumnSizing,
        isHeader: false,
      })}
      data-rowid={rowId}
      data-colid={colId}
      data-active-cell={isActive ? 'true' : undefined}
      data-editing-cell={isEditing ? 'true' : undefined}
      data-dirty={isDirty ? 'true' : undefined}
      {...cellProps}
    >

      {isEditing 
        ? (<div 
            onMouseDownCapture={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            style={{ width: '100%', height: '100%' }}
          >
            {editor}
          </div>) 
        : flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
}
