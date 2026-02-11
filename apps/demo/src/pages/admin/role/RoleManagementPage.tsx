/**
 * @file RoleManagementPage.tsx
 * @path apps/demo/src/pages/admin/role/RoleManagementPage.tsx
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { CrudChange, CrudRowId } from '@gen-office/gen-grid-crud';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { useRoleListQuery, roleApi } from '@/entities/system/role/api/role';
import type { Role, RoleListParams, RoleRequest } from '@/entities/system/role/model/types';
import { useAppStore } from '@/app/store/appStore';
import { useAlertDialog } from '@/shared/ui/AlertDialogProvider';

import styles from './RoleManagementPage.module.css';
import { createRoleManagementColumns } from './RoleManagementColumns';

const createRoleId = () => Date.now() + Math.floor(Math.random() * 1000);

const toRoleRequest = (input: Partial<Role>): RoleRequest => ({
  roleName: input.roleName,
  roleCode: input.roleCode,
  roleDesc: input.roleDesc,
  useFlag: input.useFlag,
  createdBy: input.createdBy,
  lastUpdatedBy: input.lastUpdatedBy,
});

function findRoleById(rows: readonly Role[], rowId: CrudRowId) {
  const id = Number(rowId);
  if (!Number.isFinite(id)) return undefined;
  return rows.find((row) => row.id === id);
}

async function commitRoleChanges(changes: readonly CrudChange<Role>[], ctxRows: readonly Role[]) {
  const created = new Map<CrudRowId, Role>();
  const updated = new Map<CrudRowId, Partial<Role>>();
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
    await roleApi.create(toRoleRequest(merged));
  }

  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;
    const baseRow = findRoleById(ctxRows, rowId);
    const merged = baseRow ? { ...baseRow, ...patch } : patch;
    const id = Number(rowId);
    if (!Number.isFinite(id)) continue;
    await roleApi.update(id, toRoleRequest(merged));
  }

  for (const rowId of deleted) {
    const id = Number(rowId);
    if (!Number.isFinite(id)) continue;
    await roleApi.remove(id);
  }
}

function hasMissingRoleName(changes: readonly CrudChange<Role>[]) {
  const created = new Map<CrudRowId, Role>();
  const patches = new Map<CrudRowId, Partial<Role>>();

  for (const change of changes) {
    if (change.type === 'create') {
      created.set(change.tempId, change.row);
      continue;
    }
    if (change.type === 'update') {
      patches.set(change.rowId, {
        ...(patches.get(change.rowId) ?? {}),
        ...change.patch,
      });
    }
  }

  const hasInvalidCreated = Array.from(created.entries()).some(([tempId, row]) => {
    const merged = { ...row, ...(patches.get(tempId) ?? {}) };
    return !String(merged.roleName ?? '').trim();
  });
  if (hasInvalidCreated) return true;

  return Array.from(patches.values()).some((patch) => {
    if (!Object.prototype.hasOwnProperty.call(patch, 'roleName')) return false;
    return !String(patch.roleName ?? '').trim();
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function RoleManagementPage(_props: PageComponentProps) {
  const { t } = useTranslation('common');
  const addNotification = useAppStore((state) => state.addNotification);
  const { openAlert, openConfirm } = useAlertDialog();

  const [gridDirty, setGridDirty] = useState(false);

  const queryParams = useMemo<RoleListParams>(() => ({}), []);
  const { data: roleList = [], refetch, dataUpdatedAt } = useRoleListQuery(queryParams);

  const columns = useMemo(() => createRoleManagementColumns(t), [t]);

  return (
    <div className={styles.page} data-grid-dirty={gridDirty ? 'true' : 'false'}>
      <PageHeader
        title="Role Management"
        description="Manage system roles."
        breadcrumbItems={[
          { label: 'System', icon: <Shield size={16} /> },
          { label: 'Role Management', icon: <Shield size={16} /> },
        ]}
      />
      <div className={styles.workarea}>
        <GenGridCrud<Role>
          title="Role List"
          data={roleList}
          columns={columns}
          getRowId={(row) => row.id}
          createRow={() => ({
            id: createRoleId(),
            roleCode: '',
            roleName: '',
            roleDesc: '',
            useFlag: 'Y',
            createdBy: 'admin',
            lastUpdatedBy: 'admin',
          })}
          makePatch={({ columnId, value }) => ({ [columnId]: value } as Partial<Role>)}
          deleteMode="selected"
          showActionBar
          actionBarPosition="top"
          onCommit={async ({ changes, ctx }) => {
            await commitRoleChanges(changes, ctx.viewData);
            await refetch();
            await openAlert({ title: '저장되었습니다.' });
            return { ok: true };
          }}
          beforeCommit={({ changes }) => {
            if (hasMissingRoleName(changes)) {
              void openAlert({ title: 'Role Name을 입력하세요.' });
              return false;
            }
            return openConfirm({ title: '저장하시겠습니까?' });
          }}
          onCommitError={({ error }) => {
            console.error(error);
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
            enableRowSelection: true,
            editOnActiveCell: false,
            keepEditingOnNavigate: true,
          }}
        />
      </div>
    </div>
  );
}
