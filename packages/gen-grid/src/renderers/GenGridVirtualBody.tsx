// src/renderers/GenGridVirtualBody.tsx

import * as React from 'react';
import { type Table } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ActiveCell } from '../features/active-cell/useActiveCellNavigation';
import type { CellCoord } from './types';

import { useActiveCellNavigation } from '../features/active-cell/useActiveCellNavigation';
import { useCellEditing } from '../features/editing/useCellEditing';
import { GenGridCell } from './GenGridCell';

import { SELECTION_COLUMN_ID } from '../features/selection/selection';
import { ROW_NUMBER_COLUMN_ID } from '../features/row-number/useRowNumberColumn';

import bodyStyles from './GenGridBody.module.css';


function mergeHandlers<T extends (...args: any[]) => void>(...fns: Array<T | undefined>) {
  return (...args: Parameters<T>) => {
    for (const fn of fns) fn?.(...args);
  };
}

type GenGridVirtualBodyProps<TData> = {
  table: Table<TData>;
  pageMode?: 'readonly' | 'editable';
  enablePinning?: boolean;
  enableColumnSizing?: boolean;

  scrollRef: React.RefObject<HTMLDivElement | null>;
  rowHeight: number;
  overscan: number;
  
 tableClassName?: string; // (선택) bodyStyles.table 같은 걸 전달해서 cell에서 focus selector에 활용 가능

  activeCell: ActiveCell;
  onCellClick?: (rowId: string, columnId: string) => void;
  onActiveCellChange: (next: { rowId: string; columnId: string }) => void;
  
  /** (선택) 실제 데이터 업데이트는 상위에서 처리 */
  onCellValueChange?: (coord: CellCoord, nextValue: unknown) => void;
  isCellDirty?: (rowId: string, columnId: string) => boolean;

};

export function GenGridVirtualBody<TData>(props: GenGridVirtualBodyProps<TData>) {
  const {
    table,
    pageMode,
    scrollRef,
    rowHeight,
    overscan,
    enablePinning,
    enableColumnSizing,
    tableClassName,
    activeCell,
    onActiveCellChange,
    onCellValueChange,
  } = props;

  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan
  });

  const isSystemCol = React.useCallback(
    (colId: string) => colId === SELECTION_COLUMN_ID || colId === ROW_NUMBER_COLUMN_ID,
    []
  );
  
  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualItems.length ? virtualItems[0]!.start : 0;
  const paddingBottom = virtualItems.length
    ? totalSize - virtualItems[virtualItems.length - 1]!.end
    : 0;

  const colSpan = table.getVisibleLeafColumns().length;

  React.useLayoutEffect(() => {
    // scrollRef가 잡힌 뒤 한 번 측정
    rowVirtualizer.measure();
    // 레이아웃이 한 프레임 늦게 잡히는 경우까지 커버
    requestAnimationFrame(() => rowVirtualizer.measure());
  }, [rowVirtualizer, rows.length, rowHeight]);


  const nav = useActiveCellNavigation({
    table,
    activeCell,
    onActiveCellChange: onActiveCellChange,
    isCellNavigable: (_, colId) => !isSystemCol(colId),
    focusOptions: { 
        stickyHeaderHeight: 40 * table.getHeaderGroups().length },
  });

  const editing = useCellEditing({
    table,
    activeCell: activeCell ?? null,
    onActiveCellChange,
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
      {/* top spacer */}
      {paddingTop > 0 ? (
        <tr>
          <td colSpan={colSpan} style={{ height: paddingTop, padding: 0, border: 0 }} />
        </tr>
      ) : null}

      {/* visible rows */}
      {virtualItems.map((v) => {
        const row = rows[v.index]!;
        return (
          <tr key={row.id} className={bodyStyles.tr}>
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

            return (
              <GenGridCell
                key={cell.id}
                cell={cell as any}
                rowId={row.id}
                isActive={isActive}
                isEditing={isEditing}
                enablePinning={enablePinning}
                enableColumnSizing={enableColumnSizing}
                cellProps={mergedProps}
                onCommitValue={(nextValue) => editing.commitValue({ rowId: row.id, columnId: colId }, nextValue)}
                onCancelEdit={editing.cancelEditing}
                onTab={(dir) => editing.moveEditByTab(dir)}
              />
            );
          })}
          </tr>
        );
      })}

      {/* bottom spacer */}
      {paddingBottom > 0 ? (
        <tr>
          <td colSpan={colSpan} style={{ height: paddingBottom, padding: 0, border: 0 }} />
        </tr>
      ) : null}
    </tbody>
  );
}
