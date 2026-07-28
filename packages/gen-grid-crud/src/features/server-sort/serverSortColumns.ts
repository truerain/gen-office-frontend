// packages/gen-grid-crud/src/features/server-sort/serverSortColumns.ts
// Helpers to collect sortable leaf columns for the server-sort dialog.

import type { ColumnDef } from '@tanstack/react-table';

import type { ServerSortItem, ServerSortingState } from '../../GenGridCrud.types';

const SYSTEM_COLUMN_IDS = new Set(['__select__', '__rowNumber__', '__row_status__']);

export type ServerSortColumnOption = {
  id: string;
  label: string;
  /** Field name for API serialization; defaults to id. */
  sortField: string;
};

function isColumnDef<TData>(value: unknown): value is ColumnDef<TData, any> {
  return Boolean(value) && typeof value === 'object';
}

function getColumnId<TData>(col: ColumnDef<TData, any>): string | null {
  if (typeof col.id === 'string' && col.id.length > 0) return col.id;
  if ('accessorKey' in col && typeof col.accessorKey === 'string' && col.accessorKey.length > 0) {
    return col.accessorKey;
  }
  return null;
}

function getColumnLabel<TData>(col: ColumnDef<TData, any>, id: string): string {
  const meta = col.meta as { label?: unknown; sortField?: unknown } | undefined;
  if (typeof meta?.label === 'string' && meta.label.length > 0) return meta.label;
  if (typeof col.header === 'string' && col.header.length > 0) return col.header;
  return id;
}

function getSortField<TData>(col: ColumnDef<TData, any>, id: string): string {
  const meta = col.meta as { sortField?: unknown } | undefined;
  if (typeof meta?.sortField === 'string' && meta.sortField.length > 0) return meta.sortField;
  return id;
}

function isServerSortable<TData>(col: ColumnDef<TData, any>): boolean {
  if (col.enableSorting === false) return false;
  const meta = col.meta as { serverSortable?: unknown } | undefined;
  if (meta?.serverSortable === false) return false;
  return true;
}

/**
 * Flatten column defs to leaf options eligible for server-side sort.
 */
export function collectServerSortColumns<TData>(
  columns: readonly ColumnDef<TData, any>[]
): ServerSortColumnOption[] {
  const result: ServerSortColumnOption[] = [];

  const walk = (defs: readonly ColumnDef<TData, any>[]) => {
    for (const col of defs) {
      if (!isColumnDef<TData>(col)) continue;
      const children = (col as ColumnDef<TData, any> & { columns?: ColumnDef<TData, any>[] })
        .columns;
      if (Array.isArray(children) && children.length > 0) {
        walk(children);
        continue;
      }
      const id = getColumnId(col);
      if (!id || SYSTEM_COLUMN_IDS.has(id)) continue;
      if (!isServerSortable(col)) continue;
      result.push({
        id,
        label: getColumnLabel(col, id),
        sortField: getSortField(col, id),
      });
    }
  };

  walk(columns);
  return result;
}

/**
 * Serialize sorting for API query params.
 * Format: `field1:asc,field2:desc` (not SQL ORDER BY).
 * Optional `columns` maps column id → meta.sortField.
 */
export function formatServerSortQuery(
  sorting: ServerSortingState,
  columns?: readonly ServerSortColumnOption[]
): string {
  const fieldById = new Map((columns ?? []).map((c) => [c.id, c.sortField]));
  return sorting
    .map((item) => {
      const field = fieldById.get(item.id) ?? item.id;
      return `${field}:${item.desc ? 'desc' : 'asc'}`;
    })
    .join(',');
}

export function cloneSorting(sorting: ServerSortingState): ServerSortItem[] {
  return sorting.map((item) => ({ id: item.id, desc: item.desc }));
}
