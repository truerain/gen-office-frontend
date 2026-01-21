// packages/gen-grid/src/GenGrid.types.ts

import type { ColumnDef } from '@tanstack/react-table';

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
  enableRowSelection?: boolean;
  enableRowNumber?: boolean;

  enablePagination?: boolean;
  pageSizeOptions?: number[];

  onDirtyChange?: (dirty: boolean) => void;               // dirty 상태가 바뀔 때 알림
  onDirtyRowsChange?: (rowIds: string[]) => void;         // dirty 행 목록이 바뀔 때 알림  
  dirtyKeys?: string[];                                   // dirty 계산에서 비교할 key 제한 (없으면 editable 컬럼 accessorKey 기반으로 자동 추출)
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

    /** 셀 편집 커밋 시점에 “정확히 한 셀” 변경 이벤트 */
     onCellValueChange?: (args: {
      rowId: string;
      columnId: string;
      value: unknown;
    }) => void;
  };


