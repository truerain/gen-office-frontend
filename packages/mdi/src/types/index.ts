// packages/mdi/src/types/index.ts
import { ReactNode } from 'react';

/**
 * MDI 탭 인터페이스
 */
export interface MDITab {
  /** 탭의 고유 식별자 */
  id: string;
  
  /** 탭 제목 */
  title: string;
  
  /** 탭 콘텐츠 */
  content: ReactNode;
  
  /** 닫기 버튼 표시 여부 (기본값: true) */
  closable?: boolean;
  
  /** 탭 아이콘 */
  icon?: ReactNode;
  
  /** 탭 메타데이터 (자유롭게 사용 가능) */
  meta?: Record<string, any>;
}

/**
 * 탭 위치 타입
 */
export type TabPosition = 'top' | 'bottom';

/**
 * MDI 컨테이너 Props
 */
export interface MDIContainerProps {
  /** 최대 탭 개수 (선택적) */
  maxTabs?: number;
  
  /** 탭 바 위치 (기본값: 'top') */
  tabPosition?: TabPosition;
  
  /** 탭이 없을 때 표시할 내용 */
  emptyContent?: ReactNode;
  
  /** 최대 탭 개수 초과 시 콜백 */
  onMaxTabsReached?: () => void;
  
  /** 커스텀 클래스명 */
  className?: string;
}

/**
 * TabBar Props
 */
export interface TabBarProps {
  /** 탭 바 위치 */
  position: TabPosition;
  
  /** 커스텀 클래스명 */
  className?: string;
}

/**
 * Tab Props
 */
export interface TabProps {
  /** 탭 데이터 */
  tab: MDITab;
  
  /** 활성 상태 */
  isActive: boolean;
  
  /** 클릭 핸들러 */
  onClick: () => void;
  
  /** 닫기 핸들러 */
  onClose: () => void;
  
  /** 커스텀 클래스명 */
  className?: string;
}

/**
 * TabPanel Props
 */
export interface TabPanelProps {
  /** 탭 데이터 */
  tab: MDITab;
  
  /** 활성 상태 */
  isActive: boolean;
  
  /** 커스텀 클래스명 */
  className?: string;
}

/**
 * MDI Store 상태
 */
export interface MDIState {
  /** 모든 탭 목록 */
  tabs: MDITab[];
  
  /** 활성 탭 ID */
  activeTabId: string | null;
  
  /** 최대 탭 개수 */
  maxTabs: number | undefined;
  
  /** 탭 위치 */
  tabPosition: TabPosition;
}

/**
 * MDI Store 액션
 */
export interface MDIActions {
  /** 탭 추가 */
  addTab: (tab: MDITab) => boolean;
  
  /** 탭 제거 */
  removeTab: (id: string) => void;
  
  /** 활성 탭 설정 */
  setActiveTab: (id: string) => void;
  
  /** 탭 위치 설정 */
  setTabPosition: (position: TabPosition) => void;
  
  /** 탭 업데이트 */
  updateTab: (id: string, updates: Partial<MDITab>) => void;
  
  /** 모든 탭 닫기 */
  closeAllTabs: () => void;
  
  /** 다른 탭 모두 닫기 */
  closeOtherTabs: (id: string) => void;
  
  /** 최대 탭 개수 설정 */
  setMaxTabs: (max: number | undefined) => void;
}

/**
 * MDI Store 전체 인터페이스
 */
export interface MDIStore extends MDIState, MDIActions {}