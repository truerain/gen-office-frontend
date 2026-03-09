/**
 * @file [MenuManagementPageCrud.ts]
 * @path apps/demo/src/pages/system/menu/MenuManagementPageCrud.ts
 */

import { prepareCommitChanges, type CrudChange, type CrudRowId } from '@gen-office/gen-grid-crud';
import type { Menu, MenuRequest } from '@/pages/admin/menu/model/types';
import { menuApi } from '@/pages/admin/menu/api/menu';

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

export const toMenuRequest = (input: Partial<Menu>): MenuRequest => ({
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
});

export function createMenuRow(parent: Pick<Menu, 'menuId' | 'menuLevel'> | null): Menu {
  return {
    menuId: 0,
    menuName: '',
    menuNameEng: '',
    menuDesc: '',
    menuDescEng: '',
    menuLevel: parent ? Number(parent.menuLevel || 0) + 1 : 1,
    parentMenuId: parent?.menuId ?? 0,
    execComponent: '',
    menuIcon: '',
    displayYn: 'Y',
    useYn: 'Y',
    sortOrder: 0,
    lastUpdatedDate: new Date().toISOString(),
    lastUpdatedBy: '',
    lastUpdatedByName: '',
  };
}

export async function commitMenuChanges(
  changes: readonly CrudChange<Menu>[],
  ctxRows: readonly Menu[]
) {
  const { creates, updates, deletes } = prepareCommitChanges(changes, {
    viewData: ctxRows,
    getRowId: (row: Menu) => row.menuId,
  });

  const createPayload: MenuRequest[] = [];
  const updatesPayload: MenuRequest[] = [];
  const deletePayload: MenuRequest[] = [];

  for (const row of creates) {
    createPayload.push(toMenuRequest(row));
  }

  for (const row of updates) {
    const id = Number(row.menuId);
    if (!Number.isFinite(id)) continue;
    updatesPayload.push(toMenuRequest(row));
  }

  for (const row of deletes) {
    const id = Number(row.menuId);
    if (!Number.isFinite(id)) continue;
    deletePayload.push(toMenuRequest(row));
  }

  await menuApi.bulkCommit({ creates: createPayload, updates: updatesPayload, deletes: deletePayload });
}

type ValidationError = {
  code: string;
  message: string;
};

type ValidationResult = {
  ok: boolean;
  errors: ValidationError[];
};

type ChangeValidationContext<T> = {
  created: ReadonlyMap<CrudRowId, T>;
  patches: ReadonlyMap<CrudRowId, Partial<T>>;
};

type ChangeValidator<T> = (ctx: ChangeValidationContext<T>) => ValidationError[];

export function validateMenuChanges(changes: readonly CrudChange<Menu>[]): ValidationResult {
  return validateChanges(changes, [validateRequiredMenuId]);
}

export function validateChanges<T>(
  changes: readonly CrudChange<T>[],
  validators: readonly ChangeValidator<T>[]
): ValidationResult {
  const created = new Map<CrudRowId, T>();
  const patches = new Map<CrudRowId, Partial<T>>();

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

  const ctx: ChangeValidationContext<T> = { created, patches };
  const errors = validators.flatMap((validator) => validator(ctx));
  return { ok: errors.length === 0, errors };
}

const validateRequiredMenuId: ChangeValidator<Menu> = ({ created, patches }) => {
  const hasMissing = Array.from(created.entries()).some(([tempId, row]) => {
    const merged = { ...row, ...(patches.get(tempId) ?? {}) } as Menu;
    const value = merged.menuId;
    if (value == null) return true;
    if (String(value).trim() === '') return true;
    return !Number.isFinite(Number(value)) || Number(value) <= 0;
  });

  if (!hasMissing) return [];
  return [{ code: 'MENU_ID_REQUIRED', message: 'Menu ID를 입력하세요.' }];
};

