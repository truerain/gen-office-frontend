import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import type { User } from '@/entities/system/user/model/types';

export type SelectOption = { label: string; value: string };

const fallbackLangOptions: SelectOption[] = [
  { label: 'Korean', value: 'ko' },
  { label: 'English', value: 'en' },
];

type UserManagementColumnOptions = {
  getLangOptions?: (row: User) => SelectOption[];
};

export const createUserManagementColumns = (
  t: TFunction,
  options: UserManagementColumnOptions = {}
): ColumnDef<User>[] => [
  {
    id: 'userId',
    header: t('user.id'),
    accessorKey: 'userId',
    meta: { width: 120, align: 'center' },
  },
  {
    id: 'empNo',
    header: 'Emp No',
    accessorKey: 'empNo',
    meta: { width: 140, editable: true, editType: 'text' },
  },
  {
    id: 'empName',
    header: 'Name',
    accessorKey: 'empName',
    meta: { width: 160, editable: true, editType: 'text' },
  },
  {
    id: 'empNameEng',
    header: 'Name (Eng)',
    accessorKey: 'empNameEng',
    meta: { width: 160, editable: true, editType: 'text' },
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    meta: { width: 220, editable: true, editType: 'text' },
  },
  {
    id: 'orgId',
    header: 'Org ID',
    accessorKey: 'orgId',
    meta: { width: 140, editable: true, editType: 'text' },
  },
  {
    id: 'title',
    header: 'Title',
    accessorKey: 'title',
    meta: { width: 140, editable: true, editType: 'text' },
  },
  {
    id: 'langCd',
    header: 'Lang',
    accessorKey: 'langCd',
    meta: {
      width: 80,
      editable: true,
      editType: 'select',
      align: 'center',
      getEditOptions: (row: User) => options.getLangOptions?.(row) ?? fallbackLangOptions,
      renderCell: ({ value, row }) => {
        const resolved = options.getLangOptions?.(row) ?? fallbackLangOptions;
        const label = resolved.find((opt) => opt.value === String(value ?? ''))?.label;
        return label ?? String(value ?? '');
      },
    },
  },
  {
    id: 'password',
    header: 'Password',
    accessorKey: 'password',
    meta: { width: 160, editable: true, editType: 'text' },
  },
  {
    id: 'lastUpdatedBy',
    header: 'Updated By',
    accessorKey: 'lastUpdatedBy',
    meta: { width: 140 },
  },
  {
    id: 'lastUpdatedDate',
    header: 'Updated At',
    accessorKey: 'lastUpdatedDate',
    meta: { width: 160 },
  },
];
