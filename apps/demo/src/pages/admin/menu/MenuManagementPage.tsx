/**
 * @file [MenuManagementPage.tsx]
 * @path apps/demo/src/pages/system/menu/MenuManagementPage.tsx
 * @summary [메뉴 관리 페이지 컴포넌트]
 * @details
 * - [메뉴 관리 기능 구현]
 * - [메뉴 트리 표시 및 편집 기능 제공]
 * @usage
 * - [시스템관리메뉴 진입 위치]
 * @notes
 * - [주의사항/제약/기능]
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, MonitorCog, SquareMenu } from 'lucide-react';

import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { SplitLayout, TreeView } from '@gen-office/ui';
import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { CrudChange } from '@gen-office/gen-grid-crud';
import type { Menu, MenuListParams } from '@/entities/system/menu/model/types';
import { menuApi, useMenuListQuery } from '@/entities/system/menu/api/menu';
import { useAppStore } from '@/app/store/appStore';

import { createMenuManagementColumns } from './MenuManagementColumns';
import { applyMenuChanges, commitMenuChanges, hasMissingMenuId } from './MenuManagementCrud';

import styles from './MenuManagementPage.module.css';
import { useAlertDialog } from '@/shared/ui/AlertDialogProvider';


type MenuNode = {
  id: number;
  parent_id: number;
  label: string;
};


const ROOT_ID = -1;
const isRootMenu = (menu: Menu) => menu.prntMenuId === 0;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MenuManagementPage(_props: PageComponentProps) {
  const { t } = useTranslation();
  const addNotification = useAppStore((state) => state.addNotification);

  const queryParams = useMemo<MenuListParams>(() => ({}), []);
  const { data: menuList = [] } = useMenuListQuery(queryParams);

  const [menuData, setMenuData] = useState<Menu[]>([]);
  const [childMenus, setChildMenus] = useState<Menu[]>([]);
  const [menuVersion, setMenuVersion] = useState(0);
  
  const [selectedNodeId, setSelectedNodeId] = useState<number>(ROOT_ID);
  const didInit = useRef(false);
  const loadingParentsRef = useRef(new Set<string>());
  const { openAlert, openConfirm } = useAlertDialog();

  const mergeMenus = (nextMenus: Menu[]) => {
    if (nextMenus.length === 0) return;
    setMenuData((prev) => {
      const map = new Map(prev.map((item) => [item.menuId, item]));
      nextMenus.forEach((item) => map.set(item.menuId, item));
      return Array.from(map.values());
    });
  };

  useEffect(() => {
    if (didInit.current) return;
    if (menuList.length === 0) return;
    setMenuData(menuList);
    setChildMenus(menuList);   // 임시
    didInit.current = true;
  }, [menuList]);

  useEffect(() => {
    //void fetchChildren(selectedNodeId);  //임시
  }, [selectedNodeId]);

  const fetchChildren = async (nodeId: number) => {
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
      const message = error instanceof Error ? error.message : 'Failed to load menu children.';
      addNotification(message, 'error');
    } finally {
      loadingParentsRef.current.delete(parentKey);
    }
  };
  void fetchChildren;


  const treeData = useMemo<MenuNode[]>(
    () => [
      { id: ROOT_ID, parent_id: 0, label: 'GenOffice' },
      ...menuData.map((item) => ({
        id: item.menuId,
        parent_id: isRootMenu(item) ? ROOT_ID : item.prntMenuId,
        label: item.menuName || item.menuNameEng || String(item.menuId),
      })),
    ],
    [menuData]
  );

  const rootIds = useMemo(() => [ROOT_ID], [treeData]);

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
        title="메뉴 관리"
        description="시스템 메뉴를 관리하는 페이지입니다."
        breadcrumbItems={[
          {
            label: 'Home',
            icon: <Home size={16} />,
          },
          {
            label: '시스템 관리',
            icon: <MonitorCog size={16} />,
          },
          {
            label: '메뉴 관리',
            icon: <SquareMenu size={16} />,
          },
        ]}
      />
      <div className={styles.content}>
        {/* 메뉴 관리 콘텐츠 영역 */}
        <SplitLayout
          className={styles.splitLayout}
          left={
            <div className={styles.wrapTreeView}>
              <TreeView
                title=" "
                data={treeData}
                onSelect={(node) => setSelectedNodeId(node?.id ?? null)}
                defaultExpandedIds={rootIds}
              />
            </div>
          }
          right={
            <div className={styles.detailPane}>
              <GenGridCrud<Menu>
                key={selectedNodeId ?? 'none'}
                data={childMenus}
                columns={columns}
                getRowId={(row) => row.menuId}
                createRow={() => ({
                  menuId: 0,
                  menuName: '',
                  menuNameEng: '',
                  menuDesc: '',
                  menuLevel: selectedNode ? Number(selectedNode.menuLevel || 0) + 1 : 1,
                  prntMenuId: selectedNode?.menuId ?? 0,
                  dsplFlag: 'Y',
                  useFlag: 'Y',
                  sortOrder: 0,
                  url: '',
                })}
                makePatch={({ columnId, value }) => ({ [columnId]: value } as any)}
                deleteMode="selected"
                onCommit={async ({ changes, ctx }) => {
                  await commitMenuChanges(changes, ctx.viewData);
                  setChildMenus((prev) => applyMenuChanges(prev, changes as CrudChange<Menu>[]));
                  setMenuData((prev) => applyMenuChanges(prev, changes as CrudChange<Menu>[]));
                  setMenuVersion((v) => v + 1);
                    await openAlert({ title: '저장되었습니다.' });
                    return { ok: true };
                  }}
                beforeCommit={({ changes }) => {
                  if (hasMissingMenuId(changes)) {
                    void openAlert({ title: 'Menu ID를 입력하세요.' });
                    return false;
                  }
                    return openConfirm({ title: '저장하시겠습니까?' });
                  }}
                onCommitError={({ error }) => {
                  // eslint-disable-next-line no-console
                  console.error(error);
                  const message = error instanceof Error ? error.message : 'Commit failed (see console)';
                  addNotification(message, 'error');
                }}
                showActionBar
                actionBarPosition="top"
                gridProps={{
                  dataVersion,
                  rowHeight: 34,
                  overscan: 8,
                  enablePinning: true,
                  enableColumnSizing: true,
                  enableVirtualization: true,
                  enableRowStatus: true,
                  enableRowSelection: true,
                  enablePagination: false,
                  editOnActiveCell: true,
                  keepEditingOnNavigate: false,
                  tree: {
                    enabled: true,
                    idKey: 'menuId',
                    parentIdKey: 'prntMenuId',
                    treeColumnId: 'menuName',
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

export default MenuManagementPage;
