import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import type { Notice } from '@/entities/system/notice/model/types';

export const createNoticeManagementColumns = (t: TFunction): ColumnDef<Notice>[] => [
  {
    id: 'id',
    header: t('notice.id', { defaultValue: 'ID' }),
    accessorKey: 'noticeId',
    size: 90,
    meta: {
      align: 'center',
      pinned: 'left',
    },
  },
  {
    id: 'title',
    header: t('notice.title', { defaultValue: 'Title' }),
    accessorKey: 'title',
    size: 300,
  },
  {
    id: 'readCount',
    header: t('notice.readCount', { defaultValue: 'Read Count' }),
    accessorKey: 'readCount',
    size: 110,
    meta: {
      align: 'center',
    },
  },
  {
    id: 'fileSetId',
    header: t('notice.fileSetId', { defaultValue: 'File Set ID' }),
    accessorKey: 'fileSetId',
    size: 180,
  },
  {
    id: 'lastUpdatedDate',
    header: t('common.updatedAt', { defaultValue: 'Updated At' }),
    accessorKey: 'lastUpdatedDate',
    size: 180,
  },
];
