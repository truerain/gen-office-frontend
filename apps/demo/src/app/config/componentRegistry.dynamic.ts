// apps/demo/src/config/componentRegistry.dynamic.ts
import type { ComponentType } from 'react';
import { lazy } from 'react';

/**
 * 동적 컴포넌트 레지스트리 (Code Splitting 지원)
 * 
 * 각 컴포넌트는 필요할 때만 로드됩니다.
 * 초기 번들 크기를 크게 줄일 수 있습니다.
 */

/**
 * 페이지 컴포넌트의 기본 Props
 */
export interface PageComponentProps {
  menuId?: string;
  [key: string]: unknown;
}

type ComponentLoader = () => Promise<{ default: ComponentType<PageComponentProps> }>;

/**
 * 컴포넌트 경로 매핑
 * 
 * DB에 저장되는 componentName과 실제 파일 경로를 매핑합니다.
 * 새 페이지 추가 시 여기만 수정하면 됩니다.
 */
const componentPaths: Record<string, ComponentLoader> = {
  // 고객 관리
  'CustomerInfoPage': () => import('@/pages/customer/customer-info/CustomerInfoPage'),
  // 'CustomerServicePage': () => import('../pages/customer/CustomerServicePage'),
  // 'CustomerAnalysisPage': () => import('../pages/customer/CustomerAnalysisPage'),

  // 금융 및 결제
  // 'PaymentProcessPage': () => import('../pages/finance/PaymentProcessPage'),
  // 'TransferPage': () => import('../pages/finance/TransferPage'),
  // 'SubscriptionPage': () => import('../pages/finance/SubscriptionPage'),

  // 시스템 관리
  'MenuManagementPage': () => import('@/pages/admin/menu/MenuManagementPage'),
  // 'RoleManagementPage': () => import('../pages/system/RoleManagementPage'),
  // 'RoleMenuPage': () => import('../pages/system/RoleMenuPage'),
  'UserManagementPage': () => import('@/pages/admin/user/UserManagementPage'),

  // Demo
  'PrimitivesPage': () => import('@/pages/demo/primitives/PrimitivesPage'),
  'DataGridPage': () => import('@/pages/demo/datagrid'),
  'MDIPage': () => import('@/pages/demo/mdi'),
  'GlobalStateDemo': () => import('@/pages/demo/primitives/state/GlobalStateDemo'),
  'AlertDialogDemo': () => import('@/pages/demo/composed/AlertDialogDemo'),
  'DatePickerDemoPage': () => import('@/pages/demo/datepicker/DatePickerDemoPage'),
  'RowGroupingDemoPage': () => import('@/pages/demo/row-grouping'),
  'SliderDemoPage': () => import('@/pages/demo/slider'),
  'ComboboxDemoPage': () => import('@/pages/demo/combobox'),
};

/**
 * 컴포넌트 이름으로 Lazy 컴포넌트를 가져옵니다.
 * 
 * @param componentName - 컴포넌트 이름 (예: 'CustomerInfoPage')
 * @returns React Lazy 컴포넌트 또는 undefined
 * 
 * @example
 * const Component = getLazyComponent('CustomerInfoPage');
 * <Suspense fallback={<Loading />}>
 *   <Component menuId="customer-info" />
 * </Suspense>
 */
export const getLazyComponent = (componentName?: string): ComponentType<PageComponentProps> | undefined => {
  if (!componentName) return undefined;
  
  const loader = componentPaths[componentName];
  if (!loader) return undefined;
  
  return lazy(loader);
};

/**
 * 컴포넌트를 미리 로드합니다 (Prefetch)
 * 
 * 사용자가 메뉴에 마우스를 올렸을 때 미리 로드하여
 * 클릭 시 즉시 표시할 수 있습니다.
 * 
 * @param componentName - 컴포넌트 이름
 * 
 * @example
 * <button onMouseEnter={() => prefetchComponent('CustomerInfoPage')}>
 *   고객정보
 * </button>
 */
export const prefetchComponent = (componentName: string): void => {
  const loader = componentPaths[componentName];
  if (loader) {
    loader().catch(err => {
      console.error(`Failed to prefetch ${componentName}:`, err);
    });
  }
};

/**
 * 여러 컴포넌트를 미리 로드합니다
 * 
 * @param componentNames - 컴포넌트 이름 배열
 * 
 * @example
 * // 사용자의 역할에 따라 자주 사용하는 페이지 미리 로드
 * prefetchComponents(['CustomerInfoPage', 'PaymentProcessPage']);
 */
export const prefetchComponents = (componentNames: string[]): void => {
  componentNames.forEach(prefetchComponent);
};
