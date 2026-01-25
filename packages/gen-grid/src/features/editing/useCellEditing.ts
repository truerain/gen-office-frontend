// packages/gen-grid/src/features/editing/useCellEditing.ts

import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import type { CellCoord, EditCell, Dir } from './types';


export function useCellEditing<TData>(args: {
  table: Table<TData>;
  activeCell: CellCoord | null;
  onActiveCellChange: (next: CellCoord) => void;

  /** 외부에서 실제 데이터 업데이트 하는 함수(옵션) */
  updateValue?: (coord: CellCoord, nextValue: unknown) => void;

  /** 편집 가능 정책(시스템 컬럼 제외 등) */
  isCellEditable?: (rowId: string, columnId: string) => boolean;
}) {
  const { table, activeCell, onActiveCellChange, updateValue, isCellEditable } = args;

  const [editCell, setEditCell] = React.useState<EditCell>(null);

  const canEdit = React.useCallback(
    (rowId: string, columnId: string) => {
      if (isCellEditable && !isCellEditable(rowId, columnId)) return false;

      const col = table.getColumn(columnId);
      const meta = col?.columnDef.meta as any;
      if (!meta?.editable && !meta?.renderEditor && !meta?.editType) return false;

      return true;
    },
    [isCellEditable, table]
  );

  const startEditing = React.useCallback(
    (coord?: CellCoord) => {
      const c = coord ?? activeCell;
      if (!c) return;
      if (!canEdit(c.rowId, c.columnId)) return;
      setEditCell(c);
    },
    [activeCell, canEdit]
  );

  const stopEditing = React.useCallback(() => {
    setEditCell(null);
  }, []);

  const cancelEditing = React.useCallback(() => {
    // v1에서는 별도 revert 로직 없음 (editor가 local state로 관리하면 됨)
    setEditCell(null);
  }, []);

  /** 편집 상태에서 Enter/Esc 처리: Cell에 얹기 */
  const getCellEditProps = React.useCallback(
    (rowId: string, columnId: string): React.HTMLAttributes<HTMLElement> => {
      const isEditing = !!editCell && editCell.rowId === rowId && editCell.columnId === columnId;

      return {
        onDoubleClick: () => {
          // 더블클릭하면 해당 셀로 active 맞추고 편집 시작
          onActiveCellChange({ rowId, columnId });
          startEditing({ rowId, columnId });
        },

        onKeyDown: (e: any) => {
          // 편집 중이면 Esc로 취소 (Enter는 editor 내부에서 commit하는 게 안정적)
          if (isEditing) {
            if (e.key === 'Escape') {
              e.stopPropagation();
              e.preventDefault();
              cancelEditing();
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

          // F2도 흔한 패턴
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
    [cancelEditing, canEdit, editCell, onActiveCellChange, startEditing]
  );

  const getVisibleColumnIds = () =>
    table.getVisibleLeafColumns().map((c) => c.id);

  const getRowIds = () =>
    table.getRowModel().rows.map((r) => r.id);

  /** 현재 테이블 상태 기준으로 "탐색 가능한 셀 리스트"를 1차원으로 펼침 */
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

      // from 자체가 editable 리스트에 없을 수도 있으니, 가장 가까운 지점부터 탐색
      const start = idx >= 0 ? idx : 0;

      const nextIdx = start + dir;

      // ✅ wrap 원하면
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

      // activeCell도 같이 이동 (포커스/스크롤/active 표시)
      onActiveCellChange(next);

      // 편집 유지
      setEditCell(next);
    },
    [activeCell, editCell, findNextEditableCell, onActiveCellChange]
  );

  return {
    editCell,
    setEditCell, // 필요하면 외부 제어용
    canEdit,
    startEditing,
    stopEditing,
    cancelEditing,
    getCellEditProps,
    moveEditByTab,

    /** editor 렌더에서 바로 쓰기 좋게 */
    commitValue: (coord: CellCoord, nextValue: unknown) => {
      updateValue?.(coord, nextValue);
      stopEditing();
    },
  };
}
