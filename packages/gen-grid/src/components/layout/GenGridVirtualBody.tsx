// src/components/layout/GenGridVirtualBody.tsx

import * as React from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { ActiveCell } from '../../features/active-cell/useActiveCellNavigation';
import type { CellCoord } from './types';
import type { RowSpanModel } from './rowSpanModel';

import { useActiveCellNavigation } from '../../features/active-cell/useActiveCellNavigation';
import { useCellEditing } from '../../features/editing/useCellEditing';
import { useGenGridContext } from '../../core/context/GenGridProvider';
import { useRangeSelection } from '../../features/range-selection/useRangeSelection';
import { GenGridCell } from './GenGridCell';
import { getCellStyle } from './cellStyles';
import { getMeta } from './utils';

import { SELECTION_COLUMN_ID } from '../../features/row-selection/rowSelection';
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
  
  tableClassName?: string; // (?좏깮) bodyStyles.table 媛숈? 嫄??꾨떖?댁꽌 cell?먯꽌 focus selector???쒖슜 媛??

  activeCell: ActiveCell;
  onCellClick?: (rowId: string, columnId: string) => void;
  onActiveCellChange: (next: { rowId: string; columnId: string }) => void;
  editOnActiveCell?: boolean;
  keepEditingOnNavigate?: boolean;
  
  /** (?좏깮) ?ㅼ젣 ?곗씠???낅뜲?댄듃???곸쐞?먯꽌 泥섎━ */
  onCellValueChange?: (coord: CellCoord, nextValue: unknown) => void;
  isRowDirty?: (rowId: string) => boolean;
  isCellDirty?: (rowId: string, columnId: string) => boolean;
  getRowClassName?: (args: { row: TData; rowId: string; rowIndex: number }) => string | undefined;
  getRowStyle?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
  }) => React.CSSProperties | undefined;
  getCellClassName?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
    columnId: string;
    value: unknown;
  }) => string | undefined;
  getCellStyle?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
    columnId: string;
    value: unknown;
  }) => React.CSSProperties | undefined;

  footerSpacerHeight?: number;
  rowSpanModel?: RowSpanModel;
  rowSpanningMode?: 'real' | 'visual';
};

function pickRowStyleForCell(style?: React.CSSProperties): React.CSSProperties | undefined {
  if (!style) return undefined;
  return {
    background: style.background,
    backgroundColor: style.backgroundColor,
    color: style.color,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    border: style.border,
    borderTop: style.borderTop,
    borderRight: style.borderRight,
    borderBottom: style.borderBottom,
    borderLeft: style.borderLeft,
  };
}

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
    getRowClassName,
    getRowStyle,
    getCellClassName,
    getCellStyle: getCellStyleByRule,
    footerSpacerHeight = 0,
    rowSpanModel,
    rowSpanningMode = 'real',
  } = props;

  const { editMode, setEditMode, options, selectedRange, setSelectedRange } = useGenGridContext<TData>();
  const rows = table.getRowModel().rows;
  const rowStyleById = React.useMemo(() => {
    const map = new Map<string, React.CSSProperties | undefined>();
    rows.forEach((r) => {
      map.set(r.id, getRowStyle?.({ row: r.original, rowId: r.id, rowIndex: r.index }));
    });
    return map;
  }, [rows, getRowStyle]);
  const rowIndexById = React.useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(r.id, r.index));
    return map;
  }, [rows]);

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

    // ??而ㅻ컠 吏곹썑 ?꾨젅?꾩뿉 measure
    raf1 = requestAnimationFrame(() => {
      rowVirtualizer.measure();

      // ???고듃/?덉씠?꾩썐?????꾨젅????쾶 ?≫엳??耳?댁뒪源뚯? 而ㅻ쾭
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
    isCellNavigable: () => true,
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
      // system column ?쒖쇅
      if (isSystemCol(columnId)) return false;

      // ?섏씠吏蹂??뺤콉
      if (pageMode === 'readonly') return false;

      return true;
    },
    updateValue: onCellValueChange
      ? (coord, v) => onCellValueChange(coord, v)
      : undefined,
  });


  const rangeSelection = useRangeSelection({
    table,
    enabled: Boolean(options.enableRangeSelection),
    selectedRange,
    setSelectedRange,
  });

  const renderGroupedRow = React.useCallback(
    (row: any): React.ReactElement => {
      const rowStyle = getRowStyle?.({ row: row.original, rowId: row.id, rowIndex: row.index });
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
            getRowClassName?.({ row: row.original, rowId: row.id, rowIndex: row.index }) ?? '',
          ].filter(Boolean).join(' ')}
          style={rowStyle}
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
            const inSelectedRange = rangeSelection.isCellInRange(row.id, colId);
            const rangeHandlers = rangeSelection.getRangeHandlers(row.id, colId);
            const cellValue = cell.getValue?.();

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
                  inSelectedRange ? bodyStyles.selectedRange : '',
                  getCellClassName?.({
                    row: row.original,
                    rowId: row.id,
                    rowIndex: row.index,
                    columnId: colId,
                    value: cellValue,
                  }) ?? '',
                ].filter(Boolean).join(' ')}
                style={{
                  ...getCellStyle(cell.column, {
                    enablePinning,
                    enableColumnSizing,
                    isHeader: false,
                  }),
                  ...(pickRowStyleForCell(rowStyle) ?? {}),
                  ...(getCellStyleByRule?.({
                    row: row.original,
                    rowId: row.id,
                    rowIndex: row.index,
                    columnId: colId,
                    value: cellValue,
                  }) ?? {}),
                }}
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
    [
      activeCell,
      enableActiveRowHighlight,
      enableColumnSizing,
      enablePinning,
      nav,
      props.isRowDirty,
      getRowClassName,
      getRowStyle,
      getCellClassName,
      getCellStyleByRule,
      rangeSelection,
    ]
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
        const rowStyle = rowStyleById.get(row.id);
        return (
          <tr 
            key={row.id} 
            className={[
              bodyStyles.tr,
              enableActiveRowHighlight && !!activeCell && activeCell.rowId === row.id
                ? bodyStyles.activeRow
                : '',
              props.isRowDirty?.(row.id) ? bodyStyles.rowDirty : '',
              getRowClassName?.({ row: row.original, rowId: row.id, rowIndex: row.index }) ?? '',
            ].filter(Boolean).join(' ')}
            style={rowStyle}
            data-active-row={
              enableActiveRowHighlight && !!activeCell && activeCell.rowId === row.id
                ? 'true'
                : undefined
            }
          >
            {row.getVisibleCells().map((cell) => {
              const colId = cell.column.id;
              const rowSpanCovered =
                Boolean(rowSpanModel?.enabled) && rowSpanModel!.isCovered(row.id, colId);
              const isVisualMode = rowSpanningMode === 'visual';
              if (rowSpanCovered && !isVisualMode) {
                return null;
              }
              const cellRowSpan =
                !isVisualMode && rowSpanModel?.enabled
                  ? rowSpanModel.getRowSpan(row.id, colId)
                  : undefined;
              let cellRowStyle = rowStyle;
              let hideBottomBorder = false;
              if (isVisualMode && rowSpanModel?.enabled) {
                const span = rowSpanModel.getRowSpan(row.id, colId);
                if (!rowSpanCovered && span > 1) {
                  hideBottomBorder = true;
                } else if (rowSpanCovered) {
                  const anchorRowId = rowSpanModel.getAnchorRowId(row.id, colId);
                  if (anchorRowId) {
                    cellRowStyle = rowStyleById.get(anchorRowId) ?? rowStyle;
                    const anchorIndex = rowIndexById.get(anchorRowId);
                    const anchorSpan = rowSpanModel.getRowSpan(anchorRowId, colId);
                    const isLastCovered =
                      anchorIndex != null && row.index === anchorIndex + anchorSpan - 1;
                    hideBottomBorder = !isLastCovered;
                  }
                }
              }

              const isActive =
                !!activeCell && activeCell.rowId === row.id && activeCell.columnId === colId;

              const isEditing =
                !!editing.editCell &&
                editing.editCell.rowId === row.id &&
                editing.editCell.columnId === colId;
              const inSelectedRange = rangeSelection.isCellInRange(row.id, colId);
              const rangeHandlers = rangeSelection.getRangeHandlers(row.id, colId);

              const navProps = nav.getCellProps(row.id, colId, isActive);
              const editProps = editing.getCellEditProps(row.id, colId);

              // merge handlers
              const mergedProps: React.TdHTMLAttributes<HTMLTableCellElement> = {
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
                    ? (mergeHandlers(
                        rangeHandlers.onMouseDown as any,
                        (editProps as any).onMouseDown
                      ) as any)
                    : (mergeHandlers(
                        rangeHandlers.onMouseDown as any,
                        (navProps as any).onMouseDown,
                        (editProps as any).onMouseDown
                      ) as any),
                onMouseEnter: mergeHandlers(
                  (navProps as any).onMouseEnter,
                  (editProps as any).onMouseEnter,
                  rangeHandlers.onMouseEnter as any
                ) as any,
                onMouseUp: mergeHandlers(
                  (navProps as any).onMouseUp,
                  (editProps as any).onMouseUp,
                  rangeHandlers.onMouseUp as any
                ) as any,
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
                  rowStyle={cellRowStyle}
                  isActive={isActive}
                  isEditing={isEditing}
                  isInSelectedRange={inSelectedRange}
                  enablePinning={enablePinning}
                  enableColumnSizing={enableColumnSizing}
                  getCellClassName={getCellClassName}
                  getCellStyle={getCellStyleByRule}
                  cellProps={mergedProps}
                  isRowSpanCovered={rowSpanCovered && isVisualMode}
                  cellRowSpan={cellRowSpan}
                  hideBottomBorder={hideBottomBorder}
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
