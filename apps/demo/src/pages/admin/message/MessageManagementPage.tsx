import { useMemo, useRef, useState } from 'react';
import { Languages, RefreshCcw } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import { SimpleFilterBar, type FilterField } from '@gen-office/ui';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { HttpError } from '@/shared/api/http';
import { useMessageListQuery } from '@/entities/system/message/api/message';
import type { MessageListParams } from '@/entities/system/message/model/types';
import { useAppStore } from '@/app/store/appStore';
import { useAlertDialog } from '@/shared/ui/AlertDialogProvider';

import styles from './MessageManagementPage.module.css';
import { createMessageManagementColumns } from './MessageManagementColumns';
import {
  commitMessageChanges,
  type MessageGridRow,
  toMessageRowId,
} from './MessageManagementCrud';

type MessageFilters = {
  namespace: string;
  langCd: string;
  messageCd: string;
  q: string;
};

const defaultFilters: MessageFilters = {
  namespace: '',
  langCd: '',
  messageCd: '',
  q: '',
};

const defaultCreateRow = {
  namespace: '',
  messageCd: '',
  langCd: 'ko',
  messageTxt: '',
  createdAt: '',
  updatedAt: '',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function MessageManagementPage(_props: PageComponentProps) {
  const addNotification = useAppStore((state) => state.addNotification);
  const { openAlert, openConfirm } = useAlertDialog();

  const [gridDirty, setGridDirty] = useState(false);
  const [draftFilters, setDraftFilters] = useState<MessageFilters>(defaultFilters);
  const [filters, setFilters] = useState<MessageFilters>(defaultFilters);
  const tempSeqRef = useRef(1);

  const queryParams = useMemo<MessageListParams>(
    () => ({
      namespace: filters.namespace.trim() || undefined,
      langCd: filters.langCd.trim() || undefined,
      messageCd: filters.messageCd.trim() || undefined,
      q: filters.q.trim() || undefined,
      page: 0,
      size: 200,
      sort: 'namespace asc, message_cd asc, lang_cd asc',
    }),
    [filters]
  );

  const { data: messageList = [], refetch, dataUpdatedAt } = useMessageListQuery(queryParams);
  const rows = useMemo<MessageGridRow[]>(
    () =>
      messageList.map((item) => ({
        ...item,
        _rowId: toMessageRowId(item),
      })),
    [messageList]
  );

  const columns = useMemo(() => createMessageManagementColumns(), []);

  const filterFields = useMemo<FilterField<MessageFilters>[]>(() => {
    return [
      { key: 'namespace', title: 'Namespace', type: 'text', placeholder: '', flex: 0 },
      { key: 'langCd', title: 'Language', type: 'text', placeholder: 'ko | en', flex: 0 },
      { key: 'messageCd', title: 'Message Code', type: 'text', placeholder: '', flex: 0 },
      { key: 'q', title: 'Message Text', type: 'text', placeholder: '', flex: 1 },
    ];
  }, []);

  const handleSearch = () => {
    const same =
      draftFilters.namespace.trim() === filters.namespace.trim() &&
      draftFilters.langCd.trim() === filters.langCd.trim() &&
      draftFilters.messageCd.trim() === filters.messageCd.trim() &&
      draftFilters.q.trim() === filters.q.trim();

    setFilters(draftFilters);
    if (same) void refetch();
  };

  return (
    <div className={styles.page} data-grid-dirty={gridDirty ? 'true' : 'false'}>
      <PageHeader
        title="Message Management"
        description="Manage i18n messages by namespace, code, and language."
        breadcrumbItems={[
          { label: 'System', icon: <Languages size={16} /> },
          { label: 'Message Management', icon: <Languages size={16} /> },
        ]}
      />
      <div className={styles.filter}>
        <SimpleFilterBar
          value={draftFilters}
          fields={filterFields}
          onChange={setDraftFilters}
          onSearch={handleSearch}
          searchLabel="검색"
        />
      </div>
      <div className={styles.workarea}>
        <GenGridCrud<MessageGridRow>
          title="Message List"
          data={rows}
          columns={columns}
          getRowId={(row) => row._rowId}
          createRow={() => ({
            ...defaultCreateRow,
            _rowId: `tmp:${Date.now()}:${tempSeqRef.current++}`,
          })}
          makePatch={({ columnId, value }) => ({ [columnId]: value } as Partial<MessageGridRow>)}
          deleteMode="selected"
          actionBar={{
            position: 'top',
            defaultStyle: 'icon',
            includeBuiltIns: ['add', 'delete', 'save', 'filter', 'reset'],
            customActions: [
              {
                key: 'refresh',
                label: 'Refresh',
                icon: <RefreshCcw aria-hidden size={16} />,
                side: 'right',
                style: 'icon',
                order: 20,
                onClick: () => {
                  void refetch();
                },
              },
            ],
          }}
          beforeCommit={() => openConfirm({ title: 'Do you want to save?' })}
          onCommit={async ({ changes, ctx }) => {
            await commitMessageChanges(changes, ctx.viewData);
            await refetch();
            await openAlert({ title: 'Saved successfully.' });
            return { ok: true };
          }}
          onCommitError={({ error }) => {
            console.error(error);
            if (error instanceof HttpError && error.status === 409) {
              addNotification('이미 존재하는 메시지 키입니다.', 'error');
              return;
            }
            const message = error instanceof Error ? error.message : 'Commit failed (see console).';
            addNotification(message, 'error');
          }}
          onStateChange={({ dirty }) => {
            setGridDirty(dirty);
          }}
          gridProps={{
            dataVersion: dataUpdatedAt,
            rowHeight: 34,
            overscan: 8,
            enablePinning: true,
            enableColumnSizing: true,
            enableVirtualization: true,
            enableRowStatus: true,
            checkboxSelection: true,
            editOnActiveCell: false,
            keepEditingOnNavigate: true,
            enableFooterRow: false,
            enableStickyFooterRow: true,
            enableActiveRowHighlight: true,
          }}
        />
      </div>
    </div>
  );
}
