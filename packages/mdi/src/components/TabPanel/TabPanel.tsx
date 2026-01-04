// packages/mdi/src/components/TabPanel/TabPanel.tsx
import { TabPanelProps } from '../../types';
import { cn } from '@gen-office/utils';
import styles from './TabPanel.module.css';

export const TabPanel = ({ tab, isActive, className }: TabPanelProps) => {
  return (
    <div
      className={cn(
        styles.tabPanel,
        !isActive && styles.hidden,
        className
      )}
      role="tabpanel"
      id={`tabpanel-${tab.id}`}
      aria-labelledby={`tab-${tab.id}`}
      hidden={!isActive}
    >
      {tab.content}
    </div>
  );
};