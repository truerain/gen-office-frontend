import { http } from '@/shared/api/http';

export type CommonFileItem = {
  fileId: string;
  fileName: string;
  fileSize?: number;
  contentType?: string;
  uploadedAt?: string;
};

export type DownloadedFile = {
  blob: Blob;
  fileName: string;
};

function resolveFileSetId(payload: unknown): string {
  if (typeof payload === 'string') return payload.trim();
  if (payload && typeof payload === 'object') {
    const raw = (payload as { fileSetId?: unknown }).fileSetId;
    if (typeof raw === 'string') return raw.trim();
  }
  return '';
}

function mapFileItem(raw: unknown): CommonFileItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as {
    fileId?: unknown;
    id?: unknown;
    fileName?: unknown;
    originalFileName?: unknown;
    name?: unknown;
    fileSize?: unknown;
    size?: unknown;
    contentType?: unknown;
    mimeType?: unknown;
    uploadedAt?: unknown;
    createdAt?: unknown;
  };

  const fileId = String(row.fileId ?? row.id ?? '').trim();
  const fileName = String(row.fileName ?? row.originalFileName ?? row.name ?? '').trim();
  if (!fileId || !fileName) return null;

  const size = Number(row.fileSize ?? row.size);
  return {
    fileId,
    fileName,
    fileSize: Number.isFinite(size) ? size : undefined,
    contentType: String(row.contentType ?? row.mimeType ?? '').trim() || undefined,
    uploadedAt: String(row.uploadedAt ?? row.createdAt ?? '').trim() || undefined,
  };
}

function parseContentDispositionFileName(value: string | null): string {
  if (!value) return '';
  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const plainMatch = value.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) return plainMatch[1];
  return '';
}

export const commonFileApi = {
  async getNewFileSetId(): Promise<string> {
    const payload = await http<string | { fileSetId?: string }>('/api/common/files/newFileSetId', {
      method: 'GET',
    });
    return resolveFileSetId(payload);
  },

  async list(fileSetId: string): Promise<CommonFileItem[]> {
    const encoded = encodeURIComponent(fileSetId);
    const payload = await http<unknown[] | { items?: unknown[] }>(`/api/common/files/list/${encoded}`, {
      method: 'GET',
    });
    const items = Array.isArray(payload) ? payload : payload.items ?? [];
    return items.map(mapFileItem).filter((item): item is CommonFileItem => item != null);
  },

  async upload(params: { fileSetId: string; files: File[] }): Promise<void> {
    const body = new FormData();
    body.append('fileSetId', params.fileSetId);
    for (const file of params.files) {
      body.append('files', file);
    }

    await http<void>('/api/common/files/upload', {
      method: 'POST',
      body,
      responseType: 'void',
    });
  },

  async download(params: { fileSetId: string; fileId: string }): Promise<DownloadedFile> {
    const encodedSetId = encodeURIComponent(params.fileSetId);
    const encodedFileId = encodeURIComponent(params.fileId);
    const response = await http<Response>(`/api/common/files/download/${encodedSetId}/${encodedFileId}`, {
      method: 'GET',
      responseType: 'response',
    });
    const blob = await response.blob();
    const fileName = parseContentDispositionFileName(response.headers.get('content-disposition'));
    return { blob, fileName };
  },
};
