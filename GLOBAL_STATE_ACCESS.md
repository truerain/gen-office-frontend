# 동적 로드 페이지에서 전역 상태 접근하기

## 질문

**Q: 동적으로 로드된 Page 컴포넌트가 App의 전역 상태에 접근할 수 있나요?**

**A: 네, 완벽하게 접근 가능합니다!** ✅

## 동작 원리

### 1. 전역 상태는 JavaScript 모듈 시스템을 통해 공유됩니다

```typescript
// store/appStore.ts - 전역 상태 정의
export const useAppStore = create<AppState>((set) => ({
  user: { id: '001', name: '김철수', ... },
  theme: 'light',
  toggleTheme: () => set(...),
}));
```

### 2. 동적 로드 여부와 무관하게 같은 모듈을 import

```typescript
// CustomerInfoPage.tsx (동적 로드됨)
import { useAppStore } from '../../../store/appStore';  // ✅ 같은 인스턴스

function CustomerInfoPage() {
  const user = useAppStore((state) => state.user);  // ✅ 접근 가능!
  const addNotification = useAppStore((state) => state.addNotification);
  
  return <div>안녕하세요, {user?.name}님!</div>;
}
```

### 3. React.lazy()는 컴포넌트만 지연 로드

```typescript
// App.tsx
const LazyComponent = getLazyComponent('CustomerInfoPage');

// 이렇게 로드되지만...
<Suspense fallback={<Loading />}>
  <LazyComponent />  {/* 지연 로드 */}
</Suspense>

// 내부에서 import한 모듈은 모두 공유됨
// CustomerInfoPage가 import한 useAppStore는
// App.tsx가 import한 useAppStore와 동일한 인스턴스!
```

## 실제 구현 예시

### 1. 전역 상태 정의 (Zustand)

```typescript
// apps/demo/src/store/appStore.ts
import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Array<Notification>;
  
  setUser: (user: User) => void;
  toggleTheme: () => void;
  addNotification: (message: string, type: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: { id: '001', name: '김철수', email: 'kim@example.com', role: 'admin' },
  theme: 'light',
  notifications: [],
  
  setUser: (user) => set({ user }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  addNotification: (message, type) => set((state) => ({
    notifications: [...state.notifications, { id: Date.now().toString(), message, type }]
  })),
}));
```

### 2. App에서 전역 상태 사용

```typescript
// apps/demo/src/App.tsx
import { useAppStore } from './store/appStore';

function App() {
  const notifications = useAppStore((state) => state.notifications);
  const removeNotification = useAppStore((state) => state.removeNotification);
  
  return (
    <div>
      {/* 알림 표시 */}
      {notifications.map(n => (
        <div key={n.id}>{n.message}</div>
      ))}
      
      {/* 동적 로드된 페이지 */}
      <Suspense>
        <LazyCustomerInfoPage />
      </Suspense>
    </div>
  );
}
```

### 3. 동적 로드 페이지에서 전역 상태 사용

```typescript
// apps/demo/src/pages/customer/CustomerInfoPage/CustomerInfoPage.tsx
import { useAppStore } from '../../../store/appStore';

function CustomerInfoPage() {
  // ✅ 전역 상태 접근 - 완벽하게 작동!
  const user = useAppStore((state) => state.user);
  const addNotification = useAppStore((state) => state.addNotification);
  
  const handleExport = () => {
    // ✅ 전역 상태 업데이트 - 완벽하게 작동!
    addNotification('CSV 내보내기 시작', 'info');
  };
  
  return (
    <div>
      <h1>고객정보</h1>
      <p>접속자: {user?.name} ({user?.role})</p>
      <button onClick={handleExport}>내보내기</button>
    </div>
  );
}
```

### 4. 전역 알림 시스템

```typescript
// App.tsx에서 알림 컴포넌트
const Notifications = () => {
  const notifications = useAppStore((state) => state.notifications);
  const removeNotification = useAppStore((state) => state.removeNotification);
  
  return (
    <div className="notifications">
      {notifications.map((n) => (
        <div key={n.id} onClick={() => removeNotification(n.id)}>
          {n.message}
        </div>
      ))}
    </div>
  );
};

// CustomerInfoPage에서 알림 추가
const handleAction = () => {
  addNotification('작업 완료!', 'success');  // ✅ App의 알림에 표시됨!
};
```

## 데모 페이지

**Demo → Global State** 메뉴에서 확인할 수 있습니다.

```typescript
// GlobalStateDemo.tsx
import { useAppStore } from '../store/appStore';

function GlobalStateDemo() {
  const user = useAppStore((state) => state.user);
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const addNotification = useAppStore((state) => state.addNotification);
  
  return (
    <div>
      <h1>전역 상태 접근 테스트</h1>
      
      {/* 사용자 정보 표시 */}
      <div>
        <h2>현재 사용자</h2>
        <p>이름: {user?.name}</p>
        <p>이메일: {user?.email}</p>
        <p>역할: {user?.role}</p>
      </div>
      
      {/* 테마 토글 */}
      <div>
        <h2>테마: {theme}</h2>
        <button onClick={toggleTheme}>테마 변경</button>
      </div>
      
      {/* 알림 테스트 */}
      <div>
        <button onClick={() => addNotification('Info!', 'info')}>
          Info 알림
        </button>
        <button onClick={() => addNotification('Success!', 'success')}>
          Success 알림
        </button>
        <button onClick={() => addNotification('Error!', 'error')}>
          Error 알림
        </button>
      </div>
    </div>
  );
}
```

## 왜 작동하는가?

### JavaScript 모듈 시스템

```
┌─────────────────────────────────────┐
│   store/appStore.ts                 │
│   (Zustand Store Instance)          │
│   ↑                                  │
│   │ import                           │
│   ├──────────┬──────────────────┐   │
│   │          │                  │   │
│  App.tsx  CustomerInfoPage  Other   │
│   (정적)     (동적 로드)      Pages  │
└─────────────────────────────────────┘
```

**핵심:**
1. `store/appStore.ts`는 **싱글톤**
2. 모든 컴포넌트가 **같은 인스턴스**를 import
3. 동적 로드 여부는 **언제 로드되는가**만 결정
4. **어떤 모듈을 참조하는가**는 변하지 않음

### Vite/Webpack의 Code Splitting

```javascript
// 빌드 결과
main.js                    // App + appStore
customer-info.chunk.js     // CustomerInfoPage (appStore 제외)
                          // ↑ appStore는 main.js 참조
```

- `appStore`는 main.js에 포함
- `CustomerInfoPage`는 별도 청크로 분리
- 하지만 `CustomerInfoPage`는 main.js의 `appStore`를 참조
- **같은 인스턴스 공유!**

## 다른 상태 관리 라이브러리도 동일

### Redux

```typescript
// store.ts
export const store = configureStore({ ... });

// App.tsx
<Provider store={store}>
  <App />
</Provider>

// CustomerInfoPage.tsx (동적 로드)
const dispatch = useDispatch();  // ✅ 같은 store
const user = useSelector(state => state.user);  // ✅ 작동
```

### Context API

```typescript
// App.tsx
const AppContext = createContext(null);

<AppContext.Provider value={globalState}>
  <Suspense>
    <LazyCustomerInfoPage />
  </Suspense>
</AppContext.Provider>

// CustomerInfoPage.tsx (동적 로드)
const globalState = useContext(AppContext);  // ✅ 작동
```

### Jotai / Recoil

```typescript
// atoms.ts
export const userAtom = atom({ ... });

// CustomerInfoPage.tsx (동적 로드)
const user = useAtom(userAtom);  // ✅ 작동
```

## 주의사항

### ❌ 작동하지 않는 경우

**1. Provider 바깥에서 사용**
```typescript
// ❌ Provider 밖
<Suspense>
  <LazyPage />
</Suspense>
<Provider>  {/* 늦음! */}
  ...
</Provider>

// ✅ Provider 안
<Provider>
  <Suspense>
    <LazyPage />
  </Suspense>
</Provider>
```

**2. 다른 번들로 분리된 경우**
```javascript
// Micro Frontend에서 별도 앱
// App A의 store와 App B의 store는 다른 인스턴스
```

## 정리

| 항목 | 가능 여부 |
|------|----------|
| 전역 상태 읽기 | ✅ 가능 |
| 전역 상태 쓰기 | ✅ 가능 |
| Context 사용 | ✅ 가능 |
| Redux 사용 | ✅ 가능 |
| Zustand 사용 | ✅ 가능 |
| Jotai/Recoil 사용 | ✅ 가능 |
| Props 전달 | ✅ 가능 |
| Event 발생 | ✅ 가능 |

**결론: 동적 로드는 단순히 "언제 로드되는가"만 결정합니다. 로드된 후에는 일반 컴포넌트와 완전히 동일하게 작동합니다!** 🎉

## 테스트 방법

1. 앱 실행: `pnpm demo`
2. 상단 메뉴: **Demo → Global State** 클릭
3. 전역 상태 테스트:
   - 사용자 정보 확인 ✅
   - 테마 토글 ✅
   - 알림 추가 (우측 상단에 표시) ✅
4. **Demo → 고객정보** 클릭
   - 사용자 이름 표시 확인 ✅
   - 내보내기 버튼 클릭 → 알림 확인 ✅
