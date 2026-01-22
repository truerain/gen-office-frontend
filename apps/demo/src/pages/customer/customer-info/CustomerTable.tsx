// apps/demo/src/pages/customer/CustomerInfoPage/components/CustomerTable.tsx

import { useState, useEffect, useMemo } from 'react';
import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { CrudChange } from '@gen-office/gen-grid-crud';

import type { Customer } from '../../../entities/customer/model/types';
import { createCustomerColumns } from './CustomerInfoColumns';
import { usePendingDiffTracker } from '@/shared/hooks/usePendingDiffTracker';
import type { PendingDiff } from '@/shared/models/pendingDiff';

import styles from './CustomerTable.module.css';

interface CustomerTableProps {
  rows: Customer[];
  dataVersion: number | string;
  onDiffChange: (diff: PendingDiff<Customer, string>) => void;
  onCommit: (changes: readonly CrudChange<Customer>[]) => Promise<void>;
  onRefetch?: () => void;
  loading?: boolean;
}

function CustomerTable(props: CustomerTableProps) {
  const columns = useMemo(() => createCustomerColumns(), []);

  const [gridState, setGridState] = useState(() => ({
    rows: props.rows,
    version: props.dataVersion,
  }));

  useEffect(() => {
    setGridState({ rows: props.rows, version: props.dataVersion });
  }, [props.rows, props.dataVersion]);

  const { diff } = usePendingDiffTracker<Customer, string>(
    props.rows,
    props.dataVersion,
    gridState.rows,
    {
      getRowId: (r) => r.id,
      // 서버 스키마에 포함되는 필드만 비교 (UI 전용 필드는 제외)
      isRowModified: (cur, base) =>
        cur.name !== base.name ||
        cur.email !== base.email ||
        cur.phone !== base.phone ||
        cur.company !== base.company ||
        cur.grade !== base.grade ||
        cur.status !== base.status,

      // (옵션) tempId 규칙이 있으면 new row 판정 강화 가능
      // isNewRow: (row, baselineById) => !baselineById.has(row.id) || row.id.startsWith('temp-'),
    }
  );

  // diff가 바뀌면 상위로 전달
  useEffect(() => {
    props.onDiffChange(diff);
  }, [diff, props]);

  return (
    <div className={styles.tableContainer}>
      <GenGridCrud<Customer>
        data={gridState.rows}
        columns={columns}
        getRowId={(row) => row.id}
        createRow={() => ({
          id: 'temp-0', // 임시 id (서버 저장 후 실제 id로 교체)
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
        // columnId -> patch 매핑 (accessorKey가 있으면 기본 동작으로 충분)
        makePatch={({ columnId, value }) => ({ [columnId]: value } as any)}
        deleteMode="selected"
        onCommit={async ({ changes }) => {
          await props.onCommit(changes);
          return { ok: true };
        }}
        onCommitSuccess={() => {
          props.onRefetch?.();
        }}
        onCommitError={({ error }) => {
          console.error(error);
          alert('Commit failed (see console)');
        }}
        beforeCommit={({ changes }) => {
          // 간단한 가드: 변경 건수가 너무 많으면 차단
          if (changes.length > 200) {
            alert('Too many changes');
            return false;
          }
          return true;
        }}
        showActionBar
        actionBarPosition="top"
        gridProps={{
          dataVersion: gridState.version,
          rowHeight: 36,
          overscan: 8,
          enablePinning: true,
          enableColumnSizing: true,
          enableVirtualization: true,
          enableRowStatus: true,
          enableRowSelection: true,
        }}
        onStateChange={(_) => {
          // 디버그용
          // console.log('crud state', s);
        }}
      />
    </div>
  );
}

export default CustomerTable;
