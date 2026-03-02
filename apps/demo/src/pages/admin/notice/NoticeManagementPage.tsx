import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  RefreshCcw,
} from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { CrudRowId, GenGridCrudProps } from '@gen-office/gen-grid-crud';
import { SplitLayout } from '@gen-office/ui';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { noticeApi, useNoticeDetailQuery, useNoticeListQuery } from '@/pages/admin/notice/api/notice';
import type { Notice, NoticeListParams, NoticeRequest } from '@/pages/admin/notice/model/types';
import { useAppStore } from '@/app/store/appStore';
import { useAlertDialog } from '@/shared/ui/AlertDialogProvider';

import styles from './NoticeManagementPage.module.css';
import { createNoticeManagementColumns } from './NoticeManagementColumns';
import { commitNoticeChanges } from './NoticeManagementCrud';
import { NoticeDraftPanel, type NoticeDraft } from './NoticeDraftPanel';

const createDefaultDraft = (): NoticeDraft => ({
  title: '',
  content: '',
  fileSetId: '',
  dispStartDate: '',
  dispEndDate: '',
  popupYn: 'Y',
  useYn: 'Y',
  readCount: 0,
});

function parseNoticeId(rowId: CrudRowId | undefined): number | null {
  const parsed = Number(rowId);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function toDraft(notice: Notice): NoticeDraft {
  return {
    noticeId: notice.noticeId,
    title: String(notice.title ?? ''),
    content: String(notice.content ?? ''),
    dispStartDate: String(notice.dispStartDate ?? ''),
    dispEndDate: String(notice.dispEndDate ?? ''),
    popupYn: String(notice.popupYn ?? 'Y'),
    useYn: String(notice.useYn ?? 'Y'),
    fileSetId: String(notice.fileSetId ?? ''),
    readCount: Number(notice.readCount ?? 0),
  };
}

export default function NoticeManagementPage() {
  const { t } = useTranslation('common');
  const addNotification = useAppStore((state) => state.addNotification);
  const { openAlert, openConfirm } = useAlertDialog();

  // selectedRowIds: row_select column(checkbox) state
  const [selectedRowIds, setSelectedRowIds] = useState<readonly CrudRowId[]>([]);
  // activeNoticeId: row where active cell currently belongs
  const [activeNoticeId, setActiveNoticeId] = useState<number | null>(null);
  const [draft, setDraft] = useState<NoticeDraft>(() => createDefaultDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [attachmentsByFileSetId, setAttachmentsByFileSetId] = useState<Record<string, File[]>>({});

  const tempNoticeIdRef = useRef(-1);

  const queryParams = useMemo<NoticeListParams>(() => ({}), []);
  const { data: noticeList = [], refetch, dataUpdatedAt } = useNoticeListQuery(queryParams);
  const { data: activeNotice, isFetching: isDetailLoading, refetch: refetchDetail } = useNoticeDetailQuery(
    activeNoticeId ?? 0,
    activeNoticeId != null
  );
  useEffect(() => {
    if (!activeNotice) return;
    setDraft(toDraft(activeNotice));
  }, [activeNotice]);

  const columns = useMemo(() => createNoticeManagementColumns(t), [t]);
  const currentFileSetId = draft.fileSetId.trim();
  const currentAttachments = currentFileSetId ? (attachmentsByFileSetId[currentFileSetId] ?? []) : [];

  const handleSelectedRowsChange = useCallback((rowIds: readonly CrudRowId[]) => {
    setSelectedRowIds(rowIds);
    // selected rows do not drive detail panel
  }, []);

  const handleActiveRowChange = useCallback<
    NonNullable<GenGridCrudProps<Notice>['onActiveRowChange']>
  >(({ rowId }) => {
    // Detail panel follows detail API data only; do not copy list row data into draft.
    const nextId = parseNoticeId(rowId ?? undefined);
    setActiveNoticeId((prev) => (prev === nextId ? prev : nextId));

    if (nextId == null) {
      setDraft(createDefaultDraft());
    }
  }, []);

const handleSave = async () => {
    if (!draft.title.trim()) {
      await openAlert({ title: 'Please enter a notice title.' });
      return;
    }

    const confirmed = await openConfirm({
      title: 'Do you want to save changes?',
      confirmText: 'Save',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;

    const resolvedNoticeId =
      typeof draft.noticeId === 'number' && Number.isFinite(draft.noticeId) && draft.noticeId > 0
        ? draft.noticeId
        : activeNoticeId ?? undefined;

    const payload: NoticeRequest = {
      noticeId: resolvedNoticeId,
      title: draft.title.trim(),
      content: draft.content,
      dispStartDate: draft.dispStartDate || undefined,
      dispEndDate: draft.dispEndDate || undefined,
      popupYn: draft.popupYn,
      useYn: draft.useYn,
      fileSetId: draft.fileSetId.trim() || undefined,
      lastUpdatedBy: 'admin',
      createdBy: resolvedNoticeId ? undefined : 'admin',
    };

    try {
      setIsSaving(true);
      const saved = await noticeApi.save(payload);
      setActiveNoticeId(saved.noticeId);
      setSelectedRowIds([saved.noticeId]);
      await refetch();
      await refetchDetail();
      await openAlert({ title: 'Saved successfully.' });
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : 'Failed to save notice.';
      addNotification(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAttachment = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!currentFileSetId) {
      addNotification('Enter file_set_id before attaching files.', 'error');
      return;
    }

    const nextFiles = Array.from(files);
    setAttachmentsByFileSetId((prev) => ({
      ...prev,
      [currentFileSetId]: [...(prev[currentFileSetId] ?? []), ...nextFiles],
    }));
  };

  const handleRemoveAttachment = (index: number) => {
    if (!currentFileSetId) return;
    setAttachmentsByFileSetId((prev) => ({
      ...prev,
      [currentFileSetId]: (prev[currentFileSetId] ?? []).filter((_, idx) => idx !== index),
    }));
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Notice Management"
        description="Manage the notice list and edit notice details."
        breadcrumbItems={[
          { label: 'System', icon: <Bell size={16} /> },
          { label: 'Notice Management', icon: <Bell size={16} /> },
        ]}
      />
      <div className={styles.content}>
        <SplitLayout
          className={styles.splitLayout}
          leftWidth="52%"
          minLeftWidth={360}
          minRightWidth={360}
          resizable
          showResizeLine
          left={
            <div className={styles.pane}>
              <GenGridCrud<Notice>
                title="Notice List"
                data={noticeList}
                columns={columns}
                getRowId={(row) => row.noticeId}
                rowSelection={selectedRowIds}
                deleteMode="selected"
                onRowSelectionChange={(rowIds) => handleSelectedRowsChange(rowIds)}
                onActiveRowChange={handleActiveRowChange}
                onCommit={async ({ changes, ctx }) => {
                  await commitNoticeChanges(changes, ctx.viewData);
                  await refetch();
                  return { ok: true };
                }}
                createRow={() => ({
                  noticeId: tempNoticeIdRef.current--,
                  title: '',
                  content: '',
                  dispStartDate: '',
                  dispEndDate: '',
                  popupYn: 'Y',
                  fileSetId: '',
                  useYn: 'Y',
                  createdBy: 'admin',
                  lastUpdatedBy: 'admin',
                })}
                actionBar={{
                  position: 'top',
                  defaultStyle: 'icon',
                  includeBuiltIns: ['filter'],
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
                gridProps={{
                  dataVersion: dataUpdatedAt,
                  rowHeight: 34,
                  overscan: 8,
                  enablePinning: true,
                  enableColumnSizing: true,
                  enableVirtualization: true,
                  enableRowStatus: false,
                  enableRowNumber: true,
                  checkboxSelection: false,
                  editOnActiveCell: false,
                  keepEditingOnNavigate: true,
                }}
              />
            </div>
          }
          right={
            <NoticeDraftPanel
              draft={draft}
              isDetailLoading={isDetailLoading}
              isSaving={isSaving}
              currentFileSetId={currentFileSetId}
              currentAttachments={currentAttachments}
              onDraftChange={setDraft}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={handleRemoveAttachment}
              onSave={() => {
                void handleSave();
              }}
            />
          }
        />
      </div>
    </div>
  );
}
