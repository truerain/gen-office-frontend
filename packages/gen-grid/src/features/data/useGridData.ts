// packages/gen-grid/src/features/data/useGridData.ts

import * as React from 'react';
import type { GenGridProps } from '../../GenGrid.types';

/**
 * 1 isControlled :컴포넌트 모드 판별 (Controlled vs Uncontrolled)
 * 2 데이터 소스 일원화 (Single Source of Truth): data prop 또는 내부 상태
 * 3 setData 함수: 일관된 업데이트 인터페이스 제공
 */
export function useGridData<TData>(props: GenGridProps<TData>) {
  const isControlled = 'data' in props;

  const [inner, setInner] = React.useState<TData[]>(
    isControlled ? [] : props.defaultData
  );

  const data = isControlled ? props.data : inner;

  /*
      data 자체를 의존성 배열에 넣고 있습니다. 데이터가 아주 큰 경우, setData 참조값이 자주 바뀌어 하위 컴포넌트의 불필요한 리렌더링을 유발할 수 있습니다.
      해결책: 나중에 성능 최적화가 필요하다면 useReducer를 사용하여 dispatch를 넘기는 방식으로 리팩토링하면 setData의 참조값을 고정할 수 있습니다.
  */
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
