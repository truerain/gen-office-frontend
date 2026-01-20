// apps/demo/src/pages/customer/CustomerInfoPage/components/CustomerTable.tsx

import { useState, useEffect, useRef, useMemo } from 'react';
import { GenGrid, type GenGridHandle } from '@gen-office/gen-grid';
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


  return (
    <div className={styles.tableContainer}>
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
    </div>
  );
  
}

export default CustomerTable;
