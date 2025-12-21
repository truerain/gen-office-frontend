import { create } from 'zustand'; 
import { nanoid } from 'nanoid';
import type { Tab } from '../types';

interface MDIState {
  tabs: Tab[];
  activeTabId: string | null;

  // Actions
  addTab: (tab: Omit<Tab, 'id'>) => string;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  reorderTabs: (startIndex: number, endIndex: number) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
}

export const useMDIStore = create<MDIState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  addTab: (tab) => {
    const id = nanoid();
    const newTab: Tab = { 
      id, 
      closable: true,
      ...tab 
    };

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: id,
    }));

    return id;
  },

  removeTab: (id) => {
    set((state) => {
      const newTabs = state.tabs.filter((tab) => tab.id !== id);
      let newActiveTabId = state.activeTabId;

      //닫는 탭이 활성탭이면, 다른 탭을 활성황
      if (state.activeTabId === id) {
        const currentIndex = state.tabs.findIndex((tab) => tab.id === id);
        const nextTab = newTabs[currentIndex] || newTabs[currentIndex - 1];
        newActiveTabId = nextTab ? nextTab.id : null;
      }

      return { 
        tabs: newTabs, 
        activeTabId: newActiveTabId 
      };
    });
  },
  
  setActiveTab: (id) => {
    set({ activeTabId: id });
  },

  updateTab: (id, updates) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === id ? { ...tab, ...updates } : tab
      ),
    }));
  },

  reorderTabs: (startIndex, endIndex) => {
    set((state) => {
      const newTabs = [...state.tabs];
      const [removed] = newTabs.splice(startIndex, 1);
      newTabs.splice(endIndex, 0, removed);
      return { tabs: newTabs };
    });
  },

  closeAllTabs: () => {
    set({ tabs: [], activeTabId: null });
  },

  closeOtherTabs: (id) => {
    set((state) => ({
      tabs: state.tabs.filter((tab) => tab.id === id),
      activeTabId: id,
    }));
  },
}));