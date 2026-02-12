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
    size: 120,
    meta: { align: 'center', pinned: 'left' },
    footer: _ => (
          <div style={{textAlign: 'center', fontWeight: 500}}>Total</div>
    )
  },
  {
    id: 'empNo',
    header: 'Emp No',
    accessorKey: 'empNo',
    size: 140,
    meta: { editable: true, editType: 'text', align: 'center'},
    footer: info => (
          <div style={{textAlign: 'right', fontWeight: 450}}>{info.table.getRowCount()}</div>
    )
            
  },
  {
    id: 'empName',
    header: 'Name',
    accessorKey: 'empName',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'empNameEng',
    header: 'Name (Eng)',
    accessorKey: 'empNameEng',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    size: 220,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'orgId',
    header: 'Org ID',
    accessorKey: 'orgId',
    size: 140,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'title',
    header: 'Title',
    accessorKey: 'title',
    size: 140,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'langCd',
    header: 'Lang',
    accessorKey: 'langCd',
    size: 80,
    meta: {
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
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'lastUpdatedBy',
    header: 'Updated By',
    accessorKey: 'lastUpdatedBy',
    size: 140,
  },
  {
    id: 'lastUpdatedDate',
    header: 'Updated At',
    accessorKey: 'lastUpdatedDate',
    size: 160,
  },
];
