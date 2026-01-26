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
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Home, MonitorCog, SquareMenu } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { CrudChange } from '@gen-office/gen-grid-crud';
import type { Menu, MenuListParams } from '@/entities/system/menu/model/types';
import { useMenuListQuery } from '@/entities/system/menu/api/menu';

import styles from './MenuManagementPage.module.css';
import { SplitLayout, TreeView } from '@gen-office/ui';

type MenuNode = {
  id: string;
  parent_id: string | null;
  label: string;
};

const createMenuId = () =>
  `menu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const buildChildrenMap = (items: readonly Menu[]) => {
  const map = new Map<string | null, string[]>();
  for (const item of items) {
    const key = item.prnt_menu_id || null;
    const list = map.get(key);
    if (list) list.push(item.menu_id);
    else map.set(key, [item.menu_id]);
  }
  return map;
};

const applyMenuChanges = (prev: readonly Menu[], changes: readonly CrudChange<Menu>[]) => {
  const created = new Map<string, Menu>();
  const updated = new Map<string, Partial<Menu>>();
  const deleted = new Set<string>();

  for (const change of changes) {
    switch (change.type) {
      case 'create': {
        created.set(String(change.tempId), change.row);
        break;
      }
      case 'update': {
        const key = String(change.rowId);
        const createdRow = created.get(key);
        if (createdRow) {
          created.set(key, { ...createdRow, ...change.patch });
        } else {
          updated.set(key, { ...(updated.get(key) ?? {}), ...change.patch });
        }
        break;
      }
      case 'delete': {
        const key = String(change.rowId);
        if (created.has(key)) {
          created.delete(key);
        } else {
          deleted.add(key);
        }
        break;
      }
      case 'undelete': {
        deleted.delete(String(change.rowId));
        break;
      }
      default:
        break;
    }
  }

  let next = prev.map((row) => {
    const patch = updated.get(row.menu_id);
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

  return next.filter((row) => !deleted.has(row.menu_id));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MenuManagementPage(_props:  PageComponentProps) {
  const queryParams = useMemo<MenuListParams>(() => ({}), []);
  const { data: menuList = [] } = useMenuListQuery(queryParams);

  const didInit = useRef(false);
  const [menuData, setMenuData] = useState<Menu[]>([]);
  const [menuVersion, setMenuVersion] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (didInit.current) return;
    if (menuList.length === 0) return;
    setMenuData(menuList);
    didInit.current = true;
  }, [menuList]);

  const treeData = useMemo<MenuNode[]>(
    () =>
      menuData.map((item) => ({
        id: item.menu_id,
        parent_id: item.prnt_menu_id || null,
        label: item.menu_name || item.menu_name_eng || item.menu_id,
      })),
    [menuData]
  );

  const rootIds = useMemo(
    () => treeData.filter((node) => node.parent_id == null).map((node) => node.id),
    [treeData]
  );

  const selectedNode = useMemo(
    () => menuData.find((node) => node.menu_id === selectedNodeId) ?? null,
    [menuData, selectedNodeId]
  );

  const childMenus = useMemo(
    () => menuData.filter((node) => (node.prnt_menu_id || null) === selectedNodeId),
    [menuData, selectedNodeId]
  );

  const columns = useMemo<ColumnDef<Menu>[]>(
    () => [
      {
        id: 'menu_id',
        header: 'Menu ID',
        accessorKey: 'menu_id',
        meta: {
          width: 160,
          align: 'center',
        },
      },
      {
        id: 'menu_name',
        header: 'Menu Name',
        accessorKey: 'menu_name',
        meta: {
          width: 220,
          editable: true,
          editType: 'text',
          editPlaceholder: 'Menu name',
        },
      },
      {
        id: 'menu_name_eng',
        header: 'Menu Name (Eng)',
        accessorKey: 'menu_name_eng',
        meta: {
          width: 220,
          editable: true,
          editType: 'text',
          editPlaceholder: 'Menu name (eng)',
        },
      },
      {
        id: 'menu_desc',
        header: 'Description',
        accessorKey: 'menu_desc',
        meta: {
          width: 240,
          editable: true,
          editType: 'text',
          editPlaceholder: 'Description',
        },
      },
      {
        id: 'menu_level',
        header: 'Level',
        accessorKey: 'menu_level',
        meta: {
          width: 80,
          align: 'center',
          editable: true,
          editType: 'text',
        },
      },
      {
        id: 'prnt_menu_id',
        header: 'Parent',
        accessorKey: 'prnt_menu_id',
        meta: {
          width: 160,
          align: 'center',
          editable: true,
          editType: 'text',
        },
      },
      {
        id: 'display_flag',
        header: 'Display',
        accessorKey: 'display_flag',
        meta: {
          width: 90,
          align: 'center',
          editable: true,
          editType: 'text',
        },
      },
      {
        id: 'use_flag',
        header: 'Use',
        accessorKey: 'use_flag',
        meta: {
          width: 90,
          align: 'center',
          editable: true,
          editType: 'text',
        },
      },
      {
        id: 'sort_order',
        header: 'Sort',
        accessorKey: 'sort_order',
        meta: {
          width: 90,
          align: 'center',
          editable: true,
          editType: 'number',
        },
      },
      {
        id: 'url',
        header: 'URL',
        accessorKey: 'url',
        meta: {
          width: 240,
          editable: true,
          editType: 'text',
        },
      },
    ],
    []
  );

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
                title="전체 메뉴 트리"
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
                  getRowId={(row) => row.menu_id}
                  createRow={() => ({
                    menu_id: createMenuId(),
                    menu_name: '',
                    menu_name_eng: '',
                    menu_desc: '',
                    menu_level: selectedNode ? String(Number(selectedNode.menu_level || 0) + 1) : '1',
                    prnt_menu_id: selectedNode?.menu_id ?? '',
                    display_flag: 'Y',
                    use_flag: 'Y',
                    sort_order: 0,
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
                    alert('Commit failed (see console)');
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


