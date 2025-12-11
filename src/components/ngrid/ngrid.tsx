// NGrid.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef as TanStackColumnDef,
} from '@tanstack/react-table';
import { Checkbox } from 'antd';
import type { NGridProps, ColumnDef } from './types';
import { EditableCell } from './EditableCell';
import { StatusCell } from './StatusCell';
import { CheckboxCell } from './CheckboxCell';

// 우리 ColumnDef를 TanStack ColumnDef로 변환
function convertColumns<T>(
  columns: ColumnDef<T>[],
  data: T[],
  rowKey: keyof T,
  onCellEdit: (rowKey: string | number, columnId: string, newValue: any) => void
): TanStackColumnDef<T>[] {
  return columns.map(col => ({
    id: col.id,
    accessorFn: typeof col.accessor === 'function'
      ? col.accessor
      : (row: T) => row[col.accessor as keyof T],
    header: col.header,
    size: col.width,
    cell: (props) => {
      const value = props.getValue();
      const row = props.row.original;
      const key = row[rowKey] as string | number;

      const isEditable = typeof col.editable === 'function'
        ? col.editable(row)
        : col.editable ?? false;

      return (
        <EditableCell
          value={value}
          rowKey={key}
          columnId={col.id}
          editable={isEditable}
          onSave={onCellEdit}
        />
      );
    },
  }));
}

export function NGrid<T>({
  columns,
  data,
  rowKey,
  onEdit,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  trackChanges = false,
  headerHeight = 48,
  rowHeight = 48,
  height,
}: NGridProps<T>) {
  const [tableData, setTableData] = useState(data);
  const [modifiedRows, setModifiedRows] = useState<Set<string | number>>(new Set());
  const [internalSelectedRows, setInternalSelectedRows] = useState<Set<string | number>>(
    new Set(selectedRows)
  );
  const headerRef = useRef<HTMLTableSectionElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // selectedRows prop이 변경되면 내부 상태 업데이트
  useEffect(() => {
    setInternalSelectedRows(new Set(selectedRows));
  }, [selectedRows]);

  // 가로 스크롤 동기화
  useEffect(() => {
    const bodyElement = bodyRef.current;
    if (!bodyElement || !headerRef.current) return;

    const handleScroll = () => {
      if (headerRef.current) {
        headerRef.current.style.transform = `translateX(-${bodyElement.scrollLeft}px)`;
      }
    };

    bodyElement.addEventListener('scroll', handleScroll);
    return () => bodyElement.removeEventListener('scroll', handleScroll);
  }, []);

  // cell 편집 핸들러
  const handleCellEdit = (rowKeyValue: string | number, columnId: string, newValue: any) => {
    setTableData(prevData =>
      prevData.map(row => {
        if (row[rowKey] === rowKeyValue) {
          const column = columns.find(col => col.id === columnId);
          if (column && typeof column.accessor === 'string') {
            return { ...row, [column.accessor]: newValue };
          }
        }
        return row;
      })
    );

    if (trackChanges) {
      setModifiedRows(prev => new Set(prev).add(rowKeyValue));
    }

    onEdit?.(rowKeyValue, columnId, newValue);
  };

  // 개별 체크박스 토글
  const handleRowSelect = (rowKeyValue: string | number, checked: boolean) => {
    const newSelected = new Set(internalSelectedRows);
    if (checked) {
      newSelected.add(rowKeyValue);
    } else {
      newSelected.delete(rowKeyValue);
    }
    setInternalSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  // 전체 선택 토글
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allKeys = tableData.map(row => row[rowKey] as string | number);
      setInternalSelectedRows(new Set(allKeys));
      onSelectionChange?.(allKeys);
    } else {
      setInternalSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  // 시스템 컬럼 생성
  const systemColumns: TanStackColumnDef<T>[] = [];

  if (trackChanges) {
    systemColumns.push({
      id: '__status',
      header: '',
      size: 50,
      cell: (props) => {
        const key = props.row.original[rowKey] as string | number;
        return <StatusCell isModified={modifiedRows.has(key)} />;
      },
    });
  }

  if (selectable) {
    const allRowKeys = tableData.map(row => row[rowKey] as string | number);
    const isAllSelected = allRowKeys.length > 0 &&
      allRowKeys.every(key => internalSelectedRows.has(key));
    const isSomeSelected = allRowKeys.some(key => internalSelectedRows.has(key));

    systemColumns.push({
      id: '__checkbox',
      header: () => (
        <Checkbox
          checked={isAllSelected}
          indeterminate={isSomeSelected && !isAllSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      size: 50,
      cell: (props) => {
        const key = props.row.original[rowKey] as string | number;
        return (
          <CheckboxCell
            checked={internalSelectedRows.has(key)}
            onChange={(checked) => handleRowSelect(key, checked)}
          />
        );
      },
    });
  }

  // TanStack Table 초기화
  const table = useReactTable({
    data: tableData,
    columns: [
      ...systemColumns,
      ...convertColumns(columns, tableData, rowKey, handleCellEdit),
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;

  return (
    <div style={{ border: '1px solid #f0f0f0', position: 'relative' }}>
      {/* Header */}
      <div style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead ref={headerRef}>
            {headerGroups.map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    style={{
                      padding: '0 16px',
                      height: `${headerHeight}px`,
                      borderBottom: '2px solid #f0f0f0',
                      backgroundColor: '#fafafa',
                      fontWeight: 600,
                      textAlign: header.id.startsWith('__') ? 'center' : 'left',
                      width: header.getSize(),
                      boxSizing: 'border-box',
                      verticalAlign: 'middle',
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        </table>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        style={{
          overflow: height ? 'auto' : 'visible',
          height: height ? `${height - headerHeight}px` : 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <tbody>
            {rows.map(row => (
              <tr
                key={row.original[rowKey] as string}
                style={{
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: internalSelectedRows.has(row.original[rowKey] as string | number)
                    ? '#e6f7ff'
                    : 'transparent',
                }}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    style={{
                      padding: '0 16px',
                      height: `${rowHeight}px`,
                      textAlign: cell.column.id.startsWith('__') ? 'center' : 'left',
                      width: cell.column.getSize(),
                      boxSizing: 'border-box',
                      verticalAlign: 'middle',
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}