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
import { Shield } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { useRoleListQuery } from '@/entities/system/role/api/role';
import type { Role, RoleListParams } from '@/entities/system/role/model/types';
import { useAppStore } from '@/app/store/appStore';
import { useAlertDialog } from '@/shared/ui/AlertDialogProvider';

import styles from './RoleManagementPage.module.css';
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
  const tempRoleIdRef = useRef(-1);

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
          }}
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
