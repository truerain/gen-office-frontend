import { useMemo, useRef, useState } from 'react';
import { RefreshCcw, UserCog } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import { PopupInput, SimpleFilterBar, type FilterField } from '@gen-office/ui';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { HttpError } from '@/shared/api/http';
import { useUserRoleListQuery } from '@/entities/system/user-role/api/userRole';
import type { UserRoleListParams } from '@/entities/system/user-role/model/types';
import { useAppStore } from '@/app/store/appStore';
import { useAlertDialog } from '@/shared/ui/AlertDialogProvider';
import {
  UserSearchPopup,
  USER_SEARCH_POPUP_CONTENT_CLASS_NAME,
} from '@/shared/ui/popup/UserSearchPopup';

import styles from './UserRoleManagementPage.module.css';
import { createUserRoleManagementColumns } from './UserRoleManagementColumns';
import {
  commitUserRoleChanges,
  hasMissingUserRoleRequired,
  toUserRoleRowId,
  type UserRoleGridRow,
} from './UserRoleManagementCrud';

type UserRoleFilters = {
  userId: string;
  roleId: string;
  useYn: string;
};

const defaultFilters: UserRoleFilters = {
  userId: '',
  roleId: '',
  useYn: '',
};

const defaultCreateRow = {
  userId: 0,
  roleId: 0,
  primaryYn: 'N',
  useYn: 'Y',
  empNo: '',
  empName: '',
  orgName: '',
  roleName: '',
  attribute1: '',
  attribute2: '',
  attribute3: '',
  attribute4: '',
  attribute5: '',
  attribute6: '',
  attribute7: '',
  attribute8: '',
  attribute9: '',
  attribute10: '',
  createdAt: '',
  updatedAt: '',
};

function toPositiveIntOrUndefined(input: string) {
  const value = Number(input);
  if (!Number.isFinite(value)) return undefined;
  const normalized = Math.trunc(value);
  if (normalized <= 0) return undefined;
  return normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function UserRoleManagementPage(_props: PageComponentProps) {
  const addNotification = useAppStore((state) => state.addNotification);
  const { openAlert, openConfirm } = useAlertDialog();

  const [gridDirty, setGridDirty] = useState(false);
  const [draftFilters, setDraftFilters] = useState<UserRoleFilters>(defaultFilters);
  const [filters, setFilters] = useState<UserRoleFilters>(defaultFilters);
  const tempSeqRef = useRef(1);

  const queryParams = useMemo<UserRoleListParams>(
    () => ({
      userId: toPositiveIntOrUndefined(filters.userId.trim()),
      roleId: toPositiveIntOrUndefined(filters.roleId.trim()),
      useYn: filters.useYn.trim().toUpperCase() || undefined,
      page: 0,
      size: 200,
      sort: 'user_id asc, role_id asc',
    }),
    [filters]
  );

  const { data: userRoleList = [], refetch, dataUpdatedAt } = useUserRoleListQuery(queryParams);
  const rows = useMemo<UserRoleGridRow[]>(
    () =>
      userRoleList.map((item) => ({
        ...item,
        _rowId: toUserRoleRowId(item),
      })),
    [userRoleList]
  );

  const columns = useMemo(() => createUserRoleManagementColumns(), []);

  const filterFields = useMemo<FilterField<UserRoleFilters>[]>(() => {
    return [
      {
        key: 'userId',
        title: 'User ID',
        type: 'custom',
        flex: 0,
        render: (value, onChange) => (
          <PopupInput
            value={String(value ?? '')}
            onValueChange={onChange}
            onCommitValue={(_, committedSelection) => {
              console.log('[UserRoleManagementPage] PopupInput onCommitValue:', {
                committedSelection,
              });
            }}
            placeholder="Search user"
            readOnly={false}
            contentClassName={USER_SEARCH_POPUP_CONTENT_CLASS_NAME}
            content={({ open, close, value: popupValue, setSelection }) => (
              <UserSearchPopup
                key={`${open}:${popupValue}`}
                initialKeyword={popupValue}
                onSelectUser={(selection) => {
                  setSelection(selection);
                  onChange(selection.value);
                }}
                onClose={close}
              />
            )}
          />
        ),
      },
      { key: 'roleId', title: 'Role ID', type: 'text', placeholder: '', flex: 0 },
      { key: 'useYn', title: 'Use(Y/N)', type: 'text', placeholder: 'Y | N', flex: 0 },
    ];
  }, []);

  const handleSearch = () => {
    const same =
      draftFilters.userId.trim() === filters.userId.trim() &&
      draftFilters.roleId.trim() === filters.roleId.trim() &&
      draftFilters.useYn.trim().toUpperCase() === filters.useYn.trim().toUpperCase();

    setFilters(draftFilters);
    if (same) void refetch();
  };

  return (
    <div className={styles.page} data-grid-dirty={gridDirty ? 'true' : 'false'}>
      <PageHeader
        title="User Role Management"
        description="Manage user-role mappings."
        breadcrumbItems={[
          { label: 'System', icon: <UserCog size={16} /> },
          { label: 'User Role Management', icon: <UserCog size={16} /> },
        ]}
      />
      <div className={styles.filter}>
        <SimpleFilterBar
          value={draftFilters}
          fields={filterFields}
          onChange={setDraftFilters}
          onSearch={handleSearch}
          searchLabel="검색"
        />
      </div>
      <div className={styles.workarea}>
        <GenGridCrud<UserRoleGridRow>
          title="User Role List"
          data={rows}
          columns={columns}
          getRowId={(row) => row._rowId}
          createRow={() => ({
            ...defaultCreateRow,
            _rowId: `tmp:${Date.now()}:${tempSeqRef.current++}`,
          })}
          makePatch={({ columnId, value }) => {
            if (columnId === 'empNo' && isRecord(value)) {
              return value as Partial<UserRoleGridRow>;
            }
            return { [columnId]: value } as Partial<UserRoleGridRow>;
          }}
          deleteMode="selected"
          actionBar={{
            position: 'top',
            defaultStyle: 'icon',
            includeBuiltIns: ['add', 'delete', 'save', 'filter', 'reset'],
            customActions: [
              {
                key: 'refresh',
                label: 'Refresh',
                icon: <RefreshCcw aria-hidden size={16} />,
                side: 'right',
                style: 'icon',
                order: 20,
                onClick: () => {
                  void refetch();
                },
              },
            ],
          }}
          beforeCommit={({ changes }) => {
            if (hasMissingUserRoleRequired(changes)) {
              void openAlert({ title: 'userId, roleId, primaryYn, useYn are required. (Y or N)' });
              return false;
            }
            return openConfirm({ title: 'Do you want to save?' });
          }}
          onCommit={async ({ changes, ctx }) => {
            await commitUserRoleChanges(changes, ctx.viewData);
            await refetch();
            await openAlert({ title: 'Saved successfully.' });
            return { ok: true };
          }}
          onCommitError={({ error }) => {
            console.error(error);
            if (error instanceof HttpError && error.status === 409) {
              addNotification('이미 존재하는 사용자-권한 매핑입니다.', 'error');
              return;
            }
            if (error instanceof HttpError && error.status === 404) {
              addNotification('사용자 또는 권한 정보를 찾을 수 없습니다.', 'error');
              return;
            }
            const message = error instanceof Error ? error.message : 'Commit failed (see console).';
            addNotification(message, 'error');
          }}
          onStateChange={({ dirty }) => {
            setGridDirty(dirty);
          }}
          gridProps={{
            dataVersion: dataUpdatedAt,
            rowHeight: 34,
            overscan: 8,
            enablePinning: true,
            enableColumnSizing: true,
            enableVirtualization: true,
            enableRowStatus: true,
            checkboxSelection: true,
            editOnActiveCell: false,
            keepEditingOnNavigate: true,
            enableFooterRow: false,
            enableStickyFooterRow: true,
            enableActiveRowHighlight: true,
          }}
        />
      </div>
    </div>
  );
}
