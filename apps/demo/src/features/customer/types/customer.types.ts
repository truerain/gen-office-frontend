// apps/demo/src/features/customer/types/customer.types.ts

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  registeredAt: string;
  lastContactAt: string;
  totalOrders: number;
  totalSpent: number;
  grade: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface CustomerFilter {
  search?: string;
  status?: Customer['status'] | 'all';
  grade?: Customer['grade'] | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  pageSize: number;
}