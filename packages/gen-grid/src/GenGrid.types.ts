// packages/gen-grid/src/GenGrid.types.ts

import type { ColumnDef, RowSelectionState, Table } from '@tanstack/react-table';
import type * as React from 'react';
import type { ActiveCell } from './features/active-cell/types';
import type { GenGridColumnMeta } from './components/layout/utils';

export type GenGridEditorContext<TData> = {
  value: unknown;
  row: TData;
  rowId: string;
  columnId: string;
  meta?: GenGridColumnMeta;
  editType?: GenGridColumnMeta['editType'];
  onChange: (nextValue: unknown) => void;
  onCommit: () => void;
  onCancel: () => void;
  onTab?: (dir: 1 | -1) => void;
  commitValue: (nextValue: unknown) => void;
  applyValue: (nextValue: unknown) => void;
};

export type GenGridEditorFactory<TData> = (ctx: GenGridEditorContext<TData>) => React.ReactNode;

type CommonGridOptions<TData> = {
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

  /** column footer row (TanStack columnDef.footer) */
  enableFooterRow?: boolean;
  /** sticky footer row inside table scroll */
  enableStickyFooterRow?: boolean;

  enableFooter?: boolean;
  footer?: React.ReactNode;
  renderFooter?: (table: Table<TData>) => React.ReactNode;

  onDirtyChange?: (dirty: boolean) => void;               // dirty ?�태가 바�????�림
  onDirtyRowsChange?: (rowIds: string[]) => void;         // dirty ??목록??바�????�림  
  dirtyKeys?: string[];                                   // dirty 계산?�서 비교??key ?�한 (?�으�?editable 컬럼 accessorKey 기반?�로 ?�동 추출)

  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (next: RowSelectionState) => void;

  activeCell?: ActiveCell;
  onActiveCellChange?: (next: ActiveCell) => void;

  /** when true, entering an active cell starts edit mode */
  editOnActiveCell?: boolean;
  /** keep edit mode when active cell moves (arrow/mouse/tab) */
  keepEditingOnNavigate?: boolean;

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

export type GenGridProps<TData> = CommonGridOptions<TData> &
  (ControlledDataProps<TData> | UncontrolledDataProps<TData>) & {
    columns: ColumnDef<TData, any>[];
    getRowId: (row: TData) => string;
    editorFactory?: GenGridEditorFactory<TData>;

    /** ?� ?�집 커밋 ?�점???�정?�히 ???�??변�??�벤??*/
     onCellValueChange?: (args: {
      rowId: string;
      columnId: string;
      value: unknown;
    }) => void;
  };


