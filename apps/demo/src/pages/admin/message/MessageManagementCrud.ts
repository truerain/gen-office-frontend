import type { CrudChange, CrudRowId } from '@gen-office/gen-grid-crud';
import { messageApi } from '@/pages/admin/message/api/message';
import type { Message, MessageCreateRequest, MessageKey } from '@/pages/admin/message/model/types';

export type MessageGridRow = Message & {
  _rowId: string;
};

function normalize(value: unknown) {
  return String(value ?? '').trim();
}

function toMessageKey(input: Partial<Message>): MessageKey | null {
  const namespace = normalize(input.namespace);
  const messageCd = normalize(input.messageCd);
  const langCd = normalize(input.langCd);
  if (!namespace || !messageCd || !langCd) return null;
  return { namespace, messageCd, langCd };
}

function toCreateRequest(input: Partial<Message>): MessageCreateRequest {
  const key = toMessageKey(input);
  if (!key) {
    throw new Error('namespace, messageCd, langCd are required.');
  }

  const messageTxt = normalize(input.messageTxt);
  if (!messageTxt) {
    throw new Error('messageTxt is required.');
  }

  if (/\s/.test(key.messageCd)) {
    throw new Error('messageCd cannot contain whitespace.');
  }

  if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(key.langCd)) {
    throw new Error('langCd must be xx or xx-YY format.');
  }

  return { ...key, messageTxt };
}

function isSameKey(a: MessageKey, b: MessageKey) {
  return a.namespace === b.namespace && a.messageCd === b.messageCd && a.langCd === b.langCd;
}

function findByRowId(rows: readonly MessageGridRow[], rowId: CrudRowId) {
  const id = String(rowId);
  return rows.find((row) => row._rowId === id);
}

export function toMessageRowId(row: Pick<Message, 'namespace' | 'messageCd' | 'langCd'>) {
  const namespace = encodeURIComponent(normalize(row.namespace));
  const messageCd = encodeURIComponent(normalize(row.messageCd));
  const langCd = encodeURIComponent(normalize(row.langCd));
  return `key:${namespace}|${messageCd}|${langCd}`;
}

export async function commitMessageChanges(
  changes: readonly CrudChange<MessageGridRow>[],
  ctxRows: readonly MessageGridRow[]
) {
  const created = new Map<CrudRowId, MessageGridRow>();
  const updated = new Map<CrudRowId, Partial<MessageGridRow>>();
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
    await messageApi.create(toCreateRequest(merged));
  }

  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;

    const base = findByRowId(ctxRows, rowId);
    if (!base) continue;

    const merged = { ...base, ...patch };
    const baseKey = toMessageKey(base);
    const nextKey = toMessageKey(merged);
    if (!baseKey || !nextKey) {
      throw new Error('namespace, messageCd, langCd are required.');
    }

    const keyChanged = !isSameKey(baseKey, nextKey);
    if (keyChanged) {
      await messageApi.create(toCreateRequest(merged));
      await messageApi.remove(baseKey);
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(patch, 'messageTxt')) {
      continue;
    }

    const messageTxt = normalize(merged.messageTxt);
    if (!messageTxt) throw new Error('messageTxt is required.');
    await messageApi.update(baseKey, { messageTxt });
  }

  for (const rowId of deleted) {
    if (created.has(rowId)) continue;
    const row = findByRowId(ctxRows, rowId);
    if (!row) continue;
    const key = toMessageKey(row);
    if (!key) continue;
    await messageApi.remove(key);
  }
}
