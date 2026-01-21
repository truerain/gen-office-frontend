// packages/gen-grid-crud/src/crud/usePendingChanges.tsx
import * as React from 'react';
import type { CrudChange, CrudRowId, PendingIndex, UseMakePatch } from './types';

export type ConflictPolicy = {
  updateOnDeleted: 'ignore' | 'revive';
  deleteOverridesUpdate: boolean;
  deleteCreated: 'remove' | 'markDeleted';
};

export type UsePendingChangesOptions<TData> = {
  initialChanges?: readonly CrudChange<TData>[];
  onChange?: (changes: readonly CrudChange<TData>[]) => void;

  createTempId?: () => CrudRowId;

  mergePatch?: (
    prev: Partial<TData> | undefined,
    next: Partial<TData>
  ) => Partial<TData>;

  conflictPolicy?: Partial<ConflictPolicy>;
};

const DEFAULT_CONFLICT: ConflictPolicy = {
  updateOnDeleted: 'ignore',
  deleteOverridesUpdate: true,
  deleteCreated: 'remove',
};

function normalizeConflictPolicy(
  input?: Partial<ConflictPolicy>
): ConflictPolicy {
  return {
    updateOnDeleted: input?.updateOnDeleted ?? DEFAULT_CONFLICT.updateOnDeleted,
    deleteOverridesUpdate:
      input?.deleteOverridesUpdate ?? DEFAULT_CONFLICT.deleteOverridesUpdate,
    deleteCreated: input?.deleteCreated ?? DEFAULT_CONFLICT.deleteCreated,
  };
}

function defaultTempId(): CrudRowId {
  return `tmp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export type PendingApi<TData> = {
  changes: readonly CrudChange<TData>[];
  pending: PendingIndex<TData>;
  dirty: boolean;

  addRow: (row: TData, opts?: { tempId?: CrudRowId }) => CrudRowId;
  updateRow: (rowId: CrudRowId, patch: Partial<TData>) => void;
  updateCell: (
    rowId: CrudRowId,
    columnId: string,
    value: unknown,
    makePatch?: UseMakePatch<TData>
  ) => void;

  deleteRowIds: (rowIds: readonly CrudRowId[]) => void;
  undeleteRowIds: (rowIds: readonly CrudRowId[]) => void;

  removeCreated: (tempId: CrudRowId) => void;

  reset: () => void;
  resetRow: (rowId: CrudRowId) => void;

  isRowDirty: (rowId: CrudRowId) => boolean;
  getRowStatus: (rowId: CrudRowId) => 'clean' | 'created' | 'updated' | 'deleted';
  getMergedPatch: (rowId: CrudRowId) => Partial<TData> | undefined;
};


function defaultMergePatch<TData>(
  prev: Partial<TData> | undefined,
  next: Partial<TData>
): Partial<TData> {
  return { ...(prev ?? {}), ...(next ?? {}) };
}


export function usePendingChanges<TData>(
  options: UsePendingChangesOptions<TData> = {}
): PendingApi<TData> {
  const {
    initialChanges = [],
    onChange,
    createTempId = defaultTempId,
    mergePatch = defaultMergePatch,
  } = options;

  const conflictPolicy = React.useMemo(
    () => normalizeConflictPolicy(options.conflictPolicy),
    [options.conflictPolicy]
  );
  
  const [pending, setPending] = React.useState<PendingIndex<TData>>(() => {
    const init: PendingIndex<TData> = {
      created: new Map(),
      updated: new Map(),
      deleted: new Set(),
      log: [],
    };
    return replayChanges(init, initialChanges, mergePatch, conflictPolicy);
  });

  React.useEffect(() => {
    onChange?.(pending.log);
  }, [pending.log, onChange]);

  const dirty =
    pending.created.size > 0 || pending.updated.size > 0 || pending.deleted.size > 0;

  const addRow = React.useCallback(
    (row: TData, opts?: { tempId?: CrudRowId }) => {
      const tempId = opts?.tempId ?? createTempId();

      setPending((prev) => {
        if (prev.created.has(tempId)) return prev;
        const next = clonePending(prev);
        next.created.set(tempId, row);
        next.deleted.delete(tempId);
        next.updated.delete(tempId);
        next.log.push({ type: 'create', row, tempId });
        return next;
      });

      return tempId;
    },
    [createTempId]
  );

  const updateRow = React.useCallback(
    (rowId: CrudRowId, patch: Partial<TData>) => {
      setPending((prev) => {
        // created row는 row 자체를 갱신
        if (prev.created.has(rowId)) {
          const next = clonePending(prev);
          const cur = next.created.get(rowId)!;
          next.created.set(rowId, { ...(cur as any), ...(patch as any) });
          next.log.push({ type: 'update', rowId, patch });
          return next;
        }

        if (prev.deleted.has(rowId)) {
          if (conflictPolicy.updateOnDeleted === 'ignore') return prev;
          const next = clonePending(prev);
          next.deleted.delete(rowId);
          next.log.push({ type: 'undelete', rowId });
          const merged = mergePatch(next.updated.get(rowId), patch);
          next.updated.set(rowId, merged);
          next.log.push({ type: 'update', rowId, patch });
          return next;
        }

        const next = clonePending(prev);
        const merged = mergePatch(next.updated.get(rowId), patch);
        next.updated.set(rowId, merged);
        next.log.push({ type: 'update', rowId, patch });
        return next;
      });
    },
    [mergePatch, conflictPolicy.updateOnDeleted]
  );

  const updateCell = React.useCallback(
    (
      rowId: CrudRowId,
      columnId: string,
      value: unknown,
      makePatch?: UseMakePatch<TData>
    ) => {
      const patch =
        makePatch?.({ rowId, columnId, value }) ??
        ({ [columnId]: value } as any);
      updateRow(rowId, patch);
    },
    [updateRow]
  );

  const deleteRowIds = React.useCallback(
    (rowIds: readonly CrudRowId[]) => {
      if (!rowIds.length) return;

      setPending((prev) => {
        let changed = false;
        const next = clonePending(prev);

        for (const rowId of rowIds) {
          // created row 삭제는 “추가 취소”가 일반적
          if (next.created.has(rowId)) {
            if (conflictPolicy.deleteCreated === 'remove') {
              next.created.delete(rowId);
              next.updated.delete(rowId);
              next.deleted.delete(rowId);
              next.log.push({ type: 'delete', rowId });
              changed = true;
              continue;
            }
            // markDeleted
            if (!next.deleted.has(rowId)) {
              next.deleted.add(rowId);
              next.log.push({ type: 'delete', rowId });
              changed = true;
            }
            continue;
          }

          if (next.deleted.has(rowId)) continue;

          next.deleted.add(rowId);
          if (conflictPolicy.deleteOverridesUpdate) next.updated.delete(rowId);
          next.log.push({ type: 'delete', rowId });
          changed = true;
        }

        return changed ? next : prev;
      });
    },
    [conflictPolicy.deleteCreated, conflictPolicy.deleteOverridesUpdate]
  );

  const undeleteRowIds = React.useCallback((rowIds: readonly CrudRowId[]) => {
    if (!rowIds.length) return;

    setPending((prev) => {
      let changed = false;
      const next = clonePending(prev);

      for (const rowId of rowIds) {
        if (!next.deleted.has(rowId)) continue;
        next.deleted.delete(rowId);
        next.log.push({ type: 'undelete', rowId });
        changed = true;
      }

      return changed ? next : prev;
    });
  }, []);

  const removeCreated = React.useCallback((tempId: CrudRowId) => {
    setPending((prev) => {
      if (!prev.created.has(tempId)) return prev;
      const next = clonePending(prev);
      next.created.delete(tempId);
      next.updated.delete(tempId);
      next.deleted.delete(tempId);
      next.log.push({ type: 'delete', rowId: tempId });
      return next;
    });
  }, []);

  const reset = React.useCallback(() => {
    setPending({
      created: new Map(),
      updated: new Map(),
      deleted: new Set(),
      log: [],
    });
  }, []);

  const resetRow = React.useCallback((rowId: CrudRowId) => {
    setPending((prev) => {
      const next = clonePending(prev);
      let changed = false;

      if (next.created.has(rowId)) {
        next.created.delete(rowId);
        next.updated.delete(rowId);
        next.deleted.delete(rowId);
        next.log.push({ type: 'delete', rowId });
        return next;
      }

      if (next.updated.delete(rowId)) changed = true;
      if (next.deleted.delete(rowId)) {
        next.log.push({ type: 'undelete', rowId });
        changed = true;
      }

      return changed ? next : prev;
    });
  }, []);

  const isRowDirty = React.useCallback(
    (rowId: CrudRowId) =>
      pending.created.has(rowId) || pending.updated.has(rowId) || pending.deleted.has(rowId),
    [pending]
  );

  const getRowStatus = React.useCallback(
    (rowId: CrudRowId) => {
      if (pending.created.has(rowId)) return pending.deleted.has(rowId) ? 'deleted' : 'created';
      if (pending.deleted.has(rowId)) return 'deleted';
      if (pending.updated.has(rowId)) return 'updated';
      return 'clean';
    },
    [pending]
  );

  const getMergedPatch = React.useCallback(
    (rowId: CrudRowId) => pending.updated.get(rowId),
    [pending]
  );

  return {
    changes: pending.log,
    pending,
    dirty,

    addRow,
    updateRow,
    updateCell,
    deleteRowIds,
    undeleteRowIds,
    removeCreated,
    reset,
    resetRow,

    isRowDirty,
    getRowStatus,
    getMergedPatch,
  };
}

// --- helpers

function clonePending<TData>(prev: PendingIndex<TData>): PendingIndex<TData> {
  return {
    created: new Map(prev.created),
    updated: new Map(prev.updated),
    deleted: new Set(prev.deleted),
    log: prev.log.slice(),
  };
}

function replayChanges<TData>(
  base: PendingIndex<TData>,
  changes: readonly CrudChange<TData>[],
  mergePatch: (prev: Partial<TData> | undefined, next: Partial<TData>) => Partial<TData>,
  conflictPolicy: ConflictPolicy
): PendingIndex<TData> {
  let cur = base;
  for (const ch of changes) cur = applyOne(cur, ch, mergePatch, conflictPolicy);
  cur.log = [...changes];
  return cur;
}

function applyOne<TData>(
  prev: PendingIndex<TData>,
  ch: CrudChange<TData>,
  mergePatch: (prev: Partial<TData> | undefined, next: Partial<TData>) => Partial<TData>,
  conflictPolicy: ConflictPolicy
): PendingIndex<TData> {
  const next = clonePending(prev);

  switch (ch.type) {
    case 'create': {
      next.created.set(ch.tempId, ch.row);
      next.deleted.delete(ch.tempId);
      next.updated.delete(ch.tempId);
      break;
    }
    case 'update': {
      if (next.created.has(ch.rowId)) {
        const row = next.created.get(ch.rowId)!;
        next.created.set(ch.rowId, { ...(row as any), ...(ch.patch as any) });
        break;
      }
      if (next.deleted.has(ch.rowId)) {
        if (conflictPolicy.updateOnDeleted === 'ignore') break;
        next.deleted.delete(ch.rowId);
      }
      next.updated.set(ch.rowId, mergePatch(next.updated.get(ch.rowId), ch.patch));
      break;
    }
    case 'delete': {
      if (next.created.has(ch.rowId)) {
        if (conflictPolicy.deleteCreated === 'remove') {
          next.created.delete(ch.rowId);
          next.updated.delete(ch.rowId);
          next.deleted.delete(ch.rowId);
          break;
        }
      }
      next.deleted.add(ch.rowId);
      if (conflictPolicy.deleteOverridesUpdate) next.updated.delete(ch.rowId);
      break;
    }
    case 'undelete': {
      next.deleted.delete(ch.rowId);
      break;
    }
  }

  return next;
}
