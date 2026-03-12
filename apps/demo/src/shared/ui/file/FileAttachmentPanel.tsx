import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/app/store/appStore';
import { commonFileApi, type CommonFileItem } from '@/shared/api/commonFile';
import { resolveApiErrorMessage } from '@/shared/api/errorMessage';
import styles from './FileAttachmentPanel.module.css';

export type FileAttachmentPanelProps = {
  fileSetId?: string;
  onFileSetIdChange?: (next: string) => void;
  disabled?: boolean;
  className?: string;
};

function formatSize(bytes?: number): string {
  if (!Number.isFinite(bytes) || (bytes ?? 0) < 0) return '-';
  const value = Number(bytes);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function FileAttachmentPanel({
  fileSetId,
  onFileSetIdChange,
  disabled = false,
  className,
}: FileAttachmentPanelProps) {
  const addNotification = useAppStore((state) => state.addNotification);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<CommonFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const currentFileSetId = String(fileSetId ?? '').trim();

  const loadList = useCallback(async () => {
    if (!currentFileSetId) {
      setItems([]);
      return;
    }
    try {
      setIsLoading(true);
      const next = await commonFileApi.list(currentFileSetId);
      setItems(next);
    } catch (error) {
      const message = resolveApiErrorMessage(error, { defaultMessage: 'Failed to load attachments.' });
      addNotification(message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addNotification, currentFileSetId]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const ensureFileSetId = useCallback(async () => {
    if (currentFileSetId) return currentFileSetId;
    const issued = await commonFileApi.getNewFileSetId();
    const normalized = issued.trim();
    console.log("file set id " + issued);
    if (!normalized) {
      throw new Error('Failed to issue file set id.');
    }
    onFileSetIdChange?.(normalized);
    return normalized;
  }, [currentFileSetId, onFileSetIdChange]);

  const handleUpload = async (files: File[]) => {
    if (!files.length) return;
    if (disabled) return;
    try {
      setIsUploading(true);
      const targetFileSetId = await ensureFileSetId();
      await commonFileApi.upload({ fileSetId: targetFileSetId, files });
      await loadList();
      addNotification('Files uploaded successfully.', 'success');
    } catch (error) {
      const message = resolveApiErrorMessage(error, { defaultMessage: 'Failed to upload files.' });
      addNotification(message, 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = async (item: CommonFileItem) => {
    if (!currentFileSetId) return;
    try {
      const downloaded = await commonFileApi.download({
        fileSetId: currentFileSetId,
        fileId: item.fileId,
      });
      const finalName = downloaded.fileName || item.fileName;
      downloadBlob(downloaded.blob, finalName);
    } catch (error) {
      const message = resolveApiErrorMessage(error, { defaultMessage: 'Failed to download file.' });
      addNotification(message, 'error');
    }
  };

  const panelClassName = className ? `${styles.panel} ${className}` : styles.panel;

  return (
    <div className={panelClassName}>
      <div className={styles.header}>
        <span className={styles.title}>
          Attachments (group: {currentFileSetId || 'not assigned'})
        </span>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.button}
            onClick={() => {
              void loadList();
            }}
            disabled={disabled || isLoading || !currentFileSetId}
          >
            Refresh
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        className={styles.fileInput}
        type="file"
        multiple
        disabled={disabled || isUploading}
        onChange={(e) => {
          const selected = e.currentTarget.files;
          const files = selected ? Array.from(selected) : [];
          void handleUpload(files);
        }}
      />

      <div className={styles.fileList}>
        {isLoading ? (
          <p className={styles.empty}>Loading attachments...</p>
        ) : items.length === 0 ? (
          <p className={styles.empty}>No attached files.</p>
        ) : (
          items.map((item) => (
            <div key={item.fileId} className={styles.fileItem}>
              <button
                type="button"
                className={styles.nameButton}
                onClick={() => {
                  void handleDownload(item);
                }}
                title={item.fileName}
              >
                {item.fileName}
              </button>
              <span className={styles.meta}>{formatSize(item.fileSize)}</span>
              <span className={styles.meta}>#{item.fileId}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
