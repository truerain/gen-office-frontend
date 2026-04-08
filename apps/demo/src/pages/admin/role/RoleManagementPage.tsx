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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, Shield } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { CrudChange, CrudRowId } from '@gen-office/gen-grid-crud';
import { SplitLayout } from '@gen-office/ui';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { useRoleListQuery } from '@/pages/admin/role/api/role';
import { useRoleMenuViewQuery } from '@/pages/admin/role/api/roleMenu';
import type { RoleMenu } from '@/pages/admin/role/model/roleMenuTypes';
import type { Role, RoleListParams } from '@/pages/admin/role/model/types';
import { useAppStore } from '@/app/store/appStore';
import { useAlertDialog } from '@/shared/ui/AlertDialogContext';
import { resolveApiErrorMessage } from '@/shared/api/errorMessage';

import layoutStyles from '../_shared/AdminPageLayout.module.css';
import styles from './RoleManagementPage.module.css';
import { createRoleMenuColumns } from './RoleMenuColumns';
import { createRoleManagementColumns } from './RoleManagementColumns';
import {
  commitRoleChanges,
  commitRoleMenuChanges,
  createRoleRow,
  getRoleValidationMessage,
  validateRoleChanges,
} from './RoleManagementCrud';

function parseRoleId(rowId: CrudRowId | undefined): number | null {
  const parsed = Number(rowId);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function normalizeRoleId(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function collectDescendantMenuIds(
  parentMenuId: number,
  childrenByParent: Map<number, number[]>
): number[] {
  const result: number[] = [];
  const queue = [...(childrenByParent.get(parentMenuId) ?? [])];
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);
    const children = childrenByParent.get(current);
    if (children?.length) queue.push(...children);
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function RoleManagementPage(_props: PageComponentProps) {
  const { t, i18n } = useTranslation('common');
  const addNotification = useAppStore((state) => state.addNotification);
  const { openAlert, openConfirm } = useAlertDialog();

  const [gridDirty, setGridDirty] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedRoleRowIds, setSelectedRoleRowIds] = useState<readonly CrudRowId[]>([]);
  const [roleMenuDirty, setRoleMenuDirty] = useState(false);
  const roleMenuChangesRef = useRef<readonly CrudChange<RoleMenu>[]>([]);
  const roleMenuViewRowsRef = useRef<readonly RoleMenu[]>([]);
  const selectionTransitionRef = useRef(false);
  const selectedRoleIdRef = useRef<number | null>(null);
  const suppressAutoSelectRef = useRef(false);
  const tempRoleIdRef = useRef(-1);

  const queryParams = useMemo<RoleListParams>(() => ({}), []);
  const { data: roleList = [], refetch, dataUpdatedAt } = useRoleListQuery(queryParams);
  const {
    data: roleMenuList = [],
    refetch: refetchRoleMenu,
    dataUpdatedAt: roleMenuUpdatedAt,
    isFetching: isRoleMenuLoading,
  } = useRoleMenuViewQuery(selectedRoleId);

  const columns = useMemo(() => createRoleManagementColumns(t), [t]);
  const roleMenuColumns = useMemo(() => createRoleMenuColumns(t, i18n.language), [t, i18n.language]);
  const selectedRole = useMemo(
    () => roleList.find((role) => normalizeRoleId(role.roleId) === selectedRoleId) ?? null,
    [roleList, selectedRoleId]
  );

  const applyActiveRole = useCallback((nextRoleId: number | null) => {
    suppressAutoSelectRef.current = nextRoleId == null;
    setSelectedRoleId(nextRoleId);
    selectedRoleIdRef.current = nextRoleId;
    setRoleMenuDirty(false);
    roleMenuChangesRef.current = [];
    roleMenuViewRowsRef.current = [];
  }, []);

  useEffect(() => {
    selectedRoleIdRef.current = selectedRoleId;
  }, [selectedRoleId]);

  useEffect(() => {
    if (roleList.length === 0) {
      if (selectedRoleId != null || selectedRoleRowIds.length > 0) {
        applyActiveRole(null);
        setSelectedRoleRowIds([]);
      }
      suppressAutoSelectRef.current = false;
      return;
    }

    const hasSelectedRole =
      selectedRoleId != null &&
      roleList.some((role) => normalizeRoleId(role.roleId) === selectedRoleId);
    if (hasSelectedRole) return;
    if (suppressAutoSelectRef.current) return;

    const firstRoleId = normalizeRoleId(roleList[0]?.roleId);
    if (firstRoleId == null) return;
    applyActiveRole(firstRoleId);
  }, [applyActiveRole, roleList, selectedRoleId, selectedRoleRowIds]);

  const handleActiveRoleChange = async (nextRoleId: number | null) => {
    const currentRoleId = selectedRoleIdRef.current;

    if (nextRoleId === currentRoleId) {
      return;
    }

    if (!roleMenuDirty || currentRoleId == null) {
      applyActiveRole(nextRoleId);
      return;
    }

    if (selectionTransitionRef.current) return;
    selectionTransitionRef.current = true;

    try {
      const saveFirst = await openConfirm({
        title: t('admin.role.role_menu.unsaved_confirm_save', {
          defaultValue: 'Role Menu has unsaved changes. Save before switching role?',
        }),
        buttonSet: 'yesNo',
      });

      if (saveFirst) {
        const pendingChanges = roleMenuChangesRef.current;
        if (pendingChanges.length > 0) {
          await commitRoleMenuChanges(currentRoleId, pendingChanges, roleMenuViewRowsRef.current);
          await refetchRoleMenu();
          await openAlert({
            type: 'success',
            message: t('common.saved', { defaultValue: 'Saved successfully.' }),
          });
        }
        applyActiveRole(nextRoleId);
        return;
      }

      const discardAndMove = await openConfirm({
        title: t('admin.role.role_menu.unsaved_confirm_discard', {
          defaultValue: 'Discard unsaved changes and switch role?',
        }),
        buttonSet: 'yesNo',
      });

      if (discardAndMove) {
        applyActiveRole(nextRoleId);
      }
    } catch (error) {
      console.error(error);
      const message = resolveApiErrorMessage(error, {
        defaultMessage: t('admin.role.error.switch_failed', { defaultValue: 'Failed to switch role.' }),
        t,
      });
      addNotification(message, 'error');
    } finally {
      selectionTransitionRef.current = false;
    }
  };

  return (
    <div className={`${layoutStyles.page} ${styles.page}`} data-grid-dirty={gridDirty ? 'true' : 'false'}>
      <PageHeader
        title={t('admin.role.title', { defaultValue: 'Role Management' })}
        description={t('admin.role.description', { defaultValue: 'Manage system roles.' })}
        breadcrumbItems={[
          { label: t('admin.system.title', { defaultValue: 'System' }), icon: <Shield size={16} /> },
          { label: t('admin.role.title', { defaultValue: 'Role Management' }), icon: <Shield size={16} /> },
        ]}
      />
      <div className={styles.content}>
        <SplitLayout
          className={styles.splitLayout}
          leftWidth="60%"
          resizable={true}
          left={
            <div className={styles.pane}>
              <GenGridCrud<Role>
                title={t('admin.role.grid.role_list', { defaultValue: 'Role List' })}
                data={roleList}
                columns={columns}
                getRowId={(row) => row.roleId}
                rowSelection={selectedRoleRowIds}
                onRowSelectionChange={(rowIds) => {
                  setSelectedRoleRowIds(rowIds);
                }}
                onActiveRowChange={({ rowId }) => {
                  void handleActiveRoleChange(parseRoleId(rowId ?? undefined));
                }}
                createRow={() => createRoleRow(tempRoleIdRef.current--)}
                makePatch={({ columnId, value }) => ({ [columnId]: value } as Partial<Role>)}
                deleteMode="selected"
                actionBar={{
                  position: 'top',
                  defaultStyle: 'icon',
                  includeBuiltIns: ['add', 'delete', 'save', 'filter'],
                  customActions: [
                    {
                      key: 'refresh',
                      label: t('common.refresh', { defaultValue: 'Refresh' }),
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
                  await openAlert({
                    type: 'success',
                    message: t('common.saved', { defaultValue: 'Saved successfully.' }),
                  });
                  return { ok: true };
                }}
                beforeCommit={({ changes }) => {
                  const validation = validateRoleChanges(changes);
                  if (!validation.ok) {
                    const code = validation.errors[0]?.code;
                    const message = code ? getRoleValidationMessage(code) : null;
                    const title = message
                      ? t(message.key, { defaultValue: message.defaultValue })
                      : t('common.validation.invalid_input', {
                          defaultValue: 'Please check your input.',
                        });
                    void openAlert({ type: 'warning', message: title });
                    return false;
                  }
                  return openConfirm({
                    title: t('common.confirm_save', { defaultValue: 'Do you want to save?' }),
                  });
                }}
                onCommitError={({ error }) => {
                  // eslint-disable-next-line no-console
                  console.error(error);
                  const message = resolveApiErrorMessage(error, {
                    defaultMessage: t('common.commit_failed', { defaultValue: 'Commit failed (see console)' }),
                    t,
                  });
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
                  enableRowNumber: true,
                  enableRowStatus: true,
                  checkboxSelection: true,
                  editOnActiveCell: false,
                  keepEditingOnNavigate: true,
                  enableActiveRowHighlight: true,
                }}
              />
            </div>
          }
          right={
            <div className={styles.pane}>
              <div className={styles.roleMenuHeader}>
                <span>{t('admin.role.grid.role_menu', { defaultValue: 'Role Menu' })}</span>
                <span className={styles.roleMenuMeta}>
                  {selectedRole
                    ? `${selectedRole.roleName ?? selectedRole.roleCd ?? selectedRole.roleId}`
                    : t('admin.role.role_menu.select_role', { defaultValue: 'Select a role' })}
                  {isRoleMenuLoading
                    ? t('common.loading_suffix', { defaultValue: ' (Loading...)' })
                    : ''}
                </span>
              </div>
              <GenGridCrud<RoleMenu>
                key={`${selectedRoleId ?? 'none'}-${roleMenuUpdatedAt}`}
                title={t('admin.role.grid.role_menu_list', { defaultValue: 'Role Menu List' })}
                data={selectedRoleId == null ? [] : roleMenuList}
                columns={roleMenuColumns}
                getRowId={(row) => row.menuId}
                deleteMode="selected"
                actionBar={{
                  position: 'top',
                  defaultStyle: 'icon',
                  includeBuiltIns: ['save'],
                }}
                beforeCommit={() =>
                  openConfirm({
                    title: t('common.confirm_save', { defaultValue: 'Do you want to save?' }),
                  })
                }
                onCommit={async ({ changes, ctx }) => {
                  if (selectedRoleId == null) {
                    const message = t('admin.role.role_menu.select_role_first', {
                      defaultValue: 'Select a role first.',
                    });
                    await openAlert({ type: 'warning', message });
                    return { ok: false, error: new Error(message) };
                  }

                  await commitRoleMenuChanges(selectedRoleId, changes, ctx.viewData);
                  await refetchRoleMenu();
                  await openAlert({
                    type: 'success',
                    message: t('common.saved', { defaultValue: 'Saved successfully.' }),
                  });
                  return { ok: true };
                }}
                onCommitError={({ error }) => {
                  // eslint-disable-next-line no-console
                  console.error(error);
                  const message = resolveApiErrorMessage(error, {
                    defaultMessage: t('common.commit_failed', { defaultValue: 'Commit failed (see console)' }),
                    t,
                  });
                  addNotification(message, 'error');
                }}
                onStateChange={({ dirty, changes, viewData }) => {
                  setRoleMenuDirty(dirty);
                  roleMenuChangesRef.current = changes;
                  roleMenuViewRowsRef.current = viewData;
                }}
                onCellEdit={({ columnId, rowId, nextValue, viewData }) => {
                  if (columnId !== 'useYn') return [];
                  const rootMenuId = Number(rowId);
                  if (!Number.isFinite(rootMenuId)) return [];

                  const childrenByParent = new Map<number, number[]>();
                  for (const row of viewData) {
                    const parentId = Number(row.parentMenuId);
                    if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, []);
                    childrenByParent.get(parentId)!.push(row.menuId);
                  }

                  const descendants = collectDescendantMenuIds(rootMenuId, childrenByParent);
                  const normalizedUseYn = String(nextValue ?? 'N');
                  return descendants.map((menuId) => ({
                    rowId: menuId,
                    patch: { useYn: normalizedUseYn },
                  }));
                }}
                gridProps={{
                  dataVersion: `${selectedRoleId ?? 'none'}-${roleMenuUpdatedAt}`,
                  rowHeight: 34,
                  overscan: 8,
                  enablePinning: true,
                  enableColumnSizing: true,
                  enableVirtualization: true,
                  enableRowStatus: true,
                  checkboxSelection: false,
                  editOnActiveCell: false,
                  keepEditingOnNavigate: true,
                  enableActiveRowHighlight: true,
                  tree: {
                    enabled: true,
                    idKey: 'menuId',
                    parentIdKey: 'parentMenuId',
                    treeColumnId: 'treeItem',
                    rootParentValue: 0,
                    indentPx: 14,
                    defaultExpanded: true,
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
