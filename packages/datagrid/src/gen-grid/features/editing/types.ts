// packages/datagrid/src/gen-grid/features/editing/types.ts
export type EditCell = { rowId: string; columnId: string } | null;
export type EditCellValue = string | number | boolean | null;
export type EditCellError = string | null;