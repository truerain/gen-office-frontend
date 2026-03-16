import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import type { Menu } from '@/pages/admin/menu/model/types';

import { GridYnSwitchCell } from '@/shared/ui/grid/GridYnSwitchCell';
import { handleGridYnSwitchSpace } from '@/shared/ui/grid/GridYnSwitchCell.utils';

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
    size: 140,
    meta: {
      pinned: 'left',
      align: 'center',
      editable: true,
      editType: 'number',
      editPlaceholder: 'Menu ID',
      validation: {
        validateOn: ['blur', 'commit'],
        rules: [
          { type: 'numeric' },
          { type: 'min', value: 1 },
          {
            type: 'custom',
            validate: ({ value, isCreate }) => {
              if (!isCreate) return null;
              const n = Number(value);
              if (Number.isFinite(n) && n > 0) return null;
              return {
                code: 'MENU_ID_REQUIRED',
                messageKey: 'admin.menu.validation.menu_id_required',
                defaultMessage: 'Please enter Menu ID.',
              };
            },
          },
        ],
      },
      renderCell: ({ value }) => (value == null || value === 0 ? '' : String(value)),
    },
  },
  {
    id: 'menuName',
    header: 'Menu Name',
    accessorKey: 'menuName',
    size: 220,
    meta: {
      pinned: 'left',
      editable: true,
      editType: 'text',
      editPlaceholder: 'Menu name',
      validation: {
        validateOn: ['blur', 'commit'],
        rules: [
          { type: 'required'},
        ],
      },
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
    },
  },
  {
    id: 'parentMenuId',
    header: 'Parent',
    accessorKey: 'parentMenuId',
    size: 140,
    meta: {
      align: 'center',
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
        <GridYnSwitchCell value={value} commitValue={commitValue} />
      ),
      onSpace: handleGridYnSwitchSpace,
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
    id: 'lastUpdatedDate',
    header: 'Last Updated At',
    accessorKey: 'lastUpdatedDate',
    size: 180,
    meta: {
      align: 'center',
    },
  },
];
