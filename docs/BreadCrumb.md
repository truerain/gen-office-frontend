# Breadcrumb 컴포넌트 가이드

## 개요

`Breadcrumb`는 사용자의 현재 위치를 계층 구조로 표시하는 네비게이션 컴포넌트입니다.

## 위치

```
packages/ui/src/core/Breadcrumb/
```

## 특징

- ✅ href 또는 onClick 지원
- ✅ 아이콘 지원
- ✅ 커스텀 구분자
- ✅ maxItems로 긴 경로 축약
- ✅ 3가지 크기 (sm, md, lg)
- ✅ 완전한 TypeScript 지원
- ✅ 접근성 (aria-label)

## 설치

```typescript
import { Breadcrumb } from '@gen-office/ui';
```

## 기본 사용법

### 1. 기본 Breadcrumb

```typescript
import { Breadcrumb } from '@gen-office/ui';

function MyPage() {
  return (
    <Breadcrumb
      items={[
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Electronics', href: '/products/electronics' },
        { label: 'Laptop' },
      ]}
    />
  );
}
```

**결과:** `Home / Products / Electronics / Laptop`

### 2. 아이콘 포함

```typescript
import { Breadcrumb } from '@gen-office/ui';
import { Home, Folder, FileText } from 'lucide-react';

<Breadcrumb
  items={[
    { label: 'Home', icon: <Home size={16} />, href: '/' },
    { label: 'Documents', icon: <Folder size={16} />, href: '/documents' },
    { label: 'Report.pdf', icon: <FileText size={16} /> },
  ]}
/>
```

### 3. onClick 핸들러

```typescript
<Breadcrumb
  items={[
    { 
      label: 'Home', 
      onClick: () => navigate('/') 
    },
    { 
      label: 'Settings', 
      onClick: () => navigate('/settings') 
    },
    { 
      label: 'Profile' 
    },
  ]}
/>
```

### 4. 커스텀 구분자

```typescript
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Post' },
  ]}
  separator="›"  // 또는 separator={<span>→</span>}
/>
```

**결과:** `Home › Blog › Post`

### 5. 긴 경로 축약 (maxItems)

```typescript
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Level 1', href: '/level1' },
    { label: 'Level 2', href: '/level1/level2' },
    { label: 'Level 3', href: '/level1/level2/level3' },
    { label: 'Level 4', href: '/level1/level2/level3/level4' },
    { label: 'Current Page' },
  ]}
  maxItems={3}
/>
```

**결과:** `Home / ... / Current Page`

**maxItems={5} 결과:** `Home / ... / Level 3 / Level 4 / Current Page`

### 6. 크기 조절

```typescript
// Small
<Breadcrumb items={items} size="sm" />

// Medium (기본)
<Breadcrumb items={items} size="md" />

// Large
<Breadcrumb items={items} size="lg" />
```

## Props

### BreadcrumbProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | **필수** | Breadcrumb 아이템 배열 |
| `separator` | `ReactNode` | `<ChevronRight />` | 구분자 |
| `maxItems` | `number` | `undefined` | 최대 표시 아이템 수 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 크기 |
| `className` | `string` | `undefined` | 커스텀 className |

### BreadcrumbItem

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | ✅ | 표시할 텍스트 |
| `href` | `string` | ❌ | 링크 경로 |
| `onClick` | `() => void` | ❌ | 클릭 핸들러 |
| `icon` | `ReactNode` | ❌ | 아이콘 |
| `disabled` | `boolean` | ❌ | 비활성화 여부 |

## 실전 예제

### 1. React Router 통합

```typescript
import { useNavigate, useLocation } from 'react-router-dom';
import { Breadcrumb } from '@gen-office/ui';
import { Home } from 'lucide-react';

function DynamicBreadcrumb() {
  const navigate = useNavigate();
  const location = useLocation();

  // 경로를 breadcrumb items로 변환
  const pathnames = location.pathname.split('/').filter(x => x);
  
  const items = [
    { 
      label: 'Home', 
      icon: <Home size={16} />,
      onClick: () => navigate('/') 
    },
    ...pathnames.map((name, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      
      return {
        label: name.charAt(0).toUpperCase() + name.slice(1),
        onClick: isLast ? undefined : () => navigate(path),
      };
    }),
  ];

  return <Breadcrumb items={items} />;
}
```

### 2. 파일 탐색기 스타일

```typescript
import { Breadcrumb } from '@gen-office/ui';
import { Home, Folder, FileText } from 'lucide-react';

function FileExplorer({ path }: { path: string[] }) {
  const handleNavigate = (index: number) => {
    // 해당 경로로 이동
    const newPath = path.slice(0, index + 1);
    navigateToPath(newPath);
  };

  const items = [
    { 
      label: 'Root', 
      icon: <Home size={16} />,
      onClick: () => handleNavigate(-1)
    },
    ...path.map((folder, index) => ({
      label: folder,
      icon: index === path.length - 1 
        ? <FileText size={16} /> 
        : <Folder size={16} />,
      onClick: index === path.length - 1 
        ? undefined 
        : () => handleNavigate(index),
    })),
  ];

  return <Breadcrumb items={items} maxItems={5} />;
}
```

### 3. 관리자 페이지

```typescript
import { Breadcrumb } from '@gen-office/ui';
import { Home, Settings, Users, User } from 'lucide-react';

function UserDetailPage({ userId }: { userId: string }) {
  return (
    <div>
      <Breadcrumb
        items={[
          { 
            label: 'Dashboard', 
            icon: <Home size={16} />,
            href: '/admin' 
          },
          { 
            label: 'Settings', 
            icon: <Settings size={16} />,
            href: '/admin/settings' 
          },
          { 
            label: 'Users', 
            icon: <Users size={16} />,
            href: '/admin/settings/users' 
          },
          { 
            label: `User ${userId}`, 
            icon: <User size={16} /> 
          },
        ]}
        size="sm"
      />
      
      {/* 페이지 내용 */}
    </div>
  );
}
```

### 4. 페이지 헤더에 통합

```typescript
import { Breadcrumb } from '@gen-office/ui';

function PageHeader({ breadcrumbItems, title, actions }) {
  return (
    <div className="page-header">
      <Breadcrumb items={breadcrumbItems} size="sm" />
      
      <div className="header-main">
        <h1>{title}</h1>
        <div className="actions">{actions}</div>
      </div>
    </div>
  );
}

// 사용
<PageHeader
  breadcrumbItems={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Electronics' },
  ]}
  title="전자제품"
  actions={<Button>필터</Button>}
/>
```

## 스타일 커스터마이징

### CSS 변수

```css
.breadcrumb {
  --breadcrumb-color: var(--color-text-secondary);
  --breadcrumb-hover-color: var(--color-text);
  --breadcrumb-current-color: var(--color-text);
  --breadcrumb-separator-color: var(--color-text-tertiary);
}
```

### 커스텀 클래스

```typescript
<Breadcrumb
  items={items}
  className="my-custom-breadcrumb"
/>
```

```css
.my-custom-breadcrumb {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}
```

## 접근성

Breadcrumb 컴포넌트는 웹 접근성 기준을 준수합니다:

- ✅ `<nav aria-label="Breadcrumb">` 사용
- ✅ `<ol>` 리스트 사용
- ✅ 구분자에 `aria-hidden="true"` 적용
- ✅ 마지막 아이템은 클릭 불가 (현재 위치)
- ✅ 키보드 네비게이션 지원

## 모바일 대응

작은 화면에서 자동으로 축약:

```css
@media (max-width: 640px) {
  .item {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
```

또는 maxItems 사용 권장:

```typescript
<Breadcrumb
  items={items}
  maxItems={3}  // 모바일에서는 3개만 표시
/>
```

## 주의사항

### 1. href vs onClick

둘 다 제공하면 onClick이 우선됩니다:

```typescript
{
  label: 'Home',
  href: '/',
  onClick: () => navigate('/')  // onClick 실행, href는 preventDefault
}
```

### 2. 마지막 아이템

마지막 아이템은 자동으로 비활성화됩니다 (현재 페이지):

```typescript
// 마지막 아이템에 href/onClick을 제공해도 클릭 불가
{ label: 'Current Page', href: '/current' }  // 클릭 안됨
```

### 3. maxItems 동작

```typescript
// items.length = 6, maxItems = 3
[Home, L1, L2, L3, L4, Current]
↓
[Home, ..., Current]

// items.length = 6, maxItems = 5
[Home, L1, L2, L3, L4, Current]
↓
[Home, ..., L3, L4, Current]
```

## TypeScript

완전한 타입 지원:

```typescript
import type { BreadcrumbItem, BreadcrumbProps } from '@gen-office/ui';

const items: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products' },
];

const props: BreadcrumbProps = {
  items,
  size: 'md',
  maxItems: 5,
};
```

## 관련 컴포넌트

- **Button**: 네비게이션 버튼
- **DropdownMenu**: 드롭다운 메뉴
- **Badge**: 상태 표시

## 예제 모음

### Storybook

Storybook에서 더 많은 예제를 확인하세요:

```bash
pnpm run storybook
```

- Basic
- WithIcons
- WithOnClick
- CustomSeparator
- MaxItems
- Sizes
- LongPath
- DarkMode

## 결론

Breadcrumb 컴포넌트는:
- ✅ 사용자 위치 명확하게 표시
- ✅ 빠른 네비게이션 제공
- ✅ 계층 구조 시각화
- ✅ 접근성 준수
- ✅ 유연한 커스터마이징

**직관적인 네비게이션을 위한 필수 컴포넌트입니다!** 🧭