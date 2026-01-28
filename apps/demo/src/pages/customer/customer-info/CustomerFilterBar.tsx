// apps/demo/src/pages/customer/CustomerInfoPage/components/CustomerFilterBar.tsx
import { Button, GenericFilterBar } from '@gen-office/ui';
import type { FilterField } from '@gen-office/ui';
import { Search } from 'lucide-react';
import type { CustomerFilter } from '../../../entities/customer/model/types';

interface CustomerFilterBarProps {
  filters: CustomerFilter;
  onFilterChange: (filters: CustomerFilter) => void;
  onSearch: () => void;
}

function CustomerFilterBar({ filters, onFilterChange, onSearch }: CustomerFilterBarProps) {
  const fields: FilterField<CustomerFilter>[] = [
    {
      key: 'search',
      type: 'search',
      placeholder: '고객명, 이메일, 회사명, 전화번호로 검색',
      flex: 2,
    },
    {
      key: 'status',
      type: 'select',
      placeholder: '상태',
      options: [
        { value: 'all', label: '전체 상태' },
        { value: 'active', label: '활성' },
        { value: 'inactive', label: '비활성' },
        { value: 'pending', label: '대기중' },
      ],
    },
    {
      key: 'grade',
      type: 'select',
      placeholder: '등급',
      options: [
        { value: 'all', label: '전체 등급' },
        { value: 'platinum', label: 'Platinum' },
        { value: 'gold', label: 'Gold' },
        { value: 'silver', label: 'Silver' },
        { value: 'bronze', label: 'Bronze' },
      ],
    },
  ];

  return (
    <GenericFilterBar
      value={filters}
      fields={fields}
      onChange={onFilterChange}
      onSearch={onSearch}
      searchLabel="검색"
    />
  );
}

export default CustomerFilterBar;
