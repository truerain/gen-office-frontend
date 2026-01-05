// apps/demo/src/pages/customer/CustomerInfoPage/components/CustomerFilter.tsx
import { Input, SimpleSelect } from '@gen-office/ui';
import { Search } from 'lucide-react';
import type { CustomerFilter as FilterType } from '../../../../features/customer/types/customer.types';
import styles from './CustomerFilter.module.css';

interface CustomerFilterProps {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
}

function CustomerFilter({ filters, onFilterChange }: CustomerFilterProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value as FilterType['status'],
    });
  };

  const handleGradeChange = (value: string) => {
    onFilterChange({
      ...filters,
      grade: value as FilterType['grade'],
    });
  };

  return (
    <div className={styles.filterPanel}>
      <div className={styles.filterRow}>
        <div className={styles.filterItem}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <Input
              placeholder="고객명, 이메일, 회사명, 전화번호로 검색"
              value={filters.search || ''}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.filterItem}>
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
        </div>

        <div className={styles.filterItem}>
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
        </div>
      </div>
    </div>
  );
}

export default CustomerFilter;