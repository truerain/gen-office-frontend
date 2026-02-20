import type { Notice } from '@/entities/system/notice/model/types';

export const mockNotices: Notice[] = [
  {
    id: 1,
    title: '서비스 점검 안내',
    content: '<p>2026-02-28 02:00~04:00 서비스 점검이 진행됩니다.</p>',
    fileSetId: 'NOTICE_20260220_001',
    readCount: 12,
    createdBy: 'admin',
    creationDate: '2026-02-20T00:00:00Z',
    lastUpdatedBy: 'admin',
    lastUpdatedDate: '2026-02-20T00:00:00Z',
  },
  {
    id: 2,
    title: '신규 기능 배포',
    content: '<p>공지사항 관리 기능이 배포되었습니다.</p>',
    fileSetId: 'NOTICE_20260220_002',
    readCount: 6,
    createdBy: 'admin',
    creationDate: '2026-02-19T00:00:00Z',
    lastUpdatedBy: 'admin',
    lastUpdatedDate: '2026-02-19T00:00:00Z',
  },
];
