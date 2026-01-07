// apps/demo/src/pages/customer/CustomerInfoPage/CustomerInfoPage.tsx
import { Home, Users } from 'lucide-react';
import { useCustomerList } from '../../../features/customer/hooks/useCustomerList';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { DataPanel } from '../../../components/DataPanel';
import { usePageContext } from '../../../contexts';
import type { PageComponentProps } from '../../../config/componentRegistry.dynamic';
import type { CustomerFilter } from '../../../features/customer/types/customer.types';
import CustomerFilterBar from './components/CustomerFilterBar';
import CustomerActionBar from './components/CustomerActionBar';
import CustomerTable from './components/CustomerTable';
import styles from './CustomerInfoPage.module.css';

interface CustomerInfoPageProps extends PageComponentProps {
  /** 초기 필터 파라미터 */
  initialParams?: {
    grade?: 'bronze' | 'silver' | 'gold' | 'platinum';
    status?: 'active' | 'inactive' | 'pending';
    search?: string;
    [key: string]: unknown;
  };
}

function CustomerInfoPage({ 
  menuId: menuIdFromProps,
  initialParams,
}: CustomerInfoPageProps) {
  // Context에서 menuId 가져오기 (fallback으로 props 사용)
  const { menuId: menuIdFromContext } = usePageContext();
  const menuId = menuIdFromContext || menuIdFromProps;

  // initialParams에서 초기 필터 생성
  const getInitialFilters = (): CustomerFilter => {
    const defaultFilters: CustomerFilter = {
      search: '',
      status: 'all',
      grade: 'all',
      dateFrom: '',
      dateTo: '',
    };

    if (!initialParams) return defaultFilters;

    return {
      ...defaultFilters,
      grade: initialParams.grade || defaultFilters.grade,
      status: initialParams.status || defaultFilters.status,
      search: (initialParams.search as string) || defaultFilters.search,
    };
  };

  const {
    customers,
    loading,
    filters,
    setFilters,
    statistics
  } = useCustomerList(getInitialFilters());

  const handleExport = () => {
    alert('CSV 내보내기 기능 (미구현)');
  };

  const handleImport = () => {
    alert('CSV 가져오기 기능 (미구현)');
  };

  const handleCreate = () => {
    alert('고객 추가 Dialog 열기 (미구현)');
  };

  const handleRefetch = () => {
    alert('고객 추가 Dialog 열기 (미구현)');
  };

  // menuId와 initialParams를 Console에 출력 (디버깅용)
  console.log('CustomerInfoPage:', {
    menuId,
    initialParams,
    currentFilters: filters,
  });

  return (
    <div className={styles.page}>
      {/* 페이지 헤더 with Breadcrumb */}
      <PageHeader
        title="고객정보"
        description="고객 정보를 조회하고 관리할 수 있습니다."
        breadcrumbItems={[
          { 
            label: 'Home', 
            icon: <Home size={16} />,
            onClick: () => {
              // Home 탭으로 이동하는 로직
              // 실제로는 MDI store를 사용하여 home 탭 활성화
            }
          },
          { 
            label: '고객 관리', 
            icon: <Users size={16} />,
          },
        ]}
      />

      {/* 컨텐츠 영역 - 스크롤 가능 */}
      <div className={styles.content}>
        {/* 검색 필터 */}
        <CustomerFilterBar 
          filters={filters} 
          onFilterChange={setFilters}
          onSearch={handleRefetch}
        />

        {/* 데이터 패널 (액션 바 + 테이블) */}
        <DataPanel
          actionBar={
            <CustomerActionBar
              total={statistics.total}
              onRefresh={handleRefetch}
              onExport={handleExport}
              onImport={handleImport}
              onCreate={handleCreate}
            />
          }
        >
          <CustomerTable data={customers} loading={loading} />
        </DataPanel>
      </div>
    </div>
  );
}

export default CustomerInfoPage;