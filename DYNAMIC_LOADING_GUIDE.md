# 완전한 동적 컴포넌트 로딩 가이드

## 문제: ComponentRegistry의 한계

### 현재 방식 (ComponentRegistry)
```typescript
// ❌ 여전히 모든 컴포넌트를 미리 등록해야 함
const componentPaths = {
  'CustomerInfoPage': () => import('../pages/customer/CustomerInfoPage'),
  'PaymentProcessPage': () => import('../pages/finance/PaymentProcessPage'),
  // ... 계속 추가
};
```

**한계점:**
- 새 페이지 추가 시 코드 수정 필요
- Frontend 재배포 필요
- 완전한 "동적"이 아님

---

## 해법 1: 동적 import (Code Splitting) ⭐

**장점:**
- 필요한 페이지만 로드 (초기 번들 크기 감소)
- Vite/Webpack이 자동으로 Code Splitting
- 구현이 간단

**단점:**
- 여전히 componentPaths에 등록 필요
- 새 페이지는 재배포 필요

### 구현

```typescript
// config/componentRegistry.dynamic.ts
const componentPaths = {
  'CustomerInfoPage': () => import('../pages/customer/CustomerInfoPage'),
};

export const getLazyComponent = (name) => {
  const loader = componentPaths[name];
  return lazy(loader);
};

// App.tsx
const LazyComponent = getLazyComponent('CustomerInfoPage');
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

**번들 결과:**
```
main.js           100 KB  (항상 로드)
customer-info.js  50 KB   (필요할 때만 로드)
payment.js        30 KB   (필요할 때만 로드)
```

---

## 해법 2: 규칙 기반 동적 Import ⭐⭐

**더 동적인 접근:**
DB의 componentName을 파일 경로로 직접 매핑

```typescript
// config/componentRegistry.convention.ts
export const getLazyComponent = (componentName?: string) => {
  if (!componentName) return undefined;
  
  // 규칙: componentName에서 도메인과 페이지명 추출
  // 예: 'CustomerInfoPage' → 'customer/CustomerInfoPage'
  
  const domain = componentName
    .replace(/Page$/, '')
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .substring(1)
    .split('-')[0];
  
  // 동적 import
  return lazy(() => 
    import(`../pages/${domain}/${componentName}`)
      .catch(() => {
        console.error(`Component not found: ${componentName}`);
        return { default: PlaceholderPage };
      })
  );
};
```

**사용:**
```sql
-- DB에만 추가하면 끝!
INSERT INTO menus VALUES (
  'new-feature',
  'customer',
  '신규 기능',
  'Star',
  'CustomerNewFeaturePage',  -- 파일만 만들면 자동 로드
  1,
  true
);
```

**파일 구조 규칙:**
```
pages/
  customer/
    CustomerInfoPage/
    CustomerServicePage/
    CustomerNewFeaturePage/  ← 이거만 만들면 됨!
  finance/
    PaymentProcessPage/
```

**장점:**
- componentRegistry 수정 불필요!
- 파일만 만들면 자동으로 로드
- 진정한 "동적" 로딩

**단점:**
- 파일 경로 규칙을 엄격히 지켜야 함
- Vite의 동적 import 제약 (완전한 변수 경로는 불가)

---

## 해법 3: Micro Frontend (완전한 동적) ⭐⭐⭐

**완전히 독립적인 앱을 런타임에 로드**

### 3-1. Module Federation (Webpack 5+)

```javascript
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        customerApp: 'customerApp@http://localhost:3001/remoteEntry.js',
        financeApp: 'financeApp@http://localhost:3002/remoteEntry.js',
      },
    }),
  ],
};

// 런타임에 로드
const CustomerInfoPage = lazy(() => import('customerApp/CustomerInfoPage'));
```

**DB:**
```sql
INSERT INTO menus VALUES (
  'customer-info',
  'customer',
  '고객정보',
  'Users',
  'customerApp/CustomerInfoPage',  -- Remote App의 컴포넌트
  'http://localhost:3001/remoteEntry.js',  -- Remote URL
  1,
  true
);
```

### 3-2. Web Components

```typescript
// 완전히 독립적인 컴포넌트
class CustomerInfoPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<h1>고객정보</h1>';
  }
}
customElements.define('customer-info-page', CustomerInfoPage);

// 런타임에 로드
const script = document.createElement('script');
script.src = 'https://cdn.example.com/customer-info-page.js';
document.head.appendChild(script);

// React에서 사용
<customer-info-page />
```

### 3-3. iframe (가장 간단)

```typescript
// DB
{
  componentName: null,
  iframeUrl: 'https://customer-app.example.com/info'
}

// App.tsx
if (menuItem.iframeUrl) {
  content = <iframe src={menuItem.iframeUrl} />;
}
```

---

## 해법 4: 서버 사이드 렌더링 (SSR/RSC)

**Next.js App Router + React Server Components**

```typescript
// app/[pageId]/page.tsx
export default async function DynamicPage({ params }) {
  const pageId = params.pageId;
  
  // DB에서 페이지 정보 조회
  const pageData = await db.pages.findById(pageId);
  
  // 동적으로 컴포넌트 import
  const Component = await import(`@/pages/${pageData.componentPath}`);
  
  return <Component.default />;
}
```

---

## 비교표

| 방식 | 동적 수준 | 구현 난이도 | 초기 로딩 | 재배포 필요? |
|------|----------|------------|----------|------------|
| Static Registry | ⭐ | 쉬움 | 무거움 | ✅ Yes |
| Dynamic Import (Code Splitting) | ⭐⭐ | 쉬움 | 가벼움 | ✅ Yes |
| Convention-based | ⭐⭐⭐ | 보통 | 가벼움 | ⚠️ 파일만 |
| Module Federation | ⭐⭐⭐⭐ | 어려움 | 가벼움 | ❌ No |
| Web Components | ⭐⭐⭐⭐ | 보통 | 가벼움 | ❌ No |
| iframe | ⭐⭐⭐⭐⭐ | 매우 쉬움 | 가벼움 | ❌ No |
| SSR/RSC | ⭐⭐⭐⭐⭐ | 어려움 | 서버 사이드 | ❌ No |

---

## 추천 방식

### 단계별 마이그레이션

**1단계: 현재 → Dynamic Import (즉시 적용 가능)**
```typescript
// ✅ 지금 바로 적용
const LazyComponent = getLazyComponent('CustomerInfoPage');
<Suspense><LazyComponent /></Suspense>
```

**2단계: Convention-based (중기)**
```typescript
// ✅ 파일 경로 규칙만 정하면 자동 로드
const LazyComponent = lazy(() => import(`../pages/${domain}/${name}`));
```

**3단계: Module Federation (장기)**
```typescript
// ✅ 완전히 독립적인 앱으로 분리
import('customerApp/CustomerInfoPage')
```

---

## Gen-Office 추천: 하이브리드 접근

```typescript
// config/componentLoader.ts
export const loadComponent = async (menuItem) => {
  // 1. iframe 우선 (완전 동적)
  if (menuItem.iframeUrl) {
    return () => <iframe src={menuItem.iframeUrl} />;
  }
  
  // 2. Remote Module (Micro Frontend)
  if (menuItem.remoteUrl) {
    const remote = await loadRemoteModule(menuItem.remoteUrl);
    return remote[menuItem.componentName];
  }
  
  // 3. Local Component (Code Splitting)
  if (menuItem.componentName) {
    return getLazyComponent(menuItem.componentName);
  }
  
  // 4. Placeholder
  return PlaceholderPage;
};
```

**DB 스키마:**
```sql
ALTER TABLE menus ADD COLUMN iframe_url VARCHAR(500);
ALTER TABLE menus ADD COLUMN remote_url VARCHAR(500);
ALTER TABLE menus ADD COLUMN remote_scope VARCHAR(100);
```

---

## 결론

**현재 상황:**
- ✅ DB에 메뉴 데이터 저장 가능
- ⚠️ ComponentRegistry에 등록 필요 (재배포 필요)

**완전한 동적 로딩 달성:**
1. **단기**: Dynamic Import로 Code Splitting
2. **중기**: Convention-based 자동 로딩
3. **장기**: Module Federation 또는 iframe

**가장 현실적인 해법:**
- Dynamic Import (Code Splitting) + Convention-based
- 90%는 자동 로드, 10%는 특수 케이스만 수동 등록
