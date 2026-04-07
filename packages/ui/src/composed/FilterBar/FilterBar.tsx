// packages/ui/src/composed/FilterBar/FilterBar.tsx
import type { ReactNode } from 'react';
import styles from './FilterBar.module.css';

export interface FilterBarProps {
  /** filter items */
  children: ReactNode;
  /** right-side actions */
  actions?: ReactNode;
  /** extra class */
  className?: string;
}

/**
 * Generic filter bar container
 */
export function FilterBar({ children, actions, className }: FilterBarProps) {
  return (
    <div className={`${styles.filterBar} ${className || ''}`}>
      <div className={styles.filterRow}>
        {children}
        {actions ? <div className={styles.filterActions}>{actions}</div> : null}
      </div>
    </div>
  );
}

export interface FilterBarItemProps {
  title?: string;
  /** filter item content */
  children: ReactNode;
  /** flex ratio (default: 1) */
  flex?: number;
  /** base width (default: 250px) */
  width?: string;
  /** extra class */
  className?: string;
}

FilterBar.Item = function FilterBarItem({
  title,
  children,
  flex,
  width,
  className,
}: FilterBarItemProps) {
  const resolvedWidth = width ?? '250px';
  const hasExplicitWidth = width !== undefined;
  const resolvedFlex =
    flex === undefined
      ? hasExplicitWidth
        ? `0 0 ${resolvedWidth}`
        : 1
      : hasExplicitWidth
        ? `${flex} 1 ${resolvedWidth}`
        : flex;

  return (
    <div
      className={`${styles.filterItem} ${className || ''}`}
      style={{ flex: resolvedFlex, width: resolvedWidth }}
    >
      <div className={styles.filterItemTitle}>{title}</div>
      {children}
    </div>
  );
};

export default FilterBar;
