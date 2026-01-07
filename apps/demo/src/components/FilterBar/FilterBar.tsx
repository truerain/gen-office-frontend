// apps/demo/src/components/FilterBar/FilterBar.tsx
import { type ReactNode } from 'react';
import styles from './FilterBar.module.css';

export interface FilterBarProps {
  /** 필터 항목들 */
  children: ReactNode;
  /** 오른쪽 액션 버튼 영역 */
  actions?: ReactNode;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 일반화된 필터 바 컴포넌트
 * 
 * Border로 감싸진 튀어나오는(elevated) 효과를 가진 필터 영역
 * 
 * @example
 * ```tsx
 * <FilterBar actions={<Button>검색</Button>}>
 *   <FilterBar.Item>
 *     <Input placeholder="검색..." />
 *   </FilterBar.Item>
 *   <FilterBar.Item>
 *     <SimpleSelect options={[...]} />
 *   </FilterBar.Item>
 * </FilterBar>
 * ```
 */
export function FilterBar({ children, actions, className }: FilterBarProps) {
  return (
    <div className={`${styles.filterBar} ${className || ''}`}>
      <div className={styles.filterRow}>
        {children}
        {actions && (
          <div className={styles.filterActions}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export interface FilterBarItemProps {
  /** 필터 항목 내용 */
  children: ReactNode;
  /** flex 비율 (기본: 1) */
  flex?: number;
  /** 최소 너비 (기본: 200px) */
  minWidth?: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * FilterBar의 개별 항목
 */
FilterBar.Item = function FilterBarItem({ 
  children, 
  flex = 1, 
  minWidth = '200px',
  className 
}: FilterBarItemProps) {
  return (
    <div 
      className={`${styles.filterItem} ${className || ''}`}
      style={{ flex, minWidth }}
    >
      {children}
    </div>
  );
};

export default FilterBar;