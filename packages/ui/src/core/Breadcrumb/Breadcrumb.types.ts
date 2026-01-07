// packages/ui/src/core/Breadcrumb/Breadcrumb.types.ts
import type { ReactNode } from 'react';

export interface BreadcrumbItem {
  /** 표시할 텍스트 */
  label: string;
  
  /** 클릭 시 이동할 경로 (선택적) */
  href?: string;
  
  /** 클릭 핸들러 (선택적, href 대신 사용 가능) */
  onClick?: () => void;
  
  /** 커스텀 아이콘 (선택적) */
  icon?: ReactNode;
  
  /** 비활성화 여부 */
  disabled?: boolean;
}

export interface BreadcrumbProps {
  /** Breadcrumb 아이템 배열 */
  items: BreadcrumbItem[];
  
  /** 구분자 (기본: '/') */
  separator?: ReactNode;
  
  /** 최대 표시 아이템 수 (초과 시 ... 표시) */
  maxItems?: number;
  
  /** 크기 */
  size?: 'sm' | 'md' | 'lg';
  
  /** 커스텀 className */
  className?: string;
}