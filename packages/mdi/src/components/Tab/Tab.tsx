// packages/mdi/src/components/Tab/Tab.tsx
import { X } from 'lucide-react';
import { TabProps } from '../../types';
import { Button } from '@gen-office/ui';
import { cn } from '@gen-office/utils';
import styles from './Tab.module.css';

export const Tab = ({ tab, isActive, onClick, onClose, className }: TabProps) => {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className={cn(
        styles.tab,
        isActive && styles.active,
        className
      )}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${tab.id}`}
      id={`tab-${tab.id}`}
      tabIndex={isActive ? 0 : -1}
    >
      <div className={styles.tabContent}>
        {tab.icon && (
          <span className={styles.tabIcon}>
            {tab.icon}
          </span>
        )}
        <span className={styles.tabTitle}>
          {tab.title}
        </span>
      </div>
      
      {tab.closable !== false && (
        <Button
          variant="ghost"
          size="sm"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label={`Close ${tab.title}`}
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
};