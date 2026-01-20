// packages/gen-grid/src/features/data/useGridData.ts

import * as React from 'react';
import type { GenGridProps } from '../../GenGrid.types';

export function useGridData<TData>(props: GenGridProps<TData>) {
  // mode는 최초 렌더 기준으로 고정 (중간 전환 금지)
  const isControlledRef = React.useRef<boolean>(props.data !== undefined);
  const isControlled = isControlledRef.current;

  const [inner, setInner] = React.useState<TData[]>(
    isControlled ? [] : (props.defaultData ?? [])
  );

  const data = isControlled ? (props.data ?? []) : inner;

  // 최신 data를 ref로 유지 (setData가 data deps를 안 가져도 되게)
  const dataRef = React.useRef<TData[]>(data);
  React.useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const onDataChangeRef = React.useRef(props.onDataChange);
  React.useEffect(() => {
    onDataChangeRef.current = props.onDataChange;
  }, [props.onDataChange]);

  const setData = React.useCallback((updater: React.SetStateAction<TData[]>) => {
    const prev = dataRef.current;
    const next =
      typeof updater === 'function'
        ? (updater as (prev: TData[]) => TData[])(prev)
        : updater;

    if (!isControlledRef.current) setInner(next);
    onDataChangeRef.current?.(next as any);

    return next;
  }, []);

  return { data, setData, isControlled };
}
