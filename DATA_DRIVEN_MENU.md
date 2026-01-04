# 데이터 기반 메뉴 시스템 (Data-Driven Menu System)

## 개요

Gen-Office는 완전히 **데이터 기반** 메뉴 시스템을 사용합니다. 메뉴 구조, 아이콘, 컴포넌트 매핑이 모두 `menuData.ts` 파일에 정의되어 있어, 새로운 페이지를 추가할 때 **단 한 곳만 수정**하면 됩니다.

## 아키텍처

```
menuData.ts (단일 진실 공급원)
    ↓
    ├─→ TitleBar (메뉴 렌더링)
    ├─→ App.tsx (컴포넌트 매핑)
    └─→ iconMapper (아이콘 매핑)
```

## 주요 이점

### ✅ Before (하드코딩 방식)

새로운 페이지를 추가하려면 **3군데**를 수정해야 했습니다:

1. `menuData.ts` - 메뉴 아이템 추가
2. `App.tsx` - switch 문에 case 추가
3. `App.tsx` - import 문 추가

```typescript
// ❌ 하드코딩 방식
import CustomerInfoPage from './pages/customer/CustomerInfoPage';

const handleOpenPage = (id: string, title: string, icon: React.ReactNode) => {
  switch (id) {
    case 'customer-info':
      content = <CustomerInfoPage />;
      break;
    case 'customer-service':
      content = <CustomerServicePage />;
      break;
    // ... 계속 추가
  }
};
```

### ✅ After (데이터 기반 방식)

새로운 페이지를 추가하려면 **단 한 곳**만 수정:

1. `menuData.ts` - 메뉴 아이템 + 컴포넌트 매핑

```typescript
// ✅ 데이터 기반 방식
import CustomerInfoPage from '../pages/customer/CustomerInfoPage';

export const menuData: MenuData = {
  categories: [
    {
      id: 'customer',
      label: '고객관리',
      icon: 'Users',
      children: [
        {
          id: 'customer-info',
          label: '고객정보',
          icon: 'Users',
          component: CustomerInfoPage,  // ← 여기만 추가!
        },
      ],
    },
  ],
};
```

## 파일 구조

```
apps/demo/src/
├── types/
│   └── menu.types.ts           # MenuItem, MenuData 타입
├── mocks/
│   └── menuData.ts             # 메뉴 데이터 + 컴포넌트 매핑
├── utils/
│   └── iconMapper.tsx          # 아이콘 매핑
└── App.tsx                     # 데이터 기반 라우팅
```

## 타입 정의

```typescript
// apps/demo/src/types/menu.types.ts

export interface MenuItem {
  id: string;                       // 메뉴 ID
  label: string;                    // 메뉴 라벨
  icon: string;                     // Lucide 아이콘 이름
  component?: React.ComponentType;  // 페이지 컴포넌트 (선택)
  children?: MenuItem[];            // 하위 메뉴
}

export interface MenuData {
  categories: MenuItem[];           // 카테고리 목록
}
```

## 새 페이지 추가 방법

### 1단계: 페이지 컴포넌트 생성

```
apps/demo/src/pages/finance/PaymentProcessPage/
├── index.ts
├── PaymentProcessPage.tsx
├── PaymentProcessPage.module.css
└── components/
    ├── PaymentFilter.tsx
    ├── PaymentActionBar.tsx
    └── PaymentTable.tsx
```

### 2단계: menuData.ts에 추가

```typescript
// apps/demo/src/mocks/menuData.ts

// 1. Import 추가
import PaymentProcessPage from '../pages/finance/PaymentProcessPage';

// 2. 메뉴 데이터에 추가
{
  id: 'finance',
  label: '금융 및 결제',
  icon: 'CreditCard',
  children: [
    {
      id: 'payment-process',
      label: '결제처리',
      icon: 'CreditCard',
      component: PaymentProcessPage,  // ← 컴포넌트 매핑
    },
  ],
}
```

### 끝! 🎉

App.tsx는 자동으로:
1. 메뉴에서 `payment-process` 클릭
2. `findMenuItemById('payment-process')` 실행
3. `menuItem.component` 발견
4. `<PaymentProcessPage />` 렌더링

## 헬퍼 함수

### findMenuItemById

메뉴 ID로 MenuItem을 찾습니다.

```typescript
// apps/demo/src/mocks/menuData.ts

export const findMenuItemById = (id: string): MenuItem | undefined => {
  for (const category of menuData.categories) {
    if (category.children) {
      const found = category.children.find((item) => item.id === id);
      if (found) return found;
    }
  }
  return undefined;
};
```

**사용 예:**
```typescript
const menuItem = findMenuItemById('customer-info');
// → { id: 'customer-info', label: '고객정보', icon: 'Users', component: CustomerInfoPage }
```

## App.tsx 동작 방식

```typescript
// apps/demo/src/App.tsx

const handleOpenPage = (id: string, title: string, icon: React.ReactNode) => {
  // 1. 메뉴 데이터에서 아이템 찾기
  const menuItem = findMenuItemById(id);
  
  let content: React.ReactNode;

  // 2. 컴포넌트가 매핑되어 있으면 사용
  if (menuItem?.component) {
    const Component = menuItem.component;
    content = <Component />;
  } else {
    // 3. 없으면 플레이스홀더 표시
    content = <PlaceholderPage title={title} />;
  }

  // 4. MDI 탭으로 열기
  addTab({ id, title, content, icon, closable: true });
};
```

## 플레이스홀더 페이지

구현되지 않은 메뉴는 자동으로 플레이스홀더 페이지를 표시합니다.

```typescript
const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{ padding: '2rem' }}>
    <h2>{title}</h2>
    <p>이 페이지는 아직 구현되지 않았습니다.</p>
  </div>
);
```

## 장점 정리

### 🎯 단일 진실 공급원 (Single Source of Truth)
- 모든 메뉴 설정이 `menuData.ts`에 집중
- 중복 코드 제거
- 유지보수 용이

### 🚀 확장성
- 새 페이지 추가가 매우 간단
- switch 문 없이 무한대로 확장 가능
- 타입 안전성 보장

### 🔧 유연성
- 컴포넌트가 없어도 메뉴 표시 가능 (플레이스홀더)
- 동적으로 메뉴 활성화/비활성화 가능
- 권한 기반 메뉴 필터링 쉬움

### 📝 가독성
- App.tsx가 매우 깔끔
- 비즈니스 로직과 데이터 분리
- 코드 이해가 쉬움

## API에서 메뉴 불러오기 (확장)

나중에 서버에서 메뉴를 불러올 수도 있습니다:

```typescript
// menuData.ts를 동적으로 생성
const fetchMenuData = async () => {
  const response = await fetch('/api/menus');
  const menus = await response.json();
  
  return {
    categories: menus.map(menu => ({
      ...menu,
      component: componentRegistry[menu.componentName],
    })),
  };
};
```

## 결론

데이터 기반 메뉴 시스템으로:
- ✅ 코드 중복 제거
- ✅ 유지보수성 향상
- ✅ 확장성 극대화
- ✅ 타입 안전성 보장

새로운 페이지 추가 시 **menuData.ts 파일 하나만** 수정하면 됩니다! 🎉
