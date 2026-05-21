import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';

import {
  applyGridTreeExpandDeltaByRoot,
  buildGridTreeStepExpandIndex,
  type GridTreeRowAccessors,
} from '../grid-tree/gridTreeStepExpand';

export type GridTreeResetOnDataChange = 'expanded' | 'collapsed';

export type UseGridTreeStepExpandOptions<T> = GridTreeRowAccessors<T> & {
  data: T[];
  /**
   * `data`가 바뀔 때 펼침 상태를 초기화합니다.
   * - `'expanded'`(기본): 모든 부모 노드 펼침
   * - `'collapsed'`: 전부 접힘
   */
  resetOnDataChange?: GridTreeResetOnDataChange;
};

export type UseGridTreeStepExpandResult = {
  expandedRowIds: Record<string, boolean>;
  setExpandedRowIds: Dispatch<SetStateAction<Record<string, boolean>>>;
  expandOneStep: () => void;
  collapseOneStep: () => void;
};

function resolveGridTreeExpandedOnDataChange(
  resetOnDataChange: GridTreeResetOnDataChange,
  defaultExpandedRowIds: Record<string, boolean>
): Record<string, boolean> {
  return resetOnDataChange === 'collapsed' ? {} : defaultExpandedRowIds;
}

export function useGridTreeStepExpand<T>({
  data,
  getNodeId,
  getParentId,
  resetOnDataChange = 'expanded',
}: UseGridTreeStepExpandOptions<T>): UseGridTreeStepExpandResult {
  const index = useMemo(
    () => buildGridTreeStepExpandIndex(data, { getNodeId, getParentId }),
    // Accessors are row projections; only `data` should rebuild the GridTree index.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const expandedOnDataChange = useMemo(
    () => resolveGridTreeExpandedOnDataChange(resetOnDataChange, index.defaultExpandedRowIds),
    [index.defaultExpandedRowIds, resetOnDataChange]
  );

  const [expandedRowIds, setExpandedRowIds] = useState(expandedOnDataChange);

  useEffect(() => {
    setExpandedRowIds(expandedOnDataChange);
  }, [expandedOnDataChange]);

  const expandOneStep = useCallback(() => {
    setExpandedRowIds((prev) => applyGridTreeExpandDeltaByRoot(index, prev, 1));
  }, [index]);

  const collapseOneStep = useCallback(() => {
    setExpandedRowIds((prev) => applyGridTreeExpandDeltaByRoot(index, prev, -1));
  }, [index]);

  return {
    expandedRowIds,
    setExpandedRowIds,
    expandOneStep,
    collapseOneStep,
  };
}
