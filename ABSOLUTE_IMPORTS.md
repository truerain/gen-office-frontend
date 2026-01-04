# 절대 경로 Import 가이드

## 설정 완료!

Gen-Office에서 절대 경로를 사용할 수 있도록 설정되었습니다.

## 사용 가능한 경로 별칭

```typescript
@/*              → src/*
@/components/*   → src/components/*
@/pages/*        → src/pages/*
@/store/*        → src/store/*
@/config/*       → src/config/*
@/utils/*        → src/utils/*
@/types/*        → src/types/*
@/mocks/*        → src/mocks/*
@/features/*     → src/features/*
@/styles/*       → src/styles/*
@/assets/*       → src/assets/*
```

## Before & After

### Before (상대 경로)

```typescript
// 😫 복잡하고 가독성이 떨어짐
import { useAppStore } from '../../../store/appStore';
import { useCustomerList } from '../../../features/customer/hooks/useCustomerList';
import CustomerFilter from './components/CustomerFilter';
```

### After (절대 경로)

```typescript
// 🎉 간결하고 명확함
import { useAppStore } from '@/store/appStore';
import { useCustomerList } from '@/features/customer/hooks/useCustomerList';
import CustomerFilter from './components/CustomerFilter';  // 같은 디렉토리는 상대 경로 유지
```

## 사용 예시

### 1. 전역 상태

```typescript
// ✅ 어디서든 동일한 경로
import { useAppStore } from '@/store/appStore';
```

### 2. 공통 컴포넌트

```typescript
// ✅ components 폴더
import { Button } from '@/components/Button';
import TitleBar from '@/components/TitleBar';
```

### 3. 페이지 컴포넌트

```typescript
// ✅ pages 폴더
import HomePage from '@/pages/HomePage';
import CustomerInfoPage from '@/pages/customer/CustomerInfoPage';
```

### 4. 설정 파일

```typescript
// ✅ config 폴더
import { getLazyComponent } from '@/config/componentRegistry.dynamic';
```

### 5. 타입 정의

```typescript
// ✅ types 폴더
import type { MenuItem } from '@/types/menu.types';
```

### 6. 유틸리티

```typescript
// ✅ utils 폴더
import { formatDate } from '@/utils/format/date';
import { iconMapper } from '@/utils/iconMapper';
```

### 7. Mock 데이터

```typescript
// ✅ mocks 폴더
import { menuData } from '@/mocks/menuData';
```

### 8. Features (도메인별 기능)

```typescript
// ✅ features 폴더
import { useCustomerList } from '@/features/customer/hooks/useCustomerList';
import type { Customer } from '@/features/customer/types/customer.types';
```

### 9. 스타일

```typescript
// ✅ styles 폴더
import '@/styles/index.css';
```

### 10. Assets (이미지, 폰트 등)

```typescript
// ✅ assets 폴더
import logo from '@/assets/lg_logo.svg';
```

## 권장 사항

### ✅ 절대 경로 사용 (추천)

```typescript
// 다른 폴더의 파일
import { useAppStore } from '@/store/appStore';
import HomePage from '@/pages/HomePage';
import { Button } from '@/components/Button';
```

### ✅ 상대 경로 사용 (추천)

```typescript
// 같은 폴더 또는 하위 폴더
import CustomerFilter from './components/CustomerFilter';
import styles from './CustomerInfoPage.module.css';
import { Customer } from './types';
```

### ❌ 피해야 할 패턴

```typescript
// ❌ 같은 폴더인데 절대 경로 사용
import CustomerFilter from '@/pages/customer/CustomerInfoPage/components/CustomerFilter';

// ✅ 상대 경로로 사용
import CustomerFilter from './components/CustomerFilter';
```

## 실제 적용 예시

### CustomerInfoPage.tsx

```typescript
// apps/demo/src/pages/customer/CustomerInfoPage/CustomerInfoPage.tsx

// ✅ 절대 경로 - 다른 폴더의 파일
import { useCustomerList } from '@/features/customer/hooks/useCustomerList';
import { useAppStore } from '@/store/appStore';

// ✅ 상대 경로 - 같은 폴더의 컴포넌트
import CustomerFilter from './components/CustomerFilter';
import CustomerActionBar from './components/CustomerActionBar';
import CustomerTable from './components/CustomerTable';
import styles from './CustomerInfoPage.module.css';

function CustomerInfoPage() {
  const user = useAppStore((state) => state.user);
  const { customers, loading } = useCustomerList();
  
  return (
    <div className={styles.page}>
      <h1>안녕하세요, {user?.name}님!</h1>
      <CustomerFilter />
      <CustomerTable data={customers} loading={loading} />
    </div>
  );
}
```

### App.tsx

```typescript
// apps/demo/src/App.tsx

// ✅ 절대 경로
import TitleBar from '@/components/TitleBar';
import HomePage from '@/pages/HomePage';
import { findMenuItemById } from '@/mocks/menuData';
import { getLazyComponent } from '@/config/componentRegistry.dynamic';
import { useAppStore } from '@/store/appStore';

// ✅ 상대 경로 - 같은 폴더
import styles from './App.module.css';

function App() {
  const notifications = useAppStore((state) => state.notifications);
  
  return (
    <div className={styles.app}>
      <TitleBar />
      {/* ... */}
    </div>
  );
}
```

## 설정 파일

### 1. tsconfig.app.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/pages/*": ["src/pages/*"],
      "@/store/*": ["src/store/*"],
      "@/config/*": ["src/config/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/mocks/*": ["src/mocks/*"],
      "@/features/*": ["src/features/*"],
      "@/styles/*": ["src/styles/*"],
      "@/assets/*": ["src/assets/*"]
    }
  }
}
```

### 2. vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@/store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@/config': fileURLToPath(new URL('./src/config', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@/types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@/mocks': fileURLToPath(new URL('./src/mocks', import.meta.url)),
      '@/features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@/styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@/assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
  },
})
```

**참고:** ESM 환경에서는 `import path from 'path'` 대신 `fileURLToPath` + `import.meta.url`을 사용합니다.

## 장점

### 1. 가독성 향상

```typescript
// ❌ Before: 경로가 복잡함
import { useAppStore } from '../../../store/appStore';

// ✅ After: 명확하고 간결
import { useAppStore } from '@/store/appStore';
```

### 2. 리팩토링 안전성

```typescript
// 파일을 이동해도 절대 경로는 변경 불필요
// pages/A/Component.tsx → pages/B/C/Component.tsx

// ✅ 여전히 동일
import { useAppStore } from '@/store/appStore';
```

### 3. 자동완성 지원

```typescript
// VSCode에서 '@/' 입력 시 자동완성
import { useAppStore } from '@/sto... // ← 자동완성
```

### 4. 일관성

```typescript
// 모든 파일에서 동일한 경로
import { useAppStore } from '@/store/appStore';
```

## VSCode 설정 (선택사항)

### jsconfig.json 또는 tsconfig.json

이미 설정되어 있으므로 VSCode에서 자동완성이 작동합니다!

### Import 자동 정렬

```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

## 주의사항

### 1. CSS Modules는 상대 경로 사용

```typescript
// ✅ CSS Modules는 상대 경로
import styles from './Component.module.css';

// ❌ 절대 경로 사용 X
import styles from '@/pages/Component.module.css';
```

### 2. 같은 폴더는 상대 경로 권장

```typescript
// ✅ 같은 폴더 내 파일
import CustomerFilter from './components/CustomerFilter';

// ❌ 불필요하게 긴 절대 경로
import CustomerFilter from '@/pages/customer/CustomerInfoPage/components/CustomerFilter';
```

### 3. 동적 import도 사용 가능

```typescript
// ✅ 동적 import에서도 절대 경로 사용
const componentPaths = {
  'CustomerInfoPage': () => import('@/pages/customer/CustomerInfoPage'),
  'HomePage': () => import('@/pages/HomePage'),
};
```

## 마이그레이션 가이드

기존 프로젝트를 절대 경로로 변경하려면:

```bash
# 1. 모든 '../../../store/appStore' 를 '@/store/appStore' 로 변경
# VSCode의 Find & Replace 기능 사용

# 2. 패턴별로 일괄 변경
# 예: '../../../store/' → '@/store/'
#     '../../config/' → '@/config/'
```

## 테스트

```bash
# 개발 서버 실행
pnpm demo

# 빌드 테스트
pnpm build:demo

# TypeScript 타입 체크
pnpm type-check
```

모든 import가 정상적으로 작동하는지 확인하세요!

## 결론

✅ 절대 경로 설정 완료!
✅ TypeScript 자동완성 지원
✅ Vite 빌드 지원
✅ 가독성 및 유지보수성 향상

**이제 `@/` prefix로 간편하게 import 하세요!** 🎉
