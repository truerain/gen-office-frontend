/**
 * @file [MenuManagementPage.tsx]
 * @path apps/demo/src/pages/system/menu/MenuManagementPage.tsx
 * @summary [메뉴 관리 페이지 컴포넌트]
 * @details
 * - [메뉴 관리 기능 구현]
 * - [메뉴 트리 표시 및 편집 기능 제공]
 * @usage
 * - [시스템 관리 메뉴 진입 위치]
 * @notes
 * - [주의사항/제약/성능]
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
import { useMenuListQuery } from '@/entities/system/menu/api/menu';
import { useAppStore } from '@/app/store/appStore';

import {createMenuManagementColumns} from './MenuManagementColumns';

import styles from './MenuManagementPage.module.css';

type MenuNode = {
  id: number;
  parent_id: number | null;
  label: string;
};

const ROOT_ID = -1;
const createMenuId = () => -(Date.now() + Math.floor(Math.random() * 1000));

const isRootMenu = (menu: Menu) => menu.prntMenuId == null || menu.prntMenuId === 0;

const buildChildrenMap = (items: readonly Menu[]) => {
  const map = new Map<number | null, number[]>();
  for (const item of items) {
    const key = item.prntMenuId || null;
    const list = map.get(key);
    if (list) list.push(item.menuId);
    else map.set(key, [item.menuId]);
  }
  return map;
};

const applyMenuChanges = (prev: readonly Menu[], changes: readonly CrudChange<Menu>[]) => {
  const created = new Map<number, Menu>();
  const updated = new Map<number, Partial<Menu>>();
  const deleted = new Set<number>();

  for (const change of changes) {
    switch (change.type) {
      case 'create': {
        created.set(Number(change.tempId), change.row);
        break;
      }
      case 'update': {
        const key = Number(change.rowId);
        const createdRow = created.get(key);
        if (createdRow) {
          created.set(key, { ...createdRow, ...change.patch });
        } else {
          updated.set(key, { ...(updated.get(key) ?? {}), ...change.patch });
        }
        break;
      }
      case 'delete': {
        const key = Number(change.rowId);
        if (created.has(key)) {
          created.delete(key);
        } else {
          deleted.add(key);
        }
        break;
      }
      case 'undelete': {
        deleted.delete(Number(change.rowId));
        break;
      }
      default:
        break;
    }
  }

  let next = prev.map((row) => {
    const patch = updated.get(row.menuId);
    return patch ? { ...row, ...patch } : row;
  });

  for (const row of created.values()) {
    next = [...next, row];
  }

  if (deleted.size === 0) return next;

  const childrenMap = buildChildrenMap(next);
  const stack = Array.from(deleted);
  while (stack.length) {
    const id = stack.pop()!;
    const children = childrenMap.get(id);
    if (!children) continue;
    for (const childId of children) {
      if (deleted.has(childId)) continue;
      deleted.add(childId);
      stack.push(childId);
    }
  }

  return next.filter((row) => !deleted.has(row.menuId));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MenuManagementPage(_props:  PageComponentProps) {
  const { t } = useTranslation();
  const addNotification = useAppStore((state) => state.addNotification);

  const queryParams = useMemo<MenuListParams>(() => ({}), []);
  const { data: menuList = [] } = useMenuListQuery(queryParams);

  const didInit = useRef(false);
  const [menuData, setMenuData] = useState<Menu[]>([]);
  const [menuVersion, setMenuVersion] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);


  useEffect(() => {
    if (didInit.current) return;
    if (menuList.length === 0) return;
    setMenuData(menuList);
    didInit.current = true;
  }, [menuList]);

  const treeData = useMemo<MenuNode[]>(
    () =>
      [
        { id: ROOT_ID, parent_id: null, label: 'GenOffice' },
        ...menuData.map((item) => ({
          id: item.menuId,
          parent_id: isRootMenu(item) ? ROOT_ID : item.prntMenuId || null,
          label: item.menuName || item.menuNameEng || String(item.menuId),
        })),
      ],
    [menuData]
  );

  const rootIds = useMemo(
    () => [ROOT_ID],
    [treeData]
  );

  const selectedNode = useMemo(
    () => menuData.find((node) => node.menuId === selectedNodeId) ?? null,
    [menuData, selectedNodeId]
  );

  const childMenus = useMemo(
    () => {
      if (selectedNodeId === ROOT_ID) {
        return menuData.filter(isRootMenu);
      }
      return menuData.filter((node) => (node.prntMenuId || null) === selectedNodeId);
    },
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
        {/* 메뉴 관리 컨텐츠 영역 */}
        <SplitLayout className={styles.splitLayout}
          left={
            <div className={styles.wrapTreeView}>
              <TreeView
                title=" "
                data={treeData} // [{ id, parent_id, label, ... }]
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
                    menuId: createMenuId(),
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
                  onCommit={async ({ changes }) => {
                    setMenuData((prev) => applyMenuChanges(prev, changes as CrudChange<Menu>[]));
                    setMenuVersion((v) => v + 1);
                    return { ok: true };
                  }}
                  onCommitError={({ error }) => {
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
                    editOnActiveCell: true,
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


