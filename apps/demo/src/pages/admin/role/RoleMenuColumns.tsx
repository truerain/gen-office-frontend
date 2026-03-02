import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';

import type { RoleMenu } from '@/pages/admin/role/model/roleMenuTypes';
import { GridYnSwitchCell } from '@/shared/ui/grid/GridYnSwitchCell';
import { handleGridYnSwitchSpace } from '@/shared/ui/grid/GridYnSwitchCell.utils';


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
        <GridYnSwitchCell value={value} commitValue={commitValue} />
      ),
      onSpace: handleGridYnSwitchSpace,
    },
  },

];
