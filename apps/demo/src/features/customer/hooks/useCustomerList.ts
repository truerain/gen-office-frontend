// apps/demo/src/features/customer/hooks/useCustomerList.ts
import { useState, useEffect, useMemo } from 'react';
import type { Customer, CustomerFilter } from '../types/customer.types';
import { mockCustomers, filterCustomers } from '../mocks/customerData';

export const useCustomerList = (initialFilters?: CustomerFilter) => {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [filters, setFilters] = useState<CustomerFilter>(
    initialFilters ?? { status: 'all', grade: 'all' }
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await new Promise((r) => setTimeout(r, 500));
      if (!cancelled) {
        setCustomers(mockCustomers);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const loading = customers === null;

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return filterCustomers(customers, filters);
  }, [customers, filters]);

  const statistics = useMemo(() => ({
    total: filteredCustomers.length,
    active: filteredCustomers.filter(c => c.status === 'active').length,
    inactive: filteredCustomers.filter(c => c.status === 'inactive').length,
    pending: filteredCustomers.filter(c => c.status === 'pending').length,
  }), [filteredCustomers]);

  return {
    customers: filteredCustomers,
    loading,
    filters,
    setFilters,
    statistics,
  };
};
