import type { ColumnDef } from '@tanstack/react-table';

export function findLeafColumnDef<TData>(
  columns: readonly ColumnDef<TData, any>[],
  columnId: string
): ColumnDef<TData, any> | undefined {
  for (const column of columns) {
    const def = column as ColumnDef<TData, any> & { columns?: ColumnDef<TData, any>[] };
    const nested = def.columns;
    if (Array.isArray(nested) && nested.length > 0) {
      const found = findLeafColumnDef(nested, columnId);
      if (found) return found;
    }
    const id = String(def.id ?? (def as { accessorKey?: string }).accessorKey ?? '');
    if (id && id === columnId) return column;
  }
  return undefined;
}
