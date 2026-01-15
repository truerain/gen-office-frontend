// packages/datagrid/src/gen-grid/features/editing/useCellEditing.ts
import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import type { EditCell } from './types';

type CellCoord = { rowId: string; columnId: string };

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
      if (!meta?.editable && !meta?.renderEditor) return false;

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

  return {
    editCell,
    setEditCell, // 필요하면 외부 제어용
    canEdit,
    startEditing,
    stopEditing,
    cancelEditing,
    getCellEditProps,

    /** editor 렌더에서 바로 쓰기 좋게 */
    commitValue: (coord: CellCoord, nextValue: unknown) => {
      updateValue?.(coord, nextValue);
      stopEditing();
    },
  };
}
