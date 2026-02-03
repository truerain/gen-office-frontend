import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import type { Menu } from '@/entities/system/menu/model/types';

import { SimpleSelect, Switch } from '@gen-office/ui';

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
        id: 'menuId',
        header: t('menu.id'),
        accessorKey: 'menuId',
        meta: {
          width: 160,
          align: 'center',
        },
      },
      {
        id: 'menuName',
        header: 'Menu Name',
        accessorKey: 'menuName',
        meta: {
          width: 220,
          editable: true,
          editType: 'text',
          editPlaceholder: 'Menu name',
        },
      },
      {
        id: 'menuNameEng',
        header: 'Menu Name (Eng)',
        accessorKey: 'menuNameEng',
        meta: {
          width: 220,
          editable: true,
          editType: 'text',
          editPlaceholder: 'Menu name (eng)',
        },
      },
      {
        id: 'menuDesc',
        header: 'Description',
        accessorKey: 'menuDesc',
        meta: {
          width: 240,
          editable: true,
          editType: 'text',
          editPlaceholder: 'Description',
        },
      },
      {
        id: 'menuLevel',
        header: 'Level',
        accessorKey: 'menuLevel',
        meta: {
          width: 80,
          align: 'center',
          editable: true,
          editType: 'number',
        },
      },
      {
        id: 'prntMenuId',
        header: 'Parent',
        accessorKey: 'prntMenuId',
        meta: {
          width: 160,
          align: 'center',
          editable: true,
          editType: 'number',
        },
      },
      {
        id: 'dsplFlag',
        header: 'Display',
        accessorKey: 'dsplFlag',
        meta: {
            width: 80,
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
        id: 'useFlag',
        header: '사용여부',
        accessorKey: 'useFlag',
        meta: {
          width: 90,
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
        id: 'sortOrder',
        header: 'Sort',
        accessorKey: 'sortOrder',
        meta: {
          width: 90,
          align: 'center',
          editable: true,
          editType: 'number',
        },
      },
      {
        id: 'url',
        header: 'URL',
        accessorKey: 'url',
        meta: {
          width: 240,
          editable: true,
          editType: 'text',
        },
      },
    ]
;
