import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import type { Notice } from '@/pages/admin/notice/model/types';
import { GridYnSwitchCell } from '@/shared/ui/grid/GridYnSwitchCell';
import { handleGridYnSwitchSpace } from '@/shared/ui/grid/GridYnSwitchCell.utils';

export const createNoticeManagementColumns = (t: TFunction): ColumnDef<Notice>[] => [
  {
    id: 'title',
    header: t('notice.title', { defaultValue: 'Title' }),
    accessorKey: 'title',
    size: 300,
    meta: {
      pinned: 'left',
    },
  },
  {
    id: 'dispStartDate',
    header: t('notice.dispStartDate', { defaultValue: 'Start Date' }),
    accessorKey: 'dispStartDate',
    size: 120,
    meta: {
      align: 'center',
      editType: 'date'
    },
  },
  {
    id: 'dispEndDate',
    header: t('notice.dispEndDate', { defaultValue: 'End Date' }),
    accessorKey: 'dispEndDate',
    size: 120,
    meta: {
      align: 'center'
    },
  },
  {
    id: 'popupYn',
    header: t('notice.popupYn', { defaultValue: 'Popup' }),
    accessorKey: 'popupYn',
    size: 100,
    meta: {
      align: 'center',
      renderCell: ({ value, commitValue }) => (
        <GridYnSwitchCell value={value} commitValue={commitValue} />
      ),
      onSpace: handleGridYnSwitchSpace,
     },
  },
  {
    id: 'useYn',
    header: t('notice.useYn', { defaultValue: 'Use' }),
    accessorKey: 'useYn',
    size: 100,
    meta: {
      align: 'center',
      renderCell: ({ value, commitValue }) => (
        <GridYnSwitchCell value={value} commitValue={commitValue} />
      ),
      onSpace: handleGridYnSwitchSpace,
    },
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
