import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import type { Role } from '@/entities/system/role/model/types';

export type SelectOption = { label: string; value: string };

const fallbackUseFlags: SelectOption[] = [
  { label: 'Y', value: 'Y' },
  { label: 'N', value: 'N' },
];

type RoleManagementColumnOptions = {
  getUseFlags?: (row: Role) => SelectOption[];
};

export const createRoleManagementColumns = (
  t: TFunction,
  options: RoleManagementColumnOptions = {}
): ColumnDef<Role>[] => [
  {
    id: 'id',
    header: t('role.id', { defaultValue: 'Role ID' }),
    accessorKey: 'id',
    meta: {
      width: 120,
      align: 'center',
      pinned: 'left',
    },
  },
  {
    id: 'roleCode',
    header: t('role.code', { defaultValue: 'Role Code' }),
    accessorKey: 'roleCode',
    meta: {
      width: 160,
      editable: true,
      editType: 'text',
      align: 'center',
      editPlaceholder: 'ROLE_CODE',
    },
  },
  {
    id: 'roleName',
    header: t('role.name', { defaultValue: 'Role Name' }),
    accessorKey: 'roleName',
    meta: {
      width: 200,
      editable: true,
      editType: 'text',
      editPlaceholder: 'Role name',
    },
  },
  {
    id: 'roleDesc',
    header: t('role.description', { defaultValue: 'Description' }),
    accessorKey: 'roleDesc',
    meta: {
      width: 260,
      editable: true,
      editType: 'text',
      editPlaceholder: 'Description',
    },
  },
  {
    id: 'useFlag',
    header: t('common.useYn', { defaultValue: 'Use' }),
    accessorKey: 'useFlag',
    meta: {
      width: 100,
      editable: true,
      editType: 'select',
      align: 'center',
      getEditOptions: (row: Role) => options.getUseFlags?.(row) ?? fallbackUseFlags,
      renderCell: ({ value, row }) => {
        const resolved = options.getUseFlags?.(row) ?? fallbackUseFlags;
        const label = resolved.find((opt) => opt.value === String(value ?? ''))?.label;
        return label ?? String(value ?? '');
      },
    },
  },
  {
    id: 'lastUpdatedBy',
    header: t('common.updatedBy', { defaultValue: 'Updated By' }),
    accessorKey: 'lastUpdatedBy',
    meta: {
      width: 140,
    },
  },
  {
    id: 'lastUpdatedDate',
    header: t('common.updatedAt', { defaultValue: 'Updated At' }),
    accessorKey: 'lastUpdatedDate',
    meta: {
      width: 180,
    },
  },
];
