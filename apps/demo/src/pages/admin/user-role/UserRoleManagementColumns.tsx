import type { ColumnDef } from '@tanstack/react-table';
import { PopupEditor } from '@gen-office/gen-grid';
import type { CommonUser } from '@/shared/api/commonUser';
import type { UserRoleOption } from '@/pages/admin/user-role/model/types';
import {
  UserSearchPopup,
  USER_SEARCH_POPUP_CONTENT_CLASS_NAME,
} from '@/shared/ui/popup/UserSearchPopup';
import type { UserRoleGridRow } from './UserRoleManagementCrud';

const useYnOptions = [
  { label: 'Y', value: 'Y' },
  { label: 'N', value: 'N' },
];

const ynOptions = [
  { label: 'Y', value: 'Y' },
  { label: 'N', value: 'N' },
];

export const createUserRoleManagementColumns = (
  roleOptions: UserRoleOption[] = []
): ColumnDef<UserRoleGridRow>[] => [
  {
    id: 'empNo',
    header: 'Emp No',
    accessorKey: 'empNo',
    size: 120,
    meta: {
      editable: ({ row, rowId }) =>
        rowId.startsWith('tmp_') || String(row?._rowId ?? '').startsWith('tmp:'),
      pinned: 'left',
      renderEditor: (editorProps) => (
        <PopupEditor<UserRoleGridRow, CommonUser>
          editor={editorProps}
          placeholder="Search user"
          readOnly={false}
          contentClassName={USER_SEARCH_POPUP_CONTENT_CLASS_NAME}
          mapSelectionToValue={(selection) => {
            if (!selection?.data) return selection?.value ?? '';
            return {
              userId: selection.data.userId ?? 0,
              empNo: selection.data.empNo ?? '',
              empName: selection.data.empName ?? '',
              orgName: selection.data.orgName ?? '',
            } satisfies Partial<UserRoleGridRow>;
          }}
          renderPopupContent={({ open, close, value: popupValue, setSelection }) => (
            <UserSearchPopup
              key={`${open}:${editorProps.row.empName ?? popupValue}`}
              initialKeyword={editorProps.row.empName ?? popupValue}
              onSelectUser={(selection) => {
                setSelection(selection);
              }}
              onClose={close}
            />
          )}
        />
      ),
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
    accessorFn: (row) => String(row.roleId ?? ''),
    size: 160,
    meta: {
      editable: ({ row, rowId }) =>
        rowId.startsWith('tmp_') || String(row?._rowId ?? '').startsWith('tmp:'),
      editType: 'select',
      getEditOptions: () =>
        roleOptions.map((option) => ({
          label: option.label,
          value: String(option.value),
        })),
      renderCell: ({ row }) => {
        const roleId = Number(row.roleId ?? 0);
        const label = roleOptions.find((option) => option.value === roleId)?.label;
        return label ?? String(row.roleName ?? '');
      },
    },
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
    id: 'lastUpdatedBy',
    header: 'Updated By',
    accessorKey: 'lastUpdatedByName',
    size: 140,
  },
  {
    id: 'lastUpdatedDate',
    header: 'Updated At',
    accessorKey: 'lastUpdatedDate',
    size: 160,
  },
];
