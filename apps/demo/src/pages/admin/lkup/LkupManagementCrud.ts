import type { CrudChange, CrudRowId } from '@gen-office/gen-grid-crud';
import { LkupApi } from '@/pages/admin/lkup/api/lkup';
import type {
  LkupMaster,
  LkupMasterCreateRequest,
  LkupMasterKey,
  LkupMasterUpdateRequest,
  LkupDetail,
  LkupDetailCreateRequest,
  LkupDetailKey,
  LkupDetailUpdateRequest,
} from '@/pages/admin/lkup/model/types';

export type LkupMasterGridRow = LkupMaster & {
  _rowId: string;
};

export type LkupDetailGridRow = LkupDetail & {
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

function toLkupMasterKey(input: Partial<LkupMaster>): LkupMasterKey | null {
  const lkupClssCd = normalize(input.lkupClssCd);
  if (!lkupClssCd) return null;
  return { lkupClssCd };
}

function toLkupMasterCreateRequest(input: Partial<LkupMaster>): LkupMasterCreateRequest {
  const key = toLkupMasterKey(input);
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

function toLkupMasterUpdateRequest(input: Partial<LkupMaster>): LkupMasterUpdateRequest {
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

function toLkupDetailKey(input: Partial<LkupDetail>): LkupDetailKey | null {
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

function toLkupDetailCreateRequest(input: Partial<LkupDetail>): LkupDetailCreateRequest {
  const key = toLkupDetailKey(input);
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
  };
}

function toLkupDetailUpdateRequest(input: Partial<LkupDetail>): LkupDetailUpdateRequest {
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
  };
}

function findByRowId<T extends { _rowId: string }>(rows: readonly T[], rowId: CrudRowId) {
  const id = String(rowId);
  return rows.find((row) => row._rowId === id);
}

function isSameMasterKey(a: LkupMasterKey, b: LkupMasterKey) {
  return a.lkupClssCd === b.lkupClssCd;
}

function isSameDetailKey(a: LkupDetailKey, b: LkupDetailKey) {
  return a.lkupClssCd === b.lkupClssCd && a.lkupCd === b.lkupCd;
}

export function toLkupMasterRowId(row: Pick<LkupMaster, 'lkupClssCd'>) {
  return `master:${encodeURIComponent(normalize(row.lkupClssCd))}`;
}

export function toLkupDetailRowId(row: Pick<LkupDetail, 'lkupClssCd' | 'lkupCd'>) {
  const lkupClssCd = encodeURIComponent(normalize(row.lkupClssCd));
  const lkupCd = encodeURIComponent(normalize(row.lkupCd));
  return `detail:${lkupClssCd}|${lkupCd}`;
}

export async function commitLkupMasterChanges(
  changes: readonly CrudChange<LkupMasterGridRow>[],
  ctxRows: readonly LkupMasterGridRow[]
) {
  const created = new Map<CrudRowId, LkupMasterGridRow>();
  const updated = new Map<CrudRowId, Partial<LkupMasterGridRow>>();
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
    await LkupApi.createMaster(toLkupMasterCreateRequest(merged));
  }

  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;

    const base = findByRowId(ctxRows, rowId);
    if (!base) continue;

    const merged = { ...base, ...patch };
    const baseKey = toLkupMasterKey(base);
    const nextKey = toLkupMasterKey(merged);
    if (!baseKey || !nextKey) throw new Error('lkupClssCd is required.');

    if (!isSameMasterKey(baseKey, nextKey)) {
      throw new Error('lkupClssCd cannot be changed for existing rows.');
    }

    await LkupApi.updateMaster(baseKey, toLkupMasterUpdateRequest(merged));
  }

  for (const rowId of deleted) {
    if (created.has(rowId)) continue;
    const row = findByRowId(ctxRows, rowId);
    if (!row) continue;
    const key = toLkupMasterKey(row);
    if (!key) continue;
    if (normalizeUseYn(row.useYn ?? 'Y') === 'N') continue;
    await LkupApi.updateMaster(key, toLkupMasterUpdateRequest({ ...row, useYn: 'N' }));
  }
}

export async function commitLkupDetailChanges(
  changes: readonly CrudChange<LkupDetailGridRow>[],
  ctxRows: readonly LkupDetailGridRow[],
  selectedMasterCode: string
) {
  const lkupClssCd = normalize(selectedMasterCode);
  if (!lkupClssCd) throw new Error('Select a code class first.');

  const created = new Map<CrudRowId, LkupDetailGridRow>();
  const updated = new Map<CrudRowId, Partial<LkupDetailGridRow>>();
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
    await LkupApi.createDetail(lkupClssCd, toLkupDetailCreateRequest(merged));
  }

  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;

    const base = findByRowId(ctxRows, rowId);
    if (!base) continue;

    const merged = { ...base, ...patch };
    const baseKey = toLkupDetailKey(base);
    const nextKey = toLkupDetailKey(merged);
    if (!baseKey || !nextKey) throw new Error('lkupClssCd and lkupCd are required.');

    if (!isSameDetailKey(baseKey, nextKey)) {
      throw new Error('lkupCd cannot be changed for existing rows.');
    }

    await LkupApi.updateDetail(baseKey, toLkupDetailUpdateRequest(merged));
  }

  for (const rowId of deleted) {
    if (created.has(rowId)) continue;
    const row = findByRowId(ctxRows, rowId);
    if (!row) continue;
    const key = toLkupDetailKey(row);
    if (!key) continue;
    if (normalizeUseYn(row.useYn ?? 'Y') === 'N') continue;
    await LkupApi.updateDetail(key, toLkupDetailUpdateRequest({ ...row, useYn: 'N' }));
  }
}

export function hasMissingLkupMasterRequired(
  changes: readonly CrudChange<LkupMasterGridRow>[]
) {
  const created = new Map<CrudRowId, LkupMasterGridRow>();
  const patches = new Map<CrudRowId, Partial<LkupMasterGridRow>>();

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

export function hasMissingLkupDetailRequired(
  changes: readonly CrudChange<LkupDetailGridRow>[]
) {
  const created = new Map<CrudRowId, LkupDetailGridRow>();
  const patches = new Map<CrudRowId, Partial<LkupDetailGridRow>>();

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
