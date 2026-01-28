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
  /** minimum width (default: 200px) */
  width?: string;
  /** extra class */
  className?: string;
}

FilterBar.Item = function FilterBarItem({
  title,
  children,
  flex = 1,
  width = '250px',
  className,
}: FilterBarItemProps) {
  return (
    <div
      className={`${styles.filterItem} ${className || ''}`}
      style={{ flex, width }}
    >
      <div>{title}</div>
      {children}
    </div>
  );
};

export default FilterBar;
