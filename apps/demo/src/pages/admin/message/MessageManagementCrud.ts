import { prepareCommitChanges, type CrudChange } from '@gen-office/gen-grid-crud';
import { messageApi } from '@/pages/admin/message/api/message';
import type { Message, MessageRequest, MessageKey } from '@/pages/admin/message/model/types';

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

function validateMessageRow(input: Partial<Message>): string | null {
  const key = toMessageKey(input);
  if (!key) return 'namespace, messageCd, langCd are required.';

  const messageTxt = normalize(input.messageTxt);
  if (!messageTxt) return 'messageTxt is required.';

  if (/\s/.test(key.messageCd)) return 'messageCd cannot contain whitespace.';
  if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(key.langCd)) return 'langCd must be xx or xx-YY format.';

  return null;
}

export function toMessageRowId(row: Pick<Message, 'namespace' | 'messageCd' | 'langCd'>) {
  const namespace = encodeURIComponent(normalize(row.namespace));
  const messageCd = encodeURIComponent(normalize(row.messageCd));
  const langCd = encodeURIComponent(normalize(row.langCd));
  return `key:${namespace}|${messageCd}|${langCd}`;
}

export function getMessageCommitValidationError(
  changes: readonly CrudChange<MessageGridRow>[],
  ctxRows: readonly MessageGridRow[]
): string | null {
  const { creates, updates } = prepareCommitChanges(changes, {
    viewData: ctxRows,
    getRowId: (row: MessageGridRow) => row._rowId,
  });

  for (const row of creates) {
    const error = validateMessageRow(row);
    if (error) return error;
  }

  for (const row of updates) {
    const error = validateMessageRow(row);
    if (error) return error;
  }

  return null;
}

export async function commitMessageChanges(
  changes: readonly CrudChange<MessageGridRow>[],
  ctxRows: readonly MessageGridRow[]
) {
  const { creates, updates, deletes } = prepareCommitChanges(changes, {
    viewData: ctxRows,
    getRowId: (row: MessageGridRow) => row._rowId,
  });

  const createsPayload: MessageRequest[] = creates.map((row) => ({
    namespace: normalize(row.namespace),
    messageCd: normalize(row.messageCd),
    langCd: normalize(row.langCd),
    messageTxt: normalize(row.messageTxt),
  }));

  const updatesPayload: MessageRequest[] = updates.map((row) => ({
    namespace: normalize(row.namespace),
    messageCd: normalize(row.messageCd),
    langCd: normalize(row.langCd),
    messageTxt: normalize(row.messageTxt),
  }));

  const deletesPayload: MessageKey[] = deletes.flatMap((row) => {
    const key = toMessageKey(row);
    return key ? [key] : [];
  });

  await messageApi.bulkCommit({
    creates: createsPayload,
    updates: updatesPayload,
    deletes: deletesPayload,
  });
}
