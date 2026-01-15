// packages/gen-grid/src/features/data/useGridData.ts

import * as React from 'react';
import type { GenGridProps } from '../../types';

export function useGridData<TData>(props: GenGridProps<TData>) {
  const isControlled = 'data' in props;

  const [inner, setInner] = React.useState<TData[]>(
    isControlled ? [] : props.defaultData
  );

  const data = isControlled ? props.data : inner;

  const setData = React.useCallback(
    (updater: React.SetStateAction<TData[]>) => {
      const next = typeof updater === 'function' ? (updater as any)(data) : updater;

      if (!isControlled) setInner(next);
      // controlled/uncontrolled 모두 onDataChange는 통지 (controlled면 부모가 실제 state 갱신)
      props.onDataChange?.(next as any);

      return next as TData[];
    },
    [data, isControlled, props]
  );

  return { data, setData, isControlled };
}
