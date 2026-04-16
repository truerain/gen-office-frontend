// packages/gen-grid/src/components/layout/GenGridHeader.tsx

import * as React from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import { FilterCellPopover } from '../../features/filtering/FilterCellPopover';
import { getCellStyle } from './cellStyles';
import { ROW_STATUS_COLUMN_ID } from '../../features/row-status/rowStatus';
import { SELECTION_COLUMN_ID } from '../../features/row-selection/rowSelection';
import { ROW_NUMBER_COLUMN_ID } from '../../features/row-number/useRowNumberColumn';

import styles from './GenGridHeader.module.css';
import pinning from './GenGridPinning.module.css';

const groupVisibilityStateCache = new Map<string, Record<string, boolean>>();

type GenGridHeaderProps<TData> = {
  table: Table<TData>;

  enablePinning?: boolean;
  enableColumnSizing?: boolean;
  enableColumnReorder?: boolean;
  enableFiltering?: boolean;

  onAutoSizeColumn?: (columnId: string) => void;
  renderFilterCell?: (header: any) => React.ReactNode;
};

export function GenGridHeader<TData>(props: GenGridHeaderProps<TData>) {
  const {
    table,
    enablePinning,
    enableColumnSizing,
    enableColumnReorder,
    enableFiltering,
    onAutoSizeColumn,
    renderFilterCell,
  } = props;

  const headerGroups = table.getHeaderGroups();
  const leafHeaderGroup = headerGroups[headerGroups.length - 1];
  const totalHeaderRows = headerGroups.length;
  const renderedLeafColumnIds = new Set<string>();
  const systemColumnIds = React.useMemo(
    () =>
      new Set<string>([
        ROW_STATUS_COLUMN_ID,
        SELECTION_COLUMN_ID,
        ROW_NUMBER_COLUMN_ID,
        '__row_number__',
      ]),
    []
  );
  const [draggingColumnId, setDraggingColumnId] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<{
    columnId: string;
    side: 'before' | 'after';
    blocked: boolean;
  } | null>(null);
  const initializedGroupVisibilityColumnsRef = React.useRef<Set<string>>(new Set());
  const groupVisibilityCacheKey = React.useMemo(() => {
    const routeKey = typeof window === 'undefined' ? 'server' : window.location.pathname;
    const leafColumnKey = table.getAllLeafColumns().map((column) => column.id).join('|');
    return `${routeKey}::${leafColumnKey}`;
  }, [headerGroups, table]);

  const resolveZone = React.useCallback((columnId: string): 'left' | 'center' | 'right' => {
    const pinned = table.getColumn(columnId)?.getIsPinned?.();
    if (pinned === 'left') return 'left';
    if (pinned === 'right') return 'right';
    return 'center';
  }, [table]);

  const canReorderPair = React.useCallback((sourceId: string, targetId: string): boolean => {
    if (sourceId === targetId) return false;
    if (systemColumnIds.has(sourceId) || systemColumnIds.has(targetId)) return false;
    return resolveZone(sourceId) === resolveZone(targetId);
  }, [resolveZone, systemColumnIds]);

  const moveColumnOrder = React.useCallback(
    (currentOrder: string[], sourceId: string, targetId: string, side: 'before' | 'after') => {
      const allIds = table.getAllLeafColumns().map((column) => column.id);
      const allIdSet = new Set(allIds);
      const seen = new Set<string>();
      const normalized = [...currentOrder, ...allIds].filter((id) => {
        if (!allIdSet.has(id)) return false;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      if (!canReorderPair(sourceId, targetId)) return normalized;
      const targetIndexInNormalized = normalized.indexOf(targetId);
      const sourceIndexInNormalized = normalized.indexOf(sourceId);
      if (targetIndexInNormalized < 0 || sourceIndexInNormalized < 0) return normalized;

      const withoutSource = normalized.filter((id) => id !== sourceId);
      const targetIndex = withoutSource.indexOf(targetId);
      if (targetIndex < 0) return normalized;

      const insertIndex = side === 'before' ? targetIndex : targetIndex + 1;
      withoutSource.splice(insertIndex, 0, sourceId);
      return withoutSource;
    },
    [canReorderPair, table]
  );

  const clearDragState = React.useCallback(() => {
    setDraggingColumnId(null);
    setDropTarget(null);
  }, []);

  React.useEffect(() => {
    const handleGlobalDragEnd = () => {
      clearDragState();
    };
    window.addEventListener('dragend', handleGlobalDragEnd, true);
    return () => {
      window.removeEventListener('dragend', handleGlobalDragEnd, true);
    };
  }, [clearDragState]);

  const getHeaderPinning = (header: any): { side?: 'left' | 'right'; offset?: number } => {
    if (!enablePinning) return {};

    const leafHeaders: any[] = typeof header.getLeafHeaders === 'function' ? header.getLeafHeaders() : [];
    const headersToResolve = leafHeaders.length > 0 ? leafHeaders : [header];
    const leafColumns = headersToResolve
      .map((leafHeader) => leafHeader?.column)
      .filter((column): column is NonNullable<typeof column> => Boolean(column));
    if (leafColumns.length === 0) return {};

    const pinnedSides = leafColumns.map((column) => column.getIsPinned?.());
    if (
      pinnedSides.length !== leafColumns.length ||
      pinnedSides.some((side) => side !== 'left' && side !== 'right')
    ) {
      return {};
    }

    const side = pinnedSides[0] as 'left' | 'right';
    if (!pinnedSides.every((value) => value === side)) return {};

    const offsets = leafColumns.map((column) =>
      side === 'left' ? column.getStart('left') : column.getAfter('right')
    );
    if (offsets.length === 0) return {};

    return { side, offset: Math.min(...offsets) };
  };

  const getHeaderCellStyle = (header: any, pinningInfo: { side?: 'left' | 'right'; offset?: number }) => {
    const col = header.column;
    const baseStyle = getCellStyle(col, {
      enablePinning,
      enableColumnSizing,
      isHeader: true,
    });
    const stickyPinStyle =
      pinningInfo.side && pinningInfo.offset != null
        ? ({
            position: 'sticky',
            zIndex: 'calc(var(--grid-z-header) + 3)',
            [pinningInfo.side]: pinningInfo.offset,
          } as React.CSSProperties)
        : undefined;
    const mergedBaseStyle = {
      ...(baseStyle ?? {}),
      ...(stickyPinStyle ?? {}),
    } as React.CSSProperties;

    if (!enableColumnSizing || header.colSpan <= 1) {
      return mergedBaseStyle;
    }

    const leafHeaders: any[] = typeof header.getLeafHeaders === 'function' ? header.getLeafHeaders() : [];
    if (!leafHeaders.length) return mergedBaseStyle;

    const width = leafHeaders.reduce((sum, leafHeader) => sum + (leafHeader?.column?.getSize?.() ?? 0), 0);
    if (!Number.isFinite(width) || width <= 0) return mergedBaseStyle;

    return {
      ...mergedBaseStyle,
      width,
      minWidth: width,
    } as React.CSSProperties;
  };

  const resolveGroupVisibilityToggleConfig = (header: any) => {
    const meta = header?.column?.columnDef?.meta as
      | {
          groupVisibilityToggle?: {
            columnIds?: string[];
            defaultExpanded?: boolean;
            expandLabel?: React.ReactNode;
            collapseLabel?: React.ReactNode;
            ariaLabel?: string;
          };
        }
      | undefined;
    const config = meta?.groupVisibilityToggle;
    if (!config) return null;

    const configuredColumnIds =
      Array.isArray(config.columnIds) && config.columnIds.length > 0 ? config.columnIds : null;
    const fallbackColumnIds: string[] =
      configuredColumnIds == null
        ? ((typeof header.column?.getLeafColumns === 'function'
            ? header.column.getLeafColumns()
            : []) as any[])
            .map((leafColumn) => leafColumn?.id)
            .filter((columnId): columnId is string => typeof columnId === 'string')
            .slice(1)
        : [];
    const targetColumnIds = configuredColumnIds ?? fallbackColumnIds;
    if (targetColumnIds.length === 0) return null;

    const targetColumns = targetColumnIds
      .map((columnId) => table.getColumn(columnId))
      .filter((column): column is NonNullable<typeof column> => Boolean(column));
    if (targetColumns.length === 0) return null;

    return {
      config,
      targetColumns,
    };
  };

  const getGroupVisibilityToggle = (header: any) => {
    const resolved = resolveGroupVisibilityToggleConfig(header);
    if (!resolved) return null;
    const { config, targetColumns } = resolved;
    const isExpanded = targetColumns.every((column) => column.getIsVisible());
    return {
      isExpanded,
      expandLabel: config.expandLabel ?? '+',
      collapseLabel: config.collapseLabel ?? '-',
      ariaLabel: config.ariaLabel ?? 'Toggle grouped columns',
      onToggle: (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const nextVisible = !isExpanded;
        const cached = groupVisibilityStateCache.get(groupVisibilityCacheKey) ?? {};
        const nextCache = { ...cached };
        table.setColumnVisibility((prev) => {
          const next = { ...prev };
          targetColumns.forEach((column) => {
            next[column.id] = nextVisible;
            nextCache[column.id] = nextVisible;
          });
          return next;
        });
        groupVisibilityStateCache.set(groupVisibilityCacheKey, nextCache);
      },
    };
  };

  React.useEffect(() => {
    const patch: Record<string, boolean> = {};
    const initialized = initializedGroupVisibilityColumnsRef.current;
    const cached = groupVisibilityStateCache.get(groupVisibilityCacheKey) ?? {};
    const nextCache = { ...cached };

    for (const hg of headerGroups) {
      for (const header of hg.headers) {
        const resolved = resolveGroupVisibilityToggleConfig(header);
        if (!resolved) continue;

        const defaultExpanded = resolved.config.defaultExpanded;
        if (typeof defaultExpanded !== 'boolean') continue;

        for (const column of resolved.targetColumns) {
          if (initialized.has(column.id)) continue;

          const cachedVisibility = cached[column.id];
          if (typeof cachedVisibility === 'boolean') {
            patch[column.id] = cachedVisibility;
            initialized.add(column.id);
            continue;
          }

          const current = table.getState().columnVisibility?.[column.id];
          if (typeof current === 'boolean') {
            nextCache[column.id] = current;
            initialized.add(column.id);
            continue;
          }
          patch[column.id] = defaultExpanded;
          nextCache[column.id] = defaultExpanded;
          initialized.add(column.id);
        }
      }
    }

    groupVisibilityStateCache.set(groupVisibilityCacheKey, nextCache);

    const keys = Object.keys(patch);
    if (keys.length === 0) return;

    table.setColumnVisibility((prev) => ({
      ...prev,
      ...patch,
    }));
  }, [groupVisibilityCacheKey, headerGroups, table]);

  React.useEffect(() => {
    const cached = groupVisibilityStateCache.get(groupVisibilityCacheKey) ?? {};
    const nextCache = { ...cached };
    let changed = false;

    for (const hg of headerGroups) {
      for (const header of hg.headers) {
        const resolved = resolveGroupVisibilityToggleConfig(header);
        if (!resolved) continue;
        for (const column of resolved.targetColumns) {
          const current = table.getState().columnVisibility?.[column.id];
          if (typeof current !== 'boolean') continue;
          if (nextCache[column.id] === current) continue;
          nextCache[column.id] = current;
          changed = true;
        }
      }
    }

    if (changed) {
      groupVisibilityStateCache.set(groupVisibilityCacheKey, nextCache);
    }
  }, [groupVisibilityCacheKey, headerGroups, table]);

  return (
    <thead className={styles.thead}>
      {headerGroups.map((hg, idx) => (
        <tr
          key={hg.id}
          className={[styles.tr, styles.headerRow, styles[`headerRow${idx}` as any]].filter(Boolean).join(' ')}
        >
          {hg.headers.map((header) => {
            const col = header.column;
            const subHeaders: any[] = Array.isArray((header as any).subHeaders) ? (header as any).subHeaders : [];
            const headerPinning = getHeaderPinning(header);
            const hasParentColumn = Boolean((col as any).parent);
            const isStandaloneLeafPlaceholder =
              header.isPlaceholder && !hasParentColumn && header.colSpan === 1;
            const isLeafHeader = subHeaders.length === 0 || isStandaloneLeafPlaceholder;

            if (header.isPlaceholder && !isStandaloneLeafPlaceholder) return null;
            if (isLeafHeader) {
              if (renderedLeafColumnIds.has(col.id)) return null;
              renderedLeafColumnIds.add(col.id);
            }

            const resizing = col.getIsResizing?.() ?? false;
            const isSelectCol = header.column.id === '__select__';
            const canSort = col.getCanSort();
            const sortState = col.getIsSorted();
            const rowSpan = isLeafHeader ? Math.max(1, totalHeaderRows - idx) : 1;
            const groupToggle = getGroupVisibilityToggle(header);
            const columnId = col.id;
            const reorderEnabledForCell =
              Boolean(enableColumnReorder) &&
              isLeafHeader &&
              header.colSpan === 1 &&
              !systemColumnIds.has(columnId);
            const isDragging = draggingColumnId === columnId;
            const isDropTarget = dropTarget?.columnId === columnId;
            const isDropBefore = isDropTarget && dropTarget?.side === 'before';
            const isDropAfter = isDropTarget && dropTarget?.side === 'after';
            const isDropBlocked = isDropTarget && Boolean(dropTarget?.blocked);

            return (
              <th
                key={header.id}
                className={[
                  styles.th,
                  isSelectCol ? styles.selectCol : '',
                  canSort ? styles.sortable : '',
                  sortState ? styles.sorted : '',
                  reorderEnabledForCell ? styles.reorderable : '',
                  isDragging ? styles.dragging : '',
                  isDropBefore ? styles.dropBefore : '',
                  isDropAfter ? styles.dropAfter : '',
                  isDropBlocked ? styles.dropBlocked : '',
                  headerPinning.side ? pinning.pinned : '',
                  headerPinning.side === 'left' ? pinning.pinnedLeft : '',
                  headerPinning.side === 'right' ? pinning.pinnedRight : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={getHeaderCellStyle(header, headerPinning)}
                colSpan={header.colSpan}
                rowSpan={rowSpan > 1 ? rowSpan : undefined}
                aria-grabbed={reorderEnabledForCell ? isDragging : undefined}
                onDragOver={(event) => {
                  if (!enableColumnReorder) return;
                  if (!draggingColumnId) return;
                  if (!isLeafHeader || header.colSpan !== 1) return;

                  const rect = event.currentTarget.getBoundingClientRect();
                  const side: 'before' | 'after' =
                    event.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
                  const blocked = !canReorderPair(draggingColumnId, columnId);
                  event.preventDefault();
                  if (event.dataTransfer) {
                    event.dataTransfer.dropEffect = blocked ? 'none' : 'move';
                  }
                  setDropTarget((prev) => {
                    if (
                      prev?.columnId === columnId &&
                      prev.side === side &&
                      prev.blocked === blocked
                    ) {
                      return prev;
                    }
                    return { columnId, side, blocked };
                  });
                }}
                onDragLeave={(event) => {
                  const next = event.relatedTarget as Node | null;
                  if (next && event.currentTarget.contains(next)) return;
                  setDropTarget((prev) => (prev?.columnId === columnId ? null : prev));
                }}
                onDrop={(event) => {
                  if (!enableColumnReorder) return;
                  if (!draggingColumnId) return;
                  event.preventDefault();

                  const rect = event.currentTarget.getBoundingClientRect();
                  const side: 'before' | 'after' =
                    event.clientX < rect.left + rect.width / 2 ? 'before' : 'after';
                  const blocked = !canReorderPair(draggingColumnId, columnId);
                  if (blocked) {
                    clearDragState();
                    return;
                  }

                  table.setColumnOrder((currentOrder) =>
                    moveColumnOrder(
                      currentOrder ?? [],
                      draggingColumnId,
                      columnId,
                      side
                    )
                  );
                  clearDragState();
                }}
                onDragEnd={clearDragState}
              >
                <div className={styles.thInner} onClick={canSort ? col.getToggleSortingHandler() : undefined}>
                  {reorderEnabledForCell ? (
                    <button
                      type="button"
                      className={styles.dragHandle}
                      draggable
                      aria-label="Reorder column"
                      onClick={(e) => e.stopPropagation()}
                      onDragStart={(event) => {
                        setDraggingColumnId(columnId);
                        setDropTarget(null);
                        event.stopPropagation();
                        if (event.dataTransfer) {
                          event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer.setData('text/plain', columnId);
                        }
                      }}
                    >
                      ⋮⋮
                    </button>
                  ) : null}
                  {flexRender(col.columnDef.header, header.getContext())}
                  {groupToggle ? (
                    <button
                      type="button"
                      className={styles.groupToggleButton}
                      aria-label={groupToggle.ariaLabel}
                      aria-expanded={groupToggle.isExpanded}
                      onClick={groupToggle.onToggle}
                    >
                      {groupToggle.isExpanded ? groupToggle.collapseLabel : groupToggle.expandLabel}
                    </button>
                  ) : null}
                  {sortState ? <span className={styles.sortIcon}>{sortState === 'asc' ? '^' : 'v'}</span> : null}
                </div>

                {enableColumnSizing && header.colSpan === 1 && header.getResizeHandler ? (
                  <div
                    className={[pinning.resizer, resizing ? pinning.resizerActive : ''].filter(Boolean).join(' ')}
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onAutoSizeColumn?.(col.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : null}
              </th>
            );
          })}
        </tr>
      ))}

      {enableFiltering && renderFilterCell ? (
        <tr
          className={[
            styles.tr,
            styles.headerRow,
            styles.filterRow,
            styles[`headerRow${headerGroups.length}` as any],
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {leafHeaderGroup.headers.map((header) => {
            const isSelectCol = header.column.id === '__select__';
            const colDef: any = header.column.columnDef;
            const hasAccessorKey = !!colDef.accessorKey;
            const col = header.column;
            const pinned = col.getIsPinned();
            const canFilter = header.column.getCanFilter() && hasAccessorKey && !isSelectCol;
            return (
              <th
                key={header.id}
                className={[
                  styles.th,
                  styles.columnFilter,
                  pinned ? pinning.pinned : '',
                  pinned === 'left' ? pinning.pinnedLeft : '',
                  pinned === 'right' ? pinning.pinnedRight : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={getCellStyle(col, {
                  enablePinning,
                  enableColumnSizing,
                  isHeader: true,
                })}
              >
                {canFilter ? <FilterCellPopover header={header} /> : null}
              </th>
            );
          })}
        </tr>
      ) : null}
    </thead>
  );
}
