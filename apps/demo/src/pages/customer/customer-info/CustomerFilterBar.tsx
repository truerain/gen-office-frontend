// apps/demo/src/pages/customer/CustomerInfoPage/components/CustomerFilterBar.tsx
import { Button, SimpleSelect } from '@gen-office/ui';
import { Search } from 'lucide-react';
import type { CustomerFilter } from '../../../entities/customer/model/types';
import { FilterBar } from '../../../shared/ui/FilterBar';
import { SearchInput } from '../../../shared/ui/FilterBar/SearchInput';

interface CustomerFilterBarProps {
  filters: CustomerFilter;
  onFilterChange: (filters: CustomerFilter) => void;
  onSearch: () => void;
}

function CustomerFilterBar({ filters, onFilterChange, onSearch }: CustomerFilterBarProps) {
  const handleSearchChange = (value: string) => {
    onFilterChange({
      ...filters,
      search: value,
    });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value as CustomerFilter['status'],
    });
  };

  const handleGradeChange = (value: string) => {
    onFilterChange({
      ...filters,
      grade: value as CustomerFilter['grade'],
    });
  };

  return (
    <FilterBar
      actions={
        <Button onClick={onSearch} variant="primary">
          <Search size={16} />
          검색
        </Button>
      }
    >
      <FilterBar.Item flex={2}>
        <SearchInput
          value={filters.search || ''}
          onChange={handleSearchChange}
          placeholder="고객명, 이메일, 회사명, 전화번호로 검색"
        />
      </FilterBar.Item>

      <FilterBar.Item>
        <SimpleSelect
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
          placeholder="상태"
          options={[
            { value: 'all', label: '전체 상태' },
            { value: 'active', label: '활성' },
            { value: 'inactive', label: '비활성' },
            { value: 'pending', label: '대기중' },
          ]}
        />
      </FilterBar.Item>

      <FilterBar.Item>
        <SimpleSelect
          value={filters.grade || 'all'}
          onValueChange={handleGradeChange}
          placeholder="등급"
          options={[
            { value: 'all', label: '전체 등급' },
            { value: 'platinum', label: 'Platinum' },
            { value: 'gold', label: 'Gold' },
            { value: 'silver', label: 'Silver' },
            { value: 'bronze', label: 'Bronze' },
          ]}
        />
      </FilterBar.Item>
    </FilterBar>
  );
}

export default CustomerFilterBar;