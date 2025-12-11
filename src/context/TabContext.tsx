import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import Dashboard from '../pages/Dashboard';

export interface Tab {
  key: string;
  label: string;
  closable?: boolean;
  content: ReactNode;
}

interface TabContextType {
  tabs: Tab[];
  activeKey: string;
  setActiveKey: (key: string) => void;
  openTab: (tab: Tab) => void;
  closeTab: (key: string) => void;
  closeOtherTabs: (key: string) => void;
  closeAllTabs: () => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const useTabs = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabProvider');
  }
  return context;
};

export const TabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    { key: 'dashboard', label: 'Dashboard', closable: false, content: <Dashboard /> }
  ]);

  const [activeKey, setActiveKey] = useState<string>('dashboard');

  const openTab = useCallback((tab: Tab) => {
    setTabs((prevTabs) => {
      const exists = prevTabs.find((t) => t.key === tab.key);
      if (!exists) {
        return [...prevTabs, tab];
      }
      return prevTabs;
    });
    setActiveKey(tab.key);
  }, []);

  const removeTab = (targetKey: string) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;

    setTabs(prevTabs => {
      prevTabs.forEach((tab, i) => {
        if (tab.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const newTabs = prevTabs.filter((tab) => tab.key !== targetKey);

      if (newTabs.length && newActiveKey === targetKey) {
        if (lastIndex >= 0) {
          newActiveKey = newTabs[lastIndex].key;
        } else {
          newActiveKey = newTabs[0].key;
        }
      }
      setActiveKey(newActiveKey);
      return newTabs;
    });
  };

  const closeOtherTabs = useCallback((currentKey: string) => {
    setTabs(prev => prev.filter(t => t.key === currentKey || t.closable === false));
    setActiveKey(currentKey);
  }, []);

  const closeAllTabs = useCallback(() => {
    setTabs(prev => prev.filter(t => t.closable === false));
    setTabs(prev => {
      if (prev.length > 0) setActiveKey(prev[0].key);
      return prev;
    });
  }, []);

  return (
    <TabContext.Provider value={{ tabs, activeKey, setActiveKey, openTab, closeTab: removeTab, closeOtherTabs, closeAllTabs }}>
      {children}
    </TabContext.Provider>
  );
};
