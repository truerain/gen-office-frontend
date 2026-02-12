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
    id: 'roleId',
    header: t('role.id', { defaultValue: 'Role ID' }),
    accessorKey: 'roleId',
    size: 120,
    meta: {
      align: 'center',
      pinned: 'left',
      renderCell: ({ value }) => {
        const id = Number(value);
        if (!Number.isFinite(id) || id <= 0) return '';
        return String(id);
      },
    },
  },
  {
    id: 'roleCd',
    header: t('role.code', { defaultValue: 'Role Code' }),
    accessorKey: 'roleCd',
    size: 160,
    meta: {
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
    size: 200,
    meta: {
      editable: true,
      editType: 'text',
      editPlaceholder: 'Role name',
    },
  },
  {
    id: 'roleNameEng',
    header: t('role.nameEng', { defaultValue: 'Role Name (Eng)' }),
    accessorKey: 'roleNameEng',
    size: 200,
    meta: {
      editable: true,
      editType: 'text',
      editPlaceholder: 'Role name (eng)',
    },
  },
  {
    id: 'roleDesc',
    header: t('role.description', { defaultValue: 'Description' }),
    accessorKey: 'roleDesc',
    size: 260,
    meta: {
      editable: true,
      editType: 'text',
      editPlaceholder: 'Description',
    },
  },
  {
    id: 'useYn',
    header: t('common.useYn', { defaultValue: 'Use' }),
    accessorKey: 'useYn',
    size: 100,
    meta: {
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
    id: 'sortOrder',
    header: t('common.sortOrder', { defaultValue: 'Sort Order' }),
    accessorKey: 'sortOrder',
    size: 110,
    meta: {
      align: 'center',
      editable: true,
      editType: 'number',
    },
  },
  {
    id: 'lastUpdatedBy',
    header: t('common.updatedBy', { defaultValue: 'Updated By' }),
    accessorKey: 'lastUpdatedBy',
    size: 140,
  },
  {
    id: 'lastUpdatedDate',
    header: t('common.updatedAt', { defaultValue: 'Updated At' }),
    accessorKey: 'lastUpdatedDate',
    size: 180,
  },
];
