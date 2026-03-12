import { http, HttpResponse } from 'msw';

type MockFileRecord = {
  fileId: string;
  fileName: string;
  fileSize: number;
  contentType?: string;
  uploadedAt: string;
  buffer: ArrayBuffer;
};

const filesBySetId = new Map<string, MockFileRecord[]>();
let sequence = 1;

function nextFileSetId() {
  const stamp = Date.now();
  const id = sequence++;
  return `FS_${stamp}_${String(id).padStart(4, '0')}`;
}

function nextFileId() {
  return String(sequence++);
}

function toHeaderFileName(name: string) {
  return encodeURIComponent(name);
}

export const commonFileHandlers = [
  http.get('/api/common/files/newFileSetId', () => {
    return HttpResponse.json({ fileSetId: nextFileSetId() });
  }),

  http.post('/api/common/files/upload', async ({ request }) => {
    const formData = await request.formData();
    const fileSetId = String(formData.get('fileSetId') ?? '').trim();
    if (!fileSetId) return new HttpResponse('fileSetId is required', { status: 400 });

    const targets = formData.getAll('files');
    const files = targets.filter((item): item is File => item instanceof File);
    if (!files.length) return new HttpResponse('files are required', { status: 400 });

    const bucket = filesBySetId.get(fileSetId) ?? [];
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      bucket.push({
        fileId: nextFileId(),
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        buffer,
      });
    }
    filesBySetId.set(fileSetId, bucket);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/common/files/list/:fileSetId', ({ params }) => {
    const fileSetId = String(params.fileSetId ?? '').trim();
    if (!fileSetId) return new HttpResponse('invalid fileSetId', { status: 400 });
    const bucket = filesBySetId.get(fileSetId) ?? [];
    return HttpResponse.json(
      bucket.map((item) => ({
        fileId: item.fileId,
        fileName: item.fileName,
        fileSize: item.fileSize,
        contentType: item.contentType,
        uploadedAt: item.uploadedAt,
      }))
    );
  }),

  http.get('/api/common/files/download/:fileSetId/:fileId', ({ params }) => {
    const fileSetId = String(params.fileSetId ?? '').trim();
    const fileId = String(params.fileId ?? '').trim();
    if (!fileSetId || !fileId) return new HttpResponse('invalid path parameter', { status: 400 });

    const bucket = filesBySetId.get(fileSetId) ?? [];
    const found = bucket.find((item) => item.fileId === fileId);
    if (!found) return new HttpResponse('not found', { status: 404 });

    return new HttpResponse(found.buffer, {
      status: 200,
      headers: {
        'Content-Type': found.contentType ?? 'application/octet-stream',
        'Content-Disposition': `attachment; filename*=UTF-8''${toHeaderFileName(found.fileName)}`,
      },
    });
  }),
];
