// apps/demo/src/types/menu.types.ts

/**
 * DB에서 가져오는 메뉴 아이템 (플랫 구조)
 * 
 * parentMenuId를 통해 계층 구조를 표현합니다.
 */
export interface MenuItem {
  /** 메뉴 고유 ID */
  menuId: string;
  
  /** 메뉴 표시 이름 */
  label: string;
  
  /** Lucide React 아이콘 이름 (예: 'Home', 'Users', 'Settings') */
  icon: string;
  
  /** 
   * 동적으로 로드할 컴포넌트 이름
   * 
   * 예: 'CustomerInfoPage', 'HomePage'
   * 
   * componentRegistry.dynamic.ts에 등록된 이름과 일치해야 합니다.
   */
  componentName?: string;
  
  /** 
   * 부모 메뉴 ID
   * 
   * - null 또는 빈 문자열: 최상위(루트) 메뉴
   * - 값이 있으면: 해당 ID를 가진 메뉴의 하위 메뉴
   */
  parentMenuId: string | null;
  
  /** 정렬 순서 (선택적) */
  order?: number;
  
  /** 활성 여부 (선택적) */
  isActive?: boolean;
}

/**
 * UI 렌더링을 위한 트리 구조 메뉴 아이템
 * 
 * 플랫 구조의 MenuItem을 계층 구조로 변환한 형태
 */
export interface MenuTreeItem {
  menuId: string;
  label: string;
  icon: string;
  componentName?: string;
  parentMenuId: string | null;
  order?: number;
  isActive?: boolean;
  
  /** 하위 메뉴 (재귀 구조) */
  children?: MenuTreeItem[];
  
  /** 트리 레벨 (0: 루트, 1: 1차, 2: 2차) */
  level?: number;
}

/**
 * 전체 메뉴 데이터
 */
export interface MenuData {
  items: MenuItem[];
}