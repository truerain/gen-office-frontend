// apps/demo/src/features/customer/mocks/customerData.ts
import type { Customer } from '@/entities/customer/model/types';

export const mockCustomers: Customer[] = [
  {
    id: 'CUST-001',
    name: '김철수',
    email: 'kim.cs@example.com',
    phone: '010-1234-5678',
    company: '(주)테크코리아',
    status: 'ACTIVE',
    registeredAt: '2023-01-15',
    lastContactAt: '2024-01-03',
    totalOrders: 45,
    totalSpent: 125000000,
    grade: 'platinum',
  },
  {
    id: 'CUST-002',
    name: '이영희',
    email: 'lee.yh@example.com',
    phone: '010-2345-6789',
    company: '영희디자인',
    status: 'ACTIVE',
    registeredAt: '2023-03-22',
    lastContactAt: '2024-01-02',
    totalOrders: 28,
    totalSpent: 68000000,
    grade: 'gold',
  },
  {
    id: 'CUST-003',
    name: '박민수',
    email: 'park.ms@example.com',
    phone: '010-3456-7890',
    company: '민수전자',
    status: 'ACTIVE',
    registeredAt: '2023-05-10',
    lastContactAt: '2023-12-28',
    totalOrders: 15,
    totalSpent: 32000000,
    grade: 'silver',
  },
  {
    id: 'CUST-004',
    name: '정수민',
    email: 'jung.sm@example.com',
    phone: '010-4567-8901',
    company: '수민솔루션',
    status: 'INACTIVE',
    registeredAt: '2023-07-18',
    lastContactAt: '2023-11-20',
    totalOrders: 8,
    totalSpent: 15000000,
    grade: 'bronze',
  },
  {
    id: 'CUST-005',
    name: '최현우',
    email: 'choi.hw@example.com',
    phone: '010-5678-9012',
    company: '현우네트웍스',
    status: 'ACTIVE',
    registeredAt: '2023-08-05',
    lastContactAt: '2024-01-04',
    totalOrders: 32,
    totalSpent: 89000000,
    grade: 'gold',
  },
  {
    id: 'CUST-006',
    name: '강지은',
    email: 'kang.je@example.com',
    phone: '010-6789-0123',
    company: '지은컨설팅',
    status: 'PENDING',
    registeredAt: '2023-12-01',
    lastContactAt: '2023-12-15',
    totalOrders: 2,
    totalSpent: 5000000,
    grade: 'bronze',
  },
  {
    id: 'CUST-007',
    name: '오세훈',
    email: 'oh.sh@example.com',
    phone: '010-7890-1234',
    company: '(주)세훈인더스트리',
    status: 'ACTIVE',
    registeredAt: '2022-11-20',
    lastContactAt: '2024-01-01',
    totalOrders: 67,
    totalSpent: 185000000,
    grade: 'platinum',
  },
  {
    id: 'CUST-008',
    name: '윤하늘',
    email: 'yoon.hn@example.com',
    phone: '010-8901-2345',
    company: '하늘소프트',
    status: 'ACTIVE',
    registeredAt: '2023-02-14',
    lastContactAt: '2023-12-30',
    totalOrders: 19,
    totalSpent: 42000000,
    grade: 'silver',
  },
  {
    id: 'CUST-009',
    name: '임재현',
    email: 'lim.jh@example.com',
    phone: '010-9012-3456',
    company: '재현테크',
    status: 'ACTIVE',
    registeredAt: '2023-04-08',
    lastContactAt: '2024-01-03',
    totalOrders: 25,
    totalSpent: 58000000,
    grade: 'gold',
  },
  {
    id: 'CUST-010',
    name: '한서연',
    email: 'han.sy@example.com',
    phone: '010-0123-4567',
    company: '서연디지털',
    status: 'INACTIVE',
    registeredAt: '2023-06-25',
    lastContactAt: '2023-10-10',
    totalOrders: 5,
    totalSpent: 8000000,
    grade: 'bronze',
  },
  {
    id: 'CUST-011',
    name: '송민지',
    email: 'song.mj@example.com',
    phone: '010-1357-2468',
    company: '민지글로벌',
    status: 'ACTIVE',
    registeredAt: '2022-09-12',
    lastContactAt: '2024-01-02',
    totalOrders: 52,
    totalSpent: 142000000,
    grade: 'platinum',
  },
  {
    id: 'CUST-012',
    name: '배준호',
    email: 'bae.jh@example.com',
    phone: '010-2468-1357',
    company: '준호시스템즈',
    status: 'ACTIVE',
    registeredAt: '2023-01-30',
    lastContactAt: '2023-12-29',
    totalOrders: 21,
    totalSpent: 48000000,
    grade: 'silver',
  },
];

// 필터링 함수
export const filterCustomers = (
  customers: Customer[],
  filters: {
    search?: string;
    status?: string;
    grade?: string;
  }
): Customer[] => {
  return customers.filter((customer) => {
    // 검색어 필터
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.company.toLowerCase().includes(searchLower) ||
        customer.phone.includes(filters.search);
      
      if (!matchesSearch) return false;
    }

    // 상태 필터
    if (filters.status && filters.status !== 'all') {
      if (customer.status !== filters.status) return false;
    }

    // 등급 필터
    if (filters.grade && filters.grade !== 'all') {
      if (customer.grade !== filters.grade) return false;
    }

    return true;
  });
};