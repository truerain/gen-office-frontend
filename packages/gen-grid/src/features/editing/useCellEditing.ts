// packages/gen-grid/src/features/editing/useCellEditing.ts

import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import type { CellCoord, EditCell, Dir } from './types';
import { focusGridCell } from '../active-cell/cellDom';

export function useCellEditing<TData>(args: {
  table: Table<TData>;
  activeCell: CellCoord | null;
  onActiveCellChange: (next: CellCoord) => void;
  clearSelectedRanges?: () => void;
  editOnActiveCell?: boolean;
  keepEditingOnNavigate?: boolean;
  editMode: boolean;
  setEditMode: (next: boolean) => void;

  /** 실제 데이터 업데이트 함수(옵션) */
  updateValue?: (coord: CellCoord, nextValue: unknown) => void;

  /** 편집 가능 여부(시스템 컨럼 제외 등) */
  isCellEditable?: (rowId: string, columnId: string) => boolean;
}) {
  const {
    table,
    activeCell,
    onActiveCellChange,
    clearSelectedRanges,
    updateValue,
    isCellEditable,
    editOnActiveCell,
    keepEditingOnNavigate,
    editMode,
    setEditMode,
  } = args;

  const [editCell, setEditCell] = React.useState<EditCell>(null);
  const prevActiveCellRef = React.useRef<CellCoord | null>(null);
  const pendingEditCellRef = React.useRef<CellCoord | null>(null);
  const suppressNextFocusEditRef = React.useRef<CellCoord | null>(null);
  const suppressNextAutoEditOnceRef = React.useRef(false);
  const liveEditCoordRef = React.useRef<CellCoord | null>(null);
  const editStartSnapshotRef = React.useRef<{ coord: CellCoord; value: unknown } | null>(null);

  const isSameCoord = React.useCallback((a: CellCoord | null, b: CellCoord | null) => {
    if (!a || !b) return false;
    return a.rowId === b.rowId && a.columnId === b.columnId;
  }, []);

  const readCellValue = React.useCallback(
    (coord: CellCoord): unknown => {
      const row =
        table.getRowModel().rowsById?.[coord.rowId]?.original ??
        table.getRowModel().rows.find((item) => item.id === coord.rowId)?.original;
      return (row as any)?.[coord.columnId];
    },
    [table]
  );

  const isNavigationKey = React.useCallback((key: string) => {
    return (
      key === 'ArrowLeft' ||
      key === 'ArrowRight' ||
      key === 'ArrowUp' ||
      key === 'ArrowDown' ||
      key === 'Home' ||
      key === 'End' ||
      key === 'PageUp' ||
      key === 'PageDown' ||
      key === 'Tab'
    );
  }, []);

  const canEdit = React.useCallback(
    (rowId: string, columnId: string) => {
      if (isCellEditable && !isCellEditable(rowId, columnId)) return false;

      const col = table.getColumn(columnId);
      const meta = col?.columnDef.meta as any;
      const row =
        table.getRowModel().rowsById?.[rowId]?.original ??
        table.getRowModel().rows.find((item) => item.id === rowId)?.original;
      if (typeof meta?.editable === 'function' && !meta.editable({ row, rowId, columnId })) {
        return false;
      }
      if (meta?.editable === false) return false;
      if (!meta?.editable && !meta?.renderEditor && !meta?.editType) return false;

      return true;
    },
    [isCellEditable, table]
  );

  const clearPending = React.useCallback(() => {
    pendingEditCellRef.current = null;
  }, []);

  const blurActiveEditor = React.useCallback(() => {
    if (typeof document === 'undefined') return false;
    const active = document.activeElement as HTMLElement | null;
    if (!active) return false;
    if (!active.closest('input,select,textarea,[contenteditable="true"]')) return false;
    active.blur();
    return true;
  }, []);

  const captureEditStartSnapshot = React.useCallback(
    (coord: CellCoord) => {
      editStartSnapshotRef.current = {
        coord,
        value: readCellValue(coord),
      };
    },
    [readCellValue]
  );

  const restoreEditStartSnapshot = React.useCallback(
    (coord: CellCoord) => {
      const snapshot = editStartSnapshotRef.current;
      if (!snapshot) return;
      if (!isSameCoord(snapshot.coord, coord)) return;
      if (!updateValue) return;

      const currentValue = readCellValue(coord);
      if (!Object.is(currentValue, snapshot.value)) {
        updateValue(coord, snapshot.value);
      }
    },
    [isSameCoord, readCellValue, updateValue]
  );

  const enterEdit = React.useCallback(
    (coord: CellCoord) => {
      if (!canEdit(coord.rowId, coord.columnId)) return;
      liveEditCoordRef.current = coord;
      setEditMode(true);
      setEditCell(coord);
    },
    [canEdit, setEditMode]
  );

  const exitEdit = React.useCallback(
    (opts?: { preserve?: boolean }) => {
      const preserve = Boolean(opts?.preserve);
      if (!preserve) setEditMode(false);
      clearPending();
      liveEditCoordRef.current = null;
      setEditCell(null);
      editStartSnapshotRef.current = null;
    },
    [clearPending, setEditMode]
  );

  const startEditing = React.useCallback(
    (coord?: CellCoord) => {
      const c = coord ?? activeCell;
      if (!c) return;
      enterEdit(c);
    },
    [activeCell, enterEdit]
  );

  const stopEditing = React.useCallback(
    (opts?: { preserve?: boolean }) => {
      exitEdit(opts);
    },
    [exitEdit]
  );

  const cancelEditing = React.useCallback(
    (opts?: { preserve?: boolean }) => {
      const preserve =
        opts?.preserve === undefined
          ? keepEditingOnNavigate && !!pendingEditCellRef.current
          : opts.preserve;
      if (!preserve && editCell) {
        restoreEditStartSnapshot(editCell);
      }
      exitEdit({ preserve });
    },
    [editCell, exitEdit, keepEditingOnNavigate, restoreEditStartSnapshot]
  );

  React.useEffect(() => {
    if (!editCell) {
      editStartSnapshotRef.current = null;
      return;
    }
    const snapshot = editStartSnapshotRef.current;
    if (snapshot && isSameCoord(snapshot.coord, editCell)) return;
    captureEditStartSnapshot(editCell);
  }, [captureEditStartSnapshot, editCell, isSameCoord]);

  /** 편집 상태에서 Enter/Esc 처리: Cell에서 핸들 */
  const getCellEditProps = React.useCallback(
    (rowId: string, columnId: string): React.HTMLAttributes<HTMLElement> => {
      const isEditing = !!editCell && editCell.rowId === rowId && editCell.columnId === columnId;
      const isInteractiveTarget = (target: EventTarget | null) => {
        const el = target as HTMLElement | null;
        if (!el) return false;
        return !!el.closest('input,select,textarea,button,[contenteditable="true"]');
      };

      return {
        onMouseDown: (e: any) => {
          if (e.button !== 0) return;
          if (isInteractiveTarget(e.target)) return;

          if (editCell && (editCell.rowId !== rowId || editCell.columnId !== columnId)) {
            // Mouse navigation should end current edit first, including custom renderEditor.
            if (keepEditingOnNavigate) {
              pendingEditCellRef.current = { rowId, columnId };
              // Do not cancel on click navigation: let blur drive commit.
              blurActiveEditor();
              return;
            }
            suppressNextAutoEditOnceRef.current = true;
            suppressNextFocusEditRef.current = { rowId, columnId };
            pendingEditCellRef.current = { rowId, columnId };
            return;
          }
          if(activeCell && activeCell.rowId === rowId && activeCell.columnId === columnId) {
            if (canEdit(rowId, columnId)) {
              startEditing({ rowId, columnId });
            }
          }
        },
        onDoubleClick: () => {
          clearSelectedRanges?.();
          // 더블클릭하면 해당 셀로 active 맞추고 편집 시작
          onActiveCellChange({ rowId, columnId });
          startEditing({ rowId, columnId });
        },
        /*
        onClickCapture: (e: any) => {
          console.log('onClickCapture', { rowId, columnId });
          if (isInteractiveTarget(e.target)) return;
          if (e?.detail !== 2) return;

          clearSelectedRanges?.();
          onActiveCellChange({ rowId, columnId });
          if (canEdit(rowId, columnId)) {
            startEditing({ rowId, columnId });
          }
        },
        */
        onFocus: () => {
          if (suppressNextAutoEditOnceRef.current) {
            suppressNextAutoEditOnceRef.current = false;
            return;
          }
          const suppress = suppressNextFocusEditRef.current;
          if (suppress && suppress.rowId === rowId && suppress.columnId === columnId) {
            suppressNextFocusEditRef.current = null;
            return;
          }
          if (!editOnActiveCell) {
            // Avoid re-entering edit on plain cell focus after the editor blurs.
            // Keep edit chaining on navigation handled by pending-edit flow instead.
            if (!editCell) return;
          } else if (!editMode) {
            return;
          }
          if (isEditing) return;
          if (editCell && (editCell.rowId !== rowId || editCell.columnId !== columnId)) {
            pendingEditCellRef.current = { rowId, columnId };
            return;
          }
          if (canEdit(rowId, columnId)) {
            startEditing({ rowId, columnId });
          }
        },
        onKeyDown: (e: any) => {
          // 편집 중이면 Esc로 취소 (Enter는 editor에서 commit 예정)
          if (isEditing) {
            if (!keepEditingOnNavigate && isNavigationKey(e.key)) {
              suppressNextAutoEditOnceRef.current = true;
            }
            // GenGridCell이 Editor 내부에서 처리하도록
            // 상위 핸들러가 먼저 먹지 않도록 방어
            if (e.key === 'Escape') {
              e.stopPropagation();
              e.preventDefault();
              cancelEditing({ preserve: false });
              if (activeCell) {
                focusGridCell(activeCell.rowId, activeCell.columnId);
              }
            }
            return;
          }

          // 편집 시작
          if (e.key === 'Enter') {
            if (canEdit(rowId, columnId)) {
              e.stopPropagation();
              e.preventDefault();
              startEditing({ rowId, columnId });
            }
          }

          // F2로 편집 진입
          if (e.key === 'F2') {
            if (canEdit(rowId, columnId)) {
              e.stopPropagation();
              e.preventDefault();
              startEditing({ rowId, columnId });
            }
          }
        },
      };
    },
    [
      cancelEditing,
      canEdit,
      editCell,
      editOnActiveCell,
      isNavigationKey,
      onActiveCellChange,
      clearSelectedRanges,
      startEditing,
      editMode,
      activeCell,
      blurActiveEditor,
      keepEditingOnNavigate,
    ]
  );

  const getVisibleColumnIds = () =>
    table.getVisibleLeafColumns().map((c) => c.id);

  const getRowIds = () =>
    table.getRowModel().rows.map((r) => r.id);

  /** 현재 테이블 상태 기준으로 "편집 가능한 셀 리스트"를 1차원으로 만듦 */
  const buildEditableCellList = React.useCallback(() => {
    const rowIds = getRowIds();
    const colIds = getVisibleColumnIds();

    const cells: CellCoord[] = [];
    for (const rowId of rowIds) {
      for (const columnId of colIds) {
        if (canEdit(rowId, columnId)) cells.push({ rowId, columnId });
      }
    }
    return cells;
  }, [table, canEdit]);

  const findNextEditableCell = React.useCallback(
    (from: CellCoord, dir: Dir): CellCoord | null => {
      const list = buildEditableCellList();
      if (list.length === 0) return null;

      const idx = list.findIndex((c) => c.rowId === from.rowId && c.columnId === from.columnId);

      // from 자체가 editable 리스트에 없을 경우 가장 가까운 위치부터 탐색
      const start = idx >= 0 ? idx : 0;

      const nextIdx = start + dir;

      // wrap
      if (nextIdx < 0) return list[list.length - 1];
      if (nextIdx >= list.length) return list[0];

      return list[nextIdx];
    },
    [buildEditableCellList]
  );

  const moveEditByTab = React.useCallback(
    (dir: Dir) => {
      const from = editCell ?? activeCell;
      if (!from) return;

      const next = findNextEditableCell(from, dir);
      if (!next) {
        // v1: 더 이상 editable 없으면 편집 종료
        setEditCell(null);
        return;
      }

      // activeCell도 같이 이동 (스크롤 active 표시)
      onActiveCellChange(next);

      // 편집 대상 변경
      enterEdit(next);
    },
    [activeCell, editCell, enterEdit, findNextEditableCell, onActiveCellChange]
  );

  React.useEffect(() => {
    const prev = prevActiveCellRef.current;
    prevActiveCellRef.current = activeCell;

    if (!keepEditingOnNavigate) return;
    if (!activeCell) return;

    const activeChanged =
      !prev ||
      prev.rowId !== activeCell.rowId ||
      prev.columnId !== activeCell.columnId;

    if (!activeChanged) return;
    if (!editMode && !editCell) return;

    if (editMode && editCell) {
      // Safety net: if active cell moved while an editor is open (e.g. custom renderEditor),
      // end previous edit so the old editor cannot remain mounted.
      if (!isSameCoord(editCell, activeCell)) {
        cancelEditing({ preserve: false });
      }
      return;
    }

    if (editMode && !editCell) {
      enterEdit(activeCell);
    }
  }, [activeCell, cancelEditing, editCell, editMode, enterEdit, keepEditingOnNavigate, isSameCoord]);

  React.useEffect(() => {
    if (editMode) return;
    suppressNextFocusEditRef.current = null;
    suppressNextAutoEditOnceRef.current = false;
  }, [editMode]);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!keepEditingOnNavigate) return;

    const blurActiveEditor = () => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return false;
      if (!active.closest('input,select,textarea,[contenteditable="true"]')) return false;
      active.blur();
      return true;
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!editMode) return;
      if (!activeCell) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-gen-grid-editor-overlay="true"]')) return;

      const cell = document.querySelector<HTMLElement>(
        `[data-rowid="${CSS.escape(activeCell.rowId)}"][data-colid="${CSS.escape(activeCell.columnId)}"]`
      );
      const container = cell?.closest<HTMLElement>('[class*="tableScroll"]');
      if (!container) return;

      if (!container.contains(target)) {
        if (blurActiveEditor()) return;
        exitEdit({ preserve: false });
      }
    };

    document.addEventListener('focusin', handleFocusIn, true);
    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
    };
  }, [activeCell, editMode, keepEditingOnNavigate, exitEdit]);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!keepEditingOnNavigate) return;

    const blurActiveEditor = () => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return false;
      if (!active.closest('input,select,textarea,[contenteditable="true"]')) return false;
      active.blur();
      return true;
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (!editMode) return;
      if (!activeCell) return;

      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-gen-grid-editor-overlay="true"]')) return;

      const cell = document.querySelector<HTMLElement>(
        `[data-rowid="${CSS.escape(activeCell.rowId)}"][data-colid="${CSS.escape(activeCell.columnId)}"]`
      );
      const activeContainer = cell?.closest<HTMLElement>('[class*="tableScroll"]') ?? null;
      const targetContainer = target.closest<HTMLElement>('[class*="tableScroll"]');

      if (activeContainer) {
        if (targetContainer !== activeContainer) {
          if (blurActiveEditor()) return;
          exitEdit({ preserve: false });
          return;
        }

        const inEditor = !!target.closest('input,select,textarea,button,[contenteditable="true"]');
        const inCell = !!target.closest('td[data-rowid][data-colid]');
        if (!inEditor && !inCell) {
          // Clicking blank area inside the same grid should close the current editor.
          if (blurActiveEditor()) return;
          exitEdit({ preserve: false });
          return;
        }
        return;
      }

      if (!targetContainer) {
        if (blurActiveEditor()) return;
        exitEdit({ preserve: false });
      }
    };

    document.addEventListener('mousedown', handlePointerDown, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true);
    };
  }, [activeCell, editMode, keepEditingOnNavigate, exitEdit]);

  const commitEditing = React.useCallback(() => {
    if (keepEditingOnNavigate) {
      const pending = pendingEditCellRef.current;
      if (pending) {
        clearPending();
        if (canEdit(pending.rowId, pending.columnId)) {
          enterEdit(pending);
          return;
        }
      }
    }
    // If there is no pending target cell, finish edit and return to navigation mode.
    stopEditing({ preserve: false });
  }, [canEdit, clearPending, enterEdit, keepEditingOnNavigate, stopEditing]);

  return {
    editCell,
    setEditCell, // 필요하면 외부 제어
    canEdit,
    startEditing,
    stopEditing,
    cancelEditing,
    commitEditing,
    getCellEditProps,
    moveEditByTab,

    /** editor 렌더에서 바로 업데이트 전달 */
    commitValue: (coord: CellCoord, nextValue: unknown) => {
      if (!isSameCoord(liveEditCoordRef.current, coord)) return;
      updateValue?.(coord, nextValue);
      if (keepEditingOnNavigate) {
        const pending = pendingEditCellRef.current;
        if (pending) {
          clearPending();
          if (canEdit(pending.rowId, pending.columnId)) {
            enterEdit(pending);
            return;
          }
        }
      }
      // Blur/commit without navigation target should exit edit mode.
      stopEditing({ preserve: false });
    },

    /** value만 즉시 반영하고 편집 상태는 유지 */
    applyValue: (coord: CellCoord, nextValue: unknown) => {
      if (!isSameCoord(liveEditCoordRef.current, coord)) return;
      updateValue?.(coord, nextValue);
    },
  };
}
