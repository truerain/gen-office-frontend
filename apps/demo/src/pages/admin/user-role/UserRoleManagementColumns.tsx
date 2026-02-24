import type { ColumnDef } from '@tanstack/react-table';
import type { UserRoleGridRow } from './UserRoleManagementCrud';

const useYnOptions = [
  { label: 'Y', value: 'Y' },
  { label: 'N', value: 'N' },
];

const ynOptions = [
  { label: 'Y', value: 'Y' },
  { label: 'N', value: 'N' },
];

export const createUserRoleManagementColumns = (): ColumnDef<UserRoleGridRow>[] => [
  {
    id: 'userId',
    header: 'User ID',
    accessorKey: 'userId',
    size: 120,
    meta: {
      editable: true,
      editType: 'number',
      align: 'right',
      pinned: 'left',
    },
  },
  {
    id: 'roleId',
    header: 'Role ID',
    accessorKey: 'roleId',
    size: 120,
    meta: {
      editable: true,
      editType: 'number',
      align: 'right',
      pinned: 'left',
    },
  },
  {
    id: 'empNo',
    header: 'Emp No',
    accessorKey: 'empNo',
    size: 120,
    meta: {
      pinned: 'left',
    },
  },
  {
    id: 'empName',
    header: 'Emp Name',
    accessorKey: 'empName',
    size: 160,
    meta: {
      pinned: 'left',
    },
  },
  {
    id: 'orgName',
    header: 'Org Name',
    accessorKey: 'orgName',
    size: 180,
  },
  {
    id: 'roleName',
    header: 'Role Name',
    accessorKey: 'roleName',
    size: 160,
  },
  {
    id: 'primaryYn',
    header: 'Primary',
    accessorKey: 'primaryYn',
    size: 100,
    meta: {
      editable: true,
      editType: 'select',
      align: 'center',
      getEditOptions: () => ynOptions,
    },
  },
  {
    id: 'useYn',
    header: 'Use',
    accessorKey: 'useYn',
    size: 90,
    meta: {
      editable: true,
      editType: 'select',
      align: 'center',
      getEditOptions: () => useYnOptions,
    },
  },
  {
    id: 'attribute1',
    header: 'Attribute 1',
    accessorKey: 'attribute1',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute2',
    header: 'Attribute 2',
    accessorKey: 'attribute2',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute3',
    header: 'Attribute 3',
    accessorKey: 'attribute3',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute4',
    header: 'Attribute 4',
    accessorKey: 'attribute4',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute5',
    header: 'Attribute 5',
    accessorKey: 'attribute5',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute6',
    header: 'Attribute 6',
    accessorKey: 'attribute6',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute7',
    header: 'Attribute 7',
    accessorKey: 'attribute7',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute8',
    header: 'Attribute 8',
    accessorKey: 'attribute8',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute9',
    header: 'Attribute 9',
    accessorKey: 'attribute9',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'attribute10',
    header: 'Attribute 10',
    accessorKey: 'attribute10',
    size: 160,
    meta: { editable: true, editType: 'text' },
  },
  {
    id: 'updatedAt',
    header: 'Updated At',
    accessorKey: 'updatedAt',
    size: 180,
    meta: {
      align: 'center',
    },
  },
];
