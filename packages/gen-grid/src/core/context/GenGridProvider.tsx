// packages/gen-grid/src/core/context/GenGridProvider.tsx

import * as React from 'react';
import type { Table } from '@tanstack/react-table';

import { focusGridCell } from '../../features/active-cell/cellDom';
import { ActiveCell } from '../../features/active-cell/types';
import type { SelectedRange, SelectedRanges } from '../../features/range-selection/types';
import type { GenGridEditorFactory } from '../../GenGrid.types';

export type GenGridOptions = {
  isCellNavigable?: (rowId: string, columnId: string) => boolean;
  editorFactory?: GenGridEditorFactory<any>;
  keepEditingOnNavigate?: boolean;
  enableRangeSelection?: boolean;
};

type GenGridContextValue<TData> = {
  table: Table<TData>;
  options: GenGridOptions;

  activeCell: ActiveCell;
  setActiveCell: (cell: ActiveCell) => void;

  selectedRanges: SelectedRanges;
  setSelectedRanges: React.Dispatch<React.SetStateAction<SelectedRanges>>;
  clearSelectedRanges: () => void;
  getLastSelectedRange: () => SelectedRange | null;

  editMode: boolean;
  setEditMode: (next: boolean) => void;

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

  activeCell?: ActiveCell;
  onActiveCellChange?: (next: ActiveCell) => void;

  children: React.ReactNode;
}) {
  const { table, children, options, activeCell: controlled, onActiveCellChange } = props;

  const [uncontrolled, setUncontrolled] = React.useState<ActiveCell>(null);
  const activeCell = controlled ?? uncontrolled;

  const [selectedRanges, setSelectedRanges] = React.useState<SelectedRanges>([]);
  const clearSelectedRanges = React.useCallback(() => {
    setSelectedRanges([]);
  }, []);
  const getLastSelectedRange = React.useCallback(
    () => selectedRanges[selectedRanges.length - 1] ?? null,
    [selectedRanges]
  );

  const [editMode, setEditMode] = React.useState(false);

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
      selectedRanges,
      setSelectedRanges,
      clearSelectedRanges,
      getLastSelectedRange,
      editMode,
      setEditMode,
      focusCell,
    }),
    [
      table,
      options,
      activeCell,
      setActiveCell,
      selectedRanges,
      clearSelectedRanges,
      getLastSelectedRange,
      editMode,
      focusCell,
    ]
  );

  return <GenGridContext.Provider value={value}>{children}</GenGridContext.Provider>;
}
