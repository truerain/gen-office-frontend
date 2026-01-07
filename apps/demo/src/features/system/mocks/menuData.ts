// apps/demo/src/mocks/menuData.ts
import type { MenuData, MenuItem } from '@/types/menu.types';
import { buildMenuTree, findMenuItemById } from '@/utils/menuTree';

/**
 * 메뉴 데이터 (플랫 구조 - DB와 동일한 형태)
 * 
 * 이 데이터는 실제로는 DB에서 가져옵니다.
 * 
 * DB 스키마 예시:
 * ```sql
 * CREATE TABLE menus (
 *   menu_id VARCHAR(50) PRIMARY KEY,
 *   label VARCHAR(100) NOT NULL,
 *   icon VARCHAR(50) NOT NULL,
 *   component_name VARCHAR(100),
 *   parent_menu_id VARCHAR(50),
 *   `order` INT DEFAULT 0,
 *   is_active BOOLEAN DEFAULT true,
 *   FOREIGN KEY (parent_menu_id) REFERENCES menus(menu_id)
 * );
 * ```
 */
export const menuData: MenuData = {
  items: [
    // ========================================
    // 레벨 0: 최상위 카테고리
    // ========================================
    {
      menuId: 'customer',
      label: '고객관리',
      icon: 'Users',
      parentMenuId: null,
      order: 1,
    },
    {
      menuId: 'finance',
      label: '금융 및 결제',
      icon: 'CreditCard',
      parentMenuId: null,
      order: 2,
    },
    {
      menuId: 'system',
      label: '시스템관리',
      icon: 'Settings',
      parentMenuId: null,
      order: 3,
    },
    {
      menuId: 'demo',
      label: 'Demo',
      icon: 'Zap',
      parentMenuId: null,
      order: 4,
    },

    // ========================================
    // 레벨 1: 고객관리 하위 메뉴
    // ========================================
    {
      menuId: 'customer-info',
      label: '고객정보',
      icon: 'Users',
      componentName: 'CustomerInfoPage',
      parentMenuId: 'customer',
      order: 1,
    },
    {
      menuId: 'customer-service',
      label: '고객응대',
      icon: 'UserCheck',
      parentMenuId: 'customer',
      order: 2,
    },
    {
      menuId: 'customer-analysis',
      label: '고객분석',
      icon: 'BarChart3',
      parentMenuId: 'customer',
      order: 3,
    },

    // ========================================
    // 레벨 2: 고객응대 하위 메뉴 (3레벨 예시)
    // ========================================
    {
      menuId: 'customer-service-chat',
      label: '채팅 상담',
      icon: 'MessageSquare',
      parentMenuId: 'customer-service',
      order: 1,
    },
    {
      menuId: 'customer-service-call',
      label: '전화 상담',
      icon: 'Phone',
      parentMenuId: 'customer-service',
      order: 2,
    },
    {
      menuId: 'customer-service-ticket',
      label: '티켓 관리',
      icon: 'Ticket',
      parentMenuId: 'customer-service',
      order: 3,
    },

    // ========================================
    // 레벨 1: 금융 및 결제 하위 메뉴
    // ========================================
    {
      menuId: 'payment',
      label: '결제관리',
      icon: 'CreditCard',
      parentMenuId: 'finance',
      order: 1,
    },
    {
      menuId: 'transfer',
      label: '송금',
      icon: 'Send',
      parentMenuId: 'finance',
      order: 2,
    },
    {
      menuId: 'subscription',
      label: '구독관리',
      icon: 'RefreshCw',
      parentMenuId: 'finance',
      order: 3,
    },

    // ========================================
    // 레벨 2: 결제관리 하위 메뉴 (3레벨 예시)
    // ========================================
    {
      menuId: 'payment-process',
      label: '결제 처리',
      icon: 'CreditCard',
      parentMenuId: 'payment',
      order: 1,
    },
    {
      menuId: 'payment-history',
      label: '결제 내역',
      icon: 'History',
      parentMenuId: 'payment',
      order: 2,
    },
    {
      menuId: 'payment-refund',
      label: '환불 처리',
      icon: 'RotateCcw',
      parentMenuId: 'payment',
      order: 3,
    },

    // ========================================
    // 레벨 1: 시스템관리 하위 메뉴
    // ========================================
    {
      menuId: 'menu-management',
      label: '메뉴관리',
      icon: 'Menu',
      parentMenuId: 'system',
      order: 1,
    },
    {
      menuId: 'role-management',
      label: '권한관리',
      icon: 'Shield',
      parentMenuId: 'system',
      order: 2,
    },
    {
      menuId: 'user-management',
      label: '사용자관리',
      icon: 'Users',
      parentMenuId: 'system',
      order: 3,
    },

    // ========================================
    // 레벨 1: Demo 하위 메뉴
    // ========================================
    {
      menuId: 'primitives',
      label: 'Primitives',
      icon: 'Package',
      componentName: 'PrimitivesPage',
      parentMenuId: 'demo',
      order: 1,
    },
    {
      menuId: 'datagrid',
      label: 'DataGrid',
      icon: 'Table',
      componentName: 'DataGridPage',
      parentMenuId: 'demo',
      order: 2,
    },
    {
      menuId: 'mdi',
      label: 'MDI',
      icon: 'Layout',
      componentName: 'MDIPage',
      parentMenuId: 'demo',
      order: 3,
    },
    {
      menuId: 'global-state',
      label: 'Global State',
      icon: 'Database',
      componentName: 'GlobalStateDemo',
      parentMenuId: 'demo',
      order: 4,
    },
    {
      menuId: 'composed',
      label: 'Composed',
      icon: 'Boxes',
      parentMenuId: 'demo',
      order: 5,
    },

    // ========================================
    // 레벨 2: Composed 하위 메뉴
    // ========================================
    {
      menuId: 'composed-alert-dialog',
      label: 'AlertDialog',
      icon: 'MessageSquare',
      componentName: 'AlertDialogDemo',
      parentMenuId: 'composed',
      order: 1,
    },
  ],
};

/**
 * 트리 구조로 변환된 메뉴 데이터
 * 
 * UI 렌더링에 사용
 */
export const menuTree = buildMenuTree(menuData.items);

/**
 * 메뉴 ID로 메뉴 아이템 찾기
 * 
 * @param menuId - 메뉴 ID
 * @returns 메뉴 아이템 또는 undefined
 */
export function findMenuItem(menuId: string): MenuItem | undefined {
  return findMenuItemById(menuData.items, menuId);
}

/**
 * DB에서 메뉴 데이터를 가져오는 함수 (미래 구현)
 * 
 * @example
 * const menuData = await fetchMenuDataFromDB();
 */
export const fetchMenuDataFromDB = async (): Promise<MenuData> => {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch('/api/menus');
  // return response.json();
  
  return menuData;
};