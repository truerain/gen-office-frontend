// apps/demo/src/config/componentLoader.convention.ts
import { lazy, type ComponentType } from 'react';

/**
 * 규칙 기반 자동 컴포넌트 로더
 * 
 * DB의 componentName만으로 자동으로 파일을 찾아서 로드합니다.
 * componentRegistry에 등록하지 않아도 됩니다!
 * 
 * 규칙:
 * - componentName: "CustomerInfoPage" 
 *   → 파일: "pages/customer/CustomerInfoPage/index.tsx"
 * 
 * - componentName: "PaymentProcessPage"
 *   → 파일: "pages/finance/PaymentProcessPage/index.tsx"
 */

// 컴포넌트 모듈 타입 정의
type ComponentModule = { default: ComponentType<any> };

// 컴포넌트 이름에서 도메인 추출
const getDomainFromComponentName = (componentName: string): string => {
  // "CustomerInfoPage" → "customer"
  // "PaymentProcessPage" → "payment"
  
  const prefixMap: Record<string, string> = {
    'Customer': 'customer',
    'Payment': 'finance',
    'Transfer': 'finance',
    'Subscription': 'finance',
    'Menu': 'system',
    'Role': 'system',
    'User': 'system',
    'Primitives': '',  // 루트 레벨
    'DataGrid': '',    // 루트 레벨
    'MDI': '',         // 루트 레벨
  };
  
  for (const [prefix, domain] of Object.entries(prefixMap)) {
    if (componentName.startsWith(prefix)) {
      return domain;
    }
  }
  
  // 기본값: componentName의 첫 단어를 소문자로
  return componentName.replace(/([A-Z])/g, '-$1').toLowerCase().substring(1).split('-')[0];
};

/**
 * 규칙 기반 컴포넌트 로더
 * 
 * @param componentName - 컴포넌트 이름 (예: 'CustomerInfoPage')
 * @returns Lazy 컴포넌트
 */
export const loadComponentByConvention = (componentName: string): ComponentType => {
  const domain = getDomainFromComponentName(componentName);
  
  // 경로 생성
  const path = domain 
    ? `../pages/${domain}/${componentName}`
    : `../pages/${componentName}`;
  
  console.log(`[ComponentLoader] Loading: ${componentName} from ${path}`);
  
  // 동적 import
  // 주의: Vite는 완전한 동적 경로를 지원하지 않으므로,
  // 가능한 모든 경로를 미리 정의해야 합니다.
  const componentLoaders: Record<string, () => Promise<ComponentModule>> = {
    // 고객 관리
    'CustomerInfoPage': () => import('@/pages/customer/CustomerInfoPage') as Promise<ComponentModule>,
    /*
    'CustomerServicePage': () => import('@/pages/customer/CustomerServicePage').catch((): ComponentModule => ({ default: () => null })) as Promise<ComponentModule>,
    'CustomerAnalysisPage': () => import('@/pages/customer/CustomerAnalysisPage').catch((): ComponentModule => ({ default: () => null })) as Promise<ComponentModule>,
    
    // 금융 및 결제
    'PaymentProcessPage': () => import('@/pages/finance/PaymentProcessPage').catch((): ComponentModule => ({ default: () => null })) as Promise<ComponentModule>,
    'TransferPage': () => import('@/pages/finance/TransferPage').catch((): ComponentModule => ({ default: () => null })) as Promise<ComponentModule>,
    'SubscriptionPage': () => import('@/pages/finance/SubscriptionPage').catch((): ComponentModule => ({ default: () => null })) as Promise<ComponentModule>,
    
    // 시스템 관리
    'MenuManagementPage': () => import('@/pages/system/MenuManagementPage').catch((): ComponentModule => ({ default: () => null })) as Promise<ComponentModule>,
    'RoleManagementPage': () => import('@/pages/system/RoleManagementPage').catch((): ComponentModule => ({ default: () => null })) as Promise<ComponentModule>,
    'RoleMenuPage': () => import('@/pages/system/RoleMenuPage').catch((): ComponentModule => ({ default: () => null })) as Promise<ComponentModule>,
    'UserManagementPage': () => import('@/pages/system/UserManagementPage').catch((): ComponentModule => ({ default: () => null })) as Promise<ComponentModule>,
    */
    // Demo
    'PrimitivesPage': () => import('@/pages/demo/Primitives/PrimitivesPage') as Promise<ComponentModule>,
    'DataGridPage': () => import('@/pages/demo/DataGridPage/DataGridPage') as Promise<ComponentModule>,
    'MDIPage': () => import('@/pages/demo/MDIPage/MDIPage') as Promise<ComponentModule>,
    'GlobalStateDemo': () => import('@/pages/demo/GlobalStateDemo') as Promise<ComponentModule>,
  };
  
  const loader = componentLoaders[componentName];
  
  if (!loader) {
    console.warn(`[ComponentLoader] No loader found for: ${componentName}`);
    return lazy((): Promise<ComponentModule> => Promise.resolve({ 
      default: () => (
        <div style={{ padding: '2rem' }}>
          <h2>컴포넌트를 찾을 수 없습니다</h2>
          <p>ComponentName: {componentName}</p>
          <p>예상 경로: {path}</p>
        </div>
      )
    }));
  }
  
  return lazy((): Promise<ComponentModule> => 
    loader()
      .then((module): ComponentModule => {
        if (!module.default) {
          console.warn(`[ComponentLoader] Module has no default export: ${componentName}`);
          return {
            default: () => (
              <div style={{ padding: '2rem' }}>
                <h2>이 페이지는 아직 구현되지 않았습니다</h2>
                <p>ComponentName: {componentName}</p>
              </div>
            )
          };
        }
        return module;
      })
      .catch((error): ComponentModule => {
        console.error(`[ComponentLoader] Failed to load ${componentName}:`, error);
        return {
          default: () => (
            <div style={{ padding: '2rem' }}>
              <h2>컴포넌트 로딩 실패</h2>
              <p>ComponentName: {componentName}</p>
              <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          )
        };
      })
  );
};

/**
 * 여러 컴포넌트를 미리 로드 (Prefetch)
 */
export const prefetchComponents = (componentNames: string[]): void => {
  componentNames.forEach(name => {
    loadComponentByConvention(name);
  });
};