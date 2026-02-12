/**
 * @file [MenuManagementPageCrud.ts]
 * @path apps/demo/src/pages/system/menu/MenuManagementPageCrud.ts
 */

import type { CrudChange, CrudRowId } from '@gen-office/gen-grid-crud';
import type { Menu } from '@/entities/system/menu/model/types';
import { menuApi } from '@/entities/system/menu/api/menu';

const buildChildrenMap = (items: readonly Menu[]) => {
  const map = new Map<number, number[]>();
  for (const item of items) {
    const key = item.parentMenuId ?? 0;
    const list = map.get(key);
    if (list) list.push(item.menuId);
    else map.set(key, [item.menuId]);
  }
  return map;
};

export const applyMenuChanges = (prev: readonly Menu[], changes: readonly CrudChange<Menu>[]) => {
  const created = new Map<number, Menu>();
  const updated = new Map<number, Partial<Menu>>();
  const deleted = new Set<number>();

  for (const change of changes) {
    switch (change.type) {
      case 'create': {
        created.set(Number(change.tempId), change.row);
        break;
      }
      case 'update': {
        const key = Number(change.rowId);
        const createdRow = created.get(key);
        if (createdRow) {
          created.set(key, { ...createdRow, ...change.patch });
        } else {
          updated.set(key, { ...(updated.get(key) ?? {}), ...change.patch });
        }
        break;
      }
      case 'delete': {
        const key = Number(change.rowId);
        if (created.has(key)) {
          created.delete(key);
        } else {
          deleted.add(key);
        }
        break;
      }
      case 'undelete': {
        deleted.delete(Number(change.rowId));
        break;
      }
      default:
        break;
    }
  }

  let next = prev.map((row) => {
    const patch = updated.get(row.menuId);
    return patch ? { ...row, ...patch } : row;
  });

  for (const row of created.values()) {
    next = [...next, row];
  }

  if (deleted.size === 0) return next;

  const childrenMap = buildChildrenMap(next);
  const stack = Array.from(deleted);
  while (stack.length) {
    const id = stack.pop()!;
    const children = childrenMap.get(id);
    if (!children) continue;
    for (const childId of children) {
      if (deleted.has(childId)) continue;
      deleted.add(childId);
      stack.push(childId);
    }
  }

  return next.filter((row) => !deleted.has(row.menuId));
};

export const toMenuRequest = (input: Partial<Menu>) => ({
  menuId: input.menuId,
  menuName: input.menuName,
  menuNameEng: input.menuNameEng,
  menuDesc: input.menuDesc,
  menuDescEng: input.menuDescEng,
  menuLevel: input.menuLevel,
  parentMenuId: input.parentMenuId,
  execComponent: input.execComponent,
  menuIcon: input.menuIcon,
  displayYn: input.displayYn,
  useYn: input.useYn,
  sortOrder: input.sortOrder,
  attribute1: input.attribute1,
  attribute2: input.attribute2,
  attribute3: input.attribute3,
  attribute4: input.attribute4,
  attribute5: input.attribute5,
  attribute6: input.attribute6,
  attribute7: input.attribute7,
  attribute8: input.attribute8,
  attribute9: input.attribute9,
  attribute10: input.attribute10,
  createdBy: input.createdBy,
  lastUpdatedBy: input.lastUpdatedBy,
});

function findMenuById(rows: readonly Menu[], rowId: CrudRowId) {
  const id = Number(rowId);
  if (!Number.isFinite(id)) return undefined;
  return rows.find((row) => row.menuId === id);
}

export async function commitMenuChanges(
  changes: readonly CrudChange<Menu>[],
  ctxRows: readonly Menu[]
) {
  const created = new Map<CrudRowId, Menu>();
  const updated = new Map<CrudRowId, Partial<Menu>>();
  const deleted = new Set<CrudRowId>();

  for (const change of changes) {
    switch (change.type) {
      case 'create':
        created.set(change.tempId, change.row);
        break;
      case 'update':
        updated.set(change.rowId, { ...(updated.get(change.rowId) ?? {}), ...change.patch });
        break;
      case 'delete':
        deleted.add(change.rowId);
        break;
      case 'undelete':
      default:
        break;
    }
  }

  for (const [tempId, row] of created.entries()) {
    if (deleted.has(tempId)) continue;
    const patch = updated.get(tempId);
    const merged = patch ? { ...row, ...patch } : row;
    await menuApi.create(toMenuRequest(merged));
  }

  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;
    const baseRow = findMenuById(ctxRows, rowId);
    const merged = baseRow ? { ...baseRow, ...patch } : patch;
    const id = Number(rowId);
    if (!Number.isFinite(id)) continue;
    await menuApi.update(id, toMenuRequest(merged));
  }

  for (const rowId of deleted) {
    const id = Number(rowId);
    if (!Number.isFinite(id)) continue;
    await menuApi.remove(id);
  }
}

export function hasMissingMenuId(changes: readonly CrudChange<Menu>[]) {
  const created = new Map<CrudRowId, Menu>();
  const patches = new Map<CrudRowId, Partial<Menu>>();

  for (const change of changes) {
    if (change.type === 'create') {
      created.set(change.tempId, change.row);
    } else if (change.type === 'update') {
      patches.set(change.rowId, {
        ...(patches.get(change.rowId) ?? {}),
        ...change.patch,
      });
    }
  }

  return Array.from(created.entries()).some(([tempId, row]) => {
    const merged = { ...row, ...(patches.get(tempId) ?? {}) } as Menu;
    const value = merged.menuId;
    if (value == null) return true;
    if (String(value).trim() === '') return true;
    return !Number.isFinite(Number(value)) || Number(value) <= 0;
  });
}
