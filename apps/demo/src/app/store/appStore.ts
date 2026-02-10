// apps/demo/src/store/appStore.ts
import { create } from 'zustand';

const LAYOUT_MODE_KEY = 'gen-office:layout-mode';
const DEFAULT_LAYOUT_MODE: AppState['layoutMode'] = 'titlebar';

const getInitialLayoutMode = (): AppState['layoutMode'] => {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT_MODE;
  const saved = window.localStorage.getItem(LAYOUT_MODE_KEY);
  return saved === 'left-panel' || saved === 'titlebar'
    ? saved
    : DEFAULT_LAYOUT_MODE;
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AppState {
  // 사용자 정보
  user: User | null;
  setUser: (user: User | null) => void;
  resetSession: () => void;

  // 테마
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // 전역 로딩
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // 알림
  notifications: Array<{ id: string; message: string; type: 'info' | 'success' | 'error' }>;
  addNotification: (message: string, type?: 'info' | 'success' | 'error') => void;
  removeNotification: (id: string) => void;
  layoutMode: 'titlebar' | 'left-panel';
  setLayoutMode: (mode: 'titlebar' | 'left-panel') => void;
}

/**
 * 전역 애플리케이션 상태
 * 
 * 모든 페이지 컴포넌트에서 접근 가능합니다.
 */
export const useAppStore = create<AppState>((set) => ({
  // 사용자 정보
  user: null,
  setUser: (user) => set({ user }),
  resetSession: () => set({ user: null, isLoading: false }),

  // 테마
  theme: 'light',
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),

  // 전역 로딩
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  // 알림
  notifications: [],
  addNotification: (message, type = 'info') =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Date.now().toString(), message, type },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  layoutMode: getInitialLayoutMode(),
  setLayoutMode: (mode) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LAYOUT_MODE_KEY, mode);
    }
    set({ layoutMode: mode });
  },
}));
