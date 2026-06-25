// packages/gen-datagrid/src/renderers/div-grid/DataGridRoot.tsx
// Composes the baseline div-based DataGrid root, header, and body.

import * as React from 'react';
import type { Row } from '@tanstack/react-table';

import type {
  GenDataGridCellValueChange,
  GenDataGridDirtyCell,
  GenDataGridEditEntryReason,
  GenDataGridHandle,
  GenDataGridProps,
} from '../../GenDataGrid.types';
import {
  findCellInRoot,
  focusCellInRoot,
  scrollCellIntoViewInRoot,
} from '../../core/dom/cellDom';
import { isEventOwnedByRoot, isFocusOwnedByRoot } from '../../core/dom/gridBoundary';
import { useDataGridTable } from '../../core/table/useDataGridTable';
import {
  getFirstActiveCell,
  isActiveCellNavigationKey,
  resolveNextActiveCell,
  resolveNextLinearCell,
} from '../../features/active-cell/navigation';
import { resolveEditableCell } from '../../features/editing/editableCell';
import {
  resolveEditPolicy,
  type ResolvedGenDataGridEditPolicy,
} from '../../features/editing/editPolicy';
import { useCellEditing } from '../../features/editing/useCellEditing';
import {
  normalizeExpandedRows,
  setExpandedRow,
} from '../../features/master-detail/masterDetailState';
import {
  collectDescendantRowIds,
  normalizeTreeExpandedRows,
  setTreeExpandedRow,
} from '../../features/tree/treeState';
import { parseClipboardGrid } from '../../features/range-selection/clipboard';
import { applyClipboardPaste } from '../../features/range-selection/paste';
import { useClipboardActions } from '../../features/range-selection/useClipboardActions';
import { useRangeSelection } from '../../features/range-selection/useRangeSelection';
import { DataGridBody } from './DataGridBody';
import { DataGridFooterBar } from './DataGridFooterBar';
import { DataGridFooterRow } from './DataGridFooterRow';
import { DataGridHeader } from './DataGridHeader';
import {
  DataGridVirtualBody,
  type DataGridVirtualBodyHandle,
} from './DataGridVirtualBody';
import { buildGridTemplateColumnsFromModel } from './gridTemplate';

function isPrintableEditKey(event: React.KeyboardEvent<HTMLDivElement>) {
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  if (event.key.length !== 1) return false;
  if (event.key === ' ') return true;
  return event.key.trim().length === 1;
}

function focusActiveEditorInRoot(
  root: HTMLElement | null,
  coord: { rowId: string; columnId: string }
) {
  const cell = findCellInRoot(root, coord);
  if (!cell) return false;

  const editor = cell.querySelector<HTMLElement>(
    'input,select,textarea,button,[contenteditable="true"]'
  );
  if (!editor) return false;

  scrollCellIntoViewInRoot(root, coord);
  editor.focus({ preventScroll: true });
  return true;
}

function isInteractiveElement(element: Element | null) {
  return Boolean(element?.closest('input,select,textarea,button,[contenteditable="true"]'));
}

type DataGridRootProps<TData> = GenDataGridProps<TData> & {
  rootRef: React.ForwardedRef<GenDataGridHandle>;
};

export function DataGridRoot<TData>(props: DataGridRootProps<TData>) {
  const {
    rootRef: forwardedRootRef,
    data,
    defaultData,
    columns,
    getRowId,
    gridId,
    getGridId,
    readOnly,
    readonly,
    editSelectOnFocus,
    editCommitOnBlur,
    editPolicy,
    editorFactory,
    isCellEditable,
    onCellValueChange,
    activeCell: controlledActiveCell,
    defaultActiveCell,
    onActiveCellChange,
    enableRangeSelection = true,
    selectedRanges,
    defaultSelectedRanges,
    onSelectedRangesChange,
    enableClipboard = true,
    pasteOptions,
    enablePinning = true,
    enableColumnSizing = true,
    enableColumnReorder = true,
    enableColumnFilters = false,
    columnFitMode = 'none',
    enableGlobalFilter = false,
    enableFooterRow = false,
    enableStickyFooterRow = false,
    enableFooter = false,
    enablePagination = false,
    enableDirtyState = true,
    enableVirtualization = false,
    enableTreeRows = false,
    getSubRows,
    treeExpandedRows,
    defaultTreeExpandedRows,
    onTreeExpandedRowsChange,
    getRowCanExpandTree,
    treeIndentWidth = 16,
    enableMasterDetail = false,
    expandedRows,
    defaultExpandedRows,
    onExpandedRowsChange,
    getRowCanExpand,
    renderDetailPanel,
    detailPanelHeight = 160,
    scrollSeeking,
    clipboardOptions,
    footer,
    renderFooter,
    onDirtyStateChange,
    onRowsDelete,
    deleteRowsBehavior = 'mark',
    dataVersion,
    pageSizeOptions,
    className,
    style,
    rowHeight = 36,
    getRowHeight,
    headerHeight = 40,
    footerRowHeight = 36,
  } = props;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [viewportElement, setViewportElement] = React.useState<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = React.useState<number | undefined>(undefined);
  const virtualBodyRef = React.useRef<DataGridVirtualBodyHandle | null>(null);
  const reactId = React.useId();
  const resolvedGridId = React.useMemo(
    () => gridId ?? getGridId?.() ?? `gen-datagrid-${reactId.replace(/:/g, '')}`,
    [getGridId, gridId, reactId]
  );
  const [uncontrolledRows, setUncontrolledRows] = React.useState<TData[]>(
    () => defaultData ?? []
  );
  const treeRowsEnabled = enableTreeRows && Boolean(getSubRows);
  const [uncontrolledTreeExpandedRows, setUncontrolledTreeExpandedRows] = React.useState(() =>
    normalizeTreeExpandedRows(defaultTreeExpandedRows)
  );
  const resolvedTreeExpandedRows = React.useMemo(
    () => normalizeTreeExpandedRows(treeExpandedRows ?? uncontrolledTreeExpandedRows),
    [treeExpandedRows, uncontrolledTreeExpandedRows]
  );
  const setTreeExpandedRowsState = React.useCallback(
    (next: Record<string, boolean>) => {
      const normalized = normalizeTreeExpandedRows(next);
      if (treeExpandedRows === undefined) {
        setUncontrolledTreeExpandedRows(normalized);
      }
      onTreeExpandedRowsChange?.(normalized);
    },
    [onTreeExpandedRowsChange, treeExpandedRows]
  );
  const table = useDataGridTable({
    ...props,
    defaultData: data === undefined ? uncontrolledRows : defaultData,
    enableTreeRows: treeRowsEnabled,
    getSubRows,
    treeExpandedRows: resolvedTreeExpandedRows,
    onTreeExpandedRowsChange: setTreeExpandedRowsState,
  });
  const tableRows = table.getRowModel().rows;
  const visibleColumns = (
    enablePinning
      ? [
          ...table.getLeftLeafColumns(),
          ...table.getCenterLeafColumns(),
          ...table.getRightLeafColumns(),
        ]
      : table.getVisibleLeafColumns()
  ).filter((column) => column.getIsVisible());
  const headerGroups = table.getHeaderGroups();
  const footerGroups = table.getFooterGroups();
  const filteredRows = table.getFilteredRowModel().rows;
  const rowIds = React.useMemo(() => tableRows.map((row) => row.id), [tableRows]);
  const columnIds = React.useMemo(
    () => visibleColumns.map((column) => column.id),
    [visibleColumns]
  );
  const gridTemplateColumns = buildGridTemplateColumnsFromModel(visibleColumns, columnFitMode, viewportWidth);
  const resolvedReadOnly = readOnly ?? readonly ?? false;

  React.useEffect(() => {
    if (columnFitMode !== 'grow' || !viewportElement) {
      setViewportWidth(undefined);
      return;
    }

    const reportViewportWidth = () => {
      setViewportWidth(viewportElement.clientWidth || undefined);
    };

    reportViewportWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', reportViewportWidth);
      return () => window.removeEventListener('resize', reportViewportWidth);
    }

    const resizeObserver = new ResizeObserver(reportViewportWidth);
    resizeObserver.observe(viewportElement);

    return () => resizeObserver.disconnect();
  }, [columnFitMode, viewportElement]);
  const rangeSelection = useRangeSelection({
    rootRef,
    enabled: enableRangeSelection,
    selectedRanges,
    defaultSelectedRanges,
    onSelectedRangesChange,
    rowIds,
    columnIds,
    viewportElement,
    rowHeight,
    headerHeight,
  });
  const clipboard = useClipboardActions({
    table,
    selection: rangeSelection.selection,
    enabled: enableClipboard,
    includeHeader: clipboardOptions?.includeHeader,
  });
  const [uncontrolledActiveCell, setUncontrolledActiveCell] = React.useState(
    () => defaultActiveCell ?? getFirstActiveCell(rowIds, columnIds)
  );
  const activeCell =
    controlledActiveCell !== undefined ? controlledActiveCell : uncontrolledActiveCell;
  const previousFocusRestoreActiveCellRef = React.useRef<typeof activeCell>(null);
  const editing = useCellEditing();
  const [dirtyCells, setDirtyCells] = React.useState<Map<string, GenDataGridDirtyCell>>(
    () => new Map()
  );
  const [deletedRowIdList, setDeletedRowIdList] = React.useState<string[]>(() => []);
  const [uncontrolledExpandedRows, setUncontrolledExpandedRows] = React.useState(() =>
    normalizeExpandedRows(defaultExpandedRows)
  );
  const resolvedExpandedRows = React.useMemo(
    () => normalizeExpandedRows(expandedRows ?? uncontrolledExpandedRows),
    [expandedRows, uncontrolledExpandedRows]
  );
  const masterDetailEnabled = enableMasterDetail && Boolean(renderDetailPanel) && !treeRowsEnabled;
  const setExpandedRowState = React.useCallback(
    (rowId: string, expanded: boolean) => {
      const next = setExpandedRow(resolvedExpandedRows, rowId, expanded);
      if (expandedRows === undefined) {
        setUncontrolledExpandedRows(next);
      }
      onExpandedRowsChange?.(next);
    },
    [expandedRows, onExpandedRowsChange, resolvedExpandedRows]
  );

  const createDirtyState = React.useCallback(
    (cells: Map<string, GenDataGridDirtyCell>, deletedRowIds: string[]) => ({
      cells: Array.from(cells.values()),
      rowIds: Array.from(
        new Set([...Array.from(cells.values()).map((cell) => cell.rowId), ...deletedRowIds])
      ),
      deletedRowIds,
    }),
    []
  );

  const dirtyState = React.useMemo(
    () => createDirtyState(dirtyCells, deletedRowIdList),
    [createDirtyState, deletedRowIdList, dirtyCells]
  );
  const dirtyCellIds = React.useMemo(() => new Set(dirtyCells.keys()), [dirtyCells]);
  const dirtyRowIds = React.useMemo(() => new Set(dirtyState.rowIds), [dirtyState.rowIds]);
  const deletedRowIds = React.useMemo(
    () => new Set(deletedRowIdList),
    [deletedRowIdList]
  );
  const lastDataVersion = React.useRef(dataVersion);

  const updateDirtyCells = React.useCallback(
    (
      updater: (current: Map<string, GenDataGridDirtyCell>) => Map<string, GenDataGridDirtyCell>
    ) => {
      setDirtyCells((current) => {
        const next = updater(current);
        const nextDeletedRowIds = deletedRowIdList;
        onDirtyStateChange?.(createDirtyState(next, nextDeletedRowIds));
        return next;
      });
    },
    [createDirtyState, deletedRowIdList, onDirtyStateChange]
  );

  const handleCellValueChange = React.useCallback(
    (args: GenDataGridCellValueChange<TData>) => {
      if (enableDirtyState && !Object.is(args.previousValue, args.value)) {
        updateDirtyCells((current) => {
          const next = new Map(current);
          const key = `${args.rowId}::${args.columnId}`;
          const existing = next.get(key);
          next.set(key, {
            rowId: args.rowId,
            columnId: args.columnId,
            previousValue: existing?.previousValue ?? args.previousValue,
            value: args.value,
          });
          return next;
        });
      }
      onCellValueChange?.(args);
    },
    [enableDirtyState, onCellValueChange, updateDirtyCells]
  );

  const resetDirtyState = React.useCallback(
    (rowIds?: readonly string[]) => {
      const rowIdSet = rowIds ? new Set(rowIds) : null;
      const nextDeletedRowIds = rowIdSet
        ? deletedRowIdList.filter((rowId) => !rowIdSet.has(rowId))
        : [];
      const nextDirtyCells = rowIdSet
        ? new Map(
            Array.from(dirtyCells.entries()).filter(([, cell]) => !rowIdSet.has(cell.rowId))
          )
        : new Map<string, GenDataGridDirtyCell>();

      setDeletedRowIdList(nextDeletedRowIds);
      setDirtyCells(nextDirtyCells);
      onDirtyStateChange?.(createDirtyState(nextDirtyCells, nextDeletedRowIds));
    },
    [createDirtyState, deletedRowIdList, dirtyCells, onDirtyStateChange]
  );

  const commitDirtyState = React.useCallback(
    (rowIds?: readonly string[]) => {
      resetDirtyState(rowIds);
    },
    [resetDirtyState]
  );

  React.useEffect(() => {
    if (Object.is(lastDataVersion.current, dataVersion)) return;
    lastDataVersion.current = dataVersion;
    setDeletedRowIdList([]);
    setDirtyCells(new Map());
    onDirtyStateChange?.(createDirtyState(new Map(), []));
  }, [createDirtyState, dataVersion, onDirtyStateChange]);

  const deleteRows = React.useCallback(
    (rowIdsToDelete: readonly string[]) => {
      const uniqueRowIds = Array.from(new Set(rowIdsToDelete));
      if (uniqueRowIds.length === 0) return;
      if (data === undefined && deleteRowsBehavior === 'removeUncontrolled') {
        const rowIdSet = new Set(uniqueRowIds);
        setUncontrolledRows((current) =>
          current.filter((row, index) => !rowIdSet.has(getRowId(row, index)))
        );
      }
      setDeletedRowIdList((current) => {
        const next = Array.from(new Set([...current, ...uniqueRowIds]));
        onDirtyStateChange?.(createDirtyState(dirtyCells, next));
        return next;
      });
      onRowsDelete?.(uniqueRowIds);
    },
    [
      createDirtyState,
      data,
      deleteRowsBehavior,
      dirtyCells,
      getRowId,
      onDirtyStateChange,
      onRowsDelete,
    ]
  );

  const clearColumnFilters = React.useCallback(() => {
    table.setColumnFilters([]);
  }, [table]);

  const clearGlobalFilter = React.useCallback(() => {
    table.setGlobalFilter(undefined);
  }, [table]);

  const clearFilters = React.useCallback(() => {
    table.setColumnFilters([]);
    table.setGlobalFilter(undefined);
  }, [table]);

  const scrollToCell = React.useCallback(
    (coord: { rowId: string; columnId: string }) => {
      const rowIndex = rowIds.indexOf(coord.rowId);
      if (enableVirtualization && rowIndex >= 0) {
        virtualBodyRef.current?.scrollToRowIndex(rowIndex);
      }

      const scrollVisibleCell = () => {
        if (scrollCellIntoViewInRoot(rootRef.current, coord)) {
          return;
        }
        requestAnimationFrame(() => {
          scrollCellIntoViewInRoot(rootRef.current, coord);
        });
      };

      if (enableVirtualization && rowIndex >= 0) {
        requestAnimationFrame(scrollVisibleCell);
        return;
      }

      scrollVisibleCell();
    },
    [enableVirtualization, rowIds]
  );

  React.useImperativeHandle(
    forwardedRootRef,
    () => ({
      get rootElement() {
        return rootRef.current;
      },
      clearSelection: rangeSelection.clearSelection,
      copySelection: clipboard.copySelection,
      scrollToCell,
      clearColumnFilters,
      clearGlobalFilter,
      clearFilters,
      resetDirtyState,
      commitDirtyState,
      deleteRows,
      getDirtyState: () => dirtyState,
    }),
    [
      clearColumnFilters,
      clearFilters,
      clearGlobalFilter,
      clipboard.copySelection,
      commitDirtyState,
      dirtyState,
      deleteRows,
      forwardedRootRef,
      rangeSelection.clearSelection,
      resetDirtyState,
      scrollToCell,
    ]
  );

  const setActiveCell = React.useCallback(
    (next: Exclude<typeof activeCell, null>) => {
      if (controlledActiveCell === undefined) {
        setUncontrolledActiveCell(next);
      }
      onActiveCellChange?.(next);
    },
    [controlledActiveCell, onActiveCellChange]
  );

  const setTreeExpandedRowState = React.useCallback(
    (row: Row<TData>, expanded: boolean) => {
      const next = setTreeExpandedRow(resolvedTreeExpandedRows, row.id, expanded);
      setTreeExpandedRowsState(next);

      if (expanded) return;

      const descendantRowIds = new Set(collectDescendantRowIds(row));
      if (descendantRowIds.size === 0) return;

      const fallbackColumnId =
        activeCell?.columnId && columnIds.includes(activeCell.columnId)
          ? activeCell.columnId
          : columnIds[0];
      const fallbackCell = fallbackColumnId ? { rowId: row.id, columnId: fallbackColumnId } : null;

      if (activeCell && descendantRowIds.has(activeCell.rowId) && fallbackCell) {
        setActiveCell(fallbackCell);
      }

      if (editing.editingCell && descendantRowIds.has(editing.editingCell.rowId)) {
        editing.cancelEditing();
      }

      if (enableRangeSelection && fallbackCell) {
        const selectionTouchesDescendant = rangeSelection.selections.some((selection) =>
          descendantRowIds.has(selection.anchor.rowId) || descendantRowIds.has(selection.focus.rowId)
        );
        if (selectionTouchesDescendant) {
          rangeSelection.setSingleSelection(fallbackCell);
        }
      }
    },
    [
      activeCell,
      columnIds,
      editing,
      enableRangeSelection,
      rangeSelection,
      resolvedTreeExpandedRows,
      setActiveCell,
      setTreeExpandedRowsState,
    ]
  );

  const navigateWhileEditing = React.useCallback(
    (next: Exclude<typeof activeCell, null>) => {
      setActiveCell(next);
      if (enableRangeSelection) {
        rangeSelection.setSingleSelection(next);
      }
    },
    [enableRangeSelection, rangeSelection, setActiveCell]
  );

  const getResolvedEditPolicyForCell = React.useCallback(
    (coord: { rowId: string; columnId: string } | null): ResolvedGenDataGridEditPolicy | null => {
      if (!coord) return null;
      const column = visibleColumns.find((item) => item.id === coord.columnId);
      if (!column) return null;
      return resolveEditPolicy(editPolicy, column.columnDef.meta?.editPolicy);
    },
    [editPolicy, visibleColumns]
  );

  const startActiveCellEditing = React.useCallback((options?: {
    initialValue?: unknown;
    entryReason?: GenDataGridEditEntryReason;
  }) => {
    if (!activeCell) return false;

    const row = tableRows.find((item) => item.id === activeCell.rowId);
    const column = visibleColumns.find((item) => item.id === activeCell.columnId);
    if (!row || !column) return false;

    const resolvedEditPolicy = resolveEditPolicy(editPolicy, column.columnDef.meta?.editPolicy);
    if (options?.initialValue !== undefined && !resolvedEditPolicy.startTriggers.printableKey) {
      return false;
    }

    const isEditable = resolveEditableCell({
      row,
      column,
      readOnly: resolvedReadOnly,
      isCellEditable,
    });
    if (!isEditable) return false;

    editing.startEditing({
      rowId: activeCell.rowId,
      columnId: activeCell.columnId,
      value: options?.initialValue ?? row.getValue(column.id),
      suppressSelectOnFocus: options?.initialValue !== undefined,
      entryReason: options?.entryReason,
    });
    return true;
  }, [activeCell, editPolicy, editing, isCellEditable, resolvedReadOnly, tableRows, visibleColumns]);

  const cancelEditingAndRestoreFocus = React.useCallback(() => {
    editing.cancelEditing();
    const targetCell = activeCell;
    if (!targetCell) return;

    requestAnimationFrame(() => {
      if (focusCellInRoot(rootRef.current, targetCell)) {
        return;
      }
      requestAnimationFrame(() => {
        focusCellInRoot(rootRef.current, targetCell);
      });
    });
  }, [activeCell, editing]);

  React.useEffect(() => {
    if (controlledActiveCell !== undefined) return;
    if (activeCell) {
      const rowExists = rowIds.includes(activeCell.rowId);
      const columnExists = columnIds.includes(activeCell.columnId);
      if (rowExists && columnExists) return;
    }
    setUncontrolledActiveCell(getFirstActiveCell(rowIds, columnIds));
  }, [activeCell, columnIds, controlledActiveCell, rowIds]);

  React.useEffect(() => {
    if (!activeCell) {
      previousFocusRestoreActiveCellRef.current = activeCell;
      return;
    }

    const previousActiveCell = previousFocusRestoreActiveCellRef.current;
    const activeCellChanged =
      !previousActiveCell ||
      previousActiveCell.rowId !== activeCell.rowId ||
      previousActiveCell.columnId !== activeCell.columnId;
    previousFocusRestoreActiveCellRef.current = activeCell;

    const activeElement = document.activeElement;
    if (activeElement instanceof Element && rootRef.current?.contains(activeElement)) {
      if (!isFocusOwnedByRoot(rootRef.current, activeElement)) return;
      if (isInteractiveElement(activeElement)) return;
    }

    const isEditingActiveCell =
      editing.editingCell?.rowId === activeCell.rowId &&
      editing.editingCell.columnId === activeCell.columnId;

    if (!activeCellChanged && !isEditingActiveCell) {
      return;
    }

    if (enableVirtualization) {
      const activeRowIndex = rowIds.indexOf(activeCell.rowId);
      if (activeCellChanged && activeRowIndex >= 0) {
        virtualBodyRef.current?.scrollToRowIndex(activeRowIndex);
      }
      if (!activeCellChanged && !findCellInRoot(rootRef.current, activeCell)) {
        return;
      }
    }

    const frame = requestAnimationFrame(() => {
      if (isEditingActiveCell && focusActiveEditorInRoot(rootRef.current, activeCell)) {
        return;
      }
      if (focusCellInRoot(rootRef.current, activeCell)) {
        return;
      }
      requestAnimationFrame(() => {
        const stillEditingActiveCell =
          editing.editingCell?.rowId === activeCell.rowId &&
          editing.editingCell.columnId === activeCell.columnId;
        if (stillEditingActiveCell && focusActiveEditorInRoot(rootRef.current, activeCell)) {
          return;
        }
        focusCellInRoot(rootRef.current, activeCell);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeCell, editing.editingCell, enableVirtualization, rowIds]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (!isEventOwnedByRoot(rootRef.current, target)) {
        return;
      }
      if (isInteractiveElement(target)) {
        return;
      }

      const isCopyShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c';
      if (isCopyShortcut && clipboard.canCopy) {
        event.preventDefault();
        void clipboard.copySelection({
          includeHeader: event.shiftKey ? true : undefined,
        });
        return;
      }

      if (event.key === 'Escape' && rangeSelection.selections.length > 0) {
        event.preventDefault();
        rangeSelection.clearSelection();
        return;
      }

      if (event.key === 'Enter' || event.key === 'F2') {
        const resolvedEditPolicy = getResolvedEditPolicyForCell(activeCell);
        const allowEditStart =
          event.key === 'Enter'
            ? resolvedEditPolicy?.startTriggers.enter ?? true
            : resolvedEditPolicy?.startTriggers.f2 ?? true;
        if (allowEditStart && startActiveCellEditing({
          entryReason: event.key === 'Enter' ? 'enter' : 'f2',
        })) {
          event.preventDefault();
          return;
        }
      }

      if (!editing.editingCell && isPrintableEditKey(event)) {
        if (startActiveCellEditing({ initialValue: event.key, entryReason: 'printableKey' })) {
          event.preventDefault();
          return;
        }
      }

      if (
        treeRowsEnabled &&
        activeCell &&
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
      ) {
        const activeRow = tableRows.find((item) => item.id === activeCell.rowId);
        if (activeRow) {
          const treeContext = {
            row: activeRow.original,
            rowId: activeRow.id,
            rowIndex: activeRow.index,
            depth: activeRow.depth,
            parentRowId: activeRow.parentId,
          };
          const canExpandTreeRow = Boolean(
            activeRow.getCanExpand() && (getRowCanExpandTree?.(treeContext) ?? true)
          );

          if (event.key === 'ArrowRight' && canExpandTreeRow && !activeRow.getIsExpanded()) {
            event.preventDefault();
            setTreeExpandedRowState(activeRow, true);
            return;
          }

          if (event.key === 'ArrowLeft' && canExpandTreeRow && activeRow.getIsExpanded()) {
            event.preventDefault();
            setTreeExpandedRowState(activeRow, false);
            return;
          }

          if (event.key === 'ArrowLeft' && !activeRow.getIsExpanded() && activeRow.parentId) {
            event.preventDefault();
            const next = { rowId: activeRow.parentId, columnId: activeCell.columnId };
            setActiveCell(next);
            if (enableRangeSelection) {
              rangeSelection.setSingleSelection(next);
            }
            return;
          }
        }
      }

      if (event.key === 'Tab') {
        const next = resolveNextLinearCell({
          activeCell,
          rowIds,
          columnIds,
          direction: event.shiftKey ? -1 : 1,
        });
        if (!next || next === activeCell) return;

        event.preventDefault();
        setActiveCell(next);
        if (enableRangeSelection) {
          rangeSelection.setSingleSelection(next);
        }
        return;
      }

      if (!isActiveCellNavigationKey(event.key)) return;

      const next = resolveNextActiveCell({
        activeCell,
        rowIds,
        columnIds,
        key: event.key,
        wholeGrid: event.ctrlKey || event.metaKey,
      });
      if (!next) return;

      event.preventDefault();
      setActiveCell(next);
      if (enableRangeSelection && event.shiftKey) {
        rangeSelection.extendSelectionTo(next, activeCell ?? next);
        return;
      }
      if (enableRangeSelection) {
        rangeSelection.setSingleSelection(next);
      }
    },
    [
      activeCell,
      clipboard,
      editing.editingCell,
      enableRangeSelection,
      columnIds,
      rangeSelection,
      rowIds,
      setActiveCell,
      getResolvedEditPolicyForCell,
      getRowCanExpandTree,
      setTreeExpandedRowState,
      startActiveCellEditing,
      tableRows,
      treeRowsEnabled,
    ]
  );

  const handlePaste = React.useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (!isEventOwnedByRoot(rootRef.current, target)) {
        return;
      }
      if (isInteractiveElement(target)) {
        return;
      }
      if (!enableClipboard) {
        return;
      }

      const text = event.clipboardData.getData('text/plain');
      if (!text) {
        return;
      }

      const result = applyClipboardPaste({
        matrix: parseClipboardGrid(text),
        rows: tableRows,
        columns: visibleColumns,
        activeCell,
        readOnly: resolvedReadOnly,
        isCellEditable,
        pasteOptions,
        onCellValueChange: handleCellValueChange,
        onActiveCellChange: setActiveCell,
        setTargetRange: enableRangeSelection
          ? (targetRange) => {
              rangeSelection.setSingleRange(targetRange);
            }
          : undefined,
      });

      if (result.appliedCellCount > 0 || result.skippedCellCount > 0) {
        event.preventDefault();
      }
    },
    [
      activeCell,
      enableClipboard,
      enableRangeSelection,
      handleCellValueChange,
      isCellEditable,
      pasteOptions,
      rangeSelection,
      resolvedReadOnly,
      setActiveCell,
      tableRows,
      visibleColumns,
    ]
  );

  const handleViewportScroll = React.useCallback(() => {
    if (!enableVirtualization || !activeCell) return;

    const root = rootRef.current;
    if (!root) return;

    const restoreRootFocusIfNeeded = () => {
      if (findCellInRoot(root, activeCell)) {
        return;
      }

      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement && root.contains(activeElement) && activeElement !== document.body) {
        if (!isFocusOwnedByRoot(root, activeElement)) return;
        return;
      }

      root.focus({ preventScroll: true });
    };

    restoreRootFocusIfNeeded();
    requestAnimationFrame(restoreRootFocusIfNeeded);
  }, [activeCell, enableVirtualization]);

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
      }}
      tabIndex={enableVirtualization ? -1 : undefined}
      role="grid"
      data-gen-datagrid-root="true"
      data-grid-id={resolvedGridId}
      aria-rowcount={tableRows.length}
      aria-colcount={visibleColumns.length}
      className={['gen-datagrid', className].filter(Boolean).join(' ')}
      style={{
        ['--gen-datagrid-row-height' as string]: `${rowHeight}px`,
        ['--gen-datagrid-header-height' as string]: `${headerHeight}px`,
        ...style,
      }}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onMouseDown={rangeSelection.handleMouseDown}
      onMouseOver={rangeSelection.handleMouseOver}
    >
      {enableGlobalFilter ? (
        <div className="gen-datagrid__global-filter" data-global-filter="true">
          <input
            aria-label="Global filter"
            className="gen-datagrid__global-filter-input"
            value={table.getState().globalFilter == null ? '' : String(table.getState().globalFilter)}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value || undefined);
            }}
          />
        </div>
      ) : null}
      <div
        ref={setViewportElement}
        className="gen-datagrid__viewport"
        data-gen-datagrid-viewport="true"
        onScroll={handleViewportScroll}
      >
        <DataGridHeader
          table={table}
          headerGroups={headerGroups}
          columns={visibleColumns}
          gridTemplateColumns={gridTemplateColumns}
          enablePinning={enablePinning}
          enableColumnSizing={enableColumnSizing}
          enableColumnReorder={enableColumnReorder}
          enableColumnFilters={enableColumnFilters}
        />
        {enableVirtualization ? (
          <DataGridVirtualBody
            rows={tableRows}
            gridTemplateColumns={gridTemplateColumns}
            rowHeight={rowHeight}
            headerHeight={headerHeight}
            rowIds={rowIds}
            columnIds={columnIds}
            rangeSelections={rangeSelection.selections}
            viewportElement={viewportElement}
            readOnly={resolvedReadOnly}
            enablePinning={enablePinning}
            isCellEditable={isCellEditable}
            editPolicy={editPolicy}
            editSelectOnFocus={editSelectOnFocus}
            editCommitOnBlur={editCommitOnBlur}
            editorFactory={editorFactory}
            onCellValueChange={handleCellValueChange}
            dirtyCellIds={dirtyCellIds}
            dirtyRowIds={dirtyRowIds}
            deletedRowIds={deletedRowIds}
            getRowHeight={getRowHeight}
            enableMasterDetail={masterDetailEnabled}
            expandedRows={resolvedExpandedRows}
            getRowCanExpand={getRowCanExpand}
            renderDetailPanel={renderDetailPanel}
            detailPanelHeight={detailPanelHeight}
            onExpandedRowToggle={setExpandedRowState}
            enableTreeRows={treeRowsEnabled}
            getRowCanExpandTree={getRowCanExpandTree}
            treeIndentWidth={treeIndentWidth}
            onTreeExpandedRowToggle={setTreeExpandedRowState}
            activeCell={activeCell}
            onActiveCellChange={setActiveCell}
            onEditingNavigate={navigateWhileEditing}
            editingCell={editing.editingCell}
            draftValue={editing.draftValue}
            setDraftValue={editing.setDraftValue}
            onEditStart={editing.startEditing}
            onEditCancel={cancelEditingAndRestoreFocus}
            getGridRoot={() => rootRef.current}
            getEditorSurfaces={editing.getEditorSurfaces}
            registerEditorSurface={editing.registerEditorSurface}
            unregisterEditorSurface={editing.unregisterEditorSurface}
            scrollSeeking={scrollSeeking}
            virtualBodyRef={virtualBodyRef}
          />
        ) : (
          <DataGridBody
            rows={tableRows}
            gridTemplateColumns={gridTemplateColumns}
            rowHeight={rowHeight}
            rowIds={rowIds}
            columnIds={columnIds}
            rangeSelections={rangeSelection.selections}
            readOnly={resolvedReadOnly}
            enablePinning={enablePinning}
            isCellEditable={isCellEditable}
            editPolicy={editPolicy}
            editSelectOnFocus={editSelectOnFocus}
            editCommitOnBlur={editCommitOnBlur}
            editorFactory={editorFactory}
            onCellValueChange={handleCellValueChange}
            dirtyCellIds={dirtyCellIds}
            dirtyRowIds={dirtyRowIds}
            deletedRowIds={deletedRowIds}
            getRowHeight={getRowHeight}
            activeCell={activeCell}
            onActiveCellChange={setActiveCell}
            onEditingNavigate={navigateWhileEditing}
            editingCell={editing.editingCell}
            draftValue={editing.draftValue}
            setDraftValue={editing.setDraftValue}
            onEditStart={editing.startEditing}
            onEditCancel={cancelEditingAndRestoreFocus}
            getGridRoot={() => rootRef.current}
            getEditorSurfaces={editing.getEditorSurfaces}
            registerEditorSurface={editing.registerEditorSurface}
            unregisterEditorSurface={editing.unregisterEditorSurface}
            enableMasterDetail={masterDetailEnabled}
            expandedRows={resolvedExpandedRows}
            getRowCanExpand={getRowCanExpand}
            renderDetailPanel={renderDetailPanel}
            detailPanelHeight={detailPanelHeight}
            onExpandedRowToggle={setExpandedRowState}
            enableTreeRows={treeRowsEnabled}
            getRowCanExpandTree={getRowCanExpandTree}
            treeIndentWidth={treeIndentWidth}
            onTreeExpandedRowToggle={setTreeExpandedRowState}
          />
        )}
        {enableFooterRow ? (
          <DataGridFooterRow
            table={table}
            footerGroups={footerGroups}
            columns={visibleColumns}
            gridTemplateColumns={gridTemplateColumns}
            enablePinning={enablePinning}
            sticky={enableStickyFooterRow}
            footerRowHeight={footerRowHeight}
          />
        ) : null}
      </div>
      {enablePagination ? (
        <div className="gen-datagrid__pagination" data-gen-datagrid-pagination="true">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <span className="gen-datagrid__pagination-status">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          {pageSizeOptions && pageSizeOptions.length > 0 ? (
            <select
              aria-label="Page size"
              className="gen-datagrid__pagination-page-size"
              value={table.getState().pagination.pageSize}
              onChange={(event) => {
                table.setPagination({
                  pageIndex: 0,
                  pageSize: Number(event.target.value),
                });
              }}
            >
              {pageSizeOptions.map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          ) : null}
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      ) : null}
      {enableFooter && (renderFooter || footer) ? (
        <DataGridFooterBar>
          {renderFooter
            ? renderFooter({
                table,
                rows: filteredRows.map((row) => row.original),
                dirtyState,
                pagination: table.getState().pagination,
              })
            : footer}
        </DataGridFooterBar>
      ) : null}
    </div>
  );
}
