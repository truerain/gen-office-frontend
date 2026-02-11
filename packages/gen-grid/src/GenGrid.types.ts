// packages/gen-grid/src/GenGrid.types.ts

import type { ColumnDef, ExpandedState, GroupingState, RowSelectionState, Table } from '@tanstack/react-table';
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

export type GenGridTreeOptions<TData> = {
  /** enable flat parent-child tree mode */
  enabled: boolean;
  /** row id field key (ex: 'menuId') */
  idKey: keyof TData | string;
  /** parent row id field key (ex: 'prntMenuId') */
  parentIdKey: keyof TData | string;
  /** tree toggle/indent render column id */
  treeColumnId?: string;
  /** root parent discriminator, default: null | undefined | 0 */
  rootParentValue?: unknown;
  /** per-depth indent in pixels, default: 12 */
  indentPx?: number;
  /** expand all rows on first mount, default: false */
  defaultExpanded?: boolean;
  /** controlled expanded state */
  expandedRowIds?: Record<string, boolean>;
  /** controlled expanded state change callback */
  onExpandedRowIdsChange?: (next: Record<string, boolean>) => void;
  /** show orphan row warning, default: true */
  showOrphanWarning?: boolean;
  /** orphan row id list callback */
  onOrphanRowsChange?: (rowIds: string[]) => void;
};

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
  enableActiveRowHighlight?: boolean;
  enableGrouping?: boolean;

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

  grouping?: GroupingState;
  onGroupingChange?: (next: GroupingState) => void;

  expanded?: ExpandedState;
  onExpandedChange?: (next: ExpandedState) => void;

  activeCell?: ActiveCell;
  onActiveCellChange?: (next: ActiveCell) => void;

  /** when true, entering an active cell starts edit mode */
  editOnActiveCell?: boolean;
  /** keep edit mode when active cell moves (arrow/mouse/tab) */
  keepEditingOnNavigate?: boolean;

  /** tanstack table meta */
  tableMeta?: Record<string, any>;

  /** flat parent-child tree options */
  tree?: GenGridTreeOptions<TData>;
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


