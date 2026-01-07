// packages/ui/src/core/Breadcrumb/Breadcrumb.tsx
import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb.types';
import styles from './Breadcrumb.module.css';

export function Breadcrumb({
  items,
  separator = <ChevronRight size={16} />,
  maxItems,
  size = 'md',
  className,
}: BreadcrumbProps) {
  // maxItems가 설정되었고, items가 초과하는 경우 축약
  const getDisplayItems = (): BreadcrumbItem[] => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    // maxItems가 3 이하면 첫/마지막만 표시
    if (maxItems <= 3) {
      return [
        items[0],
        { label: '...', disabled: true },
        items[items.length - 1],
      ];
    }

    // 첫 번째, ..., 마지막 n개 표시
    const remainingSlots = maxItems - 2; // 첫 번째와 ... 제외
    const endItems = items.slice(-remainingSlots);
    
    return [
      items[0],
      { label: '...', disabled: true },
      ...endItems,
    ];
  };

  const displayItems = getDisplayItems();
  const lastIndex = displayItems.length - 1;

  const renderItem = (item: BreadcrumbItem, index: number) => {
    const isLast = index === lastIndex;
    const isDisabled = item.disabled || isLast;

    // 링크 또는 버튼으로 렌더링
    const content = (
      <>
        {item.icon && <span className={styles.icon}>{item.icon}</span>}
        <span>{item.label}</span>
      </>
    );

    if (item.href && !isDisabled) {
      return (
        <a
          href={item.href}
          className={`${styles.item} ${styles.link}`}
          onClick={(e) => {
            if (item.onClick) {
              e.preventDefault();
              item.onClick();
            }
          }}
        >
          {content}
        </a>
      );
    }

    if (item.onClick && !isDisabled) {
      return (
        <button
          type="button"
          className={`${styles.item} ${styles.button}`}
          onClick={item.onClick}
        >
          {content}
        </button>
      );
    }

    // 비활성화 또는 마지막 아이템
    return (
      <span className={`${styles.item} ${isLast ? styles.current : styles.disabled}`}>
        {content}
      </span>
    );
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={`${styles.breadcrumb} ${styles[size]} ${className || ''}`}
    >
      <ol className={styles.list}>
        {displayItems.map((item, index) => (
          <Fragment key={index}>
            <li className={styles.listItem}>
              {renderItem(item, index)}
            </li>
            {index < lastIndex && (
              <li className={styles.separator} aria-hidden="true">
                {item.label === '...' ? null : separator}
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}