/**
 * @file [RoleManagementPage.tsx]
 * @path apps/demo/src/pages/admin/role/RoleManagementPage.tsx
 * @summary
 * @details
 * -
 * -
 * @usage
 * -
 * @notes
 * -
 */

import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, Shield } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import { SplitLayout } from '@gen-office/ui';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { useRoleListQuery } from '@/entities/system/role/api/role';
import { useRoleMenuViewQuery } from '@/entities/system/role-menu/api/roleMenu';
import type { RoleMenu } from '@/entities/system/role-menu/model/types';
import type { Role, RoleListParams } from '@/entities/system/role/model/types';
import { useAppStore } from '@/app/store/appStore';
import { useAlertDialog } from '@/shared/ui/AlertDialogProvider';

import styles from './RoleManagementPage.module.css';
import { createRoleMenuColumns } from './RoleMenuColumns';
import { createRoleManagementColumns } from './RoleManagementColumns';
import { commitRoleChanges, hasMissingRoleName } from './RoleManagementCrud';

const defaultRoleAttributes = {
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
} as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function RoleManagementPage(_props: PageComponentProps) {
  const { t } = useTranslation('common');
  const addNotification = useAppStore((state) => state.addNotification);
  const { openAlert, openConfirm } = useAlertDialog();

  const [gridDirty, setGridDirty] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const tempRoleIdRef = useRef(-1);

  const queryParams = useMemo<RoleListParams>(() => ({}), []);
  const { data: roleList = [], refetch, dataUpdatedAt } = useRoleListQuery(queryParams);
  const {
    data: roleMenuList = [],
    dataUpdatedAt: roleMenuUpdatedAt,
    isFetching: isRoleMenuLoading,
  } = useRoleMenuViewQuery(selectedRoleId);

  const columns = useMemo(() => createRoleManagementColumns(t), [t]);
  const roleMenuColumns = useMemo(() => createRoleMenuColumns(t), [t]);
  const selectedRole = useMemo(
    () => roleList.find((role) => role.roleId === selectedRoleId) ?? null,
    [roleList, selectedRoleId]
  );

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
      <div className={styles.content}>
        <SplitLayout
          className={styles.splitLayout}
          leftWidth="60%"
          left={
            <div className={styles.pane}>
              <GenGridCrud<Role>
                title="Role List"
                data={roleList}
                columns={columns}
                getRowId={(row) => row.roleId}
                createRow={() => ({
                  roleId: tempRoleIdRef.current--,
                  roleCd: '',
                  roleName: '',
                  roleNameEng: '',
                  roleDesc: '',
                  sortOrder: 0,
                  useYn: 'Y',
                  createdBy: 'admin',
                  lastUpdatedBy: 'admin',
                  ...defaultRoleAttributes,
                })}
                makePatch={({ columnId, value }) => ({ [columnId]: value } as Partial<Role>)}
                deleteMode="selected"
                actionBar={{
                  position: 'top',
                  defaultStyle: 'icon',
                  includeBuiltIns: ['add', 'delete', 'save', 'filter'],
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
                  await commitRoleChanges(changes, ctx.viewData);
                  await refetch();
                  await openAlert({ title: 'Saved successfully.' });
                  return { ok: true };
                }}
                beforeCommit={({ changes }) => {
                  if (hasMissingRoleName(changes)) {
                    void openAlert({ title: 'Please enter Role Name.' });
                    return false;
                  }
                  return openConfirm({ title: 'Do you want to save?' });
                }}
                onCommitError={({ error }) => {
                  console.error(error);
                  const message = error instanceof Error ? error.message : 'Commit failed (see console).';
                  addNotification(message, 'error');
                }}
                onStateChange={({ dirty, selectedRowIds, activeRowId }) => {
                  setGridDirty(dirty);
                  const preferredRowId = selectedRowIds[0] ?? activeRowId;
                  const parsed = Number(preferredRowId);
                  if (!Number.isFinite(parsed) || parsed <= 0) {
                    setSelectedRoleId(null);
                    return;
                  }
                  setSelectedRoleId(parsed);
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
          }
          right={
            <div className={styles.pane}>
              <div className={styles.roleMenuHeader}>
                <span>Role Menu</span>
                <span className={styles.roleMenuMeta}>
                  {selectedRole
                    ? `${selectedRole.roleName ?? selectedRole.roleCd ?? selectedRole.roleId}`
                    : 'Select a role'}
                  {isRoleMenuLoading ? ' (Loading...)' : ''}
                </span>
              </div>
              <GenGridCrud<RoleMenu>
                title="Role Menu List"
                data={selectedRoleId == null ? [] : roleMenuList}
                columns={roleMenuColumns}
                getRowId={(row) => row.menuId}
                deleteMode="selected"
                actionBar={{ enabled: false }}
                onCommit={async () => ({ ok: true })}
                gridProps={{
                  dataVersion: `${selectedRoleId ?? 'none'}-${roleMenuUpdatedAt}`,
                  rowHeight: 34,
                  overscan: 8,
                  enablePinning: true,
                  enableColumnSizing: true,
                  enableVirtualization: true,
                  enableRowStatus: false,
                  enableRowSelection: false,
                  editOnActiveCell: false,
                  keepEditingOnNavigate: true,
                  tree: {
                    enabled: true,
                    idKey: 'menuId',
                    parentIdKey: 'parentMenuId',
                    treeColumnId: 'treeItem',
                    rootParentValue: 0,
                    indentPx: 14,
                    showOrphanWarning: true,
                    onOrphanRowsChange: (rowIds) => {
                      if (!rowIds.length) return;
                      // eslint-disable-next-line no-console
                      console.warn('[MenuManagementPage] orphan menu rows detected:', rowIds);
                    },
                  },
                }}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
