// packages/datagrid/src/gen-grid/renderers/GenGridCell.tsx
import * as React from 'react';
import { flexRender, type Cell } from '@tanstack/react-table';

import { getCellStyle } from './cellStyles';
import { getMeta } from './utils';
import { SELECTION_COLUMN_ID } from '../features/selection';
import { ROW_NUMBER_COLUMN_ID } from '../features/useRowNumberColumn';

import bodyStyles from './GenGridBody.module.css';
import pinningStyles from './GenGridPinning.module.css';


type GenGridCellProps<TData> = {
  cell: Cell<TData, unknown>;
  rowId: string;

  isActive: boolean;
  isEditing: boolean;

  enablePinning?: boolean;
  enableColumnSizing?: boolean;
  
  onTab?: (dir: 1 | -1) => void;

  tableClassName?: string;
  cellProps?: React.TdHTMLAttributes<HTMLTableCellElement>;
  
  onCommitValue: (nextValue: unknown) => void;
  onCancelEdit: () => void;
};

export function GenGridCell<TData>(props: GenGridCellProps<TData>) {
  const {
    cell,
    rowId,
    isActive,
    isEditing,
    enablePinning,
    enableColumnSizing,
    onTab,
    tableClassName,
    cellProps,
    onCommitValue,
    onCancelEdit,
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

  // 편집용 draft (v1: 셀 단위 local state)
  const initialValue = cell.getValue() as unknown;
  const [draft, setDraft] = React.useState<unknown>(initialValue);

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

  // 기본 editor (meta.renderEditor 없을 때)
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
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          cancel();
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
    }) ?? renderDefaultEditor();
  
  return (
    <td
      key={cell.id}
      className={[
        bodyStyles.td,
        alignClass,
        isSystemCol ? bodyStyles.systemCol : '',
        meta?.mono ? bodyStyles.mono : '',
        pinned ? bodyStyles.pinned : '',
        pinned === 'left' ? bodyStyles.pinnedLeft : '',
        pinned === 'right' ? bodyStyles.pinnedRight : '',
        isActive ? bodyStyles.activeCell : '', // 있으면 사용, 없으면 제거해도 됨
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
      {...cellProps}
     >
      {isEditing ? editor : flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
}
