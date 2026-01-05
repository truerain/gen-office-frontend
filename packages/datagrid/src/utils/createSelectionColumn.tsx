import { type ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@gen-office/ui';

/**
 * Creates a checkbox column for row selection
 * 
 * @example
 * const columns = [
 *   createSelectionColumn(),
 *   // ... other columns
 * ];
 */
export function createSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)
        }
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    meta: {
      width: 50,
      align: 'center' as const,
    },
    enableSorting: false,
    enableHiding: false,
  };
}