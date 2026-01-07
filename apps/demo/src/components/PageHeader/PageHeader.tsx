// apps/demo/src/components/PageHeader/PageHeader.tsx
import { useRef } from 'react';
import { Breadcrumb, type BreadcrumbItem } from '@gen-office/ui';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  /** 페이지 제목 */
  title: string;
  
  /** Breadcrumb 아이템 */
  breadcrumbItems?: BreadcrumbItem[];
  
  /** 페이지 설명 (선택적) */
  description?: string;
  
  /** 커스텀 className */
  className?: string;
  
}

export function PageHeader({
  title,
  breadcrumbItems,
  description,
  className,
}: PageHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);



  return (
    <div 
      ref={headerRef}
      className={`
        ${styles.pageHeader} 
        ${className || ''}
      `}
    >
      <div className={styles.headerRow}>
        {/* 왼쪽: Title + Description */}
        <div className={styles.leftContent}>
          <h1 className={styles.title}>{title}</h1>
          {description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
        
        {/* 오른쪽: Breadcrumb */}
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <div className={styles.rightContent}>
            <Breadcrumb items={breadcrumbItems} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}