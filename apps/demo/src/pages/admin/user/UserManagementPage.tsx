/**
 * @file UserManagementPage.tsx
 * @path apps/demo/src/pages/user/UserManagementPage.tsx
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, Users } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import { SimpleFilterBar, type FilterField } from '@gen-office/ui';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { useUserListQuery } from '@/entities/system/user/api/user';
import type { User, UserListParams } from '@/entities/system/user/model/types';
import { useAppStore } from '@/app/store/appStore';

import styles from './UserManagementPage.module.css';
import { createUserManagementColumns } from './UserManagementColumns';
import { commitUserChanges } from './UserManagementCrud';

const createUserId = () => (Date.now() + Math.floor(Math.random() * 1000));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function UserManagementPage(_props: PageComponentProps) {
  const { t } = useTranslation('common');
  const addNotification = useAppStore((state) => state.addNotification);

  const [gridDirty, setGridDirty] = useState(false);

  const [draftFilters, setDraftFilters] = useState<{ empName: string, email: string }>({ empName: '', email: '' });
  const [filters, setFilters] = useState<{ empName: string }>({ empName: '' });
  const queryParams = useMemo<UserListParams>(
    () => ({
      empName: filters.empName?.trim() || undefined,
    }),
    [filters.empName]
  );
  const { data: userList = [], refetch, dataUpdatedAt } = useUserListQuery(queryParams);

  const columns = useMemo(() => createUserManagementColumns(t), [t]);

  const filterFields = useMemo<FilterField<{ empName: string, email: string }>[]>(() => {
    return [
      {
        key: 'empName',
        title:t('username'),
        type: 'text',
        placeholder: '',
        flex: 0,
      },
      {
        key: 'email',
        title:t('email'),
        type: 'text',
        placeholder: '',
        flex: 0,
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
          onCommit={async ({ changes, ctx }) => {
            await commitUserChanges(changes, ctx.viewData);
            await refetch();
            return { ok: true };
          }}
          onCommitError={({ error }) => {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Commit failed (see console).';
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
            enableRowSelection: true,
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
