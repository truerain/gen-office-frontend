// apps/demo/src/App.tsx
import { useEffect, Suspense, useState, useMemo, lazy, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MDIContainer, useMDIStore } from '@gen-office/mdi';
import { Drawer } from '@gen-office/ui';
import { useTheme } from '@gen-office/theme';
import { Home, AlertCircle, Code, FileQuestion } from 'lucide-react';
import { LeftPanelLayout, TitleBarLayout } from '@/layouts';
import { buildSystemMenuData } from '@/app/menu/menuData';
import { getLazyComponent } from '@/app/config/componentRegistry.dynamic';
import { useAppStore } from '@/app/store/appStore';
import { PageProvider } from '@/contexts';
import { onI18nRemoteFailed } from '@/i18n';
import { setAuthExpiredHandler, setCsrfTokenProvider } from '@/shared/api/http';
import { ensureCsrf, getMe, logout } from '@/shared/api/auth';
import LoadingPage from '@/shared/ui/loading/LoadingPage';
import LoginPage from '@/pages/auth/LoginPage';
import '@gen-office/mdi/index.css';
import styles from './App.module.css';
import { useAppMenuListQuery } from './menu/api/appMenu';

const LAZY_DELAY_MS = 0;
const withLazyDelay = <T,>(loader: () => Promise<T>) =>
  new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      loader().then(resolve).catch(reject);
    }, LAZY_DELAY_MS);
  });

const LazyHomePage = lazy(() => withLazyDelay(() => import('@/pages/home/HomePage')));

function readCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&')}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function readCsrfToken() {
  if (typeof document === 'undefined') return null;
  const meta =
    document.querySelector('meta[name="csrf-token"]') ||
    document.querySelector('meta[name="x-csrf-token"]');
  const content = meta?.getAttribute('content');
  if (content) return content;
  return readCookie('XSRF-TOKEN');
}

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
          className={styles.notification}
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
  const addNotification = useAppStore((state) => state.addNotification);
  const resetSession = useAppStore((state) => state.resetSession);
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const { t } = useTranslation('common');

  const { data: menuList = [], isSuccess: isMenuListSuccess, dataUpdatedAt: menuDataUpdatedAt } =
    useAppMenuListQuery({ enabled: !!user });
  const systemMenuData = useMemo(() => buildSystemMenuData(menuList), [menuList]);
  const menuItems = systemMenuData.items;
  const menuTree = systemMenuData.tree;
  const hasLoggedMenuSnapshotRef = useRef(false);

  // Theme 연동
  const { setMode } = useTheme();
  const appTheme = useAppStore((state) => state.theme);
  const layoutMode = useAppStore((state) => state.layoutMode);

  // appStore의 theme이 변경되면 실제 테마 적용
  useEffect(() => {
    setMode(appTheme);
  }, [appTheme, setMode]);

  useEffect(
    () =>
      onI18nRemoteFailed(() => {
        addNotification(t('i18n.remote_failed'), 'error');
      }),
    [addNotification, t]
  );

  useEffect(() => {
    setCsrfTokenProvider(readCsrfToken);
    setAuthExpiredHandler(() => {
      const currentUser = useAppStore.getState().user;
      resetSession();
      if (currentUser) {
        addNotification('세션이 만료되었습니다. 다시 로그인해 주세요.', 'error');
      }
    });
    ensureCsrf().catch(() => {
      // ignore; login flow will retry
    });
    return () => setAuthExpiredHandler(null);
  }, [addNotification, resetSession]);

  useEffect(() => {
    if (!isMenuListSuccess) return;
    if (hasLoggedMenuSnapshotRef.current) return;

    hasLoggedMenuSnapshotRef.current = true;
    console.group('[AppMenu] first load snapshot');
    console.log('raw menuList (API result):', menuList);
    console.log('mapped menuItems (for rendering):', menuItems);
    console.log('menuTree (for layout):', menuTree);
    console.log('breadcrumbById (precomputed):', systemMenuData.breadcrumbById);
    console.log('dataUpdatedAt:', menuDataUpdatedAt);
    console.groupEnd();
  }, [isMenuListSuccess, menuList, menuItems, menuTree, systemMenuData.breadcrumbById, menuDataUpdatedAt]);

  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let active = true;
    if (user) {
      setBootstrapping(false);
      return () => {
        active = false;
      };
    }

    (async () => {
      try {
        const result = await getMe();
        if (!active) return;
        if (result?.user) setUser(result.user);
      } catch {
        // ignore; login flow will handle unauthenticated
      } finally {
        if (active) setBootstrapping(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, setUser]);

  // Drawer 상태
  const [notFoundDrawerOpen, setNotFoundDrawerOpen] = useState(false);
  const [notFoundMenuInfo, setNotFoundMenuInfo] = useState<{
    menuId: string;
    title: string;
  } | null>(null);

  // 초기 Home 탭 자동 열기
  useEffect(() => {
    if (tabs.length === 0) {
      addTab({
        id: 'home',
        title: 'Home',
        content: (
          <Suspense fallback={<LoadingPage />}>
            <LazyHomePage />
          </Suspense>
        ),
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
        content: (
          <Suspense fallback={<LoadingPage />}>
            <LazyHomePage />
          </Suspense>
        ),
        icon: <Home size={16} />,
        closable: false,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore logout API error and clear local session
    } finally {
      resetSession();
    }
  };

  // 메뉴 클릭 핸들러 - Drawer로 미구현 알림
  const handleOpenPage = (
    menuId: string,
    title: string,
    icon: React.ReactNode,
    params?: Record<string, unknown>
  ) => {
    // 1. 메뉴 데이터에서 아이템 찾기
    const menuItem = systemMenuData.byId.get(menuId);
    // 2. componentName으로 Lazy 컴포넌트 가져오기
    const LazyComponent = getLazyComponent(menuItem?.componentName);

    // 3. 컴포넌트가 없으면 Drawer 표시
    if (!LazyComponent) {
      setNotFoundMenuInfo({ menuId, title });
      setNotFoundDrawerOpen(true);
      return;
    }

    // 4. 컴포넌트가 있으면 탭으로 열기
    // PageProvider로 감싸서 menuId를 Context로 제공
    const content = (
      <PageProvider menuId={menuId}>
        <Suspense fallback={<LoadingPage />}>
          <LazyComponent menuId={menuId} initialParams={params} />
        </Suspense>
      </PageProvider>
    );

    addTab({
      id: menuId,
      title,
      content,
      icon,
      closable: true,
    });
  };

  if (bootstrapping) {
    return <LoadingPage />;
  }

  return !user ? (
    <LoginPage />
  ) : (
    <div className={styles.app} data-layout={layoutMode}>
      {layoutMode === 'left-panel' ? (
        <LeftPanelLayout
          onOpenPage={handleOpenPage}
          onOpenHome={handleOpenHome}
          onLogout={handleLogout}
          menuTree={menuTree}
        >
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
        </LeftPanelLayout>
      ) : (
        <TitleBarLayout
          onOpenPage={handleOpenPage}
          onOpenHome={handleOpenHome}
          onLogout={handleLogout}
          menuTree={menuTree}
        >
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
        </TitleBarLayout>
      )}

      {/* 알림 (전역) */}
      <Notifications />

      {/* 미구현 메뉴 Drawer */}
      <Drawer
        open={notFoundDrawerOpen}
        onOpenChange={setNotFoundDrawerOpen}
        title="컴포넌트를 찾을 수 없습니다"
        description="선택하신 메뉴는 아직 구현되지 않았습니다."
        side="right"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 아이콘 영역 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: 'var(--color-background)',
            borderRadius: 'var(--border-radius-lg)'
          }}>
            <FileQuestion size={64} strokeWidth={1.5} color="var(--color-text-secondary)" />
          </div>

          {/* 정보 영역 */}
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--color-background)',
            borderRadius: 'var(--border-radius-md)',
            borderLeft: '4px solid var(--color-status-warning)'
          }}>
            <h3 style={{
              margin: '0 0 0.5rem 0',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-semibold)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={20} color="var(--color-status-warning)" />
              선택한 메뉴
            </h3>
            <p style={{
              margin: 0,
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text)'
            }}>
              {notFoundMenuInfo?.title}
            </p>
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'monospace'
            }}>
              Menu ID: {notFoundMenuInfo?.menuId}
            </p>
          </div>

          {/* 안내 메시지 */}
          <div>
            <h4 style={{
              margin: '0 0 0.75rem 0',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-semibold)'
            }}>
              이 메뉴를 구현하려면:
            </h4>
            <ol style={{
              margin: 0,
              paddingLeft: '1.5rem',
              fontSize: 'var(--font-size-sm)',
              lineHeight: '1.8',
              color: 'var(--color-text-secondary)'
            }}>
              <li>페이지 컴포넌트를 생성합니다</li>
              <li><code style={{
                backgroundColor: 'var(--color-background)',
                padding: '0.125rem 0.375rem',
                borderRadius: 'var(--border-radius-sm)',
                fontFamily: 'monospace',
                fontSize: '0.875em'
              }}>componentRegistry.dynamic.ts</code>에 등록합니다</li>
              <li>메뉴 데이터의 <code style={{
                backgroundColor: 'var(--color-background)',
                padding: '0.125rem 0.375rem',
                borderRadius: 'var(--border-radius-sm)',
                fontFamily: 'monospace',
                fontSize: '0.875em'
              }}>componentName</code>을 설정합니다</li>
            </ol>
          </div>

          {/* 코드 예시 */}
          <div>
            <h4 style={{
              margin: '0 0 0.5rem 0',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-semibold)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Code size={18} />
              예시 코드
            </h4>
            <pre style={{
              margin: 0,
              padding: '1rem',
              backgroundColor: 'var(--color-background)',
              borderRadius: 'var(--border-radius-md)',
              overflow: 'auto',
              fontSize: 'var(--font-size-sm)',
              lineHeight: '1.6'
            }}>
            </pre>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default App;
