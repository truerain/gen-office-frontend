import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Bold as BoldIcon,
  FilePlus2,
  Italic as ItalicIcon,
  List as BulletListIcon,
  ListOrdered as OrderedListIcon,
  Pilcrow as ParagraphIcon,
  RefreshCcw,
} from 'lucide-react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { CrudRowId } from '@gen-office/gen-grid-crud';
import { SplitLayout } from '@gen-office/ui';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { noticeApi, useNoticeDetailQuery, useNoticeListQuery } from '@/entities/system/notice/api/notice';
import type { Notice, NoticeListParams, NoticeRequest } from '@/entities/system/notice/model/types';
import { useAppStore } from '@/app/store/appStore';
import { useAlertDialog } from '@/shared/ui/AlertDialogProvider';

import styles from './NoticeManagementPage.module.css';
import { createNoticeManagementColumns } from './NoticeManagementColumns';

type NoticeDraft = {
  id?: number;
  title: string;
  content: string;
  fileSetId: string;
  readCount: number;
};

const createDefaultDraft = (): NoticeDraft => ({
  title: '',
  content: '',
  fileSetId: '',
  readCount: 0,
});

function parseNoticeId(rowId: CrudRowId | undefined): number | null {
  const parsed = Number(rowId);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function toDraft(notice: Notice): NoticeDraft {
  return {
    id: notice.id,
    title: String(notice.title ?? ''),
    content: String(notice.content ?? ''),
    fileSetId: String(notice.fileSetId ?? ''),
    readCount: Number(notice.readCount ?? 0),
  };
}

export default function NoticeManagementPage() {
  const { t } = useTranslation('common');
  const addNotification = useAppStore((state) => state.addNotification);
  const { openAlert, openConfirm } = useAlertDialog();

  const [selectedRowIds, setSelectedRowIds] = useState<readonly CrudRowId[]>([]);
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);
  const [draft, setDraft] = useState<NoticeDraft>(() => createDefaultDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [attachmentsByFileSetId, setAttachmentsByFileSetId] = useState<Record<string, File[]>>({});
  const skipEditorSyncRef = useRef(false);

  const queryParams = useMemo<NoticeListParams>(() => ({}), []);
  const { data: noticeList = [], refetch, dataUpdatedAt } = useNoticeListQuery(queryParams);
  const { data: selectedNotice, isFetching: isDetailLoading, refetch: refetchDetail } = useNoticeDetailQuery(
    selectedNoticeId ?? 0,
    selectedNoticeId != null
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '공지 내용을 입력하세요.',
      }),
    ],
    content: draft.content,
    onUpdate: ({ editor: nextEditor }) => {
      if (skipEditorSyncRef.current) return;
      setDraft((prev) => ({ ...prev, content: nextEditor.getHTML() }));
    },
  });

  useEffect(() => {
    if (!selectedNotice) return;
    setDraft(toDraft(selectedNotice));
  }, [selectedNotice]);

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === draft.content) return;
    skipEditorSyncRef.current = true;
    editor.commands.setContent(draft.content || '<p></p>', false);
    skipEditorSyncRef.current = false;
  }, [draft.content, editor]);

  const columns = useMemo(() => createNoticeManagementColumns(t), [t]);
  const currentFileSetId = draft.fileSetId.trim();
  const currentAttachments = currentFileSetId ? (attachmentsByFileSetId[currentFileSetId] ?? []) : [];

  const handleSelectionChange = (rowIds: readonly CrudRowId[]) => {
    setSelectedRowIds(rowIds);
    const nextId = parseNoticeId(rowIds[0]);
    setSelectedNoticeId(nextId);
    if (nextId == null) {
      setDraft(createDefaultDraft());
    }
  };

  const handleCreateNew = () => {
    setSelectedRowIds([]);
    setSelectedNoticeId(null);
    setDraft(createDefaultDraft());
  };

  const handleSave = async () => {
    if (!draft.title.trim()) {
      await openAlert({ title: '공지 제목을 입력하세요.' });
      return;
    }

    const confirmed = await openConfirm({
      title: '저장하시겠습니까?',
      confirmText: 'Save',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;

    const payload: NoticeRequest = {
      id: draft.id,
      title: draft.title.trim(),
      content: draft.content,
      fileSetId: draft.fileSetId.trim() || undefined,
      lastUpdatedBy: 'admin',
      createdBy: draft.id ? undefined : 'admin',
    };

    try {
      setIsSaving(true);
      const saved = await noticeApi.save(payload);
      setSelectedNoticeId(saved.id);
      setSelectedRowIds([saved.id]);
      await refetch();
      await refetchDetail();
      await openAlert({ title: '저장되었습니다.' });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : '공지 저장에 실패했습니다.';
      addNotification(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAttachment = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!currentFileSetId) {
      addNotification('첨부 전에 file_set_id를 입력하세요.', 'error');
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
        description="공지사항 목록 조회와 상세 편집을 관리합니다."
        breadcrumbItems={[
          { label: 'System', icon: <Bell size={16} /> },
          { label: 'Notice Management', icon: <Bell size={16} /> },
        ]}
      />

      <div className={styles.content}>
        <SplitLayout
          className={styles.splitLayout}
          leftWidth="52%"
          left={
            <div className={styles.pane}>
              <GenGridCrud<Notice>
                title="Notice List"
                data={noticeList}
                columns={columns}
                getRowId={(row) => row.id}
                selectedRowIds={selectedRowIds}
                onSelectedRowIdsChange={handleSelectionChange}
                onCommit={async () => ({ ok: true })}
                onStateChange={({ activeRowId }) => {
                  const nextId = parseNoticeId(activeRowId);
                  if (nextId == null || nextId === selectedNoticeId) return;
                  setSelectedRowIds([nextId]);
                  setSelectedNoticeId(nextId);
                }}
                actionBar={{
                  position: 'top',
                  defaultStyle: 'icon',
                  includeBuiltIns: ['filter'],
                  customActions: [
                    {
                      key: 'new',
                      label: 'New',
                      icon: <FilePlus2 aria-hidden size={16} />,
                      side: 'left',
                      style: 'icon',
                      order: 5,
                      onClick: handleCreateNew,
                    },
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
                  enableRowSelection: true,
                  editOnActiveCell: false,
                  keepEditingOnNavigate: true,
                }}
              />
            </div>
          }
          right={
            <div className={styles.pane}>
              <div className={styles.paneHeader}>
                <span>Notice Detail</span>
                <span className={styles.meta}>
                  <span>{selectedNoticeId ?? 'new'}</span>
                  <span>{isDetailLoading ? 'Loading...' : ''}</span>
                </span>
              </div>

              <div className={styles.editorWrap}>
                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Title</label>
                    <input
                      className={styles.input}
                      value={draft.title}
                      onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="공지 제목"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>file_set_id</label>
                    <input
                      className={styles.input}
                      value={draft.fileSetId}
                      onChange={(e) => setDraft((prev) => ({ ...prev, fileSetId: e.target.value }))}
                      placeholder="예: NOTICE_20260220_001"
                    />
                  </div>
                </div>

                <div className={styles.toolbar}>
                  <button
                    type="button"
                    className={styles.toolbarButton}
                    data-active={editor?.isActive('bold') ? 'true' : 'false'}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    aria-label="Bold"
                    title="Bold"
                  >
                    <BoldIcon size={16} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={styles.toolbarButton}
                    data-active={editor?.isActive('italic') ? 'true' : 'false'}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    aria-label="Italic"
                    title="Italic"
                  >
                    <ItalicIcon size={16} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={styles.toolbarButton}
                    data-active={editor?.isActive('bulletList') ? 'true' : 'false'}
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    aria-label="Bullet List"
                    title="Bullet List"
                  >
                    <BulletListIcon size={16} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={styles.toolbarButton}
                    data-active={editor?.isActive('orderedList') ? 'true' : 'false'}
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    aria-label="Ordered List"
                    title="Ordered List"
                  >
                    <OrderedListIcon size={16} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={styles.toolbarButton}
                    onClick={() => editor?.chain().focus().setParagraph().run()}
                    aria-label="Paragraph"
                    title="Paragraph"
                  >
                    <ParagraphIcon size={16} aria-hidden />
                  </button>
                </div>

                <div className={styles.editor}>
                  <EditorContent editor={editor} />
                </div>

                <div className={styles.attachments}>
                  <label className={styles.label}>
                    Attachments (group: {currentFileSetId || 'file_set_id not set'})
                  </label>
                  <input
                    className={styles.fileInput}
                    type="file"
                    multiple
                    onChange={(e) => handleAddAttachment(e.target.files)}
                  />
                  <div className={styles.fileList}>
                    {currentAttachments.length === 0 ? (
                      <p className={styles.emptyText}>등록된 첨부파일이 없습니다.</p>
                    ) : (
                      currentAttachments.map((file, index) => (
                        <div key={`${file.name}-${index}`} className={styles.fileItem}>
                          <span>{file.name}</span>
                          <button
                            type="button"
                            className={styles.button}
                            onClick={() => handleRemoveAttachment(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.primaryButton}`}
                    onClick={() => {
                      void handleSave();
                    }}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}