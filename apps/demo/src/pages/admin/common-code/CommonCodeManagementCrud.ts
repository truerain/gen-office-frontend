import type { CrudChange, CrudRowId } from '@gen-office/gen-grid-crud';
import { commonCodeApi } from '@/entities/system/common-code/api/commonCode';
import type {
  CommonCodeClass,
  CommonCodeClassCreateRequest,
  CommonCodeClassKey,
  CommonCodeClassUpdateRequest,
  CommonCodeItem,
  CommonCodeItemCreateRequest,
  CommonCodeItemKey,
  CommonCodeItemUpdateRequest,
} from '@/entities/system/common-code/model/types';

export type CommonCodeClassGridRow = CommonCodeClass & {
  _rowId: string;
};

export type CommonCodeItemGridRow = CommonCodeItem & {
  _rowId: string;
};

function normalize(value: unknown) {
  return String(value ?? '').trim();
}

function normalizeNullable(value: unknown) {
  const v = normalize(value);
  return v === '' ? null : v;
}

function normalizeUseYn(value: unknown) {
  const v = normalize(value).toUpperCase();
  if (v !== 'Y' && v !== 'N') throw new Error('useYn must be Y or N.');
  return v;
}

function validateNoWhitespace(value: string, field: string) {
  if (/\s/.test(value)) {
    throw new Error(`${field} cannot contain whitespace.`);
  }
}

function validateUppercaseCode(value: string, field: string) {
  if (!/^[A-Z0-9_]+$/.test(value)) {
    throw new Error(`${field} must contain only uppercase letters, numbers, and underscore.`);
  }
}

function toCommonCodeClassKey(input: Partial<CommonCodeClass>): CommonCodeClassKey | null {
  const lkupClssCd = normalize(input.lkupClssCd);
  if (!lkupClssCd) return null;
  return { lkupClssCd };
}

function toCommonCodeClassCreateRequest(input: Partial<CommonCodeClass>): CommonCodeClassCreateRequest {
  const key = toCommonCodeClassKey(input);
  if (!key) throw new Error('lkupClssCd is required.');
  validateNoWhitespace(key.lkupClssCd, 'lkupClssCd');
  validateUppercaseCode(key.lkupClssCd, 'lkupClssCd');

  const lkupClssName = normalize(input.lkupClssName);
  if (!lkupClssName) throw new Error('lkupClssName is required.');

  return {
    lkupClssCd: key.lkupClssCd,
    lkupClssName,
    lkupClssDesc: normalizeNullable(input.lkupClssDesc),
    useYn: normalizeUseYn(input.useYn ?? 'Y'),
    attribute1: normalizeNullable(input.attribute1),
    attribute2: normalizeNullable(input.attribute2),
    attribute3: normalizeNullable(input.attribute3),
    attribute4: normalizeNullable(input.attribute4),
    attribute5: normalizeNullable(input.attribute5),
    attribute6: normalizeNullable(input.attribute6),
    attribute7: normalizeNullable(input.attribute7),
    attribute8: normalizeNullable(input.attribute8),
    attribute9: normalizeNullable(input.attribute9),
    attribute10: normalizeNullable(input.attribute10),
  };
}

function toCommonCodeClassUpdateRequest(input: Partial<CommonCodeClass>): CommonCodeClassUpdateRequest {
  const lkupClssName = normalize(input.lkupClssName);
  if (!lkupClssName) throw new Error('lkupClssName is required.');

  return {
    lkupClssName,
    lkupClssDesc: normalizeNullable(input.lkupClssDesc),
    useYn: normalizeUseYn(input.useYn ?? 'Y'),
    attribute1: normalizeNullable(input.attribute1),
    attribute2: normalizeNullable(input.attribute2),
    attribute3: normalizeNullable(input.attribute3),
    attribute4: normalizeNullable(input.attribute4),
    attribute5: normalizeNullable(input.attribute5),
    attribute6: normalizeNullable(input.attribute6),
    attribute7: normalizeNullable(input.attribute7),
    attribute8: normalizeNullable(input.attribute8),
    attribute9: normalizeNullable(input.attribute9),
    attribute10: normalizeNullable(input.attribute10),
  };
}

function toCommonCodeItemKey(input: Partial<CommonCodeItem>): CommonCodeItemKey | null {
  const lkupClssCd = normalize(input.lkupClssCd);
  const lkupCd = normalize(input.lkupCd);
  if (!lkupClssCd || !lkupCd) return null;
  return { lkupClssCd, lkupCd };
}

function normalizeSortOrder(value: unknown) {
  const v = normalize(value);
  if (!v) return null;
  const num = Number(v);
  if (!Number.isFinite(num) || num < 0) throw new Error('sortOrder must be a non-negative number.');
  return Math.trunc(num);
}

function toCommonCodeItemCreateRequest(input: Partial<CommonCodeItem>): CommonCodeItemCreateRequest {
  const key = toCommonCodeItemKey(input);
  if (!key) throw new Error('lkupClssCd and lkupCd are required.');
  validateNoWhitespace(key.lkupClssCd, 'lkupClssCd');
  validateNoWhitespace(key.lkupCd, 'lkupCd');
  validateUppercaseCode(key.lkupClssCd, 'lkupClssCd');
  validateUppercaseCode(key.lkupCd, 'lkupCd');

  const lkupName = normalize(input.lkupName);
  if (!lkupName) throw new Error('lkupName is required.');

  return {
    lkupCd: key.lkupCd,
    lkupName,
    lkupNameEng: normalizeNullable(input.lkupNameEng),
    sortOrder: normalizeSortOrder(input.sortOrder),
    useYn: normalizeUseYn(input.useYn ?? 'Y'),
    attribute1: normalizeNullable(input.attribute1),
    attribute2: normalizeNullable(input.attribute2),
    attribute3: normalizeNullable(input.attribute3),
    attribute4: normalizeNullable(input.attribute4),
    attribute5: normalizeNullable(input.attribute5),
    attribute6: normalizeNullable(input.attribute6),
    attribute7: normalizeNullable(input.attribute7),
    attribute8: normalizeNullable(input.attribute8),
    attribute9: normalizeNullable(input.attribute9),
    attribute10: normalizeNullable(input.attribute10),
    attribute11: normalizeNullable(input.attribute11),
    attribute12: normalizeNullable(input.attribute12),
    attribute13: normalizeNullable(input.attribute13),
    attribute14: normalizeNullable(input.attribute14),
    attribute15: normalizeNullable(input.attribute15),
    attribute16: normalizeNullable(input.attribute16),
    attribute17: normalizeNullable(input.attribute17),
    attribute18: normalizeNullable(input.attribute18),
    attribute19: normalizeNullable(input.attribute19),
    attribute20: normalizeNullable(input.attribute20),
  };
}

function toCommonCodeItemUpdateRequest(input: Partial<CommonCodeItem>): CommonCodeItemUpdateRequest {
  const lkupName = normalize(input.lkupName);
  if (!lkupName) throw new Error('lkupName is required.');

  return {
    lkupName,
    lkupNameEng: normalizeNullable(input.lkupNameEng),
    sortOrder: normalizeSortOrder(input.sortOrder),
    useYn: normalizeUseYn(input.useYn ?? 'Y'),
    attribute1: normalizeNullable(input.attribute1),
    attribute2: normalizeNullable(input.attribute2),
    attribute3: normalizeNullable(input.attribute3),
    attribute4: normalizeNullable(input.attribute4),
    attribute5: normalizeNullable(input.attribute5),
    attribute6: normalizeNullable(input.attribute6),
    attribute7: normalizeNullable(input.attribute7),
    attribute8: normalizeNullable(input.attribute8),
    attribute9: normalizeNullable(input.attribute9),
    attribute10: normalizeNullable(input.attribute10),
    attribute11: normalizeNullable(input.attribute11),
    attribute12: normalizeNullable(input.attribute12),
    attribute13: normalizeNullable(input.attribute13),
    attribute14: normalizeNullable(input.attribute14),
    attribute15: normalizeNullable(input.attribute15),
    attribute16: normalizeNullable(input.attribute16),
    attribute17: normalizeNullable(input.attribute17),
    attribute18: normalizeNullable(input.attribute18),
    attribute19: normalizeNullable(input.attribute19),
    attribute20: normalizeNullable(input.attribute20),
  };
}

function findByRowId<T extends { _rowId: string }>(rows: readonly T[], rowId: CrudRowId) {
  const id = String(rowId);
  return rows.find((row) => row._rowId === id);
}

function isSameClassKey(a: CommonCodeClassKey, b: CommonCodeClassKey) {
  return a.lkupClssCd === b.lkupClssCd;
}

function isSameItemKey(a: CommonCodeItemKey, b: CommonCodeItemKey) {
  return a.lkupClssCd === b.lkupClssCd && a.lkupCd === b.lkupCd;
}

export function toCommonCodeClassRowId(row: Pick<CommonCodeClass, 'lkupClssCd'>) {
  return `class:${encodeURIComponent(normalize(row.lkupClssCd))}`;
}

export function toCommonCodeItemRowId(row: Pick<CommonCodeItem, 'lkupClssCd' | 'lkupCd'>) {
  const lkupClssCd = encodeURIComponent(normalize(row.lkupClssCd));
  const lkupCd = encodeURIComponent(normalize(row.lkupCd));
  return `item:${lkupClssCd}|${lkupCd}`;
}

export async function commitCommonCodeClassChanges(
  changes: readonly CrudChange<CommonCodeClassGridRow>[],
  ctxRows: readonly CommonCodeClassGridRow[]
) {
  const created = new Map<CrudRowId, CommonCodeClassGridRow>();
  const updated = new Map<CrudRowId, Partial<CommonCodeClassGridRow>>();
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
    await commonCodeApi.createClass(toCommonCodeClassCreateRequest(merged));
  }

  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;

    const base = findByRowId(ctxRows, rowId);
    if (!base) continue;

    const merged = { ...base, ...patch };
    const baseKey = toCommonCodeClassKey(base);
    const nextKey = toCommonCodeClassKey(merged);
    if (!baseKey || !nextKey) throw new Error('lkupClssCd is required.');

    if (!isSameClassKey(baseKey, nextKey)) {
      throw new Error('lkupClssCd cannot be changed for existing rows.');
    }

    await commonCodeApi.updateClass(baseKey, toCommonCodeClassUpdateRequest(merged));
  }

  for (const rowId of deleted) {
    if (created.has(rowId)) continue;
    const row = findByRowId(ctxRows, rowId);
    if (!row) continue;
    const key = toCommonCodeClassKey(row);
    if (!key) continue;
    if (normalizeUseYn(row.useYn ?? 'Y') === 'N') continue;
    await commonCodeApi.updateClass(key, toCommonCodeClassUpdateRequest({ ...row, useYn: 'N' }));
  }
}

export async function commitCommonCodeItemChanges(
  changes: readonly CrudChange<CommonCodeItemGridRow>[],
  ctxRows: readonly CommonCodeItemGridRow[],
  selectedClassCode: string
) {
  const lkupClssCd = normalize(selectedClassCode);
  if (!lkupClssCd) throw new Error('Select a code class first.');

  const created = new Map<CrudRowId, CommonCodeItemGridRow>();
  const updated = new Map<CrudRowId, Partial<CommonCodeItemGridRow>>();
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
    const merged = { ...(patch ? { ...row, ...patch } : row), lkupClssCd };
    await commonCodeApi.createItem(lkupClssCd, toCommonCodeItemCreateRequest(merged));
  }

  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;

    const base = findByRowId(ctxRows, rowId);
    if (!base) continue;

    const merged = { ...base, ...patch };
    const baseKey = toCommonCodeItemKey(base);
    const nextKey = toCommonCodeItemKey(merged);
    if (!baseKey || !nextKey) throw new Error('lkupClssCd and lkupCd are required.');

    if (!isSameItemKey(baseKey, nextKey)) {
      throw new Error('lkupCd cannot be changed for existing rows.');
    }

    await commonCodeApi.updateItem(baseKey, toCommonCodeItemUpdateRequest(merged));
  }

  for (const rowId of deleted) {
    if (created.has(rowId)) continue;
    const row = findByRowId(ctxRows, rowId);
    if (!row) continue;
    const key = toCommonCodeItemKey(row);
    if (!key) continue;
    if (normalizeUseYn(row.useYn ?? 'Y') === 'N') continue;
    await commonCodeApi.updateItem(key, toCommonCodeItemUpdateRequest({ ...row, useYn: 'N' }));
  }
}

export function hasMissingCommonCodeClassRequired(
  changes: readonly CrudChange<CommonCodeClassGridRow>[]
) {
  const created = new Map<CrudRowId, CommonCodeClassGridRow>();
  const patches = new Map<CrudRowId, Partial<CommonCodeClassGridRow>>();

  for (const change of changes) {
    if (change.type === 'create') {
      created.set(change.tempId, change.row);
      continue;
    }
    if (change.type === 'update') {
      patches.set(change.rowId, { ...(patches.get(change.rowId) ?? {}), ...change.patch });
    }
  }

  return Array.from(created.entries()).some(([tempId, row]) => {
    const merged = { ...row, ...(patches.get(tempId) ?? {}) };
    return !normalize(merged.lkupClssCd) || !normalize(merged.lkupClssName);
  });
}

export function hasMissingCommonCodeItemRequired(
  changes: readonly CrudChange<CommonCodeItemGridRow>[]
) {
  const created = new Map<CrudRowId, CommonCodeItemGridRow>();
  const patches = new Map<CrudRowId, Partial<CommonCodeItemGridRow>>();

  for (const change of changes) {
    if (change.type === 'create') {
      created.set(change.tempId, change.row);
      continue;
    }
    if (change.type === 'update') {
      patches.set(change.rowId, { ...(patches.get(change.rowId) ?? {}), ...change.patch });
    }
  }

  return Array.from(created.entries()).some(([tempId, row]) => {
    const merged = { ...row, ...(patches.get(tempId) ?? {}) };
    return !normalize(merged.lkupCd) || !normalize(merged.lkupName);
  });
}
