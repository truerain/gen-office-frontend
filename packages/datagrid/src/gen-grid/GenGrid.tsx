// packages/datagrid/src/gen-grid/GenGrid.tsx
import * as React from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';

import styles from './GenGrid.module.css';

// Step2: column meta(표현 힌트) 타입
export type GenGridColumnMeta = {
  align?: 'left' | 'center' | 'right';
  mono?: boolean; // 숫자/코드 컬럼용
};


export type GenGridProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  /**
   * row 클릭/선택 같은 기능은 Step 4~에서 붙일 예정.
   * 지금은 “렌더 파이프라인”만 학습하는 단계라 최소 props만 둠.
   */
  caption?: string;
  className?: string;
};

function getMeta(columnDef: any): GenGridColumnMeta | undefined {
  return columnDef?.meta as GenGridColumnMeta | undefined;
}


export function GenGrid<TData>(props: GenGridProps<TData>) {
  const { data, columns, caption, className } = props;

  // Step 1 핵심: useReactTable + getCoreRowModel
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <table className={styles.table}>
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}

        <thead className={styles.thead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className={styles.tr}>
              {headerGroup.headers.map((header) => {
                const meta = getMeta(header.column.columnDef);
                const alignClass =
                  meta?.align === 'right'
                    ? styles.alignRight
                    : meta?.align === 'center'
                      ? styles.alignCenter
                      : styles.alignLeft;
                return (
                <th
                  key={header.id}
                   className={[styles.th, alignClass, meta?.mono ? styles.mono : '']
                      .filter(Boolean)
                      .join(' ')}
                  colSpan={header.colSpan}
                  scope="col"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
                );
              })}
            </tr>
          ))}
        </thead>

        <tbody className={styles.tbody}>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={styles.tr}>
              {row.getVisibleCells().map((cell) => {
                const meta = getMeta(cell.column.columnDef);
                const alignClass =
                  meta?.align === 'right'
                    ? styles.alignRight
                    : meta?.align === 'center'
                      ? styles.alignCenter
                      : styles.alignLeft;

                return (
                <td 
                  key={cell.id} 
                  className={[styles.td, alignClass, meta?.mono ? styles.mono : '']
                      .filter(Boolean)
                      .join(' ')}
                  >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
