import { DatePicker, RichTextEditor, SimpleSelect } from '@gen-office/ui';
import { FileAttachmentPanel } from '@/shared/ui/file/FileAttachmentPanel';

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
  onDraftChange: (next: NoticeDraft) => void;
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
  onDraftChange,
  onSave,
}: NoticeDraftPanelProps) {
  console.log(isDetailLoading);
  return (
    <div className={styles.pane}>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.button} ${styles.primaryButton}`}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className={styles.editorWrap}>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              value={draft.title}
              onChange={(e) => onDraftChange({ ...draft, title: e.target.value })}
              placeholder="Notice Title"
            />
          </div>
        </div>

        <div className={styles.fieldRowMeta}>
          <div className={styles.field}>
            <label className={styles.label}>Start Date</label>
            <DatePicker
              value={parseDate(draft.dispStartDate)}
              onChange={(next) => onDraftChange({ ...draft, dispStartDate: formatDate(next) })}
              placeholder="YYYY-MM-DD"
              clearable
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>End Date</label>
            <DatePicker
              value={parseDate(draft.dispEndDate)}
              onChange={(next) => onDraftChange({ ...draft, dispEndDate: formatDate(next) })}
              placeholder="YYYY-MM-DD"
              clearable
            />
          </div>
        </div>

        <div className={styles.fieldRowMeta}>
          <div className={styles.field}>
            <label className={styles.label}>Popup</label>
            <SimpleSelect
              value={draft.popupYn}
              onValueChange={(value) => onDraftChange({ ...draft, popupYn: value })}
              options={[
                { value: 'Y', label: 'Y' },
                { value: 'N', label: 'N' },
              ]}
              fullWidth
              triggerClassName={styles.selectLikeDatePicker}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Use</label>
            <SimpleSelect
              value={draft.useYn}
              onValueChange={(value) => onDraftChange({ ...draft, useYn: value })}
              options={[
                { value: 'Y', label: 'Y' },
                { value: 'N', label: 'N' },
              ]}
              fullWidth
              triggerClassName={styles.selectLikeDatePicker}
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
          onFileSetIdChange={(next) => onDraftChange({ ...draft, fileSetId: next })}
          disabled={isSaving}
        />

      </div>
    </div>
  );
}
