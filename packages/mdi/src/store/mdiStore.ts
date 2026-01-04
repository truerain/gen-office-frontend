// packages/mdi/src/store/mdiStore.ts
import { create } from 'zustand';
import { MDIStore, MDITab, TabPosition } from '../types';

export const useMDIStore = create<MDIStore>((set, get) => ({
  // State
  tabs: [],
  activeTabId: null,
  maxTabs: undefined,
  tabPosition: 'top',

  // Actions
  addTab: (tab: MDITab): boolean => {
    const { tabs, maxTabs } = get();
    
    // 최대 탭 개수 체크
    if (maxTabs !== undefined && tabs.length >= maxTabs) {
      console.warn(`Maximum tab limit (${maxTabs}) reached. Cannot add new tab.`);
      return false;
    }

    // 이미 존재하는 탭이면 활성화만
    const existingTab = tabs.find(t => t.id === tab.id);
    if (existingTab) {
      set({ activeTabId: tab.id });
      return true;
    }

    // 새 탭 추가
    set(state => ({
      tabs: [...state.tabs, tab],
      activeTabId: tab.id
    }));
    
    return true;
  },

  removeTab: (id: string) => {
    const { tabs, activeTabId } = get();
    const tabIndex = tabs.findIndex(t => t.id === id);
    
    if (tabIndex === -1) return;

    const newTabs = tabs.filter(t => t.id !== id);
    
    // 활성 탭이 제거되는 경우
    let newActiveTabId = activeTabId;
    if (activeTabId === id) {
      if (newTabs.length > 0) {
        // 다음 탭 또는 이전 탭 활성화
        const newActiveIndex = tabIndex >= newTabs.length ? newTabs.length - 1 : tabIndex;
        newActiveTabId = newTabs[newActiveIndex].id;
      } else {
        newActiveTabId = null;
      }
    }

    set({
      tabs: newTabs,
      activeTabId: newActiveTabId
    });
  },

  setActiveTab: (id: string) => {
    const { tabs } = get();
    if (tabs.some(t => t.id === id)) {
      set({ activeTabId: id });
    }
  },

  setTabPosition: (position: TabPosition) => {
    set({ tabPosition: position });
  },

  updateTab: (id: string, updates: Partial<MDITab>) => {
    set(state => ({
      tabs: state.tabs.map(tab => 
        tab.id === id ? { ...tab, ...updates } : tab
      )
    }));
  },

  closeAllTabs: () => {
    set({
      tabs: [],
      activeTabId: null
    });
  },

  closeOtherTabs: (id: string) => {
    const { tabs } = get();
    const targetTab = tabs.find(t => t.id === id);
    
    if (targetTab) {
      set({
        tabs: [targetTab],
        activeTabId: id
      });
    }
  },

  setMaxTabs: (max: number | undefined) => {
    set({ maxTabs: max });
  }
}));