import { flexRender, type Cell, type RowData } from '@tanstack/react-table';
import { cn } from '@gen-office/utils';
import styles from './ColumnCell.module.css';

export interface ColumnCellProps<TData extends RowData> {
  cell: Cell<TData, unknown>;
  sticky?: boolean;
  stickyLeft?: number;
  className?: string;
}

export function ColumnCell<TData extends RowData>({
  cell,
  sticky = false,
  stickyLeft = 0,
  className,
}: ColumnCellProps<TData>) {
  const meta = cell.column.columnDef.meta;

  return (
    <td
      className={cn(
        styles.td,
        sticky && styles.sticky,
        meta?.cellClassName,
        className
      )}
      style={{
        width: meta?.width,
        minWidth: meta?.minWidth,
        maxWidth: meta?.maxWidth,
        textAlign: meta?.align || 'left',
        ...(sticky && { left: `${stickyLeft}px` }),
      }}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
}