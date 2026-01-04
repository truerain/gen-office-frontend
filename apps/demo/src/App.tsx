// apps/demo/src/App.tsx
import { useEffect, Suspense } from 'react';
import { MDIContainer, useMDIStore } from '@gen-office/mdi';
import { Home } from 'lucide-react';
import TitleBar from './components/TitleBar';
import HomePage from './pages/HomePage';
import { findMenuItemById } from './features/system/mocks/menuData';
import { getLazyComponent } from './config/componentRegistry.dynamic';
import { useAppStore } from './store/appStore';
import '@gen-office/mdi/index.css';
import styles from './App.module.css';

// 플레이스홀더 컴포넌트
const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{ padding: '2rem' }}>
    <h2>{title}</h2>
    <p>이 페이지는 아직 구현되지 않았습니다.</p>
  </div>
);

// 로딩 컴포넌트
const LoadingPage = () => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '400px',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #e0e0e0',
      borderTopColor: '#a50034',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ color: '#666' }}>페이지를 불러오는 중...</p>
  </div>
);

// 알림 컴포넌트
const Notifications = () => {
  const notifications = useAppStore((state) => state.notifications);
  const removeNotification = useAppStore((state) => state.removeNotification);

  useEffect(() => {
    // 3초 후 자동 제거
    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 3000);
      return () => clearTimeout(timer);
    });
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className={styles.notifications}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${styles.notification} ${styles[notification.type]}`}
          onClick={() => removeNotification(notification.id)}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

function App() {
  const addTab = useMDIStore((state) => state.addTab);
  const setActiveTab = useMDIStore((state) => state.setActiveTab);
  const tabs = useMDIStore((state) => state.tabs);

  // 초기 Home 탭 자동 열기
  useEffect(() => {
    if (tabs.length === 0) {
      addTab({
        id: 'home',
        title: 'Home',
        content: <HomePage />,
        icon: <Home size={16} />,
        closable: false,
      });
    }
  }, []);

  // Home 탭 열기 또는 활성화
  const handleOpenHome = () => {
    const homeTab = tabs.find(tab => tab.id === 'home');
    
    if (homeTab) {
      setActiveTab('home');
    } else {
      addTab({
        id: 'home',
        title: 'Home',
        content: <HomePage />,
        icon: <Home size={16} />,
        closable: false,
      });
    }
  };

  // 메뉴 클릭 핸들러 - 완전한 동적 로딩! ✅
  const handleOpenPage = (id: string, title: string, icon: React.ReactNode) => {
    // 1. 메뉴 데이터에서 아이템 찾기 (DB에서 가져온 데이터)
    const menuItem = findMenuItemById(id);
    
    // 2. componentName으로 Lazy 컴포넌트 가져오기 (동적 import)
    const LazyComponent = getLazyComponent(menuItem?.componentName);
    
    // 3. 컴포넌트 렌더링 (Suspense로 감싸기)
    const content = LazyComponent 
      ? (
          <Suspense fallback={<LoadingPage />}>
            <LazyComponent />
          </Suspense>
        )
      : <PlaceholderPage title={title} />;

    // 4. MDI 탭으로 열기
    addTab({
      id,
      title,
      content,
      icon,
      closable: true,
    });
  };

  return (
    <div className={styles.app}>
      {/* Title Bar */}
      <TitleBar 
        onOpenPage={handleOpenPage}
        onOpenHome={handleOpenHome}
      />

      {/* MDI Container */}
      <main className={styles.main}>
        <MDIContainer
          tabPosition="bottom"
          maxTabs={10}
          emptyContent={
            <div className={styles.emptyState}>
              <Home size={64} />
              <h2>Welcome to Gen-Office</h2>
              <p>상단 메뉴에서 원하는 기능을 선택하세요</p>
            </div>
          }
        />
      </main>

      {/* 알림 (전역) */}
      <Notifications />
    </div>
  );
}

export default App;