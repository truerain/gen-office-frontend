import { cn } from '@gen-office/utils';
import { SplitLayout } from '../SplitLayout';
import type { MasterDetailLayoutProps } from './MasterDetailLayout.types';
import styles from './MasterDetailLayout.module.css';

export function MasterDetailLayout({
  master,
  detail,
  title,
  actions,
  leftWidth,
  minLeftWidth,
  maxLeftWidth,
  minRightWidth,
  gap,
  resizable,
  showResizeLine,
  onResize,
  className,
  masterClassName,
  detailClassName,
}: MasterDetailLayoutProps) {
  return (
    <section className={cn(styles.root, className)}>
      {title || actions ? (
        <header className={styles.header}>
          <div className={styles.title}>{title}</div>
          {actions ? <div>{actions}</div> : null}
        </header>
      ) : null}
      <div className={styles.body}>
        <SplitLayout
          left={master}
          right={detail}
          leftWidth={leftWidth}
          minLeftWidth={minLeftWidth}
          maxLeftWidth={maxLeftWidth}
          minRightWidth={minRightWidth}
          gap={gap}
          resizable={resizable}
          showResizeLine={showResizeLine}
          onResize={onResize}
          leftClassName={masterClassName}
          rightClassName={detailClassName}
        />
      </div>
    </section>
  );
}
