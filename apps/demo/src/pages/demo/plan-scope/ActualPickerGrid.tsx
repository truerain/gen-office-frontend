// apps/demo/src/pages/demo/plan-scope/ActualPickerGrid.tsx
// Shared Actual grid with filters for Tab1 and member picker dialogs.

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { CrudRowId } from '@gen-office/gen-grid-crud';
import { SimpleFilterBar, type FilterField } from '@gen-office/ui';

import {
  actualFilterOptions,
  ALL_FILTER,
  defaultActualFilter,
  filterActuals,
  type ActualFilter,
  type ActualItem,
} from './planScopeModel';

import styles from './PlanScopeDemoPage.module.css';

function formatAmount(value: number) {
  return value.toLocaleString('ko-KR');
}

function createColumns(): ColumnDef<ActualItem, unknown>[] {
  return [
    {
      accessorKey: 'acctCd',
      header: '계정코드',
      size: 110,
      meta: { pinned: 'left', align: 'center' },
    },
    {
      accessorKey: 'acctName',
      header: '계정명',
      size: 140,
      meta: { pinned: 'left' },
    },
    {
      accessorKey: 'ccCd',
      header: 'CC',
      size: 100,
      meta: { align: 'center' },
    },
    {
      accessorKey: 'ccName',
      header: 'CC명',
      size: 120,
    },
    {
      accessorKey: 'deptCd',
      header: '부서코드',
      size: 100,
      meta: { align: 'center' },
    },
    {
      accessorKey: 'deptName',
      header: '부서명',
      size: 120,
    },
    {
      accessorKey: 'actualTotal',
      header: '전년실적',
      size: 120,
      cell: ({ getValue }) => formatAmount(Number(getValue()) || 0),
      meta: { align: 'right', mono: true },
    },
  ];
}

type ActualPickerGridProps = {
  actuals: readonly ActualItem[];
  height?: string;
  showFilters?: boolean;
  selection?: readonly CrudRowId[];
  onSelectionChange?: (ids: readonly CrudRowId[]) => void;
  actionBarExtra?: React.ReactNode;
};

export function ActualPickerGrid({
  actuals,
  height = '100%',
  showFilters = true,
  selection,
  onSelectionChange,
  actionBarExtra,
}: ActualPickerGridProps) {
  const [filters, setFilters] = useState<ActualFilter>(defaultActualFilter);
  const columns = useMemo(() => createColumns(), []);
  const options = useMemo(() => actualFilterOptions(actuals), [actuals]);
  const rows = useMemo(() => filterActuals(actuals, filters), [actuals, filters]);

  const filterFields = useMemo((): FilterField<ActualFilter>[] => {
    return [
      {
        key: 'keyword',
        type: 'search',
        title: '검색',
        placeholder: '계정/CC/부서',
        clearable: true,
        flex: 1,
        width: '180px',
      },
      {
        key: 'acctCd',
        type: 'select',
        title: '계정',
        placeholder: '전체',
        width: '160px',
        options: [{ label: '전체', value: ALL_FILTER }, ...options.accounts.map((item) => ({ label: item.label, value: item.value }))],
      },
      {
        key: 'ccCd',
        type: 'select',
        title: 'CC',
        placeholder: '전체',
        width: '140px',
        options: [{ label: '전체', value: ALL_FILTER }, ...options.costCenters.map((item) => ({ label: item.label, value: item.value }))],
      },
      {
        key: 'deptCd',
        type: 'select',
        title: '부서',
        placeholder: '전체',
        width: '140px',
        options: [{ label: '전체', value: ALL_FILTER }, ...options.departments.map((item) => ({ label: item.label, value: item.value }))],
      },
    ];
  }, [options.accounts, options.costCenters, options.departments]);

  return (
    <div className={styles.pickerRoot}>
      {showFilters ? (
        <div className={styles.filterBar}>
          <SimpleFilterBar
            value={filters}
            fields={filterFields}
            onChange={setFilters}
          />
          {actionBarExtra ? <div className={styles.filterMeta}>{actionBarExtra}</div> : null}
        </div>
      ) : null}
      <div className={styles.pickerGrid}>
        <GenGridCrud<ActualItem>
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          readonly
          rowSelection={selection}
          onRowSelectionChange={onSelectionChange}
          onCommit={async ({ ctx }) => ({ ok: true, nextData: ctx.viewData })}
          actionBar={{
            enabled: true,
            position: 'top',
            defaultStyle: 'text',
            showTotalRows: true,
          }}
          gridProps={{
            height,
            enableVirtualization: true,
            enablePinning: true,
            enableColumnSizing: true,
            checkboxSelection: true,
            rowHeight: 34,
          }}
        />
      </div>
    </div>
  );
}

export function useActualPickerSelection() {
  const [selection, setSelection] = useState<readonly CrudRowId[]>([]);
  return {
    selection,
    setSelection,
    clearSelection: () => setSelection([]),
  };
}
