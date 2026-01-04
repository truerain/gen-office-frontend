# TypeScript 캐시 오류 해결 가이드

## 문제 상황

```typescript
// App.tsx
const LazyComponent = getLazyComponent(menuItem?.componentName);
//                                              ^^^^^^^^^^^^
// ❌ Property 'componentName' does not exist on type 'MenuItem'.
// ❌ Did you mean 'component'?ts(2551)
```

하지만 실제 `menu.types.ts`를 확인하면:

```typescript
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  componentName?: string;  // ✅ 이미 정의되어 있음!
  children?: MenuItem[];
}
```

## 원인

**TypeScript 언어 서버의 캐시 문제**

- VSCode의 TypeScript 서버가 오래된 타입 정의를 캐시
- 파일을 수정했지만 서버가 업데이트되지 않음
- 특히 타입 정의 파일(`.d.ts`, `.types.ts`)에서 자주 발생

## 해결 방법

### 방법 1: TypeScript 서버 재시작 (가장 빠름) ✅

**단축키:**
1. VSCode에서 `Cmd + Shift + P` (Mac) 또는 `Ctrl + Shift + P` (Windows/Linux)
2. "TypeScript: Restart TS Server" 입력
3. Enter

**또는:**
1. VSCode 하단 상태바에서 "TypeScript" 클릭
2. "Restart TS Server" 선택

### 방법 2: VSCode 재시작

1. VSCode 완전히 종료
2. 다시 실행

### 방법 3: 프로젝트 전체 다시 로드

```bash
# 터미널에서 실행
cd apps/demo

# TypeScript 캐시 삭제
rm -rf node_modules/.cache
rm -rf .tsbuildinfo
rm -rf node_modules/.tmp

# 다시 설치
pnpm install
```

### 방법 4: 명시적 타입 지정 (임시 해결)

TypeScript 서버를 재시작할 수 없는 상황이라면:

```typescript
// App.tsx
import type { MenuItem } from '@/types/menu.types';

const handleOpenPage = (id: string, title: string, icon: React.ReactNode) => {
  const menuItem: MenuItem | undefined = findMenuItemById(id);
  
  // ✅ 명시적으로 타입을 지정하면 오류 해결
  const LazyComponent = getLazyComponent(menuItem?.componentName);
};
```

## 예방 방법

### 1. 파일 저장 시 자동 재시작

`.vscode/settings.json` 추가:

```json
{
  "typescript.tsserver.experimental.enableProjectDiagnostics": true,
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

### 2. Workspace 버전 사용

VSCode 하단 상태바에서:
- "TypeScript 5.x.x" 클릭
- "Use Workspace Version" 선택

### 3. 타입 체크 확인

```bash
# 터미널에서 직접 타입 체크
cd apps/demo
npx tsc --noEmit

# 오류가 없으면 VSCode의 캐시 문제
```

## 디버깅

### 1. 타입 정의 확인

```typescript
// App.tsx 상단에 임시로 추가
import type { MenuItem } from '@/types/menu.types';

// 타입 확인
const test: MenuItem = {
  id: 'test',
  label: 'test',
  icon: 'test',
  componentName: 'TestPage',  // ← 여기서 오류가 나는지 확인
};
```

### 2. Import 경로 확인

```typescript
// ❌ 잘못된 import (다른 타입일 수 있음)
import type { MenuItem } from '../../some/other/path';

// ✅ 올바른 import
import type { MenuItem } from '@/types/menu.types';
```

### 3. 타입 선언 중복 확인

```bash
# 프로젝트 내 MenuItem 타입이 여러 개 있는지 확인
grep -r "interface MenuItem" apps/demo/src
grep -r "type MenuItem" apps/demo/src
```

만약 여러 개가 발견되면 하나로 통일!

## 완전 해결 체크리스트

✅ **단계별 확인:**

1. [ ] `menu.types.ts`에 `componentName?: string;` 존재 확인
2. [ ] VSCode에서 TypeScript 서버 재시작
3. [ ] 여전히 오류 발생 시 VSCode 재시작
4. [ ] 터미널에서 `npx tsc --noEmit` 실행하여 실제 오류인지 확인
5. [ ] 다른 파일에 동일한 타입 이름이 있는지 확인
6. [ ] Import 경로가 올바른지 확인

## 실제 타입 정의

```typescript
// apps/demo/src/types/menu.types.ts
export interface MenuItem {
  /** 메뉴 고유 ID */
  id: string;
  
  /** 메뉴 표시 이름 */
  label: string;
  
  /** Lucide React 아이콘 이름 */
  icon: string;
  
  /** 동적으로 로드할 컴포넌트 이름 (선택적) */
  componentName?: string;  // ✅ 이것이 정의되어 있음!
  
  /** 하위 메뉴 (선택적) */
  children?: MenuItem[];
}
```

## 사용 예시

```typescript
// App.tsx
import { findMenuItemById } from '@/mocks/menuData';
import { getLazyComponent } from '@/config/componentRegistry.dynamic';

const handleOpenPage = (id: string, title: string, icon: React.ReactNode) => {
  const menuItem = findMenuItemById(id);
  
  // ✅ componentName 사용 가능
  const LazyComponent = getLazyComponent(menuItem?.componentName);
  
  const content = LazyComponent 
    ? <Suspense><LazyComponent /></Suspense>
    : <PlaceholderPage title={title} />;
};
```

## 결론

**대부분의 경우 TypeScript 서버 재시작으로 해결됩니다!**

1. `Cmd/Ctrl + Shift + P`
2. "TypeScript: Restart TS Server"
3. ✅ 해결!

**그래도 안 되면 VSCode를 재시작하세요!**

---

## 추가 팁

### VSCode 확장 프로그램

다음 확장 프로그램들이 TypeScript 개발에 도움이 됩니다:

- **TypeScript Hero**: Import 자동 정리
- **Pretty TypeScript Errors**: 오류 메시지를 읽기 쉽게 표시
- **Error Lens**: 오류를 인라인으로 표시

### 단축키 설정

`.vscode/keybindings.json`:

```json
[
  {
    "key": "cmd+shift+r",
    "command": "typescript.restartTsServer",
    "when": "editorLangId == typescript || editorLangId == typescriptreact"
  }
]
```

이제 `Cmd + Shift + R`로 빠르게 재시작 가능!
