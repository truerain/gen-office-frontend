// apps/demo/src/features/customer/types/customer.types.ts
export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  registeredAt: string;
  lastContactAt: string;
  totalOrders: number;
  totalSpent: number;
  grade: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export type CustomerListParams = {
  q?: string;
  status?: CustomerStatus;
  page?: number;
  pageSize?: number;
};


export interface CustomerFilter {
  search?: string;
  status?: Customer['status'] | 'all';
  grade?: Customer['grade'] | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

export type CreateCustomerInput = {
  name: string;
  phone?: string;
  email?: string;
  status?: CustomerStatus;
};

export type UpdateCustomerInput = Partial<Omit<Customer, 'id'>>;

