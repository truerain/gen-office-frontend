import { useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Eye, Save } from 'lucide-react';
import { Input, RangeDatePicker, RichTextEditor, Switch } from '@gen-office/ui';
import { commonFileApi } from '@/shared/api/commonFile';
import { resolveApiErrorMessage } from '@/shared/api/errorMessage';
import { useAppStore } from '@/app/store/appStore';
import { FileAttachmentPanel, type FileAttachmentUploadResult } from '@/shared/ui/file/FileAttachmentPanel';

import styles from './NoticeManagementPage.module.css';

export type NoticeDraft = {
  noticeId?: number;
  title: string;
  content: string;
  dispStartDate: string;
  dispEndDate: string;
  popupYn: string;
  useYn: string;
  fileSetId: string;
  readCount: number;
};

type NoticeDraftPanelProps = {
  draft: NoticeDraft;
  isDetailLoading: boolean;
  isSaving: boolean;
  uploadRequestId: number;
  onUploadDone: (result: FileAttachmentUploadResult) => void;
  onDraftChange: Dispatch<SetStateAction<NoticeDraft>>;
  onSave: () => void;
};

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDate(value?: Date): string {
  if (!value) return '';
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function NoticeDraftPanel({
  draft,
  isDetailLoading,
  isSaving,
  uploadRequestId,
  onUploadDone,
  onDraftChange,
  onSave,
}: NoticeDraftPanelProps) {
  const addNotification = useAppStore((state) => state.addNotification);
  const issuingFileSetIdRef = useRef(false);

  useEffect(() => {
    if (isDetailLoading) return;
    if (issuingFileSetIdRef.current) return;
    if (String(draft.fileSetId ?? '').trim()) return;

    issuingFileSetIdRef.current = true;
    (async () => {
      try {
        const issued = await commonFileApi.getNewFileSetId();
        const normalized = String(issued ?? '').trim();
        if (!normalized) throw new Error('Failed to issue file set id.');
        onDraftChange((prev) => {
          if (String(prev.fileSetId ?? '').trim()) return prev;
          return { ...prev, fileSetId: normalized };
        });
      } catch (error) {
        const message = resolveApiErrorMessage(error, {
          defaultMessage: 'Failed to issue file set id.',
        });
        addNotification(message, 'error');
      } finally {
        issuingFileSetIdRef.current = false;
      }
    })();
  }, [addNotification, draft.fileSetId, isDetailLoading, onDraftChange]);

  return (
    <div className={styles.pane}>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.button} ${styles.iconButton}`}
          aria-label="Preview"
          title="Preview (Coming soon)"
          disabled
        >
          <Eye size={16} aria-hidden />
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.primaryButton} ${styles.iconButton}`}
          onClick={onSave}
          disabled={isSaving}
          aria-label={isSaving ? 'Saving' : 'Save'}
          title={isSaving ? 'Saving' : 'Save'}
        >
          <Save size={16} aria-hidden />
        </button>
      </div>

      <div className={styles.editorWrap}>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <Input
              value={draft.title}
              onChange={(e) => onDraftChange({ ...draft, title: e.target.value })}
              placeholder="Notice Title"
              fullWidth
              autoSelect={false}
              disabled={isSaving}
            />
          </div>
        </div>

        <RichTextEditor
          value={draft.content}
          onChange={(nextHtml) => onDraftChange({ ...draft, content: nextHtml })}
          placeholder="Enter notice content"
          minHeight={220}
          className={styles.noticeEditor}
          editorClassName={styles.noticeEditorBody}
        />

        <FileAttachmentPanel
          fileSetId={draft.fileSetId}
          bodyMaxHeight={100}
          uploadRequestId={uploadRequestId}
          onUploadDone={onUploadDone}
          onFileSetIdChange={(next) => onDraftChange((prev) => ({ ...prev, fileSetId: next }))}
          disabled={isSaving}
        />

        <div className={styles.fieldRowControls}>
          <div className={styles.field}>
            <label className={styles.label}>Display Period</label>
            <RangeDatePicker
              value={{
                from: parseDate(draft.dispStartDate),
                to: parseDate(draft.dispEndDate),
              }}
              onChange={(range) =>
                onDraftChange({
                  ...draft,
                  dispStartDate: formatDate(range?.from),
                  dispEndDate: formatDate(range?.to),
                })
              }
              placeholder="YYYY-MM-DD ~ YYYY-MM-DD"
              format={formatDate}
              disabled={isSaving}
              clearable
            />
          </div>
          <div className={styles.switchField}>
            <label className={styles.label} htmlFor="notice-popup-switch">
              Popup
            </label>
            <Switch
              id="notice-popup-switch"
              checked={draft.popupYn === 'Y'}
              onCheckedChange={(checked) =>
                onDraftChange({ ...draft, popupYn: checked ? 'Y' : 'N' })
              }
              disabled={isSaving}
            />
          </div>
          <div className={styles.switchField}>
            <label className={styles.label} htmlFor="notice-use-switch">
              Use
            </label>
            <Switch
              id="notice-use-switch"
              checked={draft.useYn === 'Y'}
              onCheckedChange={(checked) =>
                onDraftChange({ ...draft, useYn: checked ? 'Y' : 'N' })
              }
              disabled={isSaving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
