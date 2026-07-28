import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Rows4 } from 'lucide-react';

import {
  GenGridCrud,
  formatServerSortQuery,
  type ServerSortingState,
} from '@gen-office/gen-grid-crud';
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

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true });
}

function sortRows(rows: PaginationRow[], sorting: ServerSortingState): PaginationRow[] {
  if (sorting.length === 0) return rows;
  const next = [...rows];
  next.sort((left, right) => {
    for (const item of sorting) {
      const key = item.id as keyof PaginationRow;
      const cmp = compareValues(left[key], right[key]);
      if (cmp !== 0) return item.desc ? -cmp : cmp;
    }
    return 0;
  });
  return next;
}

const INITIAL_SIZE = 137;

export default function PaginationDemoPage(_props: PageComponentProps) {
  const [allRows, setAllRows] = useState<PaginationRow[]>(() => buildRows(INITIAL_SIZE));
  const [data, setData] = useState<PaginationRow[]>(() => buildRows(INITIAL_SIZE));
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });
  const [sorting, setSorting] = useState<ServerSortingState>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [lastSortQuery, setLastSortQuery] = useState('');

  const handlePaginationChange = useCallback((next: PaginationState) => {
    setPagination((prev) => {
      if (prev.pageIndex === next.pageIndex && prev.pageSize === next.pageSize) {
        return prev;
      }
      return next;
    });
  }, []);

  const handleSortingChange = useCallback((next: ServerSortingState) => {
    setSorting(next);
    setPagination((prev) => (prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }));
  }, []);

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

  const runQuery = useCallback(
    async (next: PaginationState, baseData: PaginationRow[], nextSorting: ServerSortingState) => {
      setIsFetching(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 120));
        const sorted = sortRows(baseData, nextSorting);
        const start = next.pageIndex * next.pageSize;
        const end = start + next.pageSize;
        setData(sorted.slice(start, end));
        setLastSortQuery(formatServerSortQuery(nextSorting) || '(none)');
      } finally {
        setIsFetching(false);
      }
    },
    []
  );

  useEffect(() => {
    void runQuery(pagination, allRows, sorting);
  }, [allRows, pagination.pageIndex, pagination.pageSize, sorting, runQuery]);

  const replaceData = (size: number) => {
    const nextRows = buildRows(size);
    setAllRows(nextRows);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Pagination Demo"
        description="GenGridCrud pagination + built-in server-side Sort (DnD priority)"
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
          ActionBar Sort로 서버 정렬·우선순위를 적용합니다. last sort: {lastSortQuery}
        </span>
      </div>

      <div className={styles.gridArea}>
        <GenGridCrud<PaginationRow>
          data={data}
          columns={columns}
          getRowId={(row) => row.id}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          onCommit={async () => ({ ok: true, nextData: data })}
          onCommitSuccess={(result) => {
            if (result.nextData) setData([...result.nextData] as PaginationRow[]);
          }}
          actionBar={{
            enabled: true,
            position: 'top',
            defaultStyle: 'text',
            includeBuiltIns: ['add', 'delete', 'save', 'reset', 'sort'],
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
            dataVersion: `${allRows.length}-${pagination.pageIndex}-${pagination.pageSize}-${lastSortQuery}`,
            rowHeight: 34,
            enableColumnSizing: true,
            enablePinning: true,
            enablePagination: true,
            pagination,
            onPaginationChange: handlePaginationChange,
            enableRowNumber: true,
            enableFooter: true,
            renderFooter: (table) => {
              const { pageIndex, pageSize } = table.getState().pagination ?? {
                pageIndex: 0,
                pageSize: 0,
              };
              return (
                <div className={styles.footerSummary}>
                  {isFetching ? 'loading...' : 'loaded'} | total {allRows.length} rows | page{' '}
                  {pageIndex + 1}/{table.getPageCount()} | page size {pageSize} | sort {lastSortQuery}
                </div>
              );
            },
            totalRowCount: allRows.length,
          }}
        />
      </div>
    </div>
  );
}
