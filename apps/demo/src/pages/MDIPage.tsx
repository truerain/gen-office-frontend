// apps/demo/src/pages/MDIPage.tsx
import { useState } from 'react';
import { MDIContainer, useMDIStore } from '@gen-office/mdi';
import { Button, Input, Select } from '@gen-office/primitives';
import { User, ShoppingCart, Package, Settings, FileText, BarChart } from 'lucide-react';
import '@gen-office/mdi/index.css';
import styles from './MDIPage.module.css';

// 샘플 컴포넌트들
const CustomerDetail = ({ id }: { id: string }) => {
  const [notes, setNotes] = useState('');
  
  return (
    <div className={styles.demoContent}>
      <h2>고객 상세 정보 #{id}</h2>
      <div className={styles.demoSection}>
        <h3>기본 정보</h3>
        <div className={styles.demoForm}>
          <label>
            고객명
            <Input placeholder="고객명을 입력하세요" />
          </label>
          <label>
            이메일
            <Input type="email" placeholder="email@example.com" />
          </label>
          <label>
            전화번호
            <Input placeholder="010-0000-0000" />
          </label>
        </div>
      </div>
      <div className={styles.demoSection}>
        <h3>메모</h3>
        <textarea
          className={styles.demoTextarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="고객 메모를 입력하세요..."
          rows={5}
        />
        <p className={styles.demoHint}>
          탭을 전환해도 입력한 내용이 유지됩니다!
        </p>
      </div>
    </div>
  );
};

const OrderList = ({ status }: { status: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className={styles.demoContent}>
      <h2>주문 목록 ({status})</h2>
      <div className={styles.demoSection}>
        <div className={styles.demoToolbar}>
          <Input
            placeholder="주문 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary">검색</Button>
        </div>
        <div className={styles.demoTable}>
          <table>
            <thead>
              <tr>
                <th>주문번호</th>
                <th>고객명</th>
                <th>금액</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  <td>ORD-{1000 + i}</td>
                  <td>고객 {i}</td>
                  <td>{(i * 50000).toLocaleString()}원</td>
                  <td><span className={styles.statusBadge}>{status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.demoHint}>
          검색어: {searchTerm || '(없음)'} - 상태가 유지됩니다!
        </p>
      </div>
    </div>
  );
};

const InventoryManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  
  return (
    <div className={styles.demoContent}>
      <h2>재고 관리</h2>
      <div className={styles.demoSection}>
        <label>
          카테고리
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <option value="전체">전체</option>
            <option value="전자제품">전자제품</option>
            <option value="의류">의류</option>
            <option value="식품">식품</option>
          </Select>
        </label>
        <div className={styles.demoStats}>
          <div className={styles.statCard}>
            <h4>총 재고</h4>
            <p className={styles.statValue}>1,234</p>
          </div>
          <div className={styles.statCard}>
            <h4>저재고 품목</h4>
            <p className={`${styles.statValue} ${styles.warning}`}>23</p>
          </div>
          <div className={styles.statCard}>
            <h4>품절 품목</h4>
            <p className={`${styles.statValue} ${styles.danger}`}>5</p>
          </div>
        </div>
        <p className={styles.demoHint}>
          선택된 카테고리: {selectedCategory}
        </p>
      </div>
    </div>
  );
};

const ReportViewer = ({ reportType }: { reportType: string }) => {
  return (
    <div className={styles.demoContent}>
      <h2>{reportType} 리포트</h2>
      <div className={styles.demoSection}>
        <div className={styles.demoChartPlaceholder}>
          📊 차트 영역
        </div>
        <p className={styles.demoHint}>
          여러 리포트 탭을 열어서 비교할 수 있습니다!
        </p>
      </div>
    </div>
  );
};

const SettingsPanel = () => {
  const [emailNotification, setEmailNotification] = useState(true);
  
  return (
    <div className={styles.demoContent}>
      <h2>설정</h2>
      <div className={styles.demoSection}>
        <h3>알림 설정</h3>
        <label className={styles.demoCheckbox}>
          <input
            type="checkbox"
            checked={emailNotification}
            onChange={(e) => setEmailNotification(e.target.checked)}
          />
          이메일 알림 받기
        </label>
        <p className={styles.demoHint}>
          설정 상태: {emailNotification ? '켜짐' : '꺼짐'}
        </p>
      </div>
    </div>
  );
};

// 메인 MDI 데모 페이지
export default function MDIPage() {
  const { tabs, maxTabs, tabPosition, setMaxTabs, setTabPosition } = useMDIStore();
  const addTab = useMDIStore(state => state.addTab);
  const [customMaxTabs, setCustomMaxTabs] = useState<string>('10');
  const [showMaxTabWarning, setShowMaxTabWarning] = useState(false);

  // 탭 추가 헬퍼 함수
  const openTab = (
    id: string,
    title: string,
    content: React.ReactNode,
    icon: React.ReactNode
  ) => {
    const success = addTab({
      id,
      title,
      content,
      icon,
      closable: true
    });
    
    if (!success) {
      setShowMaxTabWarning(true);
      setTimeout(() => setShowMaxTabWarning(false), 3000);
    }
  };

  // 샘플 탭 추가 함수들
  const openCustomerTab = (customerId: string) => {
    openTab(
      `customer-${customerId}`,
      `고객 ${customerId}`,
      <CustomerDetail id={customerId} />,
      <User size={16} />
    );
  };

  const openOrderTab = (status: string) => {
    openTab(
      `orders-${status}`,
      `주문 (${status})`,
      <OrderList status={status} />,
      <ShoppingCart size={16} />
    );
  };

  const openInventoryTab = () => {
    openTab(
      'inventory',
      '재고 관리',
      <InventoryManagement />,
      <Package size={16} />
    );
  };

  const openReportTab = (reportType: string) => {
    openTab(
      `report-${reportType}`,
      `${reportType} 리포트`,
      <ReportViewer reportType={reportType} />,
      <BarChart size={16} />
    );
  };

  const openSettingsTab = () => {
    openTab(
      'settings',
      '설정',
      <SettingsPanel />,
      <Settings size={16} />
    );
  };

  const handleMaxTabsChange = () => {
    const value = parseInt(customMaxTabs);
    if (!isNaN(value) && value > 0) {
      setMaxTabs(value);
    } else {
      setMaxTabs(undefined);
    }
  };

  return (
    <div className={styles.mdiDemoPage}>
      <div className={styles.demoHeader}>
        <h1>MDI (Multiple Document Interface) Demo</h1>
        <p>Tab 기반 멀티 문서 인터페이스를 테스트해보세요</p>
      </div>

      {/* 설정 패널 */}
      <div className={styles.demoControls}>
        <div className={styles.controlSection}>
          <h3>MDI 설정</h3>
          <div className={styles.controlGroup}>
            <label>
              탭 위치:
              <select
                value={tabPosition}
                onChange={(e) => setTabPosition(e.target.value as 'top' | 'bottom')}
              >
                <option value="top">상단 (Top)</option>
                <option value="bottom">하단 (Bottom)</option>
              </select>
            </label>
            <label>
              최대 탭 수:
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  type="number"
                  value={customMaxTabs}
                  onChange={(e) => setCustomMaxTabs(e.target.value)}
                  placeholder="10"
                  style={{ width: '80px' }}
                />
                <Button size="sm" onClick={handleMaxTabsChange}>
                  적용
                </Button>
              </div>
            </label>
          </div>
        </div>

        <div className={styles.controlSection}>
          <h3>탭 상태</h3>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>열린 탭:</span>
              <span className={styles.statValue}>{tabs.length}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>최대 탭:</span>
              <span className={styles.statValue}>{maxTabs ?? '무제한'}</span>
            </div>
          </div>
          {showMaxTabWarning && (
            <div className={styles.warningMessage}>
              ⚠️ 최대 탭 개수({maxTabs})에 도달했습니다!
            </div>
          )}
        </div>
      </div>

      {/* 탭 추가 버튼들 */}
      <div className={styles.demoActions}>
        <h3>샘플 탭 열기</h3>
        <div className={styles.actionButtons}>
          <Button onClick={() => openCustomerTab('001')} leftIcon={<User size={16} />}>
            고객 001
          </Button>
          <Button onClick={() => openCustomerTab('002')} leftIcon={<User size={16} />}>
            고객 002
          </Button>
          <Button onClick={() => openOrderTab('대기중')} leftIcon={<ShoppingCart size={16} />}>
            주문 (대기중)
          </Button>
          <Button onClick={() => openOrderTab('배송중')} leftIcon={<ShoppingCart size={16} />}>
            주문 (배송중)
          </Button>
          <Button onClick={() => openInventoryTab()} leftIcon={<Package size={16} />}>
            재고 관리
          </Button>
          <Button onClick={() => openReportTab('매출')} leftIcon={<BarChart size={16} />}>
            매출 리포트
          </Button>
          <Button onClick={() => openReportTab('재고')} leftIcon={<BarChart size={16} />}>
            재고 리포트
          </Button>
          <Button onClick={() => openSettingsTab()} leftIcon={<Settings size={16} />}>
            설정
          </Button>
        </div>
      </div>

      {/* MDI Container */}
      <div className={styles.mdiContainerWrapper}>
        <MDIContainer
          maxTabs={maxTabs}
          tabPosition={tabPosition}
          emptyContent={
            <div className={styles.emptyState}>
              <FileText size={64} />
              <h2>탭이 없습니다</h2>
              <p>위의 버튼을 클릭하여 새 탭을 열어보세요</p>
            </div>
          }
        />
      </div>

      {/* 사용 팁 */}
      <div className={styles.demoTips}>
        <h3>💡 사용 팁</h3>
        <ul>
          <li>탭을 클릭하여 전환할 수 있습니다</li>
          <li>각 탭의 X 버튼을 클릭하여 닫을 수 있습니다</li>
          <li>탭을 전환해도 각 탭의 상태(입력값, 스크롤 위치 등)가 유지됩니다</li>
          <li>최대 탭 수를 설정하면 그 이상 열 수 없습니다</li>
          <li>탭 위치를 상단/하단으로 변경할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}