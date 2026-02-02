// apps/demo/src/pages/customer/customer-info/CustomerFilterBar.tsx
import { SimpleFilterBar } from '@gen-office/ui';
import type { FilterField } from '@gen-office/ui';
import { useTranslation } from 'react-i18next';
import type { CustomerFilter } from '../../../entities/customer/model/types';

interface CustomerFilterBarProps {
  filters: CustomerFilter;
  onFilterChange: (filters: CustomerFilter) => void;
  onSearch: () => void;
}

function CustomerFilterBar({ filters, onFilterChange, onSearch }: CustomerFilterBarProps) {
  const { t } = useTranslation();

  const fields: FilterField<CustomerFilter>[] = [
    {
      key: 'search',
      type: 'search',
      placeholder: t('common.search'),
      flex: 2,
    },
    {
      key: 'status',
      type: 'select',
      placeholder: t('common.status'),
      options: [
        { value: 'all', label: t('common.all') },
        { value: 'active', label: t('common.active') },
        { value: 'inactive', label: t('common.inactive') },
        { value: 'pending', label: t('common.pending') },
      ],
    },
    {
      key: 'grade',
      type: 'select',
      placeholder: t('common.grade'),
      options: [
        { value: 'all', label: t('common.all') },
        { value: 'platinum', label: 'Platinum' },
        { value: 'gold', label: 'Gold' },
        { value: 'silver', label: 'Silver' },
        { value: 'bronze', label: 'Bronze' },
      ],
    },
  ];

  return (
    <SimpleFilterBar
      value={filters}
      fields={fields}
      onChange={onFilterChange}
      onSearch={onSearch}
      searchLabel={t('common.search')}
    />
  );
}

export default CustomerFilterBar;
