// packages/gen-grid/src/features/editing/types.ts

export type EditCell = { rowId: string; columnId: string } | null;
export type EditCellValue = string | number | boolean | null;
export type EditCellError = string | null;

export type Dir = 1 | -1;
export type CellCoord = { rowId: string; columnId: string };
