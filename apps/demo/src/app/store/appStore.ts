// apps/demo/src/store/appStore.ts
import { create } from 'zustand';

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
}

/**
 * 전역 애플리케이션 상태
 * 
 * 모든 페이지 컴포넌트에서 접근 가능합니다.
 */
export const useAppStore = create<AppState>((set) => ({
  // 사용자 정보
  user: {
    id: 'user-001',
    name: '김철수',
    email: 'kim@example.com',
    role: 'admin',
  },
  setUser: (user) => set({ user }),

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
}));