
import './index.css';

// packages/datagrid/src/index.ts
export * from './gen-grid';


// Main component
export { DataGrid } from './DataGrid';
export type { DataGridProps } from './DataGrid';

// Column components
export { ColumnHeader, ColumnCell } from './columns';
export type { ColumnHeaderProps, ColumnCellProps } from './columns';

// Pagination
export { Pagination } from './pagination';

// Hooks
export { useDataGrid, useVirtualization } from './hooks';
export type { UseDataGridOptions, UseVirtualizationOptions } from './hooks';

// Utilities
export { createSelectionColumn } from './utils/createSelectionColumn';

// Types
export type {
  DataGridColumnDef,
  DataGridColumnMeta,
  PaginationProps,
  PaginationState,
  PaginationInfo,
  Alignment,
  BorderStyle,
  PinDirection,
  SizeVariant,
  CellEditEvent,
} from './types';

// Re-export TanStack Table utilities
export { createColumnHelper } from '@tanstack/react-table';
export type {
  ColumnDef,
  Row,
  Cell,
  Header,
  Table,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';



