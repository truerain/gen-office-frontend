// apps/demo/src/pages/customer/CustomerInfoPage/components/CustomerTable.tsx

import { useState, useEffect, useMemo } from 'react';
import { GenDataGridCrud } from '@gen-office/gen-datagrid-crud';
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

  return (
    <div className={styles.tableContainer}>
      <GenDataGridCrud<Customer>
        data={gridState.rows}
        columns={columns}
        getRowId={(row) => row.id}
        createRow={({ data }) => ({
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
        })}
        onCommit={async ({ changeSet }) => {
          await props.onCommit(changeSet);
          return { ok: true };
        }}
        onCommitSuccess={() => {
          props.onRefetch?.();
        }}
        onCommitError={({ error }) => {
          console.error(error);
          const message = resolveApiErrorMessage(error, { defaultMessage: 'Commit failed (see console)' });
          addNotification(message, 'error');
        }}
        beforeCommit={({ changes }) => {
          // 간단한 가드: 변경 건수가 너무 많으면 차단
          if (changes.length > 200) {
            addNotification('Too many changes', 'error');
            return false;
          }
          return true;
        }}
        actionBar={{
          includeBuiltIns: ['add', 'delete', 'save', 'reset'],
        }}
        dataVersion={gridState.version}
        gridProps={{
          rowHeight: 36,
          enablePinning: true,
          enableColumnSizing: true,
          enableVirtualization: true,
        }}
        onStateChange={(s) => {
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
        }}
      />
    </div>
  );
}

export default CustomerTable;
