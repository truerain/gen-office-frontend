// apps/demo/src/app/menu/menuData.ts
import type { MenuData, MenuItem } from '@/types/menu.types';
import { buildMenuTree, findMenuItemById } from '@/app/menu/menuTree';
import type { AppMenu } from './model/types';

const componentNameByMenuId: Record<string, string> = {
  'customer-info': 'CustomerInfoPage',
  'menu-management': 'MenuManagementPage',
  'user-management': 'UserManagementPage',
  primitives: 'PrimitivesPage',
  datagrid: 'DataGridPage',
  mdi: 'MDIPage',
  'global-state': 'GlobalStateDemo',
  'composed-alert-dialog': 'AlertDialogDemo',
};

const iconByMenuId: Record<string, string> = {
  customer: 'Users',
  finance: 'CreditCard',
  system: 'Settings',
  demo: 'Zap',
  'customer-info': 'Users',
  'customer-service': 'UserCheck',
  'customer-analysis': 'BarChart3',
  'customer-service-chat': 'MessageSquare',
  'customer-service-call': 'Phone',
  'customer-service-ticket': 'Ticket',
  payment: 'CreditCard',
  transfer: 'Send',
  subscription: 'RefreshCw',
  'payment-process': 'CreditCard',
  'payment-history': 'History',
  'payment-refund': 'RotateCcw',
  'menu-management': 'Menu',
  'role-management': 'Shield',
  'user-management': 'Users',
  primitives: 'Package',
  datagrid: 'Table',
  mdi: 'Layout',
  'global-state': 'Database',
  composed: 'Boxes',
  'composed-alert-dialog': 'MessageSquare',
};

export function mapMenusToMenuItems(menus:AppMenu[]): MenuItem[] {
  return menus
      .filter((item) => {
          return item.dsplFlag === 'Y';
        })
      .map((m) => ({
        menuId: String(m.menuId),
        label: m.menuName || m.menuNameEng || String(m.menuId),
        icon: iconByMenuId[String(m.menuId)] ?? 'SquareMenu',
        componentName:
          componentNameByMenuId[String(m.menuId)] ??
          (m.url ? String(m.url) : undefined),
        parentMenuId: m.prntMenuId ? String(m.prntMenuId) : null,
        order: m.sortOrder,
        isActive: m.useFlag ? m.useFlag.toLowerCase() === 'y' : undefined,
      }));
}

export function buildMenuData(items: MenuItem[]): MenuData {
  return { items };
}

export const menuTree = (items: MenuItem[]) => buildMenuTree(items);

export function findMenuItem(items: MenuItem[], menuId: string): MenuItem | undefined {
  return findMenuItemById(items, menuId);
}
