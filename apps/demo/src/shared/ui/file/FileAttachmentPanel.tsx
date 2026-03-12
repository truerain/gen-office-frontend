import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCcw, Upload } from 'lucide-react';
import { useAppStore } from '@/app/store/appStore';
import { commonFileApi, type CommonFileItem } from '@/shared/api/commonFile';
import { resolveApiErrorMessage } from '@/shared/api/errorMessage';
import styles from './FileAttachmentPanel.module.css';

export type FileAttachmentUploadResult = {
  ok: boolean;
  uploadedCount: number;
  deletedCount: number;
  message?: string;
};

export type FileAttachmentPanelProps = {
  title?: string;
  fileSetId?: string;
  onFileSetIdChange?: (next: string) => void;
  uploadRequestId?: number;
  onUploadDone?: (result: FileAttachmentUploadResult) => void;
  bodyMaxHeight?: number | string;
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

function formatTotalSize(bytes: number): string {
  const safe = Number.isFinite(bytes) && bytes > 0 ? bytes : 0;
  if (safe < 1024) return `${safe}b`;
  if (safe < 1024 * 1024) return `${Math.round(safe / 1024)}kb`;
  return `${(safe / (1024 * 1024)).toFixed(1)}mb`;
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
  title,
  fileSetId,
  onFileSetIdChange: _onFileSetIdChange,
  uploadRequestId,
  onUploadDone,
  bodyMaxHeight,
  disabled = false,
  className,
}: FileAttachmentPanelProps) {
  const addNotification = useAppStore((state) => state.addNotification);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handledUploadRequestRef = useRef<number | undefined>(undefined);
  const [items, setItems] = useState<CommonFileItem[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingDeleteFiles, setPendingDeleteFiles] = useState<CommonFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const flushPendingUpload = useCallback(async () => {
    if (pendingFiles.length === 0 && pendingDeleteFiles.length === 0) {
      onUploadDone?.({ ok: true, uploadedCount: 0, deletedCount: 0 });
      return;
    }
    if (!currentFileSetId) {
      onUploadDone?.({
        ok: false,
        uploadedCount: 0,
        deletedCount: 0,
        message: 'File set id is required before uploading files.',
      });
      return;
    }

    try {
      setIsUploading(true);
      if (pendingDeleteFiles.length > 0) {
        await Promise.all(
          pendingDeleteFiles.map((file) =>
            commonFileApi.remove({
              fileSetId: currentFileSetId,
              fileId: file.fileId,
            })
          )
        );
      }
      if (pendingFiles.length > 0) {
        await commonFileApi.upload({ fileSetId: currentFileSetId, files: pendingFiles });
      }
      setPendingFiles([]);
      setPendingDeleteFiles([]);
      await loadList();
      onUploadDone?.({
        ok: true,
        uploadedCount: pendingFiles.length,
        deletedCount: pendingDeleteFiles.length,
      });
    } catch (error) {
      const message = resolveApiErrorMessage(error, { defaultMessage: 'Failed to upload files.' });
      onUploadDone?.({ ok: false, uploadedCount: 0, deletedCount: 0, message });
    } finally {
      setIsUploading(false);
    }
  }, [currentFileSetId, loadList, onUploadDone, pendingDeleteFiles, pendingFiles]);

  useEffect(() => {
    if (uploadRequestId == null) return;
    if (handledUploadRequestRef.current === uploadRequestId) return;
    handledUploadRequestRef.current = uploadRequestId;
    void flushPendingUpload();
  }, [flushPendingUpload, uploadRequestId]);

  const handlePendingFiles = (files: File[]) => {
    if (!files.length) return;
    if (disabled) return;
    setPendingFiles((prev) => [...prev, ...files]);
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
  const visibleExistingFiles = items.filter(
    (item) => !pendingDeleteFiles.some((target) => target.fileId === item.fileId)
  );
  const existingSize = visibleExistingFiles.reduce((sum, item) => sum + (Number(item.fileSize) || 0), 0);
  const pendingSize = pendingFiles.reduce((sum, file) => sum + (Number(file.size) || 0), 0);
  const totalCount = visibleExistingFiles.length + pendingFiles.length;
  const totalSizeText = formatTotalSize(existingSize + pendingSize);

  return (
    <div className={panelClassName}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{title != null ? title : '첨부파일'}</span>
          <span className={styles.summary}>({totalCount} files, total {totalSizeText})</span>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            disabled={disabled || isUploading}
            title="Select files"
            aria-label="Select files"
            onClick={() => {
              fileInputRef.current?.click();
            }}
          >
            <Upload size={16} />
          </button>
          <input
            ref={fileInputRef}
            className={styles.hiddenFileInput}
            type="file"
            multiple
            disabled={disabled || isUploading}
            onChange={(e) => {
              const selected = e.currentTarget.files;
              const files = selected ? Array.from(selected) : [];
              handlePendingFiles(files);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          />
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => {
              void loadList();
            }}
            disabled={disabled || isLoading || !currentFileSetId}
            title="Refresh attachments"
            aria-label="Refresh attachments"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      <div
        className={`${styles.body} ${isDragOver ? styles.dragOver : ''}`}
        style={bodyMaxHeight != null ? { maxHeight: typeof bodyMaxHeight === 'number' ? `${bodyMaxHeight}px` : bodyMaxHeight } : undefined}
        onDragEnter={(event) => {
          event.preventDefault();
          if (disabled || isUploading) return;
          setIsDragOver(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (disabled || isUploading) return;
          event.dataTransfer.dropEffect = 'copy';
          if (!isDragOver) setIsDragOver(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          const nextTarget = event.relatedTarget as Node | null;
          if (nextTarget && event.currentTarget.contains(nextTarget)) return;
          setIsDragOver(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          if (disabled || isUploading) return;
          const files = Array.from(event.dataTransfer.files ?? []);
          handlePendingFiles(files);
        }}
      >
        <div className={styles.fileList}>
          {isLoading ? (
            <p className={styles.empty}>Loading attachments...</p>
          ) : visibleExistingFiles.length === 0 ? (
            <p className={styles.empty}>No files.</p>
          ) : (
            visibleExistingFiles.map((item) => (
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
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => {
                    setPendingDeleteFiles((prev) =>
                      prev.some((target) => target.fileId === item.fileId) ? prev : [...prev, item]
                    );
                  }}
                  disabled={disabled || isUploading}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {pendingDeleteFiles.length > 0 && (
          <div className={styles.fileList}>
            {pendingDeleteFiles.map((file) => (
              <div key={`delete:${file.fileId}`} className={styles.fileItem}>
                <span className={styles.pendingName} title={file.fileName}>
                  {file.fileName}
                </span>
                <span className={styles.meta}>Delete pending</span>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => {
                    setPendingDeleteFiles((prev) => prev.filter((target) => target.fileId !== file.fileId));
                  }}
                  disabled={disabled || isUploading}
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        )}

        {pendingFiles.length > 0 && (
          <div className={styles.fileList}>
            {pendingFiles.map((file, idx) => (
              <div key={`${file.name}:${file.size}:${file.lastModified}:${idx}`} className={styles.fileItem}>
                <span className={styles.pendingName} title={file.name}>
                  {file.name}
                </span>
                <span className={styles.meta}>{formatSize(file.size)}</span>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => {
                    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  disabled={disabled || isUploading}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
