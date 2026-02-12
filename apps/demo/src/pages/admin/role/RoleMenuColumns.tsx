import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import type { RoleMenu } from '@/entities/system/role-menu/model/types';

export const createRoleMenuColumns = (t: TFunction): ColumnDef<RoleMenu>[] => [
  {
    id: 'treeItem',
    header: t('menu.name', { defaultValue: 'Menu Name' }),
    accessorKey: 'menuName',
    meta: {
      width: 350,
    },
  },
  {
    id: 'menuNameEng',
    header: t('menu.nameEng', { defaultValue: 'Menu Name (Eng)' }),
    accessorKey: 'menuNameEng',
    meta: {
      width: 220,
    },
  },
  {
    id: 'useYn',
    header: t('common.useYn', { defaultValue: 'Use' }),
    accessorKey: 'useYn',
    meta: {
      width: 90,
      align: 'center',
      renderCell: ({ value }) => String(value ?? ''),
    },
  },
];
