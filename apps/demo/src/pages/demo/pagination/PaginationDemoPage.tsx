import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Rows4 } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';

import styles from './PaginationDemoPage.module.css';

type PaginationRow = {
  id: string;
  name: string;
  department: string;
  region: 'KR' | 'US' | 'EU' | 'SEA';
  status: 'Active' | 'Idle' | 'Hold';
  score: number;
};

const DEPARTMENTS = ['Sales', 'Marketing', 'Finance', 'Operations', 'R&D', 'Support'] as const;
const REGIONS: PaginationRow['region'][] = ['KR', 'US', 'EU', 'SEA'];
const STATUSES: PaginationRow['status'][] = ['Active', 'Idle', 'Hold'];

function buildRows(total: number): PaginationRow[] {
  return Array.from({ length: total }, (_, idx) => {
    const seq = idx + 1;
    return {
      id: String(seq),
      name: `User ${String(seq).padStart(4, '0')}`,
      department: DEPARTMENTS[idx % DEPARTMENTS.length] ?? 'Sales',
      region: REGIONS[idx % REGIONS.length] ?? 'KR',
      status: STATUSES[idx % STATUSES.length] ?? 'Active',
      score: 50 + (seq * 7) % 51,
    };
  });
}

const INITIAL_SIZE = 137;

export default function PaginationDemoPage(_props: PageComponentProps) {
  const [data, setData] = useState<PaginationRow[]>(() => buildRows(INITIAL_SIZE));

  const columns = useMemo<ColumnDef<PaginationRow, any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 180,
        meta: { pinned: 'left' },
      },
      {
        accessorKey: 'department',
        header: 'Department',
        size: 150,
      },
      {
        accessorKey: 'region',
        header: 'Region',
        size: 100,
        meta: { align: 'center', mono: true },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        meta: { align: 'center' },
      },
      {
        accessorKey: 'score',
        header: 'Score',
        size: 120,
        meta: { align: 'right', mono: true },
      },
    ],
    []
  );

  const replaceData = (size: number) => {
    setData(buildRows(size));
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Pagination Demo"
        description="GenGridCrud pagination validation page"
        breadcrumbItems={[
          { label: 'UI Demo', icon: <Rows4 size={16} /> },
          { label: 'Pagination Demo', icon: <Rows4 size={16} /> },
        ]}
      />

      <div className={styles.toolbar}>
        <span className={styles.label}>Seed data</span>
        <button type="button" className={styles.btn} onClick={() => replaceData(37)}>
          37 rows
        </button>
        <button type="button" className={styles.btn} onClick={() => replaceData(137)}>
          137 rows
        </button>
        <button type="button" className={styles.btn} onClick={() => replaceData(503)}>
          503 rows
        </button>
        <span className={styles.hint}>
          Check page navigation buttons and page-size selector at the bottom pager.
        </span>
      </div>

      <div className={styles.gridArea}>
        <GenGridCrud<PaginationRow>
          data={data}
          columns={columns}
          getRowId={(row) => row.id}
          onCommit={async () => ({ ok: true, nextData: data })}
          onCommitSuccess={(result) => {
            if (result.nextData) setData([...result.nextData] as PaginationRow[]);
          }}
          actionBar={{
            enabled: true,
            position: 'top',
            defaultStyle: 'text',
            includeBuiltIns: ['add', 'delete', 'save', 'reset'],
          }}
          createRow={() => {
            const nextId = String(Date.now());
            return {
              id: nextId,
              name: `User ${nextId.slice(-4)}`,
              department: 'Sales',
              region: 'KR',
              status: 'Active',
              score: 80,
            };
          }}
          gridProps={{
            height: '100%',
            dataVersion: data.length,
            rowHeight: 34,
            enableColumnSizing: true,
            enablePinning: true,
            enablePagination: true,
            pageSizeOptions: [10, 25, 50, 100],
            enableRowNumber: true,
            enableFooter: true,
            renderFooter: (table) => {
              const { pageIndex, pageSize } = table.getState().pagination ?? { pageIndex: 0, pageSize: 0 };
              return (
                <div className={styles.footerSummary}>
                  total {data.length} rows | page {pageIndex + 1}/{table.getPageCount()} | page size {pageSize}
                </div>
              );
            },
          }}
        />
      </div>
    </div>
  );
}
