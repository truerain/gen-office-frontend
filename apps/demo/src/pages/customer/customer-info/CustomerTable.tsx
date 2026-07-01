// apps/demo/src/pages/customer/CustomerInfoPage/components/CustomerTable.tsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { GenDataGridCrud } from '@gen-office/gen-datagrid-crud';
import type { DataGridCrudUiState } from '@gen-office/gen-datagrid-crud';
import type { GenDataGridChangeSet } from '@gen-office/gen-datagrid';

import type { Customer } from './model/types';
import { createCustomerColumns } from './CustomerInfoColumns';
import type { PendingDiff } from '@/shared/models/pendingDiff';
import { useAppStore } from '@/app/store/appStore';
import { resolveApiErrorMessage } from '@/shared/api/errorMessage';

import styles from './CustomerTable.module.css';

interface CustomerTableProps {
  rows: Customer[];
  dataVersion: number | string;
  onDiffChange: (diff: PendingDiff<Customer, string>) => void;
  onCommit: (changeSet: GenDataGridChangeSet<Customer>) => Promise<void>;
  onRefetch?: () => void;
  loading?: boolean;
}

function CustomerTable(props: CustomerTableProps) {
  const columns = useMemo(() => createCustomerColumns(), []);
  const addNotification = useAppStore((state) => state.addNotification);

  const [gridState, setGridState] = useState(() => ({
    rows: props.rows,
    version: props.dataVersion,
  }));

  useEffect(() => {
    setGridState({ rows: props.rows, version: props.dataVersion });
  }, [props.rows, props.dataVersion]);

  const getRowId = useCallback((row: Customer) => row.id, []);

  const createRow = useCallback(
    ({ data }: { data: readonly Customer[] }): Customer => ({
      id: `temp-${data.length + 1}`, // 임시 id (서버 저장 후 실제 id로 교체)
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'PENDING',
      registeredAt: '',
      lastContactAt: '',
      totalOrders: 0,
      totalSpent: 0,
      grade: 'bronze',
    }),
    []
  );

  const handleCommit = useCallback(
    async ({ changeSet }: { changeSet: GenDataGridChangeSet<Customer> }) => {
      await props.onCommit(changeSet);
      return { ok: true };
    },
    [props.onCommit]
  );

  const handleCommitSuccess = useCallback(() => {
    props.onRefetch?.();
  }, [props.onRefetch]);

  const handleCommitError = useCallback(
    ({ error }: { error: unknown }) => {
      console.error(error);
      const message = resolveApiErrorMessage(error, { defaultMessage: 'Commit failed (see console)' });
      addNotification(message, 'error');
    },
    [addNotification]
  );

  const beforeCommit = useCallback(
    ({ changeSet }: { changeSet: GenDataGridChangeSet<Customer> }) => {
      // 간단한 가드: 변경 건수가 너무 많으면 차단
      if (changeSet.created.length + changeSet.updated.length + changeSet.deleted.length > 200) {
        addNotification('Too many changes', 'error');
        return false;
      }
      return true;
    },
    [addNotification]
  );

  const actionBar = useMemo(
    () => ({
      includeBuiltIns: ['add', 'delete', 'save', 'reset'] as const,
    }),
    []
  );

  const gridProps = useMemo(
    () => ({
      rowHeight: 36,
      enablePinning: true,
      enableColumnSizing: true,
      enableVirtualization: true,
    }),
    []
  );

  const handleStateChange = useCallback(
    (s: DataGridCrudUiState<Customer>) => {
      const dirtyRowIds = new Set(s.dirtyState.rowIds);
      const deletedRowIds = new Set(s.dirtyState.deletedRowIds);
      const createdRowIds = new Set(s.createdRowIds);
      props.onDiffChange({
        added: [...s.createdRows],
        modified: s.data.filter(
          (row) =>
            dirtyRowIds.has(row.id) &&
            !deletedRowIds.has(row.id) &&
            !createdRowIds.has(row.id)
        ),
        deleted: s.dirtyState.deletedRowIds.map((id) => ({ id })),
      });
    },
    [props.onDiffChange]
  );

  return (
    <div className={styles.tableContainer}>
      <GenDataGridCrud<Customer>
        data={gridState.rows}
        columns={columns}
        getRowId={getRowId}
        createRow={createRow}
        onCommit={handleCommit}
        onCommitSuccess={handleCommitSuccess}
        onCommitError={handleCommitError}
        beforeCommit={beforeCommit}
        actionBar={actionBar}
        dataVersion={gridState.version}
        gridProps={gridProps}
        onStateChange={handleStateChange}
      />
    </div>
  );
}

export default CustomerTable;
