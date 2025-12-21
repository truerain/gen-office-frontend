import type { User } from '../mocks/data/users';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const userApi = {
  // 전체 사용자 조회
  getUsers: async (): Promise<User[]> => {
    const response = await fetch('/api/users');
    const json: ApiResponse<User[]> = await response.json();
    return json.data || [];
  },

  // 특정 사용자 조회
  getUser: async (id: string): Promise<User | null> => {
    const response = await fetch(`/api/users/${id}`);
    const json: ApiResponse<User> = await response.json();
    return json.data || null;
  },

  // 사용자 생성
  createUser: async (userData: Omit<User, 'id'>): Promise<User> => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const json: ApiResponse<User> = await response.json();
    return json.data!;
  },

  // 사용자 수정
  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json: ApiResponse<User> = await response.json();
    return json.data!;
  },

  // 사용자 삭제
  deleteUser: async (id: string): Promise<void> => {
    await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },
};