export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  department: string;
  avatar?: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: '김철수',
    email: 'kim@example.com',
    role: 'admin',
    department: '개발팀',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: '이영희',
    email: 'lee@example.com',
    role: 'user',
    department: '디자인팀',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: '박민수',
    email: 'park@example.com',
    role: 'user',
    department: '개발팀',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '4',
    name: '최지은',
    email: 'choi@example.com',
    role: 'guest',
    department: '마케팅팀',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
];