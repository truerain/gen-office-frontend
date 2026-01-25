// apps/demo/src/shared/hooks/usePendingDiffTracker.ts

import * as React from 'react';
import type { PendingDiff } from '../models/pendingDiff';

type Id = string | number;

type Options<T, TId extends Id> = {
  /** row -> id */
  getRowId: (row: T) => TId;

  /**
   * row가 수정되었는지 판정하는 함수
   * - 가장 권장: 서버에 저장되는 필드만 비교
   * - "수정 여부"를 엔티티별로 외부에서 정의할 수 있게 함
   */
  isRowModified: (current: T, baseline: T) => boolean;

  /**
   * 새로 추가된 row 판단 기준
   * - 기본값: baseline에 없는 id면 added로 처리
   * - tempId 규칙이 있다면 여기서 명시 가능
   */
  isNewRow?: (row: T, baselineById: Map<TId, T>) => boolean;

  /**
   * 삭제 판단 기준
   * - 기본값: baseline에는 있는데 current에 없으면 deleted
   * - "삭제 마킹 방식"이면 여기서 구현 가능(예: row._deleted === true)
   */
  getDeletedIds?: (baselineRows: T[], currentRows: T[]) => TId[];
};

export function usePendingDiffTracker<T, TId extends Id>(
  baselineRows: T[],
  baselineVersion: string | number,
  _currentRows: T[],
  options: Options<T, TId>
) {
  const { getRowId, isRowModified, isNewRow, getDeletedIds } = options;

  const baselineByIdRef = React.useRef<Map<TId, T>>(new Map());

  const [diff, setDiff] = React.useState<PendingDiff<T, TId>>({
    added: [],
    modified: [],
    deleted: [],
  });
  //console.log(currentRows);
  // baseline 갱신(서버 refetch / filters 변경 / 저장 성공 등)
  React.useEffect(() => {
    baselineByIdRef.current = new Map(baselineRows.map((r) => [getRowId(r), r]));
    setDiff({ added: [], modified: [], deleted: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baselineVersion]);

  const recompute = React.useCallback(
    (nextCurrentRows: T[]) => {
      const baselineById = baselineByIdRef.current;

      const currentById = new Map<TId, T>();
      for (const r of nextCurrentRows) currentById.set(getRowId(r), r);

      const added: T[] = [];
      const modified: T[] = [];

      for (const row of nextCurrentRows) {
        const id = getRowId(row);
        const base = baselineById.get(id);

        const newRow = isNewRow ? isNewRow(row, baselineById) : !base;
        if (newRow) {
          added.push(row);
          continue;
        }
        if (base && isRowModified(row, base)) {
          modified.push(row);
        }
      }

      let deletedIds: TId[];
      if (getDeletedIds) {
        deletedIds = getDeletedIds(baselineRows, nextCurrentRows);
      } else {
        // 기본: baseline에만 존재하면 deleted
        deletedIds = [];
        for (const baseId of baselineById.keys()) {
          if (!currentById.has(baseId)) deletedIds.push(baseId);
        }
      }

      const deleted = deletedIds.map((id) => ({ id }));

      const next: PendingDiff<T, TId> = { added, modified, deleted };
      setDiff(next);
      return next;
    },
    [baselineRows, getRowId, getDeletedIds, isNewRow, isRowModified]
  );

  return {
    diff,
    recompute,   // currentRows 바뀔 때마다 호출하면 됨
    reset: () => setDiff({ added: [], modified: [], deleted: [] }),
  };
}
