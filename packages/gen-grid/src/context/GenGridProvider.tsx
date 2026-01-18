// packages/gen-grid/src/context/GenGridProvider.tsx

import * as React from 'react';
import type { Table } from '@tanstack/react-table';

import { focusGridCell } from '@/features/active-cell/cellDom';
import { ActiveCell } from '@/features/active-cell/types';

export type GenGridOptions = {
  isCellNavigable?: (rowId: string, columnId: string) => boolean;
};

type GenGridContextValue<TData> = {
  table: Table<TData>;
  options: GenGridOptions;

  activeCell: ActiveCell;
  setActiveCell: (cell: ActiveCell) => void;

  // 편의 command (필요하면 사용)
  focusCell: (cell: { rowId: string; columnId: string }) => void;
};

const GenGridContext = React.createContext<GenGridContextValue<any> | null>(null);

export function useGenGridContext<TData>() {
  const ctx = React.useContext(GenGridContext);
  if (!ctx) throw new Error('useGenGridContext must be used within <GenGridProvider>');
  return ctx as GenGridContextValue<TData>;
}

export function GenGridProvider<TData>(props: {
  table: Table<TData>;
  options?: GenGridOptions;

  /** (선택) controlled activeCell 지원 */
  activeCell?: ActiveCell;
  onActiveCellChange?: (next: ActiveCell) => void;

  children: React.ReactNode;
}) {
  const { table, children, options, activeCell: controlled, onActiveCellChange } = props;

  const [uncontrolled, setUncontrolled] = React.useState<ActiveCell>(null);
  const activeCell = controlled ?? uncontrolled;

  const setActiveCell = React.useCallback(
    (next: ActiveCell) => {
      onActiveCellChange?.(next);
      if (controlled === undefined) setUncontrolled(next);
    },
    [controlled, onActiveCellChange]
  );

  const focusCell = React.useCallback(
    (cell: { rowId: string; columnId: string }) => {
      setActiveCell(cell);
      focusGridCell(cell.rowId, cell.columnId);
    },
    [setActiveCell]
  );

  const value = React.useMemo(
    () => ({
      table,
      options: options ?? {},
      activeCell,
      setActiveCell,
      focusCell,
    }),
    [table, options, activeCell, setActiveCell, focusCell]
  );

  return <GenGridContext.Provider value={value}>{children}</GenGridContext.Provider>;
}
