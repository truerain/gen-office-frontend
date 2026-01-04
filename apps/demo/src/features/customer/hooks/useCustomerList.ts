// apps/demo/src/features/customer/hooks/useCustomerList.ts
import { useState, useEffect, useMemo } from 'react';
import type { Customer, CustomerFilter } from '../types/customer.types';
import { mockCustomers, filterCustomers } from '../mocks/customerData';

export const useCustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<CustomerFilter>({
    status: 'all',
    grade: 'all',
  });

  // 실제로는 API 호출
  const fetchCustomers = async () => {
    setLoading(true);
    
    // API 호출 시뮬레이션 (500ms 딜레이)
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setCustomers(mockCustomers);
    setLoading(false);
  };

  // 초기 로드
  useEffect(() => {
    fetchCustomers();
  }, []);

  // 필터링된 고객 목록
  const filteredCustomers = useMemo(() => {
    return filterCustomers(customers, {
      search: filters.search,
      status: filters.status,
      grade: filters.grade,
    });
  }, [customers, filters]);

  // 통계
  const statistics = useMemo(() => {
    return {
      total: filteredCustomers.length,
      active: filteredCustomers.filter((c) => c.status === 'active').length,
      inactive: filteredCustomers.filter((c) => c.status === 'inactive').length,
      pending: filteredCustomers.filter((c) => c.status === 'pending').length,
    };
  }, [filteredCustomers]);

  return {
    customers: filteredCustomers,
    loading,
    filters,
    setFilters,
    statistics,
    refetch: fetchCustomers,
  };
};