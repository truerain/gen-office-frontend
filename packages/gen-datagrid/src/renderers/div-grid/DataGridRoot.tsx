// packages/gen-datagrid/src/renderers/div-grid/DataGridRoot.tsx
// Composes the baseline div-based DataGrid root, header, and body.

import * as React from 'react';

import type { GenDataGridProps } from '../../GenDataGrid.types';
import { focusCellInRoot } from '../../core/dom/cellDom';
import {
  getFirstActiveCell,
  isActiveCellNavigationKey,
  resolveNextActiveCell,
} from '../../features/active-cell/navigation';
import { DataGridBody } from './DataGridBody';
import { DataGridHeader } from './DataGridHeader';
import { buildGridTemplateColumns, getColumnId } from './gridTemplate';

type DataGridRootProps<TData> = GenDataGridProps<TData> & {
  rootRef: React.ForwardedRef<HTMLDivElement>;
};

export function DataGridRoot<TData>(props: DataGridRootProps<TData>) {
  const {
    rootRef: forwardedRootRef,
    data,
    defaultData,
    columns,
    getRowId,
    gridId,
    getGridId,
    activeCell: controlledActiveCell,
    defaultActiveCell,
    onActiveCellChange,
    className,
    style,
    rowHeight = 36,
    getRowHeight,
    headerHeight = 40,
  } = props;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const reactId = React.useId();
  const resolvedGridId = React.useMemo(
    () => gridId ?? getGridId?.() ?? `gen-datagrid-${reactId.replace(/:/g, '')}`,
    [getGridId, gridId, reactId]
  );
  const rows = data ?? defaultData ?? [];
  const rowIds = React.useMemo(() => rows.map((row, index) => getRowId(row, index)), [getRowId, rows]);
  const columnIds = React.useMemo(
    () => columns.map((column, index) => getColumnId(column, index)),
    [columns]
  );
  const gridTemplateColumns = buildGridTemplateColumns(columns);
  const [uncontrolledActiveCell, setUncontrolledActiveCell] = React.useState(
    () => defaultActiveCell ?? getFirstActiveCell(rowIds, columnIds)
  );
  const activeCell =
    controlledActiveCell !== undefined ? controlledActiveCell : uncontrolledActiveCell;

  const setActiveCell = React.useCallback(
    (next: Exclude<typeof activeCell, null>) => {
      if (controlledActiveCell === undefined) {
        setUncontrolledActiveCell(next);
      }
      onActiveCellChange?.(next);
    },
    [controlledActiveCell, onActiveCellChange]
  );

  React.useEffect(() => {
    if (controlledActiveCell !== undefined) return;
    if (activeCell) {
      const rowExists = rowIds.includes(activeCell.rowId);
      const columnExists = columnIds.includes(activeCell.columnId);
      if (rowExists && columnExists) return;
    }
    setUncontrolledActiveCell(getFirstActiveCell(rowIds, columnIds));
  }, [activeCell, columnIds, controlledActiveCell, rowIds]);

  React.useEffect(() => {
    if (!activeCell) return;
    const frame = requestAnimationFrame(() => {
      focusCellInRoot(rootRef.current, activeCell);
    });
    return () => cancelAnimationFrame(frame);
  }, [activeCell]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isActiveCellNavigationKey(event.key)) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest('input,select,textarea,button,[contenteditable="true"]')) {
        return;
      }

      const next = resolveNextActiveCell({
        activeCell,
        rowIds,
        columnIds,
        key: event.key,
        wholeGrid: event.ctrlKey || event.metaKey,
      });
      if (!next) return;

      event.preventDefault();
      setActiveCell(next);
    },
    [activeCell, columnIds, rowIds, setActiveCell]
  );

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof forwardedRootRef === 'function') {
          forwardedRootRef(node);
        } else if (forwardedRootRef) {
          forwardedRootRef.current = node;
        }
      }}
      role="grid"
      data-gen-datagrid-root="true"
      data-grid-id={resolvedGridId}
      aria-rowcount={rows.length}
      aria-colcount={columns.length}
      className={['gen-datagrid', className].filter(Boolean).join(' ')}
      style={{
        ['--gen-datagrid-row-height' as string]: `${rowHeight}px`,
        ['--gen-datagrid-header-height' as string]: `${headerHeight}px`,
        ...style,
      }}
      onKeyDown={handleKeyDown}
    >
      <DataGridHeader columns={columns} gridTemplateColumns={gridTemplateColumns} />
      <DataGridBody
        data={rows}
        columns={columns}
        gridTemplateColumns={gridTemplateColumns}
        getRowId={getRowId}
        rowHeight={rowHeight}
        getRowHeight={getRowHeight}
        activeCell={activeCell}
        onActiveCellChange={setActiveCell}
      />
    </div>
  );
}
