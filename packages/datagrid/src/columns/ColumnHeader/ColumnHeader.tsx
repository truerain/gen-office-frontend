import { flexRender, type Header, type RowData } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@gen-office/utils';
import styles from './ColumnHeader.module.css';

export interface ColumnHeaderProps<TData extends RowData> {
  header: Header<TData, unknown>;
  sticky?: boolean;
  stickyLeft?: number;
}

export function ColumnHeader<TData extends RowData>({
  header,
  sticky = false,
  stickyLeft = 0,
}: ColumnHeaderProps<TData>) {
  const canSort = header.column.getCanSort();
  const isSorted = header.column.getIsSorted();
  const meta = header.column.columnDef.meta;

  return (
    <th
      className={cn(
        styles.th,
        sticky && styles.sticky,
        canSort && styles.sortable,
        meta?.headerClassName
      )}
      style={{
        width: meta?.width,
        minWidth: meta?.minWidth,
        maxWidth: meta?.maxWidth,
        textAlign: meta?.align || 'left',
        ...(sticky && { left: `${stickyLeft}px` }),
      }}
      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
    >
      <div className={styles.content}>
        <span className={styles.text}>
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </span>

        {canSort && (
          <span className={styles.sortIcon}>
            {isSorted === 'asc' ? (
              <ArrowUp size={16} />
            ) : isSorted === 'desc' ? (
              <ArrowDown size={16} />
            ) : (
              <ChevronsUpDown size={16} />
            )}
          </span>
        )}
      </div>
    </th>
  );
}