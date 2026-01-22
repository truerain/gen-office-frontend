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
  /** row status ?œì‹œ ê¸°ì????¸ë??ì„œ ?œê³µ (CRUD pending ?? */
  rowStatusResolver?: (rowId: string) => 'clean' | 'created' | 'updated' | 'deleted';
  enableRowSelection?: boolean;
  enableRowNumber?: boolean;

  enablePagination?: boolean;
  pageSizeOptions?: number[];

  onDirtyChange?: (dirty: boolean) => void;               // dirty ?íƒœê°€ ë°”ë€????Œë¦¼
  onDirtyRowsChange?: (rowIds: string[]) => void;         // dirty ??ëª©ë¡??ë°”ë€????Œë¦¼  
  dirtyKeys?: string[];                                   // dirty ê³„ì‚°?ì„œ ë¹„êµ??key ?œí•œ (?†ìœ¼ë©?editable ì»¬ëŸ¼ accessorKey ê¸°ë°˜?¼ë¡œ ?ë™ ì¶”ì¶œ)

  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (next: RowSelectionState) => void;

  activeCell?: ActiveCell;
  onActiveCellChange?: (next: ActiveCell) => void;
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

    /** ?€ ?¸ì§‘ ì»¤ë°‹ ?œì ???œì •?•ížˆ ???€??ë³€ê²??´ë²¤??*/
     onCellValueChange?: (args: {
      rowId: string;
      columnId: string;
      value: unknown;
    }) => void;
  };


