// apps/demo/src/types/menu.types.ts

/**
 * 메뉴 아이템 타입
 * 
 * DB에서 가져온 메뉴 데이터의 구조를 정의합니다.
 */
export interface MenuItem {
  /** 메뉴 고유 ID */
  id: string;
  
  /** 메뉴 표시 이름 */
  label: string;
  
  /** Lucide React 아이콘 이름 (예: 'Home', 'Users', 'Settings') */
  icon: string;
  
  /** 
   * 동적으로 로드할 컴포넌트 이름 (선택적)
   * 
   * 예: 'CustomerInfoPage', 'HomePage'
   * 
   * componentRegistry.dynamic.ts에 등록된 이름과 일치해야 합니다.
   * DB에 문자열로 저장됩니다.
   */
  componentName?: string;
  
  /** 하위 메뉴 (선택적) */
  children?: MenuItem[];
}

/**
 * 전체 메뉴 데이터 구조
 */
export interface MenuData {
  categories: MenuItem[];
}