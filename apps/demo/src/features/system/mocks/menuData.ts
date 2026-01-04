// apps/demo/src/mocks/menuData.ts
import type { MenuData, MenuItem } from '../../../types/menu.types';

/**
 * 메뉴 데이터
 * 
 * 이 데이터는 나중에 DB에서 가져올 수 있습니다.
 * componentName은 문자열이므로 JSON으로 직렬화 가능합니다.
 * 
 * DB 스키마 예시:
 * - menus 테이블:
 *   - id: string (PK)
 *   - label: string
 *   - icon: string
 *   - component_name: string (nullable)
 *   - parent_id: string (nullable, FK)
 *   - order: number
 *   - is_active: boolean
 */
export const menuData: MenuData = {
  categories: [
    {
      id: 'customer',
      label: '고객관리',
      icon: 'Users',
      children: [
        {
          id: 'customer-info',
          label: '고객정보',
          icon: 'Users',
          componentName: 'CustomerInfoPage',  // ✅ 문자열로 저장
        },
        {
          id: 'customer-service',
          label: '고객응대',
          icon: 'UserCheck',
          // componentName: 'CustomerServicePage',  // TODO: 구현 필요
        },
        {
          id: 'customer-analysis',
          label: '고객분석',
          icon: 'BarChart3',
          // componentName: 'CustomerAnalysisPage',  // TODO: 구현 필요
        },
      ],
    },
    {
      id: 'finance',
      label: '금융 및 결제',
      icon: 'CreditCard',
      children: [
        {
          id: 'payment-process',
          label: '결제처리',
          icon: 'CreditCard',
          // componentName: 'PaymentProcessPage',  // TODO: 구현 필요
        },
        {
          id: 'transfer',
          label: '송금',
          icon: 'Send',
          // componentName: 'TransferPage',  // TODO: 구현 필요
        },
        {
          id: 'subscription',
          label: '구독관리',
          icon: 'RefreshCw',
          // componentName: 'SubscriptionPage',  // TODO: 구현 필요
        },
      ],
    },
    {
      id: 'system',
      label: '시스템관리',
      icon: 'Settings',
      children: [
        {
          id: 'menu-management',
          label: '메뉴관리',
          icon: 'Menu',
          // componentName: 'MenuManagementPage',  // TODO: 구현 필요
        },
        {
          id: 'role-management',
          label: '권한관리',
          icon: 'Shield',
          // componentName: 'RoleManagementPage',  // TODO: 구현 필요
        },
        {
          id: 'role-menu',
          label: '권한별 메뉴관리',
          icon: 'FolderTree',
          // componentName: 'RoleMenuPage',  // TODO: 구현 필요
        },
        {
          id: 'user-management',
          label: '사용자관리',
          icon: 'UserCog',
          // componentName: 'UserManagementPage',  // TODO: 구현 필요
        },
      ],
    },
    {
      id: 'demo',
      label: 'Demo',
      icon: 'Box',
      children: [
        {
          id: 'primitives',
          label: 'Primitives',
          icon: 'Box',
          componentName: 'PrimitivesPage',  // ✅ 문자열로 저장
        },
        {
          id: 'datagrid',
          label: 'DataGrid',
          icon: 'Grid3x3',
          componentName: 'DataGridPage',  // ✅ 문자열로 저장
        },
        {
          id: 'mdi-demo',
          label: 'MDI Demo',
          icon: 'Layers',
          componentName: 'MDIPage',  // ✅ 문자열로 저장
        },
        {
          id: 'global-state-demo',
          label: 'Global State',
          icon: 'Database',
          componentName: 'GlobalStateDemo',  // ✅ 전역 상태 테스트
        },
      ],
    },
  ],
};

/**
 * 메뉴 아이템을 ID로 찾는 헬퍼 함수
 */
export const findMenuItemById = (id: string): MenuItem | undefined => {
  for (const category of menuData.categories) {
    if (category.children) {
      const found = category.children.find((item) => item.id === id);
      if (found) return found;
    }
  }
  return undefined;
};

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