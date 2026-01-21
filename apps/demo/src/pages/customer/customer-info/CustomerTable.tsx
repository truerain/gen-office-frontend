// apps/demo/src/pages/customer/CustomerInfoPage/components/CustomerTable.tsx

import { useState, useEffect, useRef, useMemo } from 'react';
import { GenGrid, type GenGridHandle } from '@gen-office/gen-grid';
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
  loading?: boolean;
}

function CustomerTable(props: CustomerTableProps) {
  const gridRef = useRef<GenGridHandle<Customer>>(null);
  const columns = useMemo(() => createCustomerColumns(), []);
/*
  const handleCellEdit = (event: CellEditEvent<Customer>) => {
    console.log('Cell edited:', event);
    // TODO: API 호출하여 서버에 데이터 업데이트
    // await updateCustomer(event.row.id, { [event.columnId]: event.newValue });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>검색 결과가 없습니다.</p>
      </div>
    );
  }
*/
  const [gridState, setGridState] = useState(() => ({
    rows: props.rows,
    version: props.dataVersion,
  }));

  useEffect(() => {
    setGridState({ rows: props.rows, version: props.dataVersion });
  }, [props.rows, props.dataVersion]);

  const { diff, recompute } = usePendingDiffTracker<Customer, string>(
    props.rows,
    props.dataVersion,
    gridState.rows,
    {
      getRowId: (r) => r.id,
      // ✅ 서버 저장 대상 필드만 비교 (UI-only 필드 제외)
      isRowModified: (cur, base) =>
        cur.name !== base.name ||
        cur.email !== base.email ||
        cur.phone !== base.phone ||
        cur.company !== base.company ||
        cur.grade !== base.grade ||
        cur.status !== base.status,

      // (선택) tempId 규칙이 있으면 new row 판정 강화 가능
      // isNewRow: (row, baselineById) => !baselineById.has(row.id) || row.id.startsWith('temp-'),
    }
  );
  
  // diff가 바뀌면 메인에 푸시
  useEffect(() => {
    props.onDiffChange(diff);
  }, [diff, props]);

  function applyChangesLocally(base: readonly Customer[], changes: readonly CrudChange<Customer>[]) {
  // 매우 단순한 “로컬 커밋” 구현 (테스트용)
  /*
  const byId = new Map<number, Customer>(base.map((r) => [r.id, r]));
  let maxId = Math.max(0, ...base.map((r) => r.id));

  for (const ch of changes) {
    if (ch.type === 'create') {
      // createRow가 temp id를 만들기 때문에, 실제 저장에서는 서버가 id를 부여한다고 가정.
      // 여기선 로컬 테스트를 위해 새 id를 만들어서 추가.
      maxId += 1;
      const row = { ...ch.row, id: maxId };
      byId.set(row.id, row);
      continue;
    }
    if (ch.type === 'update') {
      const cur = byId.get(ch.rowId as number);
      if (!cur) continue;
      byId.set(ch.rowId as number, { ...cur, ...ch.patch });
      continue;
    }
    if (ch.type === 'delete') {
      byId.delete(ch.rowId as number);
      continue;
    }
    if (ch.type === 'undelete') {
      // 테스트용에선 무시
      continue;
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.id - b.id);
  */
}

  return (
    <div className={styles.tableContainer}>
        <GenGridCrud<Customer>
          data={gridState.rows}
          dataVersion={gridState.version}
          columns={columns}
          getRowId={(row) => row.id}
          createRow={() => ({
            id: 0,              // 서버에서 부여된다고 가정 (로컬 커밋에서 새 id로 교체)
            name:  '',
            email:  '',
            phone: '',
            company: '',
            status: 'PENDING',
            registeredAt:  '',
            lastContactAt: '',
            totalOrders: 0,
            totalSpent: 0,
            grade: 'bronze',
          })}
          // columnId -> patch 매핑 (accessorKey가 곧 field면 기본 동작으로도 충분)
          makePatch={({ columnId, value }) => ({ [columnId]: value } as any)}
          deleteMode="selected"
          onCommit={async ({ changes }) => {
            // ✅ 테스트: 서버 대신 로컬 반영
            const next = applyChangesLocally(data, changes);
            setData(next);
            return { ok: true, nextData: next };
          }}
          onCommitError={({ error }) => {
            console.error(error);
            alert('Commit failed (see console)');
          }}
          beforeCommit={({ changes }) => {
            // 간단한 가드: 변경이 너무 많으면 막기
            if (changes.length > 200) {
              alert('Too many changes');
              return false;
            }
            return true;
          }}
          showActionBar
          actionBarPosition="top"
          gridProps={{
            pageMode: 'client',
            rowHeight: 36,
            overscan: 8,
            enablePinning: true,
            enableColumnSizing: true,
            enableVirtualization: true,
            enableRowStatus: true,
            enableRowSelection: true,
          }}
          onStateChange={(s) => {
            // 테스트/디버그용
            // console.log('crud state', s);
          }}
        />
      {/**
        <GenGrid<Customer>
          ref={gridRef}
          caption="고객정보관리"
          //data={data}
          defaultData={gridState.rows}
          dataVersion={gridState.version}
          columns={columns}
          getRowId={(row) => row.id}
          onDataChange={(nextData) => {
            setGridState((s) => ({ ...s, rows: nextData }));
            recompute(nextData); // ✅ 여기 한 줄이 포인트
          }}
          onDirtyChange={(dirty) => {console.log('isDirty:', dirty) }}
          //onDataChange={(nextData) => console.log(nextData)}
          //onDirtyChange={setIsDirty}
          // enableColumnSizing        // (기본값: true)
          enablePinning
          enableRowStatus
          enableRowSelection
          enableRowNumber
          //enableFiltering
          enableVirtualization
          overscan={12}
        />
         */}
    </div>
  );
  
}

export default CustomerTable;
