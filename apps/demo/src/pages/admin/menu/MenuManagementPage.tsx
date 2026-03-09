import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, MonitorCog, SquareMenu } from 'lucide-react';

import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { useAppMenuListQuery } from '@/app/menu/api/appMenu';
import { buildSystemMenuData } from '@/app/menu/menuData';
import { getIconComponent } from '@/app/menu/model/iconMapper';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { usePageContext } from '@/contexts/PageContext';
import { SplitLayout, TreeView } from '@gen-office/ui';
import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { Menu, MenuListParams } from '@/pages/admin/menu/model/types';
import { menuApi, useMenuListQuery } from '@/pages/admin/menu/api/menu';
import { useAppStore } from '@/app/store/appStore';
import { useAlertDialog } from '@/shared/ui/AlertDialogProvider';

import { createMenuManagementColumns } from './MenuManagementColumns';
import { commitMenuChanges, createMenuRow, validateMenuChanges } from './MenuManagementCrud';
import styles from './MenuManagementPage.module.css';

type MenuNode = {
  id: number;
  parent_id: number;
  label: string;
};

const ROOT_ID = -1;
const isRootMenu = (menu: Menu) => (menu.parentMenuId ?? 0) === 0;

function MenuManagementPage(props: PageComponentProps) {
  const { t } = useTranslation();
  const addNotification = useAppStore((state) => state.addNotification);
  const { menuId: contextMenuId } = usePageContext();

  const queryParams = useMemo<MenuListParams>(() => ({}), []);
  const { data: menuList = [], refetch: refetchMenuList } = useMenuListQuery(queryParams);

  const { data: appMenuList = [] } = useAppMenuListQuery();
  const systemMenuData = useMemo(() => buildSystemMenuData(appMenuList), [appMenuList]);

  const currentMenuId = props.menuId ?? contextMenuId;
  const currentAppMenu = useMemo(
    () => (currentMenuId ? systemMenuData.byId.get(currentMenuId) ?? null : null),
    [systemMenuData.byId, currentMenuId]
  );

  const pageTitle = t('admin.menu.title', { defaultValue: 'Menu Management' });
  const sectionTitle = t('admin.system.title', { defaultValue: 'System Management' });
  const homeLabel = t('common.home', { defaultValue: 'Home' });

  const breadcrumbItems = useMemo(() => {
    if (!currentMenuId) {
      return [
        { label: homeLabel, icon: <Home size={16} /> },
        { label: sectionTitle, icon: <MonitorCog size={16} /> },
        { label: pageTitle, icon: <SquareMenu size={16} /> },
      ];
    }

    const path = systemMenuData.breadcrumbById.get(currentMenuId);
    if (!path || path.length === 0) {
      return [
        { label: homeLabel, icon: <Home size={16} /> },
        { label: sectionTitle, icon: <MonitorCog size={16} /> },
        { label: pageTitle, icon: <SquareMenu size={16} /> },
      ];
    }

    return path.map((item) => ({
      label: item.label,
      icon: getIconComponent(item.icon, 16),
    }));
  }, [currentMenuId, systemMenuData.breadcrumbById, homeLabel, pageTitle, sectionTitle]);

  const [menuData, setMenuData] = useState<Menu[]>([]);
  const [childMenus, setChildMenus] = useState<Menu[]>([]);
  const [menuVersion, setMenuVersion] = useState(0);

  const [selectedNodeId, setSelectedNodeId] = useState<number>(ROOT_ID);
  const didInit = useRef(false);
  const loadingParentsRef = useRef(new Set<string>());
  const { openAlert, openConfirm } = useAlertDialog();

  const mergeMenus = useCallback((nextMenus: Menu[]) => {
    if (nextMenus.length === 0) return;
    setMenuData((prev) => {
      const map = new Map(prev.map((item) => [item.menuId, item]));
      nextMenus.forEach((item) => map.set(item.menuId, item));
      return Array.from(map.values());
    });
  }, []);

  useEffect(() => {
    if (didInit.current) return;
    if (menuList.length === 0) return;
    setMenuData(menuList);
    didInit.current = true;
  }, [menuList]);

  const fetchChildren = useCallback(
    async (nodeId: number) => {
      const parentId = nodeId === ROOT_ID ? 0 : nodeId;
      const parentKey = String(parentId);
      if (loadingParentsRef.current.has(parentKey)) return;
      loadingParentsRef.current.add(parentKey);
      try {
        const children = await menuApi.children(parentId);
        setChildMenus(children);
        mergeMenus(children);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        const message =
          error instanceof Error
            ? error.message
            : t('admin.menu.error.load_children_failed', {
                defaultValue: 'Failed to load menu children.',
              });
        addNotification(message, 'error');
      } finally {
        loadingParentsRef.current.delete(parentKey);
      }
    },
    [addNotification, mergeMenus, t]
  );

  useEffect(() => {
    void fetchChildren(ROOT_ID);
  }, [fetchChildren]);

  const treeData = useMemo<MenuNode[]>(
    () => [
      {
        id: ROOT_ID,
        parent_id: 0,
        label: t('admin.menu.tree.root', { defaultValue: 'GenOffice' }),
      },
      ...menuData.map((item) => ({
        id: item.menuId,
        parent_id: isRootMenu(item) ? ROOT_ID : item.parentMenuId,
        label: item.menuName || item.menuNameEng || String(item.menuId),
      })),
    ],
    [menuData, t]
  );

  const rootIds = useMemo(() => [ROOT_ID], []);

  const selectedNode = useMemo(
    () => menuData.find((node) => node.menuId === selectedNodeId) ?? null,
    [menuData, selectedNodeId]
  );

  const columns = useMemo(() => createMenuManagementColumns(t), [t]);

  const dataVersion = useMemo(
    () => `${selectedNodeId ?? 'none'}-${menuVersion}`,
    [selectedNodeId, menuVersion]
  );

  return (
    <div className={styles.page}>
      <PageHeader
        title={currentAppMenu?.label || pageTitle}
        description={
          currentAppMenu
            ? t('admin.menu.description.selected', {
                defaultValue: 'Manage selected menu. (Menu ID: {{menuId}})',
                menuId: currentAppMenu.menuId,
              })
            : t('admin.menu.description.default', {
                defaultValue: 'Manage system menus. (Menu ID: {{menuId}})',
                menuId: currentMenuId ?? '-',
              })
        }
        breadcrumbItems={breadcrumbItems}
      />

      <div className={styles.content}>
        <SplitLayout
          className={styles.splitLayout}
          resizable={true}
          left={
            <div className={styles.wrapTreeView}>
              <TreeView
                title=" "
                data={treeData}
                selectedId={selectedNodeId}
                onSelect={(node) => {
                  const nextId = node?.id ?? ROOT_ID;
                  setSelectedNodeId(nextId);
                  void fetchChildren(nextId);
                }}
                defaultExpandedIds={rootIds}
              />
            </div>
          }
          right={
            <div className={styles.detailPane}>
              <GenGridCrud<Menu>
                title={t('admin.menu.grid.title', { defaultValue: 'Menu List' })}
                key={selectedNodeId ?? 'none'}
                data={childMenus}
                columns={columns}
                getRowId={(row) => row.menuId}
                createRow={() => createMenuRow(selectedNode)}
                makePatch={({ columnId, value }) => ({ [columnId]: value } as Partial<Menu>)}
                deleteMode="selected"
                onCommit={async ({ changes, ctx }) => {
                  await commitMenuChanges(changes, ctx.viewData);
                  const refreshed = await refetchMenuList();
                  if (refreshed.data) {
                    setMenuData(refreshed.data);
                  }
                  await fetchChildren(selectedNodeId);
                  setMenuVersion((v) => v + 1);
                  await openAlert({
                    title: t('common.saved', { defaultValue: 'Saved successfully.' }),
                  });
                  return { ok: true };
                }}
                beforeCommit={({ changes }) => {
                  const validation = validateMenuChanges(changes);
                  if (!validation.ok) {
                    const code = validation.errors[0]?.code;
                    const title =
                      code === 'MENU_ID_REQUIRED'
                        ? t('admin.menu.validation.menu_id_required', {
                            defaultValue: 'Please enter Menu ID.',
                          })
                        : t('common.validation.invalid_input', {
                            defaultValue: 'Please check your input.',
                          });
                    void openAlert({ title });
                    return false;
                  }
                  return openConfirm({
                    title: t('common.confirm_save', { defaultValue: 'Do you want to save?' }),
                  });
                }}
                onCommitError={({ error }) => {
                  // eslint-disable-next-line no-console
                  console.error(error);
                  const message =
                    error instanceof Error
                      ? error.message
                      : t('common.commit_failed', { defaultValue: 'Commit failed (see console)' });
                  addNotification(message, 'error');
                }}
                actionBar={{
                  position: 'top',
                  defaultStyle: 'icon',
                  includeBuiltIns: ['add', 'delete', 'save', 'filter', 'excel'],
                }}
                excelExport={{
                  mode: 'frontend',
                  frontend: { onlySelected: false },
                }}
                gridProps={{
                  dataVersion,
                  rowHeight: 34,
                  overscan: 8,
                  enablePinning: true,
                  enableColumnSizing: true,
                  enableVirtualization: true,
                  enableRowStatus: true,
                  checkboxSelection: true,
                  enablePagination: false,
                  editOnActiveCell: false,
                  keepEditingOnNavigate: true,
                  enableActiveRowHighlight: true,
                }}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}

export default MenuManagementPage;
