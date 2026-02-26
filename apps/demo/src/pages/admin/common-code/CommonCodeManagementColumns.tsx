import type { ColumnDef } from '@tanstack/react-table';
import type {
  CommonCodeMasterGridRow,
  CommonCodeDetailGridRow,
} from './CommonCodeManagementCrud';

const useYnOptions = [
  { label: 'Y', value: 'Y' },
  { label: 'N', value: 'N' },
];

const normalizeUpperCode = (value: unknown) =>
  String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '');

export const createMasterColumns = (): ColumnDef<CommonCodeMasterGridRow>[] => [
  {
    id: 'lkupClssCd',
    header: 'Class Code',
    accessorKey: 'lkupClssCd',
    size: 180,
    meta: {
      editable: true,
      editType: 'text',
      pinned: 'left',
      editPlaceholder: 'ex) USER_STATUS',
      editValueNormalizer: ({ value }) => normalizeUpperCode(value),
    },
  },
  {
    id: 'lkupClssName',
    header: 'Class Name',
    accessorKey: 'lkupClssName',
    size: 220,
    meta: {
      editable: true,
      editType: 'text',
      pinned: 'left',
    },
  },
  {
    id: 'lkupClssDesc',
    header: 'Description',
    accessorKey: 'lkupClssDesc',
    size: 280,
    meta: {
      editable: true,
      editType: 'text',
    },
  },
  {
    id: 'useYn',
    header: 'Use',
    accessorKey: 'useYn',
    size: 90,
    meta: {
      editable: true,
      editType: 'select',
      align: 'center',
      getEditOptions: () => useYnOptions,
    },
  },
  {
    id: 'attribute1',
    header: 'Attribute 1',
    accessorKey: 'attribute1',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute2',
    header: 'Attribute 2',
    accessorKey: 'attribute2',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute3',
    header: 'Attribute 3',
    accessorKey: 'attribute3',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute4',
    header: 'Attribute 4',
    accessorKey: 'attribute4',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute5',
    header: 'Attribute 5',
    accessorKey: 'attribute5',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute6',
    header: 'Attribute 6',
    accessorKey: 'attribute6',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute7',
    header: 'Attribute 7',
    accessorKey: 'attribute7',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute8',
    header: 'Attribute 8',
    accessorKey: 'attribute8',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute9',
    header: 'Attribute 9',
    accessorKey: 'attribute9',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute10',
    header: 'Attribute 10',
    accessorKey: 'attribute10',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'lastUpdatedBy',
    header: 'Last Updated By',
    accessorKey: 'lastUpdatedByName',
    size: 180,
    meta: {
      align: 'center',
    },
  },
  {
    id: 'lastUpdatedAt',
    header: 'Last Updated At',
    accessorKey: 'lastUpdatedAt',
    size: 180,
    meta: {
      align: 'center',
    },
  },
];

export const createDetailColumns = (): ColumnDef<CommonCodeDetailGridRow>[] => [
  {
    id: 'lkupCd',
    header: 'Code',
    accessorKey: 'lkupCd',
    size: 160,
    meta: {
      editable: true,
      editType: 'text',
      pinned: 'left',
      editPlaceholder: 'ex) ACTIVE',
      editValueNormalizer: ({ value }) => normalizeUpperCode(value),
    },
  },
  {
    id: 'lkupName',
    header: 'Name',
    accessorKey: 'lkupName',
    size: 220,
    meta: {
      editable: true,
      editType: 'text',
      pinned: 'left',
    },
  },
  {
    id: 'lkupNameEng',
    header: 'Name (Eng)',
    accessorKey: 'lkupNameEng',
    size: 180,
    meta: {
      editable: true,
      editType: 'text',
    },
  },
  {
    id: 'sortOrder',
    header: 'Sort',
    accessorKey: 'sortOrder',
    size: 90,
    meta: {
      editable: true,
      editType: 'number',
      align: 'center',
    },
  },
  {
    id: 'useYn',
    header: 'Use',
    accessorKey: 'useYn',
    size: 90,
    meta: {
      editable: true,
      editType: 'select',
      align: 'center',
      getEditOptions: () => useYnOptions,
    },
  },
  {
    id: 'attribute1',
    header: 'Attribute 1',
    accessorKey: 'attribute1',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute2',
    header: 'Attribute 2',
    accessorKey: 'attribute2',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute3',
    header: 'Attribute 3',
    accessorKey: 'attribute3',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute4',
    header: 'Attribute 4',
    accessorKey: 'attribute4',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute5',
    header: 'Attribute 5',
    accessorKey: 'attribute5',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute6',
    header: 'Attribute 6',
    accessorKey: 'attribute6',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute7',
    header: 'Attribute 7',
    accessorKey: 'attribute7',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute8',
    header: 'Attribute 8',
    accessorKey: 'attribute8',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute9',
    header: 'Attribute 9',
    accessorKey: 'attribute9',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute10',
    header: 'Attribute 10',
    accessorKey: 'attribute10',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'lastUpdatedBy',
    header: 'Last Updated By',
    accessorKey: 'lastUpdatedByName',
    size: 180,
    meta: {
      align: 'center',
    },
  },
  {
    id: 'lastUpdatedAt',
    header: 'Last Updated At',
    accessorKey: 'lastUpdatedAt',
    size: 180,
    meta: {
      align: 'center',
    },
  },
];
