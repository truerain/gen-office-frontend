// apps/demo/src/pages/customer/CustomerInfoPage/CustomerInfoPage.tsx
import { useMemo, useState} from 'react';
import { Home, Users } from 'lucide-react';

import { PageHeader } from '@/components/PageHeader/PageHeader';
import { DataPanel } from '@/components/DataPanel';
//import { usePageContext } from '@/contexts';
import type { PageComponentProps } from '@/config/componentRegistry.dynamic';

import type { Customer } from '../../../entities/customer/model/types';
import type { CrudChange } from '@gen-office/gen-grid-crud';
import CustomerFilterBar from './CustomerFilterBar';
//import CustomerActionBar from '@/shared/ui/list/CustomerActionBar';
import CustomerTable from './CustomerTable';

import { type PendingDiff } from '@/shared/models/pendingDiff';

import styles from './CustomerInfoPage.module.css';

import type { CustomerFilter, CustomerStatus } from '@/entities/customer/model/types';
import {
  useCustomerListQuery,
  //useCreateCustomerMutation,
  //useUpdateCustomerMutation,
  //useDeleteCustomerMutation,
} from '@/entities/customer/api/customer';


interface CustomerInfoPageProps extends PageComponentProps {
  /** 초기 필터 파라미터 */
  initialParams?: {
    grade?: 'bronze' | 'silver' | 'gold' | 'platinum';
    status?: CustomerStatus;
    search?: string;
    [key: string]: unknown;
  };
}

function CustomerInfoPage({
  //menuId: menuIdFromProps,
  initialParams,
}: CustomerInfoPageProps) {
  // Context에서 menuId 가져오기 (fallback으로 props 사용)
  //const { menuId: menuIdFromContext } = usePageContext();
  //const menuId = menuIdFromContext || menuIdFromProps;


  const [_pendingDiff, setPendingDiff] = useState<PendingDiff<Customer, string>>({
    added: [],
    modified: [],
    deleted: [],
  });
  
  //const saveDisabled = !isDiffDirty(pendingDiff);



  // initialParams에서 초기 필터 생성
  const getInitialFilters = (): CustomerFilter => {
    const defaultFilters: CustomerFilter = {
      search: '',
      grade: 'all',
      dateFrom: '',
      dateTo: '',
    };

    if (!initialParams) return defaultFilters;

    return {
      ...defaultFilters,
      grade: initialParams.grade || defaultFilters.grade,
      //status: initialParams.status || defaultFilters.status,
      search: (initialParams.search as string) || defaultFilters.search,
    };
  };

  const [filters, setFilters] = useState<CustomerFilter>(getInitialFilters);

  const queryParams = useMemo(() => {
    return {
      q: filters.search?.trim() || undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      // grade: filters.grade !== 'all' ? filters.grade : undefined,
      // dateFrom: filters.dateFrom || undefined,
      // dateTo: filters.dateTo || undefined,
      page: 1,
      pageSize: 50,
    };
  }, [filters]);

  const listQuery = useCustomerListQuery(queryParams);
  //const createMut = useCreateCustomerMutation();
  //const updateMut = useUpdateCustomerMutation();
  //const deleteMut = useDeleteCustomerMutation();

  //const _total = listQuery.data?.total ?? 0;

  const rows = listQuery.data?.items ?? [];
  const dataVersion = listQuery.dataUpdatedAt;


  const initialLoading = listQuery.isLoading;
  const refreshing = listQuery.isFetching && !listQuery.isLoading;

  /*
  const handleExport = () => alert('CSV 내보내기 기능 (미구현)');
  const handleImport = () => alert('CSV 가져오기 기능 (미구현)');

  const handleSave = async() => {
    console.log(pendingDiff)
  }

  const handleCreate = async () => {
    const name = window.prompt('고객 이름을 입력하세요');
    if (!name?.trim()) return;

    try {
      await createMut.mutateAsync({ name: name.trim(), status: 'ACTIVE' });
    } catch (e) {
      alert((e as Error).message);
    }
  };
  */
  /*

  const handleEdit = async (id: string, currentName: string) => {
    const nextName = window.prompt('새 고객 이름', currentName);
    if (!nextName?.trim() || nextName.trim() === currentName) return;

    try {
      await updateMut.mutateAsync({ id, input: { name: nextName.trim() } });
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = window.confirm(`정말 삭제할까요?\n- ${name}`);
    if (!ok) return;

    try {
      await deleteMut.mutateAsync(id);
    } catch (e) {
      alert((e as Error).message);
    }
  };
  */

  const handleRefetch = () => {
    listQuery.refetch();
  };

  const handleCommit = async (changes: readonly CrudChange<Customer>[]) => {
    // TODO: 서버 저장(create/update/delete) 호출로 교체
    console.log('commit changes', changes);
  };
  
  
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
            },
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

        {refreshing && (
          <div style={{ padding: 8, opacity: 0.8, fontSize: 12 }}>갱신 중...</div>
        )}
        
        {/* 에러 표시(간단) - 원하면 shared/ui/ErrorState로 승격 가능 */}
        {listQuery.isError && (
          <div style={{ padding: 12 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>데이터를 불러오지 못했습니다.</div>
            <div style={{ marginBottom: 8, opacity: 0.8 }}>
              {(listQuery.error as Error)?.message ?? 'Unknown error'}
            </div>
            <button type="button" onClick={handleRefetch}>
              다시 시도
            </button>
          </div>
        )}

        {/* 데이터 패널 (액션 바 + 테이블) */}
        <DataPanel>
          <CustomerTable 
            rows={rows}
            dataVersion={dataVersion}
            onDiffChange={setPendingDiff}
            onCommit={handleCommit}
            onRefetch={handleRefetch}
            loading={initialLoading} 
          />
        </DataPanel>
      </div>
    </div>
  );
}

export default CustomerInfoPage;
