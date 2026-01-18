// packages/datagrid/src/gen-grid/features/pinning/useColumnPinningState.ts

import * as React from 'react';
import type { ColumnPinningState } from '@tanstack/react-table';
import { uniqKeepOrder } from './pinningState';

export function useColumnPinningState(initialPinning: ColumnPinningState) {
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(
    () => initialPinning
  );

  // ✅ columns/system/user pinned가 바뀌었을 때:
  // - 기존 사용자 핀 상태는 유지하고
  // - 새로 요구되는 initialPinning은 포함되게 merge
  React.useEffect(() => {
    setColumnPinning((prev) => ({
      left: uniqKeepOrder([...(initialPinning.left ?? []), ...(prev.left ?? [])]),
      right: uniqKeepOrder([...(prev.right ?? []), ...(initialPinning.right ?? [])]),
    }));
  }, [initialPinning.left, initialPinning.right]); // 배열 값 기준으로만 트리거

  return { columnPinning, setColumnPinning };
}
