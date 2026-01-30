// packages/gen-grid/src/GenGrid.types.ts

import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import type { ActiveCell } from './features/active-cell/types';

type CommonGridOptions = {
  caption?: string;

  height?: number | string;
  maxHeight?: number | string;

  enableStickyHeader?: boolean;
  headerHeight?: number;
  rowHeight?: number;

  enableVirtualization?: boolean;
  overscan?: number;

  enableFiltering?: boolean;
  enablePinning?: boolean;
  enableColumnSizing?: boolean;

  enableRowStatus?: boolean;
  rowStatusResolver?: (rowId: string) => 'clean' | 'created' | 'updated' | 'deleted';
  enableRowSelection?: boolean;
  enableRowNumber?: boolean;

  enablePagination?: boolean;
  pageSizeOptions?: number[];

  onDirtyChange?: (dirty: boolean) => void;               // dirty ?�태가 바�????�림
  onDirtyRowsChange?: (rowIds: string[]) => void;         // dirty ??목록??바�????�림  
  dirtyKeys?: string[];                                   // dirty 계산?�서 비교??key ?�한 (?�으�?editable 컬럼 accessorKey 기반?�로 ?�동 추출)

  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (next: RowSelectionState) => void;

  activeCell?: ActiveCell;
  onActiveCellChange?: (next: ActiveCell) => void;

  /** when true, entering an active cell starts edit mode */
  editOnActiveCell?: boolean;

  /** tanstack table meta */
  tableMeta?: Record<string, any>;
};

type ControlledDataProps<TData> = {
  data: TData[];
  onDataChange: (next: TData[]) => void;
  dataVersion?: number | string;
  defaultData?: never;
};

type UncontrolledDataProps<TData> = {
  defaultData: TData[];
  onDataChange?: (next: TData[]) => void;
  dataVersion?: number | string;
  data?: never;
};

export type GenGridProps<TData> = CommonGridOptions &
  (ControlledDataProps<TData> | UncontrolledDataProps<TData>) & {
    columns: ColumnDef<TData, any>[];
    getRowId: (row: TData) => string;

    /** ?� ?�집 커밋 ?�점???�정?�히 ???�??변�??�벤??*/
     onCellValueChange?: (args: {
      rowId: string;
      columnId: string;
      value: unknown;
    }) => void;
  };


