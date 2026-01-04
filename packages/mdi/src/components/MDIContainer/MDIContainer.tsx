// packages/mdi/src/components/MDIContainer/MDIContainer.tsx
import { useEffect } from 'react';
import { MDIContainerProps } from '../../types';
import { useMDIStore } from '../../store/mdiStore';
import { TabBar } from '../TabBar';
import { TabPanel } from '../TabPanel';
import { cn } from '@gen-office/utils';
import styles from './MDIContainer.module.css';

export const MDIContainer = ({
  maxTabs,
  tabPosition = 'top',
  emptyContent,
  onMaxTabsReached,
  className
}: MDIContainerProps) => {
  const tabs = useMDIStore(state => state.tabs);
  const activeTabId = useMDIStore(state => state.activeTabId);
  const setMaxTabs = useMDIStore(state => state.setMaxTabs);
  const setTabPosition = useMDIStore(state => state.setTabPosition);

  // maxTabs 설정
  useEffect(() => {
    setMaxTabs(maxTabs);
  }, [maxTabs, setMaxTabs]);

  // tabPosition 설정
  useEffect(() => {
    setTabPosition(tabPosition);
  }, [tabPosition, setTabPosition]);

  // 탭이 없을 때
  if (tabs.length === 0) {
    return (
      <div className={cn(styles.mdiContainer, className)}>
        <div className={styles.emptyState}>
          {emptyContent || <p>No tabs open</p>}
        </div>
      </div>
    );
  }

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className={cn(styles.mdiContainer, className)}>
      {tabPosition === 'top' && <TabBar position="top" />}
      
      <div className={styles.contentArea}>
        {tabs.map(tab => (
          <TabPanel
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
          />
        ))}
      </div>
      
      {tabPosition === 'bottom' && <TabBar position="bottom" />}
    </div>
  );
};