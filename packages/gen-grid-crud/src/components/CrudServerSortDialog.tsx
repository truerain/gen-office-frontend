// packages/gen-grid-crud/src/components/CrudServerSortDialog.tsx
// Server-side sort dialog: one column list, direction select, DnD priority.

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical } from 'lucide-react';

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SimpleDialog,
} from '@gen-office/ui';

import type { ServerSortingState } from '../GenGridCrud.types';
import type { ServerSortColumnOption } from '../features/server-sort/serverSortColumns';

import styles from './CrudServerSortDialog.module.css';

type SortDirectionValue = 'none' | 'asc' | 'desc';

function buildOrderedIds(
  columnIds: readonly string[],
  applied: ServerSortingState
): string[] {
  const remaining = new Set(columnIds);
  const ordered: string[] = [];
  for (const item of applied) {
    if (!remaining.has(item.id)) continue;
    ordered.push(item.id);
    remaining.delete(item.id);
  }
  for (const id of columnIds) {
    if (remaining.has(id)) ordered.push(id);
  }
  return ordered;
}

function toDirectionMap(
  columnIds: readonly string[],
  applied: ServerSortingState
): Record<string, SortDirectionValue> {
  const next: Record<string, SortDirectionValue> = {};
  for (const id of columnIds) next[id] = 'none';
  for (const item of applied) {
    if (!(item.id in next)) continue;
    next[item.id] = item.desc ? 'desc' : 'asc';
  }
  return next;
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item == null) return list;
  next.splice(to, 0, item);
  return next;
}

function toSortingState(
  orderedIds: readonly string[],
  directions: Record<string, SortDirectionValue>
): ServerSortingState {
  const next: ServerSortingState = [];
  for (const id of orderedIds) {
    const dir = directions[id] ?? 'none';
    if (dir === 'none') continue;
    next.push({ id, desc: dir === 'desc' });
  }
  return next;
}

export function CrudServerSortDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: readonly ServerSortColumnOption[];
  applied: ServerSortingState;
  onApply: (next: ServerSortingState) => void;
}) {
  const { open, onOpenChange, columns, applied, onApply } = props;
  const { t } = useTranslation('common');

  const columnIds = React.useMemo(() => columns.map((c) => c.id), [columns]);
  const labelById = React.useMemo(
    () => new Map(columns.map((c) => [c.id, c.label])),
    [columns]
  );

  const [orderedIds, setOrderedIds] = React.useState<string[]>(() =>
    buildOrderedIds(columnIds, applied)
  );
  const [directions, setDirections] = React.useState<Record<string, SortDirectionValue>>(() =>
    toDirectionMap(columnIds, applied)
  );
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dropIndex, setDropIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setOrderedIds(buildOrderedIds(columnIds, applied));
    setDirections(toDirectionMap(columnIds, applied));
    setDraggingId(null);
    setDropIndex(null);
  }, [open, applied, columnIds]);

  const priorityById = React.useMemo(() => {
    const map = new Map<string, number>();
    let rank = 1;
    for (const id of orderedIds) {
      if ((directions[id] ?? 'none') === 'none') continue;
      map.set(id, rank);
      rank += 1;
    }
    return map;
  }, [orderedIds, directions]);

  const selectedCount = priorityById.size;

  const labelSort = t('crud.sort', { defaultValue: 'Sort' });
  const labelNone = t('crud.sort_none', { defaultValue: 'None' });
  const labelAsc = t('crud.sort_asc', { defaultValue: 'Asc' });
  const labelDesc = t('crud.sort_desc', { defaultValue: 'Desc' });
  const labelConfirm = t('common.confirm', { defaultValue: 'Confirm' });
  const labelCancel = t('common.cancel', { defaultValue: 'Cancel' });
  const labelColumn = t('common.column', { defaultValue: 'Column' });
  const labelDirection = t('crud.sort_direction', { defaultValue: 'Direction' });
  const labelHint = t('crud.sort_priority_hint', {
    defaultValue: 'Drag selected rows to change multi-sort priority. Numbers show apply order.',
  });
  const labelEmptyColumns = t('crud.sort_no_columns', {
    defaultValue: 'No sortable columns.',
  });

  const setDirection = (columnId: string, value: SortDirectionValue) => {
    setDirections((prev) => ({ ...prev, [columnId]: value }));
  };

  const canDrag = (columnId: string) => (directions[columnId] ?? 'none') !== 'none';

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, columnId: string) => {
    if (!canDrag(columnId)) {
      event.preventDefault();
      return;
    }
    setDraggingId(columnId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', columnId);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!draggingId) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    setDropIndex(index);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, toIndex: number) => {
    event.preventDefault();
    const fromId = draggingId ?? event.dataTransfer?.getData('text/plain');
    if (!fromId || !canDrag(fromId)) {
      setDraggingId(null);
      setDropIndex(null);
      return;
    }
    setOrderedIds((prev) => {
      const fromIndex = prev.indexOf(fromId);
      if (fromIndex < 0) return prev;
      return moveItem(prev, fromIndex, toIndex);
    });
    setDraggingId(null);
    setDropIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropIndex(null);
  };

  const handleConfirm = () => {
    onApply(toSortingState(orderedIds, directions));
    onOpenChange(false);
  };

  const dialogHeight = Math.min(520, Math.max(320, 140 + columns.length * 48));

  return (
    <SimpleDialog
      open={open}
      onOpenChange={onOpenChange}
      title={labelSort}
      size="md"
      initialHeight={dialogHeight}
      minResizableHeight={280}
      footer={
        <div className={styles.footerActions}>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {labelCancel}
          </Button>
          <Button type="button" variant="brand" onClick={handleConfirm}>
            {labelConfirm}
            {selectedCount > 0 ? ` (${selectedCount})` : ''}
          </Button>
        </div>
      }
    >
      <div className={styles.body}>
        <p className={styles.hint}>{labelHint}</p>
        {columns.length === 0 ? (
          <p className={styles.empty}>{labelEmptyColumns}</p>
        ) : (
          <div className={styles.list}>
            <div className={styles.headerRow} aria-hidden>
              <span className={styles.gripSpacer} />
              <span>{labelColumn}</span>
              <span>{labelDirection}</span>
              <span className={styles.rankHeader}>#</span>
            </div>
            {orderedIds.map((columnId, index) => {
              const label = labelById.get(columnId) ?? columnId;
              const direction = directions[columnId] ?? 'none';
              const selected = direction !== 'none';
              const rank = priorityById.get(columnId);
              const isDragging = draggingId === columnId;
              const isDropTarget = dropIndex === index && draggingId !== columnId;

              return (
                <div
                  key={columnId}
                  className={[
                    styles.row,
                    selected ? styles.rowSelected : '',
                    isDragging ? styles.dragging : '',
                    isDropTarget ? styles.dropTarget : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  draggable={selected}
                  onDragStart={(event) => handleDragStart(event, columnId)}
                  onDragOver={(event) => handleDragOver(event, index)}
                  onDrop={(event) => handleDrop(event, index)}
                  onDragEnd={handleDragEnd}
                >
                  <span
                    className={[styles.grip, selected ? styles.gripActive : '']
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden
                  >
                    <GripVertical size={16} />
                  </span>
                  <span className={styles.columnLabel} title={label}>
                    {label}
                  </span>
                  <Select
                    value={direction}
                    onValueChange={(next) => setDirection(columnId, next as SortDirectionValue)}
                  >
                    <SelectTrigger
                      className={styles.selectTrigger}
                      aria-label={`${label} ${labelDirection}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{labelNone}</SelectItem>
                      <SelectItem value="asc">{labelAsc}</SelectItem>
                      <SelectItem value="desc">{labelDesc}</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className={styles.rank}>{rank ?? ''}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SimpleDialog>
  );
}
