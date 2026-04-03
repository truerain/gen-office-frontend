/**
 * @file UserManagementPage.tsx
 * @path apps/demo/src/pages/user/UserManagementPage.tsx
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, Users } from 'lucide-react';

import {
  GenGridCrud,
  type AdditionalExportDefinition,
  type CrudChange,
  type CrudRowId,
} from '@gen-office/gen-grid-crud';
import { SimpleFilterBar, type FilterField } from '@gen-office/ui';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { useUserListQuery } from '@/pages/admin/user/api/user';
import type { User, UserListParams } from '@/pages/admin/user/model/types';
import { useAppStore } from '@/app/store/appStore';
import { resolveApiErrorMessage } from '@/shared/api/errorMessage';

import styles from './UserManagementPage.module.css';
import { createUserManagementColumns } from './UserManagementColumns';
import { commitUserChanges } from './UserManagementCrud';
import { useAlertDialog } from '@/shared/ui/AlertDialogContext';
import { type User2 } from '@/pages/admin/user/model/types';

const createUserId = () => (Date.now() + Math.floor(Math.random() * 1000));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function UserManagementPage(_props: PageComponentProps) {
  const { t } = useTranslation('common');
  const addNotification = useAppStore((state) => state.addNotification);
  const { openAlert, openConfirm } = useAlertDialog();

  const [gridDirty, setGridDirty] = useState(false);

  const [draftFilters, setDraftFilters] = useState<{ empName: string, email: string, country: string }>({
    empName: '',
    email: '',
    country: '',
  });
  const [filters, setFilters] = useState<{ empName: string }>({ empName: '' });
  const queryParams = useMemo<UserListParams>(
    () => ({
      empName: filters.empName?.trim() || undefined,
    }),
    [filters.empName]
  );
  const { data: userList = [], refetch, dataUpdatedAt } = useUserListQuery(queryParams);

  const columns = useMemo(() => createUserManagementColumns(t), [t]);
  const additionalExports = useMemo<readonly AdditionalExportDefinition<User2, User2>[]>(() => {
    return [
      {
        key: 'user-upload-template',
        label: 'User Upload Template',
        fileName: 'user_upload_template',
        sheetName: 'UserTemplate',
        defaultBorder: true,
        source: () => ({
          columns: [
            { id: 'userId', header: 'User ID', accessorKey: 'userId' },
            { id: 'empNo', header: 'Employee No', accessorKey: 'empNo' },
            { id: 'empName', header: 'Employee Name', accessorKey: 'empName' },
            { id: 'email', header: 'Email', accessorKey: 'email' },
            { id: 'orgId', header: 'Org ID', accessorKey: 'orgId' },
            { id: 'langCd', header: 'Language', accessorKey: 'langCd' },
          ],
          data: Array.from({ length: 20 }, (_, index) => ({
            userId: index + 1,
            empNo: '',
            empName: '',
            empNameEng: '',
            password: '',
            email: '',
            orgId: '',
            title: '',
            langCd: 'ko',
            createdBy: '',
          })),
          getRowId: (row) => row.userId,
        }),
      },
    ];
  }, []);

  const filterFields = useMemo<FilterField<{ empName: string, email: string, country: string }>[]>(() => {
    return [
      {
        key: 'empName',
        title:t('username'),
        type: 'text',
        placeholder: '',
        flex: 0,
        enterToSearch: true,
      },
      {
        key: 'email',
        title:t('email'),
        type: 'text',
        placeholder: '',
        flex: 0,
      },
      {
        key: 'country',
        title: 'Country',
        type: 'combo',
        placeholder: 'Select country',
        flex: 0,
        maxVisibleItems: 6,
        optionItemHeight: 32,
        options: [
          { value: 'jp', label: 'Japan (JP)', group: 'Asia' },
          { value: 'kr', label: 'South Korea (KR)', group: 'Asia' },
          { value: 'cn', label: 'China (CN)', group: 'Asia' },
          { value: 'fr', label: 'France (FR)', group: 'Europe' },
          { value: 'de', label: 'Germany (DE)', group: 'Europe' },
          { value: 'gb', label: 'United Kingdom (GB)', group: 'Europe' },
          { value: 'ca', label: 'Canada (CA)', group: 'North America' },
          { value: 'us', label: 'United States (US)', group: 'North America' },
        ],
      },
    ];
  }, [t]);

  const handleSearch = () => {
    const same = draftFilters.empName.trim() === filters.empName.trim();
    setFilters(draftFilters);
    if (same) refetch();
  };

  return (
    <div className={styles.page} data-grid-dirty={gridDirty ? 'true' : 'false'}>
      <PageHeader
        title="사용자 관리"
        description="사용자 정보를 조회/관리합니다."
        breadcrumbItems={[
          { label: 'System', icon: <Users size={16} /> },
          { label: 'User Management', icon: <Users size={16} /> },
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
        <GenGridCrud<User>
          key={`user-${dataUpdatedAt}`}
          title={"사용자목록"}
          data={userList}
          columns={columns}
          getRowId={(row) => row.userId}
          createRow={() => ({
            userId: createUserId(),
            empNo: '',
            empName: '',
            empNameEng: '',
            password: '',
            email: '',
            orgId: '',
            title: '',
            langCd: 'ko',
            createdBy: 'admin',
            lastUpdatedBy: 'admin',
          })}
          makePatch={({ columnId, value }) => ({ [columnId]: value } as Partial<User>)}
          deleteMode="selected"
          actionBar={{
            position: 'top',
            defaultStyle: 'icon',
            includeBuiltIns: ['add', 'delete', 'save', 'filter', 'excel'],
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
              {
                key: 'download-template',
                label: 'Upload Template',
                side: 'right',
                style: 'icon',
                order: 30,
                onClick: async (ctx) => {
                  await ctx.api.exportAdditional?.('user-upload-template');
                },
              },
            ],
          }}
          excelExport={{
            mode: 'frontend',
            frontend: { onlySelected: false },
          }}
          additionalExports={additionalExports}
          beforeCommit={({ changes }) => {
            if (hasMissingUserRequired(changes)) {
              void openAlert({
                type: 'warning',
                message: 'Class Code and Class Name are required.',
              });
              return false;
            }
            return openConfirm({ title: 'Do you want to save?' });
          }}
          onCommit={async ({ changes, ctx }) => {
            await commitUserChanges(changes, ctx.viewData);
            await refetch();
            await openAlert({ type: 'success', message: 'Saved successfully.' });
            return { ok: true };
          }}
          onCommitError={({ error }) => {
            console.error(error);
            const message = resolveApiErrorMessage(error, {
              defaultMessage: t('commit_failed', { defaultValue: 'Commit failed (see console).' }),
              t,
            });
            addNotification(message, 'error');
          }}
          onCellEdit={({ rowId, columnId, rowIndex, prevValue, nextValue }) => {
            console.log('[UserManagement] cell edit', {
              rowId,
              columnId,
              rowIndex,
              prevValue,
              nextValue,
            });
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
            enableRowNumber: true,
            checkboxSelection: true,
            editOnActiveCell: false,
            enableRangeSelection: true,
            keepEditingOnNavigate: true,
            enableFooterRow: false,
            enableStickyFooterRow: true,
          }}
        />
      </div>
    </div>
  );
}


function normalize(value: unknown) {
  return String(value ?? '').trim();
}

export function hasMissingUserRequired(
  changes: readonly CrudChange<User>[]
) {
  const created = new Map<CrudRowId, User>();
  const patches = new Map<CrudRowId, Partial<User>>();

  for (const change of changes) {
    if (change.type === 'create') {
      created.set(change.tempId, change.row);
      continue;
    }
    if (change.type === 'update') {
      patches.set(change.rowId, { ...(patches.get(change.rowId) ?? {}), ...change.patch });
    }
  }

  return Array.from(created.entries()).some(([tempId, row]) => {
    const merged = { ...row, ...(patches.get(tempId) ?? {}) };
    return !normalize(merged.userId) || !normalize(merged.empName);
  });
}
