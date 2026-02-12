import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';

import { Switch } from '@gen-office/ui';

import type { RoleMenu } from '@/entities/system/role-menu/model/types';


export const createRoleMenuColumns = (
  t: TFunction,
  locale: string
): ColumnDef<RoleMenu>[] => [
  {
    id: 'treeItem',
    header: t('menu.name', { defaultValue: 'Menu Name' }),
    accessorKey: 'menuName',
    size: 250,
    meta: {
      pinned: 'left',
      renderCell: ({ row }) => {
        const useKorean = String(locale).toLowerCase().startsWith('ko');
        const value = useKorean
          ? row.menuName || row.menuNameEng
          : row.menuNameEng || row.menuName;
        return String(value ?? '');
      },
    },
  },
  {
    id: 'useYn',
    header: 'Use',
    accessorKey: 'useYn',
    size: 90,
    meta: {
      align: 'center',
      renderCell: ({ value, commitValue }) => (
        <Switch
          checked={value === 'Y'}
          onCheckedChange={(next) => commitValue?.(next ? 'Y' : 'N')}
          style={{
            ['--switch-width' as any]: '2.25rem',
            ['--switch-height' as any]: '1.25rem',
            ['--switch-thumb-size' as any]: '1rem',
            ['--switch-thumb-x' as any]: '0.125rem',
            ['--switch-thumb-checked-x' as any]: '1.125rem',
          }}
        />
      ),
      onSpace: ({ value, commitValue }) => {
        const next = value === 'Y' ? 'N' : 'Y';
        commitValue?.(next);
      },
    },
  },

];
