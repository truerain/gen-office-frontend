import * as React from 'react';

export function useGridDataUncontrolled<TData>(args: {
  defaultData: TData[];
  onDataChange?: (next: TData[]) => void;
}) {
  const { defaultData, onDataChange } = args;

  const [data, setData] = React.useState<TData[]>(defaultData);

  const setDataAndNotify = React.useCallback(
    (updater: React.SetStateAction<TData[]>) => {
      setData((prev) => {
        const next = typeof updater === 'function' ? (updater as any)(prev) : updater;
        onDataChange?.(next);
        return next;
      });
    },
    [onDataChange]
  );

  return { data, setData: setDataAndNotify };
}
