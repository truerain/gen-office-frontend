// apps/demo/src/utils/menuTree.ts
import type { MenuItem, MenuTreeItem } from '@/types/menu.types';

/**
 * 트리 구조로 메뉴 배열을 변환
 *
 * @param items - DB에서 가져온 플랫 메뉴 배열
 * @param parentId - 부모 메뉴 ID (루트부터 시작)
 * @param level - 트리 레벨 (0: 루트)
 * @param ancestors - 순환 참조 방지를 위한 상위 ID 집합
 */
export function buildMenuTree(
  items: MenuItem[],
  parentId: string | null = null,
  level: number = 0,
  ancestors: Set<string> = new Set()
): MenuTreeItem[] {
  return items
    .filter((item) => {
      const itemParentId = item.parentMenuId || null;
      const targetParentId = parentId || null;
      if (item.menuId === targetParentId) return false; // self-loop 방지
      return itemParentId === targetParentId;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((item) => {
      if (ancestors.has(item.menuId)) {
        return { ...item, level };
      }

      const nextAncestors = new Set(ancestors);
      nextAncestors.add(item.menuId);

      const treeItem: MenuTreeItem = {
        ...item,
        level,
        children: buildMenuTree(items, item.menuId, level + 1, nextAncestors),
      };

      if (treeItem.children && treeItem.children.length === 0) {
        delete treeItem.children;
      }

      return treeItem;
    });
}

/**
 * 트리 구조에서 특정 메뉴 찾기
 */
export function findMenuItemInTree(
  tree: MenuTreeItem[],
  menuId: string
): MenuTreeItem | undefined {
  for (const item of tree) {
    if (item.menuId === menuId) {
      return item;
    }

    if (item.children) {
      const found = findMenuItemInTree(item.children, menuId);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

/**
 * 플랫 구조에서 특정 메뉴 찾기
 */
export function findMenuItemById(
  items: MenuItem[],
  menuId: string
): MenuItem | undefined {
  return items.find((item) => item.menuId === menuId);
}

/**
 * 메뉴 전체 경로 가져오기 (breadcrumb 용)
 */
export function getMenuPath(
  items: MenuItem[],
  menuId: string
): string[] {
  const path: string[] = [];
  let currentId: string | null = menuId;

  while (currentId) {
    const item = items.find((i) => i.menuId === currentId);
    if (!item) break;

    path.unshift(currentId);
    currentId = item.parentMenuId;
  }

  return path;
}

/**
 * 특정 메뉴의 모든 하위 메뉴 ID 가져오기
 */
export function getDescendantMenuIds(
  items: MenuItem[],
  menuId: string
): string[] {
  const descendants: string[] = [];

  const children = items.filter((item) => item.parentMenuId === menuId);

  for (const child of children) {
    descendants.push(child.menuId);
    descendants.push(...getDescendantMenuIds(items, child.menuId));
  }

  return descendants;
}

/**
 * 메뉴 레벨 가져오기
 */
export function getMenuLevel(
  items: MenuItem[],
  menuId: string
): number {
  const path = getMenuPath(items, menuId);
  return path.length - 1;
}
