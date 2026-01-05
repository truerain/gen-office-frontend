// apps/demo/src/utils/menuTree.ts
import type { MenuItem, MenuTreeItem } from '@/types/menu.types';

/**
 * 플랫 구조의 메뉴 배열을 트리 구조로 변환
 * 
 * @param items - DB에서 가져온 플랫 메뉴 배열
 * @param parentId - 부모 메뉴 ID (재귀 호출용)
 * @param level - 트리 레벨 (0: 루트, 1: 1차, 2: 2차)
 * @returns 트리 구조의 메뉴 배열
 */
export function buildMenuTree(
  items: MenuItem[],
  parentId: string | null = null,
  level: number = 0
): MenuTreeItem[] {
  return items
    .filter(item => {
      // parentMenuId가 null, 빈 문자열, undefined인 경우 모두 최상위로 간주
      const itemParentId = item.parentMenuId || null;
      const targetParentId = parentId || null;
      return itemParentId === targetParentId;
    })
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(item => {
      const treeItem: MenuTreeItem = {
        ...item,
        level,
        children: buildMenuTree(items, item.menuId, level + 1)
      };
      
      // children이 빈 배열이면 제거
      if (treeItem.children && treeItem.children.length === 0) {
        delete treeItem.children;
      }
      
      return treeItem;
    });
}

/**
 * 트리 구조에서 특정 메뉴 아이템 찾기
 * 
 * @param tree - 트리 구조의 메뉴 배열
 * @param menuId - 찾을 메뉴 ID
 * @returns 찾은 메뉴 아이템 또는 undefined
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
 * 플랫 구조에서 특정 메뉴 아이템 찾기
 * 
 * @param items - 플랫 메뉴 배열
 * @param menuId - 찾을 메뉴 ID
 * @returns 찾은 메뉴 아이템 또는 undefined
 */
export function findMenuItemById(
  items: MenuItem[],
  menuId: string
): MenuItem | undefined {
  return items.find(item => item.menuId === menuId);
}

/**
 * 메뉴의 전체 경로 가져오기 (breadcrumb용)
 * 
 * @param items - 플랫 메뉴 배열
 * @param menuId - 메뉴 ID
 * @returns 루트부터 현재 메뉴까지의 경로
 * 
 * @example
 * getMenuPath(items, 'customer-info')
 * // → ['customer', 'customer-info']
 */
export function getMenuPath(
  items: MenuItem[],
  menuId: string
): string[] {
  const path: string[] = [];
  let currentId: string | null = menuId;
  
  while (currentId) {
    const item = items.find(i => i.menuId === currentId);
    if (!item) break;
    
    path.unshift(currentId);
    currentId = item.parentMenuId;
  }
  
  return path;
}

/**
 * 특정 메뉴의 모든 하위 메뉴 ID 가져오기
 * 
 * @param items - 플랫 메뉴 배열
 * @param menuId - 부모 메뉴 ID
 * @returns 하위 메뉴 ID 배열 (재귀적으로 모든 자손 포함)
 */
export function getDescendantMenuIds(
  items: MenuItem[],
  menuId: string
): string[] {
  const descendants: string[] = [];
  
  const children = items.filter(item => item.parentMenuId === menuId);
  
  for (const child of children) {
    descendants.push(child.menuId);
    descendants.push(...getDescendantMenuIds(items, child.menuId));
  }
  
  return descendants;
}

/**
 * 메뉴 레벨 가져오기
 * 
 * @param items - 플랫 메뉴 배열
 * @param menuId - 메뉴 ID
 * @returns 레벨 (0: 루트, 1: 1차, 2: 2차)
 */
export function getMenuLevel(
  items: MenuItem[],
  menuId: string
): number {
  const path = getMenuPath(items, menuId);
  return path.length - 1;
}