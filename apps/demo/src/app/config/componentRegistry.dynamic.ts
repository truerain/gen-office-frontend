// apps/demo/src/config/componentRegistry.dynamic.ts
import type { ComponentType } from 'react';
import { lazy } from 'react';

/**
 * 동적 컴포넌트 레지스트리 (Code Splitting 지원)
 *
 * 각 컴포넌트는 필요한 시점에만 로드됩니다.
 * 초기 번들 크기를 줄이기 위한 매핑 테이블입니다.
 */

/**
 * 페이지 컴포넌트 기본 Props
 */
export interface PageComponentProps {
  menuId?: string;
  [key: string]: unknown;
}

type ComponentLoader = () => Promise<{ default: ComponentType<PageComponentProps> }>;
const LAZY_DELAY_MS = 0;

function withLazyDelay<T>(loader: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      loader().then(resolve).catch(reject);
    }, LAZY_DELAY_MS);
  });
}

/**
 * 컴포넌트 경로 매핑
 *
 * DB의 componentName과 실제 파일 경로를 연결합니다.
 * 새 페이지 추가 시 이 객체에 항목을 등록하세요.
 */
const componentPaths: Record<string, ComponentLoader> = {
  // 고객 관리
  CustomerInfoPage: () => import('@/pages/customer/customer-info/CustomerInfoPage'),
  // 'CustomerServicePage': () => import('../pages/customer/CustomerServicePage'),
  // 'CustomerAnalysisPage': () => import('../pages/customer/CustomerAnalysisPage'),

  // 금융/결제
  // 'PaymentProcessPage': () => import('../pages/finance/PaymentProcessPage'),
  // 'TransferPage': () => import('../pages/finance/TransferPage'),
  // 'SubscriptionPage': () => import('../pages/finance/SubscriptionPage'),

  // 시스템 관리
  MenuManagementPage: () => import('@/pages/admin/menu/MenuManagementPage'),
  RoleManagementPage: () => import('@/pages/admin/role/RoleManagementPage'),
  UserRoleManagementPage: () => import('@/pages/admin/user-role/UserRoleManagementPage'),
  // 'RoleMenuPage': () => import('../pages/system/RoleMenuPage'),
  UserManagementPage: () => import('@/pages/admin/user/UserManagementPage'),
  NoticeManagementPage: () => import('@/pages/admin/notice/NoticeManagementPage'),
  MessageManagementPage: () => import('@/pages/admin/message/MessageManagementPage'),
  LkupManagementPage: () => import('@/pages/admin/lkup/LkupManagementPage'),

  // Demo
  PrimitivesPage: () => import('@/pages/demo/primitives/PrimitivesPage'),
  DataGridPage: () => import('@/pages/demo/datagrid'),
  MDIPage: () => import('@/pages/demo/mdi'),
  GlobalStateDemo: () => import('@/pages/demo/primitives/state/GlobalStateDemo'),
  AlertDialogDemo: () => import('@/pages/demo/composed/AlertDialogDemo'),
  DatePickerDemoPage: () => import('@/pages/demo/datepicker/DatePickerDemoPage'),
  RowGroupingDemoPage: () => import('@/pages/demo/row-grouping'),
  SliderDemoPage: () => import('@/pages/demo/slider'),
  ComboboxDemoPage: () => import('@/pages/demo/combobox'),
};

/**
 * 컴포넌트 이름으로 Lazy 컴포넌트를 반환합니다.
 *
 * @param componentName - 컴포넌트 이름 (예: CustomerInfoPage)
 * @returns React Lazy 컴포넌트 또는 undefined
 */
export const getLazyComponent = (
  componentName?: string
): ComponentType<PageComponentProps> | undefined => {
  if (!componentName) return undefined;

  const loader = componentPaths[componentName];
  if (!loader) return undefined;

  return lazy(() => withLazyDelay(loader));
};

/**
 * 컴포넌트 프리로드 (Prefetch)
 *
 * 사용자 상호작용 직전에 로드해 체감 지연을 줄입니다.
 */
export const prefetchComponent = (componentName: string): void => {
  const loader = componentPaths[componentName];
  if (loader) {
    loader().catch((err) => {
      console.error(`Failed to prefetch ${componentName}:`, err);
    });
  }
};

/**
 * 여러 컴포넌트를 한 번에 프리로드합니다.
 */
export const prefetchComponents = (componentNames: string[]): void => {
  componentNames.forEach(prefetchComponent);
};
