// packages/gen-grid/src/components/layout/GenGridBody.tsx

import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import { useActiveCellNavigation } from '../../features/active-cell/useActiveCellNavigation';
import { useCellEditing } from '../../features/editing/useCellEditing';
import { useGenGridContext } from '../../core/context/GenGridProvider';

import type { ActiveCell } from '../../features/active-cell/useActiveCellNavigation';
import { SELECTION_COLUMN_ID } from '../../features/selection/selection';
import { ROW_NUMBER_COLUMN_ID } from '../../features/row-number/useRowNumberColumn';
import { GenGridCell } from './GenGridCell';
import type { CellCoord } from './types';

import bodyStyles from './GenGridBody.module.css';

function mergeHandlers<T extends (...args: any[]) => void>(...fns: Array<T | undefined>) {
  return (...args: Parameters<T>) => {
    for (const fn of fns) fn?.(...args);
  };
}

type GenGridBodyProps<TData> = {
  table: Table<TData>;
  pageMode?: 'readonly' | 'editable';
  enablePinning?: boolean;
  enableColumnSizing?: boolean;

  tableClassName?: string; // (선택) bodyStyles.table 같은 걸 전달해서 cell에서 focus selector에 활용 가능

  activeCell: ActiveCell;
  onCellClick?: (rowId: string, columnId: string) => void;
  onActiveCellChange: (next: { rowId: string; columnId: string }) => void;
  editOnActiveCell?: boolean;
  keepEditingOnNavigate?: boolean;
  
  /** (선택) 실제 데이터 업데이트는 상위에서 처리 */
  onCellValueChange?: (coord: CellCoord, nextValue: unknown) => void;
  isRowDirty?: (rowId: string) => boolean;
  isCellDirty?: (rowId: string, columnId: string) => boolean;
};

export function GenGridBody<TData>(props: GenGridBodyProps<TData>) {
  const {
    table,
    pageMode,
    enablePinning,
    enableColumnSizing,
    tableClassName,
    activeCell,
    onActiveCellChange,
    editOnActiveCell,
    keepEditingOnNavigate,
    onCellValueChange,
    isCellDirty
  } = props;

  const { editMode, setEditMode } = useGenGridContext<TData>();
  const rows = table.getRowModel().rows;

  const isSystemCol = React.useCallback(
    (colId: string) => colId === SELECTION_COLUMN_ID || colId === ROW_NUMBER_COLUMN_ID,
    []
  );

  const nav = useActiveCellNavigation({
    table,
    activeCell,
    onActiveCellChange,
    isCellNavigable: (_, colId) => !isSystemCol(colId),
  });

  const editing = useCellEditing({
    table,
    activeCell: activeCell ?? null,
    onActiveCellChange,
    editOnActiveCell,
    keepEditingOnNavigate,
    editMode,
    setEditMode,
    isCellEditable: (rowId, columnId) => {
      // system column 제외
      if (isSystemCol(columnId)) return false;

      // 페이지별 정책
      if (pageMode === 'readonly') return false;

      return true;
    },
    updateValue: onCellValueChange
      ? (coord, v) => onCellValueChange(coord, v)
      : undefined,
  });


  return (
    <tbody className={bodyStyles.tbody}>
      {rows.map((row) => (
        <tr 
          key={row.id} 
          className={[
            bodyStyles.tr,
            props.isRowDirty?.(row.id) ? bodyStyles.rowDirty : '',
          ].filter(Boolean).join(' ')}
          >
          {row.getVisibleCells().map((cell) => {
            const colId = cell.column.id;

            const isActive =
              !!activeCell && activeCell.rowId === row.id && activeCell.columnId === colId;

            const isEditing =
              !!editing.editCell &&
              editing.editCell.rowId === row.id &&
              editing.editCell.columnId === colId;

            const navProps = nav.getCellProps(row.id, colId, isActive);
            const editProps = editing.getCellEditProps(row.id, colId);

            // 같은 이벤트 키가 겹칠 수 있어서 merge
            const mergedProps: React.HTMLAttributes<HTMLTableCellElement> = {
              ...(navProps as any),
              ...(editProps as any),
              onMouseDownCapture:
                keepEditingOnNavigate && isEditing
                  ? ((e: React.MouseEvent) => {
                      const target = e.target as HTMLElement | null;
                      if (
                        target &&
                        target.closest('input,select,textarea,button,[contenteditable="true"]')
                      ) {
                        return;
                      }
                      // Allow default focus/blur so the editor can commit its value.
                    })
                  : undefined,
              onKeyDownCapture:
                keepEditingOnNavigate && isEditing
                  ? ((e: React.KeyboardEvent) => {
                      const target = e.target as HTMLElement | null;
                      const isEditorTarget =
                        !!target &&
                        !!target.closest('input,select,textarea,button,[contenteditable="true"]');
                      if (isEditorTarget) return;
                      if (
                        e.key === 'ArrowLeft' ||
                        e.key === 'ArrowRight' ||
                        e.key === 'ArrowUp' ||
                        e.key === 'ArrowDown' ||
                        e.key === 'Home' ||
                        e.key === 'End' ||
                        e.key === 'PageUp' ||
                        e.key === 'PageDown'
                      ) {
                        e.preventDefault();
                        e.stopPropagation();
                        nav.handleKeyDown(e);
                      }
                    })
                  : undefined,
              onMouseDown:
                keepEditingOnNavigate && isEditing
                  ? (editProps as any).onMouseDown
                  : (mergeHandlers(
                      (navProps as any).onMouseDown,
                      (editProps as any).onMouseDown
                    ) as any),
              onFocus: mergeHandlers(
                (navProps as any).onFocus,
                (editProps as any).onFocus
              ) as any,
              onKeyDown: mergeHandlers(
                (navProps as any).onKeyDown,
                (editProps as any).onKeyDown
              ) as any,
              onDoubleClick: mergeHandlers(
                (navProps as any).onDoubleClick,
                (editProps as any).onDoubleClick
              ) as any,
              onClick: mergeHandlers((navProps as any).onClick, (editProps as any).onClick) as any,
            };
            
            const dirty = isCellDirty?.(row.id, colId) ?? false;
            return (
              <GenGridCell
                key={cell.id}
                cell={cell as any}
                rowId={row.id}
                isActive={isActive}
                isEditing={isEditing}
                isDirty={dirty}
                enablePinning={enablePinning}
                enableColumnSizing={enableColumnSizing}
                cellProps={mergedProps}
                onCommitValue={(nextValue) => editing.commitValue({ rowId: row.id, columnId: colId }, nextValue)}
                onCommitEdit={() => editing.commitEditing()}
                onApplyValue={(nextValue) => editing.applyValue({ rowId: row.id, columnId: colId }, nextValue)}
                onCancelEdit={editing.cancelEditing}
                onTab={(dir) => editing.moveEditByTab(dir)}
              />
            );
          })}
        </tr>
      ))}
    </tbody>
  );
}
