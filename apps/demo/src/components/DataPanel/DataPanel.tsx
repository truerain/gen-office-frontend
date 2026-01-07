// apps/demo/src/components/DataPanel/DataPanel.tsx
import { type ReactNode } from 'react';
import styles from './DataPanel.module.css';

export interface DataPanelProps {
  /** 액션 바 (상단) */
  actionBar?: ReactNode;
  /** 데이터 테이블 또는 콘텐츠 (하단) */
  children: ReactNode;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 액션 바와 데이터 테이블을 감싸는 패널
 * 
 * FilterBar와 동일한 Elevated 효과 제공
 * 
 * @example
 * ```tsx
 * <DataPanel
 *   actionBar={
 *     <ActionBar
 *       total={100}
 *       onRefresh={handleRefresh}
 *       onExport={handleExport}
 *     />
 *   }
 * >
 *   <Table data={data} />
 * </DataPanel>
 * ```
 */
export function DataPanel({ actionBar, children, className }: DataPanelProps) {
  return (
    <div className={`${styles.dataPanel} ${className || ''}`}>
      {actionBar && (
        <div className={styles.actionBar}>
          {actionBar}
        </div>
      )}
      <div className={styles.dataContent}>
        {children}
      </div>
    </div>
  );
}

export default DataPanel;