// apps/demo/src/pages/customer/CustomerInfoPage/CustomerInfoPage.tsx
import { useCustomerList } from '../../../features/customer/hooks/useCustomerList';
import CustomerFilter from './components/CustomerFilter';
import CustomerActionBar from './components/CustomerActionBar';
import CustomerTable from './components/CustomerTable';
import styles from './CustomerInfoPage.module.css';

function CustomerInfoPage() {
  const {
    customers,
    loading,
    filters,
    setFilters,
    statistics,
    refetch,
  } = useCustomerList();

  const handleExport = () => {
    alert('CSV 내보내기 기능 (미구현)');
  };

  const handleImport = () => {
    alert('CSV 가져오기 기능 (미구현)');
  };

  const handleCreate = () => {
    alert('고객 추가 Dialog 열기 (미구현)');
  };

  return (
    <div className={styles.page}>
      {/* 페이지 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>고객정보</h1>
          <p className={styles.description}>
            고객 정보를 조회하고 관리할 수 있습니다.
          </p>
        </div>
        
        <div className={styles.headerStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>활성</span>
            <span className={styles.statValue}>{statistics.active}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>비활성</span>
            <span className={styles.statValue}>{statistics.inactive}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>대기중</span>
            <span className={styles.statValue}>{statistics.pending}</span>
          </div>
        </div>
      </div>

      {/* 검색 필터 */}
      <CustomerFilter filters={filters} onFilterChange={setFilters} />

      {/* 액션 바 */}
      <CustomerActionBar
        total={statistics.total}
        onRefresh={refetch}
        onExport={handleExport}
        onImport={handleImport}
        onCreate={handleCreate}
      />

      {/* 고객 테이블 */}
      <CustomerTable data={customers} loading={loading} />
    </div>
  );
}

export default CustomerInfoPage;