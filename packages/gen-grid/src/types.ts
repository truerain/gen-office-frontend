// packages/gen-grid/src/types.ts

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

  enableRowSelection?: boolean;
  enableRowNumber?: boolean;

  enablePagination?: boolean;
  pageSizeOptions?: number[];

  /** (선택) dirty 상태가 바뀔 때 알림 */
  onDirtyChange?: (dirty: boolean) => void;
};

export type GenGridHandle<TData> = {
  getData: () => TData[];
  isDirty: () => boolean;

  revertAll: () => void;
  acceptChanges: () => void;
  load: (nextData: TData[]) => void;
  hardReset: () => void;
};

type ControlledDataProps<TData> = {
  data: TData[];
  onDataChange: (next: TData[]) => void;
  defaultData?: never;
};

type UncontrolledDataProps<TData> = {
  defaultData: TData[];
  onDataChange?: (next: TData[]) => void;
  data?: never;
};

export type GenGridProps<TData> = CommonGridOptions &
  (ControlledDataProps<TData> | UncontrolledDataProps<TData>) & {
    columns: ColumnDef<TData, any>[];
    getRowId: (row: TData) => string;
  };
