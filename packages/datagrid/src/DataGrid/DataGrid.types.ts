import type { RowData, Row } from '@tanstack/react-table';
import type { UseDataGridOptions } from '../hooks';
import type { BorderStyle, CellEditEvent } from '../types';

export type TableMode = 'client' | 'server'

export type BulkAction<TData extends RowData> = {
  key: string;
  label: string;
  onClick: (selectedRows: Row<TData>[]) => void | Promise<void>;
  disabled?: (selectedRows: Row<TData>[]) => boolean;
};

type SharedProps<TData extends RowData> = UseDataGridOptions<TData> & {
  mode: TableMode

  enableVirtualization?: boolean;     // Enable virtual scrolling, @default true

  rowHeight?: number;                 //  Row height for virtual scrolling, @default 48
  height?: string | number;           //  Table container height, @default '600px'
  striped?: boolean;                  //  Striped rows, @default true
  hoverable?: boolean;                //  Hover effect on rows  @default true
  compact?: boolean;                  //  Compact mode (smaller padding)  @default false
  bordered?: BorderStyle;             //  Border style, @default 'horizontal'
  stickyHeader?: boolean;             // Sticky header, @default true
  stickyColumns?: number;             //  Number of sticky columns from left , @default 0
  loading?: boolean;                  //  Loading state, @default false
  loadingMessage?: string;            // Loading message
  emptyMessage?: string;              // Empty message
  loadingComponent?: React.ReactNode; // Custom loading component
  emptyComponent?: React.ReactNode;   // Custom empty component

  showPagination?: boolean;                           // Show pagination controls


  onRowClick?: (row: Row<TData>) => void;             // Row click handler
  getRowClassName?: (row: Row<TData>) => string;      // Custom row class name
  showFooter?: boolean;                               // Show footer
  className?: string;                                 // Custom class name

  onCellEdit?: <TValue = any>(
    event: CellEditEvent<TData, TValue>
  ) => void | Promise<void>                           //Cell edit handler

   /** ✅ Bulk actions */
  bulkActions?: BulkAction<TData>[];                  // Bulk actions 정의
  showBulkActionsBar?: boolean;                       // Bulk actions bar 표시 여부(기본 true)  
  showClearSelection?: boolean;                       // 선택 해제 버튼 표시 여부(기본 true)  
}

// client: data는 전체, 내부에서 paginate/sort/filter
export type ClientDataGridProps<TData extends RowData> = Omit<
  SharedProps<TData>,
  'mode'
> & {
  mode: 'client'

  // server-only 금지
  totalCount?: never
  pageCount?: never
}

// server: data는 현재 페이지 slice, totalCount/pageCount 필수
export type ServerDataGridProps<TData extends RowData> = Omit<
  SharedProps<TData>,
  'mode'
> & {
  mode: 'server'

  /** 전체 row 수(권장) */
  totalCount: number
  /** totalCount가 없거나 계산이 어려우면 pageCount를 직접 줄 수도 */
  pageCount?: number

  /** server 모드에서는 table state 변경 시 외부가 data를 다시 내려줘야 하므로 handlers를 필수화 */
  onPaginationChange: NonNullable<UseDataGridOptions<TData>['onPaginationChange']>
  onSortingChange?: NonNullable<UseDataGridOptions<TData>['onSortingChange']>
  onColumnFiltersChange?: NonNullable<
    UseDataGridOptions<TData>['onColumnFiltersChange']
  >

  /** server 모드에서는 enablePagination이 사실상 true가 되는 경우가 많아서(필수는 아님) */
  enablePagination?: true
}

export type DataGridProps<TData extends RowData> =
  | ClientDataGridProps<TData>
  | ServerDataGridProps<TData>