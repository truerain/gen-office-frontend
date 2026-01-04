// packages/mdi/src/components/TabBar/TabBar.tsx
import { TabBarProps } from '../../types';
import { useMDIStore } from '../../store/mdiStore';
import { Tab } from '../Tab';
import { cn } from '@gen-office/utils';
import styles from './TabBar.module.css';

export const TabBar = ({ position, className }: TabBarProps) => {
  const tabs = useMDIStore(state => state.tabs);
  const activeTabId = useMDIStore(state => state.activeTabId);
  const setActiveTab = useMDIStore(state => state.setActiveTab);
  const removeTab = useMDIStore(state => state.removeTab);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        styles.tabBar,
        styles[position],
        className
      )}
      role="tablist"
      aria-orientation="horizontal"
    >
      <div className={styles.tabList}>
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onClick={() => setActiveTab(tab.id)}
            onClose={() => removeTab(tab.id)}
          />
        ))}
      </div>
    </div>
  );
};