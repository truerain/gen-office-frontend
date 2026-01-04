// apps/demo/src/App.tsx
import { useEffect } from 'react';
import { MDIContainer, useMDIStore } from '@gen-office/mdi';
import { Home } from 'lucide-react';
import TitleBar from './components/TitleBar';
import HomePage from './pages/HomePage';
import PrimitivesPage from './pages/PrimitivesPage';
import DataGridPage from './pages/DataGridPage';
import MDIPage from './pages/MDIPage';
import CustomerInfoPage from './pages/customer/CustomerInfoPage';
import '@gen-office/mdi/index.css';
import styles from './App.module.css';

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
      // Home 탭이 이미 있으면 활성화
      setActiveTab('home');
    } else {
      // Home 탭이 없으면 새로 생성
      addTab({
        id: 'home',
        title: 'Home',
        content: <HomePage />,
        icon: <Home size={16} />,
        closable: false,
      });
    }
  };

  // 메뉴 클릭 핸들러
  const handleOpenPage = (id: string, title: string, icon: React.ReactNode) => {
    // 특정 페이지들은 실제 컴포넌트로 렌더링
    let content: React.ReactNode;

    switch (id) {
      case 'primitives':
        content = <PrimitivesPage />;
        break;
      case 'datagrid':
        content = <DataGridPage />;
        break;
      case 'mdi-demo':
        content = <MDIPage />;
        break;
     case 'customer-info':
        content = <CustomerInfoPage />;
        break;
      default:
        // 나머지는 플레이스홀더
        content = (
          <div style={{ padding: '2rem' }}>
            <h2>{title}</h2>
            <p>이 페이지는 아직 구현되지 않았습니다.</p>
          </div>
        );
    }

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
    </div>
  );
}

export default App;