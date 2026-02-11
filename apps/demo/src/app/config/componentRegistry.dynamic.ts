// apps/demo/src/config/componentRegistry.dynamic.ts
import type { ComponentType } from 'react';
import { lazy } from 'react';

/**
 * ?™ì  ì»´í¬?ŒíŠ¸ ?ˆì??¤íŠ¸ë¦?(Code Splitting ì§€??
 * 
 * ê°?ì»´í¬?ŒíŠ¸???„ìš”???Œë§Œ ë¡œë“œ?©ë‹ˆ??
 * ì´ˆê¸° ë²ˆë“¤ ?¬ê¸°ë¥??¬ê²Œ ì¤„ì¼ ???ˆìŠµ?ˆë‹¤.
 */

/**
 * ?˜ì´ì§€ ì»´í¬?ŒíŠ¸??ê¸°ë³¸ Props
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
 * ì»´í¬?ŒíŠ¸ ê²½ë¡œ ë§¤í•‘
 * 
 * DB???€?¥ë˜??componentNameê³??¤ì œ ?Œì¼ ê²½ë¡œë¥?ë§¤í•‘?©ë‹ˆ??
 * ???˜ì´ì§€ ì¶”ê? ???¬ê¸°ë§??˜ì •?˜ë©´ ?©ë‹ˆ??
 */
const componentPaths: Record<string, ComponentLoader> = {
  // ê³ ê° ê´€ë¦?
  'CustomerInfoPage': () => import('@/pages/customer/customer-info/CustomerInfoPage'),
  // 'CustomerServicePage': () => import('../pages/customer/CustomerServicePage'),
  // 'CustomerAnalysisPage': () => import('../pages/customer/CustomerAnalysisPage'),

  // ê¸ˆìœµ ë°?ê²°ì œ
  // 'PaymentProcessPage': () => import('../pages/finance/PaymentProcessPage'),
  // 'TransferPage': () => import('../pages/finance/TransferPage'),
  // 'SubscriptionPage': () => import('../pages/finance/SubscriptionPage'),

  // ?œìŠ¤??ê´€ë¦?
  'MenuManagementPage': () => import('@/pages/admin/menu/MenuManagementPage'),
  'RoleManagementPage': () => import('@/pages/admin/role/RoleManagementPage'),
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
 * ì»´í¬?ŒíŠ¸ ?´ë¦„?¼ë¡œ Lazy ì»´í¬?ŒíŠ¸ë¥?ê°€?¸ì˜µ?ˆë‹¤.
 * 
 * @param componentName - ì»´í¬?ŒíŠ¸ ?´ë¦„ (?? 'CustomerInfoPage')
 * @returns React Lazy ì»´í¬?ŒíŠ¸ ?ëŠ” undefined
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
  
  return lazy(() => withLazyDelay(loader));
};

/**
 * ì»´í¬?ŒíŠ¸ë¥?ë¯¸ë¦¬ ë¡œë“œ?©ë‹ˆ??(Prefetch)
 * 
 * ?¬ìš©?ê? ë©”ë‰´??ë§ˆìš°?¤ë? ?¬ë ¸????ë¯¸ë¦¬ ë¡œë“œ?˜ì—¬
 * ?´ë¦­ ??ì¦‰ì‹œ ?œì‹œ?????ˆìŠµ?ˆë‹¤.
 * 
 * @param componentName - ì»´í¬?ŒíŠ¸ ?´ë¦„
 * 
 * @example
 * <button onMouseEnter={() => prefetchComponent('CustomerInfoPage')}>
 *   ê³ ê°?•ë³´
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
 * ?¬ëŸ¬ ì»´í¬?ŒíŠ¸ë¥?ë¯¸ë¦¬ ë¡œë“œ?©ë‹ˆ??
 * 
 * @param componentNames - ì»´í¬?ŒíŠ¸ ?´ë¦„ ë°°ì—´
 * 
 * @example
 * // ?¬ìš©?ì˜ ??• ???°ë¼ ?ì£¼ ?¬ìš©?˜ëŠ” ?˜ì´ì§€ ë¯¸ë¦¬ ë¡œë“œ
 * prefetchComponents(['CustomerInfoPage', 'PaymentProcessPage']);
 */
export const prefetchComponents = (componentNames: string[]): void => {
  componentNames.forEach(prefetchComponent);
};

