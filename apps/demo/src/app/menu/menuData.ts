// apps/demo/src/app/menu/menuData.ts
import type { MenuData, MenuItem } from '@/types/menu.types';
import { buildMenuTree, findMenuItemById } from '@/app/menu/menuTree';
import type { AppMenu } from './model/types';

const componentNameByMenuId: Record<string, string> = {
  '100100': 'CustomerInfoPage',
  '900100': 'UserManagementPage',
  '900200': 'MenuManagementPage',
  '900300': 'RoleManagementPage',
  '990100': 'PrimitivesPage',
  '990200': 'ComboboxDemoPage',
  '990300': 'SliderDemoPage',
  '990400': 'DatePickerDemoPage',
  '990500': 'RowGroupingDemoPage',
};

const iconByMenuId: Record<string, string> = {
  '100000': 'Users',
  '100100': 'Users',
  '900000': 'Settings',
  '900100': 'Users',
  '900200': 'Menu',
  '900300': 'Shield',
  '990000': 'Zap',
  '990100': 'Package',
  '990200': 'Search',
  '990300': 'SlidersHorizontal',
  '990400': 'CalendarDays',
  '990500': 'Table2',
};

export type SystemMenuData = {
  items: MenuItem[];
  tree: ReturnType<typeof buildMenuTree>;
  byId: Map<string, MenuItem>;
  breadcrumbById: Map<string, MenuItem[]>;
};

export function mapMenusToMenuItems(menus: AppMenu[]): MenuItem[] {
  const isYes = (value: string | undefined) => String(value ?? '').trim().toUpperCase() === 'Y';
  const normalizeParentMenuId = (value: number | null | undefined) =>
    value == null || value === 0 ? null : String(value);
  const resolveIconName = (menu: AppMenu) =>
    String(menu.menuIcon ?? '').trim() || iconByMenuId[String(menu.menuId)] || 'SquareMenu';
  const resolveComponentName = (menu: AppMenu) =>
    String(menu.execComponent ?? '').trim() || componentNameByMenuId[String(menu.menuId)];

  return menus
      .filter((item) => {
          return isYes(item.displayYn);
        })
      .map((m) => ({
        menuId: String(m.menuId),
        label: m.menuName || m.menuNameEng || String(m.menuId),
        icon: resolveIconName(m),
        componentName: resolveComponentName(m),
        parentMenuId: normalizeParentMenuId(m.parentMenuId),
        order: m.sortOrder,
        isActive: m.useYn == null ? undefined : isYes(m.useYn),
      }));
}

function buildMenuIndexes(items: MenuItem[]) {
  const byId = new Map<string, MenuItem>();
  const breadcrumbById = new Map<string, MenuItem[]>();

  items.forEach((item) => byId.set(item.menuId, item));

  const visiting = new Set<string>();
  const resolveBreadcrumb = (menuId: string): MenuItem[] => {
    const cached = breadcrumbById.get(menuId);
    if (cached) return cached;

    const current = byId.get(menuId);
    if (!current) return [];

    if (visiting.has(menuId)) {
      // circular parent safety
      const fallback = [current];
      breadcrumbById.set(menuId, fallback);
      return fallback;
    }

    visiting.add(menuId);
    const parentId = current.parentMenuId;
    const parentPath =
      parentId && byId.has(parentId)
        ? resolveBreadcrumb(parentId)
        : [];
    const path = [...parentPath, current];
    visiting.delete(menuId);

    breadcrumbById.set(menuId, path);
    return path;
  };

  items.forEach((item) => {
    resolveBreadcrumb(item.menuId);
  });

  return { byId, breadcrumbById };
}

export function buildSystemMenuData(menus: AppMenu[]): SystemMenuData {
  const items = mapMenusToMenuItems(menus);
  const tree = buildMenuTree(items);
  const { byId, breadcrumbById } = buildMenuIndexes(items);
  return { items, tree, byId, breadcrumbById };
}

export function buildMenuData(items: MenuItem[]): MenuData {
  return { items };
}

export const menuTree = (items: MenuItem[]) => buildMenuTree(items);

export function findMenuItem(items: MenuItem[], menuId: string): MenuItem | undefined {
  return findMenuItemById(items, menuId);
}
