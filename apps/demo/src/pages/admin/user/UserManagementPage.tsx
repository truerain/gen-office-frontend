/**
 * @file UserManagementPage.tsx
 * @path apps/demo/src/pages/user/UserManagementPage.tsx
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { CrudChange, CrudRowId } from '@gen-office/gen-grid-crud';
import { SimpleFilterBar, type FilterField } from '@gen-office/ui';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { useUserListQuery, userApi } from '@/entities/system/user/api/user';
import type { User, UserListParams, UserRequest } from '@/entities/system/user/model/types';

import styles from './UserManagementPage.module.css';
import { createUserManagementColumns } from './UserManagementColumns';

const createUserId = () => (Date.now() + Math.floor(Math.random() * 1000));

const toUserRequest = (input: Partial<User>): UserRequest => ({
  empNo: input.empNo,
  empName: input.empName,
  empNameEng: input.empNameEng,
  password: input.password,
  email: input.email,
  orgId: input.orgId,
  title: input.title,
  langCd: input.langCd,
  createdBy: input.createdBy,
  lastUpdatedBy: input.lastUpdatedBy,
});

function findUserById(rows: readonly User[], rowId: CrudRowId) {
  const id = Number(rowId);
  if (!Number.isFinite(id)) return undefined;
  return rows.find((row) => row.userId === id);
}

async function commitUserChanges(
  changes: readonly CrudChange<User>[],
  ctxRows: readonly User[]
) {
  const created = new Map<CrudRowId, User>();
  const updated = new Map<CrudRowId, Partial<User>>();
  const deleted = new Set<CrudRowId>();

  for (const change of changes) {
    switch (change.type) {
      case 'create':
        created.set(change.tempId, change.row);
        break;
      case 'update':
        updated.set(change.rowId, { ...(updated.get(change.rowId) ?? {}), ...change.patch });
        break;
      case 'delete':
        deleted.add(change.rowId);
        break;
      case 'undelete':
      default:
        break;
    }
  }

  for (const [tempId, row] of created.entries()) {
    if (deleted.has(tempId)) continue;
    const patch = updated.get(tempId);
    const merged = patch ? { ...row, ...patch } : row;
    await userApi.create(toUserRequest(merged));
  }

  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;
    const baseRow = findUserById(ctxRows, rowId);
    const merged = baseRow ? { ...baseRow, ...patch } : patch;
    const id = Number(rowId);
    if (!Number.isFinite(id)) continue;
    await userApi.update(id, toUserRequest(merged));
  }

  for (const rowId of deleted) {
    const id = Number(rowId);
    if (!Number.isFinite(id)) continue;
    await userApi.remove(id);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function UserManagementPage(_props: PageComponentProps) {
  const { t } = useTranslation();

  const [gridDirty, setGridDirty] = useState(false);

  const [draftFilters, setDraftFilters] = useState<{ empName: string }>({ empName: '' });
  const [filters, setFilters] = useState<{ empName: string }>({ empName: '' });
  const queryParams = useMemo<UserListParams>(
    () => ({
      empName: filters.empName?.trim() || undefined,
    }),
    [filters.empName]
  );
  const { data: userList = [], refetch, dataUpdatedAt } = useUserListQuery(queryParams);

  const columns = useMemo(() => createUserManagementColumns(t), [t]);

  const filterFields = useMemo<FilterField<{ empName: string }>[]>(() => {
    return [
      {
        key: 'empName',
        title:t('user.name'),
        type: 'text',
        placeholder: '',
        flex: 0,
      },
    ];
  }, []);

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
          showActionBar
          actionBarPosition="top"
          onCommit={async ({ changes, ctx }) => {
            await commitUserChanges(changes, ctx.viewData);
            await refetch();
            return { ok: true };
          }}
          onCommitError={({ error }) => {
            console.error(error);
            alert('Commit failed (see console).');
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
            enableFooterRow: true,
            enableStickyFooterRow: true,
            enableActiveRowHighlight: true,
          }}
        />
      </div>
    </div>
  );
}
