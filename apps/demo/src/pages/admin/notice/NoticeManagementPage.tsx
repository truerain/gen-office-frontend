import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Bold as BoldIcon,
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

  // selectedRowIds: row_select column(checkbox) state
  const [selectedRowIds, setSelectedRowIds] = useState<readonly CrudRowId[]>([]);
  // activeNoticeId: row where active cell currently belongs
  const [activeNoticeId, setActiveNoticeId] = useState<number | null>(null);
  const [draft, setDraft] = useState<NoticeDraft>(() => createDefaultDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [attachmentsByFileSetId, setAttachmentsByFileSetId] = useState<Record<string, File[]>>({});
  const skipEditorSyncRef = useRef(false);

  const tempNoticeIdRef = useRef(-1);

  const queryParams = useMemo<NoticeListParams>(() => ({}), []);
  const { data: noticeList = [], refetch, dataUpdatedAt } = useNoticeListQuery(queryParams);
  const { data: activeNotice, isFetching: isDetailLoading, refetch: refetchDetail } = useNoticeDetailQuery(
    activeNoticeId ?? 0,
    activeNoticeId != null
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '怨듭? ?댁슜???낅젰?섏꽭??',
      }),
    ],
    content: draft.content,
    onUpdate: ({ editor: nextEditor }) => {
      if (skipEditorSyncRef.current) return;
      setDraft((prev) => ({ ...prev, content: nextEditor.getHTML() }));
    },
  });

  useEffect(() => {
    if (!activeNotice) return;
    setDraft(toDraft(activeNotice));
  }, [activeNotice]);

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

  const handleSelectedRowsChange = useCallback((rowIds: readonly CrudRowId[]) => {
    setSelectedRowIds(rowIds);
    // selected rows do not drive detail panel
  }, []);

  const handleSave = async () => {
    if (!draft.title.trim()) {
      await openAlert({ title: '怨듭? ?쒕ぉ???낅젰?섏꽭??' });
      return;
    }

    const confirmed = await openConfirm({
      title: '??ν븯?쒓쿋?듬땲源?',
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
      setActiveNoticeId(saved.id);
      setSelectedRowIds([saved.id]);
      await refetch();
      await refetchDetail();
      await openAlert({ title: '??λ릺?덉뒿?덈떎.' });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : '怨듭? ??μ뿉 ?ㅽ뙣?덉뒿?덈떎.';
      addNotification(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAttachment = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!currentFileSetId) {
      addNotification('泥⑤? ?꾩뿉 file_set_id瑜??낅젰?섏꽭??', 'error');
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
        description="怨듭??ы빆 紐⑸줉 議고쉶? ?곸꽭 ?몄쭛??愿由ы빀?덈떎."
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
                rowSelection={selectedRowIds}
                onRowSelectionChange={(rowIds) => {
                  void handleSelectedRowsChange(rowIds);
                }}
                onCommit={async () => ({ ok: true })}
                onStateChange={({ activeRowId }) => {
                  // detail panel follows active row only
                  if (activeRowId == null) {
                    setActiveNoticeId(null);
                    setDraft(createDefaultDraft());
                    return;
                  }

                  const nextId = parseNoticeId(activeRowId);
                  setActiveNoticeId((prev) => (prev === nextId ? prev : nextId));
                  if (nextId == null) {
                    setDraft(createDefaultDraft());
                  }
                }}
                createRow={() => ({
                  id: tempNoticeIdRef.current--,
                  title: '',
                  content: '',
                  fileSetId: '',
                  useYn: 'Y',
                  createdBy: 'admin',
                  lastUpdatedBy: 'admin',
                })}
                actionBar={{
                  position: 'top',
                  defaultStyle: 'icon',
                  includeBuiltIns: ['add', 'delete', 'save', 'filter'],
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
                  checkboxSelection: true,
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
                  <span>{activeNoticeId ?? 'new'}</span>
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
                      placeholder="怨듭? ?쒕ぉ"
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>file_set_id</label>
                    <input
                      className={styles.input}
                      value={draft.fileSetId}
                      onChange={(e) => setDraft((prev) => ({ ...prev, fileSetId: e.target.value }))}
                      placeholder="?? NOTICE_20260220_001"
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
                      <p className={styles.emptyText}>?깅줉??泥⑤??뚯씪???놁뒿?덈떎.</p>
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


