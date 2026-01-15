// apps/demo/src/pages/GlobalStateDemo.tsx
import { useAppStore } from '@/app/store/appStore';

function GlobalStateDemo() {
  const user = useAppStore((state) => state.user);
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const addNotification = useAppStore((state) => state.addNotification);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>전역 상태 접근 테스트</h1>
      <p>이 페이지는 동적으로 로드되었지만 App의 전역 상태에 접근할 수 있습니다!</p>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>현재 사용자 정보 (전역 상태)</h2>
        {user && (
          <div>
            <p><strong>이름:</strong> {user.name}</p>
            <p><strong>이메일:</strong> {user.email}</p>
            <p><strong>역할:</strong> {user.role}</p>
            <p><strong>ID:</strong> {user.id}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>테마 (전역 상태)</h2>
        <p>현재 테마: <strong>{theme}</strong></p>
        <button 
          onClick={toggleTheme}
          style={{ 
            padding: '0.5rem 1rem', 
            marginTop: '0.5rem',
            cursor: 'pointer',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          테마 토글 (준비중)
        </button>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h2>알림 시스템 (전역 상태)</h2>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            onClick={() => addNotification('Info 알림입니다!', 'info')}
            style={{ 
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #2196f3',
              background: '#e3f2fd',
              color: '#1565c0'
            }}
          >
            Info 알림
          </button>
          <button 
            onClick={() => addNotification('성공했습니다!', 'success')}
            style={{ 
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #4caf50',
              background: '#e8f5e9',
              color: '#2e7d32'
            }}
          >
            Success 알림
          </button>
          <button 
            onClick={() => addNotification('오류가 발생했습니다!', 'error')}
            style={{ 
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #f44336',
              background: '#ffebee',
              color: '#c62828'
            }}
          >
            Error 알림
          </button>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px' }}>
        <h3>✅ 결론</h3>
        <p>동적으로 로드된 페이지 컴포넌트도 <code>useAppStore()</code>를 통해 전역 상태에 완벽하게 접근할 수 있습니다!</p>
        <ul>
          <li>사용자 정보 읽기 ✅</li>
          <li>테마 읽기/변경 ✅</li>
          <li>알림 추가 ✅</li>
          <li>다른 모든 전역 상태 접근 가능 ✅</li>
        </ul>
      </div>
    </div>
  );
}

export default GlobalStateDemo;
