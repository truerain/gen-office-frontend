// src/components/layout/GenGridVirtualBody.tsx

import * as React from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ActiveCell } from '../../features/active-cell/useActiveCellNavigation';
import type { CellCoord } from './types';

import { useActiveCellNavigation } from '../../features/active-cell/useActiveCellNavigation';
import { useCellEditing } from '../../features/editing/useCellEditing';
import { useGenGridContext } from '../../core/context/GenGridProvider';
import { GenGridCell } from './GenGridCell';
import { getCellStyle } from './cellStyles';
import { getMeta } from './utils';

import { SELECTION_COLUMN_ID } from '../../features/selection/selection';
import { ROW_NUMBER_COLUMN_ID } from '../../features/row-number/useRowNumberColumn';

import bodyStyles from './GenGridBody.module.css';
import pinningStyles from './GenGridPinning.module.css';


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
  enableActiveRowHighlight?: boolean;

  scrollRef: React.RefObject<HTMLDivElement | null>;
  rowHeight: number;
  overscan: number;
  
  tableClassName?: string; // (? íƒ) bodyStyles.table ê°™ì? ê±??„ë‹¬?´ì„œ cell?ì„œ focus selector???œìš© ê°€??

  activeCell: ActiveCell;
  onCellClick?: (rowId: string, columnId: string) => void;
  onActiveCellChange: (next: { rowId: string; columnId: string }) => void;
  editOnActiveCell?: boolean;
  keepEditingOnNavigate?: boolean;
  
  /** (? íƒ) ?¤ì œ ?°ì´???…ë°?´íŠ¸???ìœ„?ì„œ ì²˜ë¦¬ */
  onCellValueChange?: (coord: CellCoord, nextValue: unknown) => void;
  isRowDirty?: (rowId: string) => boolean;
  isCellDirty?: (rowId: string, columnId: string) => boolean;

  footerSpacerHeight?: number;
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
    enableActiveRowHighlight = false,
    tableClassName,
    activeCell,
    onActiveCellChange,
    editOnActiveCell,
    keepEditingOnNavigate,
    onCellValueChange,
    footerSpacerHeight = 0,
  } = props;

  const { editMode, setEditMode } = useGenGridContext<TData>();
  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan,
    useFlushSync: false
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
  const bottomSpacerHeight = paddingBottom + footerSpacerHeight;

  const colSpan = table.getVisibleLeafColumns().length;

  React.useLayoutEffect(() => {
    let raf1 = 0;
    let raf2 = 0;

    // ??ì»¤ë°‹ ì§í›„ ?„ë ˆ?„ì— measure
    raf1 = requestAnimationFrame(() => {
      rowVirtualizer.measure();

      // ???°íŠ¸/?ˆì´?„ì›ƒ?????„ë ˆ????²Œ ?¡ížˆ??ì¼€?´ìŠ¤ê¹Œì? ì»¤ë²„
      raf2 = requestAnimationFrame(() => rowVirtualizer.measure());
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
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
    editOnActiveCell,
    keepEditingOnNavigate,
    editMode,
    setEditMode,
    isCellEditable: (rowId, columnId) => {
      // system column ?œì™¸
      if (isSystemCol(columnId)) return false;

      // ?˜ì´ì§€ë³??•ì±…
      if (pageMode === 'readonly') return false;

      return true;
    },
    updateValue: onCellValueChange
      ? (coord, v) => onCellValueChange(coord, v)
      : undefined,
  });

  const renderGroupedRow = React.useCallback(
    (row: any): React.ReactElement => {
      const onRowMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          target.closest('button,input,select,textarea,[contenteditable="true"]')
        ) {
          return;
        }
        e.preventDefault();
        nav.setActiveRow(row.id, { focus: true });
      };

      return (
        <tr
          key={row.id}
          className={[
            bodyStyles.tr,
            bodyStyles.groupRow,
            enableActiveRowHighlight && !!activeCell && activeCell.rowId === row.id
              ? bodyStyles.activeRow
              : '',
            props.isRowDirty?.(row.id) ? bodyStyles.rowDirty : '',
          ].filter(Boolean).join(' ')}
          data-active-row={
            enableActiveRowHighlight && !!activeCell && activeCell.rowId === row.id
              ? 'true'
              : undefined
          }
          onMouseDown={onRowMouseDown}
        >
          {row.getVisibleCells().map((cell: any) => {
            const colId = cell.column.id;
            const pinned = cell.column.getIsPinned();
            const meta = getMeta(cell.column.columnDef) as any;
            const alignClass =
              meta?.align === 'right'
                ? bodyStyles.alignRight
                : meta?.align === 'center'
                  ? bodyStyles.alignCenter
                  : bodyStyles.alignLeft;

            const isActive =
              !!activeCell && activeCell.rowId === row.id && activeCell.columnId === colId;

            let content: React.ReactNode = null;
            if (cell.getIsGrouped()) {
              const toggle = row.getToggleExpandedHandler?.();
              content = (
                <button
                  type="button"
                  className={bodyStyles.groupToggle}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle?.(e);
                  }}
                >
                  <span className={bodyStyles.groupChevron}>
                    {row.getIsExpanded?.() ? (
  <svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true">
    <path d="M5 7l5 6 5-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
) : (
  <svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true">
    <path d="M7 5l6 5-6 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
)}
                  </span>
                  <span className={bodyStyles.groupLabel}>
                    {String(cell.getValue?.() ?? '')}
                  </span>
                  <span className={bodyStyles.groupCount}>
                    ({row.subRows?.length ?? 0})
                  </span>
                </button>
              );
            } else if (cell.getIsAggregated()) {
              content = cell.column.columnDef.aggregatedCell ? flexRender(cell.column.columnDef.aggregatedCell, cell.getContext()) : String(cell.getValue?.() ?? '');
            } else if (cell.getIsPlaceholder()) {
              content = null;
            } else {
              content = flexRender(cell.column.columnDef.cell, cell.getContext());
            }

            return (
              <td
                key={cell.id}
                className={[
                  bodyStyles.td,
                  alignClass,
                  meta?.mono ? bodyStyles.mono : '',
                  pinned ? pinningStyles.pinned : '',
                  pinned === 'left' ? pinningStyles.pinnedLeft : '',
                  pinned === 'right' ? pinningStyles.pinnedRight : '',
                ].filter(Boolean).join(' ')}
                style={getCellStyle(cell.column, {
                  enablePinning,
                  enableColumnSizing,
                  isHeader: false,
                })}
                data-row-id={row.id}
                data-col-id={colId}
                data-rowid={row.id}
                data-colid={colId}
                data-active-cell={isActive ? 'true' : undefined}
                data-pinned={pinned ? 'true' : undefined}
                tabIndex={isActive ? 0 : -1}
              >
                {content}
              </td>
            );
          })}
        </tr>
      );
    },
    [activeCell, enableActiveRowHighlight, enableColumnSizing, enablePinning, nav, props.isRowDirty]
  );
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
        const isGroupRow = !!row.getCanExpand?.();
        if (isGroupRow) return renderGroupedRow(row);
        return (
          <tr 
            key={row.id} 
            className={[
              bodyStyles.tr,
              enableActiveRowHighlight && !!activeCell && activeCell.rowId === row.id
                ? bodyStyles.activeRow
                : '',
              props.isRowDirty?.(row.id) ? bodyStyles.rowDirty : '',
            ].filter(Boolean).join(' ')}
            data-active-row={
              enableActiveRowHighlight && !!activeCell && activeCell.rowId === row.id
                ? 'true'
                : undefined
            }
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

              // merge handlers
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
                  onCommitEdit={() => editing.commitEditing()}
                  onApplyValue={(nextValue) => editing.applyValue({ rowId: row.id, columnId: colId }, nextValue)}
                  onCancelEdit={editing.cancelEditing}
                  onTab={(dir) => editing.moveEditByTab(dir)}
                />
              );
            })}
          </tr>
        );
      })}
{/* bottom spacer */}
      {bottomSpacerHeight > 0 ? (
        <tr>
          <td colSpan={colSpan} style={{ height: bottomSpacerHeight, padding: 0, border: 0 }} />
        </tr>
      ) : null}
    </tbody>
  );
}
