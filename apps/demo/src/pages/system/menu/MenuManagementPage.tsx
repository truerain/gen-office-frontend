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

import { useMemo, useState } from 'react';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Home, MonitorCog, SquareMenu } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { CrudChange } from '@gen-office/gen-grid-crud';

import styles from './MenuManagementPage.module.css';
import { SplitLayout, TreeView } from '@gen-office/ui';

type MenuNode = {
  id: string;
  parent_id: string | null;
  label: string;
};

export const treeSampleData = [
  { id: 'root-1', parent_id: null, label: 'Dashboard' },
  { id: 'root-2', parent_id: null, label: 'Management' },
  { id: 'root-3', parent_id: null, label: 'Settings' },

  { id: 'm-1', parent_id: 'root-2', label: 'Users' },
  { id: 'm-2', parent_id: 'root-2', label: 'Roles' },
  { id: 'm-3', parent_id: 'root-2', label: 'Teams' },

  { id: 'u-1', parent_id: 'm-1', label: 'Active Users' },
  { id: 'u-2', parent_id: 'm-1', label: 'Invitations' },

  { id: 's-1', parent_id: 'root-3', label: 'Profile' },
  { id: 's-2', parent_id: 'root-3', label: 'Security' },
  { id: 's-3', parent_id: 'root-3', label: 'Notifications' },

  { id: 't-1', parent_id: 'm-3', label: 'Engineering' },
  { id: 't-2', parent_id: 'm-3', label: 'Design' },
];

const createMenuId = () =>
  `menu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const buildChildrenMap = (items: readonly MenuNode[]) => {
  const map = new Map<string | null, string[]>();
  for (const item of items) {
    const key = item.parent_id;
    const list = map.get(key);
    if (list) list.push(item.id);
    else map.set(key, [item.id]);
  }
  return map;
};

const applyMenuChanges = (prev: readonly MenuNode[], changes: readonly CrudChange<MenuNode>[]) => {
  const created = new Map<string, MenuNode>();
  const updated = new Map<string, Partial<MenuNode>>();
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
    const patch = updated.get(row.id);
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

  return next.filter((row) => !deleted.has(row.id));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MenuManagementPage(_props:  PageComponentProps) {
  const [menuData, setMenuData] = useState<MenuNode[]>(
    treeSampleData as MenuNode[]
  );
  const [menuVersion, setMenuVersion] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = useMemo(
    () => menuData.find((node) => node.id === selectedNodeId) ?? null,
    [menuData, selectedNodeId]
  );

  const childMenus = useMemo(
    () => menuData.filter((node) => node.parent_id === selectedNodeId),
    [menuData, selectedNodeId]
  );

  const columns = useMemo<ColumnDef<MenuNode>[]>(
    () => [
      {
        id: 'id',
        header: 'ID',
        accessorKey: 'id',
        meta: {
          width: 160,
          align: 'center',
        },
      },
      {
        id: 'label',
        header: 'Name',
        accessorKey: 'label',
        meta: {
          width: 220,
          editable: true,
          editType: 'text',
          editPlaceholder: 'Menu name',
        },
      },
      {
        id: 'parent_id',
        header: 'Parent',
        accessorKey: 'parent_id',
        meta: {
          width: 160,
          align: 'center',
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
                data={menuData} // [{ id, parent_id, label, ... }]
                onSelect={(node) => setSelectedNodeId(node?.id ?? null)}
                defaultExpandedIds={['root-1']}
              />
            </div>
          }
          right={
            <div className={styles.detailPane}>
                <GenGridCrud<MenuNode>
                  key={selectedNodeId ?? 'none'}
                  data={childMenus}
                  columns={columns}
                  getRowId={(row) => row.id}
                  createRow={() => ({
                    id: createMenuId(),
                    parent_id: selectedNode?.id ?? '0',
                    label: '',
                  })}
                  makePatch={({ columnId, value }) => ({ [columnId]: value } as any)}
                  deleteMode="selected"
                  onCommit={async ({ changes }) => {
                    setMenuData((prev) => applyMenuChanges(prev, changes as CrudChange<MenuNode>[]));
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


