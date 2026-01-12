import * as React from 'react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'

// 1) 테이블 데이터 타입
type Person = {
  firstName: string
  lastName: string
  age: number
  visits: number
  status: string
  progress: number
}

// 2) 샘플 데이터(공식 예제도 이런 식으로 더미 데이터 씀) :contentReference[oaicite:1]{index=1}
const defaultData: Person[] = [
  { firstName: 'Ada', lastName: 'Lovelace', age: 36, visits: 100, status: 'single', progress: 50 },
  { firstName: 'Grace', lastName: 'Hopper', age: 85, visits: 40, status: 'complicated', progress: 80 },
  { firstName: 'Alan', lastName: 'Turing', age: 41, visits: 20, status: 'relationship', progress: 10 }
]

// 3) 컬럼 정의: accessorKey + header + cell 렌더링 :contentReference[oaicite:2]{index=2}
const columns: ColumnDef<Person>[] = [
  {
    header: 'Name',
    columns: [
      { accessorKey: 'firstName', header: 'First Name' },
      { accessorKey: 'lastName', header: 'Last Name' }
    ]
  },
  {
    header: 'Info',
    columns: [
      { accessorKey: 'age', header: 'Age' },
      { accessorKey: 'visits', header: 'Visits' },
      { accessorKey: 'status', header: 'Status' },
      { accessorKey: 'progress', header: 'Profile Progress' }
    ]
  }
]

export function CustomerMgtPage() {
  // 4) data는 state로 들고 (나중에 서버데이터로 바꿔치기 가능)
  const [data] = React.useState(() => [...defaultData])

  // 5) 핵심: useReactTable에 data/columns/getCoreRowModel을 넣어 table 인스턴스를 만든다 :contentReference[oaicite:3]{index=3}
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  })

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ margin: '0 0 12px' }}>TanStack Table - Basic</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  style={{
                    borderBottom: '1px solid #ddd',
                    padding: '8px',
                    textAlign: 'left'
                  }}
                  colSpan={header.colSpan}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  style={{
                    borderBottom: '1px solid #eee',
                    padding: '8px'
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 12, opacity: 0.7 }}>
        핵심 흐름: <code>useReactTable</code> → <code>getHeaderGroups</code> / <code>getRowModel</code> →{' '}
        <code>flexRender</code>
      </p>
    </div>
  )
}
