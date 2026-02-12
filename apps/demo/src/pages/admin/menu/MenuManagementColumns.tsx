import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import type { Menu } from '@/entities/system/menu/model/types';

import { Switch } from '@gen-office/ui';

export type SelectOption = { label: string; value: string };

const fallbackUseFlags: SelectOption[] = [
  { label: 'Y', value: 'Y' },
  { label: 'N', value: 'N' },
];

type MenuManagementColumnOptions = {
  getUseFlags?: (row: Menu) => SelectOption[];
};

export const createMenuManagementColumns = (
  t: TFunction,
  options: MenuManagementColumnOptions = {}
): ColumnDef<Menu>[] => [
  {
    id: 'treeItem',
    header: 'Menu',
    accessorKey: 'menuName',
    size: 220,
    meta: {
      editable: false,
    },
  },
 {
    id: 'menuId',
    header: t('menu.id'),
    accessorKey: 'menuId',
    size: 140,
    meta: {
      align: 'center',
      editable: true,
      editType: 'number',
      editPlaceholder: 'Menu ID',
      renderCell: ({ value }) => (value == null || value === 0 ? '' : String(value)),
    },
  },
  {
    id: 'menuName',
    header: 'Menu Name',
    accessorKey: 'menuName',
    size: 220,
    meta: {
      editable: true,
      editType: 'text',
      editPlaceholder: 'Menu name',
    },
  },
  {
    id: 'menuNameEng',
    header: 'Menu Name (Eng)',
    accessorKey: 'menuNameEng',
    size: 220,
    meta: {
      editable: true,
      editType: 'text',
      editPlaceholder: 'Menu name (eng)',
    },
  },
  {
    id: 'menuDesc',
    header: 'Description',
    accessorKey: 'menuDesc',
    size: 240,
    meta: {
      editable: true,
      editType: 'text',
      editPlaceholder: 'Description',
    },
  },
  {
    id: 'menuDescEng',
    header: 'Description (Eng)',
    accessorKey: 'menuDescEng',
    size: 240,
    meta: {
      editable: true,
      editType: 'text',
      editPlaceholder: 'Description (eng)',
    },
  },
  {
    id: 'menuLevel',
    header: 'Level',
    accessorKey: 'menuLevel',
    size: 80,
    meta: {
      align: 'center',
      editable: true,
      editType: 'number',
    },
  },
  {
    id: 'parentMenuId',
    header: 'Parent',
    accessorKey: 'parentMenuId',
    size: 140,
    meta: {
      align: 'center',
      editable: true,
      editType: 'number',
    },
  },
  {
    id: 'displayYn',
    header: 'Display',
    accessorKey: 'displayYn',
    size: 90,
    meta: {
      editable: true,
      editType: 'select',
      align: 'center',
      getEditOptions: (row: Menu) => options.getUseFlags?.(row) ?? fallbackUseFlags,
      renderCell: ({ value, row }) => {
        const resolved = options.getUseFlags?.(row) ?? fallbackUseFlags;
        const label = resolved.find((opt) => opt.value === String(value ?? ''))?.label;
        return label ?? String(value ?? '');
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
  {
    id: 'menuIcon',
    header: 'Icon',
    accessorKey: 'menuIcon',
    size: 160,
    meta: {
      editable: true,
      editType: 'text',
      editPlaceholder: 'Lucide icon name',
    },
  },
  {
    id: 'execComponent',
    header: 'Component',
    accessorKey: 'execComponent',
    size: 220,
    meta: {
      editable: true,
      editType: 'text',
      editPlaceholder: 'Component name',
    },
  },
  {
    id: 'sortOrder',
    header: 'Sort',
    accessorKey: 'sortOrder',
    size: 90,
    meta: {
      align: 'center',
      editable: true,
      editType: 'number',
    },
  },
];
